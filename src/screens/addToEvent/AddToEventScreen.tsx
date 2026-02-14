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
import Styles from './AddToEventScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';

const AddToEventScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
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
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Subscribe</Text>
                <TouchableOpacity
                    style={Styles.notificationButton}
                    onPress={() => navigation.navigate('NotificationsScreen')}
                >
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Event Details Section */}
                <Text style={Styles.sectionTitle}>Event Details</Text>
                <SizeBox height={16} />

                <View style={Styles.eventDetailsCard}>
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>Event Name</Text>
                        <Text style={Styles.detailValue}>{eventData.title}</Text>
                    </View>
                    <View style={Styles.divider} />
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>Date</Text>
                        <Text style={Styles.detailValue}>{eventData.date}</Text>
                    </View>
                    <View style={Styles.divider} />
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>Location</Text>
                        <Text style={Styles.detailValue}>{eventData.location}</Text>
                    </View>
                </View>

                <SizeBox height={40} />

                {/* Events Selection */}
                <Text style={Styles.descriptionText}>
                    Select the event types you participated in.
                </Text>
                <SizeBox height={12} />

                <Text style={Styles.inputLabel}>Events</Text>
                <SizeBox height={8} />

                <View style={Styles.eventsInputContainer}>
                    <View style={Styles.eventChipsContainer}>
                        {selectedEvents.map((event, index) => (
                            <TouchableOpacity
                                key={`${event}-${index}`}
                                style={Styles.eventChip}
                                onPress={() => removeEvent(event)}
                                activeOpacity={0.8}
                            >
                                <Text style={Styles.eventChipText}>{event}</Text>
                                <CloseCircle size={14} color={Colors.grayColor} variant="Linear" />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={Styles.addEventIconButton}
                        onPress={() => setShowEventPicker((prev) => !prev)}
                        activeOpacity={0.8}
                    >
                        <AddSquare size={20} color={Colors.primaryColor} variant="Linear" />
                    </TouchableOpacity>
                </View>

                {showEventPicker && (
                    <View style={Styles.eventPicker}>
                        <Text style={Styles.eventPickerTitle}>Select disciplines</Text>
                        <View style={Styles.eventPickerGrid}>
                            {suggestedEvents.map((item) => {
                                const isSelected = selectedEvents.includes(item);
                                return (
                                    <TouchableOpacity
                                        key={item}
                                        style={[Styles.suggestionChip, isSelected && Styles.suggestionChipActive]}
                                        onPress={() => addEvent(item)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[Styles.suggestionText, isSelected && Styles.suggestionTextActive]}>
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
                <Text style={Styles.inputLabelBold}>Chest Number</Text>
                <SizeBox height={8} />

                <View style={Styles.chestNumberInput}>
                    <User size={16} color="#9B9F9F" variant="Linear" />
                    <TextInput
                        style={Styles.textInput}
                        placeholder="Enter Chest Number"
                        placeholderTextColor="#777777"
                        value={chestNumber}
                        onChangeText={setChestNumber}
                        editable={!useDefaultChest}
                    />
                </View>
                <TouchableOpacity
                    style={Styles.defaultChestRow}
                    onPress={() => setUseDefaultChest((prev) => !prev)}
                    activeOpacity={0.8}
                >
                    <View style={[Styles.defaultChestBox, useDefaultChest && Styles.defaultChestBoxActive]}>
                        {useDefaultChest && <TickSquare size={14} color={Colors.whiteColor} variant="Bold" />}
                    </View>
                    <Text style={Styles.defaultChestText}>Use default number ({defaultChestNumber})</Text>
                </TouchableOpacity>

                <SizeBox height={40} />
            </ScrollView>

            {/* Confirm Button */}
            <View style={Styles.bottomContainer}>
                <TouchableOpacity style={Styles.confirmButton} onPress={handleConfirm}>
                    <Text style={Styles.confirmButtonText}>Continue</Text>
                </TouchableOpacity>
                <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
            </View>
        </View>
    );
};

export default AddToEventScreen;
