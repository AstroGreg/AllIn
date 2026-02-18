import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, Heart, Edit2, Trash } from 'iconsax-react-nativejs';
import { createStyles } from './ViewUserBlogDetailsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useEvents } from '../../context/EventsContext';
import { useTranslation } from 'react-i18next';
import { translateText } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import NativeShare from 'react-native-share';
import { deletePost, getPostById, recordPostView, togglePostLike } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';

const ViewUserBlogDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t, i18n } = useTranslation();
    const Styles = createStyles(colors);
    const { eventNameById } = useEvents();
    const { apiAccessToken } = useAuth();
    const postPreview = route?.params?.postPreview || route?.params?.post || null;
    const postId = route?.params?.postId || postPreview?.id || null;
    const [postData, setPostData] = useState<any>(postPreview);
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [liked, setLiked] = useState<boolean>(Boolean(postPreview?.liked_by_me ?? false));
    const [likesCount, setLikesCount] = useState<number>(Number(postPreview?.likes_count ?? 0) || 0);

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

    useEffect(() => {
        if (!apiAccessToken || !postId) return;
        let mounted = true;
        getPostById(apiAccessToken, String(postId))
            .then((resp) => {
                if (!mounted) return;
                if (resp?.post) {
                    setPostData({ ...resp.post, author: (resp as any)?.author ?? resp.post?.author });
                    setLiked(Boolean(resp.post?.liked_by_me ?? false));
                    setLikesCount(Number(resp.post?.likes_count ?? 0) || 0);
                }
                setMediaItems(Array.isArray((resp as any)?.media) ? (resp as any).media : []);
            })
            .catch(() => {});
        recordPostView(apiAccessToken, String(postId)).catch(() => {});
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, postId]);


    const galleryItems = useMemo(() => {
        if (mediaItems.length > 0) {
            return mediaItems
                .map((media: any) => {
                const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
                const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
                const thumb = resolved ? (withAccessToken(resolved) || resolved) : null;
                const previewCandidate = media.preview_url || media.full_url || media.original_url || media.raw_url || null;
                const previewResolved = previewCandidate ? toAbsoluteUrl(String(previewCandidate)) : null;
                const preview = previewResolved ? (withAccessToken(previewResolved) || previewResolved) : null;
                return {
                    image: thumb ? { uri: String(thumb) } : null,
                    type: media.type === 'video' ? 'video' : 'image',
                    videoUri: preview || undefined,
                    media,
                };
                })
                .filter((item: any) => !!item?.image);
        }
        if (postData?.coverImage) {
            return [{ image: { uri: String(postData.coverImage) }, type: 'image', videoUri: undefined }];
        }
        return [];
    }, [mediaItems, postData?.coverImage, toAbsoluteUrl, withAccessToken]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const selectedItem = galleryItems[selectedIndex] ?? galleryItems[0];

    const translatedDescription = useMemo(() => {
        return translateText(postData?.description ?? '', i18n.language);
    }, [i18n.language, postData?.description]);
    const createdLabel = postData?.created_at ? String(postData.created_at).slice(0, 10) : (postPreview?.date || '');
    const readTimeLabel = postData?.reading_time_minutes ? `${postData.reading_time_minutes} ${t('min')}` : '';
    const titleTimeAgo = useMemo(() => {
        const raw = postData?.created_at || postPreview?.date;
        if (!raw) return '';
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) return '';
        const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
        if (diffSec < 60) return t('just now');
        const mins = Math.floor(diffSec / 60);
        if (mins < 60) return `${mins}${t('m ago')}`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}${t('h ago')}`;
        const days = Math.floor(hrs / 24);
        return `${days}${t('d ago')}`;
    }, [postData?.created_at, postPreview?.date, t]);

    const authorName = useMemo(
        () =>
            postData?.author?.display_name ||
            postPreview?.author?.display_name ||
            postPreview?.writer ||
            t('Profile'),
        [postData?.author?.display_name, postPreview?.author?.display_name, postPreview?.writer, t],
    );

    const authorImage = useMemo(() => {
        const avatarCandidate =
            postData?.author?.avatar_url ||
            postPreview?.author?.avatar_url ||
            postPreview?.writerImage?.uri ||
            null;
        if (avatarCandidate) {
            const resolved = toAbsoluteUrl(String(avatarCandidate));
            const withToken = withAccessToken(resolved) || resolved;
            if (withToken) return { uri: String(withToken) };
        }
        if (postPreview?.writerImage) return postPreview.writerImage;
        return Images.profile1;
    }, [
        postData?.author?.avatar_url,
        postPreview?.author?.avatar_url,
        postPreview?.writerImage,
        toAbsoluteUrl,
        withAccessToken,
    ]);

    const openMediaDetail = useCallback((item: any) => {
        const media = item?.media;
        if (!media) return;
        if (media.type === 'video') {
            navigation.navigate('VideoPlayingScreen', {
                video: {
                    media_id: media.media_id,
                    title: postData?.title || t('Video'),
                    thumbnail: item?.image,
                    uri: item?.videoUri,
                },
            });
            return;
        }
        navigation.navigate('PhotoDetailScreen', {
            eventTitle: eventNameById(media.event_id),
            media: {
                id: media.media_id,
                eventId: media.event_id,
                thumbnailUrl: media.thumbnail_url,
                previewUrl: media.preview_url,
                originalUrl: media.original_url,
                fullUrl: media.full_url,
                rawUrl: media.raw_url,
                hlsManifestPath: media.hls_manifest_path,
                type: media.type,
                assets: media.assets ?? [],
            },
        });
    }, [eventNameById, navigation, postData?.title, t]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('blogDetails')}</Text>
                <View style={Styles.headerActions}>
                    <TouchableOpacity
                        style={Styles.headerIconButton}
                        onPress={() => navigation.navigate('ProfileBlogEditorScreen', { mode: 'edit', postId })}
                    >
                        <Edit2 size={18} color={colors.mainTextColor} variant="Linear" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={Styles.headerIconButton}
                        onPress={() => {
                            if (!apiAccessToken || !postId) return;
                            Alert.alert(
                                t('Delete'),
                                t('Are you sure you want to delete this blog?'),
                                [
                                    { text: t('Cancel'), style: 'cancel' },
                                    {
                                        text: t('Delete'),
                                        style: 'destructive',
                                        onPress: async () => {
                                            try {
                                                await deletePost(apiAccessToken, String(postId));
                                                navigation.goBack();
                                            } catch {
                                                // ignore
                                            }
                                        },
                                    },
                                ],
                            );
                        }}
                    >
                        <Trash size={18} color={colors.mainTextColor} variant="Linear" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <SizeBox height={8} />

                {/* Reddit-style text post */}
                <View style={Styles.redditPostCard}>
                    <View style={Styles.redditMetaRow}>
                        <FastImage source={authorImage} style={Styles.writerImage} resizeMode="cover" />
                        <View style={Styles.redditMetaTextBlock}>
                            <Text style={Styles.redditMetaName} numberOfLines={1}>
                                {authorName}
                            </Text>
                            {titleTimeAgo ? (
                                <Text style={Styles.redditMetaSubText} numberOfLines={1}>
                                    {titleTimeAgo}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    <SizeBox height={8} />

                    <Text style={Styles.blogTitle}>{postData?.title ?? t('Blog')}</Text>

                    <SizeBox height={8} />

                    <Text style={Styles.description}>
                        {showTranslation ? translatedDescription : (postData?.description ?? '')}
                    </Text>

                    {galleryItems[0]?.image ? (
                        <>
                            <SizeBox height={12} />
                            <FastImage source={galleryItems[0].image} style={Styles.heroImage} resizeMode="cover" />
                        </>
                    ) : null}

                    <SizeBox height={10} />

                    <View style={Styles.blogActionsRow}>
                        <TouchableOpacity
                            style={[Styles.blogActionButton, Styles.blogActionButtonCompact]}
                            onPress={() => setShowTranslation((prev) => !prev)}
                            activeOpacity={0.8}
                        >
                            <Icons.LanguageSetting width={14} height={14} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[Styles.blogActionButton, Styles.blogActionButtonCompact]}
                            onPress={async () => {
                                try {
                                    await NativeShare.open({
                                        message: postData?.title ? String(postData.title) : 'AllIn',
                                        subject: postData?.title ? String(postData.title) : undefined,
                                    });
                                } catch {
                                    // ignore
                                }
                            }}
                        >
                            <Image source={Icons.ShareBlue} style={[Styles.blogActionIcon, Styles.blogActionIconCompact]} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[Styles.blogActionButton, Styles.blogActionLike, { marginLeft: 'auto' }]}
                            onPress={async () => {
                                if (!apiAccessToken || !postId) return;
                                try {
                                    const r = await togglePostLike(apiAccessToken, postId);
                                    setLiked(r.liked);
                                    setLikesCount(r.likes_count);
                                } catch {
                                    // ignore
                                }
                            }}
                        >
                            <Heart size={18} color={colors.primaryColor} variant={liked ? 'Bold' : 'Linear'} />
                            <Text style={Styles.blogActionText}>{likesCount}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <SizeBox height={10} />

                {/* Media Carousel (bottom) */}
                {mediaItems.length > 0 && galleryItems.length > 0 && (
                    <>
                        <Text style={Styles.sectionLabel}>{t('media')}</Text>
                        <SizeBox height={4} />
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={Styles.galleryContainer}
                        >
                            {galleryItems.map((item: any, index: number) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setSelectedIndex(index);
                                        openMediaDetail(item);
                                    }}
                                    activeOpacity={0.8}
                                    disabled={!item?.media}
                                >
                                    <View style={Styles.galleryThumbWrap}>
                                        <FastImage
                                            source={item.image}
                                            style={[
                                                Styles.galleryImage,
                                                selectedIndex === index && Styles.galleryImageSelected,
                                            ]}
                                            resizeMode="cover"
                                        />
                                        {item?.type === 'video' && (
                                            <View style={Styles.galleryPlayOverlay}>
                                                <View style={Styles.galleryPlayButton}>
                                                    <Icons.PlayCricle height={28} width={28} />
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 16 : 32} />
            </ScrollView>
        </View>
    );
};

export default ViewUserBlogDetailsScreen;
