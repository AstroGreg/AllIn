import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Pressable, Image, FlatList } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft2, ArrowRight, Ghost } from 'iconsax-react-nativejs'
import { createStyles } from './WatermarkScreenStyles'
import SizeBox from '../../constants/SizeBox'
import { useTheme } from '../../context/ThemeContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FastImage from 'react-native-fast-image'
import { useTranslation } from 'react-i18next';
import Video from 'react-native-video';
import { useFocusEffect } from '@react-navigation/native';

function normalizeLocalUri(uri?: string | null) {
    if (!uri) return uri;
    if (!String(uri).startsWith('file://')) return uri;
    let path = String(uri).slice('file://'.length);
    const q = path.indexOf('?');
    if (q !== -1) path = path.slice(0, q);
    try {
        path = decodeURI(path);
    } catch {}
    return `file://${path}`;
}

const DEFAULT_WATERMARK_TEXT = 'SpotMe';
type PreviewAsset = {
    uri: string;
    type?: string | null;
    width?: number;
    height?: number;
};

const WatermarkScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const competition = route?.params?.competition;
    const account = route?.params?.account;
    const anonymous = route?.params?.anonymous;
    const competitionType = route?.params?.competitionType ?? competition?.competitionType;

    const [watermarkText, setWatermarkText] = useState(DEFAULT_WATERMARK_TEXT);
    const [previewAssets, setPreviewAssets] = useState<PreviewAsset[]>([]);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [previewSizeByUri, setPreviewSizeByUri] = useState<Record<string, { width: number; height: number }>>({});
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [previewCardSize, setPreviewCardSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [previewModalSize, setPreviewModalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const previewCardListRef = useRef<FlatList<PreviewAsset> | null>(null);
    const previewModalListRef = useRef<FlatList<PreviewAsset> | null>(null);
    const previewCardPageWidth = Math.max(1, Number(previewCardSize.width || 0));
    const previewCardPageHeight = Math.max(1, Number(previewCardSize.height || 0));
    const previewModalPageWidth = Math.max(1, Number(previewModalSize.width || 0));
    const previewModalPageHeight = Math.max(1, Number(previewModalSize.height || 0));
    const watermarkLabel = (watermarkText || DEFAULT_WATERMARK_TEXT).trim();
    const watermarkRows = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);

    const competitionId = useMemo(
        () => String(competition?.id || competition?.event_id || competition?.eventId || 'competition'),
        [competition?.event_id, competition?.eventId, competition?.id],
    );
    const getAssetSize = useCallback((asset: any) => {
        const width = Number(asset?.width ?? 0);
        const height = Number(asset?.height ?? 0);
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
        return { width, height };
    }, []);
    const mapPreviewAssets = useCallback((parsed: any): PreviewAsset[] => {
        if (!parsed || typeof parsed !== 'object') return [];
        const allAssets = Object.values(parsed).flatMap((list: any) => (Array.isArray(list) ? list : []));
        return allAssets
            .map((asset: any) => ({
                uri: String(normalizeLocalUri(asset?.uri ?? null) ?? ''),
                type: asset?.type ?? null,
                width: Number(asset?.width ?? 0) || undefined,
                height: Number(asset?.height ?? 0) || undefined,
            }))
            .filter((asset: PreviewAsset) => Boolean(asset.uri));
    }, []);
    const applyPreviewAssets = useCallback((assets: PreviewAsset[], resetWatermarkOnEmpty = false) => {
        setPreviewAssets(assets);
        setPreviewIndex((prev) => {
            if (assets.length === 0) return 0;
            return Math.min(prev, assets.length - 1);
        });
        setPreviewSizeByUri((prev) => {
            let changed = false;
            let next = prev;
            assets.forEach((asset) => {
                const size = getAssetSize(asset);
                if (!size) return;
                const existing = next[asset.uri];
                if (existing && existing.width === size.width && existing.height === size.height) return;
                if (!changed) {
                    next = { ...next };
                    changed = true;
                }
                next[asset.uri] = size;
            });
            return changed ? next : prev;
        });
        if (resetWatermarkOnEmpty && assets.length === 0) {
            setWatermarkText(DEFAULT_WATERMARK_TEXT);
        }
    }, [getAssetSize]);
    const getSizeForAsset = useCallback((asset: PreviewAsset | null | undefined) => {
        if (!asset) return null;
        return previewSizeByUri[asset.uri] ?? getAssetSize(asset);
    }, [getAssetSize, previewSizeByUri]);
    const isVideoAsset = useCallback((asset: PreviewAsset | null | undefined) => {
        if (!asset) return false;
        const uri = String(asset.uri || '').toLowerCase();
        const type = String(asset.type || '').toLowerCase();
        return (
            type.includes('video') ||
            uri.includes('.mp4') ||
            uri.includes('.mov') ||
            uri.includes('.m4v') ||
            uri.includes('video')
        );
    }, []);

    useEffect(() => {
        let mounted = true;
        const loadPreview = async () => {
            try {
                const assetsRaw = await AsyncStorage.getItem(`@upload_assets_${competitionId}`);
                const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
                const assets = mapPreviewAssets(parsed);
                if (mounted) {
                    applyPreviewAssets(assets);
                }
            } catch {
                if (mounted) applyPreviewAssets([]);
            }
        };
        loadPreview();
        return () => {
            mounted = false;
        };
    }, [applyPreviewAssets, competitionId, mapPreviewAssets]);

    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            const loadPreviewOnFocus = async () => {
                try {
                    const assetsRaw = await AsyncStorage.getItem(`@upload_assets_${competitionId}`);
                    const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
                    const assets = mapPreviewAssets(parsed);
                    if (mounted) {
                        applyPreviewAssets(assets, true);
                    }
                } catch {
                    if (mounted) {
                        applyPreviewAssets([], true);
                    }
                }
            };
            loadPreviewOnFocus();
            return () => {
                mounted = false;
            };
        }, [applyPreviewAssets, competitionId, mapPreviewAssets]),
    );

    const computeContainFrame = useCallback(
        (
            container: { width: number; height: number },
            media: { width: number; height: number } | null,
        ) => {
            const containerWidth = Number(container?.width || 0);
            const containerHeight = Number(container?.height || 0);
            if (containerWidth <= 0 || containerHeight <= 0) {
                return { width: 0, height: 0 };
            }
            if (!media || media.width <= 0 || media.height <= 0) {
                return { width: containerWidth, height: containerHeight };
            }
            const mediaRatio = media.width / media.height;
            const containerRatio = containerWidth / containerHeight;
            if (mediaRatio > containerRatio) {
                return { width: containerWidth, height: containerWidth / mediaRatio };
            }
            return { width: containerHeight * mediaRatio, height: containerHeight };
        },
        [],
    );

    useEffect(() => {
        const current = previewAssets[previewIndex];
        if (!current || isVideoAsset(current)) return;
        if (getSizeForAsset(current)) return;
        Image.getSize(
            current.uri,
            (width, height) => {
                if (width > 0 && height > 0) {
                    setPreviewSizeByUri((prev) => ({ ...prev, [current.uri]: { width, height } }));
                }
            },
            () => {},
        );
    }, [getSizeForAsset, isVideoAsset, previewAssets, previewIndex]);

    useEffect(() => {
        if (previewModalVisible) return;
        if (!previewAssets.length) return;
        if (previewCardPageWidth <= 1) return;
        previewCardListRef.current?.scrollToOffset({
            offset: previewIndex * previewCardPageWidth,
            animated: false,
        });
    }, [previewAssets.length, previewCardPageWidth, previewIndex, previewModalVisible]);

    useEffect(() => {
        if (!previewModalVisible) return;
        if (!previewAssets.length) return;
        if (previewModalPageWidth <= 1) return;
        const timer = setTimeout(() => {
            previewModalListRef.current?.scrollToOffset({
                offset: previewIndex * previewModalPageWidth,
                animated: false,
            });
        }, 0);
        return () => clearTimeout(timer);
    }, [previewAssets.length, previewIndex, previewModalPageWidth, previewModalVisible]);

    const handleSave = () => {
        navigation.navigate('UploadSummaryScreen', {
            competition,
            account,
            anonymous,
            competitionType,
            watermarkText: watermarkText.trim() || DEFAULT_WATERMARK_TEXT,
        });
    };

    const handleSkip = () => {
        navigation.navigate('UploadSummaryScreen', {
            competition,
            account,
            anonymous,
            competitionType,
            watermarkText: '',
        });
    };
    const openPreviewModal = useCallback(() => {
        if (!previewAssets.length) return;
        setPreviewModalVisible(true);
    }, [previewAssets.length]);
    const getPreviewItemLayout = useCallback((_: ArrayLike<PreviewAsset> | null | undefined, index: number) => ({
        index,
        length: previewCardPageWidth,
        offset: previewCardPageWidth * index,
    }), [previewCardPageWidth]);
    const getModalItemLayout = useCallback((_: ArrayLike<PreviewAsset> | null | undefined, index: number) => ({
        index,
        length: previewModalPageWidth,
        offset: previewModalPageWidth * index,
    }), [previewModalPageWidth]);
    const handleCardMomentumEnd = useCallback((event: any) => {
        if (!previewAssets.length || previewCardPageWidth <= 1) return;
        const next = Math.round(Number(event?.nativeEvent?.contentOffset?.x ?? 0) / previewCardPageWidth);
        const safe = Math.max(0, Math.min(previewAssets.length - 1, next));
        if (safe !== previewIndex) setPreviewIndex(safe);
    }, [previewAssets.length, previewCardPageWidth, previewIndex]);
    const handleModalMomentumEnd = useCallback((event: any) => {
        if (!previewAssets.length || previewModalPageWidth <= 1) return;
        const next = Math.round(Number(event?.nativeEvent?.contentOffset?.x ?? 0) / previewModalPageWidth);
        const safe = Math.max(0, Math.min(previewAssets.length - 1, next));
        if (safe !== previewIndex) setPreviewIndex(safe);
    }, [previewAssets.length, previewIndex, previewModalPageWidth]);
    const renderPreviewItem = ({ item }: { item: PreviewAsset }) => {
        const size = getSizeForAsset(item);
        const frame = computeContainFrame(previewCardSize, size);
        const isVideo = isVideoAsset(item);
        return (
            <Pressable
                style={[Styles.previewPage, { width: previewCardPageWidth, height: previewCardPageHeight }]}
                onPress={openPreviewModal}
            >
                <View
                    style={[
                        Styles.previewMediaFrame,
                        {
                            width: frame.width > 0 ? frame.width : '100%',
                            height: frame.height > 0 ? frame.height : '100%',
                        },
                    ]}
                    pointerEvents="none"
                >
                    {isVideo ? (
                        <Video
                            source={{ uri: normalizeLocalUri(item.uri) as any }}
                            style={Styles.previewImage}
                            resizeMode="contain"
                            paused
                            muted
                            repeat={false}
                            controls={false}
                            onError={() => {}}
                            onLoad={(event: any) => {
                                const width = Number(event?.naturalSize?.width ?? 0);
                                const height = Number(event?.naturalSize?.height ?? 0);
                                if (width > 0 && height > 0) {
                                    setPreviewSizeByUri((prev) => ({ ...prev, [item.uri]: { width, height } }));
                                }
                            }}
                        />
                    ) : (
                        <FastImage
                            source={{ uri: normalizeLocalUri(item.uri) as any }}
                            style={Styles.previewImage}
                            resizeMode="contain"
                            onLoad={(event: any) => {
                                const width = Number(event?.nativeEvent?.width ?? 0);
                                const height = Number(event?.nativeEvent?.height ?? 0);
                                if (width > 0 && height > 0) {
                                    setPreviewSizeByUri((prev) => ({ ...prev, [item.uri]: { width, height } }));
                                }
                            }}
                        />
                    )}
                    <View style={Styles.previewWatermarkOverlay} pointerEvents="none">
                        {watermarkRows.map((row) => (
                            <Text key={`wm-row-${item.uri}-${row}`} style={Styles.previewWatermarkRow} numberOfLines={1}>
                                {`${row % 2 === 0 ? '' : '   '}${(`${watermarkLabel}   `).repeat(8)}`}
                            </Text>
                        ))}
                    </View>
                </View>
            </Pressable>
        );
    };
    const renderModalPreviewItem = ({ item }: { item: PreviewAsset }) => {
        const size = getSizeForAsset(item);
        const frame = computeContainFrame(previewModalSize, size);
        const isVideo = isVideoAsset(item);
        return (
            <View style={[Styles.previewModalPage, { width: previewModalPageWidth, height: previewModalPageHeight }]}>
                <View
                    style={[
                        Styles.previewMediaFrame,
                        Styles.previewModalFrame,
                        {
                            width: frame.width > 0 ? frame.width : '100%',
                            height: frame.height > 0 ? frame.height : '100%',
                        },
                    ]}
                >
                    {isVideo ? (
                        <Video
                            source={{ uri: normalizeLocalUri(item.uri) as any }}
                            style={Styles.previewModalImage}
                            resizeMode="contain"
                            paused
                            muted
                            repeat={false}
                            controls={false}
                            onLoad={(event: any) => {
                                const width = Number(event?.naturalSize?.width ?? 0);
                                const height = Number(event?.naturalSize?.height ?? 0);
                                if (width > 0 && height > 0) {
                                    setPreviewSizeByUri((prev) => ({ ...prev, [item.uri]: { width, height } }));
                                }
                            }}
                        />
                    ) : (
                        <FastImage
                            source={{ uri: normalizeLocalUri(item.uri) as any }}
                            style={Styles.previewModalImage}
                            resizeMode="contain"
                            onLoad={(event: any) => {
                                const width = Number(event?.nativeEvent?.width ?? 0);
                                const height = Number(event?.nativeEvent?.height ?? 0);
                                if (width > 0 && height > 0) {
                                    setPreviewSizeByUri((prev) => ({ ...prev, [item.uri]: { width, height } }));
                                }
                            }}
                        />
                    )}
                    <View style={Styles.previewModalWatermarkOverlay} pointerEvents="none">
                        {watermarkRows.map((row) => (
                            <Text key={`wm-modal-row-${item.uri}-${row}`} style={Styles.previewWatermarkRow} numberOfLines={1}>
                                {`${row % 2 === 0 ? '' : '   '}${(`${watermarkLabel}   `).repeat(8)}`}
                            </Text>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Upload')}</Text>
                {anonymous ? (
                    <View style={Styles.headerGhost}>
                        <Ghost size={22} color={colors.primaryColor} variant="Linear" />
                    </View>
                ) : (
                    <View style={Styles.headerSpacer} />
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>{t('Add Watermark')}</Text>
                    <Text style={Styles.sectionSubtitle}>{t('This will appear on every uploaded photo/video.')}</Text>
                </View>

                <SizeBox height={12} />

                <TextInput
                    style={Styles.textInput}
                    placeholder={t('Type your watermark')}
                    placeholderTextColor="#9B9F9F"
                    value={watermarkText}
                    onChangeText={setWatermarkText}
                />

                <SizeBox height={20} />
                <SizeBox height={20} />

                <View style={Styles.previewCard}>
                    <Text style={Styles.previewLabel}>{t('Preview')}</Text>
                    <View
                        style={Styles.previewBox}
                        onLayout={(event) => {
                            const { width, height } = event.nativeEvent.layout;
                            setPreviewCardSize({ width, height });
                        }}
                    >
                        <FlatList
                            ref={previewCardListRef}
                            data={previewAssets}
                            keyExtractor={(item, index) => `${item.uri}-${index}`}
                            renderItem={renderPreviewItem}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            bounces={false}
                            onMomentumScrollEnd={handleCardMomentumEnd}
                            getItemLayout={previewCardPageWidth > 1 ? getPreviewItemLayout : undefined}
                            scrollEnabled={previewAssets.length > 1}
                            removeClippedSubviews={false}
                        />
                    </View>
                    {previewAssets.length > 1 && (
                        <View style={Styles.previewDotsRow}>
                            {previewAssets.map((_, index) => (
                                <View
                                    key={`preview-dot-${index}`}
                                    style={[Styles.previewDot, index === previewIndex && Styles.previewDotActive]}
                                />
                            ))}
                        </View>
                    )}
                </View>

                <SizeBox height={30} />

                <TouchableOpacity style={Styles.previewButton} onPress={handleSave}>
                    <Text style={Styles.previewButtonText}>{t('Next')}</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>
                <SizeBox height={10} />
                <TouchableOpacity style={Styles.skipButton} onPress={handleSkip}>
                    <Text style={Styles.skipButtonText}>{t('Skip')}</Text>
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            <Modal
                visible={previewModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPreviewModalVisible(false)}
            >
                <View style={Styles.previewModalOverlay}>
                    <Pressable style={Styles.previewModalBackdrop} onPress={() => setPreviewModalVisible(false)} />
                    <View
                        style={Styles.previewModalContent}
                        onLayout={(event) => {
                            const { width, height } = event.nativeEvent.layout;
                            setPreviewModalSize({ width, height });
                        }}
                    >
                        <FlatList
                            ref={previewModalListRef}
                            data={previewAssets}
                            keyExtractor={(item, index) => `${item.uri}-${index}`}
                            renderItem={renderModalPreviewItem}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            bounces={false}
                            onMomentumScrollEnd={handleModalMomentumEnd}
                            getItemLayout={previewModalPageWidth > 1 ? getModalItemLayout : undefined}
                            scrollEnabled={previewAssets.length > 1}
                            removeClippedSubviews={false}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default WatermarkScreen;
