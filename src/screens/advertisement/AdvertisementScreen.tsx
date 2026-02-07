import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'iconsax-react-nativejs';
import { createStyles } from './AdvertisementScreenStyles';
import Images from '../../constants/Images';
import { useTheme } from '../../context/ThemeContext';

const AdvertisementScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();

    const handleSkip = () => {
        navigation.navigate('CategorySelectionScreen');
    };

    return (
        <View style={Styles.mainContainer}>
            <ImageBackground
                source={Images.advertisement}
                style={Styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={Styles.contentContainer}>
                    <View style={Styles.adOverlay}>
                        <Text style={Styles.adText}>
                            Ads like 50% discount in Adidas shoes etc
                        </Text>
                    </View>
                </View>

                <View style={[Styles.buttonContainer, { bottom: insets.bottom + 40 }]}>
                    <TouchableOpacity
                        style={Styles.skipButton}
                        activeOpacity={0.7}
                        onPress={handleSkip}
                    >
                        <Text style={Styles.skipButtonText}>Skip</Text>
                        <ArrowRight size={20} color={colors.grayColor} />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
};

export default AdvertisementScreen;
