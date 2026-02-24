import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox'
import CustomButton from '../../../components/customButton/CustomButton'
import { createStyles } from './LanguageScreenStyles'
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const LanguageScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors, mode, setTheme } = useTheme();
    const Styles = createStyles(colors);
    const renderRadio = (selected: boolean) => (
        <View style={[Styles.radioOuter, selected && Styles.radioOuterSelected]}>
            {selected ? <View style={Styles.radioInner} /> : null}
        </View>
    );
    return (
        <View style={Styles.mainContainer}>
            <View style={Styles.contentContainer}>
                <Text style={Styles.headingText}>{t('appearance')}</Text>
                <SizeBox height={8} />
                <Text style={Styles.subHeadingText}>
                    {t('Choose your preferred appearance mode to continue.')}
                </Text>
                <SizeBox height={40} />

                <View style={Styles.optionsContainer}>
                    <TouchableOpacity
                        style={[Styles.optionItem, mode === 'light' && Styles.optionItemSelected]}
                        activeOpacity={0.7}
                        onPress={() => setTheme('light')}
                    >
                        <Text style={[Styles.optionText, mode !== 'light' && Styles.optionTextUnselected]}>
                            {t('lightMode')}
                        </Text>
                        {renderRadio(mode === 'light')}
                    </TouchableOpacity>

                    <SizeBox height={14} />

                    <TouchableOpacity
                        style={[Styles.optionItem, mode === 'dark' && Styles.optionItemSelected]}
                        activeOpacity={0.7}
                        onPress={() => setTheme('dark')}
                    >
                        <Text style={[Styles.optionText, mode !== 'dark' && Styles.optionTextUnselected]}>
                            {t('darkMode')}
                        </Text>
                        {renderRadio(mode === 'dark')}
                    </TouchableOpacity>
                </View>

                <SizeBox height={40} />
                <CustomButton title={t('continue')} onPress={() => navigation.navigate('LoginScreen')} />

            </View>
        </View>
    )
}

export default LanguageScreen
