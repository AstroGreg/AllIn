import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, ArrowRight, Add, Minus } from 'iconsax-react-nativejs'
import { launchImageLibrary } from 'react-native-image-picker'
import Colors from '../../constants/Colors'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import SizeBox from '../../constants/SizeBox'
import Styles from './EditVideoCollectionsStyles'

type SelectionMode = 'none' | 'top4' | 'delete';

const EditVideoCollectionsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);

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
                return 'Select Top 4 Picks';
            case 'delete':
                return 'Select Videos to Delete';
            default:
                return 'My Video Collections';
        }
    };

    const isInSelectionMode = selectionMode !== 'none';
    const isDeleteMode = selectionMode === 'delete';

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Edit Video Collections</Text>
                <TouchableOpacity
                    style={Styles.headerSwitchButton}
                    onPress={() => navigation.navigate('EditPhotoCollectionsScreen')}
                >
                    <Text style={Styles.headerSwitchText}>Photos</Text>
                    <ArrowRight size={18} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Title Row */}
                <View style={Styles.titleRow}>
                    <Text style={Styles.title}>{getTitle()}</Text>
                    {isInSelectionMode ? (
                        <TouchableOpacity style={Styles.cancelButton} onPress={handleCancel}>
                            <Text style={Styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={Styles.selectTopButton} onPress={handleSelectTop4}>
                            <Text style={Styles.selectTopButtonText}>Select Top 4</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {!isInSelectionMode && (
                    <>
                        <SizeBox height={16} />

                        <View style={Styles.actionRow}>
                            <TouchableOpacity style={Styles.addButton} onPress={handleAddVideos}>
                                <Text style={Styles.addButtonText}>Add Videos</Text>
                                <Add size={18} color={Colors.whiteColor} variant="Linear" />
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.deleteButton} onPress={handleDeleteVideos}>
                                <Text style={Styles.deleteButtonText}>Delete Videos</Text>
                                <Minus size={18} color="#FF0000" variant="Linear" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {selectionMode === 'top4' && selectedVideos.length > 0 && (
                    <>
                        <SizeBox height={16} />
                        <TouchableOpacity style={Styles.confirmTopButton} onPress={handleConfirmTop4}>
                            <Text style={Styles.confirmTopButtonText}>
                                Confirm Top {selectedVideos.length}
                            </Text>
                            <Add size={18} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                {isDeleteMode && selectedVideos.length > 0 && (
                    <>
                        <SizeBox height={16} />
                        <TouchableOpacity style={Styles.confirmDeleteButton} onPress={handleConfirmDelete}>
                            <Text style={Styles.confirmDeleteButtonText}>
                                Delete {selectedVideos.length} Video{selectedVideos.length > 1 ? 's' : ''}
                            </Text>
                            <Minus size={18} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                <SizeBox height={isInSelectionMode ? 24 : 16} />

                {/* Videos Grid */}
                <View style={Styles.videosContainer}>
                    <View style={Styles.videosGrid}>
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
                                        Styles.videoImageContainer,
                                        { width: imageWidth },
                                        isSelected && (isDeleteMode
                                            ? Styles.videoImageContainerSelectedDelete
                                            : Styles.videoImageContainerSelected)
                                    ]}>
                                        <FastImage
                                            source={video.thumbnail}
                                            style={[Styles.videoImage, { width: imageWidth - 2 }]}
                                            resizeMode="cover"
                                        />
                                        {/* Play Icon */}
                                        <View style={Styles.playIconContainer}>
                                            <Icons.PlayCricle width={20} height={20} />
                                        </View>
                                        {isSelected && (
                                            <View style={[
                                                Styles.selectionBadge,
                                                isDeleteMode && Styles.selectionBadgeDelete
                                            ]}>
                                                <Text style={Styles.selectionBadgeText}>{selectionNumber}</Text>
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
