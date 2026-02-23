import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Alert, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import {
    ArrowLeft2,
    ArrowRight,
    More,
    TickCircle,
    CloseCircle,
} from 'iconsax-react-nativejs';
import { createStyles } from './VideoPlayingScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import SubscriptionModal from '../../components/subscriptionModal/SubscriptionModal';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { createMediaIssueRequest, getMediaById } from '../../services/apiGateway';
import { getApiBaseUrl, getHlsBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next'

const VideoPlayingScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const showBuyModalOnLoad = route?.params?.showBuyModal || false;
    const videoPrice = route?.params?.video?.price || '€0,20';
    const fallbackVideo = route?.params?.video || {
        title: t('PK 800m 2023 indoor'),
        thumbnail: Images.photo1,
        uri: '',
    };
    const routeMediaId =
        route?.params?.video?.media_id ||
        route?.params?.video?.id ||
        route?.params?.media_id ||
        route?.params?.media?.id ||
        null;
    const [videoTitle, setVideoTitle] = useState(fallbackVideo.title);
    const [videoUrl, setVideoUrl] = useState<string | null>(fallbackVideo.uri || null);
    const fallbackPoster = useCallback(() => {
        if (!fallbackVideo.thumbnail) return null;
        if (typeof fallbackVideo.thumbnail === 'number') {
            return Image.resolveAssetSource(fallbackVideo.thumbnail).uri;
        }
        if (typeof fallbackVideo.thumbnail === 'string') {
            return fallbackVideo.thumbnail;
        }
        return fallbackVideo.thumbnail?.uri ?? null;
    }, [fallbackVideo.thumbnail]);
    const [posterUrl, setPosterUrl] = useState<string | null>(() => fallbackPoster());

    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showFailedModal, setShowFailedModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [pendingSeek, setPendingSeek] = useState(0);
    const videoRef = useRef<Video>(null);
    const [sliderWidth, setSliderWidth] = useState(0);
    const [moreMenuVisible, setMoreMenuVisible] = useState(false);
    const [moreMenuActions, setMoreMenuActions] = useState<Array<{ label: string; onPress: () => void }>>([]);
    const [reportIssueVisible, setReportIssueVisible] = useState(false);
    const [reportStep, setReportStep] = useState<'reason' | 'confirm'>('reason');
    const [selectedReportReason, setSelectedReportReason] = useState('');
    const [customReportReason, setCustomReportReason] = useState('');
    const [infoPopupVisible, setInfoPopupVisible] = useState(false);
    const [infoPopupTitle, setInfoPopupTitle] = useState('');
    const [infoPopupMessage, setInfoPopupMessage] = useState('');

    useEffect(() => {
        setVideoTitle(fallbackVideo.title);
        setVideoUrl(fallbackVideo.uri || null);
        setPosterUrl(fallbackPoster());
    }, [fallbackPoster, fallbackVideo.title, fallbackVideo.uri]);

    const formatTime = useCallback((value: number) => {
        const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
        const minutes = Math.floor(safe / 60);
        const seconds = Math.floor(safe % 60);
        const padded = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minutes}:${padded}`;
    }, []);

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
        if (!apiAccessToken || !routeMediaId) {
            return () => {};
        }
        getMediaById(apiAccessToken, String(routeMediaId))
            .then((media) => {
                if (!mounted) return;
                const title = media.title || media.description || fallbackVideo.title;
                setVideoTitle(title);
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
                const mp4 = candidates.find((value) => /\.(mp4|mov|m4v)(\\?|$)/i.test(value));
                const resolvedVideo = hls || mp4 || candidates[0] || fallbackVideo.uri || null;
                const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
                const resolvedPoster = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : fallbackPoster();
                setVideoUrl(withAccessToken(resolvedVideo || '') || resolvedVideo || null);
                setPosterUrl(withAccessToken(resolvedPoster || '') || resolvedPoster || null);
            })
            .catch((err: any) => {
                if (!mounted) return;
                // ignore fetch errors for now; keep fallback values
            });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, fallbackPoster, fallbackVideo.title, fallbackVideo.uri, routeMediaId, toAbsoluteUrl, toHlsUrl, withAccessToken]);

    useEffect(() => {
        if (showBuyModalOnLoad) {
            setShowBuyModal(true);
        }
    }, [showBuyModalOnLoad]);

    const handlePay = () => {
        setShowBuyModal(false);
        setShowSuccessModal(true);
    };

    const handleCancel = () => {
        setShowBuyModal(false);
        setShowFailedModal(true);
    };

    const handleDownload = () => {
        setShowSuccessModal(false);
        // Handle download logic here
    };

    const handleRecharge = () => {
        setShowFailedModal(false);
        setShowSubscriptionModal(true);
    };

    const showInfoPopup = useCallback((title: string, message: string) => {
        setInfoPopupTitle(title);
        setInfoPopupMessage(message);
        setInfoPopupVisible(true);
    }, []);

    useEffect(() => {
        if (!infoPopupVisible) return;
        const timer = setTimeout(() => {
            setInfoPopupVisible(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [infoPopupVisible]);

    const reportReasons = useMemo(
        () => [
            t('Wrong competition'),
            t('Wrong heat'),
            t('Custom'),
        ],
        [t],
    );

    const openReportIssuePopup = useCallback(() => {
        setSelectedReportReason('');
        setCustomReportReason('');
        setReportStep('reason');
        setReportIssueVisible(true);
    }, []);

    const handleGoToProfile = () => {
        navigation.navigate('BottomTabBar', { screen: 'Profile' });
    };

    const handleGoToEvent = () => {
        navigation.navigate('CompetitionDetailsScreen', {
            name: videoTitle,
            description: `${t('Competition held in')} ${videoTitle}`,
            competitionType: 'track',
        });
    };

    const handleMarkInappropriate = () => {
        Alert.alert(t('Thanks'), t('We will review this content.'));
    };

    const handleRequestRemoval = () => {
        Alert.alert(t('Request sent'), t('We will review the removal request.'));
    };

    const openMoreMenu = useCallback(() => {
        const actions = [
            {label: t('Report an issue with this video/photo'), onPress: openReportIssuePopup},
            {label: t('Go to author profile'), onPress: handleGoToProfile},
            {label: t('Go to event'), onPress: handleGoToEvent},
            {label: t('Mark as inappropriate content'), onPress: handleMarkInappropriate},
            {label: t('Request this video removed'), onPress: handleRequestRemoval},
        ];
        setMoreMenuActions(actions);
        setMoreMenuVisible(true);
    }, [handleGoToEvent, handleGoToProfile, handleMarkInappropriate, handleRequestRemoval, openReportIssuePopup, t]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={Styles.headerBack}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitleCentered} numberOfLines={1}>
                    {videoTitle}
                </Text>
                <TouchableOpacity onPress={openMoreMenu} style={Styles.headerMore}>
                    <More size={24} color={colors.mainTextColor} variant="Linear" style={{ transform: [{ rotate: '90deg' }] }} />
                </TouchableOpacity>
            </View>

            {/* Video Container */}
            <TouchableOpacity
                style={Styles.videoContainer}
                activeOpacity={0.9}
                onPress={() => setIsPlaying((prev) => !prev)}
            >
                {videoUrl ? (
                    <Video
                        ref={videoRef}
                        source={{ uri: videoUrl, type: String(videoUrl).includes('.m3u8') ? 'm3u8' : undefined }}
                        style={Styles.videoImage}
                        resizeMode="cover"
                        controls={false}
                        paused={!isPlaying}
                        poster={posterUrl || Image.resolveAssetSource(Images.photo1).uri}
                        posterResizeMode="cover"
                        ignoreSilentSwitch="ignore"
                        repeat={false}
                        onLoad={(meta) => {
                            setDuration(meta.duration || 0);
                        }}
                        onProgress={(progress) => {
                            if (!isSeeking) {
                                setCurrentTime(progress.currentTime);
                            }
                        }}
                    />
                ) : (
                    <FastImage
                        source={posterUrl ? { uri: posterUrl } : Images.photo1}
                        style={Styles.videoImage}
                        resizeMode="cover"
                    />
                )}

                {!isPlaying && (
                    <View style={Styles.playButtonOverlay}>
                        <Icons.PlayCricle width={46} height={46} />
                    </View>
                )}

                {duration > 0 && (
                    <View
                        style={Styles.videoSliderOverlay}
                        onLayout={(event) => {
                            setSliderWidth(event.nativeEvent.layout.width);
                        }}
                    >
                        <View
                            style={[
                                Styles.videoSliderTimeBubble,
                                sliderWidth > 0
                                    ? {
                                          left:
                                              Math.min(
                                                  sliderWidth - 32,
                                                  Math.max(
                                                      0,
                                                      (sliderWidth * (isSeeking ? pendingSeek : currentTime)) / duration - 16,
                                                  ),
                                              ),
                                      }
                                    : undefined,
                            ]}
                        >
                            <Text style={Styles.videoSliderTime}>{formatTime(isSeeking ? pendingSeek : currentTime)}</Text>
                        </View>
                        <Slider
                            minimumValue={0}
                            maximumValue={duration}
                            value={isSeeking ? pendingSeek : currentTime}
                            minimumTrackTintColor={colors.primaryColor}
                            maximumTrackTintColor="rgba(255,255,255,0.45)"
                            thumbTintColor={colors.primaryColor}
                            onValueChange={(value) => {
                                setIsSeeking(true);
                                setPendingSeek(value);
                            }}
                            onSlidingComplete={(value) => {
                                videoRef.current?.seek(value);
                                setCurrentTime(value);
                                setIsSeeking(false);
                            }}
                        />
                    </View>
                )}
            </TouchableOpacity>

            <SizeBox height={insets.bottom > 0 ? insets.bottom : 0} />

            <Modal
                visible={moreMenuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMoreMenuVisible(false)}
            >
                <View style={Styles.moreMenuOverlay}>
                    <Pressable style={Styles.moreMenuBackdrop} onPress={() => setMoreMenuVisible(false)} />
                    <View style={Styles.moreMenuContainer}>
                        {moreMenuActions.map((item, index) => (
                            <TouchableOpacity
                                key={`${item.label}-${index}`}
                                style={Styles.moreMenuAction}
                                activeOpacity={0.85}
                                onPress={() => {
                                    setMoreMenuVisible(false);
                                    setTimeout(() => item.onPress(), 120);
                                }}
                            >
                                <Text style={Styles.moreMenuActionText}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={Styles.moreMenuCancel}
                            activeOpacity={0.85}
                            onPress={() => setMoreMenuVisible(false)}
                        >
                            <Text style={Styles.moreMenuCancelText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={reportIssueVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setReportIssueVisible(false);
                    setReportStep('reason');
                    setSelectedReportReason('');
                    setCustomReportReason('');
                }}
            >
                <View style={Styles.moreMenuOverlay}>
                    <Pressable
                        style={Styles.moreMenuBackdrop}
                        onPress={() => {
                            setReportIssueVisible(false);
                            setReportStep('reason');
                            setSelectedReportReason('');
                            setCustomReportReason('');
                        }}
                    />
                    <View style={Styles.moreMenuContainer}>
                        <Text style={Styles.moreMenuTitle}>
                            {reportStep === 'reason'
                                ? t('Report an issue with this photo/video')
                                : t('Confirm request')}
                        </Text>
                        <View style={Styles.moreMenuDivider} />
                        {reportStep === 'reason' ? (
                            <>
                                {reportReasons.map((reason) => (
                                    <TouchableOpacity
                                        key={reason}
                                        style={Styles.moreMenuAction}
                                        activeOpacity={0.85}
                                        onPress={() => {
                                            setSelectedReportReason(reason);
                                            if (reason === t('Custom')) {
                                                return;
                                            }
                                            setReportStep('confirm');
                                        }}
                                    >
                                        <Text style={Styles.moreMenuActionText}>{reason}</Text>
                                    </TouchableOpacity>
                                ))}
                                {selectedReportReason === t('Custom') ? (
                                    <View style={[Styles.moreMenuAction, { borderBottomWidth: 0 }]}>
                                        <TextInput
                                            style={[Styles.moreMenuActionText, { borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }]}
                                            value={customReportReason}
                                            onChangeText={setCustomReportReason}
                                            placeholder={t('Type your request')}
                                            placeholderTextColor={colors.subTextColor}
                                        />
                                        <TouchableOpacity
                                            style={[Styles.infoModalSubmitButton, { marginTop: 10 }]}
                                            activeOpacity={0.85}
                                            onPress={() => {
                                                if (!customReportReason.trim()) return;
                                                setReportStep('confirm');
                                            }}
                                        >
                                            <Text style={Styles.infoModalSubmitButtonText}>{t('Next')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}
                                <TouchableOpacity
                                    style={Styles.moreMenuCancel}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        setReportIssueVisible(false);
                                        setReportStep('reason');
                                        setSelectedReportReason('');
                                        setCustomReportReason('');
                                    }}
                                >
                                    <Text style={Styles.moreMenuCancelText}>{t('Cancel')}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <View style={Styles.moreMenuAction}>
                                    <Text style={Styles.moreMenuActionText}>
                                        {`${t('Reason')}: ${selectedReportReason}${selectedReportReason === t('Custom') ? ` - ${customReportReason.trim()}` : ''}`}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[Styles.infoModalSubmitButton, { marginTop: 8 }]}
                                    activeOpacity={0.85}
                                    onPress={async () => {
                                        const mediaId = String(routeMediaId || '').trim();
                                        if (!apiAccessToken || !mediaId) return;
                                        const issue_type = selectedReportReason === t('Wrong competition')
                                            ? 'wrong_competition'
                                            : selectedReportReason === t('Wrong heat')
                                                ? 'wrong_heat'
                                                : 'custom';
                                        try {
                                            await createMediaIssueRequest(apiAccessToken, {
                                                media_id: mediaId,
                                                issue_type,
                                                custom_text: issue_type === 'custom' ? customReportReason.trim() : undefined,
                                            });
                                        } catch (e: any) {
                                            const msg = String(e?.message || t('Could not submit request'));
                                            showInfoPopup(t('Request failed'), msg);
                                            return;
                                        }
                                        setReportIssueVisible(false);
                                        setReportStep('reason');
                                        setSelectedReportReason('');
                                        setCustomReportReason('');
                                        setTimeout(() => {
                                            showInfoPopup(t('Request sent'), t('Your edit request is now pending.'));
                                        }, 120);
                                    }}
                                >
                                    <Text style={Styles.infoModalSubmitButtonText}>{t('Submit')}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal
                visible={infoPopupVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setInfoPopupVisible(false)}
            >
                <View style={Styles.moreMenuOverlay}>
                    <Pressable style={Styles.moreMenuBackdrop} onPress={() => setInfoPopupVisible(false)} />
                    <View style={Styles.infoModalContainer}>
                        <Text style={Styles.infoModalTitle}>{infoPopupTitle}</Text>
                        <Text style={Styles.infoModalText}>{infoPopupMessage}</Text>
                    </View>
                </View>
            </Modal>

            {/* Buy Modal */}
            <Modal
                visible={showBuyModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowBuyModal(false)}
            >
                <View style={Styles.modalOverlay}>
                    <View style={Styles.modalContainer}>
                        <FastImage
                            source={posterUrl ? { uri: posterUrl } : Images.photo1}
                            style={Styles.modalImage}
                            resizeMode="cover"
                        />
                        <View style={Styles.modalInfoRow}>
                            <Text style={Styles.modalTitle}>{videoTitle}</Text>
                            <Text style={Styles.modalPrice}>{videoPrice}</Text>
                        </View>
                        <View style={Styles.modalDivider} />
                        <View style={Styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={Styles.cancelButton}
                                onPress={handleCancel}
                            >
                                <Text style={Styles.modalButtonText}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.payButton}
                                onPress={handlePay}
                            >
                                <Text style={Styles.modalButtonText}>{t('Pay')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={Styles.modalOverlay}>
                    <View style={Styles.successModalContainer}>
                        <View style={Styles.successIconContainer}>
                            <TickCircle size={50} color="#00BD48" variant="Bold" />
                        </View>
                        <Text style={Styles.successTitle}>{t('Accepted')}</Text>
                        <Text style={Styles.successSubtitle}>
                            Photo added to your account. Resale is prohibited.
                        </Text>
                        <TouchableOpacity
                            style={Styles.downloadButton}
                            onPress={handleDownload}
                        >
                            <Text style={Styles.downloadButtonText}>{t('Download')}</Text>
                            <ArrowRight size={18} color="#FFFFFF" variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Failed Modal */}
            <Modal
                visible={showFailedModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowFailedModal(false)}
            >
                <View style={Styles.modalOverlay}>
                    <View style={Styles.failedModalContainer}>
                        <View style={Styles.failedIconContainer}>
                            <CloseCircle size={50} color="#ED5454" variant="Bold" />
                        </View>
                        <Text style={Styles.failedTitle}>{t('Failed')}</Text>
                        <Text style={Styles.failedSubtitle}>
                            Insufficient balance. Please recharge.
                        </Text>
                        <View style={Styles.failedButtonsRow}>
                            <TouchableOpacity
                                style={Styles.failedCancelButton}
                                onPress={() => setShowFailedModal(false)}
                            >
                                <Text style={Styles.failedButtonText}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.rechargeButton}
                                onPress={handleRecharge}
                            >
                                <Text style={Styles.failedButtonText}>{t('Recharge')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <SubscriptionModal
                isVisible={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
            />
        </View>
    );
};

export default VideoPlayingScreen;
