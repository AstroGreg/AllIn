import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './CompetitionAthletesStyles';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const EventAthletesScreen = ({ navigation, route }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const event = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.event) || { title: t('City Run Marathon') };
    const athletes = [
        { id: 1, name: 'James Ray', eventType: 'Half Marathon' },
        { id: 2, name: 'Jhon Smith', eventType: 'Marathon' },
    ];
    const renderAthleteRow = (athlete) => (_jsxs(View, Object.assign({ style: styles.athleteRow }, { children: [_jsx(FastImage, { source: Images.profilePic, style: styles.athleteAvatar, resizeMode: "cover" }), _jsx(Text, Object.assign({ style: styles.athleteName }, { children: athlete.name })), _jsx(Text, Object.assign({ style: styles.athleteEventType }, { children: athlete.eventType }))] }), athlete.id));
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Athletes is Participating') })), _jsx(View, { style: styles.headerButtonPlaceholder })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [_jsxs(Text, Object.assign({ style: styles.competitionTitle }, { children: [t('Competition'), ": ", event.title] })), _jsx(Text, Object.assign({ style: styles.athletesSectionTitle }, { children: t('Athletes') })), _jsx(View, Object.assign({ style: styles.athletesCard }, { children: athletes.map(renderAthleteRow) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default EventAthletesScreen;
