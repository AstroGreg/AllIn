import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, ArrowRight, Ghost } from 'iconsax-react-nativejs'
import { createStyles } from './UploadSummaryScreenStyles'
import SizeBox from '../../constants/SizeBox'
import { useTheme } from '../../context/ThemeContext'
import Icons from '../../constants/Icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Video from 'react-native-video'
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

function normalizeLocalUri(uri?: string) {
    if (!uri) return uri;
    if (!uri.startsWith('file://')) return uri;
    let path = uri.slice('file://'.length);
    const q = path.indexOf('?');
    if (q !== -1) path = path.slice(0, q);
    try {
        path = decodeURI(path);
    } catch {}
    return `file://${path}`;
}

interface UploadItem {
    id: number;
    thumbnail?: any;
    uri?: string;
    price: string;
    priceInput: string;
    priceCents: number;
    maxPriceCents: number;
    resolution: string;
    type?: string;
}

interface CategorySection {
    name: string;
    items: UploadItem[];
}

const PHOTO_PRICE_CAP_CENTS = 100;
const VIDEO_PRICE_CAP_CENTS = 500;

function isVideoType(type?: string | null) {
    return String(type || '').toLowerCase().includes('video');
}

function priceCapForType(type?: string | null) {
    return isVideoType(type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS;
}

function clampPriceCents(rawValue: string, maxCents: number) {
    const normalized = rawValue.replace(',', '.').replace(/[^\d.]/g, '');
    if (!normalized) return 0;
    const numeric = Number(normalized);
    if (!Number.isFinite(numeric)) return 0;
    const cents = Math.round(Math.max(0, numeric) * 100);
    return Math.min(maxCents, cents);
}

const UploadSummaryScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const competition = route?.params?.competition;
    const account = route?.params?.account;
    const anonymous = route?.params?.anonymous;
    const competitionType = route?.params?.competitionType ?? competition?.competitionType;
    const watermarkText = String(route?.params?.watermarkText ?? route?.params?.watermark_text ?? '').trim();

    const [categories, setCategories] = useState<CategorySection[]>([]);

    const competitionId = useMemo(
        () => String(competition?.id || competition?.event_id || competition?.eventId || 'competition'),
        [competition?.event_id, competition?.eventId, competition?.id],
    );

    const formatResolution = useCallback((item: any) => {
        const width = Number(item?.width || 0);
        const height = Number(item?.height || 0);
        if (width && height) {
            return `${width}×${height}`;
        }
        return 'Original';
    }, []);

    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            const loadAssets = async () => {
                try {
                    const assetsRaw = await AsyncStorage.getItem(`@upload_assets_${competitionId}`);
                    const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
                    if (!mounted) return;
                    if (!parsed || typeof parsed !== 'object') {
                        setCategories([]);
                        return;
                    }
                    const sections: CategorySection[] = Object.entries(parsed).map(([name, items]) => {
                        const list = Array.isArray(items) ? items : [];
                        const mapped: UploadItem[] = list.map((asset: any, index: number) => ({
                            maxPriceCents: priceCapForType(asset?.type),
                            priceCents: Math.min(
                                priceCapForType(asset?.type),
                                Math.max(0, Number(asset?.price_cents ?? (isVideoType(asset?.type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS))),
                            ),
                            id: index + 1,
                            uri: normalizeLocalUri(asset?.uri),
                            thumbnail: asset?.uri ? { uri: normalizeLocalUri(asset.uri) } : undefined,
                            price: `€${(Math.min(
                                priceCapForType(asset?.type),
                                Math.max(0, Number(asset?.price_cents ?? (isVideoType(asset?.type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS))),
                            ) / 100).toFixed(2)}`,
                            priceInput: (Math.min(
                                priceCapForType(asset?.type),
                                Math.max(0, Number(asset?.price_cents ?? (isVideoType(asset?.type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS))),
                            ) / 100).toFixed(2),
                            resolution: formatResolution(asset),
                            type: asset?.type,
                        }));
                        return {
                            name,
                            items: mapped,
                        };
                    });
                    setCategories(sections);
                } catch {
                    if (mounted) setCategories([]);
                }
            };
            loadAssets();
            return () => {
                mounted = false;
            };
        }, [competitionId, formatResolution]),
    );

    useEffect(() => {
        let mounted = true;
        const loadAssets = async () => {
            try {
                const assetsRaw = await AsyncStorage.getItem(`@upload_assets_${competitionId}`);
                const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
                if (!mounted) return;
                if (!parsed || typeof parsed !== 'object') {
                    setCategories([]);
                    return;
                }
                const sections: CategorySection[] = Object.entries(parsed).map(([name, items]) => {
                    const list = Array.isArray(items) ? items : [];
                    const mapped: UploadItem[] = list.map((asset: any, index: number) => ({
                        maxPriceCents: priceCapForType(asset?.type),
                        priceCents: Math.min(
                            priceCapForType(asset?.type),
                            Math.max(0, Number(asset?.price_cents ?? (isVideoType(asset?.type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS))),
                        ),
                        id: index + 1,
                        uri: normalizeLocalUri(asset?.uri),
                        thumbnail: asset?.uri ? { uri: normalizeLocalUri(asset.uri) } : undefined,
                        price: `€${(Math.min(
                            priceCapForType(asset?.type),
                            Math.max(0, Number(asset?.price_cents ?? (isVideoType(asset?.type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS))),
                        ) / 100).toFixed(2)}`,
                        priceInput: (Math.min(
                            priceCapForType(asset?.type),
                            Math.max(0, Number(asset?.price_cents ?? (isVideoType(asset?.type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS))),
                        ) / 100).toFixed(2),
                        resolution: formatResolution(asset),
                        type: asset?.type,
                    }));
                    return {
                        name,
                        items: mapped,
                    };
                });
                setCategories(sections);
            } catch {
                if (mounted) setCategories([]);
            }
        };
        loadAssets();
        return () => {
            mounted = false;
        };
    }, [competitionId, formatResolution]);

    const handleConfirm = () => {
        const sessionId = `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        navigation.navigate('UploadProgressScreen', {
            competition,
            account,
            anonymous,
            competitionType,
            watermarkText,
            sessionId,
            autoStart: true,
        });
    };

    const persistPrice = useCallback(async (categoryName: string, itemIndex: number, cents: number) => {
        try {
            const key = `@upload_assets_${competitionId}`;
            const assetsRaw = await AsyncStorage.getItem(key);
            const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
            const list = Array.isArray(parsed?.[categoryName]) ? [...parsed[categoryName]] : [];
            if (!list[itemIndex]) return;
            list[itemIndex] = {
                ...list[itemIndex],
                price_cents: cents,
                price_currency: 'EUR',
            };
            parsed[categoryName] = list;
            await AsyncStorage.setItem(key, JSON.stringify(parsed));
        } catch {
            // ignore
        }
    }, [competitionId]);

    const handlePriceInputChange = useCallback((categoryName: string, itemId: number, value: string) => {
        setCategories((prev) =>
            prev.map((section) => {
                if (section.name !== categoryName) return section;
                return {
                    ...section,
                    items: section.items.map((item) => {
                        if (item.id !== itemId) return item;
                        const cents = clampPriceCents(value, item.maxPriceCents);
                        return {
                            ...item,
                            priceInput: value,
                            priceCents: cents,
                            price: `€${(cents / 100).toFixed(2)}`,
                        };
                    }),
                };
            }),
        );
    }, []);

    const handlePriceInputBlur = useCallback((categoryName: string, itemId: number) => {
        const section = categories.find((s) => s.name === categoryName);
        const idx = section?.items.findIndex((it) => it.id === itemId) ?? -1;
        const current = idx >= 0 && section ? section.items[idx] : null;
        if (!current || idx < 0) return;
        const cents = clampPriceCents(current.priceInput, current.maxPriceCents);
        setCategories((prev) =>
            prev.map((section) => {
                if (section.name !== categoryName) return section;
                const nextItems = section.items.map((item, idx) => {
                    if (item.id !== itemId) return item;
                    return {
                        ...item,
                        priceCents: cents,
                        price: `€${(cents / 100).toFixed(2)}`,
                        priceInput: (cents / 100).toFixed(2),
                    };
                });
                return { ...section, items: nextItems };
            }),
        );
        persistPrice(categoryName, idx, cents);
    }, [categories, persistPrice]);

    const renderUploadItem = (item: UploadItem, categoryName: string) => {
        const isVideo = String(item.type || '').toLowerCase().includes('video');
        return (
        <View key={item.id} style={Styles.uploadItem}>
            <View style={Styles.thumbnailContainer}>
                {isVideo && item.uri ? (
                    <Video
                        source={{ uri: item.uri }}
                        style={Styles.thumbnail}
                        resizeMode="cover"
                        paused
                        muted
                        repeat={false}
                        controls={false}
                        onError={() => {}}
                    />
                ) : item.thumbnail ? (
                    <FastImage source={item.thumbnail} style={Styles.thumbnail} resizeMode="cover" />
                ) : (
                    <View style={Styles.thumbnailPlaceholder} />
                )}
                {isVideo && (
                    <View style={Styles.playButton}>
                        <Icons.PlayCricle width={22} height={22} />
                    </View>
                )}
            </View>
            <View style={Styles.itemInfo}>
                <View style={Styles.priceInputRow}>
                    <Text style={Styles.priceEuro}>€</Text>
                    <TextInput
                        style={Styles.priceInput}
                        value={item.priceInput}
                        keyboardType="decimal-pad"
                        onChangeText={(value) => handlePriceInputChange(categoryName, item.id, value)}
                        onBlur={() => handlePriceInputBlur(categoryName, item.id)}
                    />
                </View>
                <Text style={Styles.resolutionText}>
                    {item.resolution} · max €{(item.maxPriceCents / 100).toFixed(2)}
                </Text>
            </View>
        </View>
        );
    };

    const renderCategory = (category: CategorySection, index: number) => (
        <View key={index} style={Styles.categorySection}>
            <Text style={Styles.categoryTitle}>{category.name}</Text>
            <SizeBox height={16} />
            <View style={Styles.itemsRow}>
                {category.items.map((item) => renderUploadItem(item, category.name))}
            </View>
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Upload Summary')}</Text>
                {anonymous ? (
                    <View style={Styles.headerGhost}>
                        <Ghost size={22} color={colors.primaryColor} variant="Linear" />
                    </View>
                ) : (
                    <View style={Styles.headerSpacer} />
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {categories.length === 0 && (
                    <View style={Styles.emptyState}>
                        <Text style={Styles.emptyStateText}>{t('No uploads yet.')}</Text>
                    </View>
                )}
                {categories.map(renderCategory)}

                <SizeBox height={30} />

                {/* Confirm Button */}
                <TouchableOpacity style={Styles.confirmButton} onPress={handleConfirm}>
                    <Text style={Styles.confirmButtonText}>{t('Start upload')}</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default UploadSummaryScreen;
