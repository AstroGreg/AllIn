import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Fonts from '../../constants/Fonts';
import { useTheme } from '../../context/ThemeContext';
import { getSportFocusLabel, } from '../../utils/profileSelections';
import SportFocusIcon from './SportFocusIcon';
const ROLE_COPY = {
    fan: 'Fan profile',
    parent: 'Parent profile',
    coach: 'Coach profile',
    supporter: 'Support profile',
    support: 'Support profile',
    family: 'Family profile',
};
const toTitleCase = (value) => value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
export function getSupportProfileBadgeLabel(role, t) {
    const normalized = String(role || '').trim().toLowerCase();
    const fallback = t ? t('Support profile') : 'Support profile';
    if (!normalized)
        return fallback;
    const predefined = ROLE_COPY[normalized];
    if (predefined)
        return t ? t(predefined) : predefined;
    const title = toTitleCase(String(role || '').trim());
    return title ? `${title} ${t ? t('profile') : 'profile'}` : fallback;
}
const SupportProfileSummary = ({ role, focuses, t }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => StyleSheet.create({
        card: {
            width: '100%',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            backgroundColor: colors.btnBackgroundColor,
            paddingHorizontal: 14,
            paddingVertical: 14,
            gap: 12,
        },
        topRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
        },
        roleBadge: {
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 7,
            backgroundColor: colors.primaryColor,
            alignSelf: 'flex-start',
        },
        roleBadgeText: Object.assign(Object.assign({}, Fonts.medium12), { color: colors.whiteColor }),
        subtitle: Object.assign(Object.assign({}, Fonts.regular11), { color: colors.subTextColor, flexShrink: 1, textAlign: 'right' }),
        focusWrap: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        focusChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            maxWidth: '100%',
            paddingHorizontal: 11,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: colors.backgroundColor,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
        },
        focusLabel: Object.assign(Object.assign({}, Fonts.medium12), { color: colors.mainTextColor, flexShrink: 1 }),
    }), [colors]);
    const badgeLabel = getSupportProfileBadgeLabel(role, t);
    const subtitle = focuses.length > 1 ? t('Multi-sport support') : t('Focused support');
    if (focuses.length === 0) {
        return (_jsx(View, Object.assign({ style: styles.card }, { children: _jsx(View, Object.assign({ style: styles.roleBadge }, { children: _jsx(Text, Object.assign({ style: styles.roleBadgeText }, { children: badgeLabel })) })) })));
    }
    return (_jsxs(View, Object.assign({ style: styles.card }, { children: [_jsxs(View, Object.assign({ style: styles.topRow }, { children: [_jsx(View, Object.assign({ style: styles.roleBadge }, { children: _jsx(Text, Object.assign({ style: styles.roleBadgeText }, { children: badgeLabel })) })), _jsx(Text, Object.assign({ style: styles.subtitle, numberOfLines: 1 }, { children: subtitle }))] })), _jsx(View, Object.assign({ style: styles.focusWrap }, { children: focuses.map((focusId) => (_jsxs(View, Object.assign({ style: styles.focusChip }, { children: [_jsx(SportFocusIcon, { focusId: focusId, size: 18 }), _jsx(Text, Object.assign({ style: styles.focusLabel, numberOfLines: 1 }, { children: getSportFocusLabel(focusId, t) }))] }), focusId))) }))] })));
};
export default SupportProfileSummary;
