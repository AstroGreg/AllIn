import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { Export } from 'iconsax-react-nativejs';
import { launchImageLibrary } from 'react-native-image-picker';
import { createStyles } from './DocumentUploadScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import CustomButton from '../../components/customButton/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next'

const DocumentUploadScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [documentSelected, setDocumentSelected] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string>('');

    const handleContinue = async () => {
        setIsLoading(true);
        try {
            await updateUserProfile({
                documentUploaded: documentSelected,
            });
            navigation.navigate('FaceVerificationScreen');
        } catch (err: any) {
            Alert.alert(t('Error'), t('Failed to save. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChooseFile = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
                quality: 0.9,
            });

            if (result.didCancel) return;
            if (result.errorCode) {
                Alert.alert(t('Error'), result.errorMessage || t('Could not open file picker.'));
                return;
            }

            const asset = Array.isArray(result.assets) ? result.assets[0] : null;
            if (!asset?.uri) return;

            const fallbackName = String(asset.uri).split('/').pop() || t('Selected file');
            setSelectedFileName(asset.fileName || fallbackName);
            setDocumentSelected(true);
        } catch (err: any) {
            Alert.alert(t('Error'), String(err?.message || t('Could not open file picker.')));
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={Styles.scrollContent}
            >
                <SizeBox height={30} />

                <View style={Styles.imageContainer}>
                    <FastImage
                        source={Images.fileUpload}
                        style={Styles.headerImage}
                        resizeMode="contain"
                    />
                </View>

                <SizeBox height={30} />

                <View style={Styles.headerContainer}>
                    <Text style={Styles.headingText}>
                        Government Document{'\n'}Upload
                    </Text>
                    <Text style={Styles.subHeadingText}>
                        Secure Verification Portal
                    </Text>
                </View>

                <SizeBox height={24} />

                <View style={Styles.formContainer}>
                    {/* Upload Section */}
                    <View style={{ gap: 16 }}>
                        <Text style={Styles.sectionTitle}>{t('Upload Government ID')}</Text>

                        <View style={Styles.uploadContainer}>
                            <Text style={Styles.maxSizeText}>{t('Maximum Size: 2MB')}</Text>

                            <View style={Styles.uploadIconContainer}>
                                <Export size={30} color={colors.grayColor} />
                                <Text style={Styles.dragDropText}>{t('Drag & Drop')}</Text>
                            </View>

                            <View style={Styles.fileChooseContainer}>
                                <View style={Styles.fileInputContainer}>
                                    <TouchableOpacity
                                        style={Styles.chooseFileButton}
                                        onPress={handleChooseFile}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={Styles.chooseFileText}>{t('Choose File')}</Text>
                                    </TouchableOpacity>
                                    <Text style={Styles.noFileText}>
                                        {selectedFileName || t('No File Chosen')}
                                    </Text>
                                </View>
                                <Text style={Styles.supportedText}>{t('Supported JPEG, PDF')}</Text>
                            </View>
                        </View>
                    </View>

                </View>

                <SizeBox height={40} />
            </ScrollView>

            <View style={[Styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primaryColor} />
                ) : (
                    <CustomButton title={t('Continue')} onPress={handleContinue} />
                )}
            </View>
        </View>
    );
};

export default DocumentUploadScreen;
