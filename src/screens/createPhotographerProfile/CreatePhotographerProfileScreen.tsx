import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import Colors from '../../constants/Colors';
import Styles from './CreatePhotographerProfileStyles';
import { ArrowLeft2, ArrowRight, User, Global } from 'iconsax-react-nativejs';

const CreatePhotographerProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [photographerName, setPhotographerName] = useState('');
    const [website, setWebsite] = useState('');

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Illustration */}
                <View style={Styles.illustrationContainer}>
                    <FastImage source={Images.signup2} style={Styles.illustration} resizeMode="contain" />
                </View>

                {/* Title Section */}
                <View style={Styles.titleSection}>
                    <Text style={Styles.title}>Create Group Profile</Text>
                    <Text style={Styles.subtitle}>It only takes a minute to get started—join us now!</Text>
                </View>

                {/* Form Fields */}
                <View style={Styles.formContainer}>
                    {/* Photographer Name */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>Photographer Name</Text>
                        <View style={Styles.inputContainer}>
                            <User size={24} color={Colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={Styles.textInput}
                                placeholder="Enter Photographer Name"
                                placeholderTextColor="#777777"
                                value={photographerName}
                                onChangeText={setPhotographerName}
                            />
                        </View>
                    </View>

                    {/* Website */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>Website</Text>
                        <View style={Styles.inputContainer}>
                            <Global size={24} color={Colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={Styles.textInput}
                                placeholder="Enter website link"
                                placeholderTextColor="#777777"
                                value={website}
                                onChangeText={setWebsite}
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={Styles.continueButton}
                    onPress={() => {
                        navigation.navigate('EventsViewAllScreen');
                    }}
                >
                    <Text style={Styles.continueButtonText}>Continue</Text>
                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
            </ScrollView>

            <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
        </View>
    );
};

export default CreatePhotographerProfileScreen;
