import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../../constants/Colors';
import Icons from '../../../constants/Icons';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { ArrowLeft2, Notification } from 'iconsax-react-nativejs';
import styles from './ContextSearchLoadingScreenStyles';

const ContextSearchLoadingScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [scannedCount, setScannedCount] = useState(0);
    const [matchedCount, setMatchedCount] = useState(0);

    const contextSearch = route?.params?.contextSearch || '';
    const filters = route?.params?.filters || [];

    // Rotation animation for loading spinner
    useEffect(() => {
        const rotateAnimation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        rotateAnimation.start();

        return () => rotateAnimation.stop();
    }, [rotateAnim]);

    // Simulate scanning progress
    useEffect(() => {
        const scanInterval = setInterval(() => {
            setScannedCount(prev => {
                if (prev >= 1000) {
                    clearInterval(scanInterval);
                    return 1000;
                }
                return prev + Math.floor(Math.random() * 50) + 20;
            });
        }, 100);

        const matchInterval = setInterval(() => {
            setMatchedCount(prev => {
                if (prev >= 3) {
                    clearInterval(matchInterval);
                    return 3;
                }
                return prev + 1;
            });
        }, 800);

        // Navigate to results after loading completes
        const timeout = setTimeout(() => {
            navigation.replace('AISearchResultsScreen', {
                contextSearch,
                filters,
                matchedCount: 3,
            });
        }, 3000);

        return () => {
            clearInterval(scanInterval);
            clearInterval(matchInterval);
            clearTimeout(timeout);
        };
    }, [navigation, contextSearch, filters]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <View style={{ width: 44 }} />
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('NotificationsScreen')}>
                    <Notification size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            {/* Center Content */}
            <View style={styles.centerContent}>
                {/* Loading Spinner */}
                <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]}>
                    <Icons.LoadingGradient width={131} height={131} />
                </Animated.View>

                <SizeBox height={28} />

                {/* Status Box */}
                <View style={styles.statusBox}>
                    <Text style={styles.scannedText}>
                        Scanned {Math.min(scannedCount, 1000)}
                    </Text>
                    <MaskedView
                        style={styles.maskedView}
                        maskElement={
                            <Text style={styles.matchedText}>
                                Matched {matchedCount}
                            </Text>
                        }>
                        <LinearGradient
                            colors={['#155DFC', '#7F22FE']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientText}>
                            <Text style={[styles.matchedText, { opacity: 0 }]}>
                                Matched {matchedCount}
                            </Text>
                        </LinearGradient>
                    </MaskedView>
                </View>
            </View>
        </View>
    );
};

export default ContextSearchLoadingScreen;
