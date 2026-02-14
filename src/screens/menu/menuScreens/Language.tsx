import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MenuContainers from '../components/MenuContainers'
import Icons from '../../../constants/Icons'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, LanguageCircle } from 'iconsax-react-nativejs'
import { useTranslation } from 'react-i18next'
import i18n from '../../../i18n'
import { getLanguageOptions, setAppLanguage } from '../../../i18n'

const Language = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const languages = getLanguageOptions();
    const currentLanguage = i18n.language ?? 'en';

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('language')}</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <View style={Styles.container}>
                <SizeBox height={24} />
                <Text style={Styles.sectionTitle}>{t('chooseLanguage')}</Text>
                <SizeBox height={16} />
                {languages.map((lang) => (
                    <React.Fragment key={lang.code}>
                        <MenuContainers
                            icon={lang.code === 'en' ? <Icons.EnglishBlueCircle height={20} width={20} /> : <LanguageCircle size={20} color={colors.primaryColor} variant="Linear" />}
                            title={lang.label}
                            onPress={() => setAppLanguage(lang.code)}
                            isNext={false}
                            isSelected={currentLanguage === lang.code}
                        />
                        <SizeBox height={12} />
                    </React.Fragment>
                ))}
            </View>
        </View>
    )
}

export default Language
