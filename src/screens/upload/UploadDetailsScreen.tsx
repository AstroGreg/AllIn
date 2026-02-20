import { View, Text, TouchableOpacity } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { createStyles } from './UploadDetailsStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../context/ThemeContext'
import { ArrowLeft2, Ghost } from 'iconsax-react-nativejs'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RNFS from 'react-native-fs';

function fileUriToPath(uri: string) {
    if (!uri || !uri.startsWith('file://')) return uri;
    let path = uri.slice('file://'.length);
    const q = path.indexOf('?');
    if (q !== -1) path = path.slice(0, q);
    try {
        path = decodeURI(path);
    } catch {}
    return path;
}

function ensureFileScheme(pathOrUri: string) {
    if (!pathOrUri) return pathOrUri;
    if (pathOrUri.startsWith('file://')) return pathOrUri;
    return `file://${pathOrUri}`;
}

function normalizeFileUri(uri: string) {
    if (!uri) return uri;
    if (!uri.startsWith('file://')) return uri;
    return ensureFileScheme(fileUriToPath(uri));
}

const UploadDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const [selectedAssets, setSelectedAssets] = useState<any[]>([]);
    const competition = route?.params?.competition;
    const category = route?.params?.category;
    const account = route?.params?.account;
    const anonymous = route?.params?.anonymous;
    const competitionType = route?.params?.competitionType ?? competition?.competitionType;

    const handleFilePicker = async () => {
        const options: any = {
            mediaType: 'mixed',
            selectionLimit: 0,
            quality: 1,
        };
        try {
            const result: any = await launchImageLibrary(options);
            if (result.assets) {
                // Copy to a persistent app directory immediately so the temp picker path
                // doesn't disappear before we upload (common on iOS for /tmp files).
                const destDir = `${RNFS.DocumentDirectoryPath}/allin_uploads`;
                try { await RNFS.mkdir(destDir); } catch {}

                const copied: any[] = [];
                for (let i = 0; i < result.assets.length; i += 1) {
                    const a = result.assets[i];
                    const uri = normalizeFileUri(String(a?.uri || ''));
                    if (!uri) continue;

                    const fileName = String(a?.fileName || `upload-${Date.now()}-${i}`);
                    const safeName = fileName.replace(/[^\w.\-]+/g, '_');
                    const destPath = `${destDir}/${Date.now()}-${i}-${safeName}`;

                    // Only copy file:// uris; keep other schemes as-is (android content:// etc).
                    let finalUri = uri;
                    try {
                        if (uri.startsWith('file://')) {
                            await RNFS.copyFile(fileUriToPath(uri), destPath);
                            finalUri = ensureFileScheme(destPath);
                        }
                    } catch {
                        // Keep original URI if copy fails.
                        finalUri = normalizeFileUri(uri);
                    }

                    copied.push({
                        ...a,
                        uri: finalUri,
                        fileName: safeName,
                    });
                }

                setSelectedAssets(copied);
            }
        } catch (error) {
            console.error('Error picking media:', error);
        }
    };

    const handleUpload = async () => {
        if (selectedAssets.length === 0) return;
        const competitionId = String(competition?.id || competition?.event_id || competition?.eventId || 'competition');
        const eventName = String(category?.name || 'Unlabelled');
        try {
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
            // Overwrite the category selection instead of appending forever (keeps the UI clean).
            safeExisting[eventName] = mappedAssets;
            await AsyncStorage.setItem(assetsKey, JSON.stringify(safeExisting));
        } catch {
            // ignore
        }
        navigation.navigate('WatermarkScreen', {
            competition,
            account,
            anonymous,
            competitionType,
        });
    };

    const selectedCount = selectedAssets.length;
    const buttonLabel = useMemo(() => (selectedCount > 0 ? t('Upload') : t('Select files')), [selectedCount, t]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
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

            <View style={Styles.container}>
                <Text style={Styles.titleText}>{t('Choose files')}</Text>

                {selectedCount > 0 && (
                    <View style={Styles.selectedImagesContainer}>
                        <Text style={Styles.subText}>
                            {t('Selected')} {selectedCount} {t('files')}
                        </Text>
                    </View>
                )}

                <SizeBox height={12} />
                <TouchableOpacity style={Styles.uploadContainer} onPress={handleFilePicker}>
                    <Text style={Styles.uploadText}>{t('Browse files')}</Text>
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
