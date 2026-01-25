import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Styles from './AddCoachStyles';
import { ArrowLeft2, User, Sms, Location, Global, DocumentText, Export, ArrowRight } from 'iconsax-react-nativejs';

const AddCoachScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [coachName, setCoachName] = useState('');
    const [coachEmail, setCoachEmail] = useState('');
    const [location, setLocation] = useState('');
    const [specialized, setSpecialized] = useState('');
    const [representedClub, setRepresentedClub] = useState('');

    const isFormValid = coachName && coachEmail && location && specialized && representedClub;

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Add Coach</Text>
                <View style={Styles.headerButtonPlaceholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Section Title */}
                <Text style={Styles.sectionTitle}>Create New Add Coach</Text>

                {/* Upload Photo Section */}
                <View style={Styles.inputGroup}>
                    <Text style={Styles.inputLabel}>Upload Photo</Text>
                    <SizeBox height={8} />
                    <TouchableOpacity style={Styles.uploadContainer}>
                        <Export size={24} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox height={4} />
                        <Text style={Styles.uploadText}>Drag and Drop here</Text>
                        <Text style={Styles.uploadOrText}>or</Text>
                        <TouchableOpacity>
                            <Text style={Styles.browseFilesText}>Browse Files</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>

                {/* Coach Name */}
                <View style={Styles.inputGroup}>
                    <Text style={Styles.inputLabel}>Coach name</Text>
                    <SizeBox height={8} />
                    <View style={Styles.inputContainer}>
                        <User size={24} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.textInput}
                            placeholder="Enter name"
                            placeholderTextColor="#777777"
                            value={coachName}
                            onChangeText={setCoachName}
                        />
                    </View>
                </View>

                {/* Coach Email */}
                <View style={Styles.inputGroup}>
                    <Text style={Styles.inputLabel}>Coach email</Text>
                    <SizeBox height={8} />
                    <View style={Styles.inputContainer}>
                        <Sms size={24} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.textInput}
                            placeholder="Enter email"
                            placeholderTextColor="#777777"
                            value={coachEmail}
                            onChangeText={setCoachEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Location */}
                <View style={Styles.inputGroup}>
                    <Text style={Styles.inputLabel}>Location</Text>
                    <SizeBox height={8} />
                    <View style={Styles.inputContainer}>
                        <Location size={24} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.textInput}
                            placeholder="Enter location"
                            placeholderTextColor="#777777"
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                </View>

                {/* Specialized */}
                <View style={Styles.inputGroup}>
                    <Text style={Styles.inputLabel}>Specialized</Text>
                    <SizeBox height={8} />
                    <TouchableOpacity style={Styles.inputContainer}>
                        <Global size={24} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <Text style={[Styles.textInput, !specialized && Styles.placeholderText]}>
                            {specialized || 'Select specialized'}
                        </Text>
                        <ArrowRight size={24} color={Colors.primaryColor} variant="Linear" style={{ transform: [{ rotate: '90deg' }] }} />
                    </TouchableOpacity>
                </View>

                {/* Represented Club */}
                <View style={Styles.inputGroup}>
                    <Text style={Styles.inputLabel}>Represented Club</Text>
                    <SizeBox height={8} />
                    <View style={Styles.inputContainer}>
                        <DocumentText size={24} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.textInput}
                            placeholder="Enter Represented Club"
                            placeholderTextColor="#777777"
                            value={representedClub}
                            onChangeText={setRepresentedClub}
                        />
                    </View>
                </View>

                <SizeBox height={30} />
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={[Styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={Styles.cancelButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={Styles.cancelButtonText}>Cancel</Text>
                    <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[Styles.saveButton, !isFormValid && Styles.saveButtonDisabled]}
                    onPress={() => {
                        // Handle save
                        navigation.goBack();
                    }}
                >
                    <Text style={Styles.saveButtonText}>Save</Text>
                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AddCoachScreen;
