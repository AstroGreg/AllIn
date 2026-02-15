import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Add, Trash } from 'iconsax-react-nativejs';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../context/ThemeContext';
import SizeBox from '../../constants/SizeBox';
import { createStyles } from './ProfileBlogEditorStyles';
import { useAuth } from '../../context/AuthContext';
import { createPost, deletePost, getPostById, updatePost, uploadMediaBatch, type MediaViewAllItem } from '../../services/apiGateway';
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
    const { apiAccessToken } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [media, setMedia] = useState<BlogMedia[]>([]);
    const [existingMedia, setExistingMedia] = useState<MediaViewAllItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

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

    useEffect(() => {
        if (entryPreview && mode === 'add') {
            setTitle(entryPreview.title ?? '');
            setDescription(entryPreview.description ?? '');
            setDate(entryPreview.date ?? '');
        }
    }, [entryPreview, mode]);

    useEffect(() => {
        if (!date) {
            setDate(new Date().toLocaleDateString('en-GB'));
        }
    }, [date]);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || mode !== 'edit' || !postId) return () => {};
        getPostById(apiAccessToken, String(postId))
            .then((resp) => {
                if (!mounted) return;
                if (resp?.post) {
                    setTitle(resp.post.title ?? '');
                    setDescription(resp.post.description ?? '');
                    setDate(resp.post.created_at ? String(resp.post.created_at).slice(0, 10) : '');
                }
                setExistingMedia(Array.isArray((resp as any)?.media) ? (resp as any).media : []);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, mode, postId]);

    const pickMedia = useCallback(async () => {
        const result = await launchImageLibrary({
            mediaType: 'mixed',
            selectionLimit: 6,
        });
        const items = result.assets ?? [];
        const mapped = items
            .filter((asset) => asset.uri)
            .map((asset) => ({
                uri: asset.uri as string,
                type: asset.type?.startsWith('video') ? 'video' : 'image',
                name: asset.fileName ?? undefined,
                mimeType: asset.type ?? undefined,
            }));
        if (mapped.length > 0) {
            setMedia((prev) => [...prev, ...mapped].slice(0, 12));
        }
    }, []);

    const saveEntry = useCallback(async () => {
        if (!apiAccessToken || !title.trim() || !description.trim()) return;
        setIsSaving(true);
        try {
            const summary = description.length > 180 ? `${description.slice(0, 180)}…` : description;
            let currentId = postId;
            if (mode === 'edit' && postId) {
                await updatePost(apiAccessToken, String(postId), {
                    title: title.trim(),
                    description: description.trim(),
                    summary,
                });
            } else {
                const created = await createPost(apiAccessToken, {
                    title: title.trim(),
                    description: description.trim(),
                    summary,
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
    }, [apiAccessToken, createPost, description, media, mode, navigation, postId, title, updatePost]);

    const deleteEntry = useCallback(async () => {
        if (!apiAccessToken || !postId) return;
        try {
            await deletePost(apiAccessToken, String(postId));
            navigation.goBack();
        } catch {
            // ignore
        }
    }, [apiAccessToken, navigation, postId]);

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
                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>{t('Title')}</Text>
                    <TextInput
                        style={Styles.fieldInput}
                        placeholder={t('PK 400m Limburg 2025')}
                        placeholderTextColor="#9B9F9F"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>
                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>{t('Date')}</Text>
                    <View style={Styles.readonlyField}>
                        <Text style={Styles.readonlyText}>{date || new Date().toLocaleDateString('en-GB')}</Text>
                    </View>
                </View>
                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>{t('Description')}</Text>
                    <TextInput
                        style={[Styles.fieldInput, Styles.fieldTextarea]}
                        placeholder={t('Write your story and results.')}
                        placeholderTextColor="#9B9F9F"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>

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

                <View style={Styles.actionRow}>
                    <TouchableOpacity style={Styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={Styles.cancelText}>{t('Cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.saveButton} onPress={saveEntry} disabled={isSaving}>
                        <Text style={Styles.saveText}>{isSaving ? t('Saving...') : t('Save')}</Text>
                    </TouchableOpacity>
                </View>

                {mode === 'edit' && postId ? (
                    <TouchableOpacity style={Styles.deleteButton} onPress={deleteEntry}>
                        <Trash size={16} color="#ED5454" variant="Linear" />
                        <Text style={Styles.deleteText}>{t('Delete blog')}</Text>
                    </TouchableOpacity>
                ) : null}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 16 : 32} />
            </ScrollView>
        </View>
    );
};

export default ProfileBlogEditorScreen;
