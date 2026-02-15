import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { createStyles } from './CreateProfileScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import CustomButton from '../../../components/customButton/CustomButton';
import Icons from '../../../constants/Icons';
import Images from '../../../constants/Images';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next'

const CreateProfileScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile } = useAuth();

    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        if (!username || !firstName || !lastName) {
            Alert.alert(t('Error'), t('Please fill in all required fields'));
            return;
        }

        setIsLoading(true);
        try {
            await updateUserProfile({
                username,
                firstName,
                lastName,
                birthDate,
                location,
            });
            navigation.navigate('CategorySelectionScreen');
        } catch (err: any) {
            Alert.alert(t('Error'), t('Failed to save profile. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <SizeBox height={30} />

                <View style={Styles.imageContainer}>
                    <FastImage
                        source={Images.signup2}
                        style={Styles.headerImage}
                        resizeMode="contain"
                    />
                </View>

                <SizeBox height={30} />

                <View style={Styles.contentContainer}>
                    <Text style={Styles.headingText}>{t('Create Your Profile')}</Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>
                        It only takes a minute to get started—join us now!
                    </Text>

                    <SizeBox height={24} />

                    <CustomTextInput
                        label={t('Username')}
                        placeholder={t('Enter Username')}
                        icon={<Icons.User height={16} width={16} />}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <SizeBox height={24} />

                    <CustomTextInput
                        label={t('First Name')}
                        placeholder={t('Enter First Name')}
                        icon={<Icons.User height={16} width={16} />}
                        value={firstName}
                        onChangeText={setFirstName}
                    />

                    <SizeBox height={24} />

                    <CustomTextInput
                        label={t('Last Name')}
                        placeholder={t('Enter Last Name')}
                        icon={<Icons.User height={16} width={16} />}
                        value={lastName}
                        onChangeText={setLastName}
                    />

                    <SizeBox height={24} />

                    <CustomTextInput
                        label={t('Your Birth Date')}
                        placeholder={t('dd/mm/year')}
                        icon={<Icons.DOB height={16} width={16} />}
                        value={birthDate}
                        onChangeText={setBirthDate}
                    />

                    <SizeBox height={24} />

                    <CustomTextInput
                        label={t('Location')}
                        placeholder={t('Enter Your Location')}
                        icon={<Icons.LocationSetting height={16} width={16} />}
                        value={location}
                        onChangeText={setLocation}
                    />

                    <SizeBox height={40} />

                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primaryColor} />
                    ) : (
                        <CustomButton title={t('Continue')} onPress={handleContinue} />
                    )}
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default CreateProfileScreen;