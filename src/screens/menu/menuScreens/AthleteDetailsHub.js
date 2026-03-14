import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react-nativejs';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import SportFocusIcon from '../../../components/profile/SportFocusIcon';
import { getDisciplineLabel, getMainDisciplineForFocus, getSportFocusLabel, normalizeMainDisciplines, normalizeSelectedEvents, } from '../../../utils/profileSelections';
const AthleteDetailsHub = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const { userProfile } = useAuth();
    const selectedFocuses = useMemo(() => { var _a; return normalizeSelectedEvents((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents) !== null && _a !== void 0 ? _a : []); }, [userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents]);
    const mainDisciplines = useMemo(() => {
        var _a, _b, _c;
        return normalizeMainDisciplines((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.mainDisciplines) !== null && _a !== void 0 ? _a : {}, {
            trackFieldMainEvent: (_b = userProfile === null || userProfile === void 0 ? void 0 : userProfile.trackFieldMainEvent) !== null && _b !== void 0 ? _b : null,
            roadTrailMainEvent: (_c = userProfile === null || userProfile === void 0 ? void 0 : userProfile.roadTrailMainEvent) !== null && _c !== void 0 ? _c : null,
        });
    }, [userProfile]);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Athlete details') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.inlineHelperText }, { children: t('Choose the athlete focus you want to edit. Each focus keeps its own settings screen.') })), _jsx(SizeBox, { height: 18 }), selectedFocuses.map((focusId) => {
                        var _a, _b;
                        const mainDiscipline = getMainDisciplineForFocus(mainDisciplines, focusId, {
                            trackFieldMainEvent: (_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.trackFieldMainEvent) !== null && _a !== void 0 ? _a : null,
                            roadTrailMainEvent: (_b = userProfile === null || userProfile === void 0 ? void 0 : userProfile.roadTrailMainEvent) !== null && _b !== void 0 ? _b : null,
                        });
                        const subtitle = mainDiscipline
                            ? getDisciplineLabel(focusId, mainDiscipline, t)
                            : t('No main discipline set yet');
                        return (_jsxs(React.Fragment, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.accountSettingsCard, onPress: () => navigation.navigate('TrackFieldSettings', { focusId }) }, { children: [_jsxs(View, Object.assign({ style: Styles.accountSettingsLeft }, { children: [_jsx(View, Object.assign({ style: Styles.accountSettingsIconContainer }, { children: _jsx(SportFocusIcon, { focusId: focusId, size: 22, color: colors.primaryColor }) })), _jsx(SizeBox, { width: 20 }), _jsxs(View, Object.assign({ style: { flex: 1, minWidth: 0, paddingRight: 12 } }, { children: [_jsx(Text, Object.assign({ style: Styles.accountSettingsTitle, numberOfLines: 1 }, { children: getSportFocusLabel(focusId, t) })), _jsx(Text, Object.assign({ style: [Styles.inlineHelperText, { marginTop: 2, marginLeft: 0 }], numberOfLines: 2 }, { children: subtitle }))] }))] })), _jsx(View, Object.assign({ style: Styles.accountSettingsArrowWrap }, { children: _jsx(ArrowRight2, { size: 22, color: colors.grayColor, variant: "Linear" }) }))] })), _jsx(SizeBox, { height: 16 })] }, focusId));
                    }), selectedFocuses.length === 0 ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.inlineHelperText }, { children: t('Add an athlete focus first to edit athlete details.') })), _jsx(SizeBox, { height: 16 })] })) : null, _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default AthleteDetailsHub;
