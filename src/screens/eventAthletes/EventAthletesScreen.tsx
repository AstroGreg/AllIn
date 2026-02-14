import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './EventAthletesStyles';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const EventAthletesScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const event = route?.params?.event || { title: t('City Run Marathon') };

    const athletes = [
        { id: 1, name: 'James Ray', eventType: 'Half Marathon' },
        { id: 2, name: 'Jhon Smith', eventType: 'Marathon' },
    ];

    const renderAthleteRow = (athlete: any) => (
        <View key={athlete.id} style={styles.athleteRow}>
            <FastImage source={Images.profilePic} style={styles.athleteAvatar} resizeMode="cover" />
            <Text style={styles.athleteName}>{athlete.name}</Text>
            <Text style={styles.athleteEventType}>{athlete.eventType}</Text>
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Athletes is Participating')}</Text>
                <View style={styles.headerButtonPlaceholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Competition Title */}
                <Text style={styles.competitionTitle}>{t('Competition')}: {event.title}</Text>

                {/* Athletes Section */}
                <Text style={styles.athletesSectionTitle}>{t('Athletes')}</Text>

                <View style={styles.athletesCard}>
                    {athletes.map(renderAthleteRow)}
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default EventAthletesScreen;
