import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Modal, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { ArrowLeft2, Trash, Calendar as CalendarIcon, CloseCircle, SearchNormal1, TickCircle } from 'iconsax-react-nativejs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from './ProfileTimelineEditStyles';
import type { TimelineEntry } from '../../components/profileTimeline/ProfileTimeline';
import { useAuth } from '../../context/AuthContext';
import { getMediaById, getPosts, getProfileSummary, getProfileTimeline, getUploadedCompetitions, searchProfiles, setMyProfileTimeline, uploadMediaBatch, type MediaViewAllItem, type PostSummary, type ProfileTimelineEntry } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next'
import CheckBox from '../../components/checkbox/CheckBox';

const ProfileTimelineEditScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const mode: 'add' | 'edit' = route?.params?.mode ?? 'add';
    const storageKey: string = route?.params?.storageKey ?? '@profile_timeline_self';
    const item: TimelineEntry | null = route?.params?.item ?? null;
    const blogStorageKey: string | null = route?.params?.blogStorageKey ?? null;
    const competitionOptions: string[] = useMemo(() => {
        const raw = route?.params?.competitionOptions;
        return Array.isArray(raw) ? raw : [];
    }, [route?.params?.competitionOptions]);

    const [form, setForm] = useState({
        title: '',
        description: '',
        highlight: '',
    });
    const [eventDate, setEventDate] = useState<Date>(new Date());
    const [showDateModal, setShowDateModal] = useState(false);
    const [calendarDate, setCalendarDate] = useState<string | null>(null);
    const [mediaItems, setMediaItems] = useState<MediaViewAllItem[]>([]);
    const [coverMedia, setCoverMedia] = useState<MediaViewAllItem | null>(null);
    const [linkedBlogIds, setLinkedBlogIds] = useState<string[]>([]);
    const [linkedCompetitionIds, setLinkedCompetitionIds] = useState<string[]>([]);
    const [availableBlogs, setAvailableBlogs] = useState<Array<{ id: string; title: string }>>([]);
    const [availableCompetitions, setAvailableCompetitions] = useState<Array<{ event_id: string; event_name: string | null; event_date?: string | null }>>([]);
    const [blogSearch, setBlogSearch] = useState('');
    const [competitionSearch, setCompetitionSearch] = useState('');
    const [showBlogModal, setShowBlogModal] = useState(false);
    const [showCompetitionModal, setShowCompetitionModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [skipHighlight, setSkipHighlight] = useState(false);
    const [linkedPeople, setLinkedPeople] = useState<string[]>([]);
    const [peopleQuery, setPeopleQuery] = useState('');
    const [peopleResults, setPeopleResults] = useState<Array<{ profile_id: string; display_name: string }>>([]);
    const [peopleSearchLoading, setPeopleSearchLoading] = useState(false);
    const { apiAccessToken } = useAuth();

    const TOTAL_STEPS = 7;

    const isSignedUrl = useCallback((value?: string | null) => {
        if (!value) return false;
        const lower = String(value).toLowerCase();
        return (
            lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp=')
        );
    }, []);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    const withAccessToken = useCallback((value?: string | null) => {
        if (!value) return undefined;
        if (!apiAccessToken) return value;
        if (isSignedUrl(value)) return value;
        if (value.includes('access_token=')) return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);

    const resolveThumbUrl = useCallback((media: MediaViewAllItem) => {
        const thumbCandidate =
            media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || media.original_url || null;
        const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);

    const isUuid = useCallback((value?: string | null) => {
        if (!value) return false;
        const v = String(value).toLowerCase();
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
    }, []);

    const toDateString = useCallback((date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    const parseDateValue = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value).trim();
        if (!raw) return null;
        if (/^\d{4}-\d{1,2}-\d{1,2}/.test(raw) || raw.includes('T')) {
            const iso = new Date(raw);
            if (!Number.isNaN(iso.getTime())) return iso;
        }
        const match = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
        if (match) {
            const day = Number(match[1]);
            const month = Number(match[2]);
            let year = Number(match[3]);
            if (year < 100) year += 2000;
            const parsed = new Date(year, month - 1, day);
            if (!Number.isNaN(parsed.getTime())) return parsed;
        }
        const fallback = new Date(raw);
        return Number.isNaN(fallback.getTime()) ? null : fallback;
    }, []);

    const splitDescriptionAndPeople = useCallback((value?: string | null) => {
        const raw = String(value || '');
        const rows = raw.split('\n').map((entry) => entry.trimEnd());
        const peopleLine = rows.length > 0 ? rows[rows.length - 1] : '';
        const match = peopleLine.match(/^people:\s*(.+)$/i);
        if (!match) {
            return { description: raw.trim(), people: [] as string[] };
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

    const buildDescriptionWithPeople = useCallback((description: string, people: string[]) => {
        const base = String(description || '').trim();
        const cleanPeople = Array.from(new Set(people.map((p) => String(p || '').trim()).filter(Boolean)));
        if (cleanPeople.length === 0) return base;
        if (!base) return `People: ${cleanPeople.join(', ')}`;
        return `${base}\nPeople: ${cleanPeople.join(', ')}`;
    }, []);

    const openDateModal = useCallback(() => {
        const seedDate = mode === 'edit' ? (eventDate || new Date()) : new Date();
        const seed = toDateString(seedDate);
        setCalendarDate(seed);
        setShowDateModal(true);
    }, [eventDate, mode, toDateString]);

    const applyDateModal = useCallback(() => {
        if (calendarDate) {
            const [year, month, day] = calendarDate.split('-').map(Number);
            if (year && month && day) {
                const next = new Date(eventDate);
                next.setFullYear(year, month - 1, day);
                setEventDate(next);
            }
        }
        setShowDateModal(false);
    }, [calendarDate, eventDate]);

    useEffect(() => {
        if (!item) return;
        setForm({
            title: item.title,
            description: splitDescriptionAndPeople(item.description).description,
            highlight: item.highlight ?? '',
        });
        setLinkedPeople(splitDescriptionAndPeople(item.description).people);
        setSkipHighlight(!String(item.highlight ?? '').trim());
        const seeded = parseDateValue((item as any).event_date ?? item.date ?? null) ?? new Date();
        setEventDate(seeded);
        setMediaItems(Array.isArray((item as any).mediaItems) ? (item as any).mediaItems : []);
        setCoverMedia((item as any).cover_media_id && Array.isArray((item as any).mediaItems)
            ? (item as any).mediaItems.find((m: any) => String(m.media_id) === String((item as any).cover_media_id)) ?? null
            : null);
        const linkedBlogsRaw = Array.isArray((item as any).linkedBlogs) ? (item as any).linkedBlogs : [];
        const linkedCompsRaw = Array.isArray((item as any).linkedCompetitions) ? (item as any).linkedCompetitions : [];
        const blogIds = Array.isArray((item as any).linkedBlogIds)
            ? (item as any).linkedBlogIds
            : linkedBlogsRaw.map((b: any) => (typeof b === 'string' ? b : b?.id)).filter(Boolean);
        const compIds = Array.isArray((item as any).linkedCompetitionIds)
            ? (item as any).linkedCompetitionIds
            : linkedCompsRaw.map((c: any) => (typeof c === 'string' ? c : c?.id)).filter(Boolean);
        setLinkedBlogIds(blogIds);
        setLinkedCompetitionIds(compIds);
    }, [item, parseDateValue, splitDescriptionAndPeople]);

    useEffect(() => {
        if (!apiAccessToken || !item) return;
        const coverId = (item as any)?.cover_media_id;
        if (!coverId) return;
        if (coverMedia && String(coverMedia.media_id) === String(coverId)) return;
        const existing = mediaItems.find((m) => String(m.media_id) === String(coverId));
        if (existing) {
            setCoverMedia(existing);
            return;
        }
        getMediaById(apiAccessToken, String(coverId))
            .then((media) => setCoverMedia(media))
            .catch(() => {});
    }, [apiAccessToken, coverMedia, item, mediaItems]);

    useEffect(() => {
        const loadOptions = async () => {
            if (!apiAccessToken) {
                if (blogStorageKey) {
                    const stored = await AsyncStorage.getItem(blogStorageKey);
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            if (Array.isArray(parsed)) {
                                const list = parsed
                                    .map((entry: any) => ({ id: String(entry.id), title: String(entry.title ?? 'Blog') }))
                                    .filter((entry: any) => entry.title);
                                setAvailableBlogs(list);
                            }
                        } catch {
                            // ignore
                        }
                    }
                }
                if (competitionOptions?.length) {
                    setAvailableCompetitions(competitionOptions.map((title) => ({ event_id: title, event_name: title })));
                }
                return;
            }

            try {
                const summary = await getProfileSummary(apiAccessToken);
                const postsResp = await getPosts(apiAccessToken, { author_profile_id: summary.profile_id, limit: 200 });
                const posts = Array.isArray(postsResp?.posts) ? postsResp.posts : [];
                setAvailableBlogs(posts.map((p: PostSummary) => ({ id: String(p.id), title: String(p.title || 'Blog') })));
            } catch {
                setAvailableBlogs([]);
            }

            try {
                const comps = await getUploadedCompetitions(apiAccessToken, { limit: 200 });
                const items = Array.isArray(comps?.competitions) ? comps.competitions : [];
                setAvailableCompetitions(items.map((c: any) => ({
                    event_id: String(c.event_id),
                    event_name: c.event_name ?? null,
                    event_date: c.event_date ?? null,
                })));
            } catch {
                setAvailableCompetitions([]);
            }
        };

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

    const saveItem = useCallback(async () => {
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
        const coverId = coverMedia?.media_id ? String(coverMedia.media_id) : (mediaIds[0] || null);

        try {
            // Prefer server timeline (source of truth). Fallback to local storage if no token.
            if (apiAccessToken) {
                const resp = await getProfileTimeline(apiAccessToken, 'me');
                const current: ProfileTimelineEntry[] = Array.isArray((resp as any)?.items) ? (resp as any).items : [];
                const nextId = item?.id && isUuid(String(item.id)) ? String(item.id) : undefined;
                const next: ProfileTimelineEntry = {
                    ...(nextId ? { id: nextId } : {}),
                    year: yearValue,
                    event_date: eventDateIso,
                    title,
                    description,
                    highlight: skipHighlight ? null : (form.highlight.trim() || null),
                    cover_media_id: coverId || null,
                    media_ids: mediaIds,
                    linked_post_ids: linkedBlogIds,
                    linked_event_ids: linkedCompetitionIds,
                } as any;
                const updated = mode === 'edit' && item && nextId
                    ? current.map((e) => (String(e.id) === String(nextId) ? { ...e, ...next } : e))
                    : [...current, next];
                await setMyProfileTimeline(apiAccessToken, updated);
                navigation.goBack();
                return;
            }

            const stored = await AsyncStorage.getItem(storageKey);
            const list: TimelineEntry[] = stored ? JSON.parse(stored) : [];
            const displayDate = eventDateIso ? new Date(eventDateIso).toLocaleDateString('en-GB') : '';
            if (mode === 'edit' && item) {
                const updated = list.map((entry) =>
                    entry.id === item.id
                        ? {
                            ...entry,
                            year: String(yearValue),
                            date: displayDate,
                            title,
                            description,
                            highlight: skipHighlight ? '' : form.highlight.trim(),
                            photos: mediaItems.map((m) => resolveThumbUrl(m)).filter(Boolean) as string[],
                            backgroundImage: coverMedia ? (resolveThumbUrl(coverMedia) || undefined) : undefined,
                            linkedBlogs: linkedBlogIds,
                            linkedCompetitions: linkedCompetitionIds,
                        }
                        : entry,
                );
                await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
            } else {
                const nextLocal: TimelineEntry = {
                    id: `tl-${Date.now()}`,
                    year: String(yearValue),
                    date: displayDate,
                    title,
                            description,
                            highlight: skipHighlight ? '' : form.highlight.trim(),
                    photos: mediaItems.map((m) => resolveThumbUrl(m)).filter(Boolean) as string[],
                    backgroundImage: coverMedia ? (resolveThumbUrl(coverMedia) || undefined) : undefined,
                    linkedBlogs: linkedBlogIds,
                    linkedCompetitions: linkedCompetitionIds,
                };
                const updated = [...list, nextLocal].sort((a, b) => Number(a.year) - Number(b.year));
                await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
            }
            navigation.goBack();
        } catch (e: any) {
            const message = String(e?.message ?? e);
            Alert.alert(t('Save failed'), message);
        } finally {
            setIsSaving(false);
        }
    }, [apiAccessToken, buildDescriptionWithPeople, coverMedia, eventDate, form.description, form.highlight, form.title, isSaving, isUploading, item, linkedBlogIds, linkedCompetitionIds, linkedPeople, mediaItems, mode, navigation, resolveThumbUrl, skipHighlight, storageKey, t, isUuid]);

    const deleteItem = useCallback(async () => {
        if (!item) return;
        if (apiAccessToken) {
            const resp = await getProfileTimeline(apiAccessToken, 'me');
            const current: ProfileTimelineEntry[] = Array.isArray((resp as any)?.items) ? (resp as any).items : [];
            const updated = current.filter((e) => String(e.id) !== String(item.id));
            await setMyProfileTimeline(apiAccessToken, updated);
            navigation.goBack();
            return;
        }
        const stored = await AsyncStorage.getItem(storageKey);
        const list: TimelineEntry[] = stored ? JSON.parse(stored) : [];
        const updated = list.filter((entry) => entry.id !== item.id);
        await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
        navigation.goBack();
    }, [apiAccessToken, item, navigation, storageKey]);

    const uploadAssets = useCallback(async (assets: Array<{ uri?: string; type?: string | null; fileName?: string | null }>) => {
        if (!apiAccessToken) return [];
        const guessMimeType = (asset: { uri?: string; type?: string | null; fileName?: string | null }) => {
            if (asset.type) return asset.type;
            const seed = String(asset.fileName || asset.uri || '').toLowerCase();
            if (seed.endsWith('.mp4')) return 'video/mp4';
            if (seed.endsWith('.mov')) return 'video/quicktime';
            if (seed.endsWith('.m4v')) return 'video/x-m4v';
            if (seed.endsWith('.jpg') || seed.endsWith('.jpeg')) return 'image/jpeg';
            if (seed.endsWith('.png')) return 'image/png';
            return 'application/octet-stream';
        };
        const files = assets
            .filter((asset) => asset?.uri)
            .map((asset) => ({
                uri: String(asset.uri),
                type: guessMimeType(asset),
                name: asset.fileName || `timeline-${Date.now()}`,
            }));
        if (files.length === 0) return [];
        setIsUploading(true);
        try {
            const resp = await uploadMediaBatch(apiAccessToken, { files });
            const mediaIds = Array.isArray(resp?.results)
                ? resp.results.map((r: any) => r.media_id).filter(Boolean)
                : [];
            if (mediaIds.length === 0) return [];
            const fetched = await Promise.all(mediaIds.map((id: string) => getMediaById(apiAccessToken, id)));
            return fetched.filter(Boolean) as MediaViewAllItem[];
        } catch (e: any) {
            Alert.alert(t('Upload failed'), String(e?.message ?? e));
            return [];
        } finally {
            setIsUploading(false);
        }
    }, [apiAccessToken, t]);

    const addMedia = useCallback(async () => {
        const res = await launchImageLibrary({
            mediaType: 'mixed',
            selectionLimit: 8,
            quality: 0.9,
        });
        if (res.didCancel || !res.assets) return;
        const uploaded = await uploadAssets(res.assets);
        if (uploaded.length > 0) {
            setMediaItems((prev) => [...prev, ...uploaded]);
        }
    }, [uploadAssets]);

    const pickBackground = useCallback(async () => {
        const res = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            quality: 0.9,
        });
        if (res.didCancel || !res.assets) return;
        const uploaded = await uploadAssets(res.assets);
        if (uploaded.length > 0) {
            setCoverMedia(uploaded[0]);
        }
    }, [uploadAssets]);

    const clearBackground = useCallback(() => {
        setCoverMedia(null);
    }, []);

    const removeMedia = useCallback((mediaId: string) => {
        setMediaItems((prev) => prev.filter((item) => String(item.media_id) !== String(mediaId)));
    }, []);

    const toggleBlog = useCallback((id: string) => {
        setLinkedBlogIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
    }, []);

    const toggleCompetition = useCallback((id: string) => {
        setLinkedCompetitionIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
    }, []);

    const addPerson = useCallback((name: string) => {
        const safe = String(name || '').trim();
        if (!safe) return;
        setLinkedPeople((prev) => (prev.includes(safe) ? prev : [...prev, safe]));
        setPeopleQuery('');
        setPeopleResults([]);
    }, []);

    const removePerson = useCallback((name: string) => {
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
        const timer = setTimeout(async () => {
            setPeopleSearchLoading(true);
            try {
                const resp = await searchProfiles(apiAccessToken, { q: peopleQuery.trim(), limit: 8 });
                if (!mounted) return;
                const list = Array.isArray(resp?.profiles)
                    ? resp.profiles
                        .map((p) => ({
                            profile_id: String(p.profile_id || ''),
                            display_name: String(p.display_name || '').trim(),
                        }))
                        .filter((p) => p.profile_id && p.display_name)
                    : [];
                setPeopleResults(list);
            } catch {
                if (mounted) setPeopleResults([]);
            } finally {
                if (mounted) setPeopleSearchLoading(false);
            }
        }, 250);
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
        if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    }, [currentStep]);
    const goPreviewStep = useCallback(() => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(TOTAL_STEPS);
        }
    }, [currentStep, TOTAL_STEPS]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>
                    {mode === 'edit' ? 'Edit milestone' : 'Add milestone'}
                </Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView contentContainerStyle={Styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={Styles.stepHeaderRow}>
                    <Text style={Styles.stepCounter}>{t('Step')} {currentStep}/{TOTAL_STEPS}</Text>
                    <Text style={Styles.stepTitle}>
                        {currentStep === 1 ? t('Date') :
                            currentStep === 2 ? t('Description') :
                                currentStep === 3 ? t('Highlight') :
                                    currentStep === 4 ? t('Timeline background') :
                                        currentStep === 5 ? t('Milestone media') :
                                            currentStep === 6 ? t('Links') : t('Preview')}
                    </Text>
                </View>

                {currentStep === 1 && (
                    <View style={Styles.fieldBlock}>
                        <Text style={Styles.fieldLabel}>{t('Date')}</Text>
                        <TouchableOpacity style={Styles.dateButton} onPress={openDateModal}>
                            <CalendarIcon size={16} color={colors.mainTextColor} variant="Linear" />
                            <Text style={Styles.dateText}>{eventDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {currentStep === 2 && (
                    <>
                        <View style={Styles.fieldBlock}>
                            <Text style={Styles.fieldLabel}>{t('Title')}</Text>
                            <TextInput
                                style={Styles.fieldInput}
                                placeholder={t('Qualified for nationals')}
                                placeholderTextColor="#9B9F9F"
                                value={form.title}
                                onChangeText={(text) => setForm((prev) => ({ ...prev, title: text }))}
                            />
                        </View>
                        <View style={Styles.fieldBlock}>
                            <Text style={Styles.fieldLabel}>{t('Description')}</Text>
                            <TextInput
                                style={[Styles.fieldInput, Styles.fieldTextarea]}
                                placeholder={t('Share the highlight and what it meant.')}
                                placeholderTextColor="#9B9F9F"
                                value={form.description}
                                onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
                                multiline
                            />
                        </View>
                    </>
                )}

                {currentStep === 3 && (
                    <View style={Styles.fieldBlock}>
                        <View style={Styles.skipRow}>
                            <CheckBox isChecked={skipHighlight} onPressCheckBox={(checked) => setSkipHighlight(Boolean(checked))} />
                            <Text style={Styles.skipLabel}>{t('Skip highlight')}</Text>
                        </View>
                        {!skipHighlight && (
                            <>
                                <Text style={Styles.fieldLabel}>{t('Highlight (optional)')}</Text>
                                <TextInput
                                    style={Styles.fieldInput}
                                    placeholder={t('PB 1:54.30')}
                                    placeholderTextColor="#9B9F9F"
                                    value={form.highlight}
                                    onChangeText={(text) => setForm((prev) => ({ ...prev, highlight: text }))}
                                />
                            </>
                        )}
                    </View>
                )}

                {currentStep === 4 && (
                    <View style={Styles.fieldBlock}>
                        <View style={Styles.inlineHeader}>
                            <Text style={Styles.fieldLabel}>{t('Timeline background')}</Text>
                            <TouchableOpacity style={Styles.inlineAction} onPress={pickBackground}>
                                <Text style={Styles.inlineActionText}>{coverMedia ? t('Replace image') : t('Select image')}</Text>
                            </TouchableOpacity>
                        </View>
                        {!coverMedia ? (
                            <Text style={Styles.helperText}>{t('Pick one image to show as the timeline card background.')}</Text>
                        ) : (
                            <View style={Styles.backgroundPreviewRow}>
                                {resolveThumbUrl(coverMedia) ? (
                                    <Image
                                        source={{ uri: String(resolveThumbUrl(coverMedia)) }}
                                        style={Styles.backgroundPreview}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[Styles.backgroundPreview, { backgroundColor: colors.btnBackgroundColor }]} />
                                )}
                                <TouchableOpacity style={Styles.inlineAction} onPress={clearBackground}>
                                    <Text style={Styles.inlineActionText}>{t('Remove')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {currentStep === 5 && (
                    <View style={Styles.fieldBlock}>
                        <View style={Styles.inlineHeader}>
                            <Text style={Styles.fieldLabel}>{t('Milestone media')}</Text>
                            <TouchableOpacity style={Styles.inlineAction} onPress={addMedia}>
                                <Text style={Styles.inlineActionText}>{t('Add media')}</Text>
                            </TouchableOpacity>
                        </View>
                        {mediaItems.length === 0 ? (
                            <Text style={Styles.helperText}>{t('Add photos or videos to show this milestone.')}</Text>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={Styles.photoRow}>
                                {mediaItems.map((media) => {
                                    const thumb = resolveThumbUrl(media);
                                    const isVideo = media.type === 'video';
                                    return (
                                        <TouchableOpacity
                                            key={String(media.media_id)}
                                            style={Styles.photoThumbWrapper}
                                            onPress={() => removeMedia(String(media.media_id))}
                                        >
                                            {thumb ? (
                                                <Image source={{ uri: String(thumb) }} style={Styles.photoThumbImage} resizeMode="cover" />
                                            ) : (
                                                <View style={Styles.photoThumbPlaceholder} />
                                            )}
                                            {isVideo && (
                                                <View style={Styles.mediaBadge}>
                                                    <Text style={Styles.mediaBadgeText}>{t('Video')}</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        )}
                        {isUploading && <Text style={Styles.helperText}>{t('Uploading...')}</Text>}
                    </View>
                )}

                {currentStep === 6 && (
                    <>
                        <View style={Styles.fieldBlock}>
                            <View style={Styles.sectionHeaderRow}>
                                <Text style={Styles.sectionTitle}>{t('Blogs')}</Text>
                                <TouchableOpacity style={Styles.sectionAction} onPress={() => setShowBlogModal(true)}>
                                    <Text style={Styles.sectionActionText}>{linkedBlogIds.length > 0 ? t('Edit') : t('Select')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={Styles.fieldBlock}>
                            <View style={Styles.sectionHeaderRow}>
                                <Text style={Styles.sectionTitle}>{t('Competitions')}</Text>
                                <TouchableOpacity style={Styles.sectionAction} onPress={() => setShowCompetitionModal(true)}>
                                    <Text style={Styles.sectionActionText}>{linkedCompetitionIds.length > 0 ? t('Edit') : t('Select')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={Styles.fieldBlock}>
                            <Text style={Styles.sectionTitle}>{t('People')}</Text>
                            <View style={Styles.modalSearchRow}>
                                <SearchNormal1 size={18} color={colors.subTextColor} variant="Linear" />
                                <TextInput
                                    style={Styles.modalSearchInput}
                                    placeholder={t('Search people or type a name')}
                                    placeholderTextColor={colors.subTextColor}
                                    value={peopleQuery}
                                    onChangeText={setPeopleQuery}
                                    onSubmitEditing={() => addPerson(peopleQuery)}
                                />
                            </View>
                            {peopleSearchLoading && <Text style={Styles.helperText}>{t('Searching...')}</Text>}
                            {!peopleSearchLoading && peopleQuery.trim().length > 0 && peopleResults.length > 0 && (
                                <View style={Styles.modalListContent}>
                                    {peopleResults.map((person) => (
                                        <TouchableOpacity
                                            key={person.profile_id}
                                            style={Styles.modalOption}
                                            onPress={() => addPerson(person.display_name)}
                                        >
                                            <Text style={Styles.modalOptionTitle}>{person.display_name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            {linkedPeople.length > 0 && (
                                <View style={Styles.competitionChipsRow}>
                                    {linkedPeople.map((person) => (
                                        <View key={person} style={Styles.competitionChip}>
                                            <Text style={Styles.competitionChipText} numberOfLines={1}>{person}</Text>
                                            <TouchableOpacity style={Styles.competitionChipRemove} onPress={() => removePerson(person)}>
                                                <CloseCircle size={14} color={colors.subTextColor} variant="Linear" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </>
                )}

                {currentStep === 7 && (
                    <View style={Styles.previewCard}>
                        <Text style={Styles.previewTitle}>{form.title || t('Untitled milestone')}</Text>
                        <Text style={Styles.previewMeta}>{eventDate.toLocaleDateString()}</Text>
                        <Text style={Styles.previewText}>{form.description || t('No description')}</Text>
                        {!skipHighlight && !!form.highlight.trim() && (
                            <Text style={Styles.previewSubline}>{t('Highlight')}: {form.highlight.trim()}</Text>
                        )}
                        {linkedPeople.length > 0 && (
                            <Text style={Styles.previewSubline}>{t('People')}: {linkedPeople.join(', ')}</Text>
                        )}
                        <Text style={Styles.previewMeta}>
                            {t('Media')}: {mediaItems.length} · {t('Blogs')}: {linkedBlogIds.length} · {t('Competitions')}: {linkedCompetitionIds.length}
                        </Text>
                    </View>
                )}

                <View style={Styles.actionRow}>
                    {currentStep < TOTAL_STEPS ? (
                        <TouchableOpacity style={Styles.previewShortcutButton} onPress={goPreviewStep}>
                            <Text style={Styles.previewShortcutText}>{t('Preview')}</Text>
                        </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity
                        style={Styles.cancelButton}
                        onPress={currentStep === 1 ? () => navigation.goBack() : goPrevStep}
                    >
                        <Text style={Styles.cancelText}>{currentStep === 1 ? t('Cancel') : t('Back')}</Text>
                    </TouchableOpacity>
                    {currentStep < TOTAL_STEPS ? (
                        <TouchableOpacity style={Styles.saveButton} onPress={goNextStep}>
                            <Text style={Styles.saveText}>{t('Next')}</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={Styles.saveButton} onPress={saveItem} disabled={isSaving || isUploading}>
                            <Text style={Styles.saveText}>{isSaving ? t('Saving...') : t('Save')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {mode === 'edit' && item ? (
                    <TouchableOpacity style={Styles.deleteButton} onPress={deleteItem}>
                        <Trash size={16} color="#ED5454" variant="Linear" />
                        <Text style={Styles.deleteText}>{t('Delete milestone')}</Text>
                    </TouchableOpacity>
                ) : null}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 16 : 32} />
            </ScrollView>

            <Modal
                visible={showDateModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDateModal(false)}
            >
                <View style={Styles.modalOverlay}>
                    <Pressable style={Styles.modalBackdrop} onPress={() => setShowDateModal(false)} />
                    <View style={Styles.dateModalContainer}>
                        <Text style={Styles.dateModalTitle}>{t('Select date')}</Text>
                        <SizeBox height={10} />
                        <Calendar
                            current={calendarDate ?? undefined}
                            markedDates={calendarDate ? { [calendarDate]: { selected: true, selectedColor: colors.primaryColor } } : undefined}
                            onDayPress={(day) => setCalendarDate(day.dateString)}
                            enableSwipeMonths
                            theme={{
                                calendarBackground: colors.cardBackground,
                                textSectionTitleColor: colors.subTextColor,
                                dayTextColor: colors.mainTextColor,
                                monthTextColor: colors.mainTextColor,
                                arrowColor: colors.primaryColor,
                                selectedDayBackgroundColor: colors.primaryColor,
                                selectedDayTextColor: colors.pureWhite,
                                todayTextColor: colors.primaryColor,
                            }}
                            style={{ borderRadius: 12 }}
                        />
                        <TouchableOpacity style={Styles.modalDoneButton} onPress={applyDateModal}>
                            <Text style={Styles.modalDoneButtonText}>{t('Done')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showBlogModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowBlogModal(false)}
            >
                <View style={Styles.modalOverlay}>
                    <View style={Styles.modalCard}>
                        <View style={Styles.modalHeader}>
                            <Text style={Styles.modalTitle}>{t('Select blogs')}</Text>
                            <TouchableOpacity
                                style={Styles.modalCloseButton}
                                onPress={() => setShowBlogModal(false)}
                            >
                                <CloseCircle size={22} color={colors.subTextColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <View style={Styles.modalSearchRow}>
                            <SearchNormal1 size={18} color={colors.subTextColor} variant="Linear" />
                            <TextInput
                                style={Styles.modalSearchInput}
                                placeholder={t('Search blogs')}
                                placeholderTextColor={colors.subTextColor}
                                value={blogSearch}
                                onChangeText={setBlogSearch}
                            />
                        </View>
                        <ScrollView style={Styles.modalList} contentContainerStyle={Styles.modalListContent}>
                            {blogChoices.length > 0 ? (
                                blogChoices.map((entry) => {
                                    const selected = linkedBlogIds.includes(entry.id);
                                    return (
                                        <TouchableOpacity
                                            key={entry.id}
                                            style={[Styles.modalOption, selected && Styles.modalOptionSelected]}
                                            onPress={() => toggleBlog(entry.id)}
                                        >
                                            <View style={Styles.modalOptionTextWrap}>
                                                <Text style={Styles.modalOptionTitle}>{entry.title}</Text>
                                            </View>
                                            {selected && (
                                                <TickCircle size={22} color={colors.primaryColor} variant="Bold" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <Text style={Styles.modalEmptyText}>{t('No blogs found.')}</Text>
                            )}
                        </ScrollView>
                        <TouchableOpacity style={Styles.modalDoneButton} onPress={() => setShowBlogModal(false)}>
                            <Text style={Styles.modalDoneButtonText}>{t('Done')} ({linkedBlogIds.length} {t('selected')})</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showCompetitionModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCompetitionModal(false)}
            >
                <View style={Styles.modalOverlay}>
                    <View style={Styles.modalCard}>
                        <View style={Styles.modalHeader}>
                            <Text style={Styles.modalTitle}>{t('Select competitions')}</Text>
                            <TouchableOpacity
                                style={Styles.modalCloseButton}
                                onPress={() => setShowCompetitionModal(false)}
                            >
                                <CloseCircle size={22} color={colors.subTextColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <View style={Styles.modalSearchRow}>
                            <SearchNormal1 size={18} color={colors.subTextColor} variant="Linear" />
                            <TextInput
                                style={Styles.modalSearchInput}
                                placeholder={t('Search competitions')}
                                placeholderTextColor={colors.subTextColor}
                                value={competitionSearch}
                                onChangeText={setCompetitionSearch}
                            />
                        </View>
                        <ScrollView style={Styles.modalList} contentContainerStyle={Styles.modalListContent}>
                            {competitionChoices.length > 0 ? (
                                competitionChoices.map((entry) => {
                                    const selected = linkedCompetitionIds.includes(entry.event_id);
                                    const meta = [entry.event_date ? new Date(entry.event_date).toLocaleDateString() : null]
                                        .filter(Boolean)
                                        .join(' • ');
                                    return (
                                        <TouchableOpacity
                                            key={entry.event_id}
                                            style={[Styles.modalOption, selected && Styles.modalOptionSelected]}
                                            onPress={() => toggleCompetition(entry.event_id)}
                                        >
                                            <View style={Styles.modalOptionTextWrap}>
                                                <Text style={Styles.modalOptionTitle}>{entry.event_name || t('competition')}</Text>
                                                {!!meta && <Text style={Styles.modalOptionSubtext}>{meta}</Text>}
                                            </View>
                                            {selected && (
                                                <TickCircle size={22} color={colors.primaryColor} variant="Bold" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <Text style={Styles.modalEmptyText}>{t('No competitions found.')}</Text>
                            )}
                        </ScrollView>
                        <TouchableOpacity style={Styles.modalDoneButton} onPress={() => setShowCompetitionModal(false)}>
                            <Text style={Styles.modalDoneButtonText}>{t('Done')} ({linkedCompetitionIds.length} {t('selected')})</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {isUploading && (
                <View style={Styles.loadingOverlay}>
                    <View style={Styles.loadingCard}>
                        <ActivityIndicator color={colors.primaryColor} />
                        <Text style={Styles.loadingText}>{t('Uploading...')}</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default ProfileTimelineEditScreen;
