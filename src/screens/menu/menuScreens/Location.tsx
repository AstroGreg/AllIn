import { Text, View, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, Notification, Location as LocationIcon } from 'iconsax-react-nativejs'
import { useTranslation } from 'react-i18next'

const Location = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [location, setLocation] = useState('');

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Menu')}</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <View style={Styles.container}>
                <SizeBox height={24} />
                <Text style={Styles.sectionTitle}>{t('Location')}</Text>
                <SizeBox height={16} />
                <View style={Styles.locationInputContainer}>
                    <LocationIcon size={20} color={colors.primaryColor} variant="Linear" />
                    <SizeBox width={10} />
                    <TextInput
                        style={Styles.locationInput}
                        placeholder={t('Enter your location')}
                        placeholderTextColor={colors.grayColor}
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>
            </View>
        </View>
    )
}

export default Location