import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from './ProfileTimelineDetailStyles';
import { useTranslation } from 'react-i18next';
const ProfileTimelineDetailScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const item = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.item;
    const ownerName = ((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.ownerName) || t('Profile');
    const displayPhotos = Array.isArray(item === null || item === void 0 ? void 0 : item.photos) && item.photos.length > 0
        ? item.photos
        : Array.isArray(item === null || item === void 0 ? void 0 : item.mediaItems)
            ? item.mediaItems
                .map((media) => (media === null || media === void 0 ? void 0 : media.thumbnail_url) || (media === null || media === void 0 ? void 0 : media.preview_url) || (media === null || media === void 0 ? void 0 : media.full_url) || (media === null || media === void 0 ? void 0 : media.raw_url))
                .filter(Boolean)
            : [];
    const linkedBlogs = Array.isArray(item === null || item === void 0 ? void 0 : item.linkedBlogs) ? item.linkedBlogs : [];
    const linkedCompetitions = Array.isArray(item === null || item === void 0 ? void 0 : item.linkedCompetitions) ? item.linkedCompetitions : [];
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Timeline') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(ScrollView, Object.assign({ contentContainerStyle: Styles.scrollContent, showsVerticalScrollIndicator: false }, { children: [_jsx(Text, Object.assign({ style: Styles.ownerText }, { children: ownerName })), _jsxs(View, Object.assign({ style: Styles.heroCard }, { children: [_jsx(Text, Object.assign({ style: Styles.yearBadge }, { children: (_c = item === null || item === void 0 ? void 0 : item.year) !== null && _c !== void 0 ? _c : '—' })), _jsx(Text, Object.assign({ style: Styles.titleText }, { children: (_d = item === null || item === void 0 ? void 0 : item.title) !== null && _d !== void 0 ? _d : t('Timeline highlight') })), (item === null || item === void 0 ? void 0 : item.date) ? (_jsx(Text, Object.assign({ style: Styles.metaText }, { children: new Date(String(item.date)).toLocaleString() }))) : null, _jsx(Text, Object.assign({ style: Styles.descriptionText }, { children: (_e = item === null || item === void 0 ? void 0 : item.description) !== null && _e !== void 0 ? _e : '' })), (item === null || item === void 0 ? void 0 : item.highlight) ? (_jsx(View, Object.assign({ style: Styles.highlightChip }, { children: _jsx(Text, Object.assign({ style: Styles.highlightText }, { children: item.highlight })) }))) : null, displayPhotos.length > 0 && (_jsx(ScrollView, Object.assign({ horizontal: true, showsHorizontalScrollIndicator: false, style: Styles.photoRow }, { children: displayPhotos.map((uri, idx) => (_jsx(Image, { source: { uri }, style: Styles.photoThumb }, `${item === null || item === void 0 ? void 0 : item.id}-photo-${idx}`))) }))), linkedBlogs.length || linkedCompetitions.length ? (_jsxs(View, Object.assign({ style: Styles.linkSection }, { children: [linkedBlogs.length ? (_jsxs(View, Object.assign({ style: Styles.linkGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.linkTitle }, { children: t('Blogs') })), _jsx(View, Object.assign({ style: Styles.linkRow }, { children: linkedBlogs.map((label) => {
                                                    var _a;
                                                    const text = typeof label === 'string' ? label : String((_a = label === null || label === void 0 ? void 0 : label.title) !== null && _a !== void 0 ? _a : '');
                                                    return (_jsx(View, Object.assign({ style: Styles.linkChip }, { children: _jsx(Text, Object.assign({ style: Styles.linkChipText }, { children: text })) }), text));
                                                }) }))] }))) : null, linkedCompetitions.length ? (_jsxs(View, Object.assign({ style: Styles.linkGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.linkTitle }, { children: t('Competitions') })), _jsx(View, Object.assign({ style: Styles.linkRow }, { children: linkedCompetitions.map((label) => {
                                                    var _a;
                                                    const text = typeof label === 'string' ? label : String((_a = label === null || label === void 0 ? void 0 : label.title) !== null && _a !== void 0 ? _a : '');
                                                    return (_jsx(View, Object.assign({ style: Styles.linkChip }, { children: _jsx(Text, Object.assign({ style: Styles.linkChipText }, { children: text })) }), text));
                                                }) }))] }))) : null] }))) : null] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 16 : 32 })] }))] })));
};
export default ProfileTimelineDetailScreen;
