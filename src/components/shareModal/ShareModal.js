import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { createStyles } from './ShareModalStyles';
import { CloseCircle, Copy, TickCircle } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const ShareModal = ({ visible, onClose, shareUrl = 'https://allin.app/profile/user123' }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [copiedLink, setCopiedLink] = useState(null);
    const handleCopyLink = () => {
        setCopiedLink('main');
        setTimeout(() => setCopiedLink(null), 2000);
        Alert.alert(t('Copied!'), t('Link copied to clipboard'));
    };
    const handleCopyTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;
        setCopiedLink('twitter');
        setTimeout(() => setCopiedLink(null), 2000);
        Alert.alert(t('Copied!'), t('Twitter share link copied'));
    };
    const handleCopyFacebook = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        setCopiedLink('facebook');
        setTimeout(() => setCopiedLink(null), 2000);
        Alert.alert(t('Copied!'), t('Facebook share link copied'));
    };
    const handleCopyLinkedIn = () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        setCopiedLink('linkedin');
        setTimeout(() => setCopiedLink(null), 2000);
        Alert.alert(t('Copied!'), t('LinkedIn share link copied'));
    };
    return (_jsx(Modal, Object.assign({ visible: visible, transparent: true, animationType: "fade", onRequestClose: onClose }, { children: _jsx(TouchableOpacity, Object.assign({ style: Styles.modalOverlay, activeOpacity: 1, onPress: onClose }, { children: _jsxs(TouchableOpacity, Object.assign({ activeOpacity: 1, style: Styles.modalContainer }, { children: [_jsxs(View, Object.assign({ style: Styles.modalHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: t('Share') })), _jsx(TouchableOpacity, Object.assign({ onPress: onClose, style: Styles.closeButton }, { children: _jsx(CloseCircle, { size: 24, color: colors.grayColor, variant: "Linear" }) }))] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.copyLinkCard, onPress: handleCopyLink }, { children: [_jsxs(View, Object.assign({ style: Styles.copyLinkContent }, { children: [copiedLink === 'main' ? (_jsx(TickCircle, { size: 24, color: colors.greenColor, variant: "Bold" })) : (_jsx(Copy, { size: 24, color: colors.mainTextColor, variant: "Linear" })), _jsx(Text, Object.assign({ style: Styles.copyLinkTitle }, { children: copiedLink === 'main' ? t('Copied!') : t('Copy Link') }))] })), _jsx(Text, Object.assign({ style: Styles.copyLinkSubtitle }, { children: t('Copy the share link') }))] })), _jsxs(View, Object.assign({ style: Styles.socialSection }, { children: [_jsx(Text, Object.assign({ style: Styles.socialTitle }, { children: t('Share on Social') })), _jsxs(View, Object.assign({ style: Styles.socialButtons }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.socialButton, onPress: handleCopyTwitter }, { children: [copiedLink === 'twitter' ? (_jsx(TickCircle, { size: 24, color: colors.greenColor, variant: "Bold" })) : (_jsx(Copy, { size: 24, color: colors.mainTextColor, variant: "Linear" })), _jsx(Text, Object.assign({ style: Styles.socialButtonText }, { children: t('Twitter') }))] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.socialButton, onPress: handleCopyFacebook }, { children: [copiedLink === 'facebook' ? (_jsx(TickCircle, { size: 24, color: colors.greenColor, variant: "Bold" })) : (_jsx(Copy, { size: 24, color: colors.mainTextColor, variant: "Linear" })), _jsx(Text, Object.assign({ style: Styles.socialButtonText }, { children: t('Facebook') }))] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.socialButton, onPress: handleCopyLinkedIn }, { children: [copiedLink === 'linkedin' ? (_jsx(TickCircle, { size: 24, color: colors.greenColor, variant: "Bold" })) : (_jsx(Copy, { size: 24, color: colors.mainTextColor, variant: "Linear" })), _jsx(Text, Object.assign({ style: Styles.socialButtonText }, { children: t('LinkedIn') }))] }))] }))] }))] })) })) })));
};
export default ShareModal;
