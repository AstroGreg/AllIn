import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { useAuth } from '../../../context/AuthContext'
import { ArrowLeft2, Notification, Card, ArrowRight2 } from 'iconsax-react-nativejs'

const ChangeNationality = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { userProfile, updateUserProfile } = useAuth();
    const [newNationality, setNewNationality] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!newNationality.trim()) {
            Alert.alert('Error', 'Please enter a nationality.');
            return;
        }

        setIsLoading(true);
        try {
            await updateUserProfile({ location: newNationality.trim() });
            Alert.alert('Success', 'Nationality updated successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err: any) {
            Alert.alert('Error', 'Failed to update nationality.');
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
                <Text style={Styles.headerTitle}>Change Nationality</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.changePasswordTitle}>Change Nationality</Text>
                <SizeBox height={16} />

                {/* Current Nationality */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>Current Nationality</Text>
                    <SizeBox height={8} />
                    <View style={Styles.addCardInputContainer}>
                        <Card size={16} color={colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <Text style={[Styles.addCardInput, { color: colors.grayColor }]}>
                            {userProfile?.location || 'Not set'}
                        </Text>
                    </View>
                </View>

                <SizeBox height={30} />

                {/* New Nationality */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>New Nationality</Text>
                    <SizeBox height={8} />
                    <View style={Styles.addCardInputContainer}>
                        <Card size={16} color={colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.addCardInput}
                            placeholder="Enter nationality"
                            placeholderTextColor={colors.grayColor}
                            value={newNationality}
                            onChangeText={setNewNationality}
                        />
                    </View>
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
        </View>
    )
}

export default ChangeNationality
