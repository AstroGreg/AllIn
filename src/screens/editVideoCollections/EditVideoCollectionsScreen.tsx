import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, ArrowRight, Add, Minus } from 'iconsax-react-nativejs'
import { launchImageLibrary } from 'react-native-image-picker'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import SizeBox from '../../constants/SizeBox'
import { createStyles } from './EditVideoCollectionsStyles'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

type SelectionMode = 'none' | 'top4' | 'delete';

const EditVideoCollectionsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);

    const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');
    const [selectedVideos, setSelectedVideos] = useState<number[]>([]);

    const [videos, setVideos] = useState<Array<{ id: number; thumbnail: any }>>([
        { id: 1, thumbnail: Images.photo1 },
        { id: 2, thumbnail: Images.photo3 },
        { id: 3, thumbnail: Images.photo4 },
        { id: 4, thumbnail: Images.photo5 },
        { id: 5, thumbnail: Images.photo6 },
        { id: 6, thumbnail: Images.photo7 },
        { id: 7, thumbnail: Images.photo8 },
        { id: 8, thumbnail: Images.photo9 },
        { id: 9, thumbnail: Images.photo1 },
        { id: 10, thumbnail: Images.photo3 },
        { id: 11, thumbnail: Images.photo4 },
        { id: 12, thumbnail: Images.photo5 },
        { id: 13, thumbnail: Images.photo6 },
        { id: 14, thumbnail: Images.photo7 },
        { id: 15, thumbnail: Images.photo8 },
        { id: 16, thumbnail: Images.photo9 },
    ]);

    const handleSelectTop4 = () => {
        setSelectionMode('top4');
        setSelectedVideos([]);
    };

    const handleDeleteVideos = () => {
        setSelectionMode('delete');
        setSelectedVideos([]);
    };

    const handleCancel = () => {
        setSelectionMode('none');
        setSelectedVideos([]);
    };

    const handleVideoPress = (videoId: number) => {
        if (selectionMode === 'none') return;

        setSelectedVideos(prev => {
            const index = prev.indexOf(videoId);
            if (index !== -1) {
                // Video is already selected, remove it
                return prev.filter(id => id !== videoId);
            } else if (selectionMode === 'top4' && prev.length >= 4) {
                // Top 4 mode: limit to 4 selections
                return prev;
            } else {
                // Add video to selection
                return [...prev, videoId];
            }
        });
    };

    const handleConfirmDelete = () => {
        setVideos((prev) => prev.filter((video) => !selectedVideos.includes(video.id)));
        setSelectionMode('none');
        setSelectedVideos([]);
    };

    const handleConfirmTop4 = () => {
        setSelectionMode('none');
        setSelectedVideos([]);
    };

    const handleAddVideos = async () => {
        const result = await launchImageLibrary({
            mediaType: 'video',
            selectionLimit: 0,
        });
        if (result?.assets?.length) {
            setVideos((prev) => [
                ...prev,
                ...result.assets.map((asset, index) => ({
                    id: Date.now() + index,
                    thumbnail: { uri: asset.uri },
                })),
            ]);
        }
    };

    const getSelectionNumber = (videoId: number): number | null => {
        const index = selectedVideos.indexOf(videoId);
        return index !== -1 ? index + 1 : null;
    };

    const getTitle = () => {
        switch (selectionMode) {
            case 'top4':
                return t('Select Top 4 Picks');
            case 'delete':
                return t('Select Videos to Delete');
            default:
                return t('My Video Collections');
        }
    };

    const isInSelectionMode = selectionMode !== 'none';
    const isDeleteMode = selectionMode === 'delete';

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Edit Video Collections')}</Text>
                <TouchableOpacity
                    style={styles.headerSwitchButton}
                    onPress={() => navigation.navigate('EditPhotoCollectionsScreen')}
                >
                    <Text style={styles.headerSwitchText}>{t('Photos')}</Text>
                    <ArrowRight size={18} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Title Row */}
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{getTitle()}</Text>
                    {isInSelectionMode ? (
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.selectTopButton} onPress={handleSelectTop4}>
                            <Text style={styles.selectTopButtonText}>{t('Select Top 4')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {!isInSelectionMode && (
                    <>
                        <SizeBox height={16} />

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.addButton} onPress={handleAddVideos}>
                                <Text style={styles.addButtonText}>{t('Add Videos')}</Text>
                                <Add size={18} color={colors.pureWhite} variant="Linear" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteVideos}>
                                <Text style={styles.deleteButtonText}>{t('Delete Videos')}</Text>
                                <Minus size={18} color="#FF0000" variant="Linear" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {selectionMode === 'top4' && selectedVideos.length > 0 && (
                    <>
                        <SizeBox height={16} />
                        <TouchableOpacity style={styles.confirmTopButton} onPress={handleConfirmTop4}>
                            <Text style={styles.confirmTopButtonText}>
                                {t('Confirm Top')} {selectedVideos.length}
                            </Text>
                            <Add size={18} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                {isDeleteMode && selectedVideos.length > 0 && (
                    <>
                        <SizeBox height={16} />
                        <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleConfirmDelete}>
                            <Text style={styles.confirmDeleteButtonText}>
                                {t('Delete')} {selectedVideos.length} {t('Video')}{selectedVideos.length > 1 ? 's' : ''}
                            </Text>
                            <Minus size={18} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                <SizeBox height={isInSelectionMode ? 24 : 16} />

                {/* Videos Grid */}
                <View style={styles.videosContainer}>
                    <View style={styles.videosGrid}>
                        {videos.map((video) => {
                            const selectionNumber = getSelectionNumber(video.id);
                            const isSelected = selectionNumber !== null;

                            return (
                                <TouchableOpacity
                                    key={video.id}
                                    onPress={() => handleVideoPress(video.id)}
                                    activeOpacity={isInSelectionMode ? 0.7 : 1}
                                >
                                    <View style={[
                                        styles.videoImageContainer,
                                        { width: imageWidth },
                                        isSelected && (isDeleteMode
                                            ? styles.videoImageContainerSelectedDelete
                                            : styles.videoImageContainerSelected)
                                    ]}>
                                        <FastImage
                                            source={video.thumbnail}
                                            style={[styles.videoImage, { width: imageWidth - 2 }]}
                                            resizeMode="cover"
                                        />
                                        {/* Play Icon */}
                                        <View style={styles.playIconContainer}>
                                            <Icons.PlayCricle width={20} height={20} />
                                        </View>
                                        {isSelected && (
                                            <View style={[
                                                styles.selectionBadge,
                                                isDeleteMode && styles.selectionBadgeDelete
                                            ]}>
                                                <Text style={styles.selectionBadgeText}>{selectionNumber}</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default EditVideoCollectionsScreen
