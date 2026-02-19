import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Pressable } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
    const [useNoWatermark, setUseNoWatermark] = useState(false);
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const watermarkLabel = (watermarkText || DEFAULT_WATERMARK_TEXT).trim();
    const watermarkRows = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);
    const isVideoPreview = useMemo(() => {
        const uri = String(previewUri || '').toLowerCase();
        return uri.includes('.mp4') || uri.includes('video');
    }, [previewUri]);

    const competitionId = useMemo(
        () => String(competition?.id || competition?.event_id || competition?.eventId || 'competition'),
        [competition?.event_id, competition?.eventId, competition?.id],
    );

    useEffect(() => {
        let mounted = true;
        const loadPreview = async () => {
            try {
                const assetsRaw = await AsyncStorage.getItem(`@upload_assets_${competitionId}`);
                const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
                if (!parsed || typeof parsed !== 'object') {
                    if (mounted) setPreviewUri(null);
                    return;
                }
                const allAssets = Object.values(parsed).flatMap((list: any) => (Array.isArray(list) ? list : []));
                const first = allAssets.find((asset: any) => asset?.uri) || null;
                if (mounted) setPreviewUri(normalizeLocalUri(first?.uri ?? null) as any);
            } catch {
                if (mounted) setPreviewUri(null);
            }
        };
        loadPreview();
        return () => {
            mounted = false;
        };
    }, [competitionId]);

    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            const loadPreviewOnFocus = async () => {
                try {
                    const assetsRaw = await AsyncStorage.getItem(`@upload_assets_${competitionId}`);
                    const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
                    if (!parsed || typeof parsed !== 'object') {
                        if (mounted) {
                            setPreviewUri(null);
                            setWatermarkText(DEFAULT_WATERMARK_TEXT);
                            setUseNoWatermark(false);
                        }
                        return;
                    }
                    const allAssets = Object.values(parsed).flatMap((list: any) => (Array.isArray(list) ? list : []));
                    const first = allAssets.find((asset: any) => asset?.uri) || null;
                    if (mounted) {
                        setPreviewUri(normalizeLocalUri(first?.uri ?? null) as any);
                        if (!first) {
                            setWatermarkText(DEFAULT_WATERMARK_TEXT);
                            setUseNoWatermark(false);
                        }
                    }
                } catch {
                    if (mounted) {
                        setPreviewUri(null);
                        setWatermarkText(DEFAULT_WATERMARK_TEXT);
                        setUseNoWatermark(false);
                    }
                }
            };
            loadPreviewOnFocus();
            return () => {
                mounted = false;
            };
        }, [competitionId]),
    );

    const handleSave = () => {
        const sessionId = `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        navigation.navigate('UploadProgressScreen', {
            competition,
            account,
            anonymous,
            competitionType,
            watermarkText: useNoWatermark ? '' : (watermarkText.trim() || DEFAULT_WATERMARK_TEXT),
            sessionId,
            autoStart: true,
        });
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Watermark')}</Text>
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
                    <Text style={Styles.sectionTitle}>{t('Text watermark')}</Text>
                    <Text style={Styles.sectionSubtitle}>{t('This will appear on every uploaded photo/video.')}</Text>
                </View>

                <SizeBox height={12} />

                <TextInput
                    style={Styles.textInput}
                    placeholder={t('Type your watermark')}
                    placeholderTextColor="#9B9F9F"
                    value={watermarkText}
                    onChangeText={setWatermarkText}
                    editable={!useNoWatermark}
                />

                <SizeBox height={20} />

                <TouchableOpacity
                    style={Styles.noWatermarkRow}
                    onPress={() => setUseNoWatermark((prev) => !prev)}
                >
                    <View style={[Styles.noWatermarkCheck, useNoWatermark && Styles.noWatermarkCheckActive]}>
                        {useNoWatermark && <Text style={Styles.noWatermarkCheckMark}>{t('✓')}</Text>}
                    </View>
                    <Text style={Styles.noWatermarkText}>{t('Do not use a watermark')}</Text>
                </TouchableOpacity>

                <SizeBox height={20} />

                <View style={Styles.previewCard}>
                    <Text style={Styles.previewLabel}>{t('Preview')}</Text>
                    <TouchableOpacity
                        style={Styles.previewBox}
                        activeOpacity={0.9}
                        disabled={!previewUri}
                        onPress={() => setPreviewModalVisible(true)}
                    >
                        {previewUri ? (
                            String(previewUri).toLowerCase().includes('.mp4') || String(previewUri).toLowerCase().includes('video')
                                ? (
                                    <Video
                                        source={{ uri: normalizeLocalUri(previewUri) as any }}
                                        style={Styles.previewImage}
                                        resizeMode="cover"
                                        paused
                                        muted
                                        repeat={false}
                                        controls={false}
                                        onError={() => {}}
                                    />
                                )
                                : (
                                    <FastImage source={{ uri: normalizeLocalUri(previewUri) as any }} style={Styles.previewImage} resizeMode="cover" />
                                )
                        ) : null}
                        {!useNoWatermark && (
                            <View style={Styles.previewWatermarkOverlay} pointerEvents="none">
                                {watermarkRows.map((row) => (
                                    <Text key={`wm-row-${row}`} style={Styles.previewWatermarkRow} numberOfLines={1}>
                                        {`${row % 2 === 0 ? '' : '   '}${(`${watermarkLabel}   `).repeat(8)}`}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <SizeBox height={30} />

                <TouchableOpacity style={Styles.previewButton} onPress={handleSave}>
                    <Text style={Styles.previewButtonText}>{t('Start upload')}</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
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
                    <View style={Styles.previewModalContent}>
                        {previewUri ? (
                            isVideoPreview ? (
                                <Video
                                    source={{ uri: normalizeLocalUri(previewUri) as any }}
                                    style={Styles.previewModalImage}
                                    resizeMode="contain"
                                    paused
                                    muted
                                    repeat={false}
                                    controls={false}
                                />
                            ) : (
                                <FastImage
                                    source={{ uri: normalizeLocalUri(previewUri) as any }}
                                    style={Styles.previewModalImage}
                                    resizeMode="contain"
                                />
                            )
                        ) : null}
                        {!useNoWatermark && (
                            <View style={Styles.previewWatermarkOverlay} pointerEvents="none">
                                {watermarkRows.map((row) => (
                                    <Text key={`wm-modal-row-${row}`} style={Styles.previewWatermarkRow} numberOfLines={1}>
                                        {`${row % 2 === 0 ? '' : '   '}${(`${watermarkLabel}   `).repeat(8)}`}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        style={Styles.previewModalCloseButton}
                        activeOpacity={0.85}
                        onPress={() => setPreviewModalVisible(false)}
                    >
                        <Text style={Styles.previewModalCloseText}>{t('Close')}</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default WatermarkScreen;
