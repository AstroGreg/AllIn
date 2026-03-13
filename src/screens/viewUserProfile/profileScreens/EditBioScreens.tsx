import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { createStyles } from '../ViewUserProfileStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomButton from '../../../components/customButton/CustomButton'
import { useTheme } from '../../../context/ThemeContext'
import { useAuth } from '../../../context/AuthContext'
import { getProfileSummary, updateProfileSummary } from '../../../services/apiGateway'
import { ArrowLeft2 } from 'iconsax-react-nativejs'
import { useTranslation } from 'react-i18next'

const EditBioScreens = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken, updateUserProfile, userProfile } = useAuth();
    const [bio, setBio] = useState('');
    const bioRef = useRef('');
    const [hasEditedBio, setHasEditedBio] = useState(false);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!apiAccessToken) {
                if (mounted) {
                    const nextBio = String(userProfile?.bio ?? '');
                    bioRef.current = nextBio;
                    setBio(nextBio);
                }
                return;
            }
            try {
                const summary = await getProfileSummary(apiAccessToken);
                if (!mounted) return;
                if (hasEditedBio) return;
                if (summary?.profile?.bio != null) {
                    const nextBio = String(summary.profile.bio || '');
                    bioRef.current = nextBio;
                    setBio(nextBio);
                }
            } catch {
                // ignore
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, hasEditedBio, userProfile?.bio]);

    const handleSave = async () => {
        const nextBio = bioRef.current;
        if (!apiAccessToken) {
            await updateUserProfile({ bio: nextBio });
            navigation.goBack();
            return;
        }
        try {
            await updateProfileSummary(apiAccessToken, { bio: nextBio });
            await updateUserProfile({ bio: nextBio }, { persistLocally: false });
            navigation.goBack();
        } catch {
            // keep user on screen if save fails
        }
    };

    return (
        <View style={styles.mainContainer} testID="edit-bio-screen">
            <SizeBox height={insets.top} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Bio')}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <SizeBox height={42} />
                    <Text style={styles.titleText}>{t('Bio')}</Text>
                    <SizeBox height={8} />
                    <View style={styles.bioContainer}>
                        <TextInput
                            testID="edit-bio-input"
                            style={styles.textInput}
                            placeholder={t('Write your bio...')}
                            placeholderTextColor={colors.subTextColor}
                            multiline
                            value={bio}
                            onChangeText={(value) => {
                                setHasEditedBio(true);
                                bioRef.current = value;
                                setBio(value);
                            }}
                        />
                    </View>
                    <SizeBox height={16} />

                    <View style={[styles.row, styles.spaceBetween, { flex: 1 }]}>
                        <TouchableOpacity style={[styles.cancelBtn, { flex: 0.484 }]} activeOpacity={0.7} onPress={() => navigation.goBack()}>
                            <Text style={styles.eventBtnText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 0.484 }}>
                            <CustomButton title={t('Save')} onPress={handleSave} isSmall={true} testID="edit-bio-save" />
                        </View>
                    </View>

                    <SizeBox height={16} />
                </View>
            </ScrollView>
        </View>
    )
}

export default EditBioScreens
