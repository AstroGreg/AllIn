import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gallery, Profile2User, User, ArrowLeft2, ArrowRight, TickCircle } from 'iconsax-react-nativejs';
import { createStyles } from './CategorySelectionScreenStyles';
import SizeBox from '../../constants/SizeBox';
import CustomButton from '../../components/customButton/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getSportFocusDefinitions, normalizeSelectedEvents } from '../../utils/profileSelections';

interface CategoryOption {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    iconSelected: React.ReactNode;
}

const CategorySelectionScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { userProfile } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState<'find' | 'manage' | 'support'>('find');
    const [isLoading, setIsLoading] = useState(false);
    const fromAddFlow = Boolean(route?.params?.fromAddFlow);
    const linkedFocuses = useMemo(
        () => normalizeSelectedEvents(userProfile?.selectedEvents ?? []),
        [userProfile?.selectedEvents],
    );
    const hasSupportProfile = useMemo(() => {
        return (
            String((userProfile as any)?.supportRole ?? '').trim().length > 0 ||
            (Array.isArray((userProfile as any)?.supportClubCodes) && (userProfile as any).supportClubCodes.length > 0) ||
            (Array.isArray((userProfile as any)?.supportGroupIds) && (userProfile as any).supportGroupIds.length > 0) ||
            (Array.isArray((userProfile as any)?.supportAthletes) && (userProfile as any).supportAthletes.length > 0) ||
            (Array.isArray((userProfile as any)?.supportFocuses) && (userProfile as any).supportFocuses.length > 0) ||
            userProfile?.category === 'support'
        );
    }, [userProfile]);
    const canAddAthleteProfile = useMemo(() => {
        return getSportFocusDefinitions().some((focus) => !linkedFocuses.includes(focus.id));
    }, [linkedFocuses]);

    const categories = useMemo<CategoryOption[]>(() => [
        {
            id: 'find',
            title: t('Athlete'),
            subtitle: t('Athlete profile'),
            description: t('Set up a personal profile to manage your sports focus, results, and media.'),
            icon: <Gallery size={24} color={colors.grayColor} />,
            iconSelected: <Gallery size={24} color={colors.primaryColor} />,
        },
        {
            id: 'manage',
            title: t('Manage a club/event'),
            subtitle: t('Club/Admin'),
            description: t('Set up a group profile to manage members, competitions, blogs, and collections.'),
            icon: <Profile2User size={24} color={colors.grayColor} />,
            iconSelected: <Profile2User size={24} color={colors.primaryColor} />,
        },
        {
            id: 'support',
            title: t('Coach / Parent / Physio / Fan'),
            subtitle: t('Support Profile'),
            description: t('Follow athletes, save collections, and add your support role without athlete-only setup.'),
            icon: <User size={24} color={colors.grayColor} />,
            iconSelected: <User size={24} color={colors.primaryColor} />,
        },
    ], [colors.grayColor, colors.primaryColor, t]);

    const visibleCategories = useMemo(() => {
        if (!fromAddFlow) return categories;
        return categories.filter((category) => {
            if (category.id === 'find') return canAddAthleteProfile;
            if (category.id === 'support') return !hasSupportProfile;
            return true;
        });
    }, [canAddAthleteProfile, categories, fromAddFlow, hasSupportProfile]);

    useEffect(() => {
        if (visibleCategories.some((category) => category.id === selectedCategory)) return;
        const fallback = visibleCategories[0]?.id;
        if (fallback === 'find' || fallback === 'manage' || fallback === 'support') {
            setSelectedCategory(fallback);
        }
    }, [selectedCategory, visibleCategories]);

    const nextStepLabel =
        selectedCategory === 'find'
            ? t('Next: Complete athlete profile')
            : selectedCategory === 'manage'
                ? t('Next: Complete group/admin profile')
                : t('Next: Complete support profile');

    const handleContinue = async () => {
        setIsLoading(true);
        navigation.navigate('SelectEventScreen', { selectedCategory, fromAddFlow });
        setIsLoading(false);
    };

    const handleGuestLogin = () => {
        navigation.navigate('BottomTabBar');
    };

    return (
        <View style={Styles.mainContainer} testID="category-selection-screen">
            <SizeBox height={insets.top} />
            <View style={Styles.contentShell}>
                {fromAddFlow ? (
                    <>
                        <View style={{ width: '100%', alignItems: 'flex-start' }}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => navigation.goBack()}
                            >
                                <ArrowLeft2 size={22} color={colors.primaryColor} />
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={8} />
                    </>
                ) : null}

                <View style={Styles.headerContainer}>
                    <Text style={Styles.headingText}>
                        {fromAddFlow ? t('What would you like to add?') : t('Do you want to set up your profile?')}
                    </Text>
                    <Text style={Styles.subHeadingText}>
                        {fromAddFlow ? t('Choose profile type to continue.') : t('Choose what you want to set up first.')}
                    </Text>
                </View>

                <View style={Styles.optionsSection}>
                    <ScrollView
                        style={Styles.optionsScroll}
                        contentContainerStyle={Styles.optionsContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {visibleCategories.map((category) => {
                            const isSelected = selectedCategory === category.id;
                            return (
                                <TouchableOpacity
                                    key={category.id}
                                    testID={`category-option-${category.id}`}
                                    style={[
                                        Styles.optionCard,
                                        isSelected && Styles.optionCardSelected,
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={() => setSelectedCategory(category.id as 'find' | 'manage' | 'support')}
                                >
                                    <View style={Styles.optionContent}>
                                        <View style={Styles.optionHeader}>
                                            <View style={[
                                                Styles.iconContainer,
                                                isSelected && Styles.iconContainerSelected,
                                            ]}>
                                                {isSelected ? category.iconSelected : category.icon}
                                            </View>
                                            <View style={Styles.optionTextContainer}>
                                                <Text style={Styles.optionTitle} numberOfLines={1}>{category.title}</Text>
                                                <Text style={Styles.optionSubtitle}>{category.subtitle}</Text>
                                            </View>
                                        </View>
                                        <Text style={Styles.optionDescription} numberOfLines={2}>{category.description}</Text>
                                    </View>

                                    {isSelected ? (
                                        <TickCircle size={24} color={colors.greenColor} variant="Bold" />
                                    ) : (
                                        <View style={Styles.arrowContainer}>
                                            <ArrowRight size={20} color={colors.grayColor} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>

            <View style={[Styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
                {!fromAddFlow && <Text style={Styles.nextStepText}>{nextStepLabel}</Text>}
                {!fromAddFlow && (
                    <TouchableOpacity
                        style={Styles.guestButton}
                        activeOpacity={0.7}
                        onPress={handleGuestLogin}
                    >
                        <Text style={Styles.guestButtonText}>{t('Continue as guest (set up later)')}</Text>
                    </TouchableOpacity>
                )}
                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primaryColor} />
                ) : (
                    <CustomButton title={t('Continue')} onPress={handleContinue} testID="category-continue-button" />
                )}
            </View>
        </View>
    );
};

export default CategorySelectionScreen;
