import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native'
import React, { useMemo, useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, Card, ArrowDown2 } from 'iconsax-react-nativejs'
import { useAuth } from '../../../context/AuthContext'

const ChangeNationality = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { userProfile, updateUserProfile } = useAuth();
    const [newNationality, setNewNationality] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const currentNationality = userProfile?.nationality || 'Not set';

    const nationalityOptions = useMemo(() => ([
        'Belgian',
        'Dutch',
        'French',
        'German',
        'Spanish',
        'Italian',
        'Portuguese',
        'British',
        'American',
        'Canadian',
        'Australian',
        'Swiss',
        'Swedish',
        'Norwegian',
        'Danish',
    ]), []);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Change Nationality</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.changePasswordTitle}>Change Nationality</Text>
                <SizeBox height={16} />

                <View style={Styles.currentValueCard}>
                    <View>
                        <Text style={Styles.currentValueLabel}>Current nationality</Text>
                        <Text style={Styles.currentValueText}>{currentNationality}</Text>
                    </View>
                    <TouchableOpacity
                        style={Styles.editActionButton}
                        onPress={() => {
                            setNewNationality(currentNationality === 'Not set' ? '' : String(currentNationality));
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
                            <Text style={Styles.addCardLabel}>Nationality</Text>
                            <SizeBox height={8} />
                            <TouchableOpacity
                                style={Styles.addCardInputContainer}
                                onPress={() => setShowModal(true)}
                            >
                                <Card size={16} color={colors.primaryColor} variant="Linear" />
                                <SizeBox width={10} />
                                <Text style={[Styles.addCardPlaceholder, newNationality && Styles.addCardInputText]}>
                                    {newNationality || 'Select nationality'}
                                </Text>
                                <ArrowDown2 size={20} color={colors.grayColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>

                        <View style={Styles.editActionsRow}>
                            <TouchableOpacity style={Styles.cancelButton} onPress={() => setIsEditing(false)}>
                                <Text style={Styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.saveButton}
                                onPress={async () => {
                                    if (!newNationality.trim()) return;
                                    await updateUserProfile({ nationality: newNationality.trim() });
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

            <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
                <Pressable style={Styles.selectionModalOverlay} onPress={() => setShowModal(false)}>
                    <Pressable style={Styles.selectionModalCard} onPress={() => {}}>
                        <Text style={Styles.selectionModalTitle}>Select nationality</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {nationalityOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={Styles.selectionOption}
                                    onPress={() => {
                                        setNewNationality(option);
                                        setShowModal(false);
                                    }}
                                >
                                    <Text style={Styles.selectionOptionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    )
}

export default ChangeNationality
