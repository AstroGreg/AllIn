import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'iconsax-react-nativejs';
import ConfettiCannon from 'react-native-confetti-cannon';
import { createStyles } from './CongratulationsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const CongratulationsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
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
        navigation.reset({
            index: 0,
            routes: [{
                name: 'BottomTabBar',
                state: { index: 2, routes: [{ name: 'Upload' }] },
            }],
        });
    };

    return (
        <View style={styles.mainContainer}>
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

            <View style={styles.content}>
                {/* Success Icon */}
                <View style={styles.iconContainer}>
                    <Icons.CheckCircleGreen height={122} width={122} />
                </View>

                <SizeBox height={35} />

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{t('Congratulations')}</Text>
                    <SizeBox height={8} />
                    <Text style={styles.subtitle}>{t('Your upload is complete.')}</Text>
                </View>

                <SizeBox height={90} />

                {/* Back Home Button */}
                <TouchableOpacity style={styles.backHomeButton} onPress={handleBackHome}>
                    <Text style={styles.backHomeButtonText}>{t('OK')}</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>
            </View>

            <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
        </View>
    );
};

export default CongratulationsScreen;
