import { View, Text, TouchableOpacity } from 'react-native'
import React, { useMemo, useState } from 'react'
import { createStyles } from './UploadDetailsStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../context/ThemeContext'
import { ArrowLeft2, Ghost } from 'iconsax-react-nativejs'
import AsyncStorage from '@react-native-async-storage/async-storage'

const UploadDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [selectedAssets, setSelectedAssets] = useState<any[]>([]);
    const competition = route?.params?.competition;
    const category = route?.params?.category;
    const anonymous = route?.params?.anonymous;

    const handleFilePicker = async () => {
        const options: any = {
            mediaType: 'mixed',
            selectionLimit: 0,
            quality: 1,
        };
        try {
            const result: any = await launchImageLibrary(options);
            if (result.assets) {
                setSelectedAssets(result.assets);
            }
        } catch (error) {
            console.error('Error picking media:', error);
        }
    };

    const handleUpload = async () => {
        if (selectedAssets.length === 0) return;
        const competitionId = String(competition?.id || competition?.event_id || competition?.eventId || 'competition');
        const eventName = String(category?.name || 'Unlabelled');
        const key = `@upload_counts_${competitionId}`;
        try {
            const stored = await AsyncStorage.getItem(key);
            const parsed = stored ? JSON.parse(stored) : {};
            const current = parsed?.[eventName] || { photos: 0, videos: 0 };
            const next = { ...current };
            let addedPhotos = 0;
            let addedVideos = 0;
            selectedAssets.forEach((asset) => {
                const type = String(asset?.type || '').toLowerCase();
                if (type.includes('video')) {
                    next.videos += 1;
                    addedVideos += 1;
                } else {
                    next.photos += 1;
                    addedPhotos += 1;
                }
            });
            parsed[eventName] = next;
            await AsyncStorage.setItem(key, JSON.stringify(parsed));
            const assetsKey = `@upload_assets_${competitionId}`;
            const existingAssetsRaw = await AsyncStorage.getItem(assetsKey);
            const existingAssets = existingAssetsRaw ? JSON.parse(existingAssetsRaw) : {};
            const safeExisting = existingAssets && typeof existingAssets === 'object' ? existingAssets : {};
            const mappedAssets = selectedAssets.map((asset) => ({
                uri: asset?.uri,
                type: asset?.type,
                fileName: asset?.fileName,
                width: asset?.width,
                height: asset?.height,
            })).filter((asset) => asset.uri);
            const previousList = Array.isArray(safeExisting[eventName]) ? safeExisting[eventName] : [];
            safeExisting[eventName] = [...previousList, ...mappedAssets];
            await AsyncStorage.setItem(assetsKey, JSON.stringify(safeExisting));

            await AsyncStorage.setItem(`@upload_session_${competitionId}`, JSON.stringify({
                updatedAt: Date.now(),
                addedPhotos,
                addedVideos,
                eventName,
            }));
        } catch {
            // ignore
        }
        navigation.goBack();
    };

    const selectedCount = selectedAssets.length;
    const buttonLabel = useMemo(() => (selectedCount > 0 ? 'Upload' : 'Select files'), [selectedCount]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Upload</Text>
                {anonymous ? (
                    <View style={Styles.headerGhost}>
                        <Ghost size={22} color={colors.primaryColor} variant="Linear" />
                    </View>
                ) : (
                    <View style={Styles.headerSpacer} />
                )}
            </View>

            <View style={Styles.container}>
                <Text style={Styles.titleText}>Choose files</Text>

                {selectedCount > 0 && (
                    <View style={Styles.selectedImagesContainer}>
                        <Text style={Styles.subText}>
                            Selected {selectedCount} files
                        </Text>
                    </View>
                )}

                <SizeBox height={12} />
                <TouchableOpacity style={Styles.uploadContainer} onPress={handleFilePicker}>
                    <Text style={Styles.uploadText}>Browse files</Text>
                </TouchableOpacity>
                <SizeBox height={20} />

                <TouchableOpacity
                    style={[
                        Styles.btnContianer,
                        { opacity: selectedCount > 0 ? 1 : 0.5 }
                    ]}
                    onPress={handleUpload}
                    disabled={selectedCount === 0}
                >
                    <Text style={Styles.btnText}>{buttonLabel}</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}

export default UploadDetailsScreen
