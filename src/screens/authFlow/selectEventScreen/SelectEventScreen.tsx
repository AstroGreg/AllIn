import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { createStyles } from './SelectEventScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import Images from '../../../constants/Images';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';

interface EventOption {
    id: string;
    name: string;
    icon: any;
    disabled?: boolean;
    comingSoon?: boolean;
}

const events: EventOption[] = [
    { id: 'track-field', name: 'Track and Field', icon: Images.trackAndField },
    { id: 'road-events', name: 'Road events', icon: Images.roadEvents, disabled: true },
    { id: 'boxing', name: 'Boxing (Coming in the near future)', icon: Images.boxing, disabled: true, comingSoon: true },
];

const SelectEventScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const [selectedEvent, setSelectedEvent] = useState('track-field');

    const handleBack = () => {
        navigation.goBack();
    };

    const handleNext = () => {
        navigation.navigate('CompleteAthleteDetailsScreen');
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <SizeBox height={30} />

                <View style={Styles.imageContainer}>
                    <FastImage
                        source={Images.signup3}
                        style={Styles.headerImage}
                        resizeMode="contain"
                    />
                </View>

                <SizeBox height={30} />

                <View style={Styles.contentContainer}>
                    <Text style={Styles.headingText}>
                        Which kinds of events are you interested in?
                    </Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>Choose Your Interest</Text>

                    <SizeBox height={24} />

                    <View style={Styles.cardContainer}>
                        {events.map((event) => {
                            const isSelected = selectedEvent === event.id;
                            return (
                                <TouchableOpacity
                                    key={event.id}
                                    style={[
                                        Styles.eventItem,
                                        isSelected && Styles.eventItemSelected,
                                        event.disabled && Styles.eventItemDisabled,
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={() => !event.disabled && setSelectedEvent(event.id)}
                                    disabled={event.disabled}
                                >
                                    <View style={Styles.eventInfo}>
                                        <Image
                                            source={event.icon}
                                            style={Styles.eventIcon}
                                        />
                                        <Text
                                            style={[
                                                Styles.eventName,
                                                isSelected && Styles.eventNameSelected,
                                                event.disabled && Styles.eventNameDisabled,
                                            ]}
                                        >
                                            {event.name}
                                        </Text>
                                    </View>
                                    {event.disabled && (
                                        <Image
                                            source={Images.signupLock}
                                            style={Styles.lockIcon}
                                        />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={Styles.buttonContainer}>
                    <TouchableOpacity
                        style={Styles.backButton}
                        activeOpacity={0.7}
                        onPress={handleBack}
                    >
                        <Text style={Styles.backButtonText}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={Styles.nextButton}
                        activeOpacity={0.7}
                        onPress={handleNext}
                    >
                        <Text style={Styles.nextButtonText}>Next</Text>
                        <Icons.RightBtnIcon height={18} width={18} />
                    </TouchableOpacity>
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default SelectEventScreen;
