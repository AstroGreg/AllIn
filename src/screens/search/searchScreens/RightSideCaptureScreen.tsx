import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import React, { useState } from 'react'
import Svg, { Path } from 'react-native-svg'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../../../constants/Colors'
import Fonts from '../../../constants/Fonts'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, Notification, Camera } from 'iconsax-react-nativejs'
import { launchCamera } from 'react-native-image-picker'

// Custom camera frame with corner brackets
const CameraFrame = ({ width, height, children }: { width: number; height: number; children: React.ReactNode }) => {
    const strokeWidth = 10;
    const cornerLength = 80;
    const borderRadius = 10;
    const middleBracketLength = 50;
    const middleY = height / 2;

    return (
        <View style={{ width, height, position: 'relative' }}>
            {/* Content */}
            <View style={{
                width,
                height,
                borderRadius,
                overflow: 'hidden',
                backgroundColor: '#E8E8E8'
            }}>
                {children}
            </View>

            {/* SVG Frame Overlay */}
            <Svg
                width={width}
                height={height}
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                {/* Top-Left Corner */}
                <Path
                    d={`M ${strokeWidth / 2} ${borderRadius + cornerLength}
                        L ${strokeWidth / 2} ${borderRadius}
                        Q ${strokeWidth / 2} ${strokeWidth / 2} ${borderRadius} ${strokeWidth / 2}
                        L ${borderRadius + cornerLength} ${strokeWidth / 2}`}
                    stroke={Colors.primaryColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Top-Right Corner */}
                <Path
                    d={`M ${width - borderRadius - cornerLength} ${strokeWidth / 2}
                        L ${width - borderRadius} ${strokeWidth / 2}
                        Q ${width - strokeWidth / 2} ${strokeWidth / 2} ${width - strokeWidth / 2} ${borderRadius}
                        L ${width - strokeWidth / 2} ${borderRadius + cornerLength}`}
                    stroke={Colors.primaryColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Middle-Left Bracket */}
                <Path
                    d={`M ${strokeWidth / 2} ${middleY - middleBracketLength}
                        L ${strokeWidth / 2} ${middleY + middleBracketLength}`}
                    stroke={Colors.primaryColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Middle-Right Bracket */}
                <Path
                    d={`M ${width - strokeWidth / 2} ${middleY - middleBracketLength}
                        L ${width - strokeWidth / 2} ${middleY + middleBracketLength}`}
                    stroke={Colors.primaryColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Bottom-Left Corner */}
                <Path
                    d={`M ${strokeWidth / 2} ${height - borderRadius - cornerLength}
                        L ${strokeWidth / 2} ${height - borderRadius}
                        Q ${strokeWidth / 2} ${height - strokeWidth / 2} ${borderRadius} ${height - strokeWidth / 2}
                        L ${borderRadius + cornerLength} ${height - strokeWidth / 2}`}
                    stroke={Colors.primaryColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Bottom-Right Corner */}
                <Path
                    d={`M ${width - borderRadius - cornerLength} ${height - strokeWidth / 2}
                        L ${width - borderRadius} ${height - strokeWidth / 2}
                        Q ${width - strokeWidth / 2} ${height - strokeWidth / 2} ${width - strokeWidth / 2} ${height - borderRadius}
                        L ${width - strokeWidth / 2} ${height - borderRadius - cornerLength}`}
                    stroke={Colors.primaryColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />
            </Svg>
        </View>
    );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_WIDTH = SCREEN_WIDTH - 40;
const FRAME_HEIGHT = 465;

const RightSideCaptureScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const frontFaceImage = route?.params?.frontFaceImage;
    const leftSideImage = route?.params?.leftSideImage;

    const handleCapture = async () => {
        try {
            const result = await launchCamera({
                mediaType: 'photo',
                cameraType: 'front',
                saveToPhotos: false,
                quality: 0.8,
            });

            if (result.assets && result.assets[0]?.uri) {
                setCapturedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.log('Camera error:', error);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleNext = () => {
        if (capturedImage) {
            // Navigate to Name This Face screen
            navigation.navigate('NameThisFaceScreen', {
                frontFaceImage,
                leftSideImage,
                rightSideImage: capturedImage
            });
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
                <Text style={styles.headerTitle}>Right Side Capture</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Notification size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Instruction Text */}
                <Text style={styles.instructionText}>
                    Look straight at the camera and keep your face inside the frame
                </Text>

                <SizeBox height={16} />

                {/* Camera Frame */}
                <TouchableOpacity
                    onPress={!capturedImage ? handleCapture : undefined}
                    activeOpacity={capturedImage ? 1 : 0.7}
                >
                    <CameraFrame width={FRAME_WIDTH} height={FRAME_HEIGHT}>
                        {capturedImage ? (
                            <FastImage
                                source={{ uri: capturedImage }}
                                style={styles.capturedImage}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        ) : (
                            <View style={styles.cameraPlaceholder}>
                                <Text style={styles.tapToCapture}>Tap to capture</Text>
                            </View>
                        )}
                    </CameraFrame>
                </TouchableOpacity>

                <SizeBox height={40} />

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.outlineButton}
                        onPress={handleBack}
                    >
                        <Text style={styles.outlineButtonText}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={handleCapture}
                    >
                        <Camera size={24} color={Colors.whiteColor} variant="Bold" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.outlineButton,
                            !capturedImage && styles.outlineButtonDisabled
                        ]}
                        onPress={handleNext}
                        disabled={!capturedImage}
                    >
                        <Text style={[
                            styles.outlineButtonText,
                            !capturedImage && styles.outlineButtonTextDisabled
                        ]}>Next</Text>
                    </TouchableOpacity>
                </View>
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
        paddingTop: 16,
    },
    instructionText: {
        ...Fonts.regular14,
        color: '#777777',
        textAlign: 'center',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    cameraPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8E8E8',
    },
    tapToCapture: {
        ...Fonts.regular14,
        color: '#777777',
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    outlineButton: {
        width: 120,
        height: 54,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlineButtonDisabled: {
        borderColor: '#E8E8E8',
    },
    outlineButtonText: {
        ...Fonts.medium16,
        color: '#9B9F9F',
    },
    outlineButtonTextDisabled: {
        color: '#D0D0D0',
    },
    cameraButton: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default RightSideCaptureScreen
