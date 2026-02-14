import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, Unlock } from 'iconsax-react-nativejs'

const ChangePassword = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Change Password</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.changePasswordTitle}>Change Password</Text>
                <SizeBox height={16} />

                <View style={Styles.currentValueCard}>
                    <View>
                        <Text style={Styles.currentValueLabel}>Current password</Text>
                        <Text style={Styles.currentValueText}>••••••••</Text>
                    </View>
                    <TouchableOpacity style={Styles.editActionButton} onPress={() => setIsEditing(true)}>
                        <Text style={Styles.editActionText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {isEditing && (
                    <>
                        <SizeBox height={24} />
                        <View style={Styles.addCardInputGroup}>
                            <Text style={Styles.addCardLabel}>Current password</Text>
                            <SizeBox height={8} />
                            <View style={Styles.addCardInputContainer}>
                                <Unlock size={16} color={colors.primaryColor} variant="Linear" />
                                <SizeBox width={10} />
                                <TextInput
                                    style={Styles.addCardInput}
                                    placeholder="Enter current password"
                                    placeholderTextColor={colors.grayColor}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <SizeBox height={20} />

                        <View style={Styles.addCardInputGroup}>
                            <Text style={Styles.addCardLabel}>New password</Text>
                            <SizeBox height={8} />
                            <View style={Styles.addCardInputContainer}>
                                <Unlock size={16} color={colors.primaryColor} variant="Linear" />
                                <SizeBox width={10} />
                                <TextInput
                                    style={Styles.addCardInput}
                                    placeholder="Enter new password"
                                    placeholderTextColor={colors.grayColor}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <View style={Styles.editActionsRow}>
                            <TouchableOpacity style={Styles.cancelButton} onPress={() => setIsEditing(false)}>
                                <Text style={Styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.saveButton}
                                onPress={() => {
                                    if (!currentPassword.trim() || !newPassword.trim()) return;
                                    setIsEditing(false);
                                    navigation.goBack();
                                }}
                            >
                                <Text style={Styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default ChangePassword
