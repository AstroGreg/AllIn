import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import Colors from '../../constants/Colors';
import Styles from './CreateGroupProfileStyles';
import { ArrowRight, User, People, Sms, Card, Add } from 'iconsax-react-nativejs';
import Icons from '../../constants/Icons';

const CreateGroupProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [groupName, setGroupName] = useState('');
    const [coachName, setCoachName] = useState('');
    const [coachEmail, setCoachEmail] = useState('');
    const [selectedAthlete, setSelectedAthlete] = useState('');

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

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
                    {/* Group Name */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>Group Name</Text>
                        <View style={Styles.inputContainer}>
                            <People size={24} color={Colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={Styles.textInput}
                                placeholder="Enter Group Name"
                                placeholderTextColor="#777777"
                                value={groupName}
                                onChangeText={setGroupName}
                            />
                        </View>
                    </View>

                    {/* Coach Name */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>Coach Name</Text>
                        <View style={Styles.inputContainer}>
                            <User size={24} color={Colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={Styles.textInput}
                                placeholder="Enter Coach Name"
                                placeholderTextColor="#777777"
                                value={coachName}
                                onChangeText={setCoachName}
                            />
                        </View>
                    </View>

                    {/* Coach Email */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>Coach Email</Text>
                        <View style={Styles.inputContainer}>
                            <Sms size={24} color={Colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={Styles.textInput}
                                placeholder="Enter Coach Email"
                                placeholderTextColor="#777777"
                                value={coachEmail}
                                onChangeText={setCoachEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Athlete */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>Athlete</Text>
                        <TouchableOpacity style={Styles.inputContainer}>
                            <Card size={24} color={Colors.primaryColor} variant="Linear" />
                            <Text style={[Styles.dropdownText, !selectedAthlete && Styles.placeholderText]}>
                                {selectedAthlete || 'Select Athlete'}
                            </Text>
                            <Icons.Dropdown width={24} height={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Add More Athletes */}
                    <TouchableOpacity style={Styles.addMoreButton}>
                        <Text style={Styles.addMoreText}>Add More Athletes</Text>
                        <Add size={24} color="#898989" variant="Linear" />
                    </TouchableOpacity>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={Styles.continueButton}
                    onPress={() => {
                        navigation.navigate('DocumentUploadScreen');
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

export default CreateGroupProfileScreen;
