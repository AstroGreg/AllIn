import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyles } from './UploadAnonymouslyStyles'
import SizeBox from '../../constants/SizeBox'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const UploadAnonymouslyScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    const handleNice = () => {
        navigation.navigate('SelectCompetitionScreen', { anonymous: true });
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <Text style={Styles.headerTitle}>{t('Upload')}</Text>
            </View>

            {/* Content */}
            <View style={Styles.content}>
                {/* Info Card */}
                <View style={Styles.infoCard}>
                    <Icons.LightbulbColorful width={90} height={90} />
                    <SizeBox height={14} />
                    <Text style={Styles.infoText}>
                        You'll upload anonymously, while we keep an internal record so you still receive 100% of the profits from your video.
                    </Text>
                </View>
            </View>

            {/* Nice Button */}
            <View style={Styles.bottomContainer}>
                <TouchableOpacity style={Styles.niceButton} onPress={handleNice}>
                    <Text style={Styles.niceButtonText}>{t('Nice')}</Text>
                </TouchableOpacity>
                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </View>
        </View>
    );
};

export default UploadAnonymouslyScreen;