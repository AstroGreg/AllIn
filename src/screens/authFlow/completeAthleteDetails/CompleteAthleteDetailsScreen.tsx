import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { createStyles } from './CompleteAthleteDetailsScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import Images from '../../../constants/Images';
import Icons from '../../../constants/Icons';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { Buildings } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next'

const CompleteAthleteDetailsScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile } = useAuth();

    const [chestNumber, setChestNumber] = useState('');
    const [website, setWebsite] = useState('');
    const [runningClub, setRunningClub] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSkip = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'BottomTabBar' }],
        });
    };

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            await updateUserProfile({
                chestNumber,
                website,
                runningClub,
            });
            navigation.navigate('DocumentUploadScreen');
        } catch (err: any) {
            Alert.alert(t('Error'), t('Failed to save details. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <SizeBox height={30} />

                <View style={Styles.imageContainer}>
                    <FastImage
                        source={Images.signup4}
                        style={Styles.headerImage}
                        resizeMode="contain"
                    />
                </View>

                <SizeBox height={30} />

                <View style={Styles.contentContainer}>
                    <Text style={Styles.headingText}>
                        Complete Your Athlete Details
                    </Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>
                        Add your information and club details
                    </Text>

                    <SizeBox height={24} />

                    <View style={Styles.formContainer}>
                        <CustomTextInput
                            label={t('Chest Number')}
                            placeholder={t('Enter Chest Number')}
                            icon={<Icons.User height={16} width={16} />}
                            value={chestNumber}
                            onChangeText={setChestNumber}
                        />

                        <CustomTextInput
                            label={t('Website')}
                            placeholder={t('Enter website link')}
                            icon={<Icons.WebsiteBlue height={16} width={16} />}
                            value={website}
                            onChangeText={setWebsite}
                            autoCapitalize="none"
                        />

                        <CustomTextInput
                            label={t('Running Club')}
                            placeholder={t('Choose Running Club')}
                            icon={<Buildings size={16} color={colors.primaryColor} />}
                            value={runningClub}
                            onChangeText={setRunningClub}
                            isDown={true}
                        />
                    </View>
                </View>

                <View style={Styles.buttonContainer}>
                    <TouchableOpacity
                        style={Styles.skipButton}
                        activeOpacity={0.7}
                        onPress={handleSkip}
                    >
                        <Text style={Styles.skipButtonText}>{t('Skip')}</Text>
                        <Icons.RightBtnIconGrey height={18} width={18} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[Styles.finishButton, isLoading && { opacity: 0.5 }]}
                        activeOpacity={0.7}
                        onPress={handleFinish}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Text style={Styles.finishButtonText}>{t('Finish')}</Text>
                                <Icons.RightBtnIcon height={18} width={18} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default CompleteAthleteDetailsScreen;