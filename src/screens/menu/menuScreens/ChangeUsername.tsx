import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, User } from 'iconsax-react-nativejs'
import { useAuth } from '../../../context/AuthContext'

const ChangeUsername = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { userProfile, user, updateUserProfile } = useAuth();
    const [newUsername, setNewUsername] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const currentUsername = userProfile?.username || user?.nickname || 'Not set';

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Change Username</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.changePasswordTitle}>Change Username</Text>
                <SizeBox height={16} />

                <View style={Styles.currentValueCard}>
                    <View>
                        <Text style={Styles.currentValueLabel}>Current username</Text>
                        <Text style={Styles.currentValueText}>{currentUsername}</Text>
                    </View>
                    <TouchableOpacity
                        style={Styles.editActionButton}
                        onPress={() => {
                            setNewUsername(currentUsername === 'Not set' ? '' : String(currentUsername));
                            setIsEditing(true);
                        }}
                    >
                        <Text style={Styles.editActionText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {isEditing && (
                    <>
                        <SizeBox height={24} />
                        <View style={Styles.addCardInputGroup}>
                            <Text style={Styles.addCardLabel}>Username</Text>
                            <SizeBox height={8} />
                            <View style={Styles.addCardInputContainer}>
                                <User size={16} color={colors.primaryColor} variant="Linear" />
                                <SizeBox width={10} />
                                <TextInput
                                    style={Styles.addCardInput}
                                    placeholder="Enter username"
                                    placeholderTextColor={colors.grayColor}
                                    value={newUsername}
                                    onChangeText={setNewUsername}
                                />
                            </View>
                        </View>

                        <View style={Styles.editActionsRow}>
                            <TouchableOpacity style={Styles.cancelButton} onPress={() => setIsEditing(false)}>
                                <Text style={Styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.saveButton}
                                onPress={async () => {
                                    if (!newUsername.trim()) return;
                                    await updateUserProfile({ username: newUsername.trim() });
                                    setIsEditing(false);
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

export default ChangeUsername
