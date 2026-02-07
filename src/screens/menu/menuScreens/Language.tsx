import { Text, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MenuContainers from '../components/MenuContainers'
import Icons from '../../../constants/Icons'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, Notification, LanguageCircle } from 'iconsax-react-nativejs'

const Language = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [language, setLanguage] = useState('dt');

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Menu</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <View style={Styles.container}>
                <SizeBox height={24} />
                <Text style={Styles.sectionTitle}>Language</Text>
                <SizeBox height={16} />
                <MenuContainers
                    icon={<LanguageCircle size={20} color={colors.primaryColor} variant="Linear" />}
                    title='Dutch'
                    onPress={() => setLanguage('dt')}
                    isNext={false}
                    isSelected={language === 'dt'}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.EnglishBlueCircle height={20} width={20} />}
                    title='English'
                    onPress={() => setLanguage('en')}
                    isNext={false}
                    isSelected={language === 'en'}
                />
            </View>
        </View>
    )
}

export default Language
