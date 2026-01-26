import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, Notification, Card, ArrowRight2 } from 'iconsax-react-nativejs'

const ChangeNationality = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [currentNationality, setCurrentNationality] = useState('');
    const [newNationality, setNewNationality] = useState('');

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
                        <TextInput
                            style={Styles.addCardInput}
                            placeholder="Enter Nationality"
                            placeholderTextColor={colors.grayColor}
                            value={currentNationality}
                            onChangeText={setCurrentNationality}
                        />
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
                            placeholder="Enter Nationality"
                            placeholderTextColor={colors.grayColor}
                            value={newNationality}
                            onChangeText={setNewNationality}
                        />
                    </View>
                </View>

                <SizeBox height={30} />

                {/* Continue Button */}
                <TouchableOpacity style={Styles.continueBtn} onPress={() => navigation.goBack()}>
                    <Text style={Styles.continueBtnText}>Continue</Text>
                    <ArrowRight2 size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default ChangeNationality
