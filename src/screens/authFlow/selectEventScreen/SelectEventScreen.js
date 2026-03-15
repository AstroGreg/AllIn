var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, } from 'react-native';
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
import { getSportFocusDefinitions, getSportFocusLabel, normalizeSelectedEvents, } from '../../../utils/profileSelections';
import SportFocusIcon from '../../../components/profile/SportFocusIcon';
const SelectEventScreen = ({ navigation, route }) => {
    var _a, _b;
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { userProfile } = useAuth();
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const selectedCategory = String(((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.selectedCategory) || '').trim().toLowerCase();
    const fromAddFlow = Boolean((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.fromAddFlow);
    const existingSelectedEvents = useMemo(() => { var _a; return normalizeSelectedEvents((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents) !== null && _a !== void 0 ? _a : []); }, [userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents]);
    // Only athlete creation is single-focus. Support and group/admin stay multi-focus.
    const allowsMultiSelect = selectedCategory === 'manage' || selectedCategory === 'support';
    const events = useMemo(() => getSportFocusDefinitions().map((focus) => ({
        id: focus.id,
        name: getSportFocusLabel(focus.id, t),
    })), [t]);
    const visibleEvents = useMemo(() => events.filter((event) => {
        if (!fromAddFlow || selectedCategory !== 'find')
            return true;
        return !existingSelectedEvents.includes(event.id);
    }), [events, existingSelectedEvents, fromAddFlow, selectedCategory]);
    const selectedEventDetails = useMemo(() => visibleEvents.filter((event) => selectedEvents.includes(event.id)), [selectedEvents, visibleEvents]);
    const toggleEvent = (eventId) => {
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
    const handleNext = () => __awaiter(void 0, void 0, void 0, function* () {
        if (selectedEvents.length === 0)
            return;
        setIsLoading(true);
        try {
            const nextSelectedEvents = allowsMultiSelect
                ? selectedEvents
                : selectedEvents.slice(0, 1);
            const nextRoute = selectedCategory === 'find'
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
            if (!(nextRoute === null || nextRoute === void 0 ? void 0 : nextRoute.screen)) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'BottomTabBar' }],
                });
                return;
            }
            navigation.navigate(nextRoute.screen, nextRoute.params);
        }
        catch (_c) {
            Alert.alert(t('Error'), t('Failed to save events. Please try again.'));
        }
        finally {
            setIsLoading(false);
        }
    });
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
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "select-event-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.screenContent }, { children: [_jsx(View, Object.assign({ style: Styles.topBar }, { children: _jsx(TouchableOpacity, Object.assign({ testID: "select-event-back-button", style: Styles.backIconButton, activeOpacity: 0.8, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 22, color: colors.primaryColor, variant: "Linear" }) })) })), _jsxs(View, Object.assign({ style: Styles.heroSection }, { children: [_jsx(View, Object.assign({ style: Styles.imageContainer }, { children: _jsx(FastImage, { source: Images.signup3, style: Styles.heroImage, resizeMode: "contain" }) })), _jsx(SizeBox, { height: 18 }), _jsxs(View, Object.assign({ style: Styles.contentContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: headingText })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: subHeadingText }))] }))] })), _jsx(View, Object.assign({ style: Styles.selectionSection }, { children: _jsxs(ScrollView, Object.assign({ style: Styles.focusList, contentContainerStyle: Styles.focusListContent, showsVerticalScrollIndicator: false }, { children: [visibleEvents.map((event) => {
                                    const isSelected = selectedEvents.includes(event.id);
                                    return (_jsxs(TouchableOpacity, Object.assign({ testID: `focus-card-${event.id}`, style: [Styles.focusCard, isSelected && Styles.focusCardSelected], activeOpacity: 0.85, onPress: () => toggleEvent(event.id) }, { children: [_jsxs(View, Object.assign({ style: Styles.focusCardLeft }, { children: [_jsx(View, Object.assign({ style: Styles.focusIconWrap }, { children: _jsx(SportFocusIcon, { focusId: event.id, size: 26, color: colors.primaryColor }) })), _jsxs(View, Object.assign({ style: Styles.focusTextWrap }, { children: [_jsx(Text, Object.assign({ style: Styles.focusCardTitle }, { children: event.name })), _jsx(Text, Object.assign({ style: Styles.focusCardSubtitle }, { children: allowsMultiSelect
                                                                    ? t('Tap to add or remove this sport')
                                                                    : t('Tap to continue with this sport') }))] }))] })), _jsx(TickCircle, { size: 24, color: isSelected ? colors.primaryColor : colors.lightGrayColor, variant: isSelected ? 'Bold' : 'Linear' })] }), event.id));
                                }), selectedEventDetails.length > 0 ? (_jsxs(View, Object.assign({ style: Styles.selectedSummaryCard }, { children: [_jsx(Text, Object.assign({ style: Styles.selectedSummaryLabel }, { children: allowsMultiSelect ? t('Selected sports') : t('Selected sport') })), _jsx(Text, Object.assign({ style: Styles.selectedSummaryValue }, { children: selectedEventDetails.map((item) => item.name).join(' • ') }))] }))) : null, _jsx(SizeBox, { height: 12 })] })) }))] })), _jsxs(View, Object.assign({ style: [Styles.buttonContainer, { paddingBottom: insets.bottom + 14 }] }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.backButton, activeOpacity: 0.7, onPress: () => navigation.goBack() }, { children: _jsx(Text, Object.assign({ style: Styles.backButtonText }, { children: t('Back') })) })), _jsx(TouchableOpacity, Object.assign({ testID: "select-event-next-button", style: [
                            Styles.nextButton,
                            (isLoading || selectedEvents.length === 0) && Styles.nextButtonDisabled,
                        ], activeOpacity: 0.7, onPress: handleNext, disabled: isLoading || selectedEvents.length === 0 }, { children: isLoading ? (_jsx(ActivityIndicator, { size: "small", color: "#fff" })) : (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.nextButtonText }, { children: t('Next') })), _jsx(Icons.RightBtnIcon, { height: 18, width: 18 })] })) }))] }))] })));
};
export default SelectEventScreen;
