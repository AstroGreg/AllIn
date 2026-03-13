import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image as RNImage, StyleSheet, View} from 'react-native';
import RNFS from 'react-native-fs';
import Svg, {Image as SvgImage, Rect, Text as SvgText, TSpan} from 'react-native-svg';

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const OVERLAY_BRAND_FONT_SIZE = 58;
const OVERLAY_BRAND_Y = STORY_HEIGHT - 132;
const OVERLAY_BRAND_LOGO_SIZE = 60;
const OVERLAY_BRAND_GAP = 18;

type StoryComposeMode = 'background' | 'overlay';
type StoryComposeLayout = 'badge' | 'blog_card';

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
    const splashLogoUri = useMemo(
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

    return (
        <View pointerEvents="none" style={styles.hiddenHost}>
            <Svg
                ref={svgRef}
                width={canvas.width}
                height={canvas.height}
                viewBox={`0 0 ${canvas.width} ${canvas.height}`}
            >
                {!isOverlay ? (
                    <>
                        <Rect x={0} y={0} width={STORY_WIDTH} height={STORY_HEIGHT} fill={backgroundFailed ? '#0D0F12' : '#09111A'} />
                        {request.imageUri && !backgroundFailed ? (
                            <SvgImage
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
                    layout: options?.layout === 'blog_card' ? 'blog_card' : 'badge',
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
