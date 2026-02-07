import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, Eye, MoreCircle, ArrowRight, TickCircle, CloseCircle } from 'iconsax-react-nativejs';
import LinearGradient from 'react-native-linear-gradient';
import Styles from './PhotoBuyScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Images from '../../constants/Images';
import SubscriptionModal from '../../components/subscriptionModal/SubscriptionModal';

const PhotoBuyScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
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
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{eventTitle}</Text>
                <View style={Styles.placeholder} />
            </View>

            <View style={Styles.content}>
                {/* Photo Preview */}
                <View style={Styles.photoContainer}>
                    <FastImage
                        source={photo.thumbnail}
                        style={Styles.photoImage}
                        resizeMode="cover"
                    />

                    {/* Top Row - Views and More */}
                    <View style={Styles.topRow}>
                        <View style={Styles.viewsContainer}>
                            <Eye size={24} color={Colors.whiteColor} variant="Linear" />
                            <Text style={Styles.viewsText}>{photo.views}</Text>
                        </View>
                        <TouchableOpacity>
                            <MoreCircle size={24} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Gradient and Info */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
                        locations={[0, 0.74, 1]}
                        style={Styles.gradientOverlay}
                    >
                        <View style={Styles.bottomRow}>
                            <Text style={Styles.photoTitle}>{photo.title}</Text>
                            <TouchableOpacity
                                style={Styles.buyButton}
                                onPress={() => setShowBuyModal(true)}
                            >
                                <Text style={Styles.buyButtonText}>Buy</Text>
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
                <View style={Styles.modalOverlay}>
                    <View style={Styles.modalContainer}>
                        <FastImage
                            source={photo.thumbnail}
                            style={Styles.modalImage}
                            resizeMode="cover"
                        />
                        <View style={Styles.modalInfoRow}>
                            <Text style={Styles.modalTitle}>{eventTitle}</Text>
                            <Text style={Styles.modalPrice}>{photoPrice}</Text>
                        </View>
                        <View style={Styles.modalDivider} />
                        <View style={Styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={Styles.cancelButton}
                                onPress={handleCancel}
                            >
                                <Text style={Styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.payButton}
                                onPress={handlePay}
                            >
                                <Text style={Styles.modalButtonText}>Pay</Text>
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
                <View style={Styles.modalOverlay}>
                    <View style={Styles.successModalContainer}>
                        <View style={Styles.successIconContainer}>
                            <TickCircle size={50} color="#00BD48" variant="Bold" />
                        </View>
                        <Text style={Styles.successTitle}>Accepted</Text>
                        <Text style={Styles.successSubtitle}>
                            Photo added to your account. Resale is prohibited.
                        </Text>
                        <TouchableOpacity
                            style={Styles.downloadButton}
                            onPress={handleDownload}
                        >
                            <Text style={Styles.downloadButtonText}>Download</Text>
                            <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
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
                <View style={Styles.modalOverlay}>
                    <View style={Styles.failedModalContainer}>
                        <View style={Styles.failedIconContainer}>
                            <CloseCircle size={50} color="#ED5454" variant="Bold" />
                        </View>
                        <Text style={Styles.failedTitle}>Failed</Text>
                        <Text style={Styles.failedSubtitle}>
                            Insufficient balance. Please recharge.
                        </Text>
                        <View style={Styles.failedButtonsRow}>
                            <TouchableOpacity
                                style={Styles.failedCancelButton}
                                onPress={() => setShowFailedModal(false)}
                            >
                                <Text style={Styles.failedButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.rechargeButton}
                                onPress={handleRecharge}
                            >
                                <Text style={Styles.failedButtonText}>Recharge</Text>
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
