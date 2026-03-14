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
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator, Modal, Pressable, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Add, Trash, Calendar as CalendarIcon } from 'iconsax-react-nativejs';
import { launchImageLibrary } from 'react-native-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import SizeBox from '../../constants/SizeBox';
import { createStyles } from './ProfileBlogEditorStyles';
import DatePickerModal from '../../components/datePickerModal/DatePickerModal';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { createPost, deletePost, getPostById, searchProfiles, updatePost, uploadMediaBatch } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next';
const ProfileBlogEditorScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const mode = (_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.mode) !== null && _b !== void 0 ? _b : 'add';
    const postId = (_g = (_d = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.postId) !== null && _d !== void 0 ? _d : (_f = (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.entry) === null || _f === void 0 ? void 0 : _f.id) !== null && _g !== void 0 ? _g : null;
    const entryPreview = (_j = (_h = route === null || route === void 0 ? void 0 : route.params) === null || _h === void 0 ? void 0 : _h.entry) !== null && _j !== void 0 ? _j : null;
    const groupId = ((_k = route === null || route === void 0 ? void 0 : route.params) === null || _k === void 0 ? void 0 : _k.groupId) ? String(route.params.groupId) : null;
    const collectionScopeKey = String((_m = (_l = route === null || route === void 0 ? void 0 : route.params) === null || _l === void 0 ? void 0 : _l.collectionScopeKey) !== null && _m !== void 0 ? _m : 'default').trim() || 'default';
    const { apiAccessToken } = useAuth();
    const { events: subscribedEvents } = useEvents();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [postDate, setPostDate] = useState(null);
    const [showDateModal, setShowDateModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [media, setMedia] = useState([]);
    const [existingMedia, setExistingMedia] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isPickingMedia, setIsPickingMedia] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [skipHighlight, setSkipHighlight] = useState(false);
    const [skipMedia, setSkipMedia] = useState(false);
    const [skipEvent, setSkipEvent] = useState(false);
    const [skipPeople, setSkipPeople] = useState(false);
    const [highlight, setHighlight] = useState('');
    const [linkedPeople, setLinkedPeople] = useState([]);
    const [peopleQuery, setPeopleQuery] = useState('');
    const [peopleResults, setPeopleResults] = useState([]);
    const [peopleSearchLoading, setPeopleSearchLoading] = useState(false);
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
    const resolveThumbUrl = useCallback((mediaItem) => {
        const candidate = mediaItem.thumbnail_url || mediaItem.preview_url || mediaItem.full_url || mediaItem.raw_url || mediaItem.original_url || null;
        const resolved = candidate ? toAbsoluteUrl(String(candidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);
    const existingPreview = useMemo(() => {
        return existingMedia
            .map((item) => ({
            uri: resolveThumbUrl(item),
            type: item.type === 'video' ? 'video' : 'image',
        }))
            .filter((item) => Boolean(item.uri));
    }, [existingMedia, resolveThumbUrl]);
    const selectedEvent = useMemo(() => subscribedEvents.find((event) => String(event.event_id) === String(selectedEventId)), [selectedEventId, subscribedEvents]);
    const selectedEventLabel = useMemo(() => {
        if (!selectedEvent)
            return t('No event selected');
        return selectedEvent.event_name || selectedEvent.event_title || t('Event');
    }, [selectedEvent, t]);
    const parseEventDate = useCallback((value) => {
        if (!value)
            return null;
        const raw = String(value).trim();
        const direct = new Date(raw);
        if (!Number.isNaN(direct.getTime()))
            return direct;
        if (raw.includes('/')) {
            const [day, month, year] = raw.split('/').map(Number);
            if (!day || !month || !year)
                return null;
            const parsed = new Date(year, month - 1, day, 0, 0, 0, 0);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }
        return null;
    }, []);
    const toDateString = useCallback((value) => {
        const yyyy = value.getFullYear();
        const mm = String(value.getMonth() + 1).padStart(2, '0');
        const dd = String(value.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);
    const fromDateString = useCallback((value) => {
        const raw = String(value || '').trim();
        if (!raw)
            return null;
        const [year, month, day] = raw.split('-').map(Number);
        if (!year || !month || !day)
            return null;
        const parsed = new Date(year, month - 1, day, 0, 0, 0, 0);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }, []);
    const splitDescriptionMeta = useCallback((value) => {
        const lines = String(value || '').split('\n');
        let parsedHighlight = '';
        let parsedPeople = [];
        const base = [...lines];
        while (base.length > 0) {
            const last = String(base[base.length - 1] || '').trim();
            const highlightMatch = last.match(/^highlight:\s*(.+)$/i);
            if (highlightMatch) {
                parsedHighlight = highlightMatch[1].trim();
                base.pop();
                continue;
            }
            const peopleMatch = last.match(/^people:\s*(.+)$/i);
            if (peopleMatch) {
                parsedPeople = peopleMatch[1].split(',').map((p) => p.trim()).filter(Boolean);
                base.pop();
                continue;
            }
            break;
        }
        return {
            description: base.join('\n').trim(),
            highlight: parsedHighlight,
            people: parsedPeople,
        };
    }, []);
    const buildDescriptionWithMeta = useCallback((baseDescription, valueHighlight, people, skip) => {
        const out = [String(baseDescription || '').trim()].filter(Boolean);
        if (!skip && String(valueHighlight || '').trim()) {
            out.push(`Highlight: ${String(valueHighlight).trim()}`);
        }
        const cleanPeople = Array.from(new Set(people.map((p) => String((p === null || p === void 0 ? void 0 : p.display_name) || '').trim()).filter(Boolean)));
        if (cleanPeople.length > 0) {
            out.push(`People: ${cleanPeople.join(', ')}`);
        }
        return out.join('\n');
    }, []);
    useEffect(() => {
        var _a, _b;
        if (entryPreview && mode === 'add') {
            setTitle((_a = entryPreview.title) !== null && _a !== void 0 ? _a : '');
            setDescription((_b = entryPreview.description) !== null && _b !== void 0 ? _b : '');
        }
    }, [entryPreview, mode]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || mode !== 'edit' || !postId)
            return () => { };
        getPostById(apiAccessToken, String(postId))
            .then((resp) => {
            var _a, _b, _c;
            if (!mounted)
                return;
            if (resp === null || resp === void 0 ? void 0 : resp.post) {
                setTitle((_a = resp.post.title) !== null && _a !== void 0 ? _a : '');
                const parsed = splitDescriptionMeta((_b = resp.post.description) !== null && _b !== void 0 ? _b : '');
                setDescription(parsed.description);
                setHighlight(parsed.highlight);
                const taggedProfiles = Array.isArray((_c = resp.post) === null || _c === void 0 ? void 0 : _c.tagged_profiles) ? resp.post.tagged_profiles : [];
                const taggedByName = new Map(taggedProfiles
                    .map((person) => {
                    var _a, _b, _c;
                    return [
                        String((_a = person === null || person === void 0 ? void 0 : person.display_name) !== null && _a !== void 0 ? _a : '').trim().toLowerCase(),
                        {
                            profile_id: String((_b = person === null || person === void 0 ? void 0 : person.profile_id) !== null && _b !== void 0 ? _b : '').trim() || null,
                            display_name: String((_c = person === null || person === void 0 ? void 0 : person.display_name) !== null && _c !== void 0 ? _c : '').trim(),
                        },
                    ];
                })
                    .filter((entry) => entry[0].length > 0 && entry[1].display_name.length > 0));
                const restoredPeople = parsed.people.map((name) => {
                    const safeName = String(name || '').trim();
                    const tagged = taggedByName.get(safeName.toLowerCase());
                    if (tagged) {
                        return tagged;
                    }
                    return { profile_id: null, display_name: safeName };
                });
                setLinkedPeople(restoredPeople);
                setSkipHighlight(!parsed.highlight);
                if (resp.post.created_at) {
                    const parsed = new Date(String(resp.post.created_at));
                    if (!Number.isNaN(parsed.getTime())) {
                        setPostDate(parsed);
                    }
                }
            }
            setExistingMedia(Array.isArray(resp === null || resp === void 0 ? void 0 : resp.media) ? resp.media : []);
        })
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, mode, postId, splitDescriptionMeta]);
    const openDateModal = useCallback(() => {
        setShowDateModal(true);
    }, []);
    const pickMedia = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _o;
        setIsPickingMedia(true);
        try {
            const result = yield launchImageLibrary({
                mediaType: 'mixed',
                selectionLimit: 6,
                presentationStyle: 'fullScreen',
                assetRepresentationMode: 'current',
            });
            const items = (_o = result.assets) !== null && _o !== void 0 ? _o : [];
            const mapped = items
                .filter((asset) => asset.uri)
                .map((asset) => {
                var _a, _b, _c;
                return ({
                    uri: asset.uri,
                    type: (((_a = asset.type) === null || _a === void 0 ? void 0 : _a.startsWith('video')) ? 'video' : 'image'),
                    name: (_b = asset.fileName) !== null && _b !== void 0 ? _b : undefined,
                    mimeType: (_c = asset.type) !== null && _c !== void 0 ? _c : undefined,
                });
            });
            if (mapped.length > 0) {
                setSkipMedia(false);
                setMedia((prev) => [...prev, ...mapped].slice(0, 12));
            }
        }
        finally {
            setIsPickingMedia(false);
        }
    }), []);
    const saveEntry = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _p, _q;
        setShowValidation(true);
        const hasTitle = title.trim().length > 0;
        const hasDescription = description.trim().length > 0;
        const hasDate = !!postDate && !Number.isNaN(new Date(postDate).getTime());
        if (!apiAccessToken || !hasTitle || !hasDescription || !hasDate)
            return;
        setIsSaving(true);
        try {
            const fullDescription = buildDescriptionWithMeta(description, highlight, linkedPeople, skipHighlight);
            const summary = fullDescription.length > 180 ? `${fullDescription.slice(0, 180)}…` : fullDescription;
            const taggedProfileIds = Array.from(new Set(linkedPeople
                .map((person) => String(person.profile_id || '').trim())
                .filter(Boolean)));
            let currentId = postId;
            if (mode === 'edit' && postId) {
                yield updatePost(apiAccessToken, String(postId), {
                    title: title.trim(),
                    description: fullDescription,
                    summary,
                    created_at: postDate ? postDate.toISOString() : undefined,
                    tagged_profile_ids: taggedProfileIds,
                });
            }
            else {
                const created = yield createPost(apiAccessToken, {
                    title: title.trim(),
                    description: fullDescription,
                    summary,
                    event_id: selectedEventId ? String(selectedEventId) : undefined,
                    group_id: groupId || undefined,
                    post_type: 'blog',
                    tagged_profile_ids: taggedProfileIds,
                });
                currentId = (_q = (_p = created === null || created === void 0 ? void 0 : created.post) === null || _p === void 0 ? void 0 : _p.id) !== null && _q !== void 0 ? _q : null;
            }
            if (currentId && media.length > 0) {
                yield uploadMediaBatch(apiAccessToken, {
                    files: media.map((item) => {
                        var _a, _b;
                        return ({
                            uri: item.uri,
                            type: (_a = item.mimeType) !== null && _a !== void 0 ? _a : (item.type === 'video' ? 'video/mp4' : 'image/jpeg'),
                            name: (_b = item.name) !== null && _b !== void 0 ? _b : `blog-${Date.now()}`,
                        });
                    }),
                    post_id: String(currentId),
                    collection_scope_key: groupId ? undefined : collectionScopeKey,
                    skip_profile_collection: Boolean(groupId),
                });
            }
            navigation.goBack();
        }
        finally {
            setIsSaving(false);
        }
    }), [apiAccessToken, buildDescriptionWithMeta, collectionScopeKey, description, groupId, highlight, linkedPeople, media, mode, navigation, postDate, postId, selectedEventId, skipHighlight, title]);
    const titleInvalid = showValidation && title.trim().length === 0;
    const descriptionInvalid = showValidation && description.trim().length === 0;
    const dateInvalid = showValidation && (!postDate || Number.isNaN(new Date(postDate).getTime()));
    const deleteEntry = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !postId)
            return;
        try {
            yield deletePost(apiAccessToken, String(postId));
            navigation.goBack();
        }
        catch (_r) {
            // ignore
        }
    }), [apiAccessToken, navigation, postId]);
    const TOTAL_STEPS = 7;
    const addPerson = useCallback((person) => {
        const safeName = String(typeof person === 'string' ? person : person.display_name).trim();
        const safeId = typeof person === 'string' ? '' : String(person.profile_id || '').trim();
        if (!safeName)
            return;
        setSkipPeople(false);
        setLinkedPeople((prev) => {
            var _a;
            const existingIndex = prev.findIndex((entry) => String(entry.display_name).trim().toLowerCase() === safeName.toLowerCase());
            if (existingIndex !== -1) {
                if (!safeId || ((_a = prev[existingIndex]) === null || _a === void 0 ? void 0 : _a.profile_id))
                    return prev;
                const next = [...prev];
                next[existingIndex] = Object.assign(Object.assign({}, next[existingIndex]), { profile_id: safeId });
                return next;
            }
            return [...prev, { profile_id: safeId || null, display_name: safeName }];
        });
        setPeopleQuery('');
        setPeopleResults([]);
    }, []);
    const removePerson = useCallback((name) => {
        const safe = String(name || '').trim().toLowerCase();
        setLinkedPeople((prev) => prev.filter((entry) => String(entry.display_name || '').trim().toLowerCase() !== safe));
    }, []);
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
            setShowValidation(true);
            if (!title.trim() || !description.trim())
                return;
        }
        if (currentStep === 1) {
            setShowValidation(true);
            if (!postDate || Number.isNaN(new Date(postDate).getTime()))
                return;
        }
        if (currentStep === 4 && !skipMedia && (media.length + existingPreview.length === 0)) {
            return;
        }
        if (currentStep === 3 && !skipHighlight && !highlight.trim()) {
            return;
        }
        if (currentStep === 5 && !skipEvent && !selectedEventId) {
            return;
        }
        if (currentStep === 6 && !skipPeople && linkedPeople.length === 0) {
            return;
        }
        if (currentStep < TOTAL_STEPS)
            setCurrentStep((prev) => prev + 1);
    }, [currentStep, description, existingPreview.length, highlight, linkedPeople.length, media.length, postDate, selectedEventId, skipEvent, skipHighlight, skipMedia, skipPeople, title]);
    const goPreviewStep = useCallback(() => {
        setShowPreviewModal(true);
    }, []);
    const closePreviewModal = useCallback(() => {
        setShowPreviewModal(false);
    }, []);
    const skipHighlightStep = useCallback(() => {
        if (currentStep !== 3)
            return;
        setSkipHighlight(true);
        setHighlight('');
        setCurrentStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : prev));
    }, [currentStep, TOTAL_STEPS]);
    const skipMediaStep = useCallback(() => {
        if (currentStep !== 4)
            return;
        setSkipMedia(true);
        setCurrentStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : prev));
    }, [currentStep, TOTAL_STEPS]);
    const skipEventStep = useCallback(() => {
        if (currentStep !== 5)
            return;
        setSkipEvent(true);
        setCurrentStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : prev));
    }, [currentStep, TOTAL_STEPS]);
    const skipPeopleStep = useCallback(() => {
        if (currentStep !== 6)
            return;
        setSkipPeople(true);
        setCurrentStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : prev));
    }, [currentStep, TOTAL_STEPS]);
    const canGoNext = useMemo(() => {
        if (currentStep === 1)
            return !!postDate && !Number.isNaN(new Date(postDate).getTime());
        if (currentStep === 2)
            return title.trim().length > 0 && description.trim().length > 0;
        if (currentStep === 3)
            return skipHighlight || highlight.trim().length > 0;
        if (currentStep === 4)
            return skipMedia || (media.length + existingPreview.length > 0);
        if (currentStep === 5)
            return skipEvent || !!selectedEventId;
        if (currentStep === 6)
            return skipPeople || linkedPeople.length > 0;
        return true;
    }, [currentStep, description, existingPreview.length, highlight, linkedPeople.length, media.length, postDate, selectedEventId, skipEvent, skipHighlight, skipMedia, skipPeople, title]);
    const firstPreviewImageUri = useMemo(() => {
        const firstImage = [...existingPreview, ...media].find((item) => (item === null || item === void 0 ? void 0 : item.type) === 'image' && (item === null || item === void 0 ? void 0 : item.uri));
        return (firstImage === null || firstImage === void 0 ? void 0 : firstImage.uri) ? String(firstImage.uri) : null;
    }, [existingPreview, media]);
    const renderPreviewCard = useCallback(() => (_jsxs(View, Object.assign({ style: Styles.previewCard }, { children: [_jsx(Text, Object.assign({ style: Styles.previewTitle }, { children: title || t('Untitled blog') })), _jsx(Text, Object.assign({ style: Styles.previewMeta }, { children: postDate ? postDate.toLocaleDateString() : t('No date') })), _jsx(Text, Object.assign({ style: Styles.previewText }, { children: description || t('No description') })), !skipHighlight && !!highlight.trim() && (_jsxs(Text, Object.assign({ style: Styles.previewMeta }, { children: [t('Highlight'), ": ", highlight.trim()] }))), selectedEvent ? (_jsxs(Text, Object.assign({ style: Styles.previewMeta }, { children: [t('Event'), ": ", selectedEventLabel] }))) : null, linkedPeople.length > 0 ? (_jsxs(Text, Object.assign({ style: Styles.previewMeta }, { children: [t('People'), ": ", linkedPeople.map((person) => person.display_name).join(', ')] }))) : null, _jsxs(Text, Object.assign({ style: Styles.previewMeta }, { children: [t('Media'), ": ", existingPreview.length + media.length] })), firstPreviewImageUri ? (_jsx(Image, { source: { uri: firstPreviewImageUri }, style: Styles.previewMediaImage, resizeMode: "cover" })) : null] }))), [
        Styles.previewMediaImage,
        Styles.previewCard,
        Styles.previewMeta,
        Styles.previewText,
        Styles.previewTitle,
        description,
        existingPreview.length,
        firstPreviewImageUri,
        highlight,
        linkedPeople,
        media.length,
        postDate,
        selectedEvent,
        selectedEventLabel,
        skipHighlight,
        t,
        title,
    ]);
    const handleEditorBack = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep((prev) => Math.max(1, prev - 1));
            return;
        }
        navigation.goBack();
    }, [currentStep, navigation]);
    useFocusEffect(useCallback(() => {
        const onHardwareBackPress = () => {
            if (showPreviewModal) {
                closePreviewModal();
                return true;
            }
            if (showEventModal) {
                setShowEventModal(false);
                return true;
            }
            if (showDateModal) {
                setShowDateModal(false);
                return true;
            }
            handleEditorBack();
            return true;
        };
        const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
        return () => {
            subscription.remove();
        };
    }, [closePreviewModal, handleEditorBack, showDateModal, showEventModal, showPreviewModal]));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "profile-blog-editor-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: handleEditorBack }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(View, Object.assign({ style: Styles.headerTitleRow }, { children: _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: mode === 'edit' ? t('Edit blog') : t('New blog') })) })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ contentContainerStyle: Styles.scrollContent, showsVerticalScrollIndicator: false }, { children: [_jsxs(View, Object.assign({ style: Styles.stepHeaderRow }, { children: [_jsxs(View, Object.assign({ style: Styles.stepTopRow }, { children: [_jsxs(Text, Object.assign({ style: Styles.stepCounter }, { children: [t('Step'), " ", currentStep, "/", TOTAL_STEPS] })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.stepPreviewButton, currentStep === TOTAL_STEPS && Styles.stepPreviewButtonDisabled], onPress: goPreviewStep, disabled: currentStep === TOTAL_STEPS }, { children: _jsx(Text, Object.assign({ style: Styles.stepPreviewText }, { children: t('Preview') })) }))] })), _jsx(Text, Object.assign({ style: Styles.stepTitle }, { children: currentStep === 1 ? t('Date') :
                                    currentStep === 2 ? t('Description') :
                                        currentStep === 3 ? t('Highlight') :
                                            currentStep === 4 ? t('Blog media') :
                                                currentStep === 5 ? t('Event') :
                                                    currentStep === 6 ? t('People') : t('Preview') }))] })), currentStep === 1 && (_jsxs(View, Object.assign({ style: Styles.fieldBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.fieldLabel }, { children: t('Date') })), _jsxs(TouchableOpacity, Object.assign({ style: [Styles.dateButton, dateInvalid && Styles.fieldInputError], onPress: openDateModal }, { children: [_jsx(Text, Object.assign({ testID: "profile-blog-date-button", style: Styles.dateText }, { children: postDate ? postDate.toLocaleDateString() : t('Select date') })), _jsx(CalendarIcon, { size: 16, color: colors.primaryColor, variant: "Linear" })] }))] }))), currentStep === 2 && (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.fieldBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.fieldLabel }, { children: t('Title') })), _jsx(TextInput, { style: [Styles.fieldInput, titleInvalid && Styles.fieldInputError], placeholder: t('PK 400m Limburg 2025'), placeholderTextColor: "#9B9F9F", value: title, onChangeText: setTitle, testID: "profile-blog-title-input" })] })), _jsxs(View, Object.assign({ style: Styles.fieldBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.fieldLabel }, { children: t('Description') })), _jsx(TextInput, { style: [Styles.fieldInput, Styles.fieldTextarea, descriptionInvalid && Styles.fieldInputError], placeholder: t('Write your story and results.'), placeholderTextColor: "#9B9F9F", value: description, onChangeText: setDescription, multiline: true, testID: "profile-blog-description-input" })] }))] })), currentStep === 3 && (_jsx(View, Object.assign({ style: Styles.fieldBlock }, { children: _jsx(TextInput, { style: Styles.fieldInput, placeholder: t('Race winning move, comeback, PR...'), placeholderTextColor: "#9B9F9F", value: highlight, onChangeText: (value) => {
                                setHighlight(value);
                                if (skipHighlight)
                                    setSkipHighlight(false);
                            } }) }))), currentStep === 4 && (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.mediaHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.fieldLabel }, { children: t('Media') })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.mediaAddButton, onPress: pickMedia }, { children: [_jsx(Add, { size: 14, color: "#FFFFFF", variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.mediaAddText }, { children: t('Add media') }))] }))] })), _jsxs(View, Object.assign({ style: Styles.mediaGrid }, { children: [existingPreview.map((item, index) => (_jsxs(View, Object.assign({ style: Styles.mediaTile }, { children: [_jsx(Image, { source: { uri: String(item.uri) }, style: Styles.mediaImage }), item.type === 'video' && (_jsx(View, Object.assign({ style: Styles.mediaBadge }, { children: _jsx(Text, Object.assign({ style: Styles.mediaBadgeText }, { children: t('Video') })) })))] }), `existing-${item.uri}-${index}`))), media.map((item, index) => (_jsxs(View, Object.assign({ style: Styles.mediaTile }, { children: [_jsx(Image, { source: { uri: item.uri }, style: Styles.mediaImage }), item.type === 'video' && (_jsx(View, Object.assign({ style: Styles.mediaBadge }, { children: _jsx(Text, Object.assign({ style: Styles.mediaBadgeText }, { children: t('Video') })) })))] }), `${item.uri}-${index}`))), media.length === 0 && existingPreview.length === 0 && (_jsx(Text, Object.assign({ style: Styles.mediaEmptyText }, { children: t('No media added yet.') })))] }))] })), currentStep === 5 && (_jsxs(View, Object.assign({ style: Styles.fieldBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.fieldLabel }, { children: t('Event') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.dateButton, onPress: () => setShowEventModal(true) }, { children: _jsx(Text, Object.assign({ style: Styles.dateText, numberOfLines: 1, testID: "profile-blog-event-button" }, { children: selectedEventLabel })) }))] }))), currentStep === 6 && (_jsxs(View, Object.assign({ style: Styles.fieldBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.fieldLabel }, { children: t('People') })), _jsx(View, Object.assign({ style: Styles.dateButton }, { children: _jsx(TextInput, { style: Styles.dateText, placeholder: t('Search people or type a name'), placeholderTextColor: colors.subTextColor, value: peopleQuery, onChangeText: setPeopleQuery, onSubmitEditing: () => addPerson(peopleQuery), testID: "profile-blog-people-input" }) })), peopleSearchLoading && _jsx(Text, Object.assign({ style: Styles.mediaEmptyText }, { children: t('Searching...') })), !peopleSearchLoading && peopleQuery.trim().length > 0 && peopleResults.length > 0 && (_jsx(View, Object.assign({ style: Styles.eventListContent }, { children: peopleResults.map((person) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.eventRow, onPress: () => addPerson(person) }, { children: _jsx(Text, Object.assign({ style: Styles.eventRowText }, { children: person.display_name })) }), person.profile_id))) }))), linkedPeople.length > 0 && (_jsx(View, Object.assign({ style: Styles.peopleChipsRow }, { children: linkedPeople.map((person) => {
                                    var _a;
                                    return (_jsxs(View, Object.assign({ style: Styles.peopleChip }, { children: [_jsx(Text, Object.assign({ style: Styles.peopleChipText }, { children: person.display_name })), _jsx(TouchableOpacity, Object.assign({ onPress: () => removePerson(person.display_name) }, { children: _jsx(Trash, { size: 14, color: colors.subTextColor, variant: "Linear" }) }))] }), `${(_a = person.profile_id) !== null && _a !== void 0 ? _a : 'manual'}-${person.display_name}`));
                                }) })))] }))), currentStep === 7 && (renderPreviewCard()), _jsx(View, Object.assign({ style: Styles.actionRow }, { children: currentStep < TOTAL_STEPS ? (_jsx(TouchableOpacity, Object.assign({ style: [Styles.saveButton, !canGoNext && Styles.saveButtonDisabled], onPress: goNextStep, disabled: !canGoNext, testID: "profile-blog-next-button" }, { children: _jsx(Text, Object.assign({ style: Styles.saveText }, { children: t('Next') })) }))) : (_jsx(TouchableOpacity, Object.assign({ style: Styles.saveButton, onPress: saveEntry, disabled: isSaving, testID: "profile-blog-save-button" }, { children: _jsx(Text, Object.assign({ style: Styles.saveText }, { children: isSaving ? t('Saving...') : t('Save') })) }))) })), currentStep === 3 ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.skipSecondaryButton, onPress: skipHighlightStep }, { children: _jsx(Text, Object.assign({ style: Styles.skipSecondaryText }, { children: t('Skip') })) }))) : currentStep === 4 ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.skipSecondaryButton, onPress: skipMediaStep }, { children: _jsx(Text, Object.assign({ style: Styles.skipSecondaryText }, { children: t('Skip') })) }))) : currentStep === 5 ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.skipSecondaryButton, onPress: skipEventStep }, { children: _jsx(Text, Object.assign({ style: Styles.skipSecondaryText }, { children: t('Skip') })) }))) : currentStep === 6 ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.skipSecondaryButton, onPress: skipPeopleStep }, { children: _jsx(Text, Object.assign({ style: Styles.skipSecondaryText }, { children: t('Skip') })) }))) : null, mode === 'edit' && postId ? (_jsxs(TouchableOpacity, Object.assign({ style: Styles.deleteButton, onPress: deleteEntry, testID: "profile-blog-delete-button" }, { children: [_jsx(Trash, { size: 16, color: "#ED5454", variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.deleteText }, { children: t('Delete blog') }))] }))) : null, _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 16 : 32 })] })), (isSaving || isPickingMedia) && (_jsx(View, Object.assign({ style: Styles.loadingOverlay }, { children: _jsxs(View, Object.assign({ style: Styles.loadingCard }, { children: [_jsx(ActivityIndicator, { color: colors.primaryColor }), _jsx(Text, Object.assign({ style: Styles.loadingText }, { children: isPickingMedia ? t('Preparing media...') : (media.length > 0 ? t('Uploading media...') : t('Saving...')) }))] })) }))), _jsx(Modal, Object.assign({ visible: showEventModal, transparent: true, animationType: "fade", onRequestClose: () => setShowEventModal(false) }, { children: _jsxs(View, Object.assign({ style: Styles.modalOverlay }, { children: [_jsx(Pressable, { style: Styles.modalBackdrop, onPress: () => setShowEventModal(false) }), _jsxs(View, Object.assign({ style: Styles.dateModalContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.dateModalTitle }, { children: t('Select event') })), _jsx(SizeBox, { height: 10 }), _jsxs(ScrollView, Object.assign({ style: Styles.eventList, showsVerticalScrollIndicator: false }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [Styles.eventRow, !selectedEventId && Styles.eventRowActive], onPress: () => {
                                                setSelectedEventId(null);
                                                setSkipEvent(false);
                                                setShowEventModal(false);
                                            } }, { children: _jsx(Text, Object.assign({ style: [Styles.eventRowText, !selectedEventId && Styles.eventRowTextActive] }, { children: t('No event selected') })) })), subscribedEvents.map((event) => {
                                            const eventId = String(event.event_id);
                                            const active = String(selectedEventId || '') === eventId;
                                            const label = event.event_name || event.event_title || t('Event');
                                            return (_jsx(TouchableOpacity, Object.assign({ style: [Styles.eventRow, active && Styles.eventRowActive], onPress: () => {
                                                    var _a;
                                                    setSelectedEventId(eventId);
                                                    setSkipEvent(false);
                                                    const eventDate = parseEventDate((_a = event.event_date) !== null && _a !== void 0 ? _a : null);
                                                    if (eventDate) {
                                                        setPostDate(eventDate);
                                                    }
                                                    setShowEventModal(false);
                                                } }, { children: _jsx(Text, Object.assign({ style: [Styles.eventRowText, active && Styles.eventRowTextActive], numberOfLines: 2 }, { children: label })) }), eventId));
                                        })] })), _jsx(TouchableOpacity, Object.assign({ style: Styles.modalDoneButton, onPress: () => setShowEventModal(false) }, { children: _jsx(Text, Object.assign({ style: Styles.modalDoneButtonText }, { children: t('Done') })) }))] }))] })) })), _jsx(DatePickerModal, { visible: showDateModal, value: postDate ? toDateString(postDate) : null, title: t('Select date'), maxDate: null, onClose: () => setShowDateModal(false), onApply: (value) => {
                    setPostDate(fromDateString(value));
                    setShowDateModal(false);
                } }), _jsx(Modal, Object.assign({ visible: showPreviewModal, animationType: "slide", onRequestClose: closePreviewModal }, { children: _jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: closePreviewModal }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(View, Object.assign({ style: Styles.headerTitleRow }, { children: _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Preview') })) })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ contentContainerStyle: Styles.scrollContent, showsVerticalScrollIndicator: false }, { children: [_jsx(View, Object.assign({ style: Styles.stepHeaderRow }, { children: _jsx(Text, Object.assign({ style: Styles.stepTitle }, { children: t('Preview') })) })), renderPreviewCard(), mode === 'edit' && postId ? (_jsxs(TouchableOpacity, Object.assign({ style: Styles.deleteButton, onPress: deleteEntry }, { children: [_jsx(Trash, { size: 16, color: "#ED5454", variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.deleteText }, { children: t('Delete blog') }))] }))) : null, _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 16 : 32 })] }))] })) }))] })));
};
export default ProfileBlogEditorScreen;
