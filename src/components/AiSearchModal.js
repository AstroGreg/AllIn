import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from '../constants/Icons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
const options = [
    {
        id: 'combined',
        labelKey: 'Combined',
        subtitleKey: 'Chest + face + context',
        color: '#0EA5E9',
        gradient: ['#0EA5E9', '#38BDF8'],
        icon: _jsx(Icons.AiWhiteSquare, { width: 22, height: 22 }),
    },
    {
        id: 'bib',
        labelKey: 'Chest number',
        subtitleKey: 'Find your photos by number',
        color: '#2563EB',
        gradient: ['#1D4ED8', '#60A5FA'],
        icon: _jsx(Icons.HashWhite, { width: 26, height: 26 }),
    },
    {
        id: 'face',
        labelKey: 'Face',
        subtitleKey: 'Use your face to match',
        color: '#4F46E5',
        gradient: ['#4338CA', '#818CF8'],
        icon: _jsx(Icons.FacescanWhite, { width: 26, height: 26 }),
    },
    {
        id: 'context',
        labelKey: 'Context',
        subtitleKey: 'Search by scene or moment',
        color: '#7C3AED',
        gradient: ['#6D28D9', '#A78BFA'],
        icon: _jsx(Icons.ImageWhite, { width: 26, height: 26 }),
    },
];
const createStyles = (colors, isDark) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
        justifyContent: 'flex-start',
    },
    background: Object.assign({}, StyleSheet.absoluteFillObject),
    container: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        width: '100%',
        alignSelf: 'stretch',
        alignItems: 'stretch',
    },
    content: {
        flex: 1,
        paddingTop: 18,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 18,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.btnBackgroundColor,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
    },
    headerPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: isDark ? 'rgba(60, 130, 246, 0.18)' : '#EAF1FF',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(60, 130, 246, 0.35)' : '#D7E6FF',
    },
    headerPillText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primaryColor,
        letterSpacing: 0.3,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.mainTextColor,
    },
    subtitle: {
        fontSize: 13,
        color: colors.subTextColor,
        marginTop: 6,
    },
    searchLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.subTextColor,
        marginBottom: 10,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    optionsList: {
        width: '100%',
        alignSelf: 'stretch',
        alignItems: 'stretch',
    },
    optionButton: {
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        width: '100%',
        alignSelf: 'stretch',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    },
    optionInner: {
        height: 96,
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    optionBackground: Object.assign({}, StyleSheet.absoluteFillObject),
    optionContent: {
        flex: 1,
        paddingHorizontal: 18,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0,
        backgroundColor: 'rgba(255,255,255,0.25)',
        marginRight: 12,
        flexShrink: 0,
    },
    optionTextWrap: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 8,
    },
    optionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.pureWhite,
        lineHeight: 20,
    },
    optionSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4,
        lineHeight: 16,
    },
});
const AiSearchModal = ({ visible, onClose, onSelect, title = 'AI Search' }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = createStyles(colors, colors.backgroundColor !== '#FFFFFF');
    const screenWidth = Dimensions.get('window').width;
    const translateX = useRef(new Animated.Value(-screenWidth)).current;
    const [isClosing, setIsClosing] = useState(false);
    useEffect(() => {
        if (visible) {
            setIsClosing(false);
            Animated.timing(translateX, {
                toValue: 0,
                duration: 240,
                useNativeDriver: true,
            }).start();
        }
        else {
            Animated.timing(translateX, {
                toValue: -screenWidth,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [screenWidth, translateX, visible]);
    const handleClose = () => {
        if (isClosing)
            return;
        setIsClosing(true);
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setIsClosing(false);
            onClose();
        });
    };
    return (_jsx(Modal, Object.assign({ visible: visible, transparent: true, animationType: "none", onRequestClose: handleClose }, { children: _jsxs(View, Object.assign({ style: styles.overlay }, { children: [_jsx(LinearGradient, { colors: colors.backgroundColor === '#FFFFFF'
                        ? ['#F4F8FF', '#FFFFFF']
                        : ['#0B1020', '#0A0F1E'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, style: styles.background }), _jsx(Animated.View, Object.assign({ style: [styles.container, { transform: [{ translateX }] }] }, { children: _jsxs(View, Object.assign({ style: [
                            styles.content,
                            { paddingTop: Math.max(insets.top + 8, 20), paddingBottom: Math.max(insets.bottom + 16, 24) },
                        ] }, { children: [_jsxs(View, Object.assign({ style: styles.header }, { children: [_jsxs(View, Object.assign({ style: styles.headerTopRow }, { children: [_jsx(TouchableOpacity, Object.assign({ onPress: handleClose, style: styles.backButton }, { children: _jsx(Icons.BackArrow, { width: 20, height: 20 }) })), _jsx(View, Object.assign({ style: styles.headerPill }, { children: _jsx(Text, Object.assign({ style: styles.headerPillText }, { children: t('AI SEARCH') })) }))] })), _jsx(Text, Object.assign({ style: styles.title }, { children: t(title) })), _jsx(Text, Object.assign({ style: styles.subtitle }, { children: t('Pick a mode for AI search') }))] })), _jsx(Text, Object.assign({ style: styles.searchLabel }, { children: t('Search by') })), _jsx(View, Object.assign({ style: styles.optionsList }, { children: options.map((option) => (_jsx(TouchableOpacity, Object.assign({ onPress: () => onSelect(option.id), activeOpacity: 0.85, style: styles.optionButton }, { children: _jsxs(View, Object.assign({ style: styles.optionInner }, { children: [_jsx(LinearGradient, { colors: option.gradient, style: styles.optionBackground }), _jsxs(View, Object.assign({ style: styles.optionContent }, { children: [_jsx(View, Object.assign({ style: styles.optionIconWrap }, { children: option.icon })), _jsxs(View, Object.assign({ style: styles.optionTextWrap }, { children: [_jsx(Text, Object.assign({ style: styles.optionButtonText }, { children: t(option.labelKey) })), _jsx(Text, Object.assign({ style: styles.optionSubtitle }, { children: t(option.subtitleKey) }))] }))] }))] })) }), option.id))) }))] })) }))] })) })));
};
export default AiSearchModal;
