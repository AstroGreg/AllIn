import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    ArrowRight,
} from 'iconsax-react-nativejs';
import Styles from './EventSummaryScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';

const EventSummaryScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const hasClickedOnce = useRef(false);

    const eventData = route?.params?.event || {
        title: 'BK Studentent 23',
        date: '2 Nov, 2025',
        location: 'Berlin, Germany',
    };

    const personalData = route?.params?.personal || {
        name: 'James Ray',
        chestNumber: '32',
        events: ['100m', '200m'],
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
                    <ArrowLeft2 size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Summary</Text>
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

                <View style={Styles.detailsCard}>
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

                <SizeBox height={24} />

                {/* Personal Details Section */}
                <Text style={Styles.sectionTitle}>Personal Details</Text>
                <SizeBox height={16} />

                <View style={Styles.detailsCard}>
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>Name</Text>
                        <Text style={Styles.detailValue}>{personalData.name}</Text>
                    </View>
                    <View style={Styles.divider} />
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>Chest Number</Text>
                        <Text style={Styles.detailValue}>{personalData.chestNumber}</Text>
                    </View>
                    <View style={Styles.divider} />
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>Events</Text>
                        <View style={Styles.eventChipsContainer}>
                            {personalData.events.map((event: string, index: number) => (
                                <View key={index} style={Styles.eventChip}>
                                    <Text style={Styles.eventChipText}>{event}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                <SizeBox height={48} />

                {/* Bottom Buttons */}
                <View style={Styles.bottomButtons}>
                    <TouchableOpacity style={Styles.cancelButton} onPress={handleCancel}>
                        <Text style={Styles.cancelButtonText}>Cancel</Text>
                        <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                    </TouchableOpacity>

                    <TouchableOpacity style={Styles.confirmButton} onPress={handleConfirmAndJoin}>
                        <Text style={Styles.confirmButtonText}>Confirm & Join</Text>
                        <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
            </ScrollView>
        </View>
    );
};

export default EventSummaryScreen;
