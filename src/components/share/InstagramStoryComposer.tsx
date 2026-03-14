import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image as RNImage, StyleSheet, View} from 'react-native';
import RNFS from 'react-native-fs';
import Svg, {Defs, Image as SvgImage, LinearGradient, Rect, Stop, Text as SvgText, TSpan} from 'react-native-svg';

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const OVERLAY_BRAND_FONT_SIZE = 58;
const OVERLAY_BRAND_Y = STORY_HEIGHT - 132;
const OVERLAY_BRAND_LOGO_SIZE = 60;
const OVERLAY_BRAND_GAP = 18;

type StoryComposeMode = 'background' | 'overlay';
type StoryComposeLayout = 'badge' | 'blog_card' | 'home_media_card' | 'home_video_card' | 'blog_detail_card';

export type InstagramStoryComposeOptions = {
    mode?: StoryComposeMode;
    layout?: StoryComposeLayout;
};

export type InstagramStoryComposeRequest = {
    id: string;
    imageUri?: string | null;
    title?: string | null;
    subtitle?: string | null;
    appName?: string | null;
    mode: StoryComposeMode;
    layout: StoryComposeLayout;
};

type ComposerProps = {
    request: InstagramStoryComposeRequest | null;
    onComplete: (tmpFileUri: string) => void;
    onError: (error: Error) => void;
};

const StorySvgImage = SvgImage as unknown as React.ComponentType<any>;

function estimateTextWidth(text: string, fontSize: number) {
    return Array.from(text).reduce((total, char) => {
        if (char === ' ') {
            return total + fontSize * 0.34;
        }
        if (/[ilI1'`.,:;|]/.test(char)) {
            return total + fontSize * 0.28;
        }
        if (/[mwMW@#%&]/.test(char)) {
            return total + fontSize * 0.92;
        }
        if (/[A-Z]/.test(char)) {
            return total + fontSize * 0.68;
        }
        return total + fontSize * 0.56;
    }, 0);
}

function splitWordToFit(word: string, maxWidth: number, fontSize: number) {
    const chunks: string[] = [];
    let current = '';
    for (const char of Array.from(word)) {
        const candidate = `${current}${char}`;
        if (current && estimateTextWidth(candidate, fontSize) > maxWidth) {
            chunks.push(current);
            current = char;
            continue;
        }
        current = candidate;
    }
    if (current) {
        chunks.push(current);
    }
    return chunks;
}

function normalizeText(text?: string | null) {
    return String(text ?? '')
        .replace(/\s+/g, ' ')
        .trim();
}

function stripDateText(text: string) {
    let output = normalizeText(text);
    if (!output) {
        return '';
    }

    const datePatterns = [
        /\b\d{4}-\d{2}-\d{2}\b/gi,
        /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/gi,
        /\b(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\.?\s+\d{1,2}(?:,\s*\d{4})?\b/gi,
        /\b\d{1,2}\s+(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\.?(?:\s+\d{4})?\b/gi,
    ];

    for (const pattern of datePatterns) {
        output = output.replace(pattern, '');
    }

    return output
        .replace(/\s*[-|,•]\s*/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function trimLineToWidth(text: string, maxWidth: number, fontSize: number) {
    const normalized = normalizeText(text);
    if (!normalized) {
        return '';
    }
    if (estimateTextWidth(normalized, fontSize) <= maxWidth) {
        return normalized;
    }

    let value = normalized;
    while (value.length > 1 && estimateTextWidth(`${value}...`, fontSize) > maxWidth) {
        value = value.slice(0, -1).trimEnd();
    }
    return `${value.replace(/[.,;:!?-]+$/, '').trimEnd()}...`;
}

function wrapTextLines(text: string, maxWidth: number, fontSize: number, maxLines?: number) {
    const trimmed = stripDateText(text);
    if (!trimmed) {
        return [];
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (!words.length) {
        return [];
    }

    const lines: string[] = [];
    let current = '';

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (estimateTextWidth(candidate, fontSize) <= maxWidth) {
            current = candidate;
            continue;
        }

        if (current) {
            lines.push(current);
            current = '';
        }

        if (estimateTextWidth(word, fontSize) > maxWidth) {
            const chunks = splitWordToFit(word, maxWidth, fontSize);
            lines.push(...chunks);
            continue;
        }
        current = word;
    }

    if (current) {
        lines.push(current);
    }

    if (!maxLines || lines.length <= maxLines) {
        return lines;
    }

    const clamped = lines.slice(0, maxLines);
    clamped[maxLines - 1] = trimLineToWidth(lines.slice(maxLines - 1).join(' '), maxWidth, fontSize);
    return clamped;
}

function dedupeSubtitle(title?: string | null, subtitle?: string | null) {
    const safeTitle = normalizeText(title).toLowerCase();
    const safeSubtitle = normalizeText(subtitle);
    if (!safeSubtitle) {
        return '';
    }
    if (safeTitle && safeTitle === safeSubtitle.toLowerCase()) {
        return '';
    }
    return safeSubtitle;
}

async function writeBase64Png(base64: string, requestId: string) {
    const safeId = String(requestId || `${Date.now()}`).replace(/[^a-z0-9_-]/gi, '');
    const path = `${RNFS.CachesDirectoryPath}/instagram-story-${safeId}.png`;
    await RNFS.writeFile(path, base64, 'base64');
    return `file://${path}`;
}

const InstagramStoryComposer = ({request, onComplete, onError}: ComposerProps) => {
    const svgRef = useRef<Svg | null>(null);
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);
    const [backgroundFailed, setBackgroundFailed] = useState(false);
    const capturedRequestIdRef = useRef<string | null>(null);

    useEffect(() => {
        capturedRequestIdRef.current = null;
        setBackgroundFailed(false);
        setBackgroundLoaded(Boolean(!request?.imageUri || request?.mode === 'overlay'));
    }, [request?.id, request?.imageUri, request?.mode]);

    const canvas = useMemo(
        () =>
            request?.mode === 'overlay'
                ? {width: STORY_WIDTH, height: STORY_HEIGHT}
                : {width: STORY_WIDTH, height: STORY_HEIGHT},
        [request?.mode],
    );
    const appName = normalizeText(request?.appName || 'SpotMe') || 'SpotMe';
    const brandLogoUri = useMemo(
        () => RNImage.resolveAssetSource(
            require('../../../android/app/src/main/res/drawable-nodpi/spotme_mark.png'),
        ).uri,
        [],
    );
    const titleText = normalizeText(request?.title);
    const subtitleText = dedupeSubtitle(request?.title, request?.subtitle);

    const titleLines = useMemo(() => {
        if (request?.layout !== 'blog_card') {
            return [];
        }
        return wrapTextLines(titleText, 960 - 96, 58, 2);
    }, [request?.layout, titleText]);

    const subtitleLines = useMemo(() => {
        if (request?.layout !== 'blog_card') {
            return [];
        }
        return wrapTextLines(subtitleText, 960 - 96, 36, 3);
    }, [request?.layout, subtitleText]);
    const hasSubtitle = subtitleLines.length > 0;
    const homeTitleLines = useMemo(() => {
        if (request?.layout !== 'home_media_card') {
            return [];
        }
        return wrapTextLines(titleText, 960 - 140, 44, 2);
    }, [request?.layout, titleText]);
    const homeSubtitleLines = useMemo(() => {
        if (request?.layout !== 'home_media_card') {
            return [];
        }
        return wrapTextLines(subtitleText, 960 - 180, 24, 1);
    }, [request?.layout, subtitleText]);
    const blogDetailTitleLines = useMemo(() => {
        if (request?.layout !== 'blog_detail_card') {
            return [];
        }
        return wrapTextLines(titleText, STORY_WIDTH - 248, 34, 2);
    }, [request?.layout, titleText]);
    const blogDetailSubtitleLines = useMemo(() => {
        if (request?.layout !== 'blog_detail_card') {
            return [];
        }
        return wrapTextLines(subtitleText, STORY_WIDTH - 264, 22, 3);
    }, [request?.layout, subtitleText]);
    const exportStoryImage = useCallback(async () => {
        if (!request || !svgRef.current) {
            return;
        }
        if (capturedRequestIdRef.current === request.id) {
            return;
        }

        capturedRequestIdRef.current = request.id;

        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Instagram Story composition timed out.'));
                }, 5000);

                svgRef.current?.toDataURL((value: string) => {
                    clearTimeout(timeout);
                    if (!value) {
                        reject(new Error('Could not compose Instagram Story image.'));
                        return;
                    }
                    resolve(value);
                }, {width: canvas.width, height: canvas.height});
            });

            const fileUri = await writeBase64Png(base64, request.id);
            onComplete(fileUri);
        } catch (error: any) {
            capturedRequestIdRef.current = null;
            onError(error instanceof Error ? error : new Error(String(error ?? 'Instagram Story composition failed')));
        }
    }, [canvas.height, canvas.width, onComplete, onError, request]);

    useEffect(() => {
        if (!request || !backgroundLoaded) {
            return;
        }

        const timer = setTimeout(() => {
            exportStoryImage().catch((error) => {
                onError(error instanceof Error ? error : new Error(String(error ?? 'Instagram Story composition failed')));
            });
        }, 90);

        return () => clearTimeout(timer);
    }, [backgroundLoaded, exportStoryImage, onError, request]);

    if (!request) {
        return null;
    }

    const isOverlay = request.mode === 'overlay';
    const isBlogCard = request.layout === 'blog_card';
    const isHomeMediaCard = request.layout === 'home_media_card';
    const isHomeVideoCard = request.layout === 'home_video_card';
    const isBlogDetailCard = request.layout === 'blog_detail_card';
    const cardHeight = hasSubtitle ? 420 : 270;
    const cardX = 60;
    const cardY = STORY_HEIGHT - cardHeight - 88;
    const cardWidth = STORY_WIDTH - 120;
    const cardInnerX = cardX + 48;
    const cardInnerY = cardY + 54;
    const overlayTextWidth = estimateTextWidth(appName, OVERLAY_BRAND_FONT_SIZE);
    const overlayBrandWidth = overlayTextWidth + OVERLAY_BRAND_GAP + OVERLAY_BRAND_LOGO_SIZE;
    const overlayBrandStartX = (STORY_WIDTH - overlayBrandWidth) / 2;
    const overlayLogoY = OVERLAY_BRAND_Y - OVERLAY_BRAND_LOGO_SIZE + 8;
    const homeBrandPillWidth = Math.max(264, estimateTextWidth(appName, 42) + 178);
    const homeBrandPillHeight = 96;
    const homeBrandPillX = 46;
    const homeBrandPillY = 48 + homeBrandPillHeight;
    const homeBrandIconSize = 58;
    const homeBrandIconX = homeBrandPillX + 22;
    const homeBrandIconY = homeBrandPillY + (homeBrandPillHeight - homeBrandIconSize) / 2;
    const homeBrandTextX = homeBrandIconX + homeBrandIconSize + 18;
    const homeBrandTextY = homeBrandPillY + 61;
    const homeVideoBrandPillX = 46;
    const homeVideoBrandPillY = 48;
    const homeVideoBrandIconX = homeVideoBrandPillX + 22;
    const homeVideoBrandIconY = homeVideoBrandPillY + (homeBrandPillHeight - homeBrandIconSize) / 2;
    const homeVideoBrandTextX = homeVideoBrandIconX + homeBrandIconSize + 18;
    const homeVideoBrandTextY = homeVideoBrandPillY + 61;
    const homeTitleFontSize = 44;
    const homeTitleLineHeight = 50;
    const homeSubtitleFontSize = 24;
    const homeSubtitleLineHeight = 32;
    const homeCardTopPadding = 68;
    const homeCardBottomPadding = 30;
    const homeSubtitleGap = homeSubtitleLines.length > 0 ? 18 : 0;
    const homeButtonGap = 22;
    const homeButtonHeight = 78;
    const homeTitleBlockHeight = homeTitleLines.length > 0 ? homeTitleFontSize + (homeTitleLines.length - 1) * homeTitleLineHeight : 0;
    const homeSubtitleBlockHeight = homeSubtitleLines.length > 0 ? homeSubtitleFontSize + (homeSubtitleLines.length - 1) * homeSubtitleLineHeight : 0;
    const homeCardHeight = homeCardTopPadding + homeTitleBlockHeight + homeSubtitleGap + homeSubtitleBlockHeight + homeButtonGap + homeButtonHeight + homeCardBottomPadding;
    const homeCardWidth = STORY_WIDTH - 104;
    const homeCardX = 52;
    const homeCardY = STORY_HEIGHT - homeCardHeight - 92;
    const homeCardCenterX = STORY_WIDTH / 2;
    const homeTitleStartY = homeCardY + homeCardTopPadding;
    const homeSubtitleStartY = homeTitleStartY + homeTitleBlockHeight + homeSubtitleGap;
    const homeButtonLabel = `Get your race photos on ${appName}`;
    const homeButtonWidth = Math.min(homeCardWidth - 140, Math.max(500, estimateTextWidth(homeButtonLabel, 30) + 128));
    const homeButtonX = (STORY_WIDTH - homeButtonWidth) / 2;
    const homeButtonY = homeSubtitleLines.length > 0
        ? homeSubtitleStartY + homeSubtitleBlockHeight + homeButtonGap
        : homeTitleStartY + homeTitleBlockHeight + homeButtonGap;
    const homeVideoCardX = 4;
    const homeVideoCardWidth = STORY_WIDTH - 8;
    const homeVideoCardHeight = 370;
    const homeVideoCardY = STORY_HEIGHT - homeVideoCardHeight - 92;
    const blogDetailBadgeWidth = Math.max(228, estimateTextWidth(appName, 34) + 144);
    const blogDetailBadgeHeight = 78;
    const blogDetailBadgeX = 46;
    const blogDetailBadgeY = 36;
    const blogDetailBadgeIconSize = 46;
    const blogDetailBadgeIconX = blogDetailBadgeX + 22;
    const blogDetailBadgeIconY = blogDetailBadgeY + (blogDetailBadgeHeight - blogDetailBadgeIconSize) / 2;
    const blogDetailBadgeTextX = blogDetailBadgeIconX + blogDetailBadgeIconSize + 18;
    const blogDetailBadgeTextY = blogDetailBadgeY + 50;
    const blogDetailFooterX = 64;
    const blogDetailFooterWidth = STORY_WIDTH - 128;
    const blogDetailFooterTitleFontSize = 34;
    const blogDetailFooterTitleLineHeight = 40;
    const blogDetailFooterSubtitleFontSize = 22;
    const blogDetailFooterSubtitleLineHeight = 28;
    const blogDetailFooterTopPadding = 50;
    const blogDetailFooterBottomPadding = 38;
    const blogDetailFooterTitleBlockHeight = blogDetailTitleLines.length > 0
        ? blogDetailFooterTitleFontSize + (blogDetailTitleLines.length - 1) * blogDetailFooterTitleLineHeight
        : 0;
    const blogDetailFooterSubtitleGap = blogDetailSubtitleLines.length > 0 ? 18 : 0;
    const blogDetailFooterSubtitleBlockHeight = blogDetailSubtitleLines.length > 0
        ? blogDetailFooterSubtitleFontSize + (blogDetailSubtitleLines.length - 1) * blogDetailFooterSubtitleLineHeight
        : 0;
    const blogDetailFooterHeight = blogDetailFooterTopPadding
        + blogDetailFooterTitleBlockHeight
        + blogDetailFooterSubtitleGap
        + blogDetailFooterSubtitleBlockHeight
        + blogDetailFooterBottomPadding;
    const blogDetailFooterY = STORY_HEIGHT - blogDetailFooterHeight - 58;
    const blogDetailFrameX = 60;
    const blogDetailFrameY = 176;
    const blogDetailFrameWidth = STORY_WIDTH - 120;
    const blogDetailFrameHeight = blogDetailFooterY - blogDetailFrameY - 34;
    const blogDetailFrameInnerInset = 10;
    const blogDetailFrameInnerX = blogDetailFrameX + blogDetailFrameInnerInset;
    const blogDetailFrameInnerY = blogDetailFrameY + blogDetailFrameInnerInset;
    const blogDetailFrameInnerWidth = blogDetailFrameWidth - blogDetailFrameInnerInset * 2;
    const blogDetailFrameInnerHeight = blogDetailFrameHeight - blogDetailFrameInnerInset * 2;
    const blogDetailFooterTitleY = blogDetailFooterY + blogDetailFooterTopPadding;
    const blogDetailFooterSubtitleY = blogDetailFooterTitleY + blogDetailFooterTitleBlockHeight + blogDetailFooterSubtitleGap;

    return (
        <View pointerEvents="none" style={styles.hiddenHost}>
            <Svg
                ref={svgRef}
                width={canvas.width}
                height={canvas.height}
                viewBox={`0 0 ${canvas.width} ${canvas.height}`}
            >
                <Defs>
                    <LinearGradient id="home-top-pill" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor="#60A5FA" />
                        <Stop offset="1" stopColor="#2563EB" />
                    </LinearGradient>
                    <LinearGradient id="blog-story-bg" x1="0" y1="0" x2="0.85" y2="1">
                        <Stop offset="0" stopColor="#0C215E" />
                        <Stop offset="1" stopColor="#021235" />
                    </LinearGradient>
                    <LinearGradient id="home-bottom-fade" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#070C14" stopOpacity={0} />
                        <Stop offset="1" stopColor="#070C14" stopOpacity={0.62} />
                    </LinearGradient>
                    <LinearGradient id="home-button-fill" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor="#60A5FA" />
                        <Stop offset="1" stopColor="#2563EB" />
                    </LinearGradient>
                </Defs>
                {!isOverlay ? (
                    <>
                        <Rect
                            x={0}
                            y={0}
                            width={STORY_WIDTH}
                            height={STORY_HEIGHT}
                            fill={
                                isBlogDetailCard
                                    ? 'url(#blog-story-bg)'
                                    : backgroundFailed
                                        ? '#0D0F12'
                                        : '#09111A'
                            }
                        />
                        {request.imageUri && !backgroundFailed && !isBlogDetailCard ? (
                            <StorySvgImage
                                x={0}
                                y={0}
                                width={STORY_WIDTH}
                                height={STORY_HEIGHT}
                                href={{uri: request.imageUri}}
                                preserveAspectRatio="xMidYMid slice"
                                onLoad={() => setBackgroundLoaded(true)}
                                onError={() => {
                                    setBackgroundFailed(true);
                                    setBackgroundLoaded(true);
                                }}
                            />
                        ) : null}
                        {isBlogCard ? (
                            <Rect
                                x={0}
                                y={0}
                                width={STORY_WIDTH}
                                height={STORY_HEIGHT}
                                fill="rgba(5,10,16,0.20)"
                            />
                        ) : null}
                        {isHomeMediaCard ? (
                            <>
                                <Rect
                                    x={0}
                                    y={0}
                                    width={STORY_WIDTH}
                                    height={STORY_HEIGHT}
                                    fill="rgba(4,9,16,0.08)"
                                />
                                <Rect
                                    x={0}
                                    y={1080}
                                    width={STORY_WIDTH}
                                    height={840}
                                    fill="url(#home-bottom-fade)"
                                />
                            </>
                        ) : null}
                        {isBlogDetailCard ? (
                            <Rect
                                x={0}
                                y={0}
                                width={STORY_WIDTH}
                                height={STORY_HEIGHT}
                                fill="rgba(3,10,28,0.06)"
                            />
                        ) : null}
                    </>
                ) : (
                    <Rect x={0} y={0} width={STORY_WIDTH} height={STORY_HEIGHT} fill="rgba(0,0,0,0)" />
                )}

                {isOverlay && !isHomeMediaCard && !isHomeVideoCard ? (
                    <>
                    <SvgText
                        x={overlayBrandStartX}
                        y={OVERLAY_BRAND_Y}
                        fill="#FFFFFF"
                        fontSize={OVERLAY_BRAND_FONT_SIZE}
                        fontWeight="700"
                        stroke="rgba(0,0,0,0.40)"
                        strokeWidth={2}
                    >
                        {appName}
                    </SvgText>
                    <StorySvgImage
                        x={overlayBrandStartX + overlayTextWidth + OVERLAY_BRAND_GAP}
                        y={overlayLogoY}
                        width={OVERLAY_BRAND_LOGO_SIZE}
                        height={OVERLAY_BRAND_LOGO_SIZE}
                        href={{uri: brandLogoUri}}
                        preserveAspectRatio="xMidYMid meet"
                    />
                    </>
                ) : null}

                {isHomeMediaCard ? (
                    <>
                        {isOverlay ? (
                            <>
                                <Rect
                                    x={0}
                                    y={0}
                                    width={STORY_WIDTH}
                                    height={STORY_HEIGHT}
                                    fill="rgba(4,9,16,0.08)"
                                />
                                <Rect
                                    x={0}
                                    y={1080}
                                    width={STORY_WIDTH}
                                    height={840}
                                    fill="url(#home-bottom-fade)"
                                />
                            </>
                        ) : null}
                        <Rect
                            x={homeVideoBrandPillX}
                            y={homeVideoBrandPillY}
                            width={homeBrandPillWidth}
                            height={homeBrandPillHeight}
                            rx={30}
                            fill="url(#home-top-pill)"
                            opacity={0.96}
                        />
                        <StorySvgImage
                            x={homeVideoBrandIconX}
                            y={homeVideoBrandIconY}
                            width={homeBrandIconSize}
                            height={homeBrandIconSize}
                            href={{uri: brandLogoUri}}
                            preserveAspectRatio="xMidYMid meet"
                        />
                        <SvgText
                            x={homeVideoBrandTextX}
                            y={homeVideoBrandTextY}
                            fill="#FFFFFF"
                            fontSize={42}
                            fontWeight="700"
                        >
                            {appName}
                        </SvgText>
                        <Rect
                            x={homeCardX}
                            y={homeCardY}
                            width={homeCardWidth}
                            height={homeCardHeight}
                            rx={38}
                            fill="rgba(17,24,39,0.36)"
                            stroke="rgba(255,255,255,0.52)"
                            strokeWidth={4}
                        />
                        <Rect
                            x={homeCardX + 18}
                            y={homeCardY + 18}
                            width={homeCardWidth - 36}
                            height={homeCardHeight - 36}
                            rx={30}
                            fill="rgba(255,255,255,0.02)"
                        />
                        {homeTitleLines.length > 0 ? (
                            <SvgText
                                x={homeCardCenterX}
                                y={homeTitleStartY}
                                fill="#FFFFFF"
                                fontSize={homeTitleFontSize}
                                fontWeight="700"
                                textAnchor="middle"
                            >
                                {homeTitleLines.map((line, index) => (
                                    <TSpan
                                        key={`${request.id}-home-title-${index}`}
                                        x={homeCardCenterX}
                                        dy={index === 0 ? 0 : homeTitleLineHeight}
                                    >
                                        {line}
                                    </TSpan>
                                ))}
                            </SvgText>
                        ) : null}
                        {homeSubtitleLines.length > 0 ? (
                            <SvgText
                                x={homeCardCenterX}
                                y={homeSubtitleStartY}
                                fill="rgba(255,255,255,0.92)"
                                fontSize={homeSubtitleFontSize}
                                fontWeight="500"
                                textAnchor="middle"
                            >
                                {homeSubtitleLines.map((line, index) => (
                                    <TSpan
                                        key={`${request.id}-home-subtitle-${index}`}
                                        x={homeCardCenterX}
                                        dy={index === 0 ? 0 : homeSubtitleLineHeight}
                                    >
                                        {line}
                                    </TSpan>
                                ))}
                            </SvgText>
                        ) : null}
                        <Rect
                            x={homeButtonX}
                            y={homeButtonY}
                            width={homeButtonWidth}
                            height={homeButtonHeight}
                            rx={28}
                            fill="url(#home-button-fill)"
                        />
                        <SvgText
                            x={homeCardCenterX}
                            y={homeButtonY + 49}
                            fill="#FFFFFF"
                            fontSize={28}
                            fontWeight="700"
                            textAnchor="middle"
                        >
                            {homeButtonLabel}
                        </SvgText>
                    </>
                ) : null}

                {isHomeVideoCard ? (
                    <>
                        {isOverlay ? (
                            <>
                                <Rect
                                    x={0}
                                    y={0}
                                    width={STORY_WIDTH}
                                    height={STORY_HEIGHT}
                                    fill="rgba(4,9,16,0.04)"
                                />
                                <Rect
                                    x={0}
                                    y={980}
                                    width={STORY_WIDTH}
                                    height={940}
                                    fill="url(#home-bottom-fade)"
                                />
                            </>
                        ) : null}
                        <Rect
                            x={homeBrandPillX}
                            y={homeBrandPillY}
                            width={homeBrandPillWidth}
                            height={homeBrandPillHeight}
                            rx={30}
                            fill="url(#home-top-pill)"
                            opacity={0.96}
                        />
                        <StorySvgImage
                            x={homeBrandIconX}
                            y={homeBrandIconY}
                            width={homeBrandIconSize}
                            height={homeBrandIconSize}
                            href={{uri: brandLogoUri}}
                            preserveAspectRatio="xMidYMid meet"
                        />
                        <SvgText
                            x={homeBrandTextX}
                            y={homeBrandTextY}
                            fill="#FFFFFF"
                            fontSize={42}
                            fontWeight="700"
                        >
                            {appName}
                        </SvgText>
                        <Rect
                            x={homeVideoCardX}
                            y={homeVideoCardY}
                            width={homeVideoCardWidth}
                            height={homeVideoCardHeight}
                            rx={40}
                            fill="rgba(255,255,255,0)"
                            stroke="rgba(255,255,255,0.42)"
                            strokeWidth={4}
                        />
                    </>
                ) : null}

                {isBlogDetailCard ? (
                    <>
                        <Rect
                            x={blogDetailBadgeX}
                            y={blogDetailBadgeY}
                            width={blogDetailBadgeWidth}
                            height={blogDetailBadgeHeight}
                            rx={30}
                            fill="url(#home-top-pill)"
                            opacity={0.98}
                        />
                        <StorySvgImage
                            x={blogDetailBadgeIconX}
                            y={blogDetailBadgeIconY}
                            width={blogDetailBadgeIconSize}
                            height={blogDetailBadgeIconSize}
                            href={{uri: brandLogoUri}}
                            preserveAspectRatio="xMidYMid meet"
                        />
                        <SvgText
                            x={blogDetailBadgeTextX}
                            y={blogDetailBadgeTextY}
                            fill="#FFFFFF"
                            fontSize={34}
                            fontWeight="700"
                        >
                            {appName}
                        </SvgText>
                        <Rect
                            x={blogDetailFrameX}
                            y={blogDetailFrameY}
                            width={blogDetailFrameWidth}
                            height={blogDetailFrameHeight}
                            rx={46}
                            fill="rgba(255,255,255,0.98)"
                        />
                        <Rect
                            x={blogDetailFrameInnerX}
                            y={blogDetailFrameInnerY}
                            width={blogDetailFrameInnerWidth}
                            height={blogDetailFrameInnerHeight}
                            rx={36}
                            fill={backgroundFailed ? '#9FB2C4' : '#8AA4BD'}
                        />
                        {request.imageUri && !backgroundFailed ? (
                            <StorySvgImage
                                x={blogDetailFrameInnerX}
                                y={blogDetailFrameInnerY}
                                width={blogDetailFrameInnerWidth}
                                height={blogDetailFrameInnerHeight}
                                href={{uri: request.imageUri}}
                                preserveAspectRatio="xMidYMid slice"
                                onLoad={() => setBackgroundLoaded(true)}
                                onError={() => {
                                    setBackgroundFailed(true);
                                    setBackgroundLoaded(true);
                                }}
                            />
                        ) : null}
                        <Rect
                            x={blogDetailFooterX}
                            y={blogDetailFooterY}
                            width={blogDetailFooterWidth}
                            height={blogDetailFooterHeight}
                            rx={38}
                            fill="rgba(243,247,252,0.96)"
                        />
                        {blogDetailTitleLines.length > 0 ? (
                            <SvgText
                                x={STORY_WIDTH / 2}
                                y={blogDetailFooterTitleY}
                                fill="#1F3B6D"
                                fontSize={blogDetailFooterTitleFontSize}
                                fontWeight="700"
                                textAnchor="middle"
                            >
                                {blogDetailTitleLines.map((line, index) => (
                                    <TSpan
                                        key={`${request.id}-blog-detail-title-${index}`}
                                        x={STORY_WIDTH / 2}
                                        dy={index === 0 ? 0 : blogDetailFooterTitleLineHeight}
                                    >
                                        {line}
                                    </TSpan>
                                ))}
                            </SvgText>
                        ) : null}
                        {blogDetailSubtitleLines.length > 0 ? (
                            <SvgText
                                x={STORY_WIDTH / 2}
                                y={blogDetailFooterSubtitleY}
                                fill="#415A84"
                                fontSize={blogDetailFooterSubtitleFontSize}
                                fontWeight="500"
                                textAnchor="middle"
                            >
                                {blogDetailSubtitleLines.map((line, index) => (
                                    <TSpan
                                        key={`${request.id}-blog-detail-subtitle-${index}`}
                                        x={STORY_WIDTH / 2}
                                        dy={index === 0 ? 0 : blogDetailFooterSubtitleLineHeight}
                                    >
                                        {line}
                                    </TSpan>
                                ))}
                            </SvgText>
                        ) : null}
                    </>
                ) : null}

                {isBlogCard ? (
                    <>
                        <Rect
                            x={cardX}
                            y={cardY}
                            width={cardWidth}
                            height={cardHeight}
                            rx={42}
                            fill="rgba(8,14,21,0.18)"
                        />
                        <Rect
                            x={cardX}
                            y={cardY - 8}
                            width={cardWidth}
                            height={cardHeight}
                            rx={42}
                            fill="rgba(250,251,253,0.96)"
                        />
                        {titleLines.length > 0 ? (
                            <SvgText
                                x={cardInnerX}
                                y={cardInnerY + 62}
                                fill="#0F172A"
                                fontSize={58}
                                fontWeight="700"
                            >
                                {titleLines.map((line, index) => (
                                    <TSpan
                                        key={`${request.id}-title-${index}`}
                                        x={cardInnerX}
                                        dy={index === 0 ? 0 : 70}
                                    >
                                        {line}
                                    </TSpan>
                                ))}
                            </SvgText>
                        ) : null}
                        {subtitleLines.length > 0 ? (
                            <SvgText
                                x={cardInnerX}
                                y={cardInnerY + 188}
                                fill="#334155"
                                fontSize={36}
                                fontWeight="400"
                            >
                                {subtitleLines.map((line, index) => (
                                    <TSpan
                                        key={`${request.id}-subtitle-${index}`}
                                        x={cardInnerX}
                                        dy={index === 0 ? 0 : 48}
                                    >
                                        {line}
                                    </TSpan>
                                ))}
                            </SvgText>
                        ) : null}
                    </>
                ) : null}
            </Svg>
        </View>
    );
};

export function useInstagramStoryImageComposer() {
    const [request, setRequest] = useState<InstagramStoryComposeRequest | null>(null);
    const pendingRef = useRef<{
        resolve: (value: string) => void;
        reject: (reason?: any) => void;
    } | null>(null);

    const composeInstagramStoryImage = useCallback(
        (
            imageUri?: string | null,
            title?: string | null,
            appName = 'SpotMe',
            subtitle?: string | null,
            options?: InstagramStoryComposeOptions,
        ) => {
            return new Promise<string>((resolve, reject) => {
                if (pendingRef.current) {
                    pendingRef.current.reject(new Error('Instagram Story composition was interrupted.'));
                }
                pendingRef.current = {resolve, reject};
                setRequest({
                    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    imageUri: imageUri ?? null,
                    title,
                    subtitle,
                    appName,
                    mode: options?.mode === 'overlay' ? 'overlay' : 'background',
                    layout:
                        options?.layout === 'blog_card'
                            ? 'blog_card'
                            : options?.layout === 'home_media_card'
                                ? 'home_media_card'
                                : options?.layout === 'home_video_card'
                                    ? 'home_video_card'
                                : options?.layout === 'blog_detail_card'
                                    ? 'blog_detail_card'
                                : 'badge',
                });
            });
        },
        [],
    );

    const handleComplete = useCallback((uri: string) => {
        pendingRef.current?.resolve(uri);
        pendingRef.current = null;
        setRequest(null);
    }, []);

    const handleError = useCallback((error: Error) => {
        pendingRef.current?.reject(error);
        pendingRef.current = null;
        setRequest(null);
    }, []);

    return {
        composeInstagramStoryImage,
        composerElement: (
            <InstagramStoryComposer
                request={request}
                onComplete={handleComplete}
                onError={handleError}
            />
        ),
    };
}

const styles = StyleSheet.create({
    hiddenHost: {
        position: 'absolute',
        left: -10000,
        top: 0,
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
    },
});

export default InstagramStoryComposer;
