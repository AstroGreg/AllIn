import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image as RNImage, StyleSheet, View} from 'react-native';
import RNFS from 'react-native-fs';
import Svg, {
    ClipPath,
    Defs,
    Image as SvgImage,
    Rect,
    Text as SvgText,
    TSpan,
} from 'react-native-svg';

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const MEDIA_MAX_WIDTH = 920;
const MEDIA_MAX_HEIGHT = 1460;
const MEDIA_RADIUS = 36;
const PANEL_PADDING_X = 40;
const PANEL_PADDING_TOP = 80;
const PANEL_PADDING_BOTTOM = 40;
const TITLE_FONT_SIZE = 50;
const TITLE_LINE_HEIGHT = 60;
const TITLE_MAX_LINES = 3;
const BRAND_FONT_SIZE = 30;
const BRAND_LINE_HEIGHT = 36;

export type InstagramStoryComposeRequest = {
    id: string;
    imageUri: string;
    title?: string | null;
    appName?: string | null;
};

type ComposerProps = {
    request: InstagramStoryComposeRequest | null;
    onComplete: (tmpFileUri: string) => void;
    onError: (error: Error) => void;
};

function getContainedSize(width: number, height: number, maxWidth: number, maxHeight: number) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return {width: maxWidth, height: Math.min(maxHeight, maxWidth)};
    }
    const ratio = width / height;
    const maxRatio = maxWidth / maxHeight;
    if (ratio > maxRatio) {
        return {width: maxWidth, height: maxWidth / ratio};
    }
    return {width: maxHeight * ratio, height: maxHeight};
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

function fitLineWithEllipsis(text: string, maxWidth: number, fontSize: number) {
    const trimmed = text.trim();
    if (!trimmed) {
        return '';
    }
    if (estimateTextWidth(trimmed, fontSize) <= maxWidth) {
        return trimmed;
    }

    let output = trimmed;
    while (output.length > 1 && estimateTextWidth(`${output}...`, fontSize) > maxWidth) {
        output = output.slice(0, -1).trimEnd();
    }
    return `${output}...`;
}

function wrapTitleLines(text: string, maxWidth: number, fontSize: number, maxLines: number) {
    const trimmed = String(text || '').trim();
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

        if (!current) {
            lines.push(fitLineWithEllipsis(word, maxWidth, fontSize));
        } else {
            lines.push(current);
        }

        current = current && estimateTextWidth(word, fontSize) > maxWidth
            ? ''
            : word;

        if (lines.length >= maxLines) {
            return lines.slice(0, maxLines);
        }
    }

    if (current) {
        lines.push(current);
    }

    if (lines.length <= maxLines) {
        return lines;
    }

    const clipped = lines.slice(0, maxLines);
    clipped[maxLines - 1] = fitLineWithEllipsis(
        `${clipped[maxLines - 1]} ${lines.slice(maxLines).join(' ')}`,
        maxWidth,
        fontSize,
    );
    return clipped;
}

async function writeBase64Png(base64: string, requestId: string) {
    const safeId = String(requestId || `${Date.now()}`).replace(/[^a-z0-9_-]/gi, '');
    const path = `${RNFS.CachesDirectoryPath}/instagram-story-${safeId}.png`;
    await RNFS.writeFile(path, base64, 'base64');
    return `file://${path}`;
}

const InstagramStoryComposer = ({request, onComplete, onError}: ComposerProps) => {
    const svgRef = useRef<Svg | null>(null);
    const [imageSize, setImageSize] = useState<{width: number; height: number} | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [captureStarted, setCaptureStarted] = useState(false);
    const capturedRequestIdRef = useRef<string | null>(null);

    useEffect(() => {
        capturedRequestIdRef.current = null;
        setImageLoaded(false);
        setImageSize(null);
        setCaptureStarted(false);

        if (!request?.imageUri) {
            return;
        }

        RNImage.getSize(
            request.imageUri,
            (width, height) => {
                setImageSize({width, height});
            },
            () => {
                setImageSize({width: MEDIA_MAX_WIDTH, height: MEDIA_MAX_HEIGHT});
            },
        );
    }, [request?.id, request?.imageUri]);

    const mediaFrame = useMemo(() => {
        const width = imageSize?.width ?? MEDIA_MAX_WIDTH;
        const height = imageSize?.height ?? MEDIA_MAX_HEIGHT;
        return getContainedSize(width, height, MEDIA_MAX_WIDTH, MEDIA_MAX_HEIGHT);
    }, [imageSize?.height, imageSize?.width]);

    const frameX = useMemo(() => (STORY_WIDTH - mediaFrame.width) / 2, [mediaFrame.width]);
    const frameY = useMemo(() => (STORY_HEIGHT - mediaFrame.height) / 2, [mediaFrame.height]);
    const panelHeight = useMemo(() => {
        const titleLines = wrapTitleLines(
            String(request?.title || ''),
            mediaFrame.width - PANEL_PADDING_X * 2,
            TITLE_FONT_SIZE,
            TITLE_MAX_LINES,
        );
        const titleHeight = titleLines.length > 0
            ? titleLines.length * TITLE_LINE_HEIGHT + 18
            : 0;
        return PANEL_PADDING_TOP + titleHeight + BRAND_LINE_HEIGHT + PANEL_PADDING_BOTTOM + 24;
    }, [mediaFrame.width, request?.title]);

    const titleLines = useMemo(() => {
        return wrapTitleLines(
            String(request?.title || ''),
            mediaFrame.width - PANEL_PADDING_X * 2,
            TITLE_FONT_SIZE,
            TITLE_MAX_LINES,
        );
    }, [mediaFrame.width, request?.title]);

    const appName = String(request?.appName || 'SpotMe').trim() || 'SpotMe';
    const badgeWidth = useMemo(() => {
        return estimateTextWidth(appName, BRAND_FONT_SIZE) + 44;
    }, [appName]);

    const exportStoryImage = useCallback(async () => {
        if (!request || !svgRef.current || captureStarted) {
            return;
        }
        if (capturedRequestIdRef.current === request.id) {
            return;
        }

        capturedRequestIdRef.current = request.id;
        setCaptureStarted(true);

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
                }, {width: STORY_WIDTH, height: STORY_HEIGHT});
            });

            const fileUri = await writeBase64Png(base64, request.id);
            onComplete(fileUri);
        } catch (error: any) {
            capturedRequestIdRef.current = null;
            setCaptureStarted(false);
            onError(error instanceof Error ? error : new Error(String(error ?? 'Instagram Story composition failed')));
        }
    }, [captureStarted, onComplete, onError, request]);

    useEffect(() => {
        if (!request || !imageLoaded || !imageSize) {
            return;
        }

        const timer = setTimeout(() => {
            exportStoryImage().catch((error) => {
                onError(error instanceof Error ? error : new Error(String(error ?? 'Instagram Story composition failed')));
            });
        }, 120);

        return () => clearTimeout(timer);
    }, [exportStoryImage, imageLoaded, imageSize, onError, request]);

    if (!request) {
        return null;
    }

    return (
        <View pointerEvents="none" style={styles.hiddenHost}>
            <Svg
                ref={svgRef}
                width={STORY_WIDTH}
                height={STORY_HEIGHT}
                viewBox={`0 0 ${STORY_WIDTH} ${STORY_HEIGHT}`}
            >
                <Defs>
                    <ClipPath id="storyMediaClip">
                        <Rect
                            x={frameX}
                            y={frameY}
                            width={mediaFrame.width}
                            height={mediaFrame.height}
                            rx={MEDIA_RADIUS}
                            ry={MEDIA_RADIUS}
                        />
                    </ClipPath>
                </Defs>

                <Rect x={0} y={0} width={STORY_WIDTH} height={STORY_HEIGHT} fill="#0D0F12" />

                <SvgImage
                    x={frameX}
                    y={frameY}
                    width={mediaFrame.width}
                    height={mediaFrame.height}
                    href={{uri: request.imageUri}}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#storyMediaClip)"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => onError(new Error('Could not load image for Instagram Story sharing.'))}
                />

                <Rect
                    x={frameX}
                    y={frameY + mediaFrame.height - panelHeight}
                    width={mediaFrame.width}
                    height={panelHeight}
                    rx={0}
                    fill="rgba(13, 15, 18, 0.42)"
                />

                {titleLines.length > 0 ? (
                    <SvgText
                        x={frameX + PANEL_PADDING_X}
                        y={frameY + mediaFrame.height - panelHeight + PANEL_PADDING_TOP}
                        fill="#FFFFFF"
                        fontSize={TITLE_FONT_SIZE}
                        fontWeight="700"
                    >
                        {titleLines.map((line, index) => (
                            <TSpan
                                key={`${request.id}-title-${index}`}
                                x={frameX + PANEL_PADDING_X}
                                dy={index === 0 ? 0 : TITLE_LINE_HEIGHT}
                            >
                                {line}
                            </TSpan>
                        ))}
                    </SvgText>
                ) : null}

                <Rect
                    x={frameX + PANEL_PADDING_X}
                    y={frameY + mediaFrame.height - PANEL_PADDING_BOTTOM - 60}
                    width={badgeWidth}
                    height={60}
                    rx={30}
                    ry={30}
                    fill="rgba(255,255,255,0.14)"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={2}
                />
                <SvgText
                    x={frameX + PANEL_PADDING_X + 22}
                    y={frameY + mediaFrame.height - PANEL_PADDING_BOTTOM - 22}
                    fill="#FFFFFF"
                    fontSize={BRAND_FONT_SIZE}
                    fontWeight="700"
                >
                    {appName}
                </SvgText>
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

    const composeInstagramStoryImage = useCallback((imageUri: string, title?: string | null, appName = 'SpotMe') => {
        return new Promise<string>((resolve, reject) => {
            if (pendingRef.current) {
                pendingRef.current.reject(new Error('Instagram Story composition was interrupted.'));
            }
            pendingRef.current = {resolve, reject};
            setRequest({
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                imageUri,
                title,
                appName,
            });
        });
    }, []);

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
