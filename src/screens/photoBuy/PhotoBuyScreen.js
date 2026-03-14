import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
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
const PhotoBuyScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showFailedModal, setShowFailedModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const eventTitle = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.eventTitle) || 'BK Studentent 23';
    const photoPrice = ((_c = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.photo) === null || _c === void 0 ? void 0 : _c.price) || '€0,20';
    const photo = ((_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.photo) || {
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
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: eventTitle })), _jsx(View, { style: styles.placeholder })] })), _jsx(View, Object.assign({ style: styles.content }, { children: _jsxs(View, Object.assign({ style: styles.photoContainer }, { children: [_jsx(FastImage, { source: photo.thumbnail, style: styles.photoImage, resizeMode: "cover" }), _jsxs(View, Object.assign({ style: styles.topRow }, { children: [_jsxs(View, Object.assign({ style: styles.viewsContainer }, { children: [_jsx(Eye, { size: 24, color: colors.pureWhite, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.viewsText }, { children: photo.views }))] })), _jsx(TouchableOpacity, { children: _jsx(MoreCircle, { size: 24, color: colors.pureWhite, variant: "Linear" }) })] })), _jsx(LinearGradient, Object.assign({ colors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)'], locations: [0, 0.74, 1], style: styles.gradientOverlay }, { children: _jsxs(View, Object.assign({ style: styles.bottomRow }, { children: [_jsx(Text, Object.assign({ style: styles.photoTitle }, { children: photo.title })), _jsx(TouchableOpacity, Object.assign({ style: styles.buyButton, onPress: () => setShowBuyModal(true) }, { children: _jsx(Text, Object.assign({ style: styles.buyButtonText }, { children: t('Buy') })) }))] })) }))] })) })), _jsx(Modal, Object.assign({ visible: showBuyModal, transparent: true, animationType: "fade", onRequestClose: () => setShowBuyModal(false) }, { children: _jsx(View, Object.assign({ style: styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: styles.modalContainer }, { children: [_jsx(FastImage, { source: photo.thumbnail, style: styles.modalImage, resizeMode: "cover" }), _jsxs(View, Object.assign({ style: styles.modalInfoRow }, { children: [_jsx(Text, Object.assign({ style: styles.modalTitle }, { children: eventTitle })), _jsx(Text, Object.assign({ style: styles.modalPrice }, { children: photoPrice }))] })), _jsx(View, { style: styles.modalDivider }), _jsxs(View, Object.assign({ style: styles.modalButtonsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.cancelButton, onPress: handleCancel }, { children: _jsx(Text, Object.assign({ style: styles.modalButtonText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: styles.payButton, onPress: handlePay }, { children: _jsx(Text, Object.assign({ style: styles.modalButtonText }, { children: t('Pay') })) }))] }))] })) })) })), _jsx(Modal, Object.assign({ visible: showSuccessModal, transparent: true, animationType: "fade", onRequestClose: () => setShowSuccessModal(false) }, { children: _jsx(View, Object.assign({ style: styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: styles.successModalContainer }, { children: [_jsx(View, Object.assign({ style: styles.successIconContainer }, { children: _jsx(TickCircle, { size: 50, color: "#00BD48", variant: "Bold" }) })), _jsx(Text, Object.assign({ style: styles.successTitle }, { children: t('Accepted') })), _jsx(Text, Object.assign({ style: styles.successSubtitle }, { children: t('Photo added to your account. Resale is prohibited.') })), _jsxs(TouchableOpacity, Object.assign({ style: styles.downloadButton, onPress: handleDownload }, { children: [_jsx(Text, Object.assign({ style: styles.downloadButtonText }, { children: t('Download') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] }))] })) })) })), _jsx(Modal, Object.assign({ visible: showFailedModal, transparent: true, animationType: "fade", onRequestClose: () => setShowFailedModal(false) }, { children: _jsx(View, Object.assign({ style: styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: styles.failedModalContainer }, { children: [_jsx(View, Object.assign({ style: styles.failedIconContainer }, { children: _jsx(CloseCircle, { size: 50, color: "#ED5454", variant: "Bold" }) })), _jsx(Text, Object.assign({ style: styles.failedTitle }, { children: t('Failed') })), _jsx(Text, Object.assign({ style: styles.failedSubtitle }, { children: t('Insufficient balance. Please recharge.') })), _jsxs(View, Object.assign({ style: styles.failedButtonsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.failedCancelButton, onPress: () => setShowFailedModal(false) }, { children: _jsx(Text, Object.assign({ style: styles.failedButtonText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: styles.rechargeButton, onPress: handleRecharge }, { children: _jsx(Text, Object.assign({ style: styles.failedButtonText }, { children: t('Recharge') })) }))] }))] })) })) })), _jsx(SubscriptionModal, { isVisible: showSubscriptionModal, onClose: () => setShowSubscriptionModal(false) })] })));
};
export default PhotoBuyScreen;
