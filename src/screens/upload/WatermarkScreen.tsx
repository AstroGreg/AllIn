import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft2, ArrowRight, Ghost } from 'iconsax-react-nativejs'
import { createStyles } from './WatermarkScreenStyles'
import SizeBox from '../../constants/SizeBox'
import { useTheme } from '../../context/ThemeContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FastImage from 'react-native-fast-image'

const WatermarkScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const competition = route?.params?.competition;
    const account = route?.params?.account;
    const anonymous = route?.params?.anonymous;
    const competitionType = route?.params?.competitionType ?? competition?.competitionType;

    const [watermarkText, setWatermarkText] = useState('');
    const [useNoWatermark, setUseNoWatermark] = useState(false);
    const [previewUri, setPreviewUri] = useState<string | null>(null);

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
                if (mounted) setPreviewUri(first?.uri ?? null);
            } catch {
                if (mounted) setPreviewUri(null);
            }
        };
        loadPreview();
        return () => {
            mounted = false;
        };
    }, [competitionId]);

    const handleSave = () => {
        navigation.navigate('CongratulationsScreen', {
            competition,
            account,
            anonymous,
            competitionType,
            watermarkText: useNoWatermark ? '' : watermarkText,
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
                <Text style={Styles.headerTitle}>Watermark</Text>
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
                    <Text style={Styles.sectionTitle}>Text watermark</Text>
                    <Text style={Styles.sectionSubtitle}>This will appear on every uploaded photo/video.</Text>
                </View>

                <SizeBox height={12} />

                <TextInput
                    style={Styles.textInput}
                    placeholder="Type your watermark"
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
                        {useNoWatermark && <Text style={Styles.noWatermarkCheckMark}>✓</Text>}
                    </View>
                    <Text style={Styles.noWatermarkText}>Do not use a watermark</Text>
                </TouchableOpacity>

                <SizeBox height={20} />

                <View style={Styles.previewCard}>
                    <Text style={Styles.previewLabel}>Preview</Text>
                    <View style={Styles.previewBox}>
                        {previewUri ? (
                            <FastImage source={{ uri: previewUri }} style={Styles.previewImage} resizeMode="cover" />
                        ) : null}
                        {!useNoWatermark && (
                            <Text style={Styles.previewText}>
                                {watermarkText ? watermarkText : 'Your watermark'}
                            </Text>
                        )}
                    </View>
                </View>

                <SizeBox height={30} />

                <TouchableOpacity style={Styles.previewButton} onPress={handleSave}>
                    <Text style={Styles.previewButtonText}>Set watermark</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default WatermarkScreen;
