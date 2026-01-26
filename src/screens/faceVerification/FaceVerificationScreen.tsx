import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Svg, { Path } from 'react-native-svg';
import { ArrowRight, Camera } from 'iconsax-react-nativejs';
import { launchCamera } from 'react-native-image-picker';
import { createStyles } from './FaceVerificationScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';

// Custom camera frame with corner brackets and face outline
const CameraFrame = ({
    width,
    height,
    children,
    primaryColor,
    secondaryColor
}: {
    width: number;
    height: number;
    children: React.ReactNode;
    primaryColor: string;
    secondaryColor: string;
}) => {
    const strokeWidth = 4;
    const cornerLength = 60;
    const borderRadius = 14;

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
                    strokeDasharray="0"
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

const FRAME_WIDTH = 336;
const FRAME_HEIGHT = 427;

const FaceVerificationScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleCapture = async () => {
        try {
            const result = await launchCamera({
                mediaType: 'photo',
                cameraType: 'front',
                saveToPhotos: false,
                quality: 1,
                maxWidth: FRAME_WIDTH * 2,
                maxHeight: FRAME_HEIGHT * 2,
                presentationStyle: 'fullScreen',
            });

            if (result.assets && result.assets[0]?.uri) {
                setCapturedImage(result.assets[0].uri);
                setIsVerifying(true);
                // Simulate verification process
                setTimeout(() => {
                    setIsVerifying(false);
                }, 2000);
            }
        } catch (error) {
            console.log('Camera error:', error);
        }
    };

    const handleSavePreferences = () => {
        navigation.navigate('SelectLanguageScreen');
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setIsVerifying(false);
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={Styles.scrollContent}
            >
                <View style={Styles.contentContainer}>
                    <View style={Styles.verificationSection}>
                        {/* Face Image Container */}
                        <View style={Styles.imageContainer}>
                            <TouchableOpacity
                                onPress={!capturedImage ? handleCapture : handleRetake}
                                activeOpacity={0.7}
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
                                            style={Styles.faceImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <View style={Styles.cameraPlaceholder}>
                                            <Camera size={48} color={colors.grayColor} variant="Bold" />
                                            <Text style={Styles.tapToCaptureText}>Tap to capture</Text>
                                        </View>
                                    )}
                                </CameraFrame>
                            </TouchableOpacity>
                        </View>

                        {/* Text Section */}
                        <View style={Styles.progressSection}>
                            <View style={Styles.textSection}>
                                <Text style={Styles.titleText}>
                                    Verifying your face
                                </Text>
                                <Text style={Styles.descriptionText}>
                                    {capturedImage
                                        ? (isVerifying
                                            ? 'Please wait while we verify your identity...'
                                            : 'Your face has been verified successfully. Tap the image to retake if needed.')
                                        : 'Position your face within the frame and tap to capture a photo for verification.'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={Styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                Styles.primaryButton,
                                (!capturedImage || isVerifying) && Styles.primaryButtonDisabled
                            ]}
                            activeOpacity={0.7}
                            onPress={handleSavePreferences}
                            disabled={!capturedImage || isVerifying}
                        >
                            <Text style={Styles.primaryButtonText}>Save Preferences</Text>
                            <ArrowRight size={24} color={colors.pureWhite} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={Styles.secondaryButton}
                            activeOpacity={0.7}
                            onPress={handleCancel}
                        >
                            <Text style={Styles.secondaryButtonText}>Cancel</Text>
                            <ArrowRight size={24} color={colors.grayColor} />
                        </TouchableOpacity>
                    </View>
                </View>

                <SizeBox height={insets.bottom + 40} />
            </ScrollView>
        </View>
    );
};

export default FaceVerificationScreen;
