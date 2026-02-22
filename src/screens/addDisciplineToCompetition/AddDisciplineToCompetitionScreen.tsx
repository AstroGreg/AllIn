import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    AddSquare,
    CloseCircle,
    TickSquare,
    User,
} from 'iconsax-react-nativejs';
import { createStyles } from './AddDisciplineToCompetitionScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const AddToEventScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [chestNumber, setChestNumber] = useState('');
    const [selectedEvents, setSelectedEvents] = useState<string[]>(['100m', '200m']);
    const [showEventPicker, setShowEventPicker] = useState(false);
    const [eventSearch, setEventSearch] = useState('');
    const [useDefaultChest, setUseDefaultChest] = useState(true);

    const suggestedEvents = useMemo(
        () => ['60m', '100m', '200m', '400m', '800m', '1500m', '5K', '10K', 'Long jump', 'Shot put'],
        []
    );

    const eventData = route?.params?.event || {
        title: 'BK Studentent 23',
        date: '2 Nov, 2025',
        location: 'Berlin, Germany',
    };
    const defaultChestNumber = route?.params?.defaultChestNumber || '32';

    const addEvent = (value: string) => {
        const cleaned = value.trim();
        if (!cleaned) return;
        if (selectedEvents.includes(cleaned)) return;
        setSelectedEvents((prev) => [...prev, cleaned]);
    };

    const removeEvent = (value: string) => {
        setSelectedEvents((prev) => prev.filter((event) => event !== value));
    };

    const handleConfirm = () => {
        navigation.navigate('EventSummaryScreen', {
            event: eventData,
            personal: {
                name: 'James Ray',
                chestNumber: useDefaultChest ? defaultChestNumber : (chestNumber || defaultChestNumber),
                events: selectedEvents,
            },
        });
    };

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Subscribe')}</Text>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate('NotificationsScreen')}
                >
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Event Details Section */}
                <Text style={styles.sectionTitle}>{t('Event Details')}</Text>
                <SizeBox height={16} />

                <View style={styles.eventDetailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('Event Name')}</Text>
                        <Text style={styles.detailValue}>{eventData.title}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('Date')}</Text>
                        <Text style={styles.detailValue}>{eventData.date}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('Location')}</Text>
                        <Text style={styles.detailValue}>{eventData.location}</Text>
                    </View>
                </View>

                <SizeBox height={40} />

                {/* Events Selection */}
                <Text style={styles.descriptionText}>
                    {t('Select the event types you participated in.')}
                </Text>
                <SizeBox height={12} />

                <Text style={styles.inputLabel}>{t('Events')}</Text>
                <SizeBox height={8} />

                <View style={styles.eventsInputContainer}>
                    <View style={styles.eventChipsContainer}>
                        {selectedEvents.map((event, index) => (
                            <TouchableOpacity
                                key={`${event}-${index}`}
                                style={styles.eventChip}
                                onPress={() => removeEvent(event)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.eventChipText}>{event}</Text>
                                <CloseCircle size={14} color={colors.grayColor} variant="Linear" />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={styles.addEventIconButton}
                        onPress={() => setShowEventPicker((prev) => !prev)}
                        activeOpacity={0.8}
                    >
                        <AddSquare size={20} color={colors.primaryColor} variant="Linear" />
                    </TouchableOpacity>
                </View>

                {showEventPicker && (
                    <View style={styles.eventPicker}>
                        <Text style={styles.eventPickerTitle}>{t('Select disciplines')}</Text>
                        <View style={styles.eventPickerGrid}>
                            {suggestedEvents.map((item) => {
                                const isSelected = selectedEvents.includes(item);
                                return (
                                    <TouchableOpacity
                                        key={item}
                                        style={[styles.suggestionChip, isSelected && styles.suggestionChipActive]}
                                        onPress={() => addEvent(item)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.suggestionText, isSelected && styles.suggestionTextActive]}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                <SizeBox height={16} />

                {/* Chest Number Input */}
                <Text style={styles.inputLabelBold}>{t('Chest Number')}</Text>
                <SizeBox height={8} />

                <View style={styles.chestNumberInput}>
                    <User size={16} color={colors.subTextColor} variant="Linear" />
                    <TextInput
                        style={styles.textInput}
                        placeholder={t('Enter Chest Number')}
                        placeholderTextColor={colors.grayColor}
                        value={chestNumber}
                        onChangeText={setChestNumber}
                        editable={!useDefaultChest}
                    />
                </View>
                <TouchableOpacity
                    style={styles.defaultChestRow}
                    onPress={() => setUseDefaultChest((prev) => !prev)}
                    activeOpacity={0.8}
                >
                    <View style={[styles.defaultChestBox, useDefaultChest && styles.defaultChestBoxActive]}>
                        {useDefaultChest && <TickSquare size={14} color={colors.pureWhite} variant="Bold" />}
                    </View>
                    <Text style={styles.defaultChestText}>
                        {t('Use default number')} ({defaultChestNumber})
                    </Text>
                </TouchableOpacity>

                <SizeBox height={40} />
            </ScrollView>

            {/* Confirm Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                    <Text style={styles.confirmButtonText}>{t('Continue')}</Text>
                </TouchableOpacity>
                <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
            </View>
        </View>
    );
};

export default AddToEventScreen;
