import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Styles from './CompleteAthleteDetailsScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import Images from '../../../constants/Images';
import Icons from '../../../constants/Icons';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';

const CompleteAthleteDetailsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const handleSkip = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'BottomTabBar' }],
        });
    };

    const handleFinish = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'BottomTabBar' }],
        });
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
                            label="Chest Number"
                            placeholder="Enter Chest Number"
                            icon={<Icons.User height={16} width={16} />}
                        />

                        <CustomTextInput
                            label="Website"
                            placeholder="Enter website link"
                            icon={<Icons.WebsiteBlue height={16} width={16} />}
                        />

                        <CustomTextInput
                            label="Running Club"
                            placeholder="Choose Running Club"
                            icon={<Icons.Run height={16} width={16} />}
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
                        <Text style={Styles.skipButtonText}>Skip</Text>
                        <Icons.RightBtnIconGrey height={18} width={18} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={Styles.finishButton}
                        activeOpacity={0.7}
                        onPress={handleFinish}
                    >
                        <Text style={Styles.finishButtonText}>Finish</Text>
                        <Icons.RightBtnIcon height={18} width={18} />
                    </TouchableOpacity>
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default CompleteAthleteDetailsScreen;
