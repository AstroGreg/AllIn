import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import DatePicker from 'react-native-date-picker';
import { createStyles } from './CreateProfileScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import CustomButton from '../../../components/customButton/CustomButton';
import Icons from '../../../constants/Icons';
import Images from '../../../constants/Images';
import Colors from '../../../constants/Colors';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';

const CreateProfileScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile, user } = useAuth();

    const [username, setUsername] = useState(user?.nickname || '');
    const [firstName, setFirstName] = useState(user?.givenName || '');
    const [lastName, setLastName] = useState(user?.familyName || '');
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleContinue = async () => {
        if (!username || !firstName || !lastName) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            await updateUserProfile({
                username,
                firstName,
                lastName,
                birthDate: birthDate ? formatDate(birthDate) : '',
                location,
            });
            navigation.navigate('CategorySelectionScreen');
        } catch (err: any) {
            Alert.alert('Error', 'Failed to save profile. Please try again.');
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
                    <Text style={Styles.headingText}>Create Your Profile</Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>
                        It only takes a minute to get started—join us now!
                    </Text>

                    <SizeBox height={24} />

                    <CustomTextInput
                        label="Username"
                        placeholder="Enter Username"
                        icon={<Icons.User height={16} width={16} />}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <SizeBox height={24} />

                    <CustomTextInput
                        label="First Name"
                        placeholder="Enter First Name"
                        icon={<Icons.User height={16} width={16} />}
                        value={firstName}
                        onChangeText={setFirstName}
                    />

                    <SizeBox height={24} />

                    <CustomTextInput
                        label="Last Name"
                        placeholder="Enter Last Name"
                        icon={<Icons.User height={16} width={16} />}
                        value={lastName}
                        onChangeText={setLastName}
                    />

                    <SizeBox height={24} />

                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.blackColor }}>Your Birth Date</Text>
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.borderColor || '#E0E0E0',
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            height: 56,
                            backgroundColor: colors.inputBackground || colors.backgroundColor,
                        }}
                    >
                        <Icons.DOB height={16} width={16} />
                        <SizeBox width={10} />
                        <Text style={{
                            flex: 1,
                            fontSize: 14,
                            color: birthDate ? colors.blackColor : Colors.grayColor,
                        }}>
                            {birthDate ? formatDate(birthDate) : 'dd/mm/year'}
                        </Text>
                    </TouchableOpacity>

                    <SizeBox height={24} />

                    <CustomTextInput
                        label="Location"
                        placeholder="Enter Your Location"
                        icon={<Icons.LocationSetting height={16} width={16} />}
                        value={location}
                        onChangeText={setLocation}
                    />

                    <SizeBox height={40} />

                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primaryColor} />
                    ) : (
                        <CustomButton title="Continue" onPress={handleContinue} />
                    )}
                </View>

                <SizeBox height={40} />
            </ScrollView>

            <DatePicker
                modal
                open={showDatePicker}
                date={birthDate || new Date(2000, 0, 1)}
                mode="date"
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                title="Select your birth date"
                onConfirm={(date) => {
                    setShowDatePicker(false);
                    setBirthDate(date);
                }}
                onCancel={() => setShowDatePicker(false)}
            />
        </View>
    );
};

export default CreateProfileScreen;
