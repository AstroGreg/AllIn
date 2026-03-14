import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { createStyles } from './SubscriptionModalStyles';
import SizeBox from '../../constants/SizeBox';
import { CloseCircle, TickCircle } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const SubscriptionModal = ({ isVisible, onClose }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [selectedTab, setSelectedTab] = useState('monthly');
    const monthlyPlans = [
        {
            name: 'Basic',
            price: '€5',
            period: '/month',
            features: [
                { text: 'Access to all basic features', included: true },
                { text: 'Basic reporting and analytics', included: true },
                { text: 'Up to 10 individual users', included: true },
                { text: '20GB individual data each user', included: true },
                { text: 'Basic chat and email support', included: true },
            ],
        },
        {
            name: 'Premium',
            price: '€10',
            period: '/month',
            credits: '€2 photo credits',
            isPopular: true,
            features: [
                { text: '200+ integrations', included: true },
                { text: 'Advanced reporting and analytics', included: true },
                { text: 'Up to 20 individual users', included: true },
                { text: '40GB individual data each user', included: true },
                { text: 'Priority chat and email support', included: true },
            ],
        },
        {
            name: 'Premium Plus',
            price: '€80',
            period: '/month',
            credits: '€5 photo credits',
            features: [
                { text: 'Advanced custom fields', included: true },
                { text: 'Audit log and data history', included: true },
                { text: 'Unlimited individual users', included: true },
                { text: 'Unlimited individual data', included: true },
                { text: 'Personalised+priority service', included: true },
            ],
        },
    ];
    const yearlyPlans = [
        {
            name: 'Premium',
            price: '€50',
            period: '/year',
            isPopular: true,
            features: [
                { text: '200+ integrations', included: true },
                { text: 'Advanced reporting and analytics', included: true },
                { text: 'Up to 20 individual users', included: true },
                { text: '40GB individual data each user', included: true },
                { text: 'Priority chat and email support', included: true },
            ],
        },
        {
            name: 'Premium Plus',
            price: '€800',
            period: '/year',
            features: [
                { text: 'Advanced custom fields', included: true },
                { text: 'Audit log and data history', included: true },
                { text: 'Unlimited individual users', included: true },
                { text: 'Unlimited individual data', included: true },
                { text: 'Personalised+priority service', included: true },
            ],
        },
    ];
    const plans = selectedTab === 'monthly' ? monthlyPlans : yearlyPlans;
    const renderPlanCard = (plan, index) => (_jsxs(View, Object.assign({ style: [Styles.planCard, plan.isPopular && Styles.popularPlanCard] }, { children: [plan.isPopular && (_jsx(View, Object.assign({ style: Styles.popularBadge }, { children: _jsx(Text, Object.assign({ style: Styles.popularBadgeText }, { children: t('Popular') })) }))), _jsx(Text, Object.assign({ style: Styles.planName }, { children: t(plan.name) })), _jsxs(View, Object.assign({ style: Styles.priceRow }, { children: [_jsx(Text, Object.assign({ style: Styles.planPrice }, { children: plan.price })), _jsx(Text, Object.assign({ style: Styles.planPeriod }, { children: t(plan.period) }))] })), plan.credits && (_jsx(Text, Object.assign({ style: Styles.planCredits }, { children: t(plan.credits) }))), _jsx(View, Object.assign({ style: Styles.featuresContainer }, { children: plan.features.map((feature, featureIndex) => (_jsxs(View, Object.assign({ style: Styles.featureRow }, { children: [_jsx(TickCircle, { size: 16, color: colors.primaryColor, variant: "Bold" }), _jsx(Text, Object.assign({ style: Styles.featureText }, { children: t(feature.text) }))] }), featureIndex))) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.getStartedButton, plan.isPopular && Styles.popularGetStartedButton] }, { children: _jsx(Text, Object.assign({ style: [Styles.getStartedButtonText, plan.isPopular && Styles.popularGetStartedButtonText] }, { children: t('Get started') })) }))] }), index));
    return (_jsx(Modal, Object.assign({ visible: isVisible, onRequestClose: onClose, transparent: true, animationType: "slide" }, { children: _jsx(View, Object.assign({ style: Styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: Styles.modalContainer }, { children: [_jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Choose Your Plan') })), _jsx(TouchableOpacity, Object.assign({ onPress: onClose, style: Styles.closeButton }, { children: _jsx(CloseCircle, { size: 24, color: colors.mainTextColor, variant: "Linear" }) }))] })), _jsx(SizeBox, { height: 20 }), _jsxs(View, Object.assign({ style: Styles.tabContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [Styles.tab, selectedTab === 'monthly' && Styles.activeTab], onPress: () => setSelectedTab('monthly') }, { children: _jsx(Text, Object.assign({ style: [Styles.tabText, selectedTab === 'monthly' && Styles.activeTabText] }, { children: t('Monthly') })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.tab, selectedTab === 'yearly' && Styles.activeTab], onPress: () => setSelectedTab('yearly') }, { children: _jsx(Text, Object.assign({ style: [Styles.tabText, selectedTab === 'yearly' && Styles.activeTabText] }, { children: t('Yearly') })) }))] })), _jsx(SizeBox, { height: 20 }), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.plansContainer }, { children: [plans.map(renderPlanCard), _jsx(SizeBox, { height: 20 })] }))] })) })) })));
};
export default SubscriptionModal;
