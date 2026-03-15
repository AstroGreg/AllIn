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
import { useInstagramStoryImageComposer } from '../../components/share/InstagramStoryComposer';
import { shareBlogToInstagramStory } from '../../components/share/instagramStoryShare';
const ViewUserBlogDetailsScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t, i18n } = useTranslation();
    const Styles = createStyles(colors);
    const { eventNameById } = useEvents();
    const { apiAccessToken } = useAuth();
    const { composeInstagramStoryImage, composerElement } = useInstagramStoryImageComposer();
    const postPreview = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.postPreview) || ((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.post) || null;
    const postId = ((_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.postId) || (postPreview === null || postPreview === void 0 ? void 0 : postPreview.id) || null;
    const [postData, setPostData] = useState(postPreview);
    const [mediaItems, setMediaItems] = useState([]);
    const [liked, setLiked] = useState(Boolean((_d = postPreview === null || postPreview === void 0 ? void 0 : postPreview.liked_by_me) !== null && _d !== void 0 ? _d : false));
    const [likesCount, setLikesCount] = useState(Number((_e = postPreview === null || postPreview === void 0 ? void 0 : postPreview.likes_count) !== null && _e !== void 0 ? _e : 0) || 0);
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
    useEffect(() => {
        if (!apiAccessToken || !postId)
            return;
        let mounted = true;
        getPostById(apiAccessToken, String(postId))
            .then((resp) => {
            var _a, _b, _c, _d, _e, _f;
            if (!mounted)
                return;
            if (resp === null || resp === void 0 ? void 0 : resp.post) {
                setPostData(Object.assign(Object.assign({}, resp.post), { author: (_a = resp === null || resp === void 0 ? void 0 : resp.author) !== null && _a !== void 0 ? _a : (_b = resp.post) === null || _b === void 0 ? void 0 : _b.author }));
                setLiked(Boolean((_d = (_c = resp.post) === null || _c === void 0 ? void 0 : _c.liked_by_me) !== null && _d !== void 0 ? _d : false));
                setLikesCount(Number((_f = (_e = resp.post) === null || _e === void 0 ? void 0 : _e.likes_count) !== null && _f !== void 0 ? _f : 0) || 0);
            }
            setMediaItems(Array.isArray(resp === null || resp === void 0 ? void 0 : resp.media) ? resp.media : []);
        })
            .catch(() => { });
        recordPostView(apiAccessToken, String(postId)).catch(() => { });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, postId]);
    const galleryItems = useMemo(() => {
        if (mediaItems.length > 0) {
            return mediaItems
                .map((media) => {
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
                .filter((item) => !!(item === null || item === void 0 ? void 0 : item.image));
        }
        if (postData === null || postData === void 0 ? void 0 : postData.coverImage) {
            return [{ image: { uri: String(postData.coverImage) }, type: 'image', videoUri: undefined }];
        }
        return [];
    }, [mediaItems, postData === null || postData === void 0 ? void 0 : postData.coverImage, toAbsoluteUrl, withAccessToken]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const selectedItem = (_f = galleryItems[selectedIndex]) !== null && _f !== void 0 ? _f : galleryItems[0];
    const firstBlogImageUri = useMemo(() => {
        var _a, _b;
        const firstImage = galleryItems.find((item) => {
            var _a, _b;
            return (item === null || item === void 0 ? void 0 : item.type) === 'image' && ((item === null || item === void 0 ? void 0 : item.media) || ((_b = (_a = item === null || item === void 0 ? void 0 : item.image) === null || _a === void 0 ? void 0 : _a.uri) !== null && _b !== void 0 ? _b : null));
        });
        const candidateItem = firstImage || selectedItem;
        const media = candidateItem === null || candidateItem === void 0 ? void 0 : candidateItem.media;
        if (media) {
            const candidates = [
                media.raw_url,
                media.rawUrl,
                media.original_url,
                media.originalUrl,
                media.full_url,
                media.fullUrl,
                media.preview_url,
                media.previewUrl,
                media.thumbnail_url,
                media.thumbnailUrl,
            ].filter(Boolean);
            const resolved = candidates
                .map((value) => {
                const abs = toAbsoluteUrl(String(value));
                if (!abs)
                    return null;
                return withAccessToken(abs) || abs;
            })
                .filter(Boolean);
            const bitmapImage = resolved.find((value) => /\.(jpg|jpeg|png|heic)(\?|$)/i.test(value));
            if (bitmapImage)
                return bitmapImage;
            const webpImage = resolved.find((value) => /\.(webp)(\?|$)/i.test(value));
            if (webpImage)
                return webpImage;
        }
        if ((_a = candidateItem === null || candidateItem === void 0 ? void 0 : candidateItem.image) === null || _a === void 0 ? void 0 : _a.uri) {
            return String(candidateItem.image.uri);
        }
        return null;
    }, [galleryItems, selectedItem, toAbsoluteUrl, withAccessToken]);
    const translatedDescription = useMemo(() => {
        var _a;
        return translateText((_a = postData === null || postData === void 0 ? void 0 : postData.description) !== null && _a !== void 0 ? _a : '', i18n.language);
    }, [i18n.language, postData === null || postData === void 0 ? void 0 : postData.description]);
    const titleTimeAgo = useMemo(() => {
        const raw = (postData === null || postData === void 0 ? void 0 : postData.created_at) || (postPreview === null || postPreview === void 0 ? void 0 : postPreview.date);
        if (!raw)
            return '';
        const date = new Date(raw);
        if (Number.isNaN(date.getTime()))
            return '';
        const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
        if (diffSec < 60)
            return t('just now');
        const mins = Math.floor(diffSec / 60);
        if (mins < 60)
            return `${mins}${t('m ago')}`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24)
            return `${hrs}${t('h ago')}`;
        const days = Math.floor(hrs / 24);
        return `${days}${t('d ago')}`;
    }, [postData === null || postData === void 0 ? void 0 : postData.created_at, postPreview === null || postPreview === void 0 ? void 0 : postPreview.date, t]);
    const authorName = useMemo(() => {
        var _a, _b;
        return ((_a = postData === null || postData === void 0 ? void 0 : postData.author) === null || _a === void 0 ? void 0 : _a.display_name) ||
            ((_b = postPreview === null || postPreview === void 0 ? void 0 : postPreview.author) === null || _b === void 0 ? void 0 : _b.display_name) ||
            (postPreview === null || postPreview === void 0 ? void 0 : postPreview.writer) ||
            t('Profile');
    }, [(_h = postData === null || postData === void 0 ? void 0 : postData.author) === null || _h === void 0 ? void 0 : _h.display_name, (_j = postPreview === null || postPreview === void 0 ? void 0 : postPreview.author) === null || _j === void 0 ? void 0 : _j.display_name, postPreview === null || postPreview === void 0 ? void 0 : postPreview.writer, t]);
    const authorImage = useMemo(() => {
        var _a, _b, _c;
        const avatarCandidate = ((_a = postData === null || postData === void 0 ? void 0 : postData.author) === null || _a === void 0 ? void 0 : _a.avatar_url) ||
            ((_b = postPreview === null || postPreview === void 0 ? void 0 : postPreview.author) === null || _b === void 0 ? void 0 : _b.avatar_url) ||
            ((_c = postPreview === null || postPreview === void 0 ? void 0 : postPreview.writerImage) === null || _c === void 0 ? void 0 : _c.uri) ||
            null;
        if (avatarCandidate) {
            const resolved = toAbsoluteUrl(String(avatarCandidate));
            const withToken = withAccessToken(resolved) || resolved;
            if (withToken)
                return { uri: String(withToken) };
        }
        if (postPreview === null || postPreview === void 0 ? void 0 : postPreview.writerImage)
            return postPreview.writerImage;
        return Images.profile1;
    }, [
        (_k = postData === null || postData === void 0 ? void 0 : postData.author) === null || _k === void 0 ? void 0 : _k.avatar_url,
        (_l = postPreview === null || postPreview === void 0 ? void 0 : postPreview.author) === null || _l === void 0 ? void 0 : _l.avatar_url,
        postPreview === null || postPreview === void 0 ? void 0 : postPreview.writerImage,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const openMediaDetail = useCallback((item) => {
        var _a;
        const media = item === null || item === void 0 ? void 0 : item.media;
        if (!media)
            return;
        const mediaHeaderTitle = String(eventNameById(media.event_id) || '').trim()
            || String((postData === null || postData === void 0 ? void 0 : postData.title) || '').trim()
            || (media.type === 'video' ? t('Video') : t('Photo'));
        if (media.type === 'video') {
            navigation.navigate('VideoPlayingScreen', {
                eventTitle: mediaHeaderTitle,
                blogTitle: (postData === null || postData === void 0 ? void 0 : postData.title) ? String(postData.title) : undefined,
                postTitle: (postData === null || postData === void 0 ? void 0 : postData.title) ? String(postData.title) : undefined,
                video: {
                    media_id: media.media_id,
                    title: (postData === null || postData === void 0 ? void 0 : postData.title) || t('Video'),
                    thumbnail: item === null || item === void 0 ? void 0 : item.image,
                    uri: item === null || item === void 0 ? void 0 : item.videoUri,
                },
            });
            return;
        }
        navigation.navigate('PhotoDetailScreen', {
            eventTitle: mediaHeaderTitle,
            blogTitle: (postData === null || postData === void 0 ? void 0 : postData.title) ? String(postData.title) : undefined,
            postTitle: (postData === null || postData === void 0 ? void 0 : postData.title) ? String(postData.title) : undefined,
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
                assets: (_a = media.assets) !== null && _a !== void 0 ? _a : [],
            },
        });
    }, [eventNameById, navigation, postData === null || postData === void 0 ? void 0 : postData.title, t]);
    const blogShareMessage = useMemo(() => {
        return (postData === null || postData === void 0 ? void 0 : postData.title)
            ? String(postData.title)
            : String((postData === null || postData === void 0 ? void 0 : postData.summary) || (postData === null || postData === void 0 ? void 0 : postData.description) || t('blogDetails'));
    }, [postData === null || postData === void 0 ? void 0 : postData.description, postData === null || postData === void 0 ? void 0 : postData.summary, postData === null || postData === void 0 ? void 0 : postData.title, t]);
    const handleShareBlog = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield NativeShare.open({
                message: blogShareMessage,
                subject: (postData === null || postData === void 0 ? void 0 : postData.title) ? String(postData.title) : undefined,
            });
        }
        catch (_q) {
            // ignore
        }
    }), [blogShareMessage, postData === null || postData === void 0 ? void 0 : postData.title]);
    const handleShareBlogInstagram = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _r;
        try {
            yield shareBlogToInstagramStory({
                t,
                composeInstagramStoryImage,
                imageUri: firstBlogImageUri,
                title: (postData === null || postData === void 0 ? void 0 : postData.title) ? String(postData.title) : blogShareMessage,
                subtitle: (postData === null || postData === void 0 ? void 0 : postData.summary) || (postData === null || postData === void 0 ? void 0 : postData.description) || null,
            });
        }
        catch (e) {
            const msg = String((_r = e === null || e === void 0 ? void 0 : e.message) !== null && _r !== void 0 ? _r : t('Instagram Story failed'));
            if (!/cancel/i.test(msg)) {
                Alert.alert(t('Instagram Story failed'), msg);
            }
        }
    }), [blogShareMessage, composeInstagramStoryImage, firstBlogImageUri, postData === null || postData === void 0 ? void 0 : postData.description, postData === null || postData === void 0 ? void 0 : postData.summary, postData === null || postData === void 0 ? void 0 : postData.title, t]);
    const openShareOptions = useCallback(() => {
        Alert.alert(t('Share'), undefined, [
            { text: t('Cancel'), style: 'cancel' },
            { text: t('Share'), onPress: () => { handleShareBlog().catch(() => { }); } },
            {
                text: t('Share to Instagram Story'),
                onPress: () => { handleShareBlogInstagram().catch(() => { }); },
            },
        ]);
    }, [handleShareBlog, handleShareBlogInstagram, t]);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "view-user-blog-details-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('blogDetails') })), _jsxs(View, Object.assign({ style: Styles.headerActions }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerIconButton, onPress: () => navigation.navigate('ProfileBlogEditorScreen', { mode: 'edit', postId }) }, { children: _jsx(Edit2, { size: 18, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.headerIconButton, onPress: () => {
                                    if (!apiAccessToken || !postId)
                                        return;
                                    Alert.alert(t('Delete'), t('Are you sure you want to delete this blog?'), [
                                        { text: t('Cancel'), style: 'cancel' },
                                        {
                                            text: t('Delete'),
                                            style: 'destructive',
                                            onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                                try {
                                                    yield deletePost(apiAccessToken, String(postId));
                                                    navigation.goBack();
                                                }
                                                catch (_a) {
                                                    // ignore
                                                }
                                            }),
                                        },
                                    ]);
                                } }, { children: _jsx(Trash, { size: 18, color: colors.mainTextColor, variant: "Linear" }) }))] }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.redditPostCard }, { children: [_jsxs(View, Object.assign({ style: Styles.redditMetaRow }, { children: [_jsx(FastImage, { source: authorImage, style: Styles.writerImage, resizeMode: "cover" }), _jsxs(View, Object.assign({ style: Styles.redditMetaTextBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.redditMetaName, numberOfLines: 1 }, { children: authorName })), titleTimeAgo ? (_jsx(Text, Object.assign({ style: Styles.redditMetaSubText, numberOfLines: 1 }, { children: titleTimeAgo }))) : null] }))] })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.blogTitle }, { children: (_m = postData === null || postData === void 0 ? void 0 : postData.title) !== null && _m !== void 0 ? _m : t('Blog') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.description }, { children: showTranslation ? translatedDescription : ((_o = postData === null || postData === void 0 ? void 0 : postData.description) !== null && _o !== void 0 ? _o : '') })), ((_p = galleryItems[0]) === null || _p === void 0 ? void 0 : _p.image) ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 12 }), _jsx(FastImage, { source: galleryItems[0].image, style: Styles.heroImage, resizeMode: "cover" })] })) : null, _jsx(SizeBox, { height: 10 }), _jsxs(View, Object.assign({ style: Styles.blogActionsRow }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: [Styles.blogActionButton, Styles.blogActionButtonCompact], onPress: () => setShowTranslation((prev) => !prev), activeOpacity: 0.8 }, { children: [_jsx(Icons.LanguageSetting, { width: 14, height: 14 }), _jsx(Text, Object.assign({ style: Styles.blogActionText }, { children: showTranslation ? t('showOriginal') : t('translate') }))] })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.blogActionButton, Styles.blogActionButtonCompact], onPress: openShareOptions }, { children: _jsx(Image, { source: Icons.ShareBlue, style: [Styles.blogActionIcon, Styles.blogActionIconCompact] }) })), _jsxs(TouchableOpacity, Object.assign({ style: [Styles.blogActionButton, Styles.blogActionLike, { marginLeft: 'auto' }], onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                            if (!apiAccessToken || !postId)
                                                return;
                                            try {
                                                const r = yield togglePostLike(apiAccessToken, postId);
                                                setLiked(r.liked);
                                                setLikesCount(r.likes_count);
                                            }
                                            catch (_s) {
                                                // ignore
                                            }
                                        }) }, { children: [_jsx(Heart, { size: 18, color: colors.primaryColor, variant: liked ? 'Bold' : 'Linear' }), _jsx(Text, Object.assign({ style: Styles.blogActionText }, { children: likesCount }))] }))] }))] })), _jsx(SizeBox, { height: 10 }), mediaItems.length > 0 && galleryItems.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.sectionLabel }, { children: t('media') })), _jsx(SizeBox, { height: 4 }), _jsx(ScrollView, Object.assign({ horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: Styles.galleryContainer }, { children: galleryItems.map((item, index) => (_jsx(TouchableOpacity, Object.assign({ onPress: () => {
                                        setSelectedIndex(index);
                                        openMediaDetail(item);
                                    }, activeOpacity: 0.8, disabled: !(item === null || item === void 0 ? void 0 : item.media) }, { children: _jsxs(View, Object.assign({ style: Styles.galleryThumbWrap }, { children: [_jsx(FastImage, { source: item.image, style: [
                                                    Styles.galleryImage,
                                                    selectedIndex === index && Styles.galleryImageSelected,
                                                ], resizeMode: "cover" }), (item === null || item === void 0 ? void 0 : item.type) === 'video' && (_jsx(View, Object.assign({ style: Styles.galleryPlayOverlay }, { children: _jsx(View, Object.assign({ style: Styles.galleryPlayButton }, { children: _jsx(Icons.PlayCricle, { height: 28, width: 28 }) })) })))] })) }), index))) }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 16 : 32 })] })), composerElement] })));
};
export default ViewUserBlogDetailsScreen;
