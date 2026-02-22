import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    ArrowRight,
} from 'iconsax-react-nativejs';
import { createStyles } from './CompetitionSummaryScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const EventSummaryScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const hasClickedOnce = useRef(false);
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();

    const eventData = route?.params?.event || {
        title: 'BK Studentent 23',
        date: '2 Nov, 2025',
        location: 'Berlin, Germany',
    };

    const personalData = route?.params?.personal || {
        name: 'James Ray',
        chestNumber: '32',
        events: ['100m', '200m'],
        categories: ['Senior'],
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleConfirmAndJoin = () => {
        if (hasClickedOnce.current) {
            // Second click - show failed screen
            navigation.navigate('FailedScreen', { eventName: eventData.title });
        } else {
            // First click - show congratulations screen
            hasClickedOnce.current = true;
            navigation.navigate('CongratulationsScreen');
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Summary')}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Event Details Section */}
                <Text style={Styles.sectionTitle}>{t('Event details')}</Text>
                <SizeBox height={16} />

                <View style={Styles.detailsCard}>
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>{t('Event name')}</Text>
                        <Text style={Styles.detailValue}>{eventData.title}</Text>
                    </View>
                    <View style={Styles.divider} />
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>{t('Date')}</Text>
                        <Text style={Styles.detailValue}>{eventData.date}</Text>
                    </View>
                    <View style={Styles.divider} />
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>{t('Location')}</Text>
                        <Text style={Styles.detailValue}>{eventData.location}</Text>
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Personal Details Section */}
                <Text style={Styles.sectionTitle}>{t('Personal details')}</Text>
                <SizeBox height={16} />

                <View style={Styles.detailsCard}>
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>{t('Name')}</Text>
                        <Text style={Styles.detailValue}>{personalData.name}</Text>
                    </View>
                    <View style={Styles.divider} />
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>{t('Chest number')}</Text>
                        <Text style={Styles.detailValue}>{personalData.chestNumber}</Text>
                    </View>
                    <View style={Styles.divider} />
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>{t('Events')}</Text>
                        <View style={Styles.eventChipsContainer}>
                            {personalData.events.map((event: string, index: number) => (
                                <View key={index} style={Styles.eventChip}>
                                    <Text style={Styles.eventChipText}>{event}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    {Array.isArray(personalData.categories) && personalData.categories.length > 0 && (
                        <>
                            <View style={Styles.divider} />
                            <View style={Styles.detailRow}>
                                <Text style={Styles.detailLabel}>{t('Notifications')}</Text>
                                <View style={Styles.eventChipsContainer}>
                                    {personalData.categories.map((category: string, index: number) => (
                                        <View key={`${category}-${index}`} style={Styles.eventChip}>
                                            <Text style={Styles.eventChipText}>{category}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}
                </View>

                <SizeBox height={48} />

                {/* Bottom Buttons */}
                <View style={Styles.bottomButtons}>
                    <TouchableOpacity style={Styles.cancelButton} onPress={handleCancel}>
                        <Text style={Styles.cancelButtonText}>{t('Cancel')}</Text>
                        <ArrowRight size={18} color={colors.subTextColor} variant="Linear" />
                    </TouchableOpacity>

                    <TouchableOpacity style={Styles.confirmButton} onPress={handleConfirmAndJoin}>
                        <Text style={Styles.confirmButtonText}>{t('Confirm & join')}</Text>
                        <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
            </ScrollView>
        </View>
    );
};

export default EventSummaryScreen;
