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
import Images from '../../constants/Images';

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const STORY_PADDING_X = 52;
const STORY_PADDING_TOP = 74;
const TITLE_FONT_SIZE = 50;
const TITLE_LINE_HEIGHT = 60;
const BADGE_HEIGHT = 120;
const BADGE_RADIUS = 60;
const BADGE_TEXT_INSET_X = 40;
const BADGE_FONT_SIZE = 60;
const BADGE_ICON_SIZE = 68;
const BADGE_ICON_GAP = 20;

export type InstagramStoryComposeRequest = {
    id: string;
    imageUri: string;
    title?: string | null;
    subtitle?: string | null;
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

function wrapTitleLines(text: string, maxWidth: number, fontSize: number) {
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
            const wordChunks = splitWordToFit(word, maxWidth, fontSize);
            lines.push(...wordChunks);
            continue;
        }
        current = word;
    }

    if (current) {
        lines.push(current);
    }

    return lines;
}

function buildRightRoundedRectPath(x: number, y: number, width: number, height: number, radius: number) {
    const safeRadius = Math.max(0, Math.min(radius, height / 2, width));
    const right = x + width;
    const bottom = y + height;
    if (safeRadius <= 0) {
        return `M ${x} ${y} H ${right} V ${bottom} H ${x} Z`;
    }
    return [
        `M ${x} ${y}`,
        `H ${right - safeRadius}`,
        `A ${safeRadius} ${safeRadius} 0 0 1 ${right} ${y + safeRadius}`,
        `V ${bottom - safeRadius}`,
        `A ${safeRadius} ${safeRadius} 0 0 1 ${right - safeRadius} ${bottom}`,
        `H ${x}`,
        'Z',
    ].join(' ');
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
            STORY_WIDTH / 2 - STORY_PADDING_X,
            TITLE_FONT_SIZE,
        );
    }, [request?.title]);
    const titleFirstLineY = STORY_PADDING_TOP * 2 + TITLE_FONT_SIZE;

    const appName = String(request?.appName || 'SpotMe').trim() || 'SpotMe';
    const appLogoUri = useMemo(() => RNImage.resolveAssetSource(Images.logo).uri, []);
    const badgeWidth = useMemo(() => {
        return estimateTextWidth(appName, BADGE_FONT_SIZE)
            + BADGE_TEXT_INSET_X * 2
            + BADGE_ICON_GAP
            + BADGE_ICON_SIZE;
    }, [appName]);
    const badgeX = 0;
    const badgeY = (STORY_HEIGHT - BADGE_HEIGHT) / 2 + BADGE_HEIGHT;
    const badgeIconX = badgeX + badgeWidth - BADGE_TEXT_INSET_X - BADGE_ICON_SIZE;
    const badgeIconY = badgeY + (BADGE_HEIGHT - BADGE_ICON_SIZE) / 2;
    const badgePath = useMemo(
        () => buildRightRoundedRectPath(badgeX, badgeY, badgeWidth, BADGE_HEIGHT, BADGE_RADIUS),
        [badgeX, badgeY, badgeWidth],
    );

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
                        x={STORY_WIDTH - STORY_PADDING_X}
                        y={titleFirstLineY}
                        fill="#FFFFFF"
                        fontSize={TITLE_FONT_SIZE}
                        fontWeight="700"
                        fontFamily="Anton"
                        stroke="rgba(0,0,0,0.45)"
                        strokeWidth={2}
                        textAnchor="end"
                    >
                        {titleLines.map((line, index) => (
                            <TSpan
                                key={`${request.id}-title-${index}`}
                                x={STORY_WIDTH - STORY_PADDING_X}
                                dy={index === 0 ? 0 : TITLE_LINE_HEIGHT}
                            >
                                {line}
                            </TSpan>
                        ))}
                    </SvgText>
                ) : null}

                <Path d={badgePath} fill="rgba(60,130,246,0.50)" />
                <SvgText
                    x={badgeX + BADGE_TEXT_INSET_X}
                    y={badgeY + BADGE_HEIGHT / 2 + BADGE_FONT_SIZE * 0.34}
                    fill="#FFFFFF"
                    fontSize={BADGE_FONT_SIZE}
                    fontWeight="700"
                >
                    {appName}
                </SvgText>
                <SvgImage
                    x={badgeIconX}
                    y={badgeIconY}
                    width={BADGE_ICON_SIZE}
                    height={BADGE_ICON_SIZE}
                    href={{uri: appLogoUri}}
                    preserveAspectRatio="xMidYMid meet"
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

    const composeInstagramStoryImage = useCallback((imageUri: string, title?: string | null, appName = 'SpotMe', subtitle?: string | null) => {
        return new Promise<string>((resolve, reject) => {
            if (pendingRef.current) {
                pendingRef.current.reject(new Error('Instagram Story composition was interrupted.'));
            }
            pendingRef.current = {resolve, reject};
            setRequest({
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                imageUri,
                title,
                subtitle,
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
