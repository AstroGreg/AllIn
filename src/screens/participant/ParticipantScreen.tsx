import { FlatList, View, Text } from 'react-native'
import React, { useCallback } from 'react'
import { createStyles } from './ParticipantStyles';
import SizeBox from '../../constants/SizeBox';
import CustomHeader from '../../components/customHeader/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ParticipantContainer from './components/ParticipantContainer';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ParticipantScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);

    const openProfileFromId = useCallback((profileId?: string | null) => {
        const safeProfileId = String(profileId || '').trim();
        if (!safeProfileId) {
            navigation.navigate('BottomTabBar', { screen: 'Profile' });
            return;
        }
        navigation.navigate('ViewUserProfileScreen', { profileId: safeProfileId });
    }, [navigation]);

    const headerComponent = () => {
        return (
            <>
                <SizeBox height={24} />
                <Text style={styles.sportsName}>{t('800m')}</Text>
                <View style={styles.rowCenter}>
                    <Text style={styles.subSportsName}>{t('Beligian Championships 2024')}</Text>
                    <SizeBox height={2} />
                    <Text style={styles.subSportsName}>{t('1k +Participant')}</Text>
                </View>
                <SizeBox height={16} />
            </>
        )
    }

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title={t('Participant')} onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <FlatList
                data={['', '', '', '', '']}
                renderItem={() => <ParticipantContainer onPress={() => openProfileFromId()} />}
                keyExtractor={(item, index) => index.toString()}
                style={{ paddingHorizontal: 20, }}
                ListHeaderComponent={headerComponent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

export default ParticipantScreen
