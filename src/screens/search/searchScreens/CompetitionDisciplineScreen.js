import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { createStyles } from './CompetitionDisciplineScreenStyles';
import { useTranslation } from 'react-i18next';
const AGE_GROUPS = [
    'Pupil',
    'Miniem',
    'Cadet',
    'Scholier',
    'Junior',
    'Beloften',
    'Seniors',
    'Masters',
];
const GENDERS = ['Men', 'Women', 'Mixed'];
const EventDivisionScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const eventName = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.eventName) || 'Event';
    const competitionName = ((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.competitionName) || '';
    const eventId = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.eventId;
    const competitionId = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.competitionId;
    const disciplineId = (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.disciplineId;
    const [selectedAge, setSelectedAge] = useState(AGE_GROUPS[0]);
    const [selectedGender, setSelectedGender] = useState(GENDERS[0]);
    const subtitle = useMemo(() => {
        const parts = [competitionName].filter(Boolean);
        return parts.length ? parts.join(' • ') : 'Select a category and gender';
    }, [competitionName]);
    const handleOpenVideos = () => {
        navigation.navigate('VideosForEvent', {
            eventName,
            eventId,
            competitionId: competitionId !== null && competitionId !== void 0 ? competitionId : eventId,
            disciplineId,
            division: selectedAge,
            gender: selectedGender,
        });
    };
    const handleOpenPhotos = () => {
        navigation.navigate('AllPhotosOfEvents', {
            eventName,
            eventId,
            competitionId: competitionId !== null && competitionId !== void 0 ? competitionId : eventId,
            disciplineId,
            division: selectedAge,
            gender: selectedGender,
        });
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: eventName })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(View, Object.assign({ style: styles.container }, { children: [_jsx(SizeBox, { height: 18 }), _jsx(Text, Object.assign({ style: styles.title }, { children: t('Choose category') })), _jsx(Text, Object.assign({ style: styles.subtitle }, { children: subtitle })), _jsx(SizeBox, { height: 20 }), _jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Category') })), _jsx(View, Object.assign({ style: styles.chipRow }, { children: AGE_GROUPS.map((item) => {
                            const active = item === selectedAge;
                            return (_jsx(TouchableOpacity, Object.assign({ style: [styles.chip, active && styles.chipActive], onPress: () => setSelectedAge(item) }, { children: _jsx(Text, Object.assign({ style: [styles.chipText, active && styles.chipTextActive] }, { children: item })) }), item));
                        }) })), _jsx(SizeBox, { height: 20 }), _jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Gender') })), _jsx(View, Object.assign({ style: styles.chipRow }, { children: GENDERS.map((item) => {
                            const active = item === selectedGender;
                            return (_jsx(TouchableOpacity, Object.assign({ style: [styles.chip, active && styles.chipActive], onPress: () => setSelectedGender(item) }, { children: _jsx(Text, Object.assign({ style: [styles.chipText, active && styles.chipTextActive] }, { children: item })) }), item));
                        }) })), _jsxs(View, Object.assign({ style: styles.buttonRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.primaryButton, onPress: handleOpenVideos }, { children: _jsx(Text, Object.assign({ style: styles.primaryButtonText }, { children: t('See videos') })) })), _jsx(TouchableOpacity, Object.assign({ style: styles.secondaryButton, onPress: handleOpenPhotos }, { children: _jsx(Text, Object.assign({ style: styles.secondaryButtonText }, { children: t('See photos') })) }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default EventDivisionScreen;
