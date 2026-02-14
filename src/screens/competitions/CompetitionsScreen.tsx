import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    ArrowRight2,
    Setting5,
    TickSquare,
} from 'iconsax-react-nativejs';
import { createStyles } from './CompetitionsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const CompetitionsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [activeTab, setActiveTab] = useState<'track' | 'field'>('track');
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [showSubscribedOnly, setShowSubscribedOnly] = useState(true);
    const [showWithVideosOnly, setShowWithVideosOnly] = useState(true);

    const trackEvents = [
        { id: 1, name: '100 Meters', badges: ['Found', 'Subscribed'] },
        { id: 2, name: '200 Meters', badges: ['Subscribed'] },
        { id: 3, name: '400 Meters', badges: [] },
        { id: 4, name: '800 Meters', badges: [] },
        { id: 5, name: '1500 Meters', badges: [] },
        { id: 6, name: '5000 Meters', badges: [] },
    ];

    const renderEventCard = (item: any) => (
        <TouchableOpacity key={item.id} style={styles.eventCard} activeOpacity={0.7}>
            <Text style={styles.eventName}>{item.name}</Text>
            <View style={styles.eventRight}>
                {item.badges.length > 0 ? (
                    <View style={styles.badgesContainer}>
                        {item.badges.map((badge: string, index: number) => (
                            <View key={index} style={styles.badge}>
                                <Text style={styles.badgeText}>{t(badge)}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <ArrowRight2 size={24} color={colors.subTextColor} variant="Linear" />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Competitions')}</Text>
                <TouchableOpacity style={styles.settingsButton}>
                    <Icons.Setting height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Competition Info */}
                <View style={styles.competitionInfo}>
                    <Text style={styles.competitionTitle}>{t('BK Studentent 23')}</Text>
                    <Text style={styles.competitionDescription}>{t('This is the Belgium Championship 2023')}</Text>
                </View>

                <SizeBox height={24} />

                {/* Toggle Button */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, activeTab === 'track' && styles.toggleButtonActive]}
                        onPress={() => setActiveTab('track')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'track' && styles.toggleTextActive]}>
                            {t('Track Events')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, activeTab === 'field' && styles.toggleButtonActive]}
                        onPress={() => setActiveTab('field')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'field' && styles.toggleTextActive]}>
                            {t('Field Events')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={24} />

                {/* Videos Section */}
                <View style={styles.sectionHeaderContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('Videos')}</Text>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => setShowFilterPopup(!showFilterPopup)}
                        >
                            <Setting5 size={16} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </View>

                    {/* Filter Popup */}
                    {showFilterPopup && (
                        <View style={styles.filterPopup}>
                            <TouchableOpacity
                                style={styles.filterOption}
                                onPress={() => setShowSubscribedOnly(!showSubscribedOnly)}
                            >
                                <Text style={styles.filterOptionText}>{t('Show only subscribed events')}</Text>
                                <View style={[styles.checkbox, showSubscribedOnly && styles.checkboxChecked]}>
                                    {showSubscribedOnly && (
                                        <TickSquare size={24} color={colors.primaryColor} variant="Bold" />
                                    )}
                                </View>
                            </TouchableOpacity>

                            <View style={styles.filterDivider} />

                            <TouchableOpacity
                                style={styles.filterOption}
                                onPress={() => setShowWithVideosOnly(!showWithVideosOnly)}
                            >
                                <Text style={styles.filterOptionText}>{t('Show only events with videos of me')}</Text>
                                <View style={[styles.checkbox, showWithVideosOnly && styles.checkboxChecked]}>
                                    {showWithVideosOnly && (
                                        <TickSquare size={24} color={colors.primaryColor} variant="Bold" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <SizeBox height={27} />

                {/* Events List */}
                <View style={styles.eventsList}>
                    {trackEvents.map(renderEventCard)}
                </View>

                <SizeBox height={24} />

                {/* Photos Section */}
                <Text style={styles.photosTitle}>{t('Photos')}</Text>

                <SizeBox height={24} />

                {/* Show All Photos Button */}
                <TouchableOpacity style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>{t('Show All Photos')}</Text>
                    <ArrowRight2 size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default CompetitionsScreen;
