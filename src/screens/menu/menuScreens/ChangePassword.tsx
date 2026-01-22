import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useState } from 'react'
import Styles from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../../../constants/Colors'
import { ArrowLeft2, Notification, Unlock, ArrowRight2 } from 'iconsax-react-nativejs'

const ChangePassword = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Change Password</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.changePasswordTitle}>Change Password</Text>
                <SizeBox height={16} />

                {/* Current Password */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>Current Password</Text>
                    <SizeBox height={8} />
                    <View style={Styles.addCardInputContainer}>
                        <Unlock size={16} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.addCardInput}
                            placeholder="Enter Password"
                            placeholderTextColor="#777777"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                        />
                    </View>
                </View>

                <SizeBox height={30} />

                {/* New Password */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>New Password</Text>
                    <SizeBox height={8} />
                    <View style={Styles.addCardInputContainer}>
                        <Unlock size={16} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.addCardInput}
                            placeholder="Enter Password"
                            placeholderTextColor="#777777"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />
                    </View>
                </View>

                <SizeBox height={30} />

                {/* Continue Button */}
                <TouchableOpacity style={Styles.continueBtn} onPress={() => navigation.goBack()}>
                    <Text style={Styles.continueBtnText}>Continue</Text>
                    <ArrowRight2 size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default ChangePassword
