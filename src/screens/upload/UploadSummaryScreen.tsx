import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, ArrowRight, Ghost } from 'iconsax-react-nativejs'
import { createStyles } from './UploadSummaryScreenStyles'
import SizeBox from '../../constants/SizeBox'
import { useTheme } from '../../context/ThemeContext'
import Icons from '../../constants/Icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface UploadItem {
    id: number;
    thumbnail?: any;
    uri?: string;
    price: string;
    resolution: string;
    type?: string;
}

interface CategorySection {
    name: string;
    items: UploadItem[];
}

const UploadSummaryScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const competition = route?.params?.competition;
    const account = route?.params?.account;
    const anonymous = route?.params?.anonymous;
    const competitionType = route?.params?.competitionType ?? competition?.competitionType;

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
                const sections: CategorySection[] = Object.entries(parsed).map(([name, items], idx) => {
                    const list = Array.isArray(items) ? items : [];
                    const mapped: UploadItem[] = list.map((asset: any, index: number) => ({
                        id: index + 1,
                        uri: asset?.uri,
                        thumbnail: asset?.uri ? { uri: asset.uri } : undefined,
                        price: '€0,10',
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
        navigation.navigate('WatermarkScreen', {
            competition,
            account,
            anonymous,
            competitionType,
        });
    };

    const renderUploadItem = (item: UploadItem) => {
        const isVideo = String(item.type || '').toLowerCase().includes('video');
        return (
        <View key={item.id} style={Styles.uploadItem}>
            <View style={Styles.thumbnailContainer}>
                {item.thumbnail ? (
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
                <Text style={Styles.priceText}>{item.price}</Text>
                <Text style={Styles.resolutionText}>{item.resolution}</Text>
            </View>
        </View>
        );
    };

    const renderCategory = (category: CategorySection, index: number) => (
        <View key={index} style={Styles.categorySection}>
            <Text style={Styles.categoryTitle}>{category.name}</Text>
            <SizeBox height={16} />
            <View style={Styles.itemsRow}>
                {category.items.map(renderUploadItem)}
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
                <Text style={Styles.headerTitle}>Upload Summary</Text>
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
                        <Text style={Styles.emptyStateText}>No uploads yet.</Text>
                    </View>
                )}
                {categories.map(renderCategory)}

                <SizeBox height={30} />

                {/* Confirm Button */}
                <TouchableOpacity style={Styles.confirmButton} onPress={handleConfirm}>
                    <Text style={Styles.confirmButtonText}>Set watermark</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default UploadSummaryScreen;
