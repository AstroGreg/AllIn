import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'iconsax-react-nativejs';
import ConfettiCannon from 'react-native-confetti-cannon';
import Styles from './CongratulationsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';

const CongratulationsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const confettiRef = useRef<any>(null);
    const confettiRef2 = useRef<any>(null);

    useEffect(() => {
        // Trigger confetti on mount
        if (confettiRef.current) {
            confettiRef.current.start();
        }
        if (confettiRef2.current) {
            setTimeout(() => {
                confettiRef2.current?.start();
            }, 500);
        }
    }, []);

    const handleBackHome = () => {
        // Reset to Home screen
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Confetti from left */}
            <ConfettiCannon
                ref={confettiRef}
                count={100}
                origin={{ x: -10, y: 0 }}
                autoStart={false}
                fadeOut={true}
                fallSpeed={3000}
                explosionSpeed={350}
                colors={['#3C82F6', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA']}
            />

            {/* Confetti from right */}
            <ConfettiCannon
                ref={confettiRef2}
                count={100}
                origin={{ x: 400, y: 0 }}
                autoStart={false}
                fadeOut={true}
                fallSpeed={3000}
                explosionSpeed={350}
                colors={['#3C82F6', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA']}
            />

            <View style={Styles.content}>
                {/* Success Icon */}
                <View style={Styles.iconContainer}>
                    <Icons.CheckCircleGreen height={122} width={122} />
                </View>

                <SizeBox height={35} />

                {/* Text Content */}
                <View style={Styles.textContainer}>
                    <Text style={Styles.title}>Congratulations</Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subtitle}>You've successfully joined the event!</Text>
                </View>

                <SizeBox height={90} />

                {/* Back Home Button */}
                <TouchableOpacity style={Styles.backHomeButton} onPress={handleBackHome}>
                    <Text style={Styles.backHomeButtonText}>Back Home</Text>
                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
        </View>
    );
};

export default CongratulationsScreen;
