import { Text, View, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import Styles from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../../../constants/Colors'
import { ArrowLeft2, Notification, Location as LocationIcon } from 'iconsax-react-nativejs'

const Location = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [location, setLocation] = useState('');

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Menu</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <View style={Styles.container}>
                <SizeBox height={24} />
                <Text style={Styles.sectionTitle}>Location</Text>
                <SizeBox height={16} />
                <View style={Styles.locationInputContainer}>
                    <LocationIcon size={20} color={Colors.primaryColor} variant="Linear" />
                    <SizeBox width={10} />
                    <TextInput
                        style={Styles.locationInput}
                        placeholder="Enter your location"
                        placeholderTextColor="#777777"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>
            </View>
        </View>
    )
}

export default Location
