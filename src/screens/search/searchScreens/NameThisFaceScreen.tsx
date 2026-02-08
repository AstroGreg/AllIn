import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { CommonActions } from '@react-navigation/native'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, User, ArrowRight2 } from 'iconsax-react-nativejs'
import { createStyles } from './NameThisFaceScreenStyles'

const NameThisFaceScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [faceName, setFaceName] = useState('');

    const frontFaceImage = route?.params?.frontFaceImage;
    const leftSideImage = route?.params?.leftSideImage;
    const rightSideImage = route?.params?.rightSideImage;

    const capturedImages = [
        frontFaceImage,
        leftSideImage,
        rightSideImage
    ].filter(Boolean);

    const handleSaveFace = () => {
        if (faceName.trim()) {
            // Navigate back to BottomTabBar and switch to Search tab
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'BottomTabBar',
                            state: {
                                index: 1, // Search tab index
                                routes: [
                                    { name: 'Home' },
                                    { name: 'Search' },
                                    { name: 'Upload' },
                                    { name: 'Profile' },
                                    { name: 'Menu' },
                                ],
                            },
                        },
                    ],
                })
            );
        }
    };

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Name This Face</Text>
                <View style={{width: 44, height: 44}} />
            </View>

            <View style={styles.content}>
                {/* Captured Views */}
                <Text style={styles.sectionTitle}>Captured Views</Text>
                <SizeBox height={16} />

                <View style={styles.capturedViewsRow}>
                    {capturedImages.map((image, index) => (
                        <View key={index} style={styles.capturedImageContainer}>
                            <FastImage
                                source={{ uri: image }}
                                style={styles.capturedImage}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        </View>
                    ))}
                </View>

                <SizeBox height={24} />

                {/* Face Name Input */}
                <Text style={styles.inputLabel}>Face Name</Text>
                <SizeBox height={8} />

                <View style={styles.inputContainer}>
                    <User size={20} color={colors.primaryColor} variant="Linear" />
                    <SizeBox width={10} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter Face Name"
                        placeholderTextColor={colors.grayColor}
                        value={faceName}
                        onChangeText={setFaceName}
                    />
                </View>
            </View>

            {/* Save Face Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        !faceName.trim() && styles.saveButtonDisabled
                    ]}
                    onPress={handleSaveFace}
                    disabled={!faceName.trim()}
                >
                    <Text style={styles.saveButtonText}>Save Face</Text>
                    <ArrowRight2 size={18} color="#FFFFFF" variant="Linear" />
                </TouchableOpacity>
            </View>

            <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
        </View>
    )
}

export default NameThisFaceScreen
