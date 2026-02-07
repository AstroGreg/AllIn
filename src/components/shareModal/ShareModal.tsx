import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { createStyles } from './ShareModalStyles';
import { CloseCircle, Copy, TickCircle } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';

interface ShareModalProps {
    visible: boolean;
    onClose: () => void;
    shareUrl?: string;
}

const ShareModal = ({ visible, onClose, shareUrl = 'https://allin.app/profile/user123' }: ShareModalProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    const handleCopyLink = () => {
        setCopiedLink('main');
        setTimeout(() => setCopiedLink(null), 2000);
        Alert.alert('Copied!', 'Link copied to clipboard');
    };

    const handleCopyTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;
        setCopiedLink('twitter');
        setTimeout(() => setCopiedLink(null), 2000);
        Alert.alert('Copied!', 'Twitter share link copied');
    };

    const handleCopyFacebook = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        setCopiedLink('facebook');
        setTimeout(() => setCopiedLink(null), 2000);
        Alert.alert('Copied!', 'Facebook share link copied');
    };

    const handleCopyLinkedIn = () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        setCopiedLink('linkedin');
        setTimeout(() => setCopiedLink(null), 2000);
        Alert.alert('Copied!', 'LinkedIn share link copied');
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={Styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity activeOpacity={1} style={Styles.modalContainer}>
                    {/* Header */}
                    <View style={Styles.modalHeader}>
                        <Text style={Styles.modalTitle}>Share</Text>
                        <TouchableOpacity onPress={onClose} style={Styles.closeButton}>
                            <CloseCircle size={24} color={colors.grayColor} variant="Linear" />
                        </TouchableOpacity>
                    </View>

                    {/* Copy Link Card */}
                    <TouchableOpacity style={Styles.copyLinkCard} onPress={handleCopyLink}>
                        <View style={Styles.copyLinkContent}>
                            {copiedLink === 'main' ? (
                                <TickCircle size={24} color={colors.greenColor} variant="Bold" />
                            ) : (
                                <Copy size={24} color={colors.mainTextColor} variant="Linear" />
                            )}
                            <Text style={Styles.copyLinkTitle}>{copiedLink === 'main' ? 'Copied!' : 'Copy Link'}</Text>
                        </View>
                        <Text style={Styles.copyLinkSubtitle}>Copy the share link</Text>
                    </TouchableOpacity>

                    {/* Share on Social */}
                    <View style={Styles.socialSection}>
                        <Text style={Styles.socialTitle}>Share on Social</Text>
                        <View style={Styles.socialButtons}>
                            <TouchableOpacity style={Styles.socialButton} onPress={handleCopyTwitter}>
                                {copiedLink === 'twitter' ? (
                                    <TickCircle size={24} color={colors.greenColor} variant="Bold" />
                                ) : (
                                    <Copy size={24} color={colors.mainTextColor} variant="Linear" />
                                )}
                                <Text style={Styles.socialButtonText}>Twitter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.socialButton} onPress={handleCopyFacebook}>
                                {copiedLink === 'facebook' ? (
                                    <TickCircle size={24} color={colors.greenColor} variant="Bold" />
                                ) : (
                                    <Copy size={24} color={colors.mainTextColor} variant="Linear" />
                                )}
                                <Text style={Styles.socialButtonText}>Facebook</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.socialButton} onPress={handleCopyLinkedIn}>
                                {copiedLink === 'linkedin' ? (
                                    <TickCircle size={24} color={colors.greenColor} variant="Bold" />
                                ) : (
                                    <Copy size={24} color={colors.mainTextColor} variant="Linear" />
                                )}
                                <Text style={Styles.socialButtonText}>LinkedIn</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

export default ShareModal;
