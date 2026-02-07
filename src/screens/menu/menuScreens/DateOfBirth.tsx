import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { useAuth } from '../../../context/AuthContext'
import { ArrowLeft2, Notification, Calendar, ArrowDown2, ArrowRight2 } from 'iconsax-react-nativejs'
import DatePicker from 'react-native-date-picker'

const DateOfBirth = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { userProfile, updateUserProfile } = useAuth();
    const [newDate, setNewDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const formatDate = (date: Date | null) => {
        if (!date) return 'Select Date';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleSave = async () => {
        if (!newDate) {
            Alert.alert('Error', 'Please select a new date of birth.');
            return;
        }

        setIsLoading(true);
        try {
            const day = String(newDate.getDate()).padStart(2, '0');
            const month = String(newDate.getMonth() + 1).padStart(2, '0');
            const year = newDate.getFullYear();
            await updateUserProfile({ birthDate: `${day}/${month}/${year}` });
            Alert.alert('Success', 'Date of birth updated successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err: any) {
            Alert.alert('Error', 'Failed to update date of birth.');
        } finally {
            setIsLoading(false);
        }
    };

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
                    <View style={Styles.addCardInputContainer}>
                        <Calendar size={16} color={colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <Text style={[Styles.addCardInput, { color: colors.grayColor }]}>
                            {userProfile?.birthDate || 'Not set'}
                        </Text>
                    </View>
                </View>

                <SizeBox height={30} />

                {/* New Date of Birth */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>New Date of Birth</Text>
                    <SizeBox height={8} />
                    <TouchableOpacity
                        style={Styles.addCardInputContainer}
                        onPress={() => setShowDatePicker(true)}
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

                {/* Save Button */}
                <TouchableOpacity
                    style={Styles.continueBtn}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.pureWhite} />
                    ) : (
                        <>
                            <Text style={Styles.continueBtnText}>Save</Text>
                            <ArrowRight2 size={18} color={colors.pureWhite} variant="Linear" />
                        </>
                    )}
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            <DatePicker
                modal
                open={showDatePicker}
                date={newDate || new Date(2000, 0, 1)}
                mode="date"
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                title="Select new date of birth"
                onConfirm={(date) => {
                    setShowDatePicker(false);
                    setNewDate(date);
                }}
                onCancel={() => setShowDatePicker(false)}
            />
        </View>
    )
}

export default DateOfBirth
