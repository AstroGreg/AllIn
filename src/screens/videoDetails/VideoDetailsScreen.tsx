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
    ArrowDown2,
} from 'iconsax-react-nativejs';
import Styles from './VideoDetailsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';
import Images from '../../constants/Images';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { getMediaById } from '../../services/apiGateway';
import { getApiBaseUrl, getHlsBaseUrl } from '../../constants/RuntimeConfig';

const VideoDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { apiAccessToken } = useAuth();
    const [showManageModal, setShowManageModal] = useState(false);
    const [uploadFileName, setUploadFileName] = useState<string | null>(null);
    const [editLocation, setEditLocation] = useState('Berlin, Germany');
    const [editDescription, setEditDescription] = useState('PK 400m Limburg 2025');
    const [editWatermark, setEditWatermark] = useState('AllIn');
    const [editCompetition, setEditCompetition] = useState('BK Studentent 23');
    const [editEventLabel, setEditEventLabel] = useState('400m');
    const [showCompetitionOptions, setShowCompetitionOptions] = useState(false);
    const [showEventOptions, setShowEventOptions] = useState(false);
    const [requestsExpanded, setRequestsExpanded] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [wontFixReason, setWontFixReason] = useState('');
    const [statusChoice, setStatusChoice] = useState<'fixed' | 'wont_fix'>('fixed');

    const routeVideo = route?.params?.video;
    const mediaId = '86db92e8-1b8e-44a5-95c4-fb4764f6783e';
    const [videoData, setVideoData] = useState({
        title: routeVideo?.title ?? 'BK Studentent 23',
        location: routeVideo?.location ?? 'Berlin, Germany',
        duration: routeVideo?.duration ?? '2 Minutes',
        date: routeVideo?.date ?? '27/05/2025',
        videoUri: '',
        thumbnail: Images.photo7,
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
    }, [apiAccessToken, mediaId, toAbsoluteUrl, toHlsUrl, withAccessToken]);

    const baseEditRequests = [
        {
            id: 1,
            title: 'Request new title',
            date: '12/12/2024',
            time: '12:00',
            status: 'pending',
            reason: '',
        },
        {
            id: 2,
            title: 'Wrong competition',
            date: '12/12/2024',
            time: '12:00',
            status: 'pending',
            reason: '',
        },
        {
            id: 3,
            title: 'Wrong event',
            date: '12/12/2024',
            time: '12:00',
            status: 'fixed',
            reason: '',
        },
    ];
    const [editRequests, setEditRequests] = useState(baseEditRequests);

    const visibleRequests = requestsExpanded ? editRequests : editRequests.slice(0, 2);
    const canLoadMore = editRequests.length > 2 && !requestsExpanded;

    useEffect(() => {
        if (videoData.title === 'PK 400m Limburg 2025') {
            setEditRequests([]);
        } else {
            setEditRequests(baseEditRequests);
        }
        setRequestsExpanded(false);
    }, [videoData.title]);

    const competitionOptions = ['BK Studentent 23', 'IFAM 2024', 'Sunrise 10K Community Run'];
    const eventLabelOptions = ['60m', '100m', '200m', '400m', '800m', '1500m', '5K', '10K'];

    const handleVideoPress = () => {
        navigation.navigate('VideoPlayingScreen', {
            video: {
                title: videoData.title,
                subtitle: editEventLabel,
                thumbnail: videoData.thumbnail,
                uri: videoData.videoUri,
            },
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
        setEditRequests((prev) =>
            prev.map((req) =>
                req.id === selectedRequest.id
                    ? { ...req, status, reason: status === 'wont_fix' ? wontFixReason.trim() : '' }
                    : req
            )
        );
        setStatusModalVisible(false);
    };

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
                    <Text style={Styles.fixedBadgeText}>Fixed</Text>
                    <TickCircle size={14} color="#00BD48" variant="Linear" />
                </View>
            ) : item.status === 'wont_fix' ? (
                <View style={Styles.wontFixBadge}>
                    <Text style={Styles.wontFixBadgeText}>Won't fix</Text>
                    <Refresh size={14} color="#FF3B30" variant="Linear" />
                </View>
            ) : (
                <View style={Styles.pendingBadge}>
                    <Text style={Styles.pendingBadgeText}>Pending</Text>
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
                    <ArrowLeft2 size={20} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Video Details</Text>
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
                    <View style={Styles.playButtonOverlay}>
                        <Icons.PlayCricle height={34} width={34} />
                    </View>
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
                <Text style={Styles.sectionTitle}>Request for Edits</Text>
                <SizeBox height={16} />

                {editRequests.length === 0 ? (
                    <View style={Styles.emptyStateContainer}>
                        <Icons.FileEmptyColorful height={120} width={120} />
                        <SizeBox height={12} />
                        <Text style={Styles.emptyStateText}>No edit request found</Text>
                    </View>
                ) : (
                    <>
                        <View style={Styles.receivedLabel}>
                            <Text style={Styles.receivedText}>Received</Text>
                        </View>

                        <SizeBox height={16} />

                        <View style={Styles.editRequestsGrid}>
                            <View style={Styles.editRequestsRow}>
                                {visibleRequests.map(renderEditRequestCard)}
                            </View>
                        </View>

                        {canLoadMore && (
                            <TouchableOpacity style={Styles.loadMoreButton} onPress={() => setRequestsExpanded(true)}>
                                <Text style={Styles.loadMoreText}>Load more</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                <SizeBox height={24} />

                <TouchableOpacity
                    style={Styles.primaryButton}
                    onPress={() => setShowManageModal(true)}
                >
                    <Text style={Styles.primaryButtonText}>Manage upload</Text>
                </TouchableOpacity>

                <SizeBox height={20} />
            </ScrollView>

            <Modal visible={showManageModal} transparent animationType="fade" onRequestClose={() => setShowManageModal(false)}>
                <View style={Styles.modalBackdrop}>
                    <View style={Styles.modalCard}>
                        <Text style={Styles.modalTitle}>Edit upload</Text>
                        <Text style={Styles.modalSubtitle}>Update your media details.</Text>

                        <Text style={Styles.modalLabel}>Reupload video</Text>
                        <TouchableOpacity style={Styles.modalUploadButton} onPress={handlePickVideo}>
                            <Text style={Styles.modalUploadText}>Choose file</Text>
                        </TouchableOpacity>
                        {uploadFileName ? (
                            <Text style={Styles.modalFileName}>Selected: {uploadFileName}</Text>
                        ) : null}

                        <Text style={Styles.modalLabel}>Location</Text>
                        <TextInput style={Styles.modalInput} value={editLocation} onChangeText={setEditLocation} />

                        <Text style={Styles.modalLabel}>Description</Text>
                        <TextInput style={Styles.modalInput} value={editDescription} onChangeText={setEditDescription} />

                        <Text style={Styles.modalLabel}>Watermark</Text>
                        <TextInput style={Styles.modalInput} value={editWatermark} onChangeText={setEditWatermark} />

                        <Text style={Styles.modalLabel}>Competition</Text>
                        <TouchableOpacity
                            style={Styles.modalSelectRow}
                            onPress={() => setShowCompetitionOptions((prev) => !prev)}
                        >
                            <Text style={Styles.modalSelectText}>{editCompetition}</Text>
                            <ArrowDown2 size={16} color="#9B9F9F" variant="Linear" />
                        </TouchableOpacity>
                        {showCompetitionOptions && (
                            <View style={Styles.modalOptionsList}>
                                {competitionOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={Styles.modalOption}
                                        onPress={() => {
                                            setEditCompetition(option);
                                            setShowCompetitionOptions(false);
                                        }}
                                    >
                                        <Text style={Styles.modalOptionText}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <Text style={Styles.modalLabel}>Event label</Text>
                        <TouchableOpacity
                            style={Styles.modalSelectRow}
                            onPress={() => setShowEventOptions((prev) => !prev)}
                        >
                            <Text style={Styles.modalSelectText}>{editEventLabel}</Text>
                            <ArrowDown2 size={16} color="#9B9F9F" variant="Linear" />
                        </TouchableOpacity>
                        {showEventOptions && (
                            <View style={Styles.modalOptionsList}>
                                {eventLabelOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={Styles.modalOption}
                                        onPress={() => {
                                            setEditEventLabel(option);
                                            setShowEventOptions(false);
                                        }}
                                    >
                                        <Text style={Styles.modalOptionText}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={Styles.modalButtonRow}>
                            <TouchableOpacity style={Styles.modalCancelButton} onPress={() => setShowManageModal(false)}>
                                <Text style={Styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.modalSaveButton} onPress={() => setShowManageModal(false)}>
                                <Text style={Styles.modalSaveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={statusModalVisible} transparent animationType="fade" onRequestClose={() => setStatusModalVisible(false)}>
                <View style={Styles.modalBackdrop}>
                    <View style={Styles.modalCard}>
                        <Text style={Styles.modalTitle}>Update request status</Text>
                        <Text style={Styles.modalSubtitle}>{selectedRequest?.title}</Text>

                        <TouchableOpacity
                            style={[Styles.statusOption, statusChoice === 'fixed' && Styles.statusOptionActive]}
                            onPress={() => setStatusChoice('fixed')}
                        >
                            <Text style={Styles.statusOptionText}>Mark as fixed</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[Styles.statusOption, statusChoice === 'wont_fix' && Styles.statusOptionActive]}
                            onPress={() => setStatusChoice('wont_fix')}
                        >
                            <Text style={Styles.statusOptionText}>Won't fix</Text>
                        </TouchableOpacity>

                        {statusChoice === 'wont_fix' && (
                            <>
                                <Text style={Styles.modalLabel}>Reason</Text>
                                <TextInput
                                    style={Styles.modalInput}
                                    placeholder="Explain why"
                                    placeholderTextColor="#9B9F9F"
                                    value={wontFixReason}
                                    onChangeText={setWontFixReason}
                                />
                            </>
                        )}

                        <View style={Styles.modalButtonRow}>
                            <TouchableOpacity style={Styles.modalCancelButton} onPress={() => setStatusModalVisible(false)}>
                                <Text style={Styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    Styles.modalSaveButton,
                                    statusChoice === 'wont_fix' && !wontFixReason.trim() && Styles.modalSaveButtonDisabled,
                                ]}
                                onPress={applyStatusChange}
                                disabled={statusChoice === 'wont_fix' && !wontFixReason.trim()}
                            >
                                <Text style={Styles.modalSaveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default VideoDetailsScreen;
