import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../../../constants/Colors'
import { ArrowLeft2, Notification, Sms, Call, Global } from 'iconsax-react-nativejs'

const Help = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const supportItems = [
        {
            icon: <Sms size={24} color={Colors.primaryColor} variant="Linear" />,
            label: 'Email',
            value: 'support@bcs.com'
        },
        {
            icon: <Call size={24} color={Colors.primaryColor} variant="Linear" />,
            label: 'Contact Number',
            value: '+123 456 7890'
        },
        {
            icon: <Global size={24} color={Colors.primaryColor} variant="Linear" />,
            label: 'Website',
            value: 'www.allin.com'
        }
    ];

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Help</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <View style={Styles.container}>
                <SizeBox height={24} />
                <View style={Styles.helpCard}>
                    {supportItems.map((item, index) => (
                        <React.Fragment key={item.label}>
                            <View style={Styles.helpRow}>
                                <View style={Styles.helpIconContainer}>
                                    {item.icon}
                                </View>
                                <SizeBox width={8} />
                                <View style={Styles.helpContent}>
                                    <Text style={Styles.helpLabel}>{item.label}</Text>
                                    <Text style={Styles.helpValue}>{item.value}</Text>
                                </View>
                            </View>
                            {index < supportItems.length - 1 && (
                                <>
                                    <SizeBox height={16} />
                                    <View style={Styles.helpDivider} />
                                    <SizeBox height={20} />
                                </>
                            )}
                        </React.Fragment>
                    ))}
                </View>
            </View>
        </View>
    )
}

export default Help
