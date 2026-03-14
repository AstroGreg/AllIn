import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './SelectEventInterestStyles';
import Icons from '../../constants/Icons';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const SelectEventInterestScreen = ({ navigation, route }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [selectedEvent, setSelectedEvent] = useState(1);
    const category = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.category) || 1; // 1 = Individual, 2 = Photographer
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
    const renderEventOption = (event) => (_jsxs(TouchableOpacity, Object.assign({ style: [
            styles.eventOption,
            selectedEvent === event.id && styles.eventOptionSelected,
            !event.enabled && styles.eventOptionDisabled
        ], onPress: () => event.enabled && setSelectedEvent(event.id), activeOpacity: event.enabled ? 0.8 : 1, disabled: !event.enabled }, { children: [_jsxs(View, Object.assign({ style: styles.eventOptionContent }, { children: [_jsx(FastImage, { source: event.image, style: styles.eventIcon, resizeMode: "contain" }), _jsx(Text, Object.assign({ style: [
                            styles.eventOptionText,
                            !event.enabled && styles.eventOptionTextDisabled
                        ] }, { children: event.title }))] })), !event.enabled && (_jsx(Icons.LockColorful, { width: 16, height: 16 }))] }), event.id));
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(View, Object.assign({ style: styles.header }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })) })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [_jsx(View, Object.assign({ style: styles.illustrationContainer }, { children: _jsx(FastImage, { source: Images.signup3, style: styles.illustration, resizeMode: "contain" }) })), _jsxs(View, Object.assign({ style: styles.titleSection }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: t('Which kinds of events are you interested in?') })), _jsx(Text, Object.assign({ style: styles.subtitle }, { children: t('Choose Your Interest') }))] })), _jsx(View, Object.assign({ style: styles.optionsCard }, { children: eventTypes.map(renderEventOption) }))] })), _jsxs(View, Object.assign({ style: [styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }] }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.backButton, onPress: () => navigation.goBack() }, { children: [_jsx(Text, Object.assign({ style: styles.backButtonText }, { children: t('Back') })), _jsx(ArrowRight, { size: 18, color: colors.subTextColor, variant: "Linear" })] })), _jsxs(TouchableOpacity, Object.assign({ style: [
                            styles.nextButton,
                            !selectedEvent && styles.nextButtonDisabled
                        ], disabled: !selectedEvent, onPress: () => {
                            if (category === 2) {
                                // Photographer/Videographer - go to create photographer profile
                                navigation.navigate('CreatePhotographerProfileScreen');
                            }
                            else if (category === 3) {
                                // Group - go to create group profile
                                navigation.navigate('CreateGroupProfileScreen');
                            }
                            else {
                                // Individual - go to complete athlete details
                                const selected = selectedEvent === 1 ? ['track-field'] : [];
                                navigation.navigate('CompleteAthleteDetailsScreen', { selectedEvents: selected });
                            }
                        } }, { children: [_jsx(Text, Object.assign({ style: styles.nextButtonText }, { children: t('Next') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] }))] }))] })));
};
export default SelectEventInterestScreen;
