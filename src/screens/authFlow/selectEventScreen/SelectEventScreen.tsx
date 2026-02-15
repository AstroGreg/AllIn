import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { createStyles } from './SelectEventScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import Images from '../../../constants/Images';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next'

interface EventOption {
    id: string;
    name: string;
    icon: any;
    isSvg?: boolean;
    disabled?: boolean;
    comingSoon?: boolean;
}

const events: EventOption[] = [
    { id: 'track-field', name: 'Track and Field', icon: Images.trackAndField },
    { id: 'road-events', name: 'Road events', icon: Icons.PersonRunningColorful, isSvg: true },
    { id: 'boxing', name: 'Boxing (Coming in the near future)', icon: Images.boxing, disabled: true, comingSoon: true },
];

const SelectEventScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile } = useAuth();
    const [selectedEvents, setSelectedEvents] = useState<string[]>(['track-field']);
    const [isLoading, setIsLoading] = useState(false);
    const selectedCategory = route?.params?.selectedCategory;

    const toggleEvent = (eventId: string) => {
        setSelectedEvents(prev => {
            if (prev.includes(eventId)) {
                return prev.filter(id => id !== eventId);
            } else {
                return [...prev, eventId];
            }
        });
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleNext = async () => {
        if (selectedEvents.length === 0) {
            Alert.alert(t('Error'), t('Please select at least one event'));
            return;
        }

        setIsLoading(true);
        try {
            await updateUserProfile({ selectedEvents });

            if (selectedCategory === 'find') {
                navigation.navigate('CompleteAthleteDetailsScreen');
            } else if (selectedCategory === 'manage') {
                navigation.navigate('CreateGroupProfileScreen');
            } else if (selectedCategory === 'sell') {
                navigation.navigate('CreatePhotographerProfileScreen');
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'BottomTabBar' }],
                });
            }
        } catch (err: any) {
            Alert.alert(t('Error'), t('Failed to save events. Please try again.'));
        } finally {
            setIsLoading(false);
        }
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
                    <Text style={Styles.subHeadingText}>{t('Choose Your Interest')}</Text>

                    <SizeBox height={24} />

                    <View style={Styles.cardContainer}>
                        {events.map((event) => {
                            const isSelected = selectedEvents.includes(event.id);
                            return (
                                <TouchableOpacity
                                    key={event.id}
                                    style={[
                                        Styles.eventItem,
                                        isSelected && Styles.eventItemSelected,
                                        event.disabled && Styles.eventItemDisabled,
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={() => !event.disabled && toggleEvent(event.id)}
                                    disabled={event.disabled}
                                >
                                    <View style={Styles.eventInfo}>
                                        {event.isSvg ? (
                                            <event.icon width={22} height={22} />
                                        ) : (
                                            <Image
                                                source={event.icon}
                                                style={Styles.eventIcon}
                                            />
                                        )}
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
                        <Text style={Styles.backButtonText}>{t('Back')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[Styles.nextButton, isLoading && { opacity: 0.5 }]}
                        activeOpacity={0.7}
                        onPress={handleNext}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Text style={Styles.nextButtonText}>{t('Next')}</Text>
                                <Icons.RightBtnIcon height={18} width={18} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default SelectEventScreen;