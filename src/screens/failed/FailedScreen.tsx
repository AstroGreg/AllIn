import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, ShieldCross } from 'iconsax-react-nativejs';
import Styles from './FailedScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';

const FailedScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const eventName = route?.params?.eventName || 'BK Studentent 23';

    const handleTryAgain = () => {
        // Go back to EventSummaryScreen
        navigation.goBack();
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            <View style={Styles.content}>
                {/* Failed Icon */}
                <View style={Styles.iconContainer}>
                    <ShieldCross size={122} color="#ED5454" variant="Bold" />
                </View>

                <SizeBox height={35} />

                {/* Text Content */}
                <View style={Styles.textContainer}>
                    <Text style={Styles.title}>Failed</Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subtitle}>
                        Something went wrong while adding you to {eventName}
                    </Text>
                </View>

                <SizeBox height={90} />

                {/* Try Again Button */}
                <TouchableOpacity style={Styles.tryAgainButton} onPress={handleTryAgain}>
                    <Text style={Styles.tryAgainButtonText}>Try Again</Text>
                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
        </View>
    );
};

export default FailedScreen;
