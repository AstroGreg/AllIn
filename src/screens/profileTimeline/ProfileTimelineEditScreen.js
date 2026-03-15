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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Modal, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft2, Trash, Calendar as CalendarIcon, CloseCircle, SearchNormal1, TickCircle } from 'iconsax-react-nativejs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from './ProfileTimelineEditStyles';
import { useAuth } from '../../context/AuthContext';
import { getMediaById, getPosts, getProfileSummary, getProfileTimeline, getUploadedCompetitions, searchProfiles, setMyProfileTimeline, uploadMediaBatch } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next';
import CheckBox from '../../components/checkbox/CheckBox';
const ProfileTimelineEditScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const isLightTheme = String(colors.backgroundColor || '').toLowerCase() === '#ffffff';
    const pickerVisualProps = useMemo(() => (Platform.OS === 'ios'
        ? {
            themeVariant: isLightTheme ? 'light' : 'dark',
            textColor: isLightTheme ? '#0B1220' : '#F8FAFC',
            accentColor: colors.primaryColor,
        }
        : {}), [colors.primaryColor, isLightTheme]);
    const mode = (_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.mode) !== null && _b !== void 0 ? _b : 'add';
    const storageKey = (_d = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.storageKey) !== null && _d !== void 0 ? _d : '@profile_timeline_self';
    const item = (_f = (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.item) !== null && _f !== void 0 ? _f : null;
    const blogStorageKey = (_h = (_g = route === null || route === void 0 ? void 0 : route.params) === null || _g === void 0 ? void 0 : _g.blogStorageKey) !== null && _h !== void 0 ? _h : null;
    const collectionScopeKey = String((_k = (_j = route === null || route === void 0 ? void 0 : route.params) === null || _j === void 0 ? void 0 : _j.collectionScopeKey) !== null && _k !== void 0 ? _k : 'default').trim() || 'default';
    const competitionOptions = useMemo(() => {
        var _a;
        const raw = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.competitionOptions;
        return Array.isArray(raw) ? raw : [];
    }, [(_l = route === null || route === void 0 ? void 0 : route.params) === null || _l === void 0 ? void 0 : _l.competitionOptions]);
    const prefillCompetitionId = useMemo(() => { var _a, _b; return String((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.prefillCompetitionId) !== null && _b !== void 0 ? _b : '').trim(); }, [(_m = route === null || route === void 0 ? void 0 : route.params) === null || _m === void 0 ? void 0 : _m.prefillCompetitionId]);
    const prefillCompetitionTitle = useMemo(() => { var _a, _b; return String((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.prefillCompetitionTitle) !== null && _b !== void 0 ? _b : '').trim(); }, [(_o = route === null || route === void 0 ? void 0 : route.params) === null || _o === void 0 ? void 0 : _o.prefillCompetitionTitle]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        highlight: '',
    });
    const [eventDate, setEventDate] = useState(new Date());
    const [showDateModal, setShowDateModal] = useState(false);
    const [nativePickerDate, setNativePickerDate] = useState(new Date());
    const [mediaItems, setMediaItems] = useState([]);
    const [coverMedia, setCoverMedia] = useState(null);
    const [linkedBlogIds, setLinkedBlogIds] = useState([]);
    const [linkedCompetitionIds, setLinkedCompetitionIds] = useState([]);
    const [availableBlogs, setAvailableBlogs] = useState([]);
    const [availableCompetitions, setAvailableCompetitions] = useState([]);
    const [blogSearch, setBlogSearch] = useState('');
    const [competitionSearch, setCompetitionSearch] = useState('');
    const [showBlogModal, setShowBlogModal] = useState(false);
    const [showCompetitionModal, setShowCompetitionModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [skipHighlight, setSkipHighlight] = useState(false);
    const [linkedPeople, setLinkedPeople] = useState([]);
    const [peopleQuery, setPeopleQuery] = useState('');
    const [peopleResults, setPeopleResults] = useState([]);
    const [peopleSearchLoading, setPeopleSearchLoading] = useState(false);
    const { apiAccessToken } = useAuth();
    const TOTAL_STEPS = 6;
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
    const toAbsoluteUrl = useCallback((value) => {
        if (!value)
            return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://'))
            return raw;
        const base = getApiBaseUrl();
        if (!base)
            return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);
    const withAccessToken = useCallback((value) => {
        if (!value)
            return undefined;
        if (!apiAccessToken)
            return value;
        if (isSignedUrl(value))
            return value;
        if (value.includes('access_token='))
            return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);
    const resolveThumbUrl = useCallback((media) => {
        const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || media.original_url || null;
        const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);
    const isUuid = useCallback((value) => {
        if (!value)
            return false;
        const v = String(value).toLowerCase();
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
    }, []);
    const parseDateValue = useCallback((value) => {
        if (!value)
            return null;
        const raw = String(value).trim();
        if (!raw)
            return null;
        if (/^\d{4}-\d{1,2}-\d{1,2}/.test(raw) || raw.includes('T')) {
            const iso = new Date(raw);
            if (!Number.isNaN(iso.getTime()))
                return iso;
        }
        const match = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
        if (match) {
            const day = Number(match[1]);
            const month = Number(match[2]);
            let year = Number(match[3]);
            if (year < 100)
                year += 2000;
            const parsed = new Date(year, month - 1, day);
            if (!Number.isNaN(parsed.getTime()))
                return parsed;
        }
        const fallback = new Date(raw);
        return Number.isNaN(fallback.getTime()) ? null : fallback;
    }, []);
    const prefillCompetitionDate = useMemo(() => { var _a, _b; return parseDateValue((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.prefillCompetitionDate) !== null && _b !== void 0 ? _b : null); }, [parseDateValue, (_p = route === null || route === void 0 ? void 0 : route.params) === null || _p === void 0 ? void 0 : _p.prefillCompetitionDate]);
    const splitDescriptionAndPeople = useCallback((value) => {
        const raw = String(value || '');
        const rows = raw.split('\n').map((entry) => entry.trimEnd());
        const peopleLine = rows.length > 0 ? rows[rows.length - 1] : '';
        const match = peopleLine.match(/^people:\s*(.+)$/i);
        if (!match) {
            return { description: raw.trim(), people: [] };
        }
        const people = match[1]
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean);
        return {
            description: rows.slice(0, -1).join('\n').trim(),
            people,
        };
    }, []);
    const buildDescriptionWithPeople = useCallback((description, people) => {
        const base = String(description || '').trim();
        const cleanPeople = Array.from(new Set(people.map((p) => String(p || '').trim()).filter(Boolean)));
        if (cleanPeople.length === 0)
            return base;
        if (!base)
            return `People: ${cleanPeople.join(', ')}`;
        return `${base}\nPeople: ${cleanPeople.join(', ')}`;
    }, []);
    const openDateModal = useCallback(() => {
        const seedDate = mode === 'edit' ? (eventDate || new Date()) : new Date();
        setNativePickerDate(seedDate);
        setShowDateModal(true);
    }, [eventDate, mode]);
    const applyDateModal = useCallback(() => {
        const next = new Date(eventDate);
        next.setFullYear(nativePickerDate.getFullYear(), nativePickerDate.getMonth(), nativePickerDate.getDate());
        setEventDate(next);
        setShowDateModal(false);
    }, [eventDate, nativePickerDate]);
    const onNativeDateChange = useCallback((event, selectedDate) => {
        if ((event === null || event === void 0 ? void 0 : event.type) === 'dismissed') {
            setShowDateModal(false);
            return;
        }
        const pickedDate = selectedDate !== null && selectedDate !== void 0 ? selectedDate : nativePickerDate;
        setNativePickerDate(pickedDate);
        if (Platform.OS === 'android') {
            const next = new Date(eventDate);
            next.setFullYear(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate());
            setEventDate(next);
            setShowDateModal(false);
        }
    }, [eventDate, nativePickerDate]);
    useEffect(() => {
        var _a, _b, _c, _d, _e, _f;
        if (!item)
            return;
        setForm({
            title: item.title,
            description: splitDescriptionAndPeople(item.description).description,
            highlight: (_a = item.highlight) !== null && _a !== void 0 ? _a : '',
        });
        setLinkedPeople(splitDescriptionAndPeople(item.description).people);
        setSkipHighlight(!String((_b = item.highlight) !== null && _b !== void 0 ? _b : '').trim());
        const seeded = (_e = parseDateValue((_d = (_c = item.event_date) !== null && _c !== void 0 ? _c : item.date) !== null && _d !== void 0 ? _d : null)) !== null && _e !== void 0 ? _e : new Date();
        setEventDate(seeded);
        setMediaItems(Array.isArray(item.mediaItems) ? item.mediaItems : []);
        setCoverMedia(item.cover_media_id && Array.isArray(item.mediaItems)
            ? (_f = item.mediaItems.find((m) => String(m.media_id) === String(item.cover_media_id))) !== null && _f !== void 0 ? _f : null
            : null);
        const linkedBlogsRaw = Array.isArray(item.linkedBlogs) ? item.linkedBlogs : [];
        const linkedCompsRaw = Array.isArray(item.linkedCompetitions) ? item.linkedCompetitions : [];
        const blogIds = Array.isArray(item.linkedBlogIds)
            ? item.linkedBlogIds
            : linkedBlogsRaw.map((b) => (typeof b === 'string' ? b : b === null || b === void 0 ? void 0 : b.id)).filter(Boolean);
        const compIds = Array.isArray(item.linkedCompetitionIds)
            ? item.linkedCompetitionIds
            : linkedCompsRaw.map((c) => (typeof c === 'string' ? c : c === null || c === void 0 ? void 0 : c.id)).filter(Boolean);
        setLinkedBlogIds(blogIds);
        setLinkedCompetitionIds(compIds);
    }, [item, parseDateValue, splitDescriptionAndPeople]);
    useEffect(() => {
        if (mode !== 'add' || item)
            return;
        if (prefillCompetitionId) {
            setLinkedCompetitionIds((prev) => (prev.includes(prefillCompetitionId) ? prev : [prefillCompetitionId, ...prev]));
        }
        if (prefillCompetitionTitle) {
            setForm((prev) => (prev.title.trim().length > 0 ? prev : Object.assign(Object.assign({}, prev), { title: prefillCompetitionTitle })));
        }
        if (prefillCompetitionDate) {
            setEventDate(prefillCompetitionDate);
        }
    }, [item, mode, prefillCompetitionDate, prefillCompetitionId, prefillCompetitionTitle]);
    useEffect(() => {
        if (!apiAccessToken || !item)
            return;
        const coverId = item === null || item === void 0 ? void 0 : item.cover_media_id;
        if (!coverId)
            return;
        if (coverMedia && String(coverMedia.media_id) === String(coverId))
            return;
        const existing = mediaItems.find((m) => String(m.media_id) === String(coverId));
        if (existing) {
            setCoverMedia(existing);
            return;
        }
        getMediaById(apiAccessToken, String(coverId))
            .then((media) => setCoverMedia(media))
            .catch(() => { });
    }, [apiAccessToken, coverMedia, item, mediaItems]);
    useEffect(() => {
        const loadOptions = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!apiAccessToken) {
                if (blogStorageKey) {
                    const stored = yield AsyncStorage.getItem(blogStorageKey);
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            if (Array.isArray(parsed)) {
                                const list = parsed
                                    .map((entry) => { var _a; return ({ id: String(entry.id), title: String((_a = entry.title) !== null && _a !== void 0 ? _a : 'Blog') }); })
                                    .filter((entry) => entry.title);
                                setAvailableBlogs(list);
                            }
                        }
                        catch (_a) {
                            // ignore
                        }
                    }
                }
                if (competitionOptions === null || competitionOptions === void 0 ? void 0 : competitionOptions.length) {
                    setAvailableCompetitions(competitionOptions.map((title) => ({ event_id: title, event_name: title })));
                }
                return;
            }
            try {
                const summary = yield getProfileSummary(apiAccessToken);
                const postsResp = yield getPosts(apiAccessToken, {
                    author_profile_id: summary.profile_id,
                    limit: 200,
                    include_original: false,
                });
                const posts = Array.isArray(postsResp === null || postsResp === void 0 ? void 0 : postsResp.posts) ? postsResp.posts : [];
                setAvailableBlogs(posts.map((p) => ({ id: String(p.id), title: String(p.title || 'Blog') })));
            }
            catch (_b) {
                setAvailableBlogs([]);
            }
            try {
                const comps = yield getUploadedCompetitions(apiAccessToken, { limit: 200 });
                const items = Array.isArray(comps === null || comps === void 0 ? void 0 : comps.competitions) ? comps.competitions : [];
                setAvailableCompetitions(items.map((c) => {
                    var _a, _b;
                    return ({
                        event_id: String(c.event_id),
                        event_name: (_a = c.event_name) !== null && _a !== void 0 ? _a : null,
                        event_date: (_b = c.event_date) !== null && _b !== void 0 ? _b : null,
                    });
                }));
            }
            catch (_c) {
                setAvailableCompetitions([]);
            }
        });
        loadOptions();
    }, [apiAccessToken, blogStorageKey, competitionOptions]);
    useEffect(() => {
        if (!showBlogModal) {
            setBlogSearch('');
        }
    }, [showBlogModal]);
    useEffect(() => {
        if (!showCompetitionModal) {
            setCompetitionSearch('');
        }
    }, [showCompetitionModal]);
    useEffect(() => {
        if (currentStep > TOTAL_STEPS) {
            setCurrentStep(TOTAL_STEPS);
        }
    }, [TOTAL_STEPS, currentStep]);
    const saveItem = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _q;
        const title = form.title.trim();
        const description = buildDescriptionWithPeople(form.description.trim(), linkedPeople);
        if (!title || !description) {
            Alert.alert(t('Missing info'), t('Please add a title and description.'));
            return;
        }
        if (isUploading || isSaving) {
            return;
        }
        setIsSaving(true);
        const eventDateIso = eventDate ? new Date(eventDate).toISOString() : null;
        const yearValue = eventDate ? new Date(eventDate).getFullYear() : new Date().getFullYear();
        const mediaIds = mediaItems.map((m) => String(m.media_id)).filter(Boolean);
        const coverId = (coverMedia === null || coverMedia === void 0 ? void 0 : coverMedia.media_id) ? String(coverMedia.media_id) : (mediaIds[0] || null);
        try {
            // Prefer server timeline (source of truth). Fallback to local storage if no token.
            if (apiAccessToken) {
                const resp = yield getProfileTimeline(apiAccessToken, 'me');
                const current = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.items) ? resp.items : [];
                const nextId = (item === null || item === void 0 ? void 0 : item.id) && isUuid(String(item.id)) ? String(item.id) : undefined;
                const next = Object.assign(Object.assign({}, (nextId ? { id: nextId } : {})), { year: yearValue, event_date: eventDateIso, title,
                    description, highlight: skipHighlight ? null : (form.highlight.trim() || null), cover_media_id: coverId || null, media_ids: mediaIds, linked_post_ids: linkedBlogIds, linked_event_ids: linkedCompetitionIds });
                const updated = mode === 'edit' && item && nextId
                    ? current.map((e) => (String(e.id) === String(nextId) ? Object.assign(Object.assign({}, e), next) : e))
                    : [...current, next];
                yield setMyProfileTimeline(apiAccessToken, updated);
                navigation.goBack();
                return;
            }
            const stored = yield AsyncStorage.getItem(storageKey);
            const list = stored ? JSON.parse(stored) : [];
            const displayDate = eventDateIso ? new Date(eventDateIso).toLocaleDateString('en-GB') : '';
            if (mode === 'edit' && item) {
                const updated = list.map((entry) => entry.id === item.id
                    ? Object.assign(Object.assign({}, entry), { year: String(yearValue), date: displayDate, title,
                        description, highlight: skipHighlight ? '' : form.highlight.trim(), photos: mediaItems.map((m) => resolveThumbUrl(m)).filter(Boolean), backgroundImage: coverMedia ? (resolveThumbUrl(coverMedia) || undefined) : undefined, linkedBlogs: linkedBlogIds, linkedCompetitions: linkedCompetitionIds }) : entry);
                yield AsyncStorage.setItem(storageKey, JSON.stringify(updated));
            }
            else {
                const nextLocal = {
                    id: `tl-${Date.now()}`,
                    year: String(yearValue),
                    date: displayDate,
                    title,
                    description,
                    highlight: skipHighlight ? '' : form.highlight.trim(),
                    photos: mediaItems.map((m) => resolveThumbUrl(m)).filter(Boolean),
                    backgroundImage: coverMedia ? (resolveThumbUrl(coverMedia) || undefined) : undefined,
                    linkedBlogs: linkedBlogIds,
                    linkedCompetitions: linkedCompetitionIds,
                };
                const updated = [...list, nextLocal].sort((a, b) => Number(a.year) - Number(b.year));
                yield AsyncStorage.setItem(storageKey, JSON.stringify(updated));
            }
            navigation.goBack();
        }
        catch (e) {
            const message = String((_q = e === null || e === void 0 ? void 0 : e.message) !== null && _q !== void 0 ? _q : e);
            Alert.alert(t('Save failed'), message);
        }
        finally {
            setIsSaving(false);
        }
    }), [apiAccessToken, buildDescriptionWithPeople, coverMedia, eventDate, form.description, form.highlight, form.title, isSaving, isUploading, item, linkedBlogIds, linkedCompetitionIds, linkedPeople, mediaItems, mode, navigation, resolveThumbUrl, skipHighlight, storageKey, t, isUuid]);
    const deleteItem = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!item)
            return;
        if (apiAccessToken) {
            const resp = yield getProfileTimeline(apiAccessToken, 'me');
            const current = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.items) ? resp.items : [];
            const updated = current.filter((e) => String(e.id) !== String(item.id));
            yield setMyProfileTimeline(apiAccessToken, updated);
            navigation.goBack();
            return;
        }
        const stored = yield AsyncStorage.getItem(storageKey);
        const list = stored ? JSON.parse(stored) : [];
        const updated = list.filter((entry) => entry.id !== item.id);
        yield AsyncStorage.setItem(storageKey, JSON.stringify(updated));
        navigation.goBack();
    }), [apiAccessToken, item, navigation, storageKey]);
    const uploadAssets = useCallback((assets) => __awaiter(void 0, void 0, void 0, function* () {
        var _r;
        if (!apiAccessToken)
            return [];
        const guessMimeType = (asset) => {
            if (asset.type)
                return asset.type;
            const seed = String(asset.fileName || asset.uri || '').toLowerCase();
            if (seed.endsWith('.mp4'))
                return 'video/mp4';
            if (seed.endsWith('.mov'))
                return 'video/quicktime';
            if (seed.endsWith('.m4v'))
                return 'video/x-m4v';
            if (seed.endsWith('.jpg') || seed.endsWith('.jpeg'))
                return 'image/jpeg';
            if (seed.endsWith('.png'))
                return 'image/png';
            return 'application/octet-stream';
        };
        const files = assets
            .filter((asset) => asset === null || asset === void 0 ? void 0 : asset.uri)
            .map((asset) => ({
            uri: String(asset.uri),
            type: guessMimeType(asset),
            name: asset.fileName || `timeline-${Date.now()}`,
        }));
        if (files.length === 0)
            return [];
        setIsUploading(true);
        try {
            const resp = yield uploadMediaBatch(apiAccessToken, {
                files,
                collection_scope_key: collectionScopeKey,
            });
            const mediaIds = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.results)
                ? resp.results.map((r) => r.media_id).filter(Boolean)
                : [];
            if (mediaIds.length === 0)
                return [];
            const fetched = yield Promise.all(mediaIds.map((id) => getMediaById(apiAccessToken, id)));
            return fetched.filter(Boolean);
        }
        catch (e) {
            Alert.alert(t('Upload failed'), String((_r = e === null || e === void 0 ? void 0 : e.message) !== null && _r !== void 0 ? _r : e));
            return [];
        }
        finally {
            setIsUploading(false);
        }
    }), [apiAccessToken, collectionScopeKey, t]);
    const addMedia = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield launchImageLibrary({
            mediaType: 'mixed',
            selectionLimit: 8,
            quality: 0.9,
            presentationStyle: 'fullScreen',
            assetRepresentationMode: 'current',
        });
        if (res.didCancel || !res.assets)
            return;
        const uploaded = yield uploadAssets(res.assets);
        if (uploaded.length > 0) {
            setMediaItems((prev) => [...prev, ...uploaded]);
        }
    }), [uploadAssets]);
    const pickBackground = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            quality: 0.9,
            presentationStyle: 'fullScreen',
            assetRepresentationMode: 'current',
        });
        if (res.didCancel || !res.assets)
            return;
        const uploaded = yield uploadAssets(res.assets);
        if (uploaded.length > 0) {
            setCoverMedia(uploaded[0]);
        }
    }), [uploadAssets]);
    const clearBackground = useCallback(() => {
        setCoverMedia(null);
    }, []);
    const removeMedia = useCallback((mediaId) => {
        setMediaItems((prev) => prev.filter((item) => String(item.media_id) !== String(mediaId)));
    }, []);
    const toggleBlog = useCallback((id) => {
        setLinkedBlogIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
    }, []);
    const toggleCompetition = useCallback((id) => {
        setLinkedCompetitionIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
    }, []);
    const addPerson = useCallback((name) => {
        const safe = String(name || '').trim();
        if (!safe)
            return;
        setLinkedPeople((prev) => (prev.includes(safe) ? prev : [...prev, safe]));
        setPeopleQuery('');
        setPeopleResults([]);
    }, []);
    const removePerson = useCallback((name) => {
        setLinkedPeople((prev) => prev.filter((entry) => entry !== name));
    }, []);
    const blogChoices = useMemo(() => {
        const q = blogSearch.trim().toLowerCase();
        return availableBlogs.filter((b) => !q || b.title.toLowerCase().includes(q));
    }, [availableBlogs, blogSearch]);
    const competitionChoices = useMemo(() => {
        const q = competitionSearch.trim().toLowerCase();
        const base = availableCompetitions.length ? availableCompetitions : competitionOptions.map((title) => ({ event_id: title, event_name: title, event_date: null }));
        return base.filter((c) => !q || String(c.event_name || '').toLowerCase().includes(q));
    }, [availableCompetitions, competitionOptions, competitionSearch]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || !peopleQuery.trim()) {
            setPeopleResults([]);
            setPeopleSearchLoading(false);
            return () => {
                mounted = false;
            };
        }
        const timer = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            setPeopleSearchLoading(true);
            try {
                const resp = yield searchProfiles(apiAccessToken, { q: peopleQuery.trim(), limit: 8 });
                if (!mounted)
                    return;
                const list = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.profiles)
                    ? resp.profiles
                        .map((p) => ({
                        profile_id: String(p.profile_id || ''),
                        display_name: String(p.display_name || '').trim(),
                    }))
                        .filter((p) => p.profile_id && p.display_name)
                    : [];
                setPeopleResults(list);
            }
            catch (_a) {
                if (mounted)
                    setPeopleResults([]);
            }
            finally {
                if (mounted)
                    setPeopleSearchLoading(false);
            }
        }), 250);
        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [apiAccessToken, peopleQuery]);
    const goNextStep = useCallback(() => {
        if (currentStep === 2) {
            if (!form.title.trim() || !form.description.trim()) {
                Alert.alert(t('Missing info'), t('Please add a title and description.'));
                return;
            }
        }
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep((prev) => prev + 1);
        }
    }, [currentStep, form.description, form.title, t]);
    const goPrevStep = useCallback(() => {
        if (currentStep > 1)
            setCurrentStep((prev) => prev - 1);
    }, [currentStep]);
    const goPreviewStep = useCallback(() => {
        setShowPreviewModal(true);
    }, []);
    const closePreviewModal = useCallback(() => {
        setShowPreviewModal(false);
    }, []);
    const renderPreviewCard = useCallback(() => (_jsxs(View, Object.assign({ style: Styles.previewCard }, { children: [_jsx(Text, Object.assign({ style: Styles.previewTitle }, { children: form.title || t('Untitled milestone') })), _jsx(Text, Object.assign({ style: Styles.previewMeta }, { children: eventDate.toLocaleDateString() })), _jsx(Text, Object.assign({ style: Styles.previewText }, { children: form.description || t('No description') })), !skipHighlight && !!form.highlight.trim() && (_jsxs(Text, Object.assign({ style: Styles.previewSubline }, { children: [t('Highlight'), ": ", form.highlight.trim()] }))), linkedPeople.length > 0 && (_jsxs(Text, Object.assign({ style: Styles.previewSubline }, { children: [t('People'), ": ", linkedPeople.join(', ')] }))), _jsxs(Text, Object.assign({ style: Styles.previewMeta }, { children: [t('Media'), ": ", mediaItems.length, " \u00B7 ", t('Blogs'), ": ", linkedBlogIds.length, " \u00B7 ", t('Competitions'), ": ", linkedCompetitionIds.length] }))] }))), [Styles.previewCard, Styles.previewMeta, Styles.previewSubline, Styles.previewText, Styles.previewTitle, eventDate, form.description, form.highlight, form.title, linkedBlogIds.length, linkedCompetitionIds.length, linkedPeople, mediaItems.length, skipHighlight, t]);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: mode === 'edit' ? 'Edit milestone' : 'Add milestone' })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(ScrollView, Object.assign({ contentContainerStyle: Styles.scrollContent, showsVerticalScrollIndicator: false }, { children: [_jsxs(View, Object.assign({ style: Styles.stepHeaderRow }, { children: [_jsxs(Text, Object.assign({ style: Styles.stepCounter }, { children: [t('Step'), " ", currentStep, "/", TOTAL_STEPS] })), _jsx(Text, Object.assign({ style: Styles.stepTitle }, { children: currentStep === 1 ? t('Date') :
                                    currentStep === 2 ? t('Description') :
                                        currentStep === 3 ? t('Highlight') :
                                            currentStep === 4 ? t('Timeline background') :
                                                currentStep === 5 ? t('Milestone media') : t('Links') }))] })), currentStep === 1 && (_jsxs(View, Object.assign({ style: Styles.fieldBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.fieldLabel }, { children: t('Date') })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.dateButton, onPress: openDateModal }, { children: [_jsx(CalendarIcon, { size: 16, color: colors.mainTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.dateText }, { children: eventDate.toLocaleDateString() }))] }))] }))), currentStep === 2 && (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.fieldBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.fieldLabel }, { children: t('Title') })), _jsx(TextInput, { style: Styles.fieldInput, placeholder: t('Qualified for nationals'), placeholderTextColor: "#9B9F9F", value: form.title, onChangeText: (text) => setForm((prev) => (Object.assign(Object.assign({}, prev), { title: text }))) })] })), _jsxs(View, Object.assign({ style: Styles.fieldBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.fieldLabel }, { children: t('Description') })), _jsx(TextInput, { style: [Styles.fieldInput, Styles.fieldTextarea], placeholder: t('Share the highlight and what it meant.'), placeholderTextColor: "#9B9F9F", value: form.description, onChangeText: (text) => setForm((prev) => (Object.assign(Object.assign({}, prev), { description: text }))), multiline: true })] }))] })), currentStep === 3 && (_jsxs(View, Object.assign({ style: Styles.fieldBlock }, { children: [_jsxs(View, Object.assign({ style: Styles.skipRow }, { children: [_jsx(CheckBox, { isChecked: skipHighlight, onPressCheckBox: (checked) => setSkipHighlight(Boolean(checked)) }), _jsx(Text, Object.assign({ style: Styles.skipLabel }, { children: t('Skip highlight') }))] })), !skipHighlight && (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.fieldLabel }, { children: t('Highlight (optional)') })), _jsx(TextInput, { style: Styles.fieldInput, placeholder: t('PB 1:54.30'), placeholderTextColor: "#9B9F9F", value: form.highlight, onChangeText: (text) => setForm((prev) => (Object.assign(Object.assign({}, prev), { highlight: text }))) })] }))] }))), currentStep === 4 && (_jsxs(View, Object.assign({ style: Styles.fieldBlock }, { children: [_jsxs(View, Object.assign({ style: Styles.inlineHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.fieldLabel }, { children: t('Timeline background') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.inlineAction, onPress: pickBackground }, { children: _jsx(Text, Object.assign({ style: Styles.inlineActionText }, { children: coverMedia ? t('Replace image') : t('Select image') })) }))] })), !coverMedia ? (_jsx(Text, Object.assign({ style: Styles.helperText }, { children: t('Pick one image to show as the timeline card background.') }))) : (_jsxs(View, Object.assign({ style: Styles.backgroundPreviewRow }, { children: [resolveThumbUrl(coverMedia) ? (_jsx(Image, { source: { uri: String(resolveThumbUrl(coverMedia)) }, style: Styles.backgroundPreview, resizeMode: "cover" })) : (_jsx(View, { style: [Styles.backgroundPreview, { backgroundColor: colors.btnBackgroundColor }] })), _jsx(TouchableOpacity, Object.assign({ style: Styles.inlineAction, onPress: clearBackground }, { children: _jsx(Text, Object.assign({ style: Styles.inlineActionText }, { children: t('Remove') })) }))] })))] }))), currentStep === 5 && (_jsxs(View, Object.assign({ style: Styles.fieldBlock }, { children: [_jsxs(View, Object.assign({ style: Styles.inlineHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.fieldLabel }, { children: t('Milestone media') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.inlineAction, onPress: addMedia }, { children: _jsx(Text, Object.assign({ style: Styles.inlineActionText }, { children: t('Add media') })) }))] })), mediaItems.length === 0 ? (_jsx(Text, Object.assign({ style: Styles.helperText }, { children: t('Add photos or videos to show this milestone.') }))) : (_jsx(ScrollView, Object.assign({ horizontal: true, showsHorizontalScrollIndicator: false, style: Styles.photoRow }, { children: mediaItems.map((media) => {
                                    const thumb = resolveThumbUrl(media);
                                    const isVideo = media.type === 'video';
                                    return (_jsxs(TouchableOpacity, Object.assign({ style: Styles.photoThumbWrapper, onPress: () => removeMedia(String(media.media_id)) }, { children: [thumb ? (_jsx(Image, { source: { uri: String(thumb) }, style: Styles.photoThumbImage, resizeMode: "cover" })) : (_jsx(View, { style: Styles.photoThumbPlaceholder })), isVideo && (_jsx(View, Object.assign({ style: Styles.mediaBadge }, { children: _jsx(Text, Object.assign({ style: Styles.mediaBadgeText }, { children: t('Video') })) })))] }), String(media.media_id)));
                                }) }))), isUploading && _jsx(Text, Object.assign({ style: Styles.helperText }, { children: t('Uploading...') }))] }))), currentStep === 6 && (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.fieldBlock }, { children: _jsxs(View, Object.assign({ style: Styles.sectionHeaderRow }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Blogs') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.sectionAction, onPress: () => setShowBlogModal(true) }, { children: _jsx(Text, Object.assign({ style: Styles.sectionActionText }, { children: linkedBlogIds.length > 0 ? t('Edit') : t('Select') })) }))] })) })), _jsx(View, Object.assign({ style: Styles.fieldBlock }, { children: _jsxs(View, Object.assign({ style: Styles.sectionHeaderRow }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Competitions') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.sectionAction, onPress: () => setShowCompetitionModal(true) }, { children: _jsx(Text, Object.assign({ style: Styles.sectionActionText }, { children: linkedCompetitionIds.length > 0 ? t('Edit') : t('Select') })) }))] })) })), _jsxs(View, Object.assign({ style: Styles.fieldBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('People') })), _jsxs(View, Object.assign({ style: Styles.modalSearchRow }, { children: [_jsx(SearchNormal1, { size: 18, color: colors.subTextColor, variant: "Linear" }), _jsx(TextInput, { style: Styles.modalSearchInput, placeholder: t('Search people or type a name'), placeholderTextColor: colors.subTextColor, value: peopleQuery, onChangeText: setPeopleQuery, onSubmitEditing: () => addPerson(peopleQuery) })] })), peopleSearchLoading && _jsx(Text, Object.assign({ style: Styles.helperText }, { children: t('Searching...') })), !peopleSearchLoading && peopleQuery.trim().length > 0 && peopleResults.length > 0 && (_jsx(View, Object.assign({ style: Styles.modalListContent }, { children: peopleResults.map((person) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.modalOption, onPress: () => addPerson(person.display_name) }, { children: _jsx(Text, Object.assign({ style: Styles.modalOptionTitle }, { children: person.display_name })) }), person.profile_id))) }))), linkedPeople.length > 0 && (_jsx(View, Object.assign({ style: Styles.competitionChipsRow }, { children: linkedPeople.map((person) => (_jsxs(View, Object.assign({ style: Styles.competitionChip }, { children: [_jsx(Text, Object.assign({ style: Styles.competitionChipText, numberOfLines: 1 }, { children: person })), _jsx(TouchableOpacity, Object.assign({ style: Styles.competitionChipRemove, onPress: () => removePerson(person) }, { children: _jsx(CloseCircle, { size: 14, color: colors.subTextColor, variant: "Linear" }) }))] }), person))) })))] }))] })), _jsxs(View, Object.assign({ style: Styles.actionRow }, { children: [currentStep < TOTAL_STEPS ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.previewShortcutButton, onPress: goPreviewStep }, { children: _jsx(Text, Object.assign({ style: Styles.previewShortcutText }, { children: t('Preview') })) }))) : null, _jsx(TouchableOpacity, Object.assign({ style: Styles.cancelButton, onPress: currentStep === 1 ? () => navigation.goBack() : goPrevStep }, { children: _jsx(Text, Object.assign({ style: Styles.cancelText }, { children: currentStep === 1 ? t('Cancel') : t('Back') })) })), currentStep < TOTAL_STEPS ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.saveButton, onPress: goNextStep }, { children: _jsx(Text, Object.assign({ style: Styles.saveText }, { children: t('Next') })) }))) : (_jsx(TouchableOpacity, Object.assign({ style: Styles.saveButton, onPress: saveItem, disabled: isSaving || isUploading }, { children: _jsx(Text, Object.assign({ style: Styles.saveText }, { children: isSaving ? t('Saving...') : t('Save') })) })))] })), mode === 'edit' && item ? (_jsxs(TouchableOpacity, Object.assign({ style: Styles.deleteButton, onPress: deleteItem }, { children: [_jsx(Trash, { size: 16, color: "#ED5454", variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.deleteText }, { children: t('Delete milestone') }))] }))) : null, _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 16 : 32 })] })), Platform.OS === 'ios' ? (_jsx(Modal, Object.assign({ visible: showDateModal, transparent: true, animationType: "fade", onRequestClose: () => setShowDateModal(false) }, { children: _jsxs(View, Object.assign({ style: Styles.modalOverlay }, { children: [_jsx(Pressable, { style: Styles.modalBackdrop, onPress: () => setShowDateModal(false) }), _jsxs(View, Object.assign({ style: Styles.dateModalContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.dateModalTitle }, { children: t('Select date') })), _jsx(SizeBox, { height: 10 }), _jsx(DateTimePicker, Object.assign({}, pickerVisualProps, { value: nativePickerDate, mode: "date", display: "spinner", onChange: onNativeDateChange })), _jsx(TouchableOpacity, Object.assign({ style: Styles.modalDoneButton, onPress: applyDateModal }, { children: _jsx(Text, Object.assign({ style: Styles.modalDoneButtonText }, { children: t('Done') })) }))] }))] })) }))) : null, Platform.OS === 'android' && showDateModal ? (_jsx(DateTimePicker, Object.assign({}, pickerVisualProps, { value: nativePickerDate, mode: "date", display: "default", onChange: onNativeDateChange }))) : null, _jsx(Modal, Object.assign({ visible: showPreviewModal, transparent: true, animationType: "fade", onRequestClose: closePreviewModal }, { children: _jsxs(View, Object.assign({ style: Styles.modalOverlay }, { children: [_jsx(Pressable, { style: Styles.modalBackdrop, onPress: closePreviewModal }), _jsxs(View, Object.assign({ style: Styles.modalCard }, { children: [_jsxs(View, Object.assign({ style: Styles.modalHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: t('Preview') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.modalCloseButton, onPress: closePreviewModal }, { children: _jsx(CloseCircle, { size: 20, color: colors.subTextColor, variant: "Linear" }) }))] })), renderPreviewCard(), _jsx(TouchableOpacity, Object.assign({ style: Styles.modalDoneButton, onPress: closePreviewModal }, { children: _jsx(Text, Object.assign({ style: Styles.modalDoneButtonText }, { children: t('Back to editing') })) }))] }))] })) })), _jsx(Modal, Object.assign({ visible: showBlogModal, transparent: true, animationType: "fade", onRequestClose: () => setShowBlogModal(false) }, { children: _jsx(View, Object.assign({ style: Styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: Styles.modalCard }, { children: [_jsxs(View, Object.assign({ style: Styles.modalHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: t('Select blogs') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.modalCloseButton, onPress: () => setShowBlogModal(false) }, { children: _jsx(CloseCircle, { size: 22, color: colors.subTextColor, variant: "Linear" }) }))] })), _jsxs(View, Object.assign({ style: Styles.modalSearchRow }, { children: [_jsx(SearchNormal1, { size: 18, color: colors.subTextColor, variant: "Linear" }), _jsx(TextInput, { style: Styles.modalSearchInput, placeholder: t('Search blogs'), placeholderTextColor: colors.subTextColor, value: blogSearch, onChangeText: setBlogSearch })] })), _jsx(ScrollView, Object.assign({ style: Styles.modalList, contentContainerStyle: Styles.modalListContent }, { children: blogChoices.length > 0 ? (blogChoices.map((entry) => {
                                    const selected = linkedBlogIds.includes(entry.id);
                                    return (_jsxs(TouchableOpacity, Object.assign({ style: [Styles.modalOption, selected && Styles.modalOptionSelected], onPress: () => toggleBlog(entry.id) }, { children: [_jsx(View, Object.assign({ style: Styles.modalOptionTextWrap }, { children: _jsx(Text, Object.assign({ style: Styles.modalOptionTitle }, { children: entry.title })) })), selected && (_jsx(TickCircle, { size: 22, color: colors.primaryColor, variant: "Bold" }))] }), entry.id));
                                })) : (_jsx(Text, Object.assign({ style: Styles.modalEmptyText }, { children: t('No blogs found.') }))) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.modalDoneButton, onPress: () => setShowBlogModal(false) }, { children: _jsxs(Text, Object.assign({ style: Styles.modalDoneButtonText }, { children: [t('Done'), " (", linkedBlogIds.length, " ", t('selected'), ")"] })) }))] })) })) })), _jsx(Modal, Object.assign({ visible: showCompetitionModal, transparent: true, animationType: "fade", onRequestClose: () => setShowCompetitionModal(false) }, { children: _jsx(View, Object.assign({ style: Styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: Styles.modalCard }, { children: [_jsxs(View, Object.assign({ style: Styles.modalHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: t('Select competitions') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.modalCloseButton, onPress: () => setShowCompetitionModal(false) }, { children: _jsx(CloseCircle, { size: 22, color: colors.subTextColor, variant: "Linear" }) }))] })), _jsxs(View, Object.assign({ style: Styles.modalSearchRow }, { children: [_jsx(SearchNormal1, { size: 18, color: colors.subTextColor, variant: "Linear" }), _jsx(TextInput, { style: Styles.modalSearchInput, placeholder: t('Search competitions'), placeholderTextColor: colors.subTextColor, value: competitionSearch, onChangeText: setCompetitionSearch })] })), _jsx(ScrollView, Object.assign({ style: Styles.modalList, contentContainerStyle: Styles.modalListContent }, { children: competitionChoices.length > 0 ? (competitionChoices.map((entry) => {
                                    const selected = linkedCompetitionIds.includes(entry.event_id);
                                    const meta = [entry.event_date ? new Date(entry.event_date).toLocaleDateString() : null]
                                        .filter(Boolean)
                                        .join(' • ');
                                    return (_jsxs(TouchableOpacity, Object.assign({ style: [Styles.modalOption, selected && Styles.modalOptionSelected], onPress: () => toggleCompetition(entry.event_id) }, { children: [_jsxs(View, Object.assign({ style: Styles.modalOptionTextWrap }, { children: [_jsx(Text, Object.assign({ style: Styles.modalOptionTitle }, { children: entry.event_name || t('competition') })), !!meta && _jsx(Text, Object.assign({ style: Styles.modalOptionSubtext }, { children: meta }))] })), selected && (_jsx(TickCircle, { size: 22, color: colors.primaryColor, variant: "Bold" }))] }), entry.event_id));
                                })) : (_jsx(Text, Object.assign({ style: Styles.modalEmptyText }, { children: t('No competitions found.') }))) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.modalDoneButton, onPress: () => setShowCompetitionModal(false) }, { children: _jsxs(Text, Object.assign({ style: Styles.modalDoneButtonText }, { children: [t('Done'), " (", linkedCompetitionIds.length, " ", t('selected'), ")"] })) }))] })) })) })), isUploading && (_jsx(View, Object.assign({ style: Styles.loadingOverlay }, { children: _jsxs(View, Object.assign({ style: Styles.loadingCard }, { children: [_jsx(ActivityIndicator, { color: colors.primaryColor }), _jsx(Text, Object.assign({ style: Styles.loadingText }, { children: t('Uploading...') }))] })) })))] })));
};
export default ProfileTimelineEditScreen;
