import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image as RNImage, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RNFS from 'react-native-fs';
import {captureRef} from 'react-native-view-shot';
import Svg, {
    ClipPath,
    Defs,
    Image as SvgImage,
    LinearGradient as SvgLinearGradient,
    Rect,
    Stop,
    Text as SvgText,
    TSpan,
} from 'react-native-svg';

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const OVERLAY_BRAND_FONT_SIZE = 58;
const OVERLAY_BRAND_Y = STORY_HEIGHT - 132;
const OVERLAY_BRAND_LOGO_SIZE = 60;
const OVERLAY_BRAND_GAP = 18;
const splashLogoSource = require('../../../android/app/src/main/res/drawable-nodpi/spotme_mark.png');

type StoryComposeMode = 'background' | 'overlay';
type StoryComposeLayout = 'badge' | 'blog_card' | 'home_media_card' | 'home_media_overlay_card';

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

function debugInstagramStoryComposer(stage: string, details?: Record<string, unknown>) {
    console.log(`[IGStoryComposer] ${stage}`, details ?? {});
}

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
        .replace(/\s*[-|,\u2022]\s*/g, ' ')
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

function formatHomeTitle(lines: string[]) {
    if (!lines.length) {
        return '';
    }
    return lines.map((line, index) => (index === 0 ? `Event: ${line}` : line)).join('\n');
}

async function writeBase64Png(base64: string, requestId: string) {
    const safeId = String(requestId || `${Date.now()}`).replace(/[^a-z0-9_-]/gi, '');
    const path = `${RNFS.CachesDirectoryPath}/instagram-story-${safeId}.png`;
    await RNFS.writeFile(path, base64, 'base64');
    debugInstagramStoryComposer('writeBase64Png.done', {
        requestId,
        path,
        byteLength: base64.length,
    });
    return `file://${path}`;
}

const InstagramStoryComposer = ({request, onComplete, onError}: ComposerProps) => {
    const svgRef = useRef<Svg | null>(null);
    const captureViewRef = useRef<View | null>(null);
    const [backgroundPrimed, setBackgroundPrimed] = useState(false);
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);
    const [backgroundFailed, setBackgroundFailed] = useState(false);
    const capturedRequestIdRef = useRef<string | null>(null);

    useEffect(() => {
        capturedRequestIdRef.current = null;
        setBackgroundFailed(false);
        const isImmediateReady = Boolean(!request?.imageUri || request?.mode === 'overlay');
        setBackgroundPrimed(isImmediateReady);
        setBackgroundLoaded(isImmediateReady);
        debugInstagramStoryComposer('request.reset', {
            requestId: request?.id ?? null,
            layout: request?.layout ?? null,
            mode: request?.mode ?? null,
            imageUri: request?.imageUri ?? null,
            isImmediateReady,
        });

        if (!request?.imageUri || request?.mode === 'overlay') {
            return;
        }

        let cancelled = false;
        RNImage.getSize(
            request.imageUri,
            (width, height) => {
                if (!cancelled) {
                    debugInstagramStoryComposer('image.getSize.success', {
                        requestId: request.id,
                        width,
                        height,
                    });
                    setBackgroundPrimed(true);
                }
            },
            (error) => {
                if (!cancelled) {
                    debugInstagramStoryComposer('image.getSize.failed', {
                        requestId: request.id,
                        message: String((error as any)?.message ?? error ?? 'unknown'),
                    });
                    setBackgroundPrimed(true);
                }
            },
        );

        return () => {
            cancelled = true;
        };
    }, [request?.id, request?.imageUri, request?.layout, request?.mode]);

    const canvas = useMemo(() => ({width: STORY_WIDTH, height: STORY_HEIGHT}), []);
    const shouldUseViewCapture = request?.layout === 'home_media_card' && request?.mode === 'background';
    const appName = normalizeText(request?.appName || 'SpotMe') || 'SpotMe';
    const splashLogoUri = useMemo(() => RNImage.resolveAssetSource(splashLogoSource).uri, []);
    const titleText = normalizeText(request?.title);
    const subtitleText = dedupeSubtitle(request?.title, request?.subtitle);

    const titleLines = useMemo(() => {
        if (request?.layout !== 'blog_card') {
            return [];
        }
        return wrapTextLines(titleText, 960 - 96, 50, 2);
    }, [request?.layout, titleText]);

    const subtitleLines = useMemo(() => {
        if (request?.layout !== 'blog_card') {
            return [];
        }
        return wrapTextLines(subtitleText, 960 - 96, 32, 3);
    }, [request?.layout, subtitleText]);

    const hasSubtitle = subtitleLines.length > 0;
    const homeTitleLines = useMemo(() => {
        if (request?.layout !== 'home_media_card' && request?.layout !== 'home_media_overlay_card') {
            return [];
        }
        return wrapTextLines(titleText, 860, 48, 2);
    }, [request?.layout, titleText]);

    const homeSubtitleLines = useMemo(() => {
        if (request?.layout !== 'home_media_card' && request?.layout !== 'home_media_overlay_card') {
            return [];
        }
        return wrapTextLines(subtitleText, 860, 34, 1);
    }, [request?.layout, subtitleText]);

    const exportStoryImage = useCallback(async () => {
        if (!request) {
            return;
        }
        if (capturedRequestIdRef.current === request.id) {
            return;
        }
        if (shouldUseViewCapture && !captureViewRef.current) {
            return;
        }
        if (!shouldUseViewCapture && !svgRef.current) {
            return;
        }

        capturedRequestIdRef.current = request.id;
        debugInstagramStoryComposer('export.start', {
            requestId: request.id,
            layout: request.layout,
            mode: request.mode,
            imageUri: request.imageUri ?? null,
            backgroundPrimed,
            backgroundLoaded,
            backgroundFailed,
            renderer: shouldUseViewCapture ? 'view-shot' : 'svg',
        });

        try {
            let base64 = '';

            if (shouldUseViewCapture) {
                base64 = await captureRef(captureViewRef.current, {
                    format: 'png',
                    quality: 1,
                    result: 'base64',
                    width: canvas.width,
                    height: canvas.height,
                });
                debugInstagramStoryComposer('export.captureRef.ready', {
                    requestId: request.id,
                    byteLength: base64.length,
                });
            } else {
                base64 = await new Promise<string>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Instagram Story composition timed out.'));
                    }, 5000);

                    svgRef.current?.toDataURL((value: string) => {
                        clearTimeout(timeout);
                        if (!value) {
                            debugInstagramStoryComposer('export.empty', {requestId: request.id});
                            reject(new Error('Could not compose Instagram Story image.'));
                            return;
                        }
                        debugInstagramStoryComposer('export.base64.ready', {
                            requestId: request.id,
                            byteLength: value.length,
                        });
                        resolve(value);
                    }, {width: canvas.width, height: canvas.height});
                });
            }

            if (!base64) {
                throw new Error('Could not compose Instagram Story image.');
            }

            const fileUri = await writeBase64Png(base64, request.id);
            debugInstagramStoryComposer('export.complete', {
                requestId: request.id,
                fileUri,
            });
            onComplete(fileUri);
        } catch (error: any) {
            capturedRequestIdRef.current = null;
            debugInstagramStoryComposer('export.failed', {
                requestId: request.id,
                message: String(error?.message ?? error),
            });
            onError(error instanceof Error ? error : new Error(String(error ?? 'Instagram Story composition failed')));
        }
    }, [
        backgroundFailed,
        backgroundLoaded,
        backgroundPrimed,
        canvas.height,
        canvas.width,
        onComplete,
        onError,
        request,
        shouldUseViewCapture,
    ]);

    useEffect(() => {
        if (!request || !backgroundPrimed || !backgroundLoaded || backgroundFailed) {
            return;
        }

        const timer = setTimeout(() => {
            debugInstagramStoryComposer('export.scheduled', {
                requestId: request.id,
                delayMs: 140,
            });
            exportStoryImage().catch((error) => {
                onError(error instanceof Error ? error : new Error(String(error ?? 'Instagram Story composition failed')));
            });
        }, 140);

        return () => clearTimeout(timer);
    }, [backgroundFailed, backgroundLoaded, backgroundPrimed, exportStoryImage, onError, request]);

    if (!request) {
        return null;
    }

    const isOverlay = request.mode === 'overlay';
    const isBlogCard = request.layout === 'blog_card';
    const isHomeMediaOverlayCard = request.layout === 'home_media_overlay_card';
    const hasVisibleBackgroundImage = Boolean(request.imageUri && !backgroundFailed && !isBlogCard);
    const overlayTextWidth = estimateTextWidth(appName, OVERLAY_BRAND_FONT_SIZE);
    const overlayBrandWidth = overlayTextWidth + OVERLAY_BRAND_GAP + OVERLAY_BRAND_LOGO_SIZE;
    const overlayBrandStartX = (STORY_WIDTH - overlayBrandWidth) / 2;
    const overlayLogoY = OVERLAY_BRAND_Y - OVERLAY_BRAND_LOGO_SIZE + 8;
    const blogBadgeFontSize = 34;
    const blogBadgeLogoSize = 38;
    const blogBadgeGap = 12;
    const blogBadgeTextWidth = estimateTextWidth(appName, blogBadgeFontSize);
    const blogBadgeX = 42;
    const blogBadgeY = 48;
    const blogBadgeWidth = Math.max(176, blogBadgeTextWidth + blogBadgeLogoSize + blogBadgeGap + 52);
    const blogBadgeHeight = 72;
    const blogFrameX = 56;
    const blogFrameY = 154;
    const blogFrameWidth = STORY_WIDTH - 112;
    const blogCardHeight = subtitleLines.length > 1 ? 292 : hasSubtitle ? 252 : 176;
    const blogCardX = 60;
    const blogCardY = STORY_HEIGHT - blogCardHeight - 64;
    const blogCardWidth = STORY_WIDTH - 120;
    const blogCardInnerX = blogCardX + 52;
    const blogTitleY = blogCardY + 82;
    const blogSubtitleY = blogCardY + (titleLines.length > 1 ? 170 : 136);
    const blogFrameHeight = blogCardY - blogFrameY - 36;
    const blogImageInset = 10;
    const blogImageX = blogFrameX + blogImageInset;
    const blogImageY = blogFrameY + blogImageInset;
    const blogImageWidth = blogFrameWidth - blogImageInset * 2;
    const blogImageHeight = blogFrameHeight - blogImageInset * 2;
    const brandFontSize = 42;
    const brandLogoSize = 44;
    const brandGap = 14;
    const brandTextWidth = estimateTextWidth(appName, brandFontSize);
    const brandPillX = 48;
    const brandPillY = 112;
    const brandPillWidth = Math.max(220, brandTextWidth + brandLogoSize + brandGap + 58);
    const brandPillHeight = 84;
    const homeCardX = 52;
    const homeCardWidth = STORY_WIDTH - 104;
    const homeCardHeight = homeSubtitleLines.length > 0 ? 340 : 286;
    const homeCardY = STORY_HEIGHT - homeCardHeight - 104;
    const homeCardCenterX = homeCardX + homeCardWidth / 2;
    const homeTitleY = homeCardY + 104;
    const homeSubtitleY = homeCardY + (homeTitleLines.length > 1 ? 200 : 170);
    const ctaWidth = 580;
    const ctaHeight = 92;
    const ctaX = (STORY_WIDTH - ctaWidth) / 2;
    const ctaY = homeCardY + homeCardHeight - ctaHeight - 42;
    const homeTitleText = formatHomeTitle(homeTitleLines);
    const homeSubtitleText = homeSubtitleLines[0] ? `Match: ${homeSubtitleLines[0]}` : '';

    if (shouldUseViewCapture) {
        return (
            <View pointerEvents="none" style={styles.hiddenHost}>
                <View
                    ref={captureViewRef}
                    collapsable={false}
                    style={styles.captureCanvas}
                    testID="story-capture-host"
                >
                    {request.imageUri ? (
                        <RNImage
                            source={{uri: request.imageUri}}
                            style={styles.captureBackgroundImage}
                            resizeMode="cover"
                            testID="story-background-image"
                            onLoad={() => {
                                debugInstagramStoryComposer('image.onLoad', {
                                    requestId: request.id,
                                    layout: request.layout,
                                    renderer: 'view-shot',
                                });
                                setBackgroundLoaded(true);
                            }}
                            onError={() => {
                                debugInstagramStoryComposer('image.onError', {
                                    requestId: request.id,
                                    layout: request.layout,
                                    renderer: 'view-shot',
                                    imageUri: request.imageUri,
                                });
                                setBackgroundFailed(true);
                                onError(new Error('Could not load image for Instagram Story sharing.'));
                            }}
                        />
                    ) : (
                        <View style={styles.captureBackgroundFallback} />
                    )}

                    <View
                        style={[
                            styles.captureBrandPill,
                            {
                                left: brandPillX,
                                top: brandPillY,
                                width: brandPillWidth,
                                height: brandPillHeight,
                            },
                        ]}
                    >
                        <RNImage source={splashLogoSource} style={styles.captureBrandLogo} resizeMode="contain" />
                        <Text style={[styles.captureBrandText, {fontSize: brandFontSize}]}>{appName}</Text>
                    </View>

                    <View
                        style={[
                            styles.captureHomeCard,
                            {
                                left: homeCardX,
                                top: homeCardY,
                                width: homeCardWidth,
                                height: homeCardHeight,
                            },
                        ]}
                    >
                        {homeTitleText ? (
                            <Text
                                style={[
                                    styles.captureHomeTitle,
                                    styles.captureTextInset,
                                    {
                                        top: homeTitleY - homeCardY - 48,
                                    },
                                ]}
                            >
                                {homeTitleText}
                            </Text>
                        ) : null}

                        {homeSubtitleText ? (
                            <Text
                                style={[
                                    styles.captureHomeSubtitle,
                                    styles.captureTextInset,
                                    {
                                        top: homeSubtitleY - homeCardY - 22,
                                    },
                                ]}
                            >
                                {homeSubtitleText}
                            </Text>
                        ) : null}

                        <LinearGradient
                            colors={['#4E92FF', '#377EF5']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            style={[
                                styles.captureCta,
                                {
                                    left: ctaX - homeCardX,
                                    top: ctaY - homeCardY,
                                    width: ctaWidth,
                                    height: ctaHeight,
                                },
                            ]}
                        >
                            <Text style={styles.captureCtaText}>{`Get your race photos on ${appName}`}</Text>
                        </LinearGradient>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View pointerEvents="none" style={styles.hiddenHost}>
            <Svg
                ref={svgRef}
                width={canvas.width}
                height={canvas.height}
                viewBox={`0 0 ${canvas.width} ${canvas.height}`}
            >
                <Defs>
                    <ClipPath id="blogCardImageClip">
                        <Rect
                            x={blogImageX}
                            y={blogImageY}
                            width={blogImageWidth}
                            height={blogImageHeight}
                            rx={34}
                        />
                    </ClipPath>
                    <SvgLinearGradient id="homeCardButton" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor="#4E92FF" />
                        <Stop offset="1" stopColor="#377EF5" />
                    </SvgLinearGradient>
                </Defs>
                {!isOverlay ? (
                    <>
                        <Rect
                            x={0}
                            y={0}
                            width={STORY_WIDTH}
                            height={STORY_HEIGHT}
                            fill={isBlogCard ? (backgroundFailed ? '#0D0F12' : '#122047') : 'rgba(0,0,0,0)'}
                        />
                        {hasVisibleBackgroundImage ? (
                            <SvgImage
                                x={0}
                                y={0}
                                width={STORY_WIDTH}
                                height={STORY_HEIGHT}
                                href={{uri: request.imageUri}}
                                preserveAspectRatio="xMidYMid slice"
                                onLoad={() => {
                                    debugInstagramStoryComposer('image.onLoad', {
                                        requestId: request.id,
                                        layout: request.layout,
                                        renderer: 'svg',
                                    });
                                    setBackgroundLoaded(true);
                                }}
                                onError={() => {
                                    debugInstagramStoryComposer('image.onError', {
                                        requestId: request.id,
                                        layout: request.layout,
                                        renderer: 'svg',
                                        imageUri: request.imageUri,
                                    });
                                    setBackgroundFailed(true);
                                    onError(new Error('Could not load image for Instagram Story sharing.'));
                                }}
                            />
                        ) : null}
                    </>
                ) : (
                    <Rect x={0} y={0} width={STORY_WIDTH} height={STORY_HEIGHT} fill="rgba(0,0,0,0)" />
                )}

                {isOverlay ? (
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
                        <SvgImage
                            x={overlayBrandStartX + overlayTextWidth + OVERLAY_BRAND_GAP}
                            y={overlayLogoY}
                            width={OVERLAY_BRAND_LOGO_SIZE}
                            height={OVERLAY_BRAND_LOGO_SIZE}
                            href={{uri: splashLogoUri}}
                            preserveAspectRatio="xMidYMid meet"
                        />
                    </>
                ) : null}

                {isBlogCard ? (
                    <>
                        <Rect
                            x={blogBadgeX}
                            y={blogBadgeY}
                            width={blogBadgeWidth}
                            height={blogBadgeHeight}
                            rx={22}
                            fill="rgba(78,146,255,0.96)"
                        />
                        <SvgImage
                            x={blogBadgeX + 16}
                            y={blogBadgeY + (blogBadgeHeight - blogBadgeLogoSize) / 2}
                            width={blogBadgeLogoSize}
                            height={blogBadgeLogoSize}
                            href={{uri: splashLogoUri}}
                            preserveAspectRatio="xMidYMid meet"
                        />
                        <SvgText
                            x={blogBadgeX + 16 + blogBadgeLogoSize + blogBadgeGap}
                            y={blogBadgeY + 47}
                            fill="#FFFFFF"
                            fontSize={blogBadgeFontSize}
                            fontWeight="700"
                        >
                            {appName}
                        </SvgText>

                        <Rect
                            x={blogFrameX}
                            y={blogFrameY}
                            width={blogFrameWidth}
                            height={blogFrameHeight}
                            rx={42}
                            fill="#F8FAFC"
                        />
                        {request.imageUri && !backgroundFailed ? (
                            <SvgImage
                                x={blogImageX}
                                y={blogImageY}
                                width={blogImageWidth}
                                height={blogImageHeight}
                                href={{uri: request.imageUri}}
                                preserveAspectRatio="xMidYMid slice"
                                clipPath="url(#blogCardImageClip)"
                                onLoad={() => {
                                    debugInstagramStoryComposer('image.onLoad', {
                                        requestId: request.id,
                                        layout: request.layout,
                                        renderer: 'svg',
                                    });
                                    setBackgroundLoaded(true);
                                }}
                                onError={() => {
                                    debugInstagramStoryComposer('image.onError', {
                                        requestId: request.id,
                                        layout: request.layout,
                                        renderer: 'svg',
                                        imageUri: request.imageUri,
                                    });
                                    setBackgroundFailed(true);
                                    onError(new Error('Could not load image for Instagram Story sharing.'));
                                }}
                            />
                        ) : (
                            <Rect
                                x={blogImageX}
                                y={blogImageY}
                                width={blogImageWidth}
                                height={blogImageHeight}
                                rx={34}
                                fill="#2B3B67"
                            />
                        )}

                        <Rect
                            x={blogCardX}
                            y={blogCardY}
                            width={blogCardWidth}
                            height={blogCardHeight}
                            rx={40}
                            fill="#F3F6FB"
                            stroke="rgba(255,255,255,0.18)"
                            strokeWidth={2}
                        />
                        {titleLines.length > 0 ? (
                            <SvgText
                                x={blogCardInnerX}
                                y={blogTitleY}
                                fill="#153468"
                                fontSize={50}
                                fontWeight="700"
                            >
                                {titleLines.map((line, index) => (
                                    <TSpan
                                        key={`${request.id}-title-${index}`}
                                        x={blogCardInnerX}
                                        dy={index === 0 ? 0 : 60}
                                    >
                                        {line}
                                    </TSpan>
                                ))}
                            </SvgText>
                        ) : null}
                        {subtitleLines.length > 0 ? (
                            <SvgText
                                x={blogCardInnerX}
                                y={blogSubtitleY}
                                fill="#516A90"
                                fontSize={32}
                                fontWeight="400"
                            >
                                {subtitleLines.map((line, index) => (
                                    <TSpan
                                        key={`${request.id}-subtitle-${index}`}
                                        x={blogCardInnerX}
                                        dy={index === 0 ? 0 : 42}
                                    >
                                        {line}
                                    </TSpan>
                                ))}
                            </SvgText>
                        ) : null}
                    </>
                ) : null}

                {isHomeMediaOverlayCard ? (
                    <>
                        <Rect
                            x={brandPillX}
                            y={brandPillY}
                            width={brandPillWidth}
                            height={brandPillHeight}
                            rx={24}
                            fill="rgba(78,146,255,0.95)"
                        />
                        <SvgImage
                            x={brandPillX + 18}
                            y={brandPillY + (brandPillHeight - brandLogoSize) / 2}
                            width={brandLogoSize}
                            height={brandLogoSize}
                            href={{uri: splashLogoUri}}
                            preserveAspectRatio="xMidYMid meet"
                        />
                        <SvgText
                            x={brandPillX + 18 + brandLogoSize + brandGap}
                            y={brandPillY + 54}
                            fill="#FFFFFF"
                            fontSize={brandFontSize}
                            fontWeight="700"
                        >
                            {appName}
                        </SvgText>

                        <Rect
                            x={homeCardX}
                            y={homeCardY}
                            width={homeCardWidth}
                            height={homeCardHeight}
                            rx={40}
                            fill="rgba(18,23,36,0.34)"
                            stroke="rgba(255,255,255,0.65)"
                            strokeWidth={3}
                        />

                        {homeTitleLines.length > 0 ? (
                            <SvgText
                                x={homeCardCenterX}
                                y={homeTitleY}
                                fill="#FFFFFF"
                                fontSize={48}
                                fontWeight="700"
                                textAnchor="middle"
                            >
                                {homeTitleLines.map((line, index) => (
                                    <TSpan
                                        key={`${request.id}-home-title-${index}`}
                                        x={homeCardCenterX}
                                        dy={index === 0 ? 0 : 58}
                                    >
                                        {index === 0 ? `Event: ${line}` : line}
                                    </TSpan>
                                ))}
                            </SvgText>
                        ) : null}

                        {homeSubtitleLines.length > 0 ? (
                            <SvgText
                                x={homeCardCenterX}
                                y={homeSubtitleY}
                                fill="rgba(255,255,255,0.92)"
                                fontSize={34}
                                fontWeight="500"
                                textAnchor="middle"
                            >
                                <TSpan x={homeCardCenterX} dy={0}>
                                    {`Match: ${homeSubtitleLines[0]}`}
                                </TSpan>
                            </SvgText>
                        ) : null}

                        <Rect
                            x={ctaX}
                            y={ctaY}
                            width={ctaWidth}
                            height={ctaHeight}
                            rx={30}
                            fill="url(#homeCardButton)"
                        />
                        <SvgText
                            x={STORY_WIDTH / 2}
                            y={ctaY + 59}
                            fill="#FFFFFF"
                            fontSize={36}
                            fontWeight="700"
                            textAnchor="middle"
                        >
                            {`Get your race photos on ${appName}`}
                        </SvgText>
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
                                : options?.layout === 'home_media_overlay_card'
                                    ? 'home_media_overlay_card'
                                    : 'badge',
                });
            });
        },
        [],
    );

    const handleComplete = useCallback((uri: string) => {
        debugInstagramStoryComposer('hook.resolve', {uri});
        pendingRef.current?.resolve(uri);
        pendingRef.current = null;
        setRequest(null);
    }, []);

    const handleError = useCallback((error: Error) => {
        debugInstagramStoryComposer('hook.reject', {
            message: String(error?.message ?? error),
        });
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
    captureCanvas: {
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        backgroundColor: '#0D0F12',
    },
    captureBackgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
    },
    captureBackgroundFallback: {
        ...StyleSheet.absoluteFillObject,
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        backgroundColor: '#0D0F12',
    },
    captureBrandPill: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        borderRadius: 24,
        backgroundColor: 'rgba(78,146,255,0.95)',
    },
    captureBrandLogo: {
        width: 44,
        height: 44,
        marginRight: 14,
    },
    captureBrandText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    captureHomeCard: {
        position: 'absolute',
        borderRadius: 40,
        backgroundColor: 'rgba(18,23,36,0.34)',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.65)',
    },
    captureHomeTitle: {
        position: 'absolute',
        color: '#FFFFFF',
        fontSize: 48,
        fontWeight: '700',
        lineHeight: 58,
        textAlign: 'center',
        includeFontPadding: false,
    },
    captureHomeSubtitle: {
        position: 'absolute',
        color: 'rgba(255,255,255,0.92)',
        fontSize: 34,
        fontWeight: '500',
        lineHeight: 42,
        textAlign: 'center',
        includeFontPadding: false,
    },
    captureTextInset: {
        left: 58,
        right: 58,
    },
    captureCta: {
        position: 'absolute',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureCtaText: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '700',
        textAlign: 'center',
        includeFontPadding: false,
    },
});

export default InstagramStoryComposer;
