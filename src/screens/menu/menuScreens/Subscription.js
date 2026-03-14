import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Notification, TickCircle } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next';
const Subscription = ({ navigation, route }) => {
    var _a;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [selectedTab, setSelectedTab] = useState('monthly');
    const redirectTo = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.redirectTo;
    const handleGetStarted = () => {
        if (redirectTo) {
            navigation.navigate('BottomTabBar', { screen: 'Search', params: { screen: 'AISearchScreen' } });
            return;
        }
        navigation.goBack();
    };
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
    const renderPlanCard = (plan, index) => (_jsxs(View, Object.assign({ style: [Styles.planCard, plan.isPopular && Styles.popularPlanCard] }, { children: [plan.isPopular && (_jsx(View, Object.assign({ style: Styles.popularBadge }, { children: _jsx(Text, Object.assign({ style: Styles.popularBadgeText }, { children: t('Popular') })) }))), _jsx(Text, Object.assign({ style: Styles.planName }, { children: t(plan.name) })), _jsxs(View, Object.assign({ style: Styles.priceRow }, { children: [_jsx(Text, Object.assign({ style: Styles.planPrice }, { children: plan.price })), _jsx(Text, Object.assign({ style: Styles.planPeriod }, { children: t(plan.period) }))] })), plan.credits && (_jsx(Text, Object.assign({ style: Styles.planCredits }, { children: t(plan.credits) }))), _jsx(View, Object.assign({ style: Styles.featuresContainer }, { children: plan.features.map((feature, featureIndex) => (_jsxs(View, Object.assign({ style: Styles.featureRow }, { children: [_jsx(TickCircle, { size: 16, color: colors.primaryColor, variant: "Bold" }), _jsx(Text, Object.assign({ style: Styles.featureText }, { children: t(feature.text) }))] }), featureIndex))) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.getStartedButton, plan.isPopular && Styles.popularGetStartedButton], onPress: handleGetStarted }, { children: _jsx(Text, Object.assign({ style: [Styles.getStartedButtonText, plan.isPopular && Styles.popularGetStartedButtonText] }, { children: t('Get started') })) }))] }), index));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Subscription') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton }, { children: _jsx(Notification, { size: 24, color: colors.primaryColor, variant: "Linear" }) }))] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.subscriptionTitle }, { children: t('Choose Your Plan') })), _jsx(SizeBox, { height: 20 }), _jsxs(View, Object.assign({ style: Styles.subscriptionTabContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [Styles.subscriptionTab, selectedTab === 'monthly' && Styles.subscriptionActiveTab], onPress: () => setSelectedTab('monthly') }, { children: _jsx(Text, Object.assign({ style: [Styles.subscriptionTabText, selectedTab === 'monthly' && Styles.subscriptionActiveTabText] }, { children: t('Monthly') })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.subscriptionTab, selectedTab === 'yearly' && Styles.subscriptionActiveTab], onPress: () => setSelectedTab('yearly') }, { children: _jsx(Text, Object.assign({ style: [Styles.subscriptionTabText, selectedTab === 'yearly' && Styles.subscriptionActiveTabText] }, { children: t('Yearly') })) }))] })), _jsx(SizeBox, { height: 24 }), plans.map(renderPlanCard), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default Subscription;
