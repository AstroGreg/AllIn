import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, TickCircle } from 'iconsax-react-nativejs';

import { createStyles } from './SelectEventScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import Images from '../../../constants/Images';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    getSportFocusDefinitions,
    getSportFocusLabel,
    normalizeSelectedEvents,
    type SportFocusId,
} from '../../../utils/profileSelections';
import SportFocusIcon from '../../../components/profile/SportFocusIcon';

interface EventOption {
    id: SportFocusId;
    name: string;
}

const SelectEventScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { userProfile } = useAuth();

    const [selectedEvents, setSelectedEvents] = useState<SportFocusId[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const selectedCategory = String(route?.params?.selectedCategory || '').trim().toLowerCase();
    const fromAddFlow = Boolean(route?.params?.fromAddFlow);
    const existingSelectedEvents = useMemo(
        () => normalizeSelectedEvents(userProfile?.selectedEvents ?? []),
        [userProfile?.selectedEvents],
    );
    // Only athlete creation is single-focus. Support and group/admin stay multi-focus.
    const allowsMultiSelect = selectedCategory === 'manage' || selectedCategory === 'support';

    const events = useMemo<EventOption[]>(
        () => getSportFocusDefinitions().map((focus) => ({
            id: focus.id,
            name: getSportFocusLabel(focus.id, t),
        })),
        [t],
    );

    const visibleEvents = useMemo(
        () =>
            events.filter((event) => {
                if (!fromAddFlow || selectedCategory !== 'find') return true;
                return !existingSelectedEvents.includes(event.id);
            }),
        [events, existingSelectedEvents, fromAddFlow, selectedCategory],
    );

    const selectedEventDetails = useMemo(
        () => visibleEvents.filter((event) => selectedEvents.includes(event.id)),
        [selectedEvents, visibleEvents],
    );

    const toggleEvent = (eventId: SportFocusId) => {
        setSelectedEvents((prev) => {
            if (allowsMultiSelect) {
                if (prev.includes(eventId)) {
                    return prev.filter((id) => id !== eventId);
                }
                return [...prev, eventId];
            }
            return prev[0] === eventId ? [] : [eventId];
        });
    };

    const handleNext = async () => {
        if (selectedEvents.length === 0) return;

        setIsLoading(true);
        try {
            const nextSelectedEvents = allowsMultiSelect
                ? selectedEvents
                : selectedEvents.slice(0, 1);

            const nextRoute =
                selectedCategory === 'find'
                    ? {
                        screen: 'CompleteAthleteDetailsScreen',
                        params: {
                            selectedCategory,
                            selectedEvents: nextSelectedEvents,
                            flowSelectedEvents: nextSelectedEvents,
                        },
                    }
                    : selectedCategory === 'manage'
                        ? {
                            screen: 'CreateGroupProfileScreen',
                            params: {
                                selectedFocuses: nextSelectedEvents,
                                selectedEvents: nextSelectedEvents,
                                focusLocked: true,
                            },
                        }
                        : selectedCategory === 'support'
                            ? {
                                screen: 'CompleteSupportDetailsScreen',
                                params: {
                                    selectedCategory,
                                    selectedEvents: nextSelectedEvents,
                                    flowSelectedEvents: nextSelectedEvents,
                                },
                            }
                            : selectedCategory === 'sell'
                                ? {
                                    screen: 'CreatePhotographerProfileScreen',
                                    params: {},
                                }
                                : null;

            if (!nextRoute?.screen) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'BottomTabBar' }],
                });
                return;
            }

            navigation.navigate(nextRoute.screen, nextRoute.params);
        } catch {
            Alert.alert(t('Error'), t('Failed to save events. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    const headingText = selectedCategory === 'find'
        ? t('Choose your sport focus (Athlete)')
        : selectedCategory === 'manage'
            ? t('Choose your sport focus (Group/Admin)')
            : selectedCategory === 'support'
                ? t('Choose sports you follow (Support)')
                : t('Choose your sport focus');

    const subHeadingText = allowsMultiSelect
        ? t('Select one or more disciplines')
        : t('Select one sport focus');

    return (
        <View style={Styles.mainContainer} testID="select-event-screen">
            <SizeBox height={insets.top} />

            <View style={Styles.screenContent}>
                <View style={Styles.topBar}>
                    <TouchableOpacity testID="select-event-back-button" style={Styles.backIconButton} activeOpacity={0.8} onPress={() => navigation.goBack()}>
                        <ArrowLeft2 size={22} color={colors.primaryColor} variant="Linear" />
                    </TouchableOpacity>
                </View>

                <View style={Styles.heroSection}>
                    <View style={Styles.imageContainer}>
                        <FastImage
                            source={Images.signup3}
                            style={Styles.heroImage}
                            resizeMode="contain"
                        />
                    </View>

                    <SizeBox height={18} />

                    <View style={Styles.contentContainer}>
                        <Text style={Styles.headingText}>{headingText}</Text>
                        <SizeBox height={8} />
                        <Text style={Styles.subHeadingText}>{subHeadingText}</Text>
                    </View>
                </View>

                <View style={Styles.selectionSection}>
                    <ScrollView
                        style={Styles.focusList}
                        contentContainerStyle={Styles.focusListContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {visibleEvents.map((event) => {
                            const isSelected = selectedEvents.includes(event.id);
                            return (
                                <TouchableOpacity
                                    key={event.id}
                                    testID={`focus-card-${event.id}`}
                                    style={[Styles.focusCard, isSelected && Styles.focusCardSelected]}
                                    activeOpacity={0.85}
                                    onPress={() => toggleEvent(event.id)}
                                >
                                    <View style={Styles.focusCardLeft}>
                                        <View style={Styles.focusIconWrap}>
                                            <SportFocusIcon focusId={event.id} size={26} color={colors.primaryColor} />
                                        </View>
                                        <View style={Styles.focusTextWrap}>
                                            <Text style={Styles.focusCardTitle}>{event.name}</Text>
                                            <Text style={Styles.focusCardSubtitle}>
                                                {allowsMultiSelect
                                                    ? t('Tap to add or remove this sport')
                                                    : t('Tap to continue with this sport')}
                                            </Text>
                                        </View>
                                    </View>
                                    <TickCircle
                                        size={24}
                                        color={isSelected ? colors.primaryColor : colors.lightGrayColor}
                                        variant={isSelected ? 'Bold' : 'Linear'}
                                    />
                                </TouchableOpacity>
                            );
                        })}

                        {selectedEventDetails.length > 0 ? (
                            <View style={Styles.selectedSummaryCard}>
                                <Text style={Styles.selectedSummaryLabel}>
                                    {allowsMultiSelect ? t('Selected sports') : t('Selected sport')}
                                </Text>
                                <Text style={Styles.selectedSummaryValue}>
                                    {selectedEventDetails.map((item) => item.name).join(' • ')}
                                </Text>
                            </View>
                        ) : null}

                        <SizeBox height={12} />
                    </ScrollView>
                </View>
            </View>

            <View style={[Styles.buttonContainer, { paddingBottom: insets.bottom + 14 }]}>
                <TouchableOpacity style={Styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
                    <Text style={Styles.backButtonText}>{t('Back')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    testID="select-event-next-button"
                    style={[
                        Styles.nextButton,
                        (isLoading || selectedEvents.length === 0) && Styles.nextButtonDisabled,
                    ]}
                    activeOpacity={0.7}
                    onPress={handleNext}
                    disabled={isLoading || selectedEvents.length === 0}
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
        </View>
    );
};

export default SelectEventScreen;
