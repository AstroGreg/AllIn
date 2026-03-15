var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image as RNImage, StyleSheet, View } from 'react-native';
import RNFS from 'react-native-fs';
import Svg, { ClipPath, Defs, Image as SvgImage, LinearGradient, Rect, Stop, Text as SvgText, TSpan } from 'react-native-svg';
const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const OVERLAY_BRAND_FONT_SIZE = 58;
const OVERLAY_BRAND_Y = STORY_HEIGHT - 132;
const OVERLAY_BRAND_LOGO_SIZE = 60;
const OVERLAY_BRAND_GAP = 18;
function debugInstagramStoryComposer(stage, details) {
    console.log(`[IGStoryComposer] ${stage}`, details !== null && details !== void 0 ? details : {});
}
function estimateTextWidth(text, fontSize) {
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
function splitWordToFit(word, maxWidth, fontSize) {
    const chunks = [];
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
function normalizeText(text) {
    return String(text !== null && text !== void 0 ? text : '')
        .replace(/\s+/g, ' ')
        .trim();
}
function stripDateText(text) {
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
function trimLineToWidth(text, maxWidth, fontSize) {
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
function wrapTextLines(text, maxWidth, fontSize, maxLines) {
    const trimmed = stripDateText(text);
    if (!trimmed) {
        return [];
    }
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (!words.length) {
        return [];
    }
    const lines = [];
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
function dedupeSubtitle(title, subtitle) {
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
function writeBase64Png(base64, requestId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(requestId || `${Date.now()}`).replace(/[^a-z0-9_-]/gi, '');
        const path = `${RNFS.CachesDirectoryPath}/instagram-story-${safeId}.png`;
        yield RNFS.writeFile(path, base64, 'base64');
        debugInstagramStoryComposer('writeBase64Png.done', {
            requestId,
            path,
            byteLength: base64.length,
        });
        return `file://${path}`;
    });
}
const InstagramStoryComposer = ({ request, onComplete, onError }) => {
    const svgRef = useRef(null);
    const [backgroundPrimed, setBackgroundPrimed] = useState(false);
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);
    const [backgroundFailed, setBackgroundFailed] = useState(false);
    const capturedRequestIdRef = useRef(null);
    useEffect(() => {
        capturedRequestIdRef.current = null;
        setBackgroundFailed(false);
        const isImmediateReady = Boolean(!(request === null || request === void 0 ? void 0 : request.imageUri) || (request === null || request === void 0 ? void 0 : request.mode) === 'overlay');
        setBackgroundPrimed(isImmediateReady);
        setBackgroundLoaded(isImmediateReady);
        debugInstagramStoryComposer('request.reset', {
            requestId: (request === null || request === void 0 ? void 0 : request.id) || null,
            layout: (request === null || request === void 0 ? void 0 : request.layout) || null,
            mode: (request === null || request === void 0 ? void 0 : request.mode) || null,
            imageUri: (request === null || request === void 0 ? void 0 : request.imageUri) || null,
            isImmediateReady,
        });
        if (!(request === null || request === void 0 ? void 0 : request.imageUri) || (request === null || request === void 0 ? void 0 : request.mode) === 'overlay') {
            return;
        }
        let cancelled = false;
        RNImage.getSize(request.imageUri, (width, height) => {
            if (!cancelled) {
                debugInstagramStoryComposer('image.getSize.success', {
                    requestId: request.id,
                    width,
                    height,
                });
                setBackgroundPrimed(true);
            }
        }, (error) => {
            if (!cancelled) {
                debugInstagramStoryComposer('image.getSize.failed', {
                    requestId: request.id,
                    message: String((error === null || error === void 0 ? void 0 : error.message) !== null && (error === null || error === void 0 ? void 0 : error.message) !== void 0 ? error.message : error),
                });
                setBackgroundPrimed(true);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [request === null || request === void 0 ? void 0 : request.id, request === null || request === void 0 ? void 0 : request.imageUri, request === null || request === void 0 ? void 0 : request.layout, request === null || request === void 0 ? void 0 : request.mode]);
    const canvas = useMemo(() => (request === null || request === void 0 ? void 0 : request.mode) === 'overlay'
        ? { width: STORY_WIDTH, height: STORY_HEIGHT }
        : { width: STORY_WIDTH, height: STORY_HEIGHT }, [request === null || request === void 0 ? void 0 : request.mode]);
    const appName = normalizeText((request === null || request === void 0 ? void 0 : request.appName) || 'SpotMe') || 'SpotMe';
    const splashLogoUri = useMemo(() => RNImage.resolveAssetSource(require('../../../android/app/src/main/res/drawable-nodpi/spotme_mark.png')).uri, []);
    const titleText = normalizeText(request === null || request === void 0 ? void 0 : request.title);
    const subtitleText = dedupeSubtitle(request === null || request === void 0 ? void 0 : request.title, request === null || request === void 0 ? void 0 : request.subtitle);
    const titleLines = useMemo(() => {
        if ((request === null || request === void 0 ? void 0 : request.layout) !== 'blog_card') {
            return [];
        }
        return wrapTextLines(titleText, 960 - 96, 50, 2);
    }, [request === null || request === void 0 ? void 0 : request.layout, titleText]);
    const subtitleLines = useMemo(() => {
        if ((request === null || request === void 0 ? void 0 : request.layout) !== 'blog_card') {
            return [];
        }
        return wrapTextLines(subtitleText, 960 - 96, 32, 3);
    }, [request === null || request === void 0 ? void 0 : request.layout, subtitleText]);
    const hasSubtitle = subtitleLines.length > 0;
    const homeTitleLines = useMemo(() => {
        if ((request === null || request === void 0 ? void 0 : request.layout) !== 'home_media_card' && (request === null || request === void 0 ? void 0 : request.layout) !== 'home_media_overlay_card') {
            return [];
        }
        return wrapTextLines(titleText, 860, 48, 2);
    }, [request === null || request === void 0 ? void 0 : request.layout, titleText]);
    const homeSubtitleLines = useMemo(() => {
        if ((request === null || request === void 0 ? void 0 : request.layout) !== 'home_media_card' && (request === null || request === void 0 ? void 0 : request.layout) !== 'home_media_overlay_card') {
            return [];
        }
        return wrapTextLines(subtitleText, 860, 34, 1);
    }, [request === null || request === void 0 ? void 0 : request.layout, subtitleText]);
    const exportStoryImage = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!request || !svgRef.current) {
            return;
        }
        if (capturedRequestIdRef.current === request.id) {
            return;
        }
        capturedRequestIdRef.current = request.id;
        debugInstagramStoryComposer('export.start', {
            requestId: request.id,
            layout: request.layout,
            mode: request.mode,
            imageUri: request.imageUri || null,
            backgroundPrimed,
            backgroundLoaded,
            backgroundFailed,
        });
        try {
            const base64 = yield new Promise((resolve, reject) => {
                var _a;
                const timeout = setTimeout(() => {
                    reject(new Error('Instagram Story composition timed out.'));
                }, 5000);
                (_a = svgRef.current) === null || _a === void 0 ? void 0 : _a.toDataURL((value) => {
                    clearTimeout(timeout);
                    if (!value) {
                        debugInstagramStoryComposer('export.empty', { requestId: request.id });
                        reject(new Error('Could not compose Instagram Story image.'));
                        return;
                    }
                    debugInstagramStoryComposer('export.base64.ready', {
                        requestId: request.id,
                        byteLength: value.length,
                    });
                    resolve(value);
                }, { width: canvas.width, height: canvas.height });
            });
            const fileUri = yield writeBase64Png(base64, request.id);
            debugInstagramStoryComposer('export.complete', {
                requestId: request.id,
                fileUri,
            });
            onComplete(fileUri);
        }
        catch (error) {
            capturedRequestIdRef.current = null;
            debugInstagramStoryComposer('export.failed', {
                requestId: request.id,
                message: String((error === null || error === void 0 ? void 0 : error.message) !== null && (error === null || error === void 0 ? void 0 : error.message) !== void 0 ? error.message : error),
            });
            onError(error instanceof Error ? error : new Error(String(error !== null && error !== void 0 ? error : 'Instagram Story composition failed')));
        }
    }), [backgroundFailed, backgroundLoaded, backgroundPrimed, canvas.height, canvas.width, onComplete, onError, request]);
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
                onError(error instanceof Error ? error : new Error(String(error !== null && error !== void 0 ? error : 'Instagram Story composition failed')));
            });
        }, 140);
        return () => clearTimeout(timer);
    }, [backgroundFailed, backgroundLoaded, backgroundPrimed, exportStoryImage, onError, request]);
    if (!request) {
        return null;
    }
    const isOverlay = request.mode === 'overlay';
    const isBlogCard = request.layout === 'blog_card';
    const isHomeMediaCard = request.layout === 'home_media_card';
    const isHomeMediaOverlayCard = request.layout === 'home_media_overlay_card';
    const isAnyHomeMediaCard = isHomeMediaCard || isHomeMediaOverlayCard;
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
    return (_jsx(View, Object.assign({ pointerEvents: "none", style: styles.hiddenHost }, { children: _jsxs(Svg, Object.assign({ ref: svgRef, width: canvas.width, height: canvas.height, viewBox: `0 0 ${canvas.width} ${canvas.height}` }, { children: [_jsxs(Defs, { children: [_jsx(ClipPath, Object.assign({ id: "blogCardImageClip" }, { children: _jsx(Rect, { x: blogImageX, y: blogImageY, width: blogImageWidth, height: blogImageHeight, rx: 34 }) })), _jsxs(LinearGradient, Object.assign({ id: "homeCardFade", x1: "0", y1: "0", x2: "0", y2: "1" }, { children: [_jsx(Stop, { offset: "0", stopColor: "rgba(8,14,24,0.10)" }), _jsx(Stop, { offset: "1", stopColor: "rgba(8,14,24,0.42)" })] })), _jsxs(LinearGradient, Object.assign({ id: "homeCardButton", x1: "0", y1: "0", x2: "1", y2: "0" }, { children: [_jsx(Stop, { offset: "0", stopColor: "#4E92FF" }), _jsx(Stop, { offset: "1", stopColor: "#377EF5" })] }))] }), !isOverlay ? (_jsxs(_Fragment, { children: [_jsx(Rect, { x: 0, y: 0, width: STORY_WIDTH, height: STORY_HEIGHT, fill: isBlogCard ? (backgroundFailed ? '#0D0F12' : '#122047') : 'rgba(0,0,0,0)' }), hasVisibleBackgroundImage ? (_jsx(SvgImage, { x: 0, y: 0, width: STORY_WIDTH, height: STORY_HEIGHT, href: { uri: request.imageUri }, preserveAspectRatio: "xMidYMid slice", onLoad: () => {
                                debugInstagramStoryComposer('image.onLoad', {
                                    requestId: request.id,
                                    layout: request.layout,
                                });
                                setBackgroundLoaded(true);
                            }, onError: () => {
                                setBackgroundFailed(true);
                                debugInstagramStoryComposer('image.onError', {
                                    requestId: request.id,
                                    layout: request.layout,
                                    imageUri: request.imageUri,
                                });
                                onError(new Error('Could not load image for Instagram Story sharing.'));
                            } })) : null, isHomeMediaCard && hasVisibleBackgroundImage ? (_jsx(Rect, { x: 0, y: 0, width: STORY_WIDTH, height: STORY_HEIGHT, fill: "rgba(4,10,16,0.18)" })) : null, isHomeMediaCard && hasVisibleBackgroundImage ? (_jsx(Rect, { x: 0, y: 0, width: STORY_WIDTH, height: STORY_HEIGHT, fill: "url(#homeCardFade)" })) : null] })) : (_jsx(Rect, { x: 0, y: 0, width: STORY_WIDTH, height: STORY_HEIGHT, fill: "rgba(0,0,0,0)" })), isOverlay ? (_jsxs(_Fragment, { children: [_jsx(SvgText, Object.assign({ x: overlayBrandStartX, y: OVERLAY_BRAND_Y, fill: "#FFFFFF", fontSize: OVERLAY_BRAND_FONT_SIZE, fontWeight: "700", stroke: "rgba(0,0,0,0.40)", strokeWidth: 2 }, { children: appName })), _jsx(SvgImage, { x: overlayBrandStartX + overlayTextWidth + OVERLAY_BRAND_GAP, y: overlayLogoY, width: OVERLAY_BRAND_LOGO_SIZE, height: OVERLAY_BRAND_LOGO_SIZE, href: { uri: splashLogoUri }, preserveAspectRatio: "xMidYMid meet" })] })) : null, isBlogCard ? (_jsxs(_Fragment, { children: [_jsx(Rect, { x: blogBadgeX, y: blogBadgeY, width: blogBadgeWidth, height: blogBadgeHeight, rx: 22, fill: "rgba(78,146,255,0.96)" }), _jsx(SvgImage, { x: blogBadgeX + 16, y: blogBadgeY + (blogBadgeHeight - blogBadgeLogoSize) / 2, width: blogBadgeLogoSize, height: blogBadgeLogoSize, href: { uri: splashLogoUri }, preserveAspectRatio: "xMidYMid meet" }), _jsx(SvgText, Object.assign({ x: blogBadgeX + 16 + blogBadgeLogoSize + blogBadgeGap, y: blogBadgeY + 47, fill: "#FFFFFF", fontSize: blogBadgeFontSize, fontWeight: "700" }, { children: appName })), _jsx(Rect, { x: blogFrameX, y: blogFrameY, width: blogFrameWidth, height: blogFrameHeight, rx: 42, fill: "#F8FAFC" }), request.imageUri && !backgroundFailed ? (_jsx(SvgImage, { x: blogImageX, y: blogImageY, width: blogImageWidth, height: blogImageHeight, href: { uri: request.imageUri }, preserveAspectRatio: "xMidYMid slice", clipPath: "url(#blogCardImageClip)", onLoad: () => setBackgroundLoaded(true), onError: () => {
                                debugInstagramStoryComposer('image.onLoad', {
                                    requestId: request.id,
                                    layout: request.layout,
                                });
                                setBackgroundLoaded(true);
                            }, onError: () => {
                                setBackgroundFailed(true);
                                debugInstagramStoryComposer('image.onError', {
                                    requestId: request.id,
                                    layout: request.layout,
                                    imageUri: request.imageUri,
                                });
                                onError(new Error('Could not load image for Instagram Story sharing.'));
                            } })) : (_jsx(Rect, { x: blogImageX, y: blogImageY, width: blogImageWidth, height: blogImageHeight, rx: 34, fill: "#2B3B67" })), _jsx(Rect, { x: blogCardX, y: blogCardY, width: blogCardWidth, height: blogCardHeight, rx: 40, fill: "#F3F6FB", stroke: "rgba(255,255,255,0.18)", strokeWidth: 2 }), titleLines.length > 0 ? (_jsx(SvgText, Object.assign({ x: blogCardInnerX, y: blogTitleY, fill: "#153468", fontSize: 50, fontWeight: "700" }, { children: titleLines.map((line, index) => (_jsx(TSpan, Object.assign({ x: blogCardInnerX, dy: index === 0 ? 0 : 60 }, { children: line }), `${request.id}-title-${index}`))) }))) : null, subtitleLines.length > 0 ? (_jsx(SvgText, Object.assign({ x: blogCardInnerX, y: blogSubtitleY, fill: "#516A90", fontSize: 32, fontWeight: "400" }, { children: subtitleLines.map((line, index) => (_jsx(TSpan, Object.assign({ x: blogCardInnerX, dy: index === 0 ? 0 : 42 }, { children: line }), `${request.id}-subtitle-${index}`))) }))) : null] })) : null, isAnyHomeMediaCard ? (_jsxs(_Fragment, { children: [_jsx(Rect, { x: brandPillX, y: brandPillY, width: brandPillWidth, height: brandPillHeight, rx: 24, fill: "rgba(78,146,255,0.95)" }), _jsx(SvgImage, { x: brandPillX + 18, y: brandPillY + (brandPillHeight - brandLogoSize) / 2, width: brandLogoSize, height: brandLogoSize, href: { uri: splashLogoUri }, preserveAspectRatio: "xMidYMid meet" }), _jsx(SvgText, Object.assign({ x: brandPillX + 18 + brandLogoSize + brandGap, y: brandPillY + 54, fill: "#FFFFFF", fontSize: brandFontSize, fontWeight: "700" }, { children: appName })), _jsx(Rect, { x: homeCardX, y: homeCardY, width: homeCardWidth, height: homeCardHeight, rx: 40, fill: "rgba(18,23,36,0.34)", stroke: "rgba(255,255,255,0.65)", strokeWidth: 3 }), homeTitleLines.length > 0 ? (_jsx(SvgText, Object.assign({ x: homeCardCenterX, y: homeTitleY, fill: "#FFFFFF", fontSize: 48, fontWeight: "700", textAnchor: "middle" }, { children: homeTitleLines.map((line, index) => (_jsx(TSpan, Object.assign({ x: homeCardCenterX, dy: index === 0 ? 0 : 58 }, { children: index === 0 ? `Event: ${line}` : line }), `${request.id}-home-title-${index}`))) }))) : null, homeSubtitleLines.length > 0 ? (_jsx(SvgText, Object.assign({ x: homeCardCenterX, y: homeSubtitleY, fill: "rgba(255,255,255,0.92)", fontSize: 34, fontWeight: "500", textAnchor: "middle" }, { children: _jsx(TSpan, Object.assign({ x: homeCardCenterX, dy: 0 }, { children: `Match: ${homeSubtitleLines[0]}` })) }))) : null, _jsx(Rect, { x: ctaX, y: ctaY, width: ctaWidth, height: ctaHeight, rx: 30, fill: "url(#homeCardButton)" }), _jsx(SvgText, Object.assign({ x: STORY_WIDTH / 2, y: ctaY + 59, fill: "#FFFFFF", fontSize: 36, fontWeight: "700", textAnchor: "middle" }, { children: `Get your race photos on ${appName}` }))] })) : null] })) })));
};
export function useInstagramStoryImageComposer() {
    const [request, setRequest] = useState(null);
    const pendingRef = useRef(null);
    const composeInstagramStoryImage = useCallback((imageUri, title, appName = 'SpotMe', subtitle, options) => {
        return new Promise((resolve, reject) => {
            if (pendingRef.current) {
                pendingRef.current.reject(new Error('Instagram Story composition was interrupted.'));
            }
            pendingRef.current = { resolve, reject };
            setRequest({
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                imageUri: imageUri !== null && imageUri !== void 0 ? imageUri : null,
                title,
                subtitle,
                appName,
                mode: (options === null || options === void 0 ? void 0 : options.mode) === 'overlay' ? 'overlay' : 'background',
                layout: (options === null || options === void 0 ? void 0 : options.layout) === 'blog_card'
                    ? 'blog_card'
                    : (options === null || options === void 0 ? void 0 : options.layout) === 'home_media_card'
                        ? 'home_media_card'
                        : (options === null || options === void 0 ? void 0 : options.layout) === 'home_media_overlay_card'
                            ? 'home_media_overlay_card'
                            : 'badge',
            });
        });
    }, []);
    const handleComplete = useCallback((uri) => {
        debugInstagramStoryComposer('hook.resolve', { uri });
        var _a;
        (_a = pendingRef.current) === null || _a === void 0 ? void 0 : _a.resolve(uri);
        pendingRef.current = null;
        setRequest(null);
    }, []);
    const handleError = useCallback((error) => {
        debugInstagramStoryComposer('hook.reject', {
            message: String((error === null || error === void 0 ? void 0 : error.message) !== null && (error === null || error === void 0 ? void 0 : error.message) !== void 0 ? error.message : error),
        });
        var _a;
        (_a = pendingRef.current) === null || _a === void 0 ? void 0 : _a.reject(error);
        pendingRef.current = null;
        setRequest(null);
    }, []);
    return {
        composeInstagramStoryImage,
        composerElement: (_jsx(InstagramStoryComposer, { request: request, onComplete: handleComplete, onError: handleError })),
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
