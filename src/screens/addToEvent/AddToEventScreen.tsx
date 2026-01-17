import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    ArrowRight,
    AddSquare,
    User,
} from 'iconsax-react-nativejs';
import Styles from './AddToEventScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';

const AddToEventScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const [chestNumber, setChestNumber] = useState('');
    const [selectedEvents, setSelectedEvents] = useState(['100m', '200m']);

    const eventData = route?.params?.event || {
        title: 'BK Studentent 23',
        date: '2 Nov, 2025',
        location: 'Berlin, Germany',
    };

    const handleConfirm = () => {
        navigation.navigate('EventSummaryScreen', {
            event: eventData,
            personal: {
                name: 'James Ray',
                chestNumber: chestNumber || '32',
                events: selectedEvents,
            }
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
                <Text style={Styles.headerTitle}>Add to Event</Text>
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
                    Select all the event you participated in.{'\n'}
                    You will be notify when someone upload a video..
                </Text>
                <SizeBox height={12} />

                <Text style={Styles.inputLabel}>Events</Text>
                <SizeBox height={8} />

                <View style={Styles.eventsInputContainer}>
                    <View style={Styles.eventChipsContainer}>
                        {selectedEvents.map((event, index) => (
                            <View key={index} style={Styles.eventChip}>
                                <Text style={Styles.eventChipText}>{event}</Text>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity>
                        <AddSquare size={20} color={Colors.primaryColor} variant="Linear" />
                    </TouchableOpacity>
                </View>

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
                    />
                </View>

                <SizeBox height={40} />
            </ScrollView>

            {/* Confirm Button */}
            <View style={Styles.bottomContainer}>
                <TouchableOpacity style={Styles.confirmButton} onPress={handleConfirm}>
                    <Text style={Styles.confirmButtonText}>Confirm</Text>
                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
                <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
            </View>
        </View>
    );
};

export default AddToEventScreen;
