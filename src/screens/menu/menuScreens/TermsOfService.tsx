import { Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, Notification } from 'iconsax-react-nativejs'
import { useTranslation } from 'react-i18next'

const TermsOfService = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    const thirdPartyLinks = [
        'Google Play Services',
        'Google Analytics for Firebase',
        'Firebase Crashlytics',
        'Facebook'
    ];

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Terms of Service')}</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                {/* Terms of Service Section */}
                <View style={Styles.termsSection}>
                    <Text style={Styles.termsSectionTitle}>{t('Terms of Service')}</Text>
                    <SizeBox height={12} />
                    <Text style={Styles.termsText}>
                        {t('These terms explain how SpotMe is provided, which features are available, and what is expected from users when uploading, buying, or sharing media.')}
                    </Text>
                    <SizeBox height={8} />
                    <Text style={Styles.termsText}>
                        {t('Third-party services used by the app may also apply their own terms and privacy rules.')}
                    </Text>
                    <SizeBox height={8} />
                    {thirdPartyLinks.map((link, index) => (
                        <Text key={index} style={Styles.termsLink}>
                            {'\u2022'} {link}
                        </Text>
                    ))}
                </View>

                <SizeBox height={24} />

                {/* Changes Section */}
                <View style={Styles.termsSection}>
                    <Text style={Styles.termsSectionTitle}>{t('Changes to This Terms and Conditions')}</Text>
                    <SizeBox height={12} />
                    <Text style={Styles.termsText}>
                        {t('We may update these terms when features, billing rules, or legal requirements change. Material updates should be reviewed before you continue using the app.')}
                    </Text>
                </View>

                <SizeBox height={24} />

                {/* Contact Us Section */}
                <View style={Styles.termsSection}>
                    <Text style={Styles.termsSectionTitle}>{t('Contact Us')}</Text>
                    <SizeBox height={12} />
                    <Text style={Styles.termsText}>
                        {t('If you have questions about these terms, billing, or privacy requests, contact the SpotMe support team through the help section in the app.')}
                    </Text>
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default TermsOfService
