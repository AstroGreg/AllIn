import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native'
import React, { useState } from 'react'
import Styles from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../../../constants/Colors'
import { ArrowLeft2, Notification, Calendar, ArrowDown2, ArrowRight2 } from 'iconsax-react-nativejs'
import DateTimePicker from '@react-native-community/datetimepicker'

const DateOfBirth = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [currentDate, setCurrentDate] = useState<Date | null>(null);
    const [newDate, setNewDate] = useState<Date | null>(null);
    const [showCurrentDatePicker, setShowCurrentDatePicker] = useState(false);
    const [showNewDatePicker, setShowNewDatePicker] = useState(false);

    const formatDate = (date: Date | null) => {
        if (!date) return 'Select Date';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const onCurrentDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowCurrentDatePicker(false);
        }
        if (selectedDate) {
            setCurrentDate(selectedDate);
        }
    };

    const onNewDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowNewDatePicker(false);
        }
        if (selectedDate) {
            setNewDate(selectedDate);
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Date of Birth</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.changePasswordTitle}>Date of Birth</Text>
                <SizeBox height={16} />

                {/* Current Date of Birth */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>Current Date of Birth</Text>
                    <SizeBox height={8} />
                    <TouchableOpacity
                        style={Styles.addCardInputContainer}
                        onPress={() => setShowCurrentDatePicker(true)}
                    >
                        <Calendar size={16} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <Text style={[Styles.addCardPlaceholder, currentDate && Styles.addCardInputText]}>
                            {formatDate(currentDate)}
                        </Text>
                        <ArrowDown2 size={20} color="#777777" variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={30} />

                {/* New Date of Birth */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>New Date of Birth</Text>
                    <SizeBox height={8} />
                    <TouchableOpacity
                        style={Styles.addCardInputContainer}
                        onPress={() => setShowNewDatePicker(true)}
                    >
                        <Calendar size={16} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <Text style={[Styles.addCardPlaceholder, newDate && Styles.addCardInputText]}>
                            {formatDate(newDate)}
                        </Text>
                        <ArrowDown2 size={20} color="#777777" variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={30} />

                {/* Continue Button */}
                <TouchableOpacity style={Styles.continueBtn} onPress={() => navigation.goBack()}>
                    <Text style={Styles.continueBtnText}>Continue</Text>
                    <ArrowRight2 size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            {/* Current Date Picker */}
            {showCurrentDatePicker && (
                Platform.OS === 'ios' ? (
                    <View style={Styles.datePickerContainer}>
                        <View style={Styles.datePickerHeader}>
                            <TouchableOpacity onPress={() => setShowCurrentDatePicker(false)}>
                                <Text style={Styles.datePickerCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowCurrentDatePicker(false)}>
                                <Text style={Styles.datePickerDone}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            value={currentDate || new Date()}
                            mode="date"
                            display="spinner"
                            onChange={onCurrentDateChange}
                            maximumDate={new Date()}
                        />
                    </View>
                ) : (
                    <DateTimePicker
                        value={currentDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={onCurrentDateChange}
                        maximumDate={new Date()}
                    />
                )
            )}

            {/* New Date Picker */}
            {showNewDatePicker && (
                Platform.OS === 'ios' ? (
                    <View style={Styles.datePickerContainer}>
                        <View style={Styles.datePickerHeader}>
                            <TouchableOpacity onPress={() => setShowNewDatePicker(false)}>
                                <Text style={Styles.datePickerCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowNewDatePicker(false)}>
                                <Text style={Styles.datePickerDone}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            value={newDate || new Date()}
                            mode="date"
                            display="spinner"
                            onChange={onNewDateChange}
                            maximumDate={new Date()}
                        />
                    </View>
                ) : (
                    <DateTimePicker
                        value={newDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={onNewDateChange}
                        maximumDate={new Date()}
                    />
                )
            )}
        </View>
    )
}

export default DateOfBirth
