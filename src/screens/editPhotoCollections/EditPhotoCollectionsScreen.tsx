import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, ArrowRight, Add, Minus } from 'iconsax-react-nativejs'
import { launchImageLibrary } from 'react-native-image-picker'
import Colors from '../../constants/Colors'
import Images from '../../constants/Images'
import SizeBox from '../../constants/SizeBox'
import Styles from './EditPhotoCollectionsStyles'

type SelectionMode = 'none' | 'top4' | 'delete';

const EditPhotoCollectionsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);

    const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);

    const [photos, setPhotos] = useState<Array<{ id: number; image: any }>>([
        { id: 1, image: Images.photo1 },
        { id: 2, image: Images.photo3 },
        { id: 3, image: Images.photo4 },
        { id: 4, image: Images.photo5 },
        { id: 5, image: Images.photo6 },
        { id: 6, image: Images.photo7 },
        { id: 7, image: Images.photo8 },
        { id: 8, image: Images.photo9 },
        { id: 9, image: Images.photo1 },
        { id: 10, image: Images.photo3 },
        { id: 11, image: Images.photo4 },
        { id: 12, image: Images.photo5 },
        { id: 13, image: Images.photo6 },
        { id: 14, image: Images.photo7 },
        { id: 15, image: Images.photo8 },
        { id: 16, image: Images.photo9 },
    ]);

    const handleSelectTop4 = () => {
        setSelectionMode('top4');
        setSelectedPhotos([]);
    };

    const handleDeletePhotos = () => {
        setSelectionMode('delete');
        setSelectedPhotos([]);
    };

    const handleCancel = () => {
        setSelectionMode('none');
        setSelectedPhotos([]);
    };

    const handlePhotoPress = (photoId: number) => {
        if (selectionMode === 'none') return;

        setSelectedPhotos(prev => {
            const index = prev.indexOf(photoId);
            if (index !== -1) {
                // Photo is already selected, remove it
                return prev.filter(id => id !== photoId);
            } else if (selectionMode === 'top4' && prev.length >= 4) {
                // Top 4 mode: limit to 4 selections
                return prev;
            } else {
                // Add photo to selection
                return [...prev, photoId];
            }
        });
    };

    const handleConfirmDelete = () => {
        setPhotos((prev) => prev.filter((photo) => !selectedPhotos.includes(photo.id)));
        setSelectionMode('none');
        setSelectedPhotos([]);
    };

    const handleConfirmTop4 = () => {
        setSelectionMode('none');
        setSelectedPhotos([]);
    };

    const handleAddPhotos = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 0,
        });
        if (result?.assets?.length) {
            setPhotos((prev) => [
                ...prev,
                ...result.assets.map((asset, index) => ({
                    id: Date.now() + index,
                    image: { uri: asset.uri },
                })),
            ]);
        }
    };
    const getSelectionNumber = (photoId: number): number | null => {
        const index = selectedPhotos.indexOf(photoId);
        return index !== -1 ? index + 1 : null;
    };

    const getTitle = () => {
        switch (selectionMode) {
            case 'top4':
                return 'Select Top 4 Picks';
            case 'delete':
                return 'Select Photos to Delete';
            default:
                return 'My Photo Collections';
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
                <Text style={Styles.headerTitle}>Edit Photo Collections</Text>
                <TouchableOpacity
                    style={Styles.headerSwitchButton}
                    onPress={() => navigation.navigate('EditVideoCollectionsScreen')}
                >
                    <Text style={Styles.headerSwitchText}>Videos</Text>
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
                            <TouchableOpacity style={Styles.addButton} onPress={handleAddPhotos}>
                                <Text style={Styles.addButtonText}>Add Photos</Text>
                                <Add size={18} color={Colors.whiteColor} variant="Linear" />
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.deleteButton} onPress={handleDeletePhotos}>
                                <Text style={Styles.deleteButtonText}>Delete Photos</Text>
                                <Minus size={18} color="#FF0000" variant="Linear" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {selectionMode === 'top4' && selectedPhotos.length > 0 && (
                    <>
                        <SizeBox height={16} />
                        <TouchableOpacity style={Styles.confirmTopButton} onPress={handleConfirmTop4}>
                            <Text style={Styles.confirmTopButtonText}>
                                Confirm Top {selectedPhotos.length}
                            </Text>
                            <Add size={18} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                {isDeleteMode && selectedPhotos.length > 0 && (
                    <>
                        <SizeBox height={16} />
                        <TouchableOpacity style={Styles.confirmDeleteButton} onPress={handleConfirmDelete}>
                            <Text style={Styles.confirmDeleteButtonText}>
                                Delete {selectedPhotos.length} Photo{selectedPhotos.length > 1 ? 's' : ''}
                            </Text>
                            <Minus size={18} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                <SizeBox height={isInSelectionMode ? 24 : 16} />

                {/* Photos Grid */}
                <View style={Styles.photosContainer}>
                    <View style={Styles.photosGrid}>
                        {photos.map((photo) => {
                            const selectionNumber = getSelectionNumber(photo.id);
                            const isSelected = selectionNumber !== null;

                            return (
                                <TouchableOpacity
                                    key={photo.id}
                                    onPress={() => handlePhotoPress(photo.id)}
                                    activeOpacity={isInSelectionMode ? 0.7 : 1}
                                >
                                    <View style={[
                                        Styles.photoImageContainer,
                                        { width: imageWidth },
                                        isSelected && (isDeleteMode
                                            ? Styles.photoImageContainerSelectedDelete
                                            : Styles.photoImageContainerSelected)
                                    ]}>
                                        <FastImage
                                            source={photo.image}
                                            style={[Styles.photoImage, { width: imageWidth - 2 }]}
                                            resizeMode="cover"
                                        />
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

export default EditPhotoCollectionsScreen
