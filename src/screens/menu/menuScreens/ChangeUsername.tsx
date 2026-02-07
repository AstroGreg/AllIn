import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { useAuth } from '../../../context/AuthContext'
import { ArrowLeft2, Notification, User, ArrowRight2 } from 'iconsax-react-nativejs'

const ChangeUsername = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { userProfile, updateUserProfile } = useAuth();
    const [newUsername, setNewUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!newUsername.trim()) {
            Alert.alert('Error', 'Please enter a new username.');
            return;
        }

        setIsLoading(true);
        try {
            await updateUserProfile({ username: newUsername.trim() });
            Alert.alert('Success', 'Username updated successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err: any) {
            Alert.alert('Error', 'Failed to update username.');
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
                <Text style={Styles.headerTitle}>Change Username</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.changePasswordTitle}>Change Username</Text>
                <SizeBox height={16} />

                {/* Current Username */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>Current Username</Text>
                    <SizeBox height={8} />
                    <View style={Styles.addCardInputContainer}>
                        <User size={16} color={colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <Text style={[Styles.addCardInput, { color: colors.grayColor }]}>
                            {userProfile?.username || 'Not set'}
                        </Text>
                    </View>
                </View>

                <SizeBox height={30} />

                {/* New Username */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>New Username</Text>
                    <SizeBox height={8} />
                    <View style={Styles.addCardInputContainer}>
                        <User size={16} color={colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.addCardInput}
                            placeholder="Enter new username"
                            placeholderTextColor={colors.grayColor}
                            value={newUsername}
                            onChangeText={setNewUsername}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <SizeBox height={30} />

                {/* Continue Button */}
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

export default ChangeUsername
