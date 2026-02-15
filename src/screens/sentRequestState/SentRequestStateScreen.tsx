import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { createStyles } from './SentRequestStateScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const SentRequestStateScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
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

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (event.type === 'set' && selectedDate) {
            setDate(selectedDate);
        }
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
                    <ArrowLeft2 size={20} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Sent request state')}</Text>
                <TouchableOpacity
                    style={Styles.notificationButton}
                    onPress={() => navigation.navigate('NotificationsScreen')}
                >
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Request Summary */}
                <Text style={Styles.sectionTitle}>{t('Request summary')}</Text>
                <SizeBox height={16} />

                <View style={Styles.summaryCard}>
                    <Text style={Styles.summaryTitle}>{t('Enhance lighting & colors')}</Text>
                    <View style={Styles.summaryMeta}>
                        <View style={Styles.metaItem}>
                            <Calendar size={12} color={colors.subTextColor} variant="Linear" />
                            <Text style={Styles.metaText}>12.12.2024</Text>
                        </View>
                        <View style={Styles.metaItem}>
                            <Clock size={12} color={colors.subTextColor} variant="Linear" />
                            <Text style={Styles.metaText}>12:00</Text>
                        </View>
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Edit Requested Comment */}
                <Text style={Styles.sectionTitle}>{t('Edit requested comment')}</Text>
                <SizeBox height={16} />

                {/* Event Name */}
                <Text style={Styles.inputLabel}>{t('Event name')}</Text>
                <SizeBox height={8} />
                <View style={Styles.inputContainer}>
                    <Note size={16} color={colors.primaryColor} variant="Linear" />
                    <TextInput
                        style={Styles.textInput}
                        placeholder={t('Enter event name')}
                        placeholderTextColor={colors.grayColor}
                        value={eventName}
                        onChangeText={setEventName}
                    />
                </View>

                <SizeBox height={16} />

                {/* Location */}
                <Text style={Styles.inputLabel}>{t('Location')}</Text>
                <SizeBox height={8} />
                <View style={Styles.inputContainer}>
                    <Location size={16} color={colors.primaryColor} variant="Linear" />
                    <TextInput
                        style={Styles.textInput}
                        placeholder={t('Enter location')}
                        placeholderTextColor={colors.grayColor}
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                <SizeBox height={16} />

                {/* Date */}
                <Text style={Styles.inputLabel}>{t('Date')}</Text>
                <SizeBox height={8} />
                <TouchableOpacity
                    style={Styles.inputContainer}
                    onPress={() => setShowDatePicker(!showDatePicker)}
                >
                    <Calendar size={16} color={colors.primaryColor} variant="Linear" />
                    <Text style={[Styles.textInput, { color: date ? colors.mainTextColor : colors.grayColor }]}>
                        {date ? formatDate(date) : t('Select date')}
                    </Text>
                    <ArrowDown2 size={20} color={colors.subTextColor} variant="Linear" />
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                    />
                )}

                <SizeBox height={16} />

                {/* Description */}
                <Text style={Styles.inputLabel}>{t('Description')}</Text>
                <SizeBox height={8} />
                <View style={Styles.textAreaContainer}>
                    <Edit2 size={16} color={colors.primaryColor} variant="Linear" />
                    <TextInput
                        style={Styles.textArea}
                        placeholder={t('Write something...')}
                        placeholderTextColor={colors.grayColor}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                <SizeBox height={24} />

                {/* Update Status */}
                <Text style={Styles.sectionTitle}>{t('Update status')}</Text>
                <SizeBox height={16} />

                <View style={Styles.statusRow}>
                    <TouchableOpacity
                        style={Styles.statusOption}
                        onPress={() => handleStatusChange('sent')}
                    >
                        <Text style={Styles.statusText}>{t('Keep as sent')}</Text>
                        <View style={[Styles.checkbox, keepAsSent && Styles.checkboxChecked]}>
                            {keepAsSent && <TickSquare size={16} color={colors.primaryColor} variant="Bold" />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={Styles.statusOption}
                        onPress={() => handleStatusChange('nonIssue')}
                    >
                        <Text style={Styles.statusText}>{t('Mark as non issue')}</Text>
                        <View style={[Styles.checkbox, markAsNonIssue && Styles.checkboxChecked]}>
                            {markAsNonIssue && <TickSquare size={16} color={colors.primaryColor} variant="Bold" />}
                        </View>
                    </TouchableOpacity>
                </View>

                <SizeBox height={30} />

                {/* Bottom Actions */}
                <View style={Styles.bottomActions}>
                    <TouchableOpacity>
                        <Text style={Styles.deleteText}>{t('Delete')}</Text>
                    </TouchableOpacity>

                    <View style={Styles.rightActions}>
                        <TouchableOpacity style={Styles.cancelButton} onPress={() => navigation.goBack()}>
                            <Text style={Styles.cancelButtonText}>{t('Cancel')}</Text>
                            <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={Styles.submitButton}
                            onPress={() => navigation.navigate('ReceivedRequestStateScreen')}
                        >
                            <Text style={Styles.submitButtonText}>{t('Submit')}</Text>
                            <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default SentRequestStateScreen;