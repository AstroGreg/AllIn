import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DatePicker from 'react-native-date-picker';
import {
    ArrowLeft2,
    Calendar,
    Clock,
    Note,
    Location,
    Edit2,
    ArrowDown2,
    ArrowRight,
    TickSquare,
} from 'iconsax-react-nativejs';
import Styles from './SentRequestStateScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';

const SentRequestStateScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [eventName, setEventName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [description, setDescription] = useState('');
    const [keepAsSent, setKeepAsSent] = useState(true);
    const [markAsNonIssue, setMarkAsNonIssue] = useState(false);

    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };


    const handleStatusChange = (status: 'sent' | 'nonIssue') => {
        if (status === 'sent') {
            setKeepAsSent(true);
            setMarkAsNonIssue(false);
        } else {
            setKeepAsSent(false);
            setMarkAsNonIssue(true);
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Sent Request State</Text>
                <TouchableOpacity
                    style={Styles.notificationButton}
                    onPress={() => navigation.navigate('NotificationsScreen')}
                >
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Request Summary */}
                <Text style={Styles.sectionTitle}>Request Summary</Text>
                <SizeBox height={16} />

                <View style={Styles.summaryCard}>
                    <Text style={Styles.summaryTitle}>Enhance Lighting & Colors</Text>
                    <View style={Styles.summaryMeta}>
                        <View style={Styles.metaItem}>
                            <Calendar size={12} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.metaText}>12.12.2024</Text>
                        </View>
                        <View style={Styles.metaItem}>
                            <Clock size={12} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.metaText}>12:00</Text>
                        </View>
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Edit Requested Comment */}
                <Text style={Styles.sectionTitle}>Edit Requested Comment</Text>
                <SizeBox height={16} />

                {/* Event Name */}
                <Text style={Styles.inputLabel}>Event Name</Text>
                <SizeBox height={8} />
                <View style={Styles.inputContainer}>
                    <Note size={16} color="#3C82F6" variant="Linear" />
                    <TextInput
                        style={Styles.textInput}
                        placeholder="Enter Event Name"
                        placeholderTextColor="#777777"
                        value={eventName}
                        onChangeText={setEventName}
                    />
                </View>

                <SizeBox height={16} />

                {/* Location */}
                <Text style={Styles.inputLabel}>Location</Text>
                <SizeBox height={8} />
                <View style={Styles.inputContainer}>
                    <Location size={16} color="#3C82F6" variant="Linear" />
                    <TextInput
                        style={Styles.textInput}
                        placeholder="Enter Location"
                        placeholderTextColor="#777777"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                <SizeBox height={16} />

                {/* Date */}
                <Text style={Styles.inputLabel}>Date</Text>
                <SizeBox height={8} />
                <TouchableOpacity
                    style={Styles.inputContainer}
                    onPress={() => setShowDatePicker(!showDatePicker)}
                >
                    <Calendar size={16} color="#3C82F6" variant="Linear" />
                    <Text style={[Styles.textInput, { color: date ? Colors.mainTextColor : '#777777' }]}>
                        {date ? formatDate(date) : 'Select Date'}
                    </Text>
                    <ArrowDown2 size={20} color="#9B9F9F" variant="Linear" />
                </TouchableOpacity>

                <DatePicker
                    modal
                    open={showDatePicker}
                    date={date || new Date()}
                    mode="date"
                    onConfirm={(selectedDate) => {
                        setShowDatePicker(false);
                        setDate(selectedDate);
                    }}
                    onCancel={() => setShowDatePicker(false)}
                />

                <SizeBox height={16} />

                {/* Description */}
                <Text style={Styles.inputLabel}>Description</Text>
                <SizeBox height={8} />
                <View style={Styles.textAreaContainer}>
                    <Edit2 size={16} color="#3C82F6" variant="Linear" />
                    <TextInput
                        style={Styles.textArea}
                        placeholder="Write Something....."
                        placeholderTextColor="#777777"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                <SizeBox height={24} />

                {/* Update Status */}
                <Text style={Styles.sectionTitle}>Update Status</Text>
                <SizeBox height={16} />

                <View style={Styles.statusRow}>
                    <TouchableOpacity
                        style={Styles.statusOption}
                        onPress={() => handleStatusChange('sent')}
                    >
                        <Text style={Styles.statusText}>Keep as Sent</Text>
                        <View style={[Styles.checkbox, keepAsSent && Styles.checkboxChecked]}>
                            {keepAsSent && <TickSquare size={16} color="#3C82F6" variant="Bold" />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={Styles.statusOption}
                        onPress={() => handleStatusChange('nonIssue')}
                    >
                        <Text style={Styles.statusText}>Mark as Non Issue</Text>
                        <View style={[Styles.checkbox, markAsNonIssue && Styles.checkboxChecked]}>
                            {markAsNonIssue && <TickSquare size={16} color="#3C82F6" variant="Bold" />}
                        </View>
                    </TouchableOpacity>
                </View>

                <SizeBox height={30} />

                {/* Bottom Actions */}
                <View style={Styles.bottomActions}>
                    <TouchableOpacity>
                        <Text style={Styles.deleteText}>Delete</Text>
                    </TouchableOpacity>

                    <View style={Styles.rightActions}>
                        <TouchableOpacity style={Styles.cancelButton} onPress={() => navigation.goBack()}>
                            <Text style={Styles.cancelButtonText}>Cancel</Text>
                            <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={Styles.submitButton}
                            onPress={() => navigation.navigate('ReceivedRequestStateScreen')}
                        >
                            <Text style={Styles.submitButtonText}>Submit</Text>
                            <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default SentRequestStateScreen;
