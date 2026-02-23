import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { ArrowLeft2, Add, Trash, Calendar as CalendarIcon } from 'iconsax-react-nativejs';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../context/ThemeContext';
import SizeBox from '../../constants/SizeBox';
import { createStyles } from './ProfileBlogEditorStyles';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { createPost, deletePost, getPostById, searchProfiles, updatePost, uploadMediaBatch, type MediaViewAllItem } from '../../services/apiGateway';
import CheckBox from '../../components/checkbox/CheckBox';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next'

type BlogMedia = {
    uri: string;
    type: 'image' | 'video';
    name?: string;
    mimeType?: string;
};

const ProfileBlogEditorScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const mode: 'add' | 'edit' = route?.params?.mode ?? 'add';
    const postId: string | null = route?.params?.postId ?? route?.params?.entry?.id ?? null;
    const entryPreview: any = route?.params?.entry ?? null;
    const groupId: string | null = route?.params?.groupId ? String(route.params.groupId) : null;
    const { apiAccessToken } = useAuth();
    const { events: subscribedEvents } = useEvents();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [postDate, setPostDate] = useState<Date | null>(null);
    const [showDateModal, setShowDateModal] = useState(false);
    const [calendarDate, setCalendarDate] = useState<string | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [media, setMedia] = useState<BlogMedia[]>([]);
    const [existingMedia, setExistingMedia] = useState<MediaViewAllItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isPickingMedia, setIsPickingMedia] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [skipHighlight, setSkipHighlight] = useState(false);
    const [skipMedia, setSkipMedia] = useState(false);
    const [skipEvent, setSkipEvent] = useState(false);
    const [skipPeople, setSkipPeople] = useState(false);
    const [highlight, setHighlight] = useState('');
    const [linkedPeople, setLinkedPeople] = useState<string[]>([]);
    const [peopleQuery, setPeopleQuery] = useState('');
    const [peopleResults, setPeopleResults] = useState<Array<{ profile_id: string; display_name: string }>>([]);
    const [peopleSearchLoading, setPeopleSearchLoading] = useState(false);

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

    const resolveThumbUrl = useCallback((mediaItem: MediaViewAllItem) => {
        const candidate =
            mediaItem.thumbnail_url || mediaItem.preview_url || mediaItem.full_url || mediaItem.raw_url || mediaItem.original_url || null;
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

    const selectedEvent = useMemo(
        () => subscribedEvents.find((event) => String(event.event_id) === String(selectedEventId)),
        [selectedEventId, subscribedEvents],
    );

    const selectedEventLabel = useMemo(() => {
        if (!selectedEvent) return t('No event selected');
        return selectedEvent.event_name || selectedEvent.event_title || t('Event');
    }, [selectedEvent, t]);

    const parseEventDate = useCallback((value?: string | null): Date | null => {
        if (!value) return null;
        const raw = String(value).trim();
        const direct = new Date(raw);
        if (!Number.isNaN(direct.getTime())) return direct;
        if (raw.includes('/')) {
            const [day, month, year] = raw.split('/').map(Number);
            if (!day || !month || !year) return null;
            const parsed = new Date(year, month - 1, day, 0, 0, 0, 0);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }
        return null;
    }, []);

    const splitDescriptionMeta = useCallback((value?: string | null) => {
        const lines = String(value || '').split('\n');
        let parsedHighlight = '';
        let parsedPeople: string[] = [];
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

    const buildDescriptionWithMeta = useCallback((baseDescription: string, valueHighlight: string, people: string[], skip: boolean) => {
        const out: string[] = [String(baseDescription || '').trim()].filter(Boolean);
        if (!skip && String(valueHighlight || '').trim()) {
            out.push(`Highlight: ${String(valueHighlight).trim()}`);
        }
        const cleanPeople = Array.from(new Set(people.map((p) => String(p || '').trim()).filter(Boolean)));
        if (cleanPeople.length > 0) {
            out.push(`People: ${cleanPeople.join(', ')}`);
        }
        return out.join('\n');
    }, []);

    useEffect(() => {
        if (entryPreview && mode === 'add') {
            setTitle(entryPreview.title ?? '');
            setDescription(entryPreview.description ?? '');
        }
    }, [entryPreview, mode]);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || mode !== 'edit' || !postId) return () => {};
        getPostById(apiAccessToken, String(postId))
            .then((resp) => {
                if (!mounted) return;
                if (resp?.post) {
                    setTitle(resp.post.title ?? '');
                    const parsed = splitDescriptionMeta(resp.post.description ?? '');
                    setDescription(parsed.description);
                    setHighlight(parsed.highlight);
                    setLinkedPeople(parsed.people);
                    setSkipHighlight(!parsed.highlight);
                    if (resp.post.created_at) {
                        const parsed = new Date(String(resp.post.created_at));
                        if (!Number.isNaN(parsed.getTime())) {
                            setPostDate(parsed);
                        }
                    }
                }
                setExistingMedia(Array.isArray((resp as any)?.media) ? (resp as any).media : []);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, mode, postId, splitDescriptionMeta]);

    const toDateString = useCallback((date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    const openDateModal = useCallback(() => {
        const seedDate = postDate || new Date();
        const seed = toDateString(seedDate);
        setCalendarDate(seed);
        setShowDateModal(true);
    }, [postDate, toDateString]);

    const applyDateModal = useCallback(() => {
        if (calendarDate) {
            const [year, month, day] = calendarDate.split('-').map(Number);
            if (year && month && day) {
                const next = new Date(postDate || new Date());
                next.setFullYear(year, month - 1, day);
                next.setHours(0, 0, 0, 0);
                setPostDate(next);
            }
        }
        setShowDateModal(false);
    }, [calendarDate, postDate]);

    const pickMedia = useCallback(async () => {
        setIsPickingMedia(true);
        try {
            const result = await launchImageLibrary({
                mediaType: 'mixed',
                selectionLimit: 6,
            });
            const items = result.assets ?? [];
            const mapped = items
                .filter((asset) => asset.uri)
                .map((asset) => ({
                    uri: asset.uri as string,
                    type: (asset.type?.startsWith('video') ? 'video' : 'image') as 'image' | 'video',
                    name: asset.fileName ?? undefined,
                    mimeType: asset.type ?? undefined,
                }));
            if (mapped.length > 0) {
                setMedia((prev) => [...prev, ...mapped].slice(0, 12));
            }
        } finally {
            setIsPickingMedia(false);
        }
    }, []);

    const saveEntry = useCallback(async () => {
        setShowValidation(true);
        const hasTitle = title.trim().length > 0;
        const hasDescription = description.trim().length > 0;
        const hasDate = !!postDate && !Number.isNaN(new Date(postDate).getTime());
        if (!apiAccessToken || !hasTitle || !hasDescription || !hasDate) return;
        setIsSaving(true);
        try {
            const fullDescription = buildDescriptionWithMeta(description, highlight, linkedPeople, skipHighlight);
            const summary = fullDescription.length > 180 ? `${fullDescription.slice(0, 180)}…` : fullDescription;
            let currentId = postId;
            if (mode === 'edit' && postId) {
                await updatePost(apiAccessToken, String(postId), {
                    title: title.trim(),
                    description: fullDescription,
                    summary,
                    created_at: postDate ? postDate.toISOString() : undefined,
                });
            } else {
                const created = await createPost(apiAccessToken, {
                    title: title.trim(),
                    description: fullDescription,
                    summary,
                    event_id: selectedEventId ? String(selectedEventId) : undefined,
                    group_id: groupId || undefined,
                });
                currentId = created?.post?.id ?? null;
            }

            if (currentId && media.length > 0) {
                await uploadMediaBatch(apiAccessToken, {
                    files: media.map((item) => ({
                        uri: item.uri,
                        type: item.mimeType ?? (item.type === 'video' ? 'video/mp4' : 'image/jpeg'),
                        name: item.name ?? `blog-${Date.now()}`,
                    })),
                    post_id: String(currentId),
                });
            }
            navigation.goBack();
        } finally {
            setIsSaving(false);
        }
    }, [apiAccessToken, buildDescriptionWithMeta, description, groupId, highlight, linkedPeople, media, mode, navigation, postDate, postId, selectedEventId, skipHighlight, title]);

    const titleInvalid = showValidation && title.trim().length === 0;
    const descriptionInvalid = showValidation && description.trim().length === 0;
    const dateInvalid = showValidation && (!postDate || Number.isNaN(new Date(postDate).getTime()));

    const deleteEntry = useCallback(async () => {
        if (!apiAccessToken || !postId) return;
        try {
            await deletePost(apiAccessToken, String(postId));
            navigation.goBack();
        } catch {
            // ignore
        }
    }, [apiAccessToken, navigation, postId]);

    const TOTAL_STEPS = 7;

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
            setShowValidation(true);
            if (!title.trim() || !description.trim()) return;
        }
        if (currentStep === 1) {
            setShowValidation(true);
            if (!postDate || Number.isNaN(new Date(postDate).getTime())) return;
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
        if (currentStep < TOTAL_STEPS) setCurrentStep((prev) => prev + 1);
    }, [currentStep, description, existingPreview.length, highlight, linkedPeople.length, media.length, postDate, selectedEventId, skipEvent, skipHighlight, skipMedia, skipPeople, title]);

    const goPrevStep = useCallback(() => {
        if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    }, [currentStep]);
    const goPreviewStep = useCallback(() => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(TOTAL_STEPS);
        }
    }, [currentStep, TOTAL_STEPS]);

    const canGoNext = useMemo(() => {
        if (currentStep === 1) return !!postDate && !Number.isNaN(new Date(postDate).getTime());
        if (currentStep === 2) return title.trim().length > 0 && description.trim().length > 0;
        if (currentStep === 3) return skipHighlight || highlight.trim().length > 0;
        if (currentStep === 4) return skipMedia || (media.length + existingPreview.length > 0);
        if (currentStep === 5) return skipEvent || !!selectedEventId;
        if (currentStep === 6) return skipPeople || linkedPeople.length > 0;
        return true;
    }, [currentStep, description, existingPreview.length, highlight, linkedPeople.length, media.length, postDate, selectedEventId, skipEvent, skipHighlight, skipMedia, skipPeople, title]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{mode === 'edit' ? t('Edit blog') : t('New blog')}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView contentContainerStyle={Styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={Styles.stepHeaderRow}>
                    <Text style={Styles.stepCounter}>{t('Step')} {currentStep}/{TOTAL_STEPS}</Text>
                    <Text style={Styles.stepTitle}>
                        {currentStep === 1 ? t('Date') :
                            currentStep === 2 ? t('Description') :
                                currentStep === 3 ? t('Highlight') :
                                    currentStep === 4 ? t('Blog media') :
                                        currentStep === 5 ? t('Event') :
                                            currentStep === 6 ? t('People') : t('Preview')}
                    </Text>
                </View>

                {currentStep === 1 && (
                    <View style={Styles.fieldBlock}>
                        <Text style={Styles.fieldLabel}>{t('Date')}</Text>
                        <TouchableOpacity style={[Styles.dateButton, dateInvalid && Styles.fieldInputError]} onPress={openDateModal}>
                            <CalendarIcon size={16} color={colors.primaryColor} variant="Linear" />
                            <Text style={Styles.dateText}>{postDate ? postDate.toLocaleDateString() : t('Select date')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {currentStep === 2 && (
                    <>
                        <View style={Styles.fieldBlock}>
                            <Text style={Styles.fieldLabel}>{t('Title')}</Text>
                            <TextInput
                                style={[Styles.fieldInput, titleInvalid && Styles.fieldInputError]}
                                placeholder={t('PK 400m Limburg 2025')}
                                placeholderTextColor="#9B9F9F"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                        <View style={Styles.fieldBlock}>
                            <Text style={Styles.fieldLabel}>{t('Description')}</Text>
                            <TextInput
                                style={[Styles.fieldInput, Styles.fieldTextarea, descriptionInvalid && Styles.fieldInputError]}
                                placeholder={t('Write your story and results.')}
                                placeholderTextColor="#9B9F9F"
                                value={description}
                                onChangeText={setDescription}
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
                            <TextInput
                                style={Styles.fieldInput}
                                placeholder={t('Race winning move, comeback, PR...')}
                                placeholderTextColor="#9B9F9F"
                                value={highlight}
                                onChangeText={setHighlight}
                            />
                        )}
                    </View>
                )}

                {currentStep === 4 && (
                    <>
                        <View style={Styles.skipRow}>
                            <CheckBox isChecked={skipMedia} onPressCheckBox={(checked) => setSkipMedia(Boolean(checked))} />
                            <Text style={Styles.skipLabel}>{t('Skip media')}</Text>
                        </View>
                        <SizeBox height={8} />
                        <View style={Styles.mediaHeader}>
                            <Text style={Styles.fieldLabel}>{t('Media')}</Text>
                            <TouchableOpacity style={Styles.mediaAddButton} onPress={pickMedia}>
                                <Add size={14} color="#FFFFFF" variant="Linear" />
                                <Text style={Styles.mediaAddText}>{t('Add media')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={Styles.mediaGrid}>
                            {existingPreview.map((item, index) => (
                                <View key={`existing-${item.uri}-${index}`} style={Styles.mediaTile}>
                                    <Image source={{ uri: String(item.uri) }} style={Styles.mediaImage} />
                                    {item.type === 'video' && (
                                        <View style={Styles.mediaBadge}>
                                            <Text style={Styles.mediaBadgeText}>{t('Video')}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                            {media.map((item, index) => (
                                <View key={`${item.uri}-${index}`} style={Styles.mediaTile}>
                                    <Image source={{ uri: item.uri }} style={Styles.mediaImage} />
                                    {item.type === 'video' && (
                                        <View style={Styles.mediaBadge}>
                                            <Text style={Styles.mediaBadgeText}>{t('Video')}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                            {media.length === 0 && existingPreview.length === 0 && (
                                <Text style={Styles.mediaEmptyText}>{t('No media added yet.')}</Text>
                            )}
                        </View>
                    </>
                )}

                {currentStep === 5 && (
                    <View style={Styles.fieldBlock}>
                        <View style={Styles.skipRow}>
                            <CheckBox isChecked={skipEvent} onPressCheckBox={(checked) => setSkipEvent(Boolean(checked))} />
                            <Text style={Styles.skipLabel}>{t('Skip event')}</Text>
                        </View>
                        <SizeBox height={8} />
                        <Text style={Styles.fieldLabel}>{t('Event')}</Text>
                        <TouchableOpacity style={Styles.dateButton} onPress={() => setShowEventModal(true)}>
                            <Text style={Styles.dateText} numberOfLines={1}>{selectedEventLabel}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {currentStep === 6 && (
                    <View style={Styles.fieldBlock}>
                        <View style={Styles.skipRow}>
                            <CheckBox isChecked={skipPeople} onPressCheckBox={(checked) => setSkipPeople(Boolean(checked))} />
                            <Text style={Styles.skipLabel}>{t('Skip people')}</Text>
                        </View>
                        <SizeBox height={8} />
                        <Text style={Styles.fieldLabel}>{t('People')}</Text>
                        <View style={Styles.dateButton}>
                            <TextInput
                                style={Styles.dateText}
                                placeholder={t('Search people or type a name')}
                                placeholderTextColor={colors.subTextColor}
                                value={peopleQuery}
                                onChangeText={setPeopleQuery}
                                onSubmitEditing={() => addPerson(peopleQuery)}
                            />
                        </View>
                        {peopleSearchLoading && <Text style={Styles.mediaEmptyText}>{t('Searching...')}</Text>}
                        {!peopleSearchLoading && peopleQuery.trim().length > 0 && peopleResults.length > 0 && (
                            <View style={Styles.eventListContent}>
                                {peopleResults.map((person) => (
                                    <TouchableOpacity key={person.profile_id} style={Styles.eventRow} onPress={() => addPerson(person.display_name)}>
                                        <Text style={Styles.eventRowText}>{person.display_name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        {linkedPeople.length > 0 && (
                            <View style={Styles.peopleChipsRow}>
                                {linkedPeople.map((person) => (
                                    <View key={person} style={Styles.peopleChip}>
                                        <Text style={Styles.peopleChipText}>{person}</Text>
                                        <TouchableOpacity onPress={() => removePerson(person)}>
                                            <Trash size={14} color={colors.subTextColor} variant="Linear" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {currentStep === 7 && (
                    <View style={Styles.previewCard}>
                        <Text style={Styles.previewTitle}>{title || t('Untitled blog')}</Text>
                        <Text style={Styles.previewMeta}>{postDate ? postDate.toLocaleDateString() : t('No date')}</Text>
                        <Text style={Styles.previewText}>{description || t('No description')}</Text>
                        {!skipHighlight && !!highlight.trim() && (
                            <Text style={Styles.previewMeta}>{t('Highlight')}: {highlight.trim()}</Text>
                        )}
                        {selectedEvent ? (
                            <Text style={Styles.previewMeta}>{t('Event')}: {selectedEventLabel}</Text>
                        ) : null}
                        {linkedPeople.length > 0 ? (
                            <Text style={Styles.previewMeta}>{t('People')}: {linkedPeople.join(', ')}</Text>
                        ) : null}
                        <Text style={Styles.previewMeta}>{t('Media')}: {existingPreview.length + media.length}</Text>
                    </View>
                )}

                <View style={Styles.actionRow}>
                    {currentStep < TOTAL_STEPS ? (
                        <TouchableOpacity style={Styles.previewShortcutButton} onPress={goPreviewStep}>
                            <Text style={Styles.previewShortcutText}>{t('Preview')}</Text>
                        </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity style={Styles.cancelButton} onPress={currentStep === 1 ? () => navigation.goBack() : goPrevStep}>
                        <Text style={Styles.cancelText}>{currentStep === 1 ? t('Cancel') : t('Back')}</Text>
                    </TouchableOpacity>
                    {currentStep < TOTAL_STEPS ? (
                        <TouchableOpacity
                            style={[Styles.saveButton, !canGoNext && Styles.saveButtonDisabled]}
                            onPress={goNextStep}
                            disabled={!canGoNext}
                        >
                            <Text style={Styles.saveText}>{t('Next')}</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={Styles.saveButton} onPress={saveEntry} disabled={isSaving}>
                            <Text style={Styles.saveText}>{isSaving ? t('Saving...') : t('Save')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {mode === 'edit' && postId ? (
                    <TouchableOpacity style={Styles.deleteButton} onPress={deleteEntry}>
                        <Trash size={16} color="#ED5454" variant="Linear" />
                        <Text style={Styles.deleteText}>{t('Delete blog')}</Text>
                    </TouchableOpacity>
                ) : null}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 16 : 32} />
            </ScrollView>

            {(isSaving || isPickingMedia) && (
                <View style={Styles.loadingOverlay}>
                    <View style={Styles.loadingCard}>
                        <ActivityIndicator color={colors.primaryColor} />
                        <Text style={Styles.loadingText}>
                            {isPickingMedia ? t('Preparing media...') : (media.length > 0 ? t('Uploading media...') : t('Saving...'))}
                        </Text>
                    </View>
                </View>
            )}

            <Modal
                visible={showEventModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEventModal(false)}
            >
                <View style={Styles.modalOverlay}>
                    <Pressable style={Styles.modalBackdrop} onPress={() => setShowEventModal(false)} />
                    <View style={Styles.dateModalContainer}>
                        <Text style={Styles.dateModalTitle}>{t('Select event')}</Text>
                        <SizeBox height={10} />
                        <ScrollView style={Styles.eventList} showsVerticalScrollIndicator={false}>
                            <TouchableOpacity
                                style={[Styles.eventRow, !selectedEventId && Styles.eventRowActive]}
                                onPress={() => {
                                    setSelectedEventId(null);
                                    setShowEventModal(false);
                                }}
                            >
                                <Text style={[Styles.eventRowText, !selectedEventId && Styles.eventRowTextActive]}>
                                    {t('No event selected')}
                                </Text>
                            </TouchableOpacity>
                            {subscribedEvents.map((event) => {
                                const eventId = String(event.event_id);
                                const active = String(selectedEventId || '') === eventId;
                                const label = event.event_name || event.event_title || t('Event');
                                return (
                                    <TouchableOpacity
                                        key={eventId}
                                        style={[Styles.eventRow, active && Styles.eventRowActive]}
                                        onPress={() => {
                                            setSelectedEventId(eventId);
                                            const eventDate = parseEventDate(event.event_date ?? null);
                                            if (eventDate) {
                                                setPostDate(eventDate);
                                            }
                                            setShowEventModal(false);
                                        }}
                                    >
                                        <Text style={[Styles.eventRowText, active && Styles.eventRowTextActive]} numberOfLines={2}>
                                            {label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        <TouchableOpacity style={Styles.modalDoneButton} onPress={() => setShowEventModal(false)}>
                            <Text style={Styles.modalDoneButtonText}>{t('Done')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
        </View>
    );
};

export default ProfileBlogEditorScreen;
