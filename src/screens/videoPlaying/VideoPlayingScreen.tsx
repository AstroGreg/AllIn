import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {
    ArrowLeft2,
    ArrowRight,
    Calendar,
    More,
    Forward,
    TickCircle,
    CloseCircle,
} from 'iconsax-react-nativejs';
import { createStyles } from './VideoPlayingScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import SubscriptionModal from '../../components/subscriptionModal/SubscriptionModal';
import { useTheme } from '../../context/ThemeContext';

const VideoPlayingScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const showBuyModalOnLoad = route?.params?.showBuyModal || false;
    const videoPrice = route?.params?.video?.price || '€0,20';
    const video = route?.params?.video || {
        title: 'PK 800m 2023 indoor',
        subtitle: 'Senioren, Heat 1',
        thumbnail: Images.photo1,
    };

    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showFailedModal, setShowFailedModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    useEffect(() => {
        if (showBuyModalOnLoad) {
            setShowBuyModal(true);
        }
    }, [showBuyModalOnLoad]);

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
                <View style={Styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                    </TouchableOpacity>
                    <View style={Styles.calendarIconContainer}>
                        <Calendar size={18} color="#FFFFFF" variant="Linear" />
                    </View>
                    <View style={Styles.headerTitleContainer}>
                        <Text style={Styles.headerTitle}>{video.title}</Text>
                        <Text style={Styles.headerSubtitle}>{video.subtitle}</Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <More size={24} color={colors.mainTextColor} variant="Linear" style={{ transform: [{ rotate: '90deg' }] }} />
                </TouchableOpacity>
            </View>

            {/* Question Card */}
            <View style={Styles.questionCard}>
                <Text style={Styles.questionText}>Is this video of you or another person</Text>
                <View style={Styles.buttonsRow}>
                    <TouchableOpacity style={Styles.noButton}>
                        <Text style={Styles.buttonText}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.yesButton}>
                        <Text style={Styles.buttonText}>Yes</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Video Container */}
            <View style={Styles.videoContainer}>
                <FastImage
                    source={video.thumbnail}
                    style={Styles.videoImage}
                    resizeMode="cover"
                />

                {/* Side Actions */}
                <View style={Styles.sideActions}>
                    <TouchableOpacity style={Styles.actionButton}>
                        <Icons.DownloadBlue width={25} height={25} />
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.actionButton}>
                        <Image source={Icons.ShareBlue} style={{ width: 25, height: 25 }} />
                    </TouchableOpacity>
                </View>

                {/* Video Controls */}
                <View style={Styles.controlsContainer}>
                    {/* Progress Bar */}
                    <View style={Styles.progressBarContainer}>
                        <View style={Styles.progressBarBackground}>
                            <View style={Styles.progressBarFill} />
                        </View>
                        <View style={Styles.progressThumb} />
                    </View>

                    {/* Control Buttons */}
                    <View style={Styles.controlButtons}>
                        <TouchableOpacity style={Styles.skipButton}>
                            <Forward size={28} color={colors.primaryColor} variant="Bold" style={{ transform: [{ rotate: '180deg' }] }} />
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.playButton}>
                            <Icons.PlayCricle width={46} height={46} />
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.skipButton}>
                            <Forward size={28} color={colors.primaryColor} variant="Bold" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />

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
                            source={video.thumbnail}
                            style={Styles.modalImage}
                            resizeMode="cover"
                        />
                        <View style={Styles.modalInfoRow}>
                            <Text style={Styles.modalTitle}>{video.title}</Text>
                            <Text style={Styles.modalPrice}>{videoPrice}</Text>
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
                            <ArrowRight size={18} color="#FFFFFF" variant="Linear" />
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

export default VideoPlayingScreen;
