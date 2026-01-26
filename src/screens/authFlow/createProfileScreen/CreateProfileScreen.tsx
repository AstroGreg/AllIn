import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { createStyles } from './CreateProfileScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import CustomButton from '../../../components/customButton/CustomButton';
import Icons from '../../../constants/Icons';
import Images from '../../../constants/Images';
import { useTheme } from '../../../context/ThemeContext';

const CreateProfileScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();

    const handleContinue = () => {
        navigation.navigate('SelectEventScreen');
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
                    />

                    <SizeBox height={24} />

                    <CustomTextInput
                        label="First Name"
                        placeholder="Enter First Name"
                        icon={<Icons.User height={16} width={16} />}
                    />

                    <SizeBox height={24} />

                    <CustomTextInput
                        label="Last Name"
                        placeholder="Enter Last Name"
                        icon={<Icons.User height={16} width={16} />}
                    />

                    <SizeBox height={24} />

                    <CustomTextInput
                        label="Your Birth Date"
                        placeholder="dd/mm/year"
                        icon={<Icons.DOB height={16} width={16} />}
                    />

                    <SizeBox height={24} />

                    <CustomTextInput
                        label="Location"
                        placeholder="Enter Your Location"
                        icon={<Icons.LocationSetting height={16} width={16} />}
                    />

                    <SizeBox height={40} />

                    <CustomButton title="Continue" onPress={handleContinue} />
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default CreateProfileScreen;
