import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, Eye, MoreCircle, ArrowRight, TickCircle, CloseCircle } from 'iconsax-react-nativejs';
import LinearGradient from 'react-native-linear-gradient';
import { createStyles } from './PhotoBuyScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import SubscriptionModal from '../../components/subscriptionModal/SubscriptionModal';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const PhotoBuyScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showFailedModal, setShowFailedModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const eventTitle = route?.params?.eventTitle || 'BK Studentent 23';
    const photoPrice = route?.params?.photo?.price || '€0,20';
    const photo = route?.params?.photo || {
        title: 'PK 2025 indoor Passionate',
        views: '122K+',
        thumbnail: Images.photo1,
    };

    const handlePay = () => {
        setShowBuyModal(false);
        setShowSuccessModal(true);
    };

    const handleCancel = () => {
        setShowBuyModal(false);
        setShowFailedModal(true);
    };

    const handleDownload = () => {
        setShowSuccessModal(false);
        // Handle download logic here
    };

    const handleRecharge = () => {
        setShowFailedModal(false);
        setShowSubscriptionModal(true);
    };

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{eventTitle}</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                {/* Photo Preview */}
                <View style={styles.photoContainer}>
                    <FastImage
                        source={photo.thumbnail}
                        style={styles.photoImage}
                        resizeMode="cover"
                    />

                    {/* Top Row - Views and More */}
                    <View style={styles.topRow}>
                        <View style={styles.viewsContainer}>
                            <Eye size={24} color={colors.pureWhite} variant="Linear" />
                            <Text style={styles.viewsText}>{photo.views}</Text>
                        </View>
                        <TouchableOpacity>
                            <MoreCircle size={24} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Gradient and Info */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
                        locations={[0, 0.74, 1]}
                        style={styles.gradientOverlay}
                    >
                        <View style={styles.bottomRow}>
                            <Text style={styles.photoTitle}>{photo.title}</Text>
                            <TouchableOpacity
                                style={styles.buyButton}
                                onPress={() => setShowBuyModal(true)}
                            >
                                <Text style={styles.buyButtonText}>{t('Buy')}</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </View>

            {/* Buy Modal */}
            <Modal
                visible={showBuyModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowBuyModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <FastImage
                            source={photo.thumbnail}
                            style={styles.modalImage}
                            resizeMode="cover"
                        />
                        <View style={styles.modalInfoRow}>
                            <Text style={styles.modalTitle}>{eventTitle}</Text>
                            <Text style={styles.modalPrice}>{photoPrice}</Text>
                        </View>
                        <View style={styles.modalDivider} />
                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleCancel}
                            >
                                <Text style={styles.modalButtonText}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.payButton}
                                onPress={handlePay}
                            >
                                <Text style={styles.modalButtonText}>{t('Pay')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.successModalContainer}>
                        <View style={styles.successIconContainer}>
                            <TickCircle size={50} color="#00BD48" variant="Bold" />
                        </View>
                        <Text style={styles.successTitle}>{t('Accepted')}</Text>
                        <Text style={styles.successSubtitle}>
                            {t('Photo added to your account. Resale is prohibited.')}
                        </Text>
                        <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={handleDownload}
                        >
                            <Text style={styles.downloadButtonText}>{t('Download')}</Text>
                            <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Failed Modal */}
            <Modal
                visible={showFailedModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowFailedModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.failedModalContainer}>
                        <View style={styles.failedIconContainer}>
                            <CloseCircle size={50} color="#ED5454" variant="Bold" />
                        </View>
                        <Text style={styles.failedTitle}>{t('Failed')}</Text>
                        <Text style={styles.failedSubtitle}>
                            {t('Insufficient balance. Please recharge.')}
                        </Text>
                        <View style={styles.failedButtonsRow}>
                            <TouchableOpacity
                                style={styles.failedCancelButton}
                                onPress={() => setShowFailedModal(false)}
                            >
                                <Text style={styles.failedButtonText}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.rechargeButton}
                                onPress={handleRecharge}
                            >
                                <Text style={styles.failedButtonText}>{t('Recharge')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <SubscriptionModal
                isVisible={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
            />
        </View>
    );
};

export default PhotoBuyScreen;
