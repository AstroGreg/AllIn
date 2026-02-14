import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles } from './AddAthleteStyles';
import { ArrowLeft2, User, Sms, Location, Global, DocumentText, Export, ArrowRight } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const AddAthleteScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [athleteName, setAthleteName] = useState('');
    const [athleteEmail, setAthleteEmail] = useState('');
    const [location, setLocation] = useState('');
    const [specialized, setSpecialized] = useState('');
    const [representedClub, setRepresentedClub] = useState('');

    const isFormValid = athleteName && athleteEmail && location && specialized && representedClub;

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Add Athlete')}</Text>
                <View style={styles.headerButtonPlaceholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Section Title */}
                <Text style={styles.sectionTitle}>{t('Create New Add Athlete')}</Text>

                {/* Upload Photo Section */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('Upload Photo')}</Text>
                    <SizeBox height={8} />
                    <TouchableOpacity style={styles.uploadContainer}>
                        <Export size={24} color={colors.primaryColor} variant="Linear" />
                        <SizeBox height={4} />
                        <Text style={styles.uploadText}>{t('Drag and Drop here')}</Text>
                        <Text style={styles.uploadOrText}>{t('or')}</Text>
                        <TouchableOpacity>
                            <Text style={styles.browseFilesText}>{t('Browse Files')}</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>

                {/* Athlete Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('Athlete name')}</Text>
                    <SizeBox height={8} />
                    <View style={styles.inputContainer}>
                        <User size={24} color={colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={styles.textInput}
                            placeholder={t('Enter name')}
                            placeholderTextColor={colors.grayColor}
                            value={athleteName}
                            onChangeText={setAthleteName}
                        />
                    </View>
                </View>

                {/* Athlete Email */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('Athlete email')}</Text>
                    <SizeBox height={8} />
                    <View style={styles.inputContainer}>
                        <Sms size={24} color={colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={styles.textInput}
                            placeholder={t('Enter email')}
                            placeholderTextColor={colors.grayColor}
                            value={athleteEmail}
                            onChangeText={setAthleteEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Location */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('Location')}</Text>
                    <SizeBox height={8} />
                    <View style={styles.inputContainer}>
                        <Location size={24} color={colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={styles.textInput}
                            placeholder={t('Enter location')}
                            placeholderTextColor={colors.grayColor}
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                </View>

                {/* Specialized */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('Specialized')}</Text>
                    <SizeBox height={8} />
                    <TouchableOpacity style={styles.inputContainer}>
                        <Global size={24} color={colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <Text style={[styles.textInput, !specialized && styles.placeholderText]}>
                            {specialized || t('Select specialized')}
                        </Text>
                        <ArrowRight size={24} color={colors.primaryColor} variant="Linear" style={{ transform: [{ rotate: '90deg' }] }} />
                    </TouchableOpacity>
                </View>

                {/* Represented Club */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('Represented Club')}</Text>
                    <SizeBox height={8} />
                    <View style={styles.inputContainer}>
                        <DocumentText size={24} color={colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={styles.textInput}
                            placeholder={t('Enter Represented Club')}
                            placeholderTextColor={colors.grayColor}
                            value={representedClub}
                            onChangeText={setRepresentedClub}
                        />
                    </View>
                </View>

                <SizeBox height={30} />
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
                    <ArrowRight size={18} color={colors.subTextColor} variant="Linear" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
                    onPress={() => {
                        // Handle save
                        navigation.goBack();
                    }}
                >
                    <Text style={styles.saveButtonText}>{t('Save')}</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AddAthleteScreen;
