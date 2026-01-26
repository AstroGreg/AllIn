import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, Notification, TickCircle } from 'iconsax-react-nativejs'

interface PlanFeature {
    text: string;
    included: boolean;
}

interface Plan {
    name: string;
    price: string;
    period: string;
    credits?: string;
    features: PlanFeature[];
    isPopular?: boolean;
}

const Subscription = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [selectedTab, setSelectedTab] = useState<'monthly' | 'yearly'>('monthly');

    const monthlyPlans: Plan[] = [
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

    const yearlyPlans: Plan[] = [
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

    const renderPlanCard = (plan: Plan, index: number) => (
        <View key={index} style={[Styles.planCard, plan.isPopular && Styles.popularPlanCard]}>
            {plan.isPopular && (
                <View style={Styles.popularBadge}>
                    <Text style={Styles.popularBadgeText}>Popular</Text>
                </View>
            )}
            <Text style={Styles.planName}>{plan.name}</Text>
            <View style={Styles.priceRow}>
                <Text style={Styles.planPrice}>{plan.price}</Text>
                <Text style={Styles.planPeriod}>{plan.period}</Text>
            </View>
            {plan.credits && (
                <Text style={Styles.planCredits}>{plan.credits}</Text>
            )}
            <View style={Styles.featuresContainer}>
                {plan.features.map((feature, featureIndex) => (
                    <View key={featureIndex} style={Styles.featureRow}>
                        <TickCircle size={16} color={colors.primaryColor} variant="Bold" />
                        <Text style={Styles.featureText}>{feature.text}</Text>
                    </View>
                ))}
            </View>
            <TouchableOpacity style={[Styles.getStartedButton, plan.isPopular && Styles.popularGetStartedButton]}>
                <Text style={[Styles.getStartedButtonText, plan.isPopular && Styles.popularGetStartedButtonText]}>
                    Get started
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Subscription</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.subscriptionTitle}>Choose Your Plan</Text>
                <SizeBox height={20} />

                {/* Tab Toggle */}
                <View style={Styles.subscriptionTabContainer}>
                    <TouchableOpacity
                        style={[Styles.subscriptionTab, selectedTab === 'monthly' && Styles.subscriptionActiveTab]}
                        onPress={() => setSelectedTab('monthly')}
                    >
                        <Text style={[Styles.subscriptionTabText, selectedTab === 'monthly' && Styles.subscriptionActiveTabText]}>
                            Monthly
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.subscriptionTab, selectedTab === 'yearly' && Styles.subscriptionActiveTab]}
                        onPress={() => setSelectedTab('yearly')}
                    >
                        <Text style={[Styles.subscriptionTabText, selectedTab === 'yearly' && Styles.subscriptionActiveTabText]}>
                            Yearly
                        </Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={24} />

                {/* Plans */}
                {plans.map(renderPlanCard)}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default Subscription
