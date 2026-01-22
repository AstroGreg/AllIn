import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useState } from 'react'
import Styles from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../../../constants/Colors'
import { ArrowLeft2, Notification, User, ArrowRight2 } from 'iconsax-react-nativejs'

const ChangeUsername = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [currentUsername, setCurrentUsername] = useState('');
    const [newUsername, setNewUsername] = useState('');

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Change Username</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={Colors.primaryColor} variant="Linear" />
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
                        <User size={16} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.addCardInput}
                            placeholder="Enter Username"
                            placeholderTextColor="#777777"
                            value={currentUsername}
                            onChangeText={setCurrentUsername}
                        />
                    </View>
                </View>

                <SizeBox height={30} />

                {/* New Username */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>New Username</Text>
                    <SizeBox height={8} />
                    <View style={Styles.addCardInputContainer}>
                        <User size={16} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.addCardInput}
                            placeholder="Enter Username"
                            placeholderTextColor="#777777"
                            value={newUsername}
                            onChangeText={setNewUsername}
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

export default ChangeUsername
