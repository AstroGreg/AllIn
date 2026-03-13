import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, Lock, User, Card, Calendar, ArrowRight2, Scan } from 'iconsax-react-nativejs'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../context/AuthContext'
import { normalizeSelectedEvents } from '../../../utils/profileSelections'

interface SettingsItem {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
}

const ProfileSettings = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { userProfile, user, authBootstrap } = useAuth();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    const selectedFocuses = normalizeSelectedEvents(userProfile?.selectedEvents ?? []);
    const hasAthleteProfile = selectedFocuses.length > 0;
    const hasSupportProfile = (
        String((userProfile as any)?.supportRole ?? '').trim().length > 0 ||
        (Array.isArray((userProfile as any)?.supportClubCodes) && (userProfile as any).supportClubCodes.length > 0) ||
        (Array.isArray((userProfile as any)?.supportGroupIds) && (userProfile as any).supportGroupIds.length > 0) ||
        (Array.isArray((userProfile as any)?.supportAthletes) && (userProfile as any).supportAthletes.length > 0) ||
        (Array.isArray((userProfile as any)?.supportFocuses) && (userProfile as any).supportFocuses.length > 0) ||
        userProfile?.category === 'support'
    );
    const authSubject = String(authBootstrap?.sub ?? user?.sub ?? '').trim().toLowerCase();
    const canChangePassword = !authSubject || authSubject.startsWith('auth0|');

    const settingsItems: SettingsItem[] = [
        {
            icon: <User size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('Name'),
            onPress: () => navigation.navigate('NameSettings'),
        },
        ...(canChangePassword ? [{
            icon: <Lock size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('Change Password'),
            onPress: () => navigation.navigate('ChangePassword'),
        }] : []),
        {
            icon: <User size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('Change Username'),
            onPress: () => navigation.navigate('ChangeUsername'),
        },
        {
            icon: <Card size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('Change Nationality'),
            onPress: () => navigation.navigate('ChangeNationality'),
        },
        {
            icon: <Calendar size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('Date of Birth'),
            onPress: () => navigation.navigate('DateOfBirth'),
        },
        ...(hasAthleteProfile ? [{
            icon: <Card size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('Athlete details'),
            onPress: () => navigation.navigate('AthleteDetailsHub'),
        }] : []),
        ...(hasSupportProfile ? [{
            icon: <User size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('Support details'),
            onPress: () => navigation.navigate('CompleteSupportDetailsScreen', { editMode: true }),
        }] : []),
        {
            icon: <Scan size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('Facial Recognition'),
            onPress: () => navigation.navigate('FacialRecognitionSettings'),
        },
        {
            icon: <User size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('Manage profiles'),
            onPress: () => navigation.navigate('ManageProfiles'),
        },
    ];

    return (
        <View style={Styles.mainContainer} testID="profile-settings-screen">
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Account Settings')}</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                {settingsItems.map((item, index) => (
                    <React.Fragment key={index}>
                        <TouchableOpacity style={Styles.accountSettingsCard} onPress={item.onPress}>
                            <View style={Styles.accountSettingsLeft}>
                                <View style={Styles.accountSettingsIconContainer}>
                                    {item.icon}
                                </View>
                                <SizeBox width={20} />
                                <View style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                                    <Text style={Styles.accountSettingsTitle} numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                </View>
                            </View>
                            <View style={Styles.accountSettingsArrowWrap}>
                                <ArrowRight2 size={24} color={colors.grayColor} variant="Linear" />
                            </View>
                        </TouchableOpacity>
                        {index < settingsItems.length - 1 && <SizeBox height={16} />}
                    </React.Fragment>
                ))}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default ProfileSettings
