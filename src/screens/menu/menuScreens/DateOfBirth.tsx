import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, Notification, Calendar, ArrowDown2, ArrowRight2 } from 'iconsax-react-nativejs'
import DatePicker from 'react-native-date-picker'

const DateOfBirth = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
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

    const [activePicker, setActivePicker] = useState<'current' | 'new' | null>(null);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Date of Birth</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
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
                        onPress={() => { setShowCurrentDatePicker(true); setActivePicker('current'); }}
                    >
                        <Calendar size={16} color={colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <Text style={[Styles.addCardPlaceholder, currentDate && Styles.addCardInputText]}>
                            {formatDate(currentDate)}
                        </Text>
                        <ArrowDown2 size={20} color={colors.grayColor} variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={30} />

                {/* New Date of Birth */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>New Date of Birth</Text>
                    <SizeBox height={8} />
                    <TouchableOpacity
                        style={Styles.addCardInputContainer}
                        onPress={() => { setShowNewDatePicker(true); setActivePicker('new'); }}
                    >
                        <Calendar size={16} color={colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <Text style={[Styles.addCardPlaceholder, newDate && Styles.addCardInputText]}>
                            {formatDate(newDate)}
                        </Text>
                        <ArrowDown2 size={20} color={colors.grayColor} variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={30} />

                {/* Continue Button */}
                <TouchableOpacity style={Styles.continueBtn} onPress={() => navigation.goBack()}>
                    <Text style={Styles.continueBtnText}>Continue</Text>
                    <ArrowRight2 size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            <DatePicker
                modal
                open={activePicker === 'current'}
                date={currentDate || new Date(2000, 0, 1)}
                mode="date"
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                title="Select current date of birth"
                onConfirm={(date) => {
                    setActivePicker(null);
                    setShowCurrentDatePicker(false);
                    setCurrentDate(date);
                }}
                onCancel={() => {
                    setActivePicker(null);
                    setShowCurrentDatePicker(false);
                }}
            />

            <DatePicker
                modal
                open={activePicker === 'new'}
                date={newDate || new Date(2000, 0, 1)}
                mode="date"
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                title="Select new date of birth"
                onConfirm={(date) => {
                    setActivePicker(null);
                    setShowNewDatePicker(false);
                    setNewDate(date);
                }}
                onCancel={() => {
                    setActivePicker(null);
                    setShowNewDatePicker(false);
                }}
            />
        </View>
    )
}

export default DateOfBirth
