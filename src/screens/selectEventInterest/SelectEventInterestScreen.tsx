import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import Colors from '../../constants/Colors';
import Styles from './SelectEventInterestStyles';
import Icons from '../../constants/Icons';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';

const SelectEventInterestScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const [selectedEvent, setSelectedEvent] = useState<number | null>(1);
    const category = route?.params?.category || 1; // 1 = Individual, 2 = Photographer

    const eventTypes = [
        {
            id: 1,
            title: 'Track and Field',
            image: Images.trackAndField,
            enabled: true,
        },
        {
            id: 2,
            title: 'Boxing (Coming in the near future)',
            image: Images.boxing,
            enabled: false,
        },
    ];

    const renderEventOption = (event: any) => (
        <TouchableOpacity
            key={event.id}
            style={[
                Styles.eventOption,
                selectedEvent === event.id && Styles.eventOptionSelected,
                !event.enabled && Styles.eventOptionDisabled
            ]}
            onPress={() => event.enabled && setSelectedEvent(event.id)}
            activeOpacity={event.enabled ? 0.8 : 1}
            disabled={!event.enabled}
        >
            <View style={Styles.eventOptionContent}>
                <FastImage source={event.image} style={Styles.eventIcon} resizeMode="contain" />
                <Text style={[
                    Styles.eventOptionText,
                    !event.enabled && Styles.eventOptionTextDisabled
                ]}>{event.title}</Text>
            </View>
            {!event.enabled && (
                <Icons.LockColorful width={16} height={16} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Illustration */}
                <View style={Styles.illustrationContainer}>
                    <FastImage source={Images.signup3} style={Styles.illustration} resizeMode="contain" />
                </View>

                {/* Title Section */}
                <View style={Styles.titleSection}>
                    <Text style={Styles.title}>Which kinds of events are you interested in?</Text>
                    <Text style={Styles.subtitle}>Choose Your Interest</Text>
                </View>

                {/* Event Options Card */}
                <View style={Styles.optionsCard}>
                    {eventTypes.map(renderEventOption)}
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={[Styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={Styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={Styles.backButtonText}>Back</Text>
                    <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        Styles.nextButton,
                        !selectedEvent && Styles.nextButtonDisabled
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
                    <Text style={Styles.nextButtonText}>Next</Text>
                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SelectEventInterestScreen;
