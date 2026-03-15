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
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, Share, Text, TouchableOpacity, View, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// useFocusEffect not available in some runtime bundles; use navigation listeners instead.
import FastImage from 'react-native-fast-image';
import { createStyles } from './PhotoDetailScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { ApiError, attachMediaToPost, createMediaIssueRequest, createPost, getAiFeedbackLabel, getMediaById, postAiFeedbackLabel, recordDownload, recordMediaView } from '../../services/apiGateway';
import Video from 'react-native-video';
import ShimmerEffect from '../../components/shimmerEffect/ShimmerEffect';
import { getApiBaseUrl, getHlsBaseUrl } from '../../constants/RuntimeConfig';
import Slider from '@react-native-community/slider';
import Icons from '../../constants/Icons';
import { useTranslation } from 'react-i18next';
import { useInstagramStoryImageComposer } from '../../components/share/InstagramStoryComposer';
import { shareMediaToInstagramStory } from '../../components/share/instagramStoryShare';
import { usePreventMediaCapture } from '../../utils/usePreventMediaCapture';
const PhotoDetailScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const isDarkSurface = String(colors.backgroundColor || '').toLowerCase() !== '#ffffff';
    const headerIconColor = isDarkSurface ? colors.pureWhite : colors.primaryColor;
    const { apiAccessToken } = useAuth();
    const { eventNameById } = useEvents();
    const { composeInstagramStoryImage, composerElement } = useInstagramStoryImageComposer();
    usePreventMediaCapture(true);
    const perfStartedAtRef = useRef(Date.now());
    const [perfReadyElapsedMs, setPerfReadyElapsedMs] = useState(null);
    const eventTitle = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.eventTitle) || '';
    const blogTitleFromRoute = ((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.blogTitle) || ((_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.postTitle) || ((_e = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.post) === null || _e === void 0 ? void 0 : _e.title) || '';
    const legacyPhoto = (_g = (_f = route === null || route === void 0 ? void 0 : route.params) === null || _f === void 0 ? void 0 : _f.photo) !== null && _g !== void 0 ? _g : null;
    const media = (_j = (_h = route === null || route === void 0 ? void 0 : route.params) === null || _h === void 0 ? void 0 : _h.media) !== null && _j !== void 0 ? _j : null;
    const startAt = Number((_l = (_k = route === null || route === void 0 ? void 0 : route.params) === null || _k === void 0 ? void 0 : _k.startAt) !== null && _l !== void 0 ? _l : 0);
    const preferredVideoUrl = (_o = (_m = route === null || route === void 0 ? void 0 : route.params) === null || _m === void 0 ? void 0 : _m.preferredVideoUrl) !== null && _o !== void 0 ? _o : null;
    const pickString = useCallback((...values) => {
        for (const value of values) {
            if (value === null || value === undefined)
                continue;
            const str = String(value).trim();
            if (str)
                return str;
        }
        return null;
    }, []);
    const routeMedia = useMemo(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
        const routeMediaId = pickString(media === null || media === void 0 ? void 0 : media.id, media === null || media === void 0 ? void 0 : media.mediaId, media === null || media === void 0 ? void 0 : media.media_id, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.id, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.mediaId, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.media_id, (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.mediaId, (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.media_id);
        const routeEventId = pickString(media === null || media === void 0 ? void 0 : media.eventId, media === null || media === void 0 ? void 0 : media.event_id, media === null || media === void 0 ? void 0 : media.competition_id, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.eventId, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.event_id, (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.eventId, (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.event_id);
        const routeCompetitionId = pickString(media === null || media === void 0 ? void 0 : media.competitionId, media === null || media === void 0 ? void 0 : media.competition_id, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.competitionId, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.competition_id, (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.competitionId, (_f = route === null || route === void 0 ? void 0 : route.params) === null || _f === void 0 ? void 0 : _f.competition_id);
        const routeCheckpointId = pickString(media === null || media === void 0 ? void 0 : media.checkpointId, media === null || media === void 0 ? void 0 : media.checkpoint_id, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.checkpointId, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.checkpoint_id, (_g = route === null || route === void 0 ? void 0 : route.params) === null || _g === void 0 ? void 0 : _g.checkpointId, (_h = route === null || route === void 0 ? void 0 : route.params) === null || _h === void 0 ? void 0 : _h.checkpoint_id);
        const typeToken = String((_k = pickString(media === null || media === void 0 ? void 0 : media.type, media === null || media === void 0 ? void 0 : media.mediaType, media === null || media === void 0 ? void 0 : media.media_type, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.type, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.mediaType, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.media_type, (_j = route === null || route === void 0 ? void 0 : route.params) === null || _j === void 0 ? void 0 : _j.type, 'image')) !== null && _k !== void 0 ? _k : 'image').toLowerCase();
        const normalizedType = typeToken === 'video' ? 'video' : 'image';
        const thumbnailUrl = pickString(media === null || media === void 0 ? void 0 : media.thumbnailUrl, media === null || media === void 0 ? void 0 : media.thumbnail_url, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.thumbnailUrl, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.thumbnail_url, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.thumbnail, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.photo);
        const previewUrl = pickString(media === null || media === void 0 ? void 0 : media.previewUrl, media === null || media === void 0 ? void 0 : media.preview_url, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.previewUrl, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.preview_url, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.thumbnail, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.photo);
        const originalUrl = pickString(media === null || media === void 0 ? void 0 : media.originalUrl, media === null || media === void 0 ? void 0 : media.original_url, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.originalUrl, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.original_url, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.thumbnail, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.photo);
        const fullUrl = pickString(media === null || media === void 0 ? void 0 : media.fullUrl, media === null || media === void 0 ? void 0 : media.full_url, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.fullUrl, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.full_url);
        const rawUrl = pickString(media === null || media === void 0 ? void 0 : media.rawUrl, media === null || media === void 0 ? void 0 : media.raw_url, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.rawUrl, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.raw_url);
        const vp9Url = pickString(media === null || media === void 0 ? void 0 : media.vp9Url, media === null || media === void 0 ? void 0 : media.vp9_url, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.vp9Url, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.vp9_url);
        const av1Url = pickString(media === null || media === void 0 ? void 0 : media.av1Url, media === null || media === void 0 ? void 0 : media.av1_url, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.av1Url, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.av1_url);
        const hlsManifestPath = pickString(media === null || media === void 0 ? void 0 : media.hlsManifestPath, media === null || media === void 0 ? void 0 : media.hls_manifest_path, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.hlsManifestPath, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.hls_manifest_path);
        const matchTypeValue = pickString(media === null || media === void 0 ? void 0 : media.matchType, media === null || media === void 0 ? void 0 : media.match_type, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.matchType, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.match_type, (_l = route === null || route === void 0 ? void 0 : route.params) === null || _l === void 0 ? void 0 : _l.matchType, (_m = route === null || route === void 0 ? void 0 : route.params) === null || _m === void 0 ? void 0 : _m.match_type);
        const assets = Array.isArray(media === null || media === void 0 ? void 0 : media.assets)
            ? media.assets
            : Array.isArray(legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.assets)
                ? legacyPhoto.assets
                : [];
        return {
            id: routeMediaId,
            mediaId: routeMediaId,
            media_id: routeMediaId,
            eventId: routeEventId,
            event_id: routeEventId,
            competitionId: routeCompetitionId,
            competition_id: routeCompetitionId,
            checkpointId: routeCheckpointId,
            checkpoint_id: routeCheckpointId,
            checkpoint_label: pickString(media === null || media === void 0 ? void 0 : media.checkpoint_label, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.checkpoint_label, (_o = route === null || route === void 0 ? void 0 : route.params) === null || _o === void 0 ? void 0 : _o.checkpoint_label),
            checkpoint_name: pickString(media === null || media === void 0 ? void 0 : media.checkpoint_name, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.checkpoint_name, (_p = route === null || route === void 0 ? void 0 : route.params) === null || _p === void 0 ? void 0 : _p.checkpoint_name),
            course_label: pickString(media === null || media === void 0 ? void 0 : media.course_label, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.course_label, (_q = route === null || route === void 0 ? void 0 : route.params) === null || _q === void 0 ? void 0 : _q.course_label),
            course_name: pickString(media === null || media === void 0 ? void 0 : media.course_name, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.course_name, (_r = route === null || route === void 0 ? void 0 : route.params) === null || _r === void 0 ? void 0 : _r.course_name),
            segment_label: pickString(media === null || media === void 0 ? void 0 : media.segment_label, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.segment_label, (_s = route === null || route === void 0 ? void 0 : route.params) === null || _s === void 0 ? void 0 : _s.segment_label),
            segment_name: pickString(media === null || media === void 0 ? void 0 : media.segment_name, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.segment_name, (_t = route === null || route === void 0 ? void 0 : route.params) === null || _t === void 0 ? void 0 : _t.segment_name),
            type: normalizedType,
            thumbnailUrl,
            thumbnail_url: thumbnailUrl,
            previewUrl,
            preview_url: previewUrl,
            originalUrl,
            original_url: originalUrl,
            fullUrl,
            full_url: fullUrl,
            rawUrl,
            raw_url: rawUrl,
            vp9Url,
            vp9_url: vp9Url,
            av1Url,
            av1_url: av1Url,
            hlsManifestPath,
            hls_manifest_path: hlsManifestPath,
            matchType: matchTypeValue,
            match_type: matchTypeValue,
            matchPercent: Number((_w = (_v = (_u = media === null || media === void 0 ? void 0 : media.matchPercent) !== null && _u !== void 0 ? _u : media === null || media === void 0 ? void 0 : media.match_percent) !== null && _v !== void 0 ? _v : legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.matchPercent) !== null && _w !== void 0 ? _w : legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.match_percent),
            views_count: Number((_0 = (_z = (_y = (_x = media === null || media === void 0 ? void 0 : media.views_count) !== null && _x !== void 0 ? _x : media === null || media === void 0 ? void 0 : media.views) !== null && _y !== void 0 ? _y : legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.views_count) !== null && _z !== void 0 ? _z : legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.views) !== null && _0 !== void 0 ? _0 : 0),
            assets,
            title: pickString(media === null || media === void 0 ? void 0 : media.title, legacyPhoto === null || legacyPhoto === void 0 ? void 0 : legacyPhoto.title),
        };
    }, [
        legacyPhoto,
        media,
        pickString,
        (_p = route === null || route === void 0 ? void 0 : route.params) === null || _p === void 0 ? void 0 : _p.checkpointId,
        (_q = route === null || route === void 0 ? void 0 : route.params) === null || _q === void 0 ? void 0 : _q.checkpoint_id,
        (_r = route === null || route === void 0 ? void 0 : route.params) === null || _r === void 0 ? void 0 : _r.checkpoint_label,
        (_s = route === null || route === void 0 ? void 0 : route.params) === null || _s === void 0 ? void 0 : _s.checkpoint_name,
        (_t = route === null || route === void 0 ? void 0 : route.params) === null || _t === void 0 ? void 0 : _t.competitionId,
        (_u = route === null || route === void 0 ? void 0 : route.params) === null || _u === void 0 ? void 0 : _u.competition_id,
        (_v = route === null || route === void 0 ? void 0 : route.params) === null || _v === void 0 ? void 0 : _v.course_label,
        (_w = route === null || route === void 0 ? void 0 : route.params) === null || _w === void 0 ? void 0 : _w.course_name,
        (_x = route === null || route === void 0 ? void 0 : route.params) === null || _x === void 0 ? void 0 : _x.eventId,
        (_y = route === null || route === void 0 ? void 0 : route.params) === null || _y === void 0 ? void 0 : _y.event_id,
        (_z = route === null || route === void 0 ? void 0 : route.params) === null || _z === void 0 ? void 0 : _z.matchType,
        (_0 = route === null || route === void 0 ? void 0 : route.params) === null || _0 === void 0 ? void 0 : _0.match_type,
        (_1 = route === null || route === void 0 ? void 0 : route.params) === null || _1 === void 0 ? void 0 : _1.mediaId,
        (_2 = route === null || route === void 0 ? void 0 : route.params) === null || _2 === void 0 ? void 0 : _2.media_id,
        (_3 = route === null || route === void 0 ? void 0 : route.params) === null || _3 === void 0 ? void 0 : _3.segment_label,
        (_4 = route === null || route === void 0 ? void 0 : route.params) === null || _4 === void 0 ? void 0 : _4.segment_name,
        (_5 = route === null || route === void 0 ? void 0 : route.params) === null || _5 === void 0 ? void 0 : _5.type,
    ]);
    const mediaId = routeMedia.id;
    const eventId = routeMedia.eventId;
    const matchType = routeMedia.matchType;
    const effectiveMediaId = mediaId;
    const resolvedMediaId = mediaId;
    useEffect(() => {
        if (!apiAccessToken)
            return;
        const id = String(resolvedMediaId || '').trim();
        if (!id)
            return;
        recordMediaView(apiAccessToken, id).catch(() => { });
    }, [apiAccessToken, resolvedMediaId]);
    useEffect(() => {
        perfStartedAtRef.current = Date.now();
        setPerfReadyElapsedMs(null);
        setIsImageLoading(!isVideo);
        setIsFullImageLoaded(false);
    }, [resolvedMediaId, isVideo]);
    const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
    const hlsBaseUrl = useMemo(() => getHlsBaseUrl(), []);
    const toAbsoluteUrl = useCallback((value) => {
        if (!value)
            return null;
        const str = String(value);
        if (str.startsWith('http://') || str.startsWith('https://'))
            return str;
        return `${apiBaseUrl}${str.startsWith('/') ? '' : '/'}${str}`;
    }, [apiBaseUrl]);
    const normalizeMedia = useCallback((item) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        return ({
            id: item.media_id,
            mediaId: item.media_id,
            media_id: item.media_id,
            eventId: item.event_id,
            event_id: item.event_id,
            competitionId: (_a = item.competition_id) !== null && _a !== void 0 ? _a : null,
            competition_id: (_b = item.competition_id) !== null && _b !== void 0 ? _b : null,
            checkpointId: (_c = item.checkpoint_id) !== null && _c !== void 0 ? _c : null,
            checkpoint_id: (_d = item.checkpoint_id) !== null && _d !== void 0 ? _d : null,
            checkpoint_label: (_e = item.checkpoint_label) !== null && _e !== void 0 ? _e : null,
            checkpoint_name: (_f = item.checkpoint_name) !== null && _f !== void 0 ? _f : null,
            course_label: (_g = item.course_label) !== null && _g !== void 0 ? _g : null,
            course_name: (_h = item.course_name) !== null && _h !== void 0 ? _h : null,
            segment_label: (_j = item.segment_label) !== null && _j !== void 0 ? _j : null,
            segment_name: (_k = item.segment_name) !== null && _k !== void 0 ? _k : null,
            thumbnailUrl: item.thumbnail_url,
            thumbnail_url: item.thumbnail_url,
            previewUrl: item.preview_url,
            preview_url: item.preview_url,
            originalUrl: item.original_url,
            original_url: item.original_url,
            fullUrl: item.full_url,
            full_url: item.full_url,
            rawUrl: item.raw_url,
            raw_url: item.raw_url,
            vp9Url: item.vp9_url,
            vp9_url: item.vp9_url,
            av1Url: item.av1_url,
            av1_url: item.av1_url,
            hlsManifestPath: item.hls_manifest_path,
            hls_manifest_path: item.hls_manifest_path,
            type: item.type,
            assets: (_l = item.assets) !== null && _l !== void 0 ? _l : [],
            title: (_m = item.title) !== null && _m !== void 0 ? _m : null,
            views_count: Number((_o = item.views_count) !== null && _o !== void 0 ? _o : 0),
        });
    }, []);
    const [resolvedMedia, setResolvedMedia] = useState(null);
    const activeMedia = resolvedMedia !== null && resolvedMedia !== void 0 ? resolvedMedia : routeMedia;
    const matchPercent = Number.isFinite(Number((_6 = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.matchPercent) !== null && _6 !== void 0 ? _6 : activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.match_percent))
        ? Number((_7 = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.matchPercent) !== null && _7 !== void 0 ? _7 : activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.match_percent)
        : null;
    const mediaViews = Number((_9 = (_8 = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.views_count) !== null && _8 !== void 0 ? _8 : routeMedia === null || routeMedia === void 0 ? void 0 : routeMedia.views_count) !== null && _9 !== void 0 ? _9 : 0);
    const mediaViewsLabel = Number.isFinite(mediaViews) ? mediaViews.toLocaleString() : '0';
    const normalizeHeaderLabel = useCallback((value) => {
        const raw = String(value !== null && value !== void 0 ? value : '').trim();
        if (!raw)
            return '';
        const lowered = raw.toLowerCase();
        if (lowered === 'event')
            return '';
        return raw;
    }, []);
    const headerLabel = useMemo(() => {
        const blogTitle = normalizeHeaderLabel(blogTitleFromRoute);
        if (blogTitle)
            return blogTitle;
        const routeEventTitle = normalizeHeaderLabel(eventTitle);
        if (routeEventTitle)
            return routeEventTitle;
        const resolvedEventName = normalizeHeaderLabel(eventNameById(eventId));
        if (resolvedEventName)
            return resolvedEventName;
        return '';
    }, [blogTitleFromRoute, eventId, eventNameById, eventTitle, normalizeHeaderLabel]);
    const getInstagramShareMatchLabel = useCallback((rawMatchType) => {
        const key = String(rawMatchType !== null && rawMatchType !== void 0 ? rawMatchType : '').trim().toLowerCase();
        if (!key)
            return null;
        if (key === 'combined')
            return t('Face + Chest');
        if (key === 'face' || key === 'facial')
            return t('Face');
        if (key === 'bib' || key === 'chest')
            return t('Chest');
        if (key === 'context')
            return t('Context');
        return null;
    }, [t]);
    const instagramStoryTitle = useMemo(() => {
        var _a;
        const normalizedHeader = String(headerLabel || '').trim();
        if (normalizedHeader) {
            return normalizedHeader;
        }
        const mediaTitle = String((_a = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.title) !== null && _a !== void 0 ? _a : '').trim();
        return mediaTitle || null;
    }, [activeMedia, headerLabel]);
    const instagramStorySubtitle = useMemo(() => {
        var _a, _b, _c;
        return getInstagramShareMatchLabel(String((_c = (_b = (_a = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.matchType) !== null && _a !== void 0 ? _a : activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.match_type) !== null && _b !== void 0 ? _b : matchType) !== null && _c !== void 0 ? _c : '').trim());
    }, [activeMedia, getInstagramShareMatchLabel, matchType]);
    const primaryMediaAsset = useMemo(() => {
        var _a;
        const assets = Array.isArray(activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.assets) ? activeMedia.assets : [];
        if (assets.length === 0)
            return null;
        const variantRank = (variant) => {
            const key = String(variant !== null && variant !== void 0 ? variant : '').trim().toLowerCase();
            switch (key) {
                case 'raw':
                    return 0;
                case 'full':
                    return 1;
                case 'preview_watermark':
                    return 2;
                case 'thumbnail':
                    return 3;
                default:
                    return 9;
            }
        };
        const ranked = [...assets].sort((left, right) => {
            var _a, _b, _c, _d;
            const rankDiff = variantRank(left === null || left === void 0 ? void 0 : left.variant) - variantRank(right === null || right === void 0 ? void 0 : right.variant);
            if (rankDiff !== 0)
                return rankDiff;
            const leftArea = Number((_a = left === null || left === void 0 ? void 0 : left.width) !== null && _a !== void 0 ? _a : 0) * Number((_b = left === null || left === void 0 ? void 0 : left.height) !== null && _b !== void 0 ? _b : 0);
            const rightArea = Number((_c = right === null || right === void 0 ? void 0 : right.width) !== null && _c !== void 0 ? _c : 0) * Number((_d = right === null || right === void 0 ? void 0 : right.height) !== null && _d !== void 0 ? _d : 0);
            return rightArea - leftArea;
        });
        return (_a = ranked[0]) !== null && _a !== void 0 ? _a : null;
    }, [activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.assets]);
    const mediaDimensions = useMemo(() => {
        var _a, _b;
        const width = Number((_a = primaryMediaAsset === null || primaryMediaAsset === void 0 ? void 0 : primaryMediaAsset.width) !== null && _a !== void 0 ? _a : 0);
        const height = Number((_b = primaryMediaAsset === null || primaryMediaAsset === void 0 ? void 0 : primaryMediaAsset.height) !== null && _b !== void 0 ? _b : 0);
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
            return null;
        }
        return { width, height };
    }, [primaryMediaAsset === null || primaryMediaAsset === void 0 ? void 0 : primaryMediaAsset.height, primaryMediaAsset === null || primaryMediaAsset === void 0 ? void 0 : primaryMediaAsset.width]);
    const formatBytes = useCallback((bytes) => {
        const safeBytes = Number(bytes !== null && bytes !== void 0 ? bytes : 0);
        if (!Number.isFinite(safeBytes) || safeBytes <= 0)
            return null;
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = safeBytes;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex += 1;
        }
        const precision = value >= 10 || unitIndex === 0 ? 0 : 1;
        return `${value.toFixed(precision)} ${units[unitIndex]}`;
    }, []);
    const mediaQualityText = useMemo(() => {
        var _a, _b;
        const parts = [];
        if (mediaDimensions) {
            const maxDimension = Math.max(mediaDimensions.width, mediaDimensions.height);
            const qualityTier = maxDimension >= 3840
                ? '4K'
                : maxDimension >= 2560
                    ? '2K'
                    : maxDimension >= 1920
                        ? 'HD'
                        : maxDimension >= 1280
                            ? 'Web'
                            : 'Standard';
            parts.push(`${qualityTier} ${mediaDimensions.width}x${mediaDimensions.height}`);
        }
        const mimeSuffix = String((_a = primaryMediaAsset === null || primaryMediaAsset === void 0 ? void 0 : primaryMediaAsset.mime_type) !== null && _a !== void 0 ? _a : '').trim().split('/')[1];
        if (mimeSuffix) {
            parts.push(mimeSuffix.toUpperCase());
        }
        const fileSizeLabel = formatBytes((_b = primaryMediaAsset === null || primaryMediaAsset === void 0 ? void 0 : primaryMediaAsset.file_size_bytes) !== null && _b !== void 0 ? _b : null);
        if (fileSizeLabel) {
            parts.push(fileSizeLabel);
        }
        return parts.length > 0 ? parts.join(' • ') : null;
    }, [formatBytes, mediaDimensions, primaryMediaAsset === null || primaryMediaAsset === void 0 ? void 0 : primaryMediaAsset.file_size_bytes, primaryMediaAsset === null || primaryMediaAsset === void 0 ? void 0 : primaryMediaAsset.mime_type]);
    const headerMetaText = useMemo(() => {
        const parts = [];
        if (mediaQualityText)
            parts.push(mediaQualityText);
        if (matchPercent != null)
            parts.push(`Match ${matchPercent.toFixed(0)}%`);
        return parts.length > 0 ? parts.join(' • ') : null;
    }, [matchPercent, mediaQualityText]);
    const headerTitleText = useMemo(() => {
        var _a;
        if (headerLabel)
            return headerLabel;
        return String((_a = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type) !== null && _a !== void 0 ? _a : '').toLowerCase() === 'video' ? t('Video') : t('Photo');
    }, [activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type, headerLabel, t]);
    const mediaStageStyle = useMemo(() => {
        var _a;
        const isVideoType = String((_a = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type) !== null && _a !== void 0 ? _a : '').toLowerCase() === 'video';
        if (isVideoType)
            return null;
        return {
            flex: 1,
            minHeight: 0,
        };
    }, [activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type]);
    const shouldFetchMedia = useMemo(() => {
        if (!apiAccessToken || !effectiveMediaId)
            return false;
        const hasHighResMedia = Boolean(routeMedia.originalUrl || routeMedia.original_url) ||
            Boolean(routeMedia.fullUrl || routeMedia.full_url) ||
            Boolean(routeMedia.rawUrl || routeMedia.raw_url) ||
            Boolean(routeMedia.hlsManifestPath || routeMedia.hls_manifest_path);
        const hasAssets = Array.isArray(routeMedia.assets) && routeMedia.assets.length > 0;
        return !hasAssets && !hasHighResMedia;
    }, [apiAccessToken, effectiveMediaId, routeMedia]);
    useEffect(() => {
        let isMounted = true;
        const loadMedia = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!shouldFetchMedia)
                return;
            const safeMediaId = String(effectiveMediaId || '').trim();
            if (!safeMediaId || !apiAccessToken)
                return;
            try {
                const fresh = yield getMediaById(apiAccessToken, safeMediaId);
                if (isMounted)
                    setResolvedMedia(normalizeMedia(fresh));
            }
            catch (_a) {
                // ignore fetch errors; fall back to route data
            }
        });
        loadMedia();
        return () => {
            isMounted = false;
        };
    }, [apiAccessToken, effectiveMediaId, normalizeMedia, shouldFetchMedia]);
    const hlsUrl = useMemo(() => {
        const path = (activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.hlsManifestPath) || (activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.hls_manifest_path);
        if (!path)
            return null;
        const str = String(path);
        if (str.startsWith('http://') || str.startsWith('https://'))
            return str;
        const suffix = str.startsWith('/') ? str : `/${str}`;
        return `${hlsBaseUrl}${suffix}`;
    }, [activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.hlsManifestPath, activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.hls_manifest_path, hlsBaseUrl]);
    const isSignedUrl = useCallback((value) => {
        if (!value)
            return false;
        const lower = String(value).toLowerCase();
        return (lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp='));
    }, []);
    const withAccessToken = useCallback((value) => {
        if (!value)
            return null;
        const resolved = toAbsoluteUrl(value);
        if (!resolved)
            return null;
        if (!apiAccessToken || isSignedUrl(resolved) || resolved.includes('access_token='))
            return resolved;
        const sep = resolved.includes('?') ? '&' : '?';
        return `${resolved}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl, toAbsoluteUrl]);
    const hlsUrlWithToken = useMemo(() => {
        if (!hlsUrl)
            return null;
        if (!apiAccessToken)
            return hlsUrl;
        if (isSignedUrl(hlsUrl))
            return hlsUrl;
        const sep = hlsUrl.includes('?') ? '&' : '?';
        return `${hlsUrl}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, hlsUrl, isSignedUrl]);
    const bestImageUrl = useMemo(() => {
        const candidates = [
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.previewUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.preview_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.originalUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.original_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.fullUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.full_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.rawUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.raw_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.thumbnailUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.thumbnail_url,
        ].filter(Boolean);
        if (candidates.length > 0)
            return withAccessToken(String(candidates[0])) || toAbsoluteUrl(String(candidates[0]));
        return null;
    }, [
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.fullUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.full_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.originalUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.original_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.previewUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.preview_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.rawUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.raw_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.thumbnailUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.thumbnail_url,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const thumbnailImageUrl = useMemo(() => {
        const candidates = [
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.thumbnailUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.thumbnail_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.previewUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.preview_url,
            bestImageUrl,
        ].filter(Boolean);
        if (candidates.length === 0)
            return null;
        return withAccessToken(String(candidates[0])) || toAbsoluteUrl(String(candidates[0]));
    }, [
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.previewUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.preview_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.thumbnailUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.thumbnail_url,
        bestImageUrl,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const highResImageUrl = useMemo(() => {
        const candidates = [
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.previewUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.preview_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.originalUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.original_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.fullUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.full_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.rawUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.raw_url,
        ].filter(Boolean);
        if (candidates.length === 0)
            return thumbnailImageUrl;
        return withAccessToken(String(candidates[0])) || toAbsoluteUrl(String(candidates[0])) || thumbnailImageUrl;
    }, [
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.fullUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.full_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.originalUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.original_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.previewUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.preview_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.rawUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.raw_url,
        thumbnailImageUrl,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const instagramStoryImageUrl = useMemo(() => {
        const candidates = [
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.rawUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.raw_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.originalUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.original_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.fullUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.full_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.previewUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.preview_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.thumbnailUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.thumbnail_url,
        ].filter(Boolean);
        if (candidates.length === 0)
            return null;
        const resolved = candidates
            .map((value) => withAccessToken(String(value)) || toAbsoluteUrl(String(value)))
            .filter(Boolean);
        const bitmapImage = resolved.find((value) => /\.(jpg|jpeg|png|heic)(\?|$)/i.test(value));
        if (bitmapImage)
            return bitmapImage;
        const webpImage = resolved.find((value) => /\.(webp)(\?|$)/i.test(value));
        return webpImage || resolved[0] || null;
    }, [
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.fullUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.full_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.originalUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.original_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.previewUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.preview_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.rawUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.raw_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.thumbnailUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.thumbnail_url,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const assetMp4Url = useMemo(() => {
        var _a, _b;
        const assets = (_a = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.assets) !== null && _a !== void 0 ? _a : [];
        if (!Array.isArray(assets) || assets.length === 0)
            return null;
        const mp4Assets = assets.filter((a) => {
            var _a, _b, _c;
            const variant = String((_a = a.variant) !== null && _a !== void 0 ? _a : '').toLowerCase();
            const mime = String((_b = a.mime_type) !== null && _b !== void 0 ? _b : '').toLowerCase();
            const url = String((_c = a.url) !== null && _c !== void 0 ? _c : '').toLowerCase();
            return /mp4|mov|m4v/.test(variant) || /video\/mp4/.test(mime) || /\.(mp4|mov|m4v)(\?|$)/.test(url);
        });
        if (mp4Assets.length === 0)
            return null;
        const signedFirst = mp4Assets.find((a) => {
            var _a, _b;
            const urlType = String((_a = a.url_type) !== null && _a !== void 0 ? _a : '').toLowerCase();
            const url = String((_b = a.url) !== null && _b !== void 0 ? _b : '').toLowerCase();
            return (urlType.includes('signed') ||
                url.includes('x-amz-signature') ||
                url.includes('token=') ||
                url.includes('sig=') ||
                url.includes('sv='));
        });
        return ((signedFirst === null || signedFirst === void 0 ? void 0 : signedFirst.url) || ((_b = mp4Assets[0]) === null || _b === void 0 ? void 0 : _b.url) || null);
    }, [activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.assets]);
    const assetHlsUrl = useMemo(() => {
        var _a, _b;
        const assets = (_a = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.assets) !== null && _a !== void 0 ? _a : [];
        if (!Array.isArray(assets) || assets.length === 0)
            return null;
        const hlsAssets = assets.filter((a) => {
            var _a, _b, _c;
            const variant = String((_a = a.variant) !== null && _a !== void 0 ? _a : '').toLowerCase();
            const mime = String((_b = a.mime_type) !== null && _b !== void 0 ? _b : '').toLowerCase();
            const url = String((_c = a.url) !== null && _c !== void 0 ? _c : '').toLowerCase();
            return /hls|m3u8|mpegurl/.test(variant) || /mpegurl/.test(mime) || /\.m3u8(\?|$)/.test(url);
        });
        if (hlsAssets.length === 0)
            return null;
        const signedFirst = hlsAssets.find((a) => {
            var _a, _b;
            const urlType = String((_a = a.url_type) !== null && _a !== void 0 ? _a : '').toLowerCase();
            const url = String((_b = a.url) !== null && _b !== void 0 ? _b : '').toLowerCase();
            return (urlType.includes('signed') ||
                url.includes('x-amz-signature') ||
                url.includes('token=') ||
                url.includes('sig=') ||
                url.includes('sv='));
        });
        const candidate = ((signedFirst === null || signedFirst === void 0 ? void 0 : signedFirst.url) || ((_b = hlsAssets[0]) === null || _b === void 0 ? void 0 : _b.url) || null);
        if (!candidate)
            return null;
        return candidate.startsWith('http') ? candidate : null;
    }, [activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.assets]);
    const isVideoFile = useCallback((value) => {
        if (!value)
            return false;
        const cleaned = String(value).toLowerCase();
        return /\.(m3u8|mp4|mov|m4v)(\?|$)/.test(cleaned);
    }, []);
    const videoCandidates = useMemo(() => {
        var _a;
        const rawCandidates = [
            preferredVideoUrl,
            assetMp4Url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.fullUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.full_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.rawUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.raw_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.originalUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.original_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.previewUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.preview_url,
            assetHlsUrl,
            hlsUrlWithToken,
        ]
            .filter(Boolean)
            .map((value) => String(value));
        const normalized = rawCandidates
            .map((value) => {
            if (value.startsWith('http://') || value.startsWith('https://'))
                return value;
            if (value.toLowerCase().includes('.m3u8'))
                return null;
            return withAccessToken(value) || toAbsoluteUrl(value);
        })
            .filter((value) => !!value);
        const allowNonExtension = String((_a = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type) !== null && _a !== void 0 ? _a : '').toLowerCase() === 'video';
        const filtered = allowNonExtension ? normalized : normalized.filter((value) => isVideoFile(value));
        const unique = [];
        filtered.forEach((value) => {
            if (!unique.includes(value))
                unique.push(value);
        });
        return unique;
    }, [
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.fullUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.full_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.originalUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.original_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.previewUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.preview_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.rawUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.raw_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type,
        assetHlsUrl,
        assetMp4Url,
        hlsUrlWithToken,
        isVideoFile,
        preferredVideoUrl,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const bestVideoUrl = useMemo(() => { var _a; return (_a = videoCandidates[0]) !== null && _a !== void 0 ? _a : null; }, [videoCandidates]);
    const [videoSourceIndex, setVideoSourceIndex] = useState(0);
    const activeVideoUrl = (_10 = videoCandidates[videoSourceIndex]) !== null && _10 !== void 0 ? _10 : bestVideoUrl;
    const isVideo = useMemo(() => {
        var _a;
        if (activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type)
            return String(activeMedia.type).toLowerCase() === 'video';
        const u = ((_a = bestVideoUrl !== null && bestVideoUrl !== void 0 ? bestVideoUrl : bestImageUrl) !== null && _a !== void 0 ? _a : '').toLowerCase();
        return /\.(mp4|mov|m4v|m3u8)(\\?|$)/.test(u) || u.includes('video');
    }, [bestImageUrl, bestVideoUrl, activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type]);
    const videoRef = useRef(null);
    const hasSeekedRef = useRef(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
    const [hasInitialTime, setHasInitialTime] = useState(false);
    const [mediaViewportSize, setMediaViewportSize] = useState({ width: 0, height: 0 });
    const downloadInFlightRef = useRef(false);
    const [downloadVisible, setDownloadVisible] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [moreMenuVisible, setMoreMenuVisible] = useState(false);
    const [moreMenuActions, setMoreMenuActions] = useState([]);
    const [reportIssueVisible, setReportIssueVisible] = useState(false);
    const [reportStep, setReportStep] = useState('reason');
    const [selectedReportReason, setSelectedReportReason] = useState('');
    const [customReportReason, setCustomReportReason] = useState('');
    const [infoPopupVisible, setInfoPopupVisible] = useState(false);
    const [infoPopupTitle, setInfoPopupTitle] = useState('');
    const [infoPopupMessage, setInfoPopupMessage] = useState('');
    const showInfoPopup = useCallback((title, message) => {
        setInfoPopupTitle(title);
        setInfoPopupMessage(message);
        setInfoPopupVisible(true);
    }, []);
    const markPerfReady = useCallback(() => {
        setPerfReadyElapsedMs((prev) => prev !== null && prev !== void 0 ? prev : (Date.now() - perfStartedAtRef.current));
    }, []);
    useEffect(() => {
        if (!infoPopupVisible)
            return;
        const timer = setTimeout(() => {
            setInfoPopupVisible(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [infoPopupVisible]);
    const reportReasons = useMemo(() => [
        t('Wrong competition'),
        t('Wrong heat'),
        t('Custom'),
    ], [t]);
    const computeDisplayFrame = useCallback((container, media) => {
        const containerWidth = Number((container === null || container === void 0 ? void 0 : container.width) || 0);
        const containerHeight = Number((container === null || container === void 0 ? void 0 : container.height) || 0);
        if (containerWidth <= 0 || containerHeight <= 0) {
            return { width: 0, height: 0 };
        }
        if (!media || media.width <= 0 || media.height <= 0) {
            return { width: containerWidth, height: containerHeight };
        }
        const mediaRatio = media.width / media.height;
        return {
            width: containerWidth,
            height: containerWidth / mediaRatio,
        };
    }, []);
    const resolvedImageFrame = useMemo(() => computeDisplayFrame(mediaViewportSize, mediaDimensions), [computeDisplayFrame, mediaDimensions, mediaViewportSize]);
    const openReportIssuePopup = useCallback(() => {
        setSelectedReportReason('');
        setCustomReportReason('');
        setReportStep('reason');
        setReportIssueVisible(true);
    }, []);
    const formatTime = useCallback((value) => {
        const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
        const minutes = Math.floor(safeValue / 60);
        const seconds = Math.floor(safeValue % 60);
        const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minutes}:${paddedSeconds}`;
    }, []);
    const seekTo = useCallback((time) => {
        var _a;
        const clamped = Math.max(0, Math.min(time, duration || 0));
        (_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.seek(clamped);
        setCurrentTime(clamped);
    }, [duration]);
    const handleSeekComplete = useCallback((time) => {
        seekTo(time);
    }, [seekTo]);
    const togglePlayback = useCallback(() => {
        setIsPlaying((prev) => !prev);
    }, []);
    const sliderMax = useMemo(() => Math.max(duration, 1), [duration]);
    const shouldAttachAuthHeader = useMemo(() => {
        if (!activeVideoUrl || !apiAccessToken)
            return false;
        if (isSignedUrl(activeVideoUrl))
            return false;
        if (activeVideoUrl.toLowerCase().includes('.m3u8'))
            return false;
        return true;
    }, [activeVideoUrl, apiAccessToken, isSignedUrl]);
    const videoHeaders = useMemo(() => {
        if (!shouldAttachAuthHeader || !apiAccessToken)
            return undefined;
        return { Authorization: `Bearer ${apiAccessToken}` };
    }, [apiAccessToken, shouldAttachAuthHeader]);
    useEffect(() => {
        setVideoSourceIndex(0);
        setVideoError(null);
        setCurrentTime(0);
        setIsVideoLoading(true);
        setHasInitialTime(false);
        hasSeekedRef.current = false;
    }, [resolvedMediaId, bestVideoUrl]);
    useEffect(() => {
        setIsVideoLoading(true);
        setHasInitialTime(false);
    }, [activeVideoUrl]);
    const getShareModule = useCallback(() => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require('react-native-share');
        }
        catch (_a) {
            return null;
        }
    }, []);
    const getFsModule = useCallback(() => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require('react-native-fs');
        }
        catch (_a) {
            return null;
        }
    }, []);
    const isHlsUrl = useCallback((value) => {
        if (!value)
            return false;
        return String(value).toLowerCase().includes('.m3u8');
    }, []);
    const extensionFromUrl = useCallback((value) => {
        const base = value.split('?')[0];
        const match = base.match(/\.(mp4|mov|m4v|jpg|jpeg|png|webp|heic)$/i);
        return (match === null || match === void 0 ? void 0 : match[1]) ? match[1].toLowerCase() : '';
    }, []);
    const resolveDownloadUrl = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        const candidates = [
            assetMp4Url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.originalUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.original_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.fullUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.full_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.rawUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.raw_url,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.previewUrl,
            activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.preview_url,
        ]
            .filter(Boolean)
            .map((value) => withAccessToken(String(value)) || toAbsoluteUrl(String(value)))
            .filter(Boolean);
        const direct = candidates.find((value) => !isHlsUrl(value));
        if (direct)
            return direct;
        if (resolvedMediaId && apiAccessToken) {
            try {
                const fresh = yield getMediaById(apiAccessToken, resolvedMediaId);
                const freshCandidates = [
                    fresh.original_url,
                    fresh.full_url,
                    fresh.raw_url,
                    fresh.preview_url,
                    fresh.thumbnail_url,
                ]
                    .filter(Boolean)
                    .map((value) => withAccessToken(String(value)) || toAbsoluteUrl(String(value)))
                    .filter(Boolean);
                const freshDirect = freshCandidates.find((value) => !isHlsUrl(value));
                if (freshDirect)
                    return freshDirect;
            }
            catch (_11) {
                // ignore
            }
        }
        return bestVideoUrl !== null && bestVideoUrl !== void 0 ? bestVideoUrl : null;
    }), [
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.fullUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.full_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.originalUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.original_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.previewUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.preview_url,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.rawUrl,
        activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.raw_url,
        apiAccessToken,
        assetMp4Url,
        bestVideoUrl,
        isHlsUrl,
        resolvedMediaId,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const resolveShareUrl = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        const candidate = yield resolveDownloadUrl();
        if (candidate && !isHlsUrl(candidate)) {
            return candidate;
        }
        return bestImageUrl !== null && bestImageUrl !== void 0 ? bestImageUrl : null;
    }), [bestImageUrl, isHlsUrl, resolveDownloadUrl]);
    const ensureLocalFile = useCallback((remoteUrl, extensionHint, onProgress) => __awaiter(void 0, void 0, void 0, function* () {
        const fsModule = getFsModule();
        if (!(fsModule === null || fsModule === void 0 ? void 0 : fsModule.downloadFile) || !(fsModule === null || fsModule === void 0 ? void 0 : fsModule.CachesDirectoryPath)) {
            return null;
        }
        const safeExt = extensionHint.startsWith('.') ? extensionHint : `.${extensionHint}`;
        const baseName = resolvedMediaId ? `allin-${resolvedMediaId}` : `allin-${Date.now()}`;
        const destPath = `${fsModule.CachesDirectoryPath}/${baseName}${safeExt}`;
        try {
            const result = yield fsModule.downloadFile({
                fromUrl: remoteUrl,
                toFile: destPath,
                background: true,
                progressDivider: 5,
                progress: (res) => {
                    if (!(res === null || res === void 0 ? void 0 : res.bytesExpected)) {
                        onProgress === null || onProgress === void 0 ? void 0 : onProgress(null);
                        return;
                    }
                    const ratio = Math.min(1, Math.max(0, res.bytesWritten / res.bytesExpected));
                    onProgress === null || onProgress === void 0 ? void 0 : onProgress(ratio);
                },
            }).promise;
            if ((result === null || result === void 0 ? void 0 : result.statusCode) && result.statusCode >= 400) {
                return null;
            }
            return `file://${destPath}`;
        }
        catch (_12) {
            return null;
        }
    }), [getFsModule, resolvedMediaId]);
    const handleDownload = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _13, _14, _15;
        if (downloadInFlightRef.current)
            return;
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to download.'));
            return;
        }
        if (!resolvedMediaId) {
            Alert.alert(t('Missing media'), t('This item has no media_id to download.'));
            return;
        }
        const downloadUrl = yield resolveDownloadUrl();
        if (!downloadUrl) {
            Alert.alert(t('No download URL'), t('The API did not provide a downloadable URL for this media.'));
            return;
        }
        downloadInFlightRef.current = true;
        setDownloadProgress(null);
        setDownloadVisible(true);
        const fileUrl = yield ensureLocalFile(downloadUrl, extensionFromUrl(downloadUrl) || (String((_13 = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type) !== null && _13 !== void 0 ? _13 : '').toLowerCase() === 'video' ? 'mp4' : 'jpg'), setDownloadProgress);
        if (!fileUrl) {
            Alert.alert(t('Download failed'), t('Unable to download the media file.'));
            setDownloadVisible(false);
            setDownloadProgress(null);
            downloadInFlightRef.current = false;
            return;
        }
        try {
            yield recordDownload(apiAccessToken, { media_id: resolvedMediaId, event_id: eventId });
        }
        catch (_16) {
            // ignore
        }
        try {
            const shareModule = getShareModule();
            if ((_14 = shareModule === null || shareModule === void 0 ? void 0 : shareModule.default) === null || _14 === void 0 ? void 0 : _14.open) {
                yield shareModule.default.open({
                    urls: [fileUrl],
                    type: fileUrl.toLowerCase().includes('.mp4') ? 'video/mp4' : 'image/jpeg',
                    filename: resolvedMediaId ? `allin_${resolvedMediaId}` : `allin_${Date.now()}`,
                    failOnCancel: false,
                    showAppsToView: true,
                });
            }
            else {
                yield Share.share({ url: fileUrl, message: 'SpotMe media' });
            }
        }
        catch (err) {
            const msg = String((_15 = err === null || err === void 0 ? void 0 : err.message) !== null && _15 !== void 0 ? _15 : err);
            Alert.alert(t('Download failed'), msg);
        }
        finally {
            setDownloadVisible(false);
            setDownloadProgress(null);
            downloadInFlightRef.current = false;
        }
    }), [activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type, apiAccessToken, ensureLocalFile, eventId, extensionFromUrl, getShareModule, resolveDownloadUrl, resolvedMediaId, t]);
    const handleShareNative = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _17, _18;
        const shareUrl = yield resolveShareUrl();
        if (!shareUrl) {
            Alert.alert(t('No media available'), t('There is no media to share.'));
            return;
        }
        const localShareUrl = yield ensureLocalFile(shareUrl, extensionFromUrl(shareUrl) || (String((_17 = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type) !== null && _17 !== void 0 ? _17 : '').toLowerCase() === 'video' ? 'mp4' : 'jpg'));
        if (!localShareUrl) {
            Alert.alert(t('Share failed'), t('Unable to download the media file.'));
            return;
        }
        try {
            yield Share.share({ message: 'SpotMe media', url: localShareUrl });
        }
        catch (e) {
            const msg = String((_18 = e === null || e === void 0 ? void 0 : e.message) !== null && _18 !== void 0 ? _18 : e);
            Alert.alert(t('Share failed'), msg);
        }
    }), [activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type, ensureLocalFile, extensionFromUrl, resolveShareUrl, t]);
    const handleShareInstagram = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _19, _20, _21, _22, _23;
        const shareModule = getShareModule();
        const shareUrl = String((_19 = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type) !== null && _19 !== void 0 ? _19 : '').toLowerCase() === 'video'
            ? yield resolveShareUrl()
            : (instagramStoryImageUrl || (yield resolveShareUrl()));
        console.log('[IGStoryScreen] handleShareInstagram.start', {
            mediaId: resolvedMediaId,
            mediaType: String((_20 = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type) !== null && _20 !== void 0 ? _20 : ''),
            shareUrl,
            instagramStoryImageUrl,
            title: instagramStoryTitle,
            subtitle: instagramStorySubtitle,
        });
        if ((_21 = shareModule === null || shareModule === void 0 ? void 0 : shareModule.default) === null || _21 === void 0 ? void 0 : _21.shareSingle) {
            const ShareLib = shareModule.default;
            try {
                const localAsset = shareUrl
                    ? yield ensureLocalFile(shareUrl, extensionFromUrl(shareUrl) || (String((_22 = activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type) !== null && _22 !== void 0 ? _22 : '').toLowerCase() === 'video' ? 'mp4' : 'jpg'))
                    : null;
                if (!localAsset) {
                    Alert.alert(t('Share failed'), t('Unable to download the media file.'));
                    return;
                }
                const isLocalVideo = /\.(mp4|mov|m4v)(\?|$)/i.test(localAsset);
                console.log('[IGStoryScreen] handleShareInstagram.localAsset', {
                    mediaId: resolvedMediaId,
                    shareUrl,
                    localAsset,
                    isLocalVideo,
                });
                const result = yield shareMediaToInstagramStory({
                    t,
                    composeInstagramStoryImage,
                    localAssetUrl: localAsset,
                    isVideo: isLocalVideo,
                    title: isLocalVideo ? null : instagramStoryTitle,
                    subtitle: isLocalVideo ? null : instagramStorySubtitle,
                    composeImageUri: isLocalVideo
                        ? null
                        : localAsset,
                    shareModule: ShareLib,
                });
                console.log('[IGStoryScreen] handleShareInstagram.result', {
                    mediaId: resolvedMediaId,
                    result,
                });
                if (result !== 'unsupported') {
                    return;
                }
            }
            catch (e) {
                const msg = String((_23 = e === null || e === void 0 ? void 0 : e.message) !== null && _23 !== void 0 ? _23 : e);
                console.log('[IGStoryScreen] handleShareInstagram.failed', {
                    mediaId: resolvedMediaId,
                    message: msg,
                });
                if (!/cancel/i.test(msg)) {
                    Alert.alert(t('Instagram Story failed'), msg);
                }
                return;
            }
        }
        if (!shareUrl) {
            Alert.alert(t('No media available'), t('There is no media to share.'));
            return;
        }
        yield handleShareNative();
    }), [activeMedia === null || activeMedia === void 0 ? void 0 : activeMedia.type, composeInstagramStoryImage, ensureLocalFile, extensionFromUrl, getShareModule, handleShareNative, instagramStoryImageUrl, instagramStorySubtitle, instagramStoryTitle, resolveShareUrl, resolvedMediaId, t]);
    const handleAddToProfile = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _22, _23, _24;
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to add media to your news page.'));
            return;
        }
        if (!resolvedMediaId) {
            Alert.alert(t('Missing media'), t('This item has no media_id to add.'));
            return;
        }
        try {
            const entryTitle = String(headerLabel || eventTitle || t('Competition')).trim() || t('Competition');
            const created = yield createPost(apiAccessToken, {
                title: entryTitle,
                description: entryTitle,
                post_type: 'photo',
            });
            const postId = String((_23 = (_22 = created === null || created === void 0 ? void 0 : created.post) === null || _22 === void 0 ? void 0 : _22.id) !== null && _23 !== void 0 ? _23 : '').trim();
            if (!postId) {
                throw new Error(t('Could not create the news post.'));
            }
            yield attachMediaToPost(apiAccessToken, postId, {
                media_ids: [String(resolvedMediaId)],
            });
            showInfoPopup(t('Added to news page'), t('This photo now appears on your news page.'));
        }
        catch (e) {
            const message = e instanceof ApiError ? e.message : String((_24 = e === null || e === void 0 ? void 0 : e.message) !== null && _24 !== void 0 ? _24 : e);
            Alert.alert(t('Could not add'), message);
        }
    }), [apiAccessToken, eventTitle, headerLabel, resolvedMediaId, showInfoPopup, t]);
    const openMoreMenu = useCallback(() => {
        const actions = [
            { label: t('Download'), onPress: handleDownload },
            { label: t('Add to news'), onPress: handleAddToProfile },
            { label: t('Share'), onPress: handleShareNative },
            { label: t('Share to Instagram Story'), onPress: handleShareInstagram },
            { label: t('Report an issue with this video/photo'), onPress: openReportIssuePopup },
            {
                label: t('Go to author profile'),
                onPress: () => navigation.navigate('BottomTabBar', { screen: 'Profile' }),
            },
            {
                label: t('Go to event'),
                onPress: () => {
                    const eventName = headerLabel || t('Competition');
                    const typeToken = String(eventName || '').toLowerCase();
                    navigation.navigate('CompetitionDetailsScreen', {
                        eventId: eventId || undefined,
                        name: eventName,
                        competitionType: /road|trail|marathon|veldloop|veldlopen|cross|5k|10k|half|ultra|city\s*run/.test(typeToken)
                            ? 'road'
                            : 'track',
                    });
                },
            },
            {
                label: t('Mark as inappropriate content'),
                onPress: () => Alert.alert(t('Thanks'), t('We will review this content.')),
            },
            {
                label: t('Request this video removed'),
                onPress: () => Alert.alert(t('Request sent'), t('We will review the removal request.')),
            },
        ];
        setMoreMenuActions(actions);
        setMoreMenuVisible(true);
    }, [eventId, handleAddToProfile, handleDownload, handleShareInstagram, handleShareNative, headerLabel, navigation, openReportIssuePopup, t]);
    useEffect(() => {
        var _a, _b, _c;
        const parent = (_a = navigation.getParent) === null || _a === void 0 ? void 0 : _a.call(navigation);
        if (!parent)
            return undefined;
        const hideTabBar = () => parent.setOptions({ tabBarStyle: { display: 'none' } });
        const showTabBar = () => parent.setOptions({ tabBarStyle: undefined });
        hideTabBar();
        const unsubscribeFocus = (_b = navigation.addListener) === null || _b === void 0 ? void 0 : _b.call(navigation, 'focus', hideTabBar);
        const unsubscribeBlur = (_c = navigation.addListener) === null || _c === void 0 ? void 0 : _c.call(navigation, 'blur', showTabBar);
        return () => {
            if (typeof unsubscribeFocus === 'function')
                unsubscribeFocus();
            if (typeof unsubscribeBlur === 'function')
                unsubscribeBlur();
            showTabBar();
        };
    }, [navigation]);
    const [feedback, setFeedback] = useState(null);
    const [isSavingFeedback, setIsSavingFeedback] = useState(false);
    const [feedbackLoaded, setFeedbackLoaded] = useState(false);
    useEffect(() => {
        let cancelled = false;
        if (!apiAccessToken || !resolvedMediaId) {
            setFeedbackLoaded(true);
            return;
        }
        setFeedbackLoaded(false);
        setFeedback(null);
        const run = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const existing = yield getAiFeedbackLabel(apiAccessToken, {
                    media_id: String(resolvedMediaId),
                    event_id: eventId !== null && eventId !== void 0 ? eventId : undefined,
                });
                if (cancelled)
                    return;
                if (existing) {
                    setFeedback(existing.label ? 'yes' : 'no');
                }
            }
            catch (_a) {
                // Ignore lookup failures; keep UI available.
            }
            finally {
                if (!cancelled) {
                    setFeedbackLoaded(true);
                }
            }
        });
        run();
        return () => {
            cancelled = true;
        };
    }, [apiAccessToken, eventId, resolvedMediaId]);
    const submitFeedback = useCallback((choice) => __awaiter(void 0, void 0, void 0, function* () {
        var _25;
        const feedbackId = resolvedMediaId;
        if (!feedbackId)
            return;
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to label results.'));
            return;
        }
        setIsSavingFeedback(true);
        try {
            yield postAiFeedbackLabel(apiAccessToken, {
                media_id: feedbackId,
                label: choice === 'yes',
                event_id: eventId,
                meta: { source: 'photo_detail' },
            });
            setFeedback(choice);
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_25 = e === null || e === void 0 ? void 0 : e.message) !== null && _25 !== void 0 ? _25 : e);
            Alert.alert(t('Could not save label'), msg);
        }
        finally {
            setIsSavingFeedback(false);
        }
    }), [apiAccessToken, eventId, resolvedMediaId, t]);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "photo-detail-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(Icons.BackArrow, { height: 24, width: 24 }) })), _jsxs(View, Object.assign({ style: Styles.headerCenter }, { children: [_jsx(Text, Object.assign({ style: Styles.headerTitle, numberOfLines: 1 }, { children: headerTitleText })), headerMetaText ? (_jsx(Text, Object.assign({ style: Styles.headerSubtitle, numberOfLines: 1 }, { children: headerMetaText }))) : null] })), _jsxs(View, Object.assign({ style: Styles.headerRight }, { children: [_jsxs(View, Object.assign({ style: [Styles.headerMetricPill, !isDarkSurface && Styles.headerMetricPillLight] }, { children: [_jsx(Icons.Eye, { height: 16, width: 16, color: headerIconColor }), _jsx(Text, Object.assign({ style: Styles.headerMetricText }, { children: mediaViewsLabel }))] })), _jsx(TouchableOpacity, Object.assign({ style: [
                                    Styles.headerAction,
                                    isDarkSurface ? Styles.headerActionDark : Styles.headerActionLight,
                                ], onPress: openMoreMenu }, { children: _jsx(Icons.More, { height: 22, width: 22, color: headerIconColor }) }))] }))] })), _jsxs(View, Object.assign({ style: [Styles.content, isVideo && Styles.contentFull] }, { children: [!isVideo && !!resolvedMediaId && !!matchType && feedbackLoaded && feedback === null && (_jsx(View, Object.assign({ style: Styles.contentInset }, { children: _jsxs(View, Object.assign({ style: Styles.questionCard }, { children: [_jsx(Text, Object.assign({ style: Styles.questionText }, { children: t('Is this photo/video actually you?') })), _jsxs(View, Object.assign({ style: Styles.buttonsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [
                                                Styles.noButton,
                                                feedback === 'no' && { opacity: 0.85 },
                                                isSavingFeedback && { opacity: 0.6 },
                                            ], disabled: isSavingFeedback, onPress: () => submitFeedback('no') }, { children: _jsx(Text, Object.assign({ style: Styles.noButtonText }, { children: feedback === 'no' ? t('Not me') : t('No') })) })), _jsx(TouchableOpacity, Object.assign({ style: [
                                                Styles.yesButton,
                                                feedback === 'yes' && { opacity: 0.85 },
                                                isSavingFeedback && { opacity: 0.6 },
                                            ], disabled: isSavingFeedback, onPress: () => submitFeedback('yes') }, { children: _jsx(Text, Object.assign({ style: Styles.buttonText }, { children: feedback === 'yes' ? t('This is me') : t('Yes') })) }))] })), isSavingFeedback && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 10 }), _jsx(Text, Object.assign({ style: [Styles.questionText, { marginBottom: 0 }] }, { children: t('Saving…') }))] }))] })) }))), _jsx(View, Object.assign({ style: [Styles.mediaStage, mediaStageStyle], onLayout: (event) => {
                            const { width, height } = event.nativeEvent.layout;
                            if (width !== mediaViewportSize.width || height !== mediaViewportSize.height) {
                                setMediaViewportSize({ width, height });
                            }
                        } }, { children: _jsx(View, Object.assign({ style: [Styles.photoContainer, Styles.photoContainerFullBleed, isVideo && Styles.photoContainerFull] }, { children: isVideo && activeVideoUrl ? (_jsxs(_Fragment, { children: [isVideoLoading && (_jsx(View, Object.assign({ style: Styles.videoSkeleton }, { children: _jsx(ShimmerEffect, { width: "100%", height: "100%", borderRadius: 0 }) }))), _jsx(Video, { ref: videoRef, source: {
                                            uri: activeVideoUrl,
                                            type: activeVideoUrl.toLowerCase().includes('.m3u8') ? 'm3u8' : undefined,
                                            headers: videoHeaders,
                                        }, style: Styles.photoImage, resizeMode: "contain", paused: !isPlaying, controls: false, onLoadStart: () => setIsVideoLoading(true), onLoad: (meta) => {
                                            var _a;
                                            setDuration(meta.duration || 0);
                                            setVideoError(null);
                                            if (!hasSeekedRef.current && Number.isFinite(startAt) && startAt > 0) {
                                                const seekToTime = Math.min(startAt, meta.duration || startAt);
                                                hasSeekedRef.current = true;
                                                (_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.seek(seekToTime);
                                                setCurrentTime(seekToTime);
                                                setHasInitialTime(true);
                                            }
                                            else {
                                                setHasInitialTime(false);
                                            }
                                            setIsVideoLoading(false);
                                            setPerfReadyElapsedMs(Date.now() - perfStartedAtRef.current);
                                        }, onProgress: (progress) => {
                                            const nextTime = progress.currentTime || 0;
                                            if (!hasInitialTime && nextTime > 0) {
                                                setHasInitialTime(true);
                                            }
                                            if (!isSeeking) {
                                                setCurrentTime(nextTime);
                                            }
                                        }, onEnd: () => {
                                            setIsPlaying(false);
                                            setCurrentTime(0);
                                        }, onError: (err) => {
                                            var _a;
                                            const rawError = err;
                                            const msg = ((_a = rawError === null || rawError === void 0 ? void 0 : rawError.error) === null || _a === void 0 ? void 0 : _a.errorString) || (rawError === null || rawError === void 0 ? void 0 : rawError.errorString) || 'Video failed to load';
                                            setVideoError(msg);
                                            setCurrentTime(0);
                                            setIsPlaying(false);
                                            setDuration(0);
                                            setIsSeeking(false);
                                            setIsVideoLoading(false);
                                            if (videoSourceIndex + 1 < videoCandidates.length) {
                                                setVideoSourceIndex((prev) => Math.min(prev + 1, videoCandidates.length - 1));
                                                setVideoError(null);
                                                setIsPlaying(true);
                                            }
                                        }, repeat: false }, activeVideoUrl), !isVideoLoading && hasInitialTime && (_jsxs(_Fragment, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.videoTapOverlay, activeOpacity: 1, onPress: togglePlayback }, { children: !isPlaying && (_jsx(View, Object.assign({ style: Styles.videoPlayBadge }, { children: _jsx(Icons.PlayCricle, { height: 36, width: 36 }) }))) })), _jsxs(View, Object.assign({ style: [Styles.videoControlsOverlay, { paddingBottom: 16 + insets.bottom }] }, { children: [isSeeking && (_jsx(View, Object.assign({ style: Styles.videoTimeRow }, { children: _jsxs(Text, Object.assign({ style: Styles.videoTimeText }, { children: [formatTime(currentTime), " / ", formatTime(duration)] })) }))), _jsx(View, Object.assign({ style: Styles.videoScrubberWrap, pointerEvents: "auto" }, { children: _jsx(Slider, { style: Styles.videoScrubber, minimumValue: 0, maximumValue: sliderMax, value: Math.min(currentTime, sliderMax), minimumTrackTintColor: colors.primaryColor, maximumTrackTintColor: "rgba(255,255,255,0.4)", thumbTintColor: colors.primaryColor, disabled: !duration, onSlidingStart: () => setIsSeeking(true), onValueChange: (value) => setCurrentTime(value), onSlidingComplete: (value) => {
                                                                setIsSeeking(false);
                                                                handleSeekComplete(value);
                                                            } }) })), videoError && (_jsx(Text, Object.assign({ style: Styles.videoErrorText }, { children: videoError })))] }))] }))] })) : (thumbnailImageUrl || highResImageUrl) ? (_jsx(_Fragment, { children: _jsx(ScrollView, Object.assign({ style: Styles.photoZoomScroll, contentContainerStyle: [
                                        Styles.photoZoomContent,
                                        resolvedImageFrame.height > 0 && resolvedImageFrame.height < mediaViewportSize.height
                                            ? { minHeight: mediaViewportSize.height }
                                            : null,
                                    ], minimumZoomScale: 1, maximumZoomScale: 4, showsHorizontalScrollIndicator: false, showsVerticalScrollIndicator: false, bouncesZoom: false, pinchGestureEnabled: true }, { children: _jsxs(View, Object.assign({ style: [
                                            Styles.zoomablePhoto,
                                            resolvedImageFrame.width > 0 && resolvedImageFrame.height > 0
                                                ? {
                                                    width: resolvedImageFrame.width,
                                                    height: resolvedImageFrame.height,
                                                }
                                                : Styles.photoImage,
                                        ] }, { children: [_jsx(FastImage, { source: { uri: thumbnailImageUrl || highResImageUrl }, onLoadStart: () => setIsImageLoading(true), onLoadEnd: () => {
                                                    setIsImageLoading(false);
                                                    markPerfReady();
                                                }, style: Styles.photoImage, resizeMode: "cover" }), highResImageUrl && highResImageUrl !== thumbnailImageUrl ? (_jsx(FastImage, { source: { uri: highResImageUrl }, onLoadEnd: () => {
                                                    setIsFullImageLoaded(true);
                                                    markPerfReady();
                                                }, style: [
                                                    Styles.photoImage,
                                                    {
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        opacity: isFullImageLoaded ? 1 : 0.01,
                                                    },
                                                ], resizeMode: "cover" })) : null] })) })) })) : (_jsx(View, Object.assign({ style: Styles.videoPlaceholder }, { children: _jsx(Text, Object.assign({ style: Styles.videoPlaceholderText }, { children: t('No preview available') })) }))) })) }))] })), perfReadyElapsedMs != null && (_jsx(Text, Object.assign({ style: { height: 0, width: 0, opacity: 0 }, testID: "e2e-perf-ready-photo-viewer" }, { children: `ready:${perfReadyElapsedMs}` }))), downloadVisible && (_jsx(View, Object.assign({ style: Styles.downloadOverlay, pointerEvents: "auto" }, { children: _jsxs(View, Object.assign({ style: Styles.downloadCard }, { children: [_jsx(Text, Object.assign({ style: Styles.downloadTitle }, { children: t('Preparing download') })), downloadProgress == null ? (_jsx(ActivityIndicator, { color: colors.primaryColor })) : (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.downloadProgressTrack }, { children: _jsx(View, { style: [Styles.downloadProgressFill, { width: `${Math.round(downloadProgress * 100)}%` }] }) })), _jsxs(Text, Object.assign({ style: Styles.downloadProgressLabel }, { children: [Math.round(downloadProgress * 100), "%"] }))] }))] })) }))), _jsx(Modal, Object.assign({ visible: moreMenuVisible, transparent: true, animationType: "fade", onRequestClose: () => setMoreMenuVisible(false) }, { children: _jsxs(View, Object.assign({ style: Styles.moreMenuOverlay }, { children: [_jsx(Pressable, { style: Styles.moreMenuBackdrop, onPress: () => setMoreMenuVisible(false) }), _jsxs(View, Object.assign({ style: Styles.moreMenuContainer }, { children: [moreMenuActions.map((item, index) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.moreMenuAction, activeOpacity: 0.85, onPress: () => {
                                        setMoreMenuVisible(false);
                                        setTimeout(() => item.onPress(), 120);
                                    } }, { children: _jsx(Text, Object.assign({ style: Styles.moreMenuActionText }, { children: item.label })) }), `${item.label}-${index}`))), _jsx(TouchableOpacity, Object.assign({ style: Styles.moreMenuCancel, activeOpacity: 0.85, onPress: () => setMoreMenuVisible(false) }, { children: _jsx(Text, Object.assign({ style: Styles.moreMenuCancelText }, { children: t('Cancel') })) }))] }))] })) })), _jsx(Modal, Object.assign({ visible: reportIssueVisible, transparent: true, animationType: "fade", onRequestClose: () => {
                    setReportIssueVisible(false);
                    setReportStep('reason');
                    setSelectedReportReason('');
                    setCustomReportReason('');
                } }, { children: _jsxs(View, Object.assign({ style: Styles.moreMenuOverlay }, { children: [_jsx(Pressable, { style: Styles.moreMenuBackdrop, onPress: () => {
                                setReportIssueVisible(false);
                                setReportStep('reason');
                                setSelectedReportReason('');
                                setCustomReportReason('');
                            } }), _jsxs(View, Object.assign({ style: Styles.moreMenuContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.moreMenuTitle }, { children: reportStep === 'reason'
                                        ? t('Report an issue with this photo/video')
                                        : t('Confirm request') })), _jsx(View, { style: Styles.moreMenuDivider }), reportStep === 'reason' ? (_jsxs(_Fragment, { children: [reportReasons.map((reason) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.moreMenuAction, activeOpacity: 0.85, onPress: () => {
                                                setSelectedReportReason(reason);
                                                if (reason === t('Custom')) {
                                                    return;
                                                }
                                                setReportStep('confirm');
                                            } }, { children: _jsx(Text, Object.assign({ style: Styles.moreMenuActionText }, { children: reason })) }), reason))), selectedReportReason === t('Custom') ? (_jsxs(View, Object.assign({ style: [Styles.moreMenuAction, { borderBottomWidth: 0 }] }, { children: [_jsx(TextInput, { style: [Styles.moreMenuActionText, { borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }], value: customReportReason, onChangeText: setCustomReportReason, placeholder: t('Type your request'), placeholderTextColor: colors.subTextColor }), _jsx(TouchableOpacity, Object.assign({ style: [Styles.infoModalSubmitButton, { marginTop: 10 }], activeOpacity: 0.85, onPress: () => {
                                                        if (!customReportReason.trim())
                                                            return;
                                                        setReportStep('confirm');
                                                    } }, { children: _jsx(Text, Object.assign({ style: Styles.infoModalSubmitButtonText }, { children: t('Next') })) }))] }))) : null, _jsx(TouchableOpacity, Object.assign({ style: Styles.moreMenuCancel, activeOpacity: 0.85, onPress: () => {
                                                setReportIssueVisible(false);
                                                setReportStep('reason');
                                                setSelectedReportReason('');
                                                setCustomReportReason('');
                                            } }, { children: _jsx(Text, Object.assign({ style: Styles.moreMenuCancelText }, { children: t('Cancel') })) }))] })) : (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.moreMenuAction }, { children: _jsx(Text, Object.assign({ style: Styles.moreMenuActionText }, { children: `${t('Reason')}: ${selectedReportReason}${selectedReportReason === t('Custom') ? ` - ${customReportReason.trim()}` : ''}` })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.infoModalSubmitButton, { marginTop: 8 }], activeOpacity: 0.85, onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                                const mediaId = String(resolvedMediaId || '').trim();
                                                if (!apiAccessToken || !mediaId)
                                                    return;
                                                const issue_type = selectedReportReason === t('Wrong competition')
                                                    ? 'wrong_competition'
                                                    : selectedReportReason === t('Wrong heat')
                                                        ? 'wrong_heat'
                                                        : 'custom';
                                                try {
                                                    yield createMediaIssueRequest(apiAccessToken, {
                                                        media_id: mediaId,
                                                        event_id: eventId || undefined,
                                                        issue_type,
                                                        custom_text: issue_type === 'custom' ? customReportReason.trim() : undefined,
                                                    });
                                                }
                                                catch (e) {
                                                    const msg = String((e === null || e === void 0 ? void 0 : e.message) || t('Could not submit request'));
                                                    showInfoPopup(t('Request failed'), msg);
                                                    return;
                                                }
                                                setReportIssueVisible(false);
                                                setReportStep('reason');
                                                setSelectedReportReason('');
                                                setCustomReportReason('');
                                                setTimeout(() => {
                                                    showInfoPopup(t('Request sent'), t('Your edit request is now pending.'));
                                                }, 120);
                                            }) }, { children: _jsx(Text, Object.assign({ style: Styles.infoModalSubmitButtonText }, { children: t('Submit') })) }))] }))] }))] })) })), _jsx(Modal, Object.assign({ visible: infoPopupVisible, transparent: true, animationType: "fade", onRequestClose: () => setInfoPopupVisible(false) }, { children: _jsxs(View, Object.assign({ style: Styles.moreMenuOverlay }, { children: [_jsx(Pressable, { style: Styles.moreMenuBackdrop, onPress: () => setInfoPopupVisible(false) }), _jsxs(View, Object.assign({ style: Styles.infoModalContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.infoModalTitle }, { children: infoPopupTitle })), _jsx(Text, Object.assign({ style: Styles.infoModalText }, { children: infoPopupMessage }))] }))] })) })), composerElement] })));
};
export default PhotoDetailScreen;
