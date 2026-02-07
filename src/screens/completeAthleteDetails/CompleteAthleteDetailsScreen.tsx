import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import Colors from '../../constants/Colors';
import Styles from './CompleteAthleteDetailsStyles';
import { ArrowLeft2, ArrowRight, User, Global, Building, ArrowDown2 } from 'iconsax-react-nativejs';

const CompleteAthleteDetailsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [chestNumber, setChestNumber] = useState('');
    const [website, setWebsite] = useState('');
    const [runningClub, setRunningClub] = useState('');

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
                    <FastImage source={Images.signup4} style={Styles.illustration} resizeMode="contain" />
                </View>

                {/* Title Section */}
                <View style={Styles.titleSection}>
                    <Text style={Styles.title}>Complete Your Athlete Details</Text>
                    <Text style={Styles.subtitle}>Add your information and club details</Text>
                </View>

                {/* Form Fields */}
                <View style={Styles.formContainer}>
                    {/* Chest Number */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>Chest Number</Text>
                        <View style={Styles.inputContainer}>
                            <User size={24} color={Colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={Styles.textInput}
                                placeholder="Enter Chest Number"
                                placeholderTextColor="#777777"
                                value={chestNumber}
                                onChangeText={setChestNumber}
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

                    {/* Running Club */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>Running Club</Text>
                        <TouchableOpacity style={Styles.inputContainer}>
                            <Building size={24} color={Colors.primaryColor} variant="Linear" />
                            <Text style={[Styles.dropdownText, !runningClub && Styles.placeholderText]}>
                                {runningClub || 'Choose Running Club'}
                            </Text>
                            <ArrowDown2 size={24} color="#777777" variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={[Styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={Styles.skipButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={Styles.skipButtonText}>Skip</Text>
                    <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={Styles.nextButton}
                    onPress={() => {
                        // Handle next action - go back to events for now
                        navigation.navigate('EventsViewAllScreen');
                    }}
                >
                    <Text style={Styles.nextButtonText}>Next</Text>
                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CompleteAthleteDetailsScreen;
