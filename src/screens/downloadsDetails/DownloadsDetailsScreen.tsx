import React, {useCallback, useState} from 'react';
import {ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View} from 'react-native';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';
import {useTheme} from '../../context/ThemeContext';
import {useAuth} from '../../context/AuthContext';
import {useEvents} from '../../context/EventsContext';
import {ApiError, getDownloads, type DownloadItem} from '../../services/apiGateway';
import {createStyles} from './DownloadsDetailsStyles';
import {useFocusEffect} from '@react-navigation/native';

const DownloadsDetailsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const {colors} = useTheme();
    const Styles = createStyles(colors);
    const {apiAccessToken} = useAuth();
    const {eventNameById} = useEvents();

    const [downloads, setDownloads] = useState<DownloadItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);

    const loadDownloads = useCallback(async () => {
        if (!apiAccessToken) {
            setDownloads([]);
            setErrorText('Log in (or set a Dev API token) to view downloads.');
            return;
        }

        setIsLoading(true);
        setErrorText(null);
        try {
            const data = await getDownloads(apiAccessToken, {limit: 200});
            setDownloads(Array.isArray(data) ? data : []);
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(msg);
        } finally {
            setIsLoading(false);
        }
    }, [apiAccessToken]);

    useFocusEffect(
        useCallback(() => {
            loadDownloads();
        }, [loadDownloads]),
    );

    const renderItem = useCallback(({item}: {item: DownloadItem}) => {
        const media = item.media;
        const thumb = media.thumbnail_url || media.preview_url || media.original_url || null;

        return (
            <View style={Styles.card}>
                {thumb ? (
                    <FastImage source={{uri: String(thumb)}} style={Styles.cardImage} resizeMode="cover" />
                ) : (
                    <View style={[Styles.cardImage, {backgroundColor: colors.btnBackgroundColor}]} />
                )}

                <View style={Styles.cardMetaRow}>
                    <Text style={Styles.cardMetaText}>
                        {media.type === 'video' ? 'Video' : 'Photo'} • {String(item.download.last_downloaded_at).slice(0, 10)}
                    </Text>
                    <TouchableOpacity
                        style={Styles.viewButton}
                        onPress={() => {
                            navigation.navigate('PhotoDetailScreen', {
                                    eventTitle: eventNameById(media.event_id),
                                    media: {
                                        id: media.media_id,
                                        eventId: media.event_id,
                                        thumbnailUrl: media.thumbnail_url,
                                        previewUrl: media.preview_url,
                                        originalUrl: media.original_url,
                                        fullUrl: media.full_url,
                                        rawUrl: media.raw_url,
                                        hlsManifestPath: media.hls_manifest_path,
                                        type: media.type,
                                    },
                                });
                            }}
                    >
                        <Text style={Styles.viewButtonText}>View</Text>
                        <ArrowRight size={14} color="#FFFFFF" variant="Linear" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }, [Styles.card, Styles.cardImage, Styles.cardMetaRow, Styles.cardMetaText, Styles.viewButton, Styles.viewButtonText, colors.btnBackgroundColor, eventNameById, navigation]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Downloads</Text>
                <View style={{width: 44, height: 44}} />
            </View>

            <FlatList
                data={downloads}
                keyExtractor={(item) => String(item.download.download_id)}
                numColumns={2}
                columnWrapperStyle={Styles.gridRow}
                contentContainerStyle={[Styles.listContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}]}
                ListHeaderComponent={<Text style={Styles.sectionTitle}>Downloads</Text>}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={{paddingTop: 8}}>
                            <ActivityIndicator color={colors.primaryColor} />
                        </View>
                    ) : errorText ? (
                        <Text style={Styles.errorText}>{errorText}</Text>
                    ) : (
                        <Text style={Styles.emptyText}>No downloads yet.</Text>
                    )
                }
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadDownloads} tintColor={colors.primaryColor} />}
            />
        </View>
    );
};

export default DownloadsDetailsScreen;
