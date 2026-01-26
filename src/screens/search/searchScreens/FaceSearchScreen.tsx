import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Notification, SearchNormal1, Add, ArrowRight } from 'iconsax-react-nativejs';
import FastImage from 'react-native-fast-image';
import { createStyles } from './FaceSearchScreenStyles';

interface FaceGroup {
    id: number;
    name: string;
    images: string[];
}

const FaceSearchScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [searchText, setSearchText] = useState('');
    const [selectedFaceGroup, setSelectedFaceGroup] = useState<number | null>(null);

    const faceGroups: FaceGroup[] = [
        {
            id: 1,
            name: 'Greg',
            images: [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
                'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
            ],
        },
        {
            id: 2,
            name: 'Dylan',
            images: [
                'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200',
                'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=200',
                'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200',
                'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200',
                'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200',
            ],
        },
        {
            id: 3,
            name: 'Mohammed',
            images: [
                'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200',
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
            ],
        },
        {
            id: 4,
            name: 'Sophie',
            images: [
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
            ],
        },
    ];

    const filteredGroups = faceGroups.filter(group =>
        group.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderFaceGroup = (group: FaceGroup) => {
        const isSelected = selectedFaceGroup === group.id;

        return (
            <View key={group.id} style={styles.faceGroupCard}>
                <View style={styles.faceGroupHeader}>
                    <Text style={styles.faceGroupName}>{group.name}</Text>
                    <TouchableOpacity
                        style={[styles.selectButton, isSelected && styles.selectButtonActive]}
                        onPress={() => setSelectedFaceGroup(isSelected ? null : group.id)}
                    >
                        <Text style={styles.selectButtonText}>
                            {isSelected ? 'Selected' : 'Select'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <SizeBox height={16} />
                <View style={styles.faceImagesRow}>
                    {group.images.map((image, imgIndex) => (
                        <View key={imgIndex} style={styles.faceImageWrapper}>
                            <FastImage
                                source={{ uri: image }}
                                style={styles.faceImage}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Faces</Text>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('NotificationsScreen')}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                {/* Search Face Label and Add Button */}
                <View style={styles.searchLabelRow}>
                    <Text style={styles.searchLabel}>Search Face:</Text>
                    <TouchableOpacity
                        style={styles.addFaceButton}
                        onPress={() => navigation.navigate('FrontFaceCaptureScreen')}
                    >
                        <Text style={styles.addFaceButtonText}>Add Face</Text>
                        <Add size={16} color="#FFFFFF" variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={8} />

                {/* Search Input */}
                <View style={styles.searchInputContainer}>
                    <SearchNormal1 size={24} color={colors.grayColor} variant="Linear" />
                    <SizeBox width={6} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search face"
                        placeholderTextColor={colors.grayColor}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                <SizeBox height={24} />

                {/* Face Groups */}
                {filteredGroups.map(renderFaceGroup)}

                <SizeBox height={100} />
            </ScrollView>

            {/* Continue Button */}
            <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={[styles.continueButton, !selectedFaceGroup && styles.continueButtonDisabled]}
                    onPress={() => {
                        if (selectedFaceGroup) {
                            // Navigate to search results with selected face
                            navigation.navigate('SearchScreen');
                        }
                    }}
                    disabled={!selectedFaceGroup}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <ArrowRight size={24} color="#FFFFFF" variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FaceSearchScreen;
