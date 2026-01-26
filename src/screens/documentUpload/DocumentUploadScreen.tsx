import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { Export, Sms } from 'iconsax-react-nativejs';
import { createStyles } from './DocumentUploadScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import CustomButton from '../../components/customButton/CustomButton';
import { useTheme } from '../../context/ThemeContext';

const DocumentUploadScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();

    const handleContinue = () => {
        navigation.navigate('FaceVerificationScreen');
    };

    const handleChooseFile = () => {
        // TODO: Implement file picker
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
                        <Text style={Styles.sectionTitle}>Upload Government ID</Text>

                        <View style={Styles.uploadContainer}>
                            <Text style={Styles.maxSizeText}>Maximum Size: 2MB</Text>

                            <View style={Styles.uploadIconContainer}>
                                <Export size={30} color={colors.grayColor} />
                                <Text style={Styles.dragDropText}>Drag & Drop</Text>
                            </View>

                            <View style={Styles.fileChooseContainer}>
                                <View style={Styles.fileInputContainer}>
                                    <TouchableOpacity
                                        style={Styles.chooseFileButton}
                                        onPress={handleChooseFile}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={Styles.chooseFileText}>Choose File</Text>
                                    </TouchableOpacity>
                                    <Text style={Styles.noFileText}>No File Chosen</Text>
                                </View>
                                <Text style={Styles.supportedText}>Supported JPEG, PDF</Text>
                            </View>
                        </View>
                    </View>

                    {/* Coach Email Section */}
                    <View style={{ gap: 8 }}>
                        <Text style={Styles.inputLabel}>Coach Email</Text>
                        <View style={Styles.inputContainer}>
                            <Sms size={24} color={colors.grayColor} />
                            <Text style={Styles.inputText}>Enter Coach Email</Text>
                        </View>
                    </View>
                </View>

                <SizeBox height={40} />
            </ScrollView>

            <View style={[Styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
                <CustomButton title="Continue" onPress={handleContinue} />
            </View>
        </View>
    );
};

export default DocumentUploadScreen;
