import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft2, Trash, Calendar } from 'iconsax-react-nativejs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from './ProfileTimelineEditStyles';
import type { TimelineEntry } from '../../components/profileTimeline/ProfileTimeline';
import { useAuth } from '../../context/AuthContext';
import { getMediaById, getPosts, getProfileSummary, getProfileTimeline, getUploadedCompetitions, setMyProfileTimeline, uploadMediaBatch, type MediaViewAllItem, type PostSummary, type ProfileTimelineEntry } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next'

const ProfileTimelineEditScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const mode: 'add' | 'edit' = route?.params?.mode ?? 'add';
    const storageKey: string = route?.params?.storageKey ?? '@profile_timeline_self';
    const item: TimelineEntry | null = route?.params?.item ?? null;
    const blogStorageKey: string | null = route?.params?.blogStorageKey ?? null;
    const competitionOptions: string[] = route?.params?.competitionOptions ?? [];

    const [form, setForm] = useState({
        title: '',
        description: '',
        highlight: '',
    });
    const [eventDate, setEventDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [mediaItems, setMediaItems] = useState<MediaViewAllItem[]>([]);
    const [coverMedia, setCoverMedia] = useState<MediaViewAllItem | null>(null);
    const [linkedBlogIds, setLinkedBlogIds] = useState<string[]>([]);
    const [linkedCompetitionIds, setLinkedCompetitionIds] = useState<string[]>([]);
    const [availableBlogs, setAvailableBlogs] = useState<Array<{ id: string; title: string }>>([]);
    const [availableCompetitions, setAvailableCompetitions] = useState<Array<{ event_id: string; event_name: string | null; event_date?: string | null }>>([]);
    const [blogSearch, setBlogSearch] = useState('');
    const [competitionSearch, setCompetitionSearch] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const { apiAccessToken } = useAuth();

    const isSignedUrl = useCallback((value?: string | null) => {
        if (!value) return false;
        const lower = String(value).toLowerCase();
        return (
            lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('token=') ||
            lower.includes('expires=')
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

    useEffect(() => {
        if (!item) return;
        setForm({
            title: item.title,
            description: item.description,
            highlight: item.highlight ?? '',
        });
        if (item.date) {
            const dt = new Date(String(item.date));
            if (!Number.isNaN(dt.getTime())) setEventDate(dt);
        } else if (item.year) {
            const fallback = new Date(`${item.year}-01-01T00:00:00.000Z`);
            if (!Number.isNaN(fallback.getTime())) setEventDate(fallback);
        }
        setMediaItems(Array.isArray((item as any).mediaItems) ? (item as any).mediaItems : []);
        setCoverMedia((item as any).cover_media_id && Array.isArray((item as any).mediaItems)
            ? (item as any).mediaItems.find((m: any) => String(m.media_id) === String((item as any).cover_media_id)) ?? null
            : null);
        setLinkedBlogIds(Array.isArray((item as any).linkedBlogIds) ? (item as any).linkedBlogIds : []);
        setLinkedCompetitionIds(Array.isArray((item as any).linkedCompetitionIds) ? (item as any).linkedCompetitionIds : []);
    }, [item]);

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

    const saveItem = useCallback(async () => {
        const title = form.title.trim();
        const description = form.description.trim();
        if (!title || !description) return;

        const eventDateIso = eventDate ? new Date(eventDate).toISOString() : null;
        const yearValue = eventDate ? new Date(eventDate).getFullYear() : new Date().getFullYear();
        const mediaIds = mediaItems.map((m) => String(m.media_id)).filter(Boolean);
        const coverId = coverMedia?.media_id ? String(coverMedia.media_id) : (mediaIds[0] || null);

        // Prefer server timeline (source of truth). Fallback to local storage if no token.
        if (apiAccessToken) {
            const resp = await getProfileTimeline(apiAccessToken, 'me');
            const current: ProfileTimelineEntry[] = Array.isArray((resp as any)?.items) ? (resp as any).items : [];
            const nextId = item?.id ? String(item.id) : undefined;
            const next: ProfileTimelineEntry = {
                id: nextId || `tl-${Date.now()}`,
                year: yearValue,
                event_date: eventDateIso,
                title,
                description,
                highlight: form.highlight.trim() || null,
                cover_media_id: coverId || null,
                media_ids: mediaIds,
                linked_post_ids: linkedBlogIds,
                linked_event_ids: linkedCompetitionIds,
            } as any;
            const updated = mode === 'edit' && item
                ? current.map((e) => (String(e.id) === String(item.id) ? { ...e, ...next } : e))
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
                        highlight: form.highlight.trim(),
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
                highlight: form.highlight.trim(),
                photos: mediaItems.map((m) => resolveThumbUrl(m)).filter(Boolean) as string[],
                backgroundImage: coverMedia ? (resolveThumbUrl(coverMedia) || undefined) : undefined,
                linkedBlogs: linkedBlogIds,
                linkedCompetitions: linkedCompetitionIds,
            };
            const updated = [...list, nextLocal].sort((a, b) => Number(a.year) - Number(b.year));
            await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
        }
        navigation.goBack();
    }, [apiAccessToken, coverMedia, eventDate, form.description, form.highlight, form.title, item, linkedBlogIds, linkedCompetitionIds, mediaItems, mode, navigation, resolveThumbUrl, storageKey]);

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
        const files = assets
            .filter((asset) => asset?.uri)
            .map((asset) => ({
                uri: String(asset.uri),
                type: asset.type ?? undefined,
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
        } finally {
            setIsUploading(false);
        }
    }, [apiAccessToken]);

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

    const blogChoices = useMemo(() => {
        const q = blogSearch.trim().toLowerCase();
        return availableBlogs.filter((b) => !q || b.title.toLowerCase().includes(q));
    }, [availableBlogs, blogSearch]);
    const competitionChoices = useMemo(() => {
        const q = competitionSearch.trim().toLowerCase();
        const base = availableCompetitions.length ? availableCompetitions : competitionOptions.map((title) => ({ event_id: title, event_name: title, event_date: null }));
        return base.filter((c) => !q || String(c.event_name || '').toLowerCase().includes(q));
    }, [availableCompetitions, competitionOptions, competitionSearch]);

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
                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>{t('Date')}</Text>
                    <View style={Styles.dateRow}>
                        <TouchableOpacity style={Styles.dateButton} onPress={() => setShowDatePicker(true)}>
                            <Calendar size={16} color={colors.mainTextColor} variant="Linear" />
                            <Text style={Styles.dateText}>{eventDate.toLocaleString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={Styles.useCurrentButton}
                            onPress={() => setEventDate(new Date())}
                        >
                            <Text style={Styles.useCurrentText}>{t('Use current date')}</Text>
                        </TouchableOpacity>
                    </View>
                    {showDatePicker && (
                        <DateTimePicker
                            value={eventDate}
                            mode="datetime"
                            display="default"
                            onChange={(_, date) => {
                                setShowDatePicker(false);
                                if (date) setEventDate(date);
                            }}
                        />
                    )}
                </View>
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
                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>{t('Highlight (optional)')}</Text>
                    <TextInput
                        style={Styles.fieldInput}
                        placeholder={t('PB 1:54.30')}
                        placeholderTextColor="#9B9F9F"
                        value={form.highlight}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, highlight: text }))}
                    />
                </View>

                <View style={Styles.fieldBlock}>
                    <View style={Styles.inlineHeader}>
                        <Text style={Styles.fieldLabel}>{t('Timeline background')}</Text>
                        <TouchableOpacity style={Styles.inlineAction} onPress={pickBackground}>
                            <Text style={Styles.inlineActionText}>{t('Select image')}</Text>
                        </TouchableOpacity>
                    </View>
                    {!coverMedia ? (
                        <Text style={Styles.helperText}>{t('Pick one image to show as the timeline card background.')}</Text>
                    ) : (
                        <View style={Styles.backgroundPreviewRow}>
                            {resolveThumbUrl(coverMedia) ? (
                                <Image source={{ uri: String(resolveThumbUrl(coverMedia)) }} style={Styles.backgroundPreview} />
                            ) : (
                                <View style={[Styles.backgroundPreview, { backgroundColor: colors.btnBackgroundColor }]} />
                            )}
                            <TouchableOpacity style={Styles.inlineAction} onPress={clearBackground}>
                                <Text style={Styles.inlineActionText}>{t('Remove')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

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
                                return (
                                <TouchableOpacity key={String(media.media_id)} onPress={() => removeMedia(String(media.media_id))}>
                                    {thumb ? (
                                        <Image source={{ uri: String(thumb) }} style={Styles.photoThumb} />
                                    ) : (
                                        <View style={[Styles.photoThumb, { backgroundColor: colors.btnBackgroundColor }]} />
                                    )}
                                </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                    {isUploading && <Text style={Styles.helperText}>{t('Uploading...')}</Text>}
                </View>

                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>{t('Link blogs')}</Text>
                    <TextInput
                        style={Styles.searchInput}
                        placeholder={t('Search blogs')}
                        placeholderTextColor="#9B9F9F"
                        value={blogSearch}
                        onChangeText={setBlogSearch}
                    />
                    {blogChoices.length === 0 ? (
                        <Text style={Styles.helperText}>{t('Create a blog to link it here.')}</Text>
                    ) : (
                        <View style={Styles.choiceRow}>
                            {blogChoices.map((entry) => {
                                const active = linkedBlogIds.includes(entry.id);
                                return (
                                    <TouchableOpacity
                                        key={entry.id}
                                        style={[Styles.choiceChip, active && Styles.choiceChipActive]}
                                        onPress={() => toggleBlog(entry.id)}
                                    >
                                        <Text style={[Styles.choiceChipText, active && Styles.choiceChipTextActive]}>{entry.title}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>{t('Link competitions')}</Text>
                    <TextInput
                        style={Styles.searchInput}
                        placeholder={t('Search competitions')}
                        placeholderTextColor="#9B9F9F"
                        value={competitionSearch}
                        onChangeText={setCompetitionSearch}
                    />
                    {competitionChoices.length === 0 ? (
                        <Text style={Styles.helperText}>{t('Subscribe to a competition to link it here.')}</Text>
                    ) : (
                        <View style={Styles.choiceRow}>
                            {competitionChoices.map((entry) => {
                                const active = linkedCompetitionIds.includes(entry.event_id);
                                return (
                                    <TouchableOpacity
                                        key={entry.event_id}
                                        style={[Styles.choiceChip, active && Styles.choiceChipActive]}
                                        onPress={() => toggleCompetition(entry.event_id)}
                                    >
                                        <Text style={[Styles.choiceChipText, active && Styles.choiceChipTextActive]}>
                                            {entry.event_name || t('competition')}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={Styles.actionRow}>
                    <TouchableOpacity style={Styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={Styles.cancelText}>{t('Cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.saveButton} onPress={saveItem}>
                        <Text style={Styles.saveText}>{t('Save')}</Text>
                    </TouchableOpacity>
                </View>

                {mode === 'edit' && item ? (
                    <TouchableOpacity style={Styles.deleteButton} onPress={deleteItem}>
                        <Trash size={16} color="#ED5454" variant="Linear" />
                        <Text style={Styles.deleteText}>{t('Delete milestone')}</Text>
                    </TouchableOpacity>
                ) : null}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 16 : 32} />
            </ScrollView>
        </View>
    );
};

export default ProfileTimelineEditScreen;
