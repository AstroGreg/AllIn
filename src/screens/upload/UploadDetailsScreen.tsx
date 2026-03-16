import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, InteractionManager } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { createStyles } from './UploadDetailsStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../context/ThemeContext'
import { ArrowLeft2, Ghost } from 'iconsax-react-nativejs'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RNFS from 'react-native-fs';
import { useFocusEffect } from '@react-navigation/native';
import { formatUploadDisplayName, normalizeUploadFileName } from '../../utils/uploadPresentation';

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

function isVideoAssetType(type?: string | null) {
    return String(type || '').toLowerCase().includes('video');
}

function defaultPriceCentsForType(type?: string | null) {
    return isVideoAssetType(type) ? 500 : 100;
}

function deriveVideoTitleFromFileName(fileName?: string | null) {
    return normalizeUploadFileName(fileName);
}

const UploadDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const [selectedAssets, setSelectedAssets] = useState<any[]>([]);
    const [isPreparingAssets, setIsPreparingAssets] = useState(false);
    const [preparingAssetIndex, setPreparingAssetIndex] = useState(0);
    const [preparingAssetTotal, setPreparingAssetTotal] = useState(0);
    const [preparingAssetName, setPreparingAssetName] = useState('');
    const [allPhotosPrice, setAllPhotosPrice] = useState('1.00');
    const [allVideosPrice, setAllVideosPrice] = useState('5.00');
    const competition = route?.params?.competition;
    const category = route?.params?.category;
    const account = route?.params?.account;
    const anonymous = route?.params?.anonymous;
    const competitionType = route?.params?.competitionType ?? competition?.competitionType;
    const selectedCategoryLabels = Array.isArray(route?.params?.category_labels)
        ? route.params.category_labels.map((value: unknown) => String(value)).filter(Boolean)
        : Array.isArray(category?.category_labels)
            ? category.category_labels.map((value: unknown) => String(value)).filter(Boolean)
            : [];
    const selectedCompetitionMapId = String(
        route?.params?.competition_map_id ??
        category?.competition_map_id ??
        '',
    ).trim() || null;
    const selectedDisciplineId = String(
        route?.params?.discipline_id ??
        category?.id ??
        category?.discipline_id ??
        '',
    ).trim() || null;
    const selectedCheckpointId = String(
        route?.params?.checkpoint_id ??
        category?.checkpoint_id ??
        '',
    ).trim() || null;
    const selectedCheckpointLabel = String(
        route?.params?.checkpoint_label ??
        category?.checkpoint_label ??
        '',
    ).trim() || null;
    const e2eFixtureFiles = useMemo(
        () => Array.isArray(route?.params?.e2eFixtureFiles) ? route.params.e2eFixtureFiles : [],
        [route?.params?.e2eFixtureFiles],
    );
    const competitionId = String(competition?.id || competition?.event_id || competition?.eventId || 'competition');
    const eventName = String(category?.name || 'Unlabelled');

    useEffect(() => {
        if (!Array.isArray(e2eFixtureFiles) || e2eFixtureFiles.length === 0) return;
        const mapped = e2eFixtureFiles
            .map((entry: any, index: number) => {
                const uri = normalizeFileUri(String(entry?.uri || ''));
                if (!uri) return null;
                const type = String(entry?.type || '').trim() || undefined;
                const fileName = String(entry?.fileName || entry?.name || `e2e-upload-${index + 1}`).trim() || `e2e-upload-${index + 1}`;
                return {
                    uri,
                    type,
                    fileName,
                    title: isVideoAssetType(type) ? deriveVideoTitleFromFileName(fileName) : '',
                    width: Number(entry?.width || 0) || undefined,
                    height: Number(entry?.height || 0) || undefined,
                    price_cents: defaultPriceCentsForType(type),
                    price_currency: 'EUR',
                };
            })
            .filter(Boolean) as any[];
        if (mapped.length > 0) {
            setSelectedAssets(mapped);
        }
    }, [e2eFixtureFiles]);

    useFocusEffect(
        React.useCallback(() => {
            let mounted = true;
            const loadSavedAssets = async () => {
                try {
                    const assetsRaw = await AsyncStorage.getItem(`@upload_assets_${competitionId}`);
                    const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
                    const saved = Array.isArray(parsed?.[eventName]) ? parsed[eventName] : null;
                    if (!mounted || !saved || saved.length === 0) return;
                    setSelectedAssets(saved.map((asset: any) => ({
                        ...asset,
                        uri: normalizeFileUri(String(asset?.uri || '')),
                        title: isVideoAssetType(asset?.type) ? String(asset?.title || '').trim() : '',
                        price_cents: Number(asset?.price_cents ?? defaultPriceCentsForType(asset?.type)),
                        price_currency: String(asset?.price_currency || 'EUR'),
                    })));
                } catch {
                    // ignore
                }
            };
            loadSavedAssets();
            return () => {
                mounted = false;
            };
        }, [competitionId, eventName]),
    );

    const handleFilePicker = async () => {
        const options: any = {
            mediaType: 'mixed',
            selectionLimit: 20,
            quality: 1,
            presentationStyle: 'fullScreen',
            assetRepresentationMode: 'current',
        };
        try {
            const result: any = await launchImageLibrary(options);
            if (result.assets) {
                setIsPreparingAssets(true);
                setPreparingAssetIndex(0);
                setPreparingAssetTotal(result.assets.length);
                await new Promise<void>((resolve) => {
                    requestAnimationFrame(() => resolve());
                });
                // Copy to a persistent app directory immediately so the temp picker path
                // doesn't disappear before we upload (common on iOS for /tmp files).
                const destDir = `${RNFS.DocumentDirectoryPath}/allin_uploads`;
                try { await RNFS.mkdir(destDir); } catch {}

                const copied: any[] = [];
                for (let i = 0; i < result.assets.length; i += 1) {
                    setPreparingAssetIndex(i + 1);
                    const a = result.assets[i];
                    const uri = normalizeFileUri(String(a?.uri || ''));
                    if (!uri) continue;

                    const fileName = String(a?.fileName || `upload-${Date.now()}-${i}`);
                    setPreparingAssetName(formatUploadDisplayName({
                        fileName,
                        title: isVideoAssetType(a?.type) ? deriveVideoTitleFromFileName(fileName) : '',
                        type: a?.type,
                        fallbackIndex: i + 1,
                    }));
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
                        title: isVideoAssetType(a?.type) ? deriveVideoTitleFromFileName(safeName) : '',
                        price_cents: defaultPriceCentsForType(a?.type),
                        price_currency: 'EUR',
                    });
                }

                setSelectedAssets(copied);
                await new Promise<void>((resolve) => {
                    requestAnimationFrame(() => resolve());
                });
                await new Promise<void>((resolve) => {
                    InteractionManager.runAfterInteractions(() => resolve());
                });
            }
        } catch (error) {
            console.error('Error picking media:', error);
        } finally {
            setIsPreparingAssets(false);
            setPreparingAssetIndex(0);
            setPreparingAssetTotal(0);
            setPreparingAssetName('');
        }
    };

    const parseEuroToCents = (value: string, maxCents: number) => {
        const normalized = String(value || '').replace(',', '.').trim();
        const parsed = Number.parseFloat(normalized);
        if (!Number.isFinite(parsed) || parsed < 0) return 0;
        return Math.min(Math.round(parsed * 100), maxCents);
    };

    const applyPriceToType = (type: 'photo' | 'video') => {
        setSelectedAssets((prev) =>
            prev.map((asset) => {
                const isVideo = isVideoAssetType(asset?.type);
                if ((type === 'video') !== isVideo) return asset;
                const cents = type === 'video'
                    ? parseEuroToCents(allVideosPrice, 500)
                    : parseEuroToCents(allPhotosPrice, 100);
                return {
                    ...asset,
                    price_cents: cents,
                    price_currency: 'EUR',
                };
            }),
        );
    };

    const handleUpload = async () => {
        if (selectedAssets.length === 0) return;
        try {
            const assetsKey = `@upload_assets_${competitionId}`;
            const existingAssetsRaw = await AsyncStorage.getItem(assetsKey);
            const existingAssets = existingAssetsRaw ? JSON.parse(existingAssetsRaw) : {};
            const safeExisting = existingAssets && typeof existingAssets === 'object' ? existingAssets : {};
            const mappedAssets = selectedAssets.map((asset) => ({
                uri: asset?.uri,
                type: asset?.type,
                fileName: asset?.fileName,
                title: isVideoAssetType(asset?.type) ? String(asset?.title || '').trim() : '',
                width: asset?.width,
                height: asset?.height,
                price_cents: Number(asset?.price_cents ?? defaultPriceCentsForType(asset?.type)),
                price_currency: String(asset?.price_currency || 'EUR'),
                discipline_id: selectedDisciplineId,
                category_labels: selectedCategoryLabels,
                competition_map_id: selectedCompetitionMapId,
                checkpoint_id: selectedCheckpointId,
                checkpoint_label: selectedCheckpointLabel,
            })).filter((asset) => asset.uri);
            // Overwrite the category selection instead of appending forever (keeps the UI clean).
            safeExisting[eventName] = mappedAssets;
            await AsyncStorage.setItem(assetsKey, JSON.stringify(safeExisting));
        } catch {
            // ignore
        }
        navigation.navigate('UploadSummaryScreen', {
            competition,
            account,
            anonymous,
            competitionType,
            watermarkText: 'SpotMe',
        });
    };

    const selectedCount = selectedAssets.length;
    const buttonLabel = useMemo(() => (selectedCount > 0 ? t('Next') : t('Select files')), [selectedCount, t]);

    return (
        <View style={Styles.mainContainer} testID="upload-details-screen">
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
                    <View style={Styles.selectedImagesContainer} testID="upload-selected-assets-ready">
                        <Text style={Styles.subText}>
                            {t('Selected')} {selectedCount} {t('files')}
                        </Text>
                    </View>
                )}

                <SizeBox height={12} />
                <TouchableOpacity
                    style={[Styles.uploadContainer, isPreparingAssets && Styles.uploadContainerDisabled]}
                    onPress={handleFilePicker}
                    disabled={isPreparingAssets}
                    testID="upload-browse-files-button"
                >
                    <Text style={Styles.uploadText}>{t('Browse files')}</Text>
                </TouchableOpacity>
                {selectedCount > 0 ? (
                    <>
                        <SizeBox height={14} />
                        <View style={Styles.bulkPriceCard}>
                            <Text style={Styles.bulkPriceTitle}>{t('Bulk price')}</Text>
                            <View style={Styles.bulkPriceRow}>
                                <TextInput
                                    style={Styles.bulkPriceInput}
                                    value={allPhotosPrice}
                                    onChangeText={setAllPhotosPrice}
                                    keyboardType="decimal-pad"
                                    placeholder="1.00"
                                    placeholderTextColor={colors.grayColor}
                                />
                                <TouchableOpacity style={Styles.bulkPriceButton} onPress={() => applyPriceToType('photo')}>
                                    <Text style={Styles.bulkPriceButtonText}>{t('Set all photos')}</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={Styles.bulkPriceHint}>{t('Max €1.00 per photo')}</Text>
                            <View style={Styles.bulkPriceRow}>
                                <TextInput
                                    style={Styles.bulkPriceInput}
                                    value={allVideosPrice}
                                    onChangeText={setAllVideosPrice}
                                    keyboardType="decimal-pad"
                                    placeholder="5.00"
                                    placeholderTextColor={colors.grayColor}
                                />
                                <TouchableOpacity style={Styles.bulkPriceButton} onPress={() => applyPriceToType('video')}>
                                    <Text style={Styles.bulkPriceButtonText}>{t('Set all videos')}</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={Styles.bulkPriceHint}>{t('Max €5.00 per video')}</Text>
                        </View>
                    </>
                ) : null}
                <SizeBox height={20} />

                <TouchableOpacity
                    style={[
                        Styles.btnContianer,
                        { opacity: selectedCount > 0 && !isPreparingAssets ? 1 : 0.5 }
                    ]}
                    onPress={handleUpload}
                    disabled={selectedCount === 0 || isPreparingAssets}
                    testID="upload-details-next-button"
                >
                    <Text style={Styles.btnText}>{buttonLabel}</Text>
                </TouchableOpacity>
            </View>

            {isPreparingAssets ? (
                <View style={Styles.preparingOverlay} testID="upload-preparing-overlay">
                    <View style={Styles.preparingCard}>
                        <ActivityIndicator size="large" color={colors.primaryColor} />
                        <SizeBox height={14} />
                        <Text style={Styles.preparingTitle} testID="upload-preparing-title">{t('Preparing files')}</Text>
                        <SizeBox height={6} />
                        <Text style={Styles.preparingText} testID="upload-preparing-count">
                            {preparingAssetTotal > 0
                                ? `${preparingAssetIndex}/${preparingAssetTotal} ${t('files')}`
                                : t('Preparing selected media...')}
                        </Text>
                        {preparingAssetName ? (
                            <>
                                <SizeBox height={6} />
                                <Text style={Styles.preparingText} numberOfLines={2} testID="upload-preparing-name">
                                    {t('Copying from local storage')}: {preparingAssetName}
                                </Text>
                            </>
                        ) : null}
                    </View>
                </View>
            ) : null}

        </View>
    )
}

export default UploadDetailsScreen
