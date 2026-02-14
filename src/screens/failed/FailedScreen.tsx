import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, ShieldCross } from 'iconsax-react-nativejs';
import { createStyles } from './FailedScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const FailedScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const eventName = route?.params?.eventName || 'BK Studentent 23';

    const handleTryAgain = () => {
        // Go back to EventSummaryScreen
        navigation.goBack();
    };

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            <View style={styles.content}>
                {/* Failed Icon */}
                <View style={styles.iconContainer}>
                    <ShieldCross size={122} color="#ED5454" variant="Bold" />
                </View>

                <SizeBox height={35} />

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{t('Failed')}</Text>
                    <SizeBox height={8} />
                    <Text style={styles.subtitle}>
                        {t('Something went wrong while adding you to')} {eventName}
                    </Text>
                </View>

                <SizeBox height={90} />

                {/* Try Again Button */}
                <TouchableOpacity style={styles.tryAgainButton} onPress={handleTryAgain}>
                    <Text style={styles.tryAgainButtonText}>{t('Try Again')}</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>
            </View>

            <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
        </View>
    );
};

export default FailedScreen;
