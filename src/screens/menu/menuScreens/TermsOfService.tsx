import { Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import Styles from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../../../constants/Colors'
import { ArrowLeft2, Notification } from 'iconsax-react-nativejs'

const TermsOfService = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const thirdPartyLinks = [
        'Google Play Services',
        'Google Analytics for Firebase',
        'Firebase Crashlytics',
        'Facebook'
    ];

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Terms of Service</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                {/* Terms of Service Section */}
                <View style={Styles.termsSection}>
                    <Text style={Styles.termsSectionTitle}>Terms of Service</Text>
                    <SizeBox height={12} />
                    <Text style={Styles.termsText}>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,
                    </Text>
                    <SizeBox height={8} />
                    <Text style={Styles.termsText}>
                        Link to Terms and Conditions of third-party service providers used by the app
                    </Text>
                    <SizeBox height={8} />
                    {thirdPartyLinks.map((link, index) => (
                        <Text key={index} style={Styles.termsLink}>
                            {'\u2022'} {link}
                        </Text>
                    ))}
                </View>

                <SizeBox height={24} />

                {/* Changes Section */}
                <View style={Styles.termsSection}>
                    <Text style={Styles.termsSectionTitle}>Changes to This Terms and Conditions</Text>
                    <SizeBox height={12} />
                    <Text style={Styles.termsText}>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,
                    </Text>
                </View>

                <SizeBox height={24} />

                {/* Contact Us Section */}
                <View style={Styles.termsSection}>
                    <Text style={Styles.termsSectionTitle}>Contact Us</Text>
                    <SizeBox height={12} />
                    <Text style={Styles.termsText}>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,
                    </Text>
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default TermsOfService
