import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image as RNImage, StyleSheet, View} from 'react-native';
import RNFS from 'react-native-fs';
import Svg, {
    ClipPath,
    Defs,
    Image as SvgImage,
    Path,
    Rect,
    Text as SvgText,
    TSpan,
} from 'react-native-svg';
import Colors from '../../constants/Colors';

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const STORY_PADDING_X = 52;
const STORY_PADDING_TOP = 74;
const STORY_PADDING_BOTTOM = 56;
const TITLE_FONT_SIZE = 50;
const TITLE_LINE_HEIGHT = 60;
const TITLE_MAX_LINES = 3;
const BADGE_HEIGHT = 120;
const BADGE_RADIUS = 60;
const BADGE_TEXT_INSET_X = 40;
const BADGE_FONT_SIZE = 60;
const BADGE_ICON_SIZE = 68;
const BADGE_ICON_GAP = 20;
const APP_MARK_VIEWBOX = 20;
const APP_MARK_PATH = 'M10.0003 1.66669C5.40033 1.66669 1.66699 5.40002 1.66699 10C1.66699 14.6 5.40033 18.3334 10.0003 18.3334C14.6003 18.3334 18.3337 14.6 18.3337 10C18.3337 5.40002 14.6003 1.66669 10.0003 1.66669ZM14.167 14.5584C12.742 14.5584 11.4087 13.9417 10.342 12.8C9.13366 13.8917 7.55866 14.5584 5.83366 14.5584C5.49199 14.5584 5.20866 14.275 5.20866 13.9334C5.20866 13.5917 5.49199 13.3084 5.83366 13.3084C8.72533 13.3084 11.117 11.0167 11.4253 8.08335H10.0003H5.84199C5.50033 8.08335 5.21699 7.80002 5.21699 7.45835C5.21699 7.11669 5.50033 6.84169 5.84199 6.84169H9.37533V6.06669C9.37533 5.72502 9.65866 5.44169 10.0003 5.44169C10.342 5.44169 10.6253 5.72502 10.6253 6.06669V6.84169H12.0337C12.0503 6.84169 12.067 6.83335 12.0837 6.83335C12.1003 6.83335 12.117 6.84169 12.1337 6.84169H14.1587C14.5003 6.84169 14.7837 7.12502 14.7837 7.46669C14.7837 7.80835 14.5003 8.09169 14.1587 8.09169H12.6753C12.5503 9.51669 12.017 10.825 11.2003 11.8917C12.0337 12.8167 13.0753 13.3167 14.167 13.3167C14.5087 13.3167 14.792 13.6 14.792 13.9417C14.792 14.2834 14.5087 14.5584 14.167 14.5584Z';

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

function stripDateText(text: string) {
    let output = String(text || '').trim();
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

function wrapTitleLines(text: string, maxWidth: number, fontSize: number, maxLines: number) {
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
                setImageSize({width: STORY_WIDTH, height: STORY_HEIGHT});
            },
        );
    }, [request?.id, request?.imageUri]);

    const titleLines = useMemo(() => {
        return wrapTitleLines(
            String(request?.title || ''),
            STORY_WIDTH - STORY_PADDING_X * 2 - 220,
            TITLE_FONT_SIZE,
            TITLE_MAX_LINES,
        );
    }, [request?.title]);

    const appName = String(request?.appName || 'SpotMe').trim() || 'SpotMe';
    const badgeWidth = useMemo(() => {
        return estimateTextWidth(appName, BADGE_FONT_SIZE)
            + BADGE_TEXT_INSET_X * 2
            + BADGE_ICON_GAP
            + BADGE_ICON_SIZE;
    }, [appName]);
    const badgeX = STORY_WIDTH - STORY_PADDING_X - badgeWidth;
    const badgeY = STORY_HEIGHT - STORY_PADDING_BOTTOM - BADGE_HEIGHT;
    const badgeIconX = badgeX + badgeWidth - BADGE_TEXT_INSET_X - BADGE_ICON_SIZE;
    const badgeIconY = badgeY + (BADGE_HEIGHT - BADGE_ICON_SIZE) / 2;

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
                        <Rect x={0} y={0} width={STORY_WIDTH} height={STORY_HEIGHT} />
                    </ClipPath>
                </Defs>

                <SvgImage
                    x={0}
                    y={0}
                    width={STORY_WIDTH}
                    height={STORY_HEIGHT}
                    href={{uri: request.imageUri}}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#storyMediaClip)"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => onError(new Error('Could not load image for Instagram Story sharing.'))}
                />

                {titleLines.length > 0 ? (
                    <SvgText
                        x={STORY_PADDING_X}
                        y={STORY_PADDING_TOP + TITLE_FONT_SIZE}
                        fill="#FFFFFF"
                        fontSize={TITLE_FONT_SIZE}
                        fontWeight="700"
                        stroke="rgba(0,0,0,0.45)"
                        strokeWidth={2}
                    >
                        {titleLines.map((line, index) => (
                            <TSpan
                                key={`${request.id}-title-${index}`}
                                x={STORY_PADDING_X}
                                dy={index === 0 ? 0 : TITLE_LINE_HEIGHT}
                            >
                                {line}
                            </TSpan>
                        ))}
                    </SvgText>
                ) : null}

                <Rect
                    x={badgeX}
                    y={badgeY}
                    width={badgeWidth}
                    height={BADGE_HEIGHT}
                    rx={BADGE_RADIUS}
                    ry={BADGE_RADIUS}
                    fill="rgba(255,255,255,0.14)"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={2}
                />
                <SvgText
                    x={badgeX + BADGE_TEXT_INSET_X}
                    y={badgeY + BADGE_HEIGHT / 2 + BADGE_FONT_SIZE * 0.34}
                    fill={Colors.primaryColor}
                    fontSize={BADGE_FONT_SIZE}
                    fontWeight="700"
                >
                    {appName}
                </SvgText>
                <Path
                    d={APP_MARK_PATH}
                    fill={Colors.primaryColor}
                    transform={`translate(${badgeIconX} ${badgeIconY}) scale(${BADGE_ICON_SIZE / APP_MARK_VIEWBOX})`}
                />
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
