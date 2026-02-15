import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { createStyles } from './UploadStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { Clock } from 'iconsax-react-nativejs';

const UploadScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();

    const handleUploadAnonymously = () => {
        navigation.navigate('SelectCompetitionScreen', { anonymous: true });
    };

    const handleUpload = () => {
        navigation.navigate('SelectCompetitionScreen', { anonymous: false });
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={[Styles.header, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                <View style={{ width: 36 }} />
                <Text style={Styles.headerTitle}>{t('Upload')}</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('UploadActivityScreen')}
                    style={{ width: 36, alignItems: 'flex-end' }}
                    activeOpacity={0.8}
                >
                    <Clock size={22} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={Styles.scrollContent}
            >
                {/* Tip Card */}
                <View style={Styles.tipCard}>
                    <Icons.LightbulbColorful width={90} height={90} />
                    <SizeBox height={14} />
                    <Text style={Styles.tipText}>{t('Choose how you want to upload')}</Text>
                </View>

                <SizeBox height={16} />

                {/* Upload Button */}
                <TouchableOpacity
                    style={Styles.createAccountButton}
                    onPress={handleUpload}
                >
                    <Text style={Styles.createAccountButtonText}>{t('Upload')}</Text>
                </TouchableOpacity>

                <SizeBox height={20} />

                {/* Upload Anonymously Button */}
                <TouchableOpacity
                    style={Styles.anonymousButton}
                    onPress={handleUploadAnonymously}
                >
                    <Text style={Styles.anonymousButtonText}>{t('Upload anonymously')}</Text>
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default UploadScreen;
