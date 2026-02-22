import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {
    ArrowLeft2,
    Calendar,
    Location,
    Clock,
    TickCircle,
    Refresh,
} from 'iconsax-react-nativejs';
import { createStyles } from './VideoDetailsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import Images from '../../constants/Images';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { deleteMedia, deletePost, getMediaById, getMediaIssueRequests, getMyMediaIssueRequests, updateMedia, updateMediaIssueRequest } from '../../services/apiGateway';
import { getApiBaseUrl, getHlsBaseUrl } from '../../constants/RuntimeConfig';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const VideoDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { apiAccessToken } = useAuth();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const [showManageModal, setShowManageModal] = useState(false);
    const [uploadFileName, setUploadFileName] = useState<string | null>(null);
    const [requestsExpanded, setRequestsExpanded] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [wontFixReason, setWontFixReason] = useState('');
    const [statusChoice, setStatusChoice] = useState<'fixed' | 'wont_fix'>('fixed');
    const [mediaType, setMediaType] = useState<'image' | 'video'>(
        String(route?.params?.video?.type || '').toLowerCase() === 'video' ? 'video' : 'image',
    );
    const [issueRequests, setIssueRequests] = useState<any[]>([]);
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const [eventIdDraft, setEventIdDraft] = useState(String(route?.params?.video?.event_id || '').trim());

    const routeVideo = route?.params?.video;
    const mediaId = String(route?.params?.mediaId || routeVideo?.media_id || '').trim();
    const routePostId = String(route?.params?.video?.post_id || route?.params?.postId || '').trim();
    const detailsTitle = mediaType === 'video' ? t('Video details') : t('Photo details');
    const [videoData, setVideoData] = useState({
        title: routeVideo?.title ?? 'BK Studentent 23',
        location: routeVideo?.location ?? 'Berlin, Germany',
        duration: routeVideo?.duration ?? '2 Minutes',
        date: routeVideo?.date ?? '27/05/2025',
        videoUri: routeVideo?.uri ?? '',
        thumbnail: routeVideo?.thumbnail ?? Images.photo7,
    });

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

    const withAccessToken = useCallback((value?: string | null) => {
        if (!value) return undefined;
        if (!apiAccessToken) return value;
        if (isSignedUrl(value)) return value;
        if (value.includes('access_token=')) return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    const toHlsUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getHlsBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) return () => {};
        getMediaById(apiAccessToken, mediaId)
            .then((media) => {
                if (!mounted) return;
                const hls = media.hls_manifest_path ? toHlsUrl(media.hls_manifest_path) : null;
                setMediaType(String(media?.type || routeVideo?.type || 'image').toLowerCase() === 'video' ? 'video' : 'image');
                setEventIdDraft(String(media?.event_id || routeVideo?.event_id || '').trim());
                const candidates = [
                    media.preview_url,
                    media.original_url,
                    media.full_url,
                    media.raw_url,
                ]
                    .filter(Boolean)
                    .map((value) => toAbsoluteUrl(String(value)) || '')
                    .filter(Boolean);
                const mp4 = candidates.find((value) => /\.(mp4|mov|m4v)(\?|$)/i.test(value));
                const resolvedVideo = hls || mp4 || candidates[0] || '';
                const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
                const resolvedPoster = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
                setVideoData((prev) => ({
                    ...prev,
                    videoUri: withAccessToken(resolvedVideo) || resolvedVideo,
                    thumbnail: resolvedPoster ? { uri: withAccessToken(resolvedPoster) || resolvedPoster } : prev.thumbnail,
                }));
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, mediaId, routeVideo?.event_id, routeVideo?.type, toAbsoluteUrl, toHlsUrl, withAccessToken]);

    const loadIssueRequests = useCallback(async () => {
        if (!apiAccessToken || !mediaId) {
            setIssueRequests([]);
            return;
        }

        const normalizeRow = (raw: any) => {
            const rawIssueType = String(raw?.issue_type ?? raw?.issueType ?? raw?.type ?? '').toLowerCase();
            const rawStatus = String(raw?.status ?? '').toLowerCase();
            const createdAt = String(raw?.created_at ?? raw?.createdAt ?? '');
            return {
                id: String(raw?.request_id ?? raw?.requestId ?? raw?.id ?? ''),
                mediaId: String(
                    raw?.media_id ??
                    raw?.mediaId ??
                    raw?.target_media_id ??
                    raw?.targetMediaId ??
                    raw?.asset_media_id ??
                    raw?.assetMediaId ??
                    raw?.media?.media_id ??
                    raw?.media?.id ??
                    '',
                ),
                postId: String(raw?.post_id ?? raw?.postId ?? raw?.post?.id ?? ''),
                title: rawIssueType === 'wrong_competition'
                    ? t('Wrong competition')
                    : rawIssueType === 'wrong_heat'
                        ? t('Wrong heat')
                        : t('Custom request'),
                date: createdAt.slice(0, 10),
                time: createdAt.slice(11, 16),
                status: rawStatus === 'resolved' ? 'fixed' : (rawStatus === 'wont_fix' ? 'wont_fix' : 'pending'),
                reason: String(raw?.resolution_reason ?? raw?.resolutionReason ?? ''),
                custom: String(raw?.custom_text ?? raw?.customText ?? ''),
            };
        };

        try {
            const [hubResult, mediaResult] = await Promise.allSettled([
                getMyMediaIssueRequests(apiAccessToken, { limit: 500, offset: 0 }),
                getMediaIssueRequests(apiAccessToken, mediaId, { limit: 500, offset: 0 }),
            ]);

            const hubRows =
                hubResult.status === 'fulfilled' && Array.isArray(hubResult.value?.requests)
                    ? hubResult.value.requests
                    : [];
            const mediaRows =
                mediaResult.status === 'fulfilled' && Array.isArray(mediaResult.value?.requests)
                    ? mediaResult.value.requests
                    : [];

            const allRows = [...hubRows, ...mediaRows];
            const normalized = allRows
                .map(normalizeRow)
                .filter((row) => row.id.length > 0)
                .filter((row) => {
                    if (row.mediaId) return row.mediaId === mediaId;
                    if (routePostId && row.postId) return row.postId === routePostId;
                    return true;
                });

            const deduped = Array.from(
                normalized.reduce((map, row) => {
                    if (!map.has(row.id)) map.set(row.id, row);
                    return map;
                }, new Map<string, any>()),
            ).map(([, row]) => row);

            setIssueRequests(deduped);
        } catch {
            setIssueRequests([]);
        }
    }, [apiAccessToken, mediaId, routePostId, t]);

    useEffect(() => {
        loadIssueRequests().catch(() => {});
    }, [loadIssueRequests]);

    useEffect(() => {
        const unsubscribe = navigation.addListener?.('focus', () => {
            loadIssueRequests().catch(() => {});
        });
        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, [loadIssueRequests, navigation]);

    const visibleRequests = requestsExpanded ? issueRequests : issueRequests.slice(0, 2);
    const canLoadMore = issueRequests.length > 2 && !requestsExpanded;

    const handleVideoPress = () => {
        if (mediaType === 'video') {
            navigation.navigate('VideoPlayingScreen', {
                video: {
                    title: videoData.title,
                    thumbnail: videoData.thumbnail,
                    uri: videoData.videoUri,
                    media_id: mediaId,
                },
            });
            return;
        }
        navigation.navigate('PhotoDetailScreen', {
            media: {
                id: mediaId,
                eventId: eventIdDraft || null,
                thumbnailUrl: (videoData.thumbnail as any)?.uri || null,
                previewUrl: videoData.videoUri || null,
                originalUrl: videoData.videoUri || null,
                type: 'image',
            },
            eventTitle: videoData.title,
        });
    };

    const handlePickVideo = async () => {
        const result = await launchImageLibrary({ mediaType: 'video', selectionLimit: 1 });
        const asset = result.assets?.[0];
        if (asset) {
            setUploadFileName(asset.fileName || asset.uri || 'new_upload.mp4');
        }
    };

    const openStatusModal = (item: any) => {
        setSelectedRequest(item);
        setWontFixReason(item.reason ?? '');
        setStatusChoice(item.status === 'wont_fix' ? 'wont_fix' : 'fixed');
        setStatusModalVisible(true);
    };

    const applyStatusChange = () => {
        const status = statusChoice;
        if (!selectedRequest) return;
        if (status === 'wont_fix' && !wontFixReason.trim()) {
            return;
        }
        if (!apiAccessToken || !mediaId) return;
        setIsSavingStatus(true);
        updateMediaIssueRequest(apiAccessToken, mediaId, String(selectedRequest.id), {
            status: status === 'fixed' ? 'resolved' : 'wont_fix',
            resolution_reason: status === 'wont_fix' ? wontFixReason.trim() : '',
        })
            .then(() => {
                setIssueRequests((prev) =>
                    prev.map((req) =>
                        req.id === selectedRequest.id
                            ? { ...req, status, reason: status === 'wont_fix' ? wontFixReason.trim() : '' }
                            : req
                    )
                );
                setStatusModalVisible(false);
                loadIssueRequests().catch(() => {});
            })
            .finally(() => setIsSavingStatus(false));
    };

    const saveMediaEventChange = useCallback(async () => {
        if (!apiAccessToken || !mediaId) return;
        try {
            await updateMedia(apiAccessToken, mediaId, { event_id: eventIdDraft.trim() || null });
            setShowManageModal(false);
        } catch {}
    }, [apiAccessToken, eventIdDraft, mediaId]);

    const handleDeleteMedia = useCallback(async () => {
        if (!apiAccessToken || !mediaId) return;
        try {
            await deleteMedia(apiAccessToken, mediaId);
            setShowManageModal(false);
            navigation.goBack();
        } catch {}
    }, [apiAccessToken, mediaId, navigation]);

    const openBlogSettings = useCallback(() => {
        if (!routePostId) return;
        setShowManageModal(false);
        navigation.navigate('ProfileBlogEditorScreen', { mode: 'edit', postId: routePostId });
    }, [navigation, routePostId]);

    const handleDeleteBlog = useCallback(async () => {
        if (!apiAccessToken || !routePostId) return;
        try {
            await deletePost(apiAccessToken, routePostId);
            setShowManageModal(false);
            navigation.goBack();
        } catch {}
    }, [apiAccessToken, navigation, routePostId]);

    const renderEditRequestCard = (item: any) => (
        <TouchableOpacity key={item.id} style={Styles.editRequestCard} onPress={() => openStatusModal(item)} activeOpacity={0.8}>
            <View style={Styles.editRequestHeader}>
                <View style={Styles.receiptIconContainer}>
                    <Icons.ReceiptEdit height={22} width={22} />
                </View>
            </View>
            <View style={Styles.editRequestContent}>
                <Text style={Styles.editRequestTitle}>{item.title}</Text>
                <View style={Styles.editRequestMeta}>
                    <View style={Styles.metaItem}>
                        <Calendar size={12} color="#9B9F9F" variant="Linear" />
                        <Text style={Styles.metaText}>{item.date}</Text>
                    </View>
                    <View style={Styles.metaItem}>
                        <Clock size={12} color="#9B9F9F" variant="Linear" />
                        <Text style={Styles.metaText}>{item.time}</Text>
                    </View>
                </View>
            </View>
            {item.status === 'fixed' ? (
                <View style={Styles.fixedBadge}>
                    <Text style={Styles.fixedBadgeText}>{t('Fixed')}</Text>
                    <TickCircle size={14} color="#00BD48" variant="Linear" />
                </View>
            ) : item.status === 'wont_fix' ? (
                <View style={Styles.wontFixBadge}>
                    <Text style={Styles.wontFixBadgeText}>{t("Won't fix")}</Text>
                    <Refresh size={14} color="#FF3B30" variant="Linear" />
                </View>
            ) : (
                <View style={Styles.pendingBadge}>
                    <Text style={Styles.pendingBadgeText}>{t('Pending')}</Text>
                    <Refresh size={14} color="#FF8000" variant="Linear" />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{detailsTitle}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Video Player */}
                <TouchableOpacity
                    style={Styles.videoContainer}
                    onPress={handleVideoPress}
                    activeOpacity={0.9}
                >
                    <FastImage
                        source={videoData.thumbnail}
                        style={Styles.videoPlayer}
                        resizeMode="cover"
                    />
                    {mediaType === 'video' ? (
                        <View style={Styles.playButtonOverlay}>
                            <Icons.PlayCricle height={34} width={34} />
                        </View>
                    ) : null}
                </TouchableOpacity>

                {/* Video Info */}
                <View style={Styles.videoInfo}>
                    <View style={Styles.videoInfoRow}>
                        <Text style={Styles.videoTitle}>{videoData.title}</Text>
                        <View style={Styles.locationContainer}>
                            <Location size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.locationText}>{videoData.location}</Text>
                        </View>
                    </View>
                    <View style={Styles.videoInfoRow}>
                        <View style={Styles.durationContainer}>
                            <Clock size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.durationText}>{videoData.duration}</Text>
                        </View>
                        <View style={Styles.dateContainer}>
                            <Calendar size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.dateText}>{videoData.date}</Text>
                        </View>
                    </View>
                </View>

                {/* Request for Edits Section */}
                <Text style={Styles.sectionTitle}>{t('Request for edits')}</Text>
                <SizeBox height={16} />

                {issueRequests.length === 0 ? (
                    <View style={Styles.emptyStateContainer}>
                        <Icons.FileEmptyColorful height={120} width={120} />
                        <SizeBox height={12} />
                        <Text style={Styles.emptyStateText}>{t('No edit request found')}</Text>
                    </View>
                ) : (
                    <>
                        <View style={Styles.receivedLabel}>
                            <Text style={Styles.receivedText}>{t('Received')}</Text>
                        </View>

                        <SizeBox height={16} />

                        <View style={Styles.editRequestsGrid}>
                            <View style={Styles.editRequestsRow}>
                                {visibleRequests.map(renderEditRequestCard)}
                            </View>
                        </View>

                        {canLoadMore && (
                            <TouchableOpacity style={Styles.loadMoreButton} onPress={() => setRequestsExpanded(true)}>
                                <Text style={Styles.loadMoreText}>{t('Load more')}</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                <SizeBox height={24} />

                <TouchableOpacity
                    style={Styles.primaryButton}
                    onPress={() => setShowManageModal(true)}
                >
                    <Text style={Styles.primaryButtonText}>{t('Manage upload')}</Text>
                </TouchableOpacity>

                <SizeBox height={20} />
            </ScrollView>

            <Modal visible={showManageModal} transparent animationType="fade" onRequestClose={() => setShowManageModal(false)}>
                <View style={Styles.modalBackdrop}>
                    <View style={Styles.modalCard}>
                        <Text style={Styles.modalTitle}>{t('Edit upload')}</Text>
                        <Text style={Styles.modalSubtitle}>{t('Update your media details.')}</Text>

                        {routePostId ? (
                            <>
                                <TouchableOpacity style={Styles.modalUploadButton} onPress={openBlogSettings}>
                                    <Text style={Styles.modalUploadText}>{t('Edit blog settings')}</Text>
                                </TouchableOpacity>
                                <SizeBox height={10} />
                                <TouchableOpacity style={[Styles.modalUploadButton, { backgroundColor: '#FFE9E9', borderColor: '#FFB3B3' }]} onPress={handleDeleteBlog}>
                                    <Text style={[Styles.modalUploadText, { color: '#B00020' }]}>{t('Delete blog')}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                {mediaType === 'video' ? (
                                    <>
                                        <Text style={Styles.modalLabel}>{t('Reupload video')}</Text>
                                        <TouchableOpacity style={Styles.modalUploadButton} onPress={handlePickVideo}>
                                            <Text style={Styles.modalUploadText}>{t('Choose file')}</Text>
                                        </TouchableOpacity>
                                        {uploadFileName ? (
                                            <Text style={Styles.modalFileName}>{t('Selected:')} {uploadFileName}</Text>
                                        ) : null}
                                    </>
                                ) : null}
                                <Text style={Styles.modalLabel}>{t('Competition event id')}</Text>
                                <TextInput style={Styles.modalInput} value={eventIdDraft} onChangeText={setEventIdDraft} placeholder={t('event id')} placeholderTextColor="#9B9F9F" />
                                <View style={Styles.modalButtonRow}>
                                    <TouchableOpacity style={Styles.modalCancelButton} onPress={() => setShowManageModal(false)}>
                                        <Text style={Styles.modalCancelText}>{t('Cancel')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={Styles.modalSaveButton} onPress={saveMediaEventChange}>
                                        <Text style={Styles.modalSaveText}>{t('Save')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={[Styles.modalUploadButton, { marginTop: 10, backgroundColor: '#FFE9E9', borderColor: '#FFB3B3' }]} onPress={handleDeleteMedia}>
                                    <Text style={[Styles.modalUploadText, { color: '#B00020' }]}>{mediaType === 'video' ? t('Delete video') : t('Delete photo')}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal visible={statusModalVisible} transparent animationType="fade" onRequestClose={() => setStatusModalVisible(false)}>
                <View style={Styles.modalBackdrop}>
                    <View style={Styles.modalCard}>
                        <Text style={Styles.modalTitle}>{t('Update request status')}</Text>
                        <Text style={Styles.modalSubtitle}>{selectedRequest?.title}</Text>

                        <TouchableOpacity
                            style={[Styles.statusOption, statusChoice === 'fixed' && Styles.statusOptionActive]}
                            onPress={() => setStatusChoice('fixed')}
                        >
                            <Text style={Styles.statusOptionText}>{t('Mark as fixed')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[Styles.statusOption, statusChoice === 'wont_fix' && Styles.statusOptionActive]}
                            onPress={() => setStatusChoice('wont_fix')}
                        >
                            <Text style={Styles.statusOptionText}>{t("Won't fix")}</Text>
                        </TouchableOpacity>

                        {statusChoice === 'wont_fix' && (
                            <>
                                <Text style={Styles.modalLabel}>{t('Reason')}</Text>
                                <TextInput
                                    style={Styles.modalInput}
                                    placeholder={t('Explain why')}
                                    placeholderTextColor="#9B9F9F"
                                    value={wontFixReason}
                                    onChangeText={setWontFixReason}
                                />
                            </>
                        )}

                        <View style={Styles.modalButtonRow}>
                            <TouchableOpacity style={Styles.modalCancelButton} onPress={() => setStatusModalVisible(false)}>
                                <Text style={Styles.modalCancelText}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    Styles.modalSaveButton,
                                    statusChoice === 'wont_fix' && !wontFixReason.trim() && Styles.modalSaveButtonDisabled,
                                ]}
                                onPress={applyStatusChange}
                                disabled={(statusChoice === 'wont_fix' && !wontFixReason.trim()) || isSavingStatus}
                            >
                                <Text style={Styles.modalSaveText}>{t('Save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default VideoDetailsScreen;
