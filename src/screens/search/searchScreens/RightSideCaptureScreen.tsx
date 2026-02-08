import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState } from 'react'
import Svg, { Path } from 'react-native-svg'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, Camera } from 'iconsax-react-nativejs'
import { launchCamera } from 'react-native-image-picker'
import { createStyles } from './RightSideCaptureScreenStyles'

// Custom camera frame with corner brackets
const CameraFrame = ({ width, height, children, primaryColor, secondaryColor }: { width: number; height: number; children: React.ReactNode; primaryColor: string; secondaryColor: string }) => {
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
                backgroundColor: secondaryColor
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
                    stroke={primaryColor}
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
                    stroke={primaryColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Middle-Left Bracket */}
                <Path
                    d={`M ${strokeWidth / 2} ${middleY - middleBracketLength}
                        L ${strokeWidth / 2} ${middleY + middleBracketLength}`}
                    stroke={primaryColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Middle-Right Bracket */}
                <Path
                    d={`M ${width - strokeWidth / 2} ${middleY - middleBracketLength}
                        L ${width - strokeWidth / 2} ${middleY + middleBracketLength}`}
                    stroke={primaryColor}
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
                    stroke={primaryColor}
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
                    stroke={primaryColor}
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
    const { colors } = useTheme();
    const styles = createStyles(colors);
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
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Right Side Capture</Text>
                <View style={{width: 44, height: 44}} />
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
                    <CameraFrame
                        width={FRAME_WIDTH}
                        height={FRAME_HEIGHT}
                        primaryColor={colors.primaryColor}
                        secondaryColor={colors.secondaryColor}
                    >
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
                        <Camera size={24} color="#FFFFFF" variant="Bold" />
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

export default RightSideCaptureScreen
