import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './SelectEventInterestStyles';
import Icons from '../../constants/Icons';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const SelectEventInterestScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [selectedEvent, setSelectedEvent] = useState<number | null>(1);
    const category = route?.params?.category || 1; // 1 = Individual, 2 = Photographer

    const eventTypes = [
        {
            id: 1,
            title: t('Track and Field'),
            image: Images.trackAndField,
            enabled: true,
        },
        {
            id: 2,
            title: t('Boxing (Coming in the near future)'),
            image: Images.boxing,
            enabled: false,
        },
    ];

    const renderEventOption = (event: any) => (
        <TouchableOpacity
            key={event.id}
            style={[
                styles.eventOption,
                selectedEvent === event.id && styles.eventOptionSelected,
                !event.enabled && styles.eventOptionDisabled
            ]}
            onPress={() => event.enabled && setSelectedEvent(event.id)}
            activeOpacity={event.enabled ? 0.8 : 1}
            disabled={!event.enabled}
        >
            <View style={styles.eventOptionContent}>
                <FastImage source={event.image} style={styles.eventIcon} resizeMode="contain" />
                <Text style={[
                    styles.eventOptionText,
                    !event.enabled && styles.eventOptionTextDisabled
                ]}>{event.title}</Text>
            </View>
            {!event.enabled && (
                <Icons.LockColorful width={16} height={16} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Illustration */}
                <View style={styles.illustrationContainer}>
                    <FastImage source={Images.signup3} style={styles.illustration} resizeMode="contain" />
                </View>

                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{t('Which kinds of events are you interested in?')}</Text>
                    <Text style={styles.subtitle}>{t('Choose Your Interest')}</Text>
                </View>

                {/* Event Options Card */}
                <View style={styles.optionsCard}>
                    {eventTypes.map(renderEventOption)}
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>{t('Back')}</Text>
                    <ArrowRight size={18} color={colors.subTextColor} variant="Linear" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        !selectedEvent && styles.nextButtonDisabled
                    ]}
                    disabled={!selectedEvent}
                    onPress={() => {
                        if (category === 2) {
                            // Photographer/Videographer - go to create photographer profile
                            navigation.navigate('CreatePhotographerProfileScreen');
                        } else if (category === 3) {
                            // Group - go to create group profile
                            navigation.navigate('CreateGroupProfileScreen');
                        } else {
                            // Individual - go to complete athlete details
                            navigation.navigate('CompleteAthleteDetailsScreen');
                        }
                    }}
                >
                    <Text style={styles.nextButtonText}>{t('Next')}</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SelectEventInterestScreen;
