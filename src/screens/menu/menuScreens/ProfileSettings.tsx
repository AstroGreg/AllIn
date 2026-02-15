import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, Lock, User, Card, Calendar, ArrowRight2, Scan } from 'iconsax-react-nativejs'
import { useTranslation } from 'react-i18next'

interface SettingsItem {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
}

const ProfileSettings = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    const settingsItems: SettingsItem[] = [
        {
            icon: <Lock size={20} color={colors.primaryColor} variant="Linear" />,
            title: 'Change Password',
            onPress: () => navigation.navigate('ChangePassword'),
        },
        {
            icon: <User size={20} color={colors.primaryColor} variant="Linear" />,
            title: 'Change Username',
            onPress: () => navigation.navigate('ChangeUsername'),
        },
        {
            icon: <Card size={20} color={colors.primaryColor} variant="Linear" />,
            title: 'Change Nationality',
            onPress: () => navigation.navigate('ChangeNationality'),
        },
        {
            icon: <Calendar size={20} color={colors.primaryColor} variant="Linear" />,
            title: 'Date of Birth',
            onPress: () => navigation.navigate('DateOfBirth'),
        },
        {
            icon: <Scan size={20} color={colors.primaryColor} variant="Linear" />,
            title: 'Facial Recognition',
            onPress: () => navigation.navigate('FacialRecognitionSettings'),
        },
    ];

    return (
        <View style={Styles.mainContainer}>
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
                                <Text style={Styles.accountSettingsTitle}>{item.title}</Text>
                            </View>
                            <ArrowRight2 size={24} color={colors.grayColor} variant="Linear" />
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