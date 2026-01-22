import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import React, { useState } from 'react'
import { CommonActions } from '@react-navigation/native'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../../../constants/Colors'
import Fonts from '../../../constants/Fonts'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, Notification, User, ArrowRight2 } from 'iconsax-react-nativejs'

const NameThisFaceScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
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
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Name This Face</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Notification size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
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
                    <User size={20} color={Colors.primaryColor} variant="Linear" />
                    <SizeBox width={10} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter Face Name"
                        placeholderTextColor="#9B9F9F"
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
                    <ArrowRight2 size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
        </View>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.3,
        borderBottomColor: '#DEDEDE',
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    capturedViewsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    capturedImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        overflow: 'hidden',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    inputLabel: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    textInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    bottomContainer: {
        paddingHorizontal: 20,
    },
    saveButton: {
        height: 54,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#B0D4FF',
    },
    saveButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default NameThisFaceScreen
