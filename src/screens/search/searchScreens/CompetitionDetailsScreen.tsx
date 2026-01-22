import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../../../constants/Colors'
import Fonts from '../../../constants/Fonts'
import { ArrowLeft2, Setting2, Setting5, ArrowRight } from 'iconsax-react-nativejs'
import Icons from '../../../constants/Icons'

interface EventCategory {
    id: number;
    name: string;
    badges?: string[];
    hasArrow?: boolean;
}

const CompetitionDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const [selectedTab, setSelectedTab] = useState<'track' | 'field'>('track');

    const competitionName = route?.params?.name || 'BK Studentent 23';
    const competitionDescription = route?.params?.description || 'This is the Belgium Championship 2023';

    const trackEvents: EventCategory[] = [
        { id: 1, name: '100 Meters', badges: ['Found', 'Subscribed'] },
        { id: 2, name: '200 Meters', badges: ['Subscribed'] },
        { id: 3, name: '400 Meters', hasArrow: true },
        { id: 4, name: '800 Meters', hasArrow: true },
        { id: 5, name: '1500 Meters', hasArrow: true },
        { id: 6, name: '5000 Meters', hasArrow: true },
    ];

    const fieldEvents: EventCategory[] = [
        { id: 1, name: 'Long Jump', badges: ['Found'] },
        { id: 2, name: 'High Jump', hasArrow: true },
        { id: 3, name: 'Shot Put', hasArrow: true },
        { id: 4, name: 'Discus Throw', hasArrow: true },
    ];

    const currentEvents = selectedTab === 'track' ? trackEvents : fieldEvents;

    const renderEventCard = (event: EventCategory) => (
        <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => navigation.navigate('VideosForEvent', { eventName: event.name })}
        >
            <Text style={styles.eventCardName}>{event.name}</Text>
            <View style={styles.eventCardRight}>
                {event.badges?.map((badge, index) => (
                    <View key={index} style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                ))}
                {event.hasArrow && (
                    <ArrowRight size={20} color="#9B9F9F" variant="Linear" />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Competitions</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Setting2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Competition Info */}
                <Text style={styles.competitionName}>{competitionName}</Text>
                <SizeBox height={4} />
                <Text style={styles.competitionDescription}>{competitionDescription}</Text>

                <SizeBox height={20} />

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'track' && styles.tabActive]}
                        onPress={() => setSelectedTab('track')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'track' && styles.tabTextActive]}>
                            Track Events
                        </Text>
                        <ArrowRight
                            size={16}
                            color={selectedTab === 'track' ? Colors.mainTextColor : '#9B9F9F'}
                            variant="Linear"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'field' && styles.tabActive]}
                        onPress={() => setSelectedTab('field')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'field' && styles.tabTextActive]}>
                            Field Events
                        </Text>
                        <ArrowRight
                            size={16}
                            color={selectedTab === 'field' ? Colors.mainTextColor : '#9B9F9F'}
                            variant="Linear"
                        />
                    </TouchableOpacity>
                </View>

                <SizeBox height={24} />

                {/* Videos Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Videos</Text>
                    <View style={styles.sectionIcons}>
                        <TouchableOpacity style={styles.sectionIconButton}>
                            <Icons.AiWhiteBordered width={20} height={20} />
                        </TouchableOpacity>
                        <SizeBox width={8} />
                        <TouchableOpacity style={styles.sectionIconButton}>
                            <Setting5 size={20} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>

                <SizeBox height={16} />

                {/* Event Categories */}
                {currentEvents.map(renderEventCard)}

                <SizeBox height={16} />

                {/* Show All Videos Button */}
                <TouchableOpacity
                    style={styles.showAllButton}
                    onPress={() => navigation.navigate('AllVideosOfEvents')}
                >
                    <Text style={styles.showAllButtonText}>Show All Videos</Text>
                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={24} />

                {/* Photos Section */}
                <Text style={styles.sectionTitle}>Photos</Text>

                <SizeBox height={16} />

                {/* Show All Photos Button */}
                <TouchableOpacity
                    style={styles.showAllPhotosButton}
                    onPress={() => navigation.navigate('AllPhotosOfEvents')}
                >
                    <Text style={styles.showAllPhotosButtonText}>Show All Photos</Text>
                    <ArrowRight size={18} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 100 : 120} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.3,
        borderBottomColor: '#DEDEDE',
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    competitionName: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    competitionDescription: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 8,
        gap: 8,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        height: 39,
        gap: 8,
        backgroundColor: 'transparent',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: 'rgba(60, 130, 246, 0.3)',
    },
    tabText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    tabTextActive: {
        color: Colors.mainTextColor,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    sectionIcons: {
        flexDirection: 'row',
    },
    sectionIconButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        backgroundColor: Colors.whiteColor,
        marginBottom: 12,
    },
    eventCardName: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    eventCardRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    showAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        gap: 8,
    },
    showAllButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
    showAllPhotosButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        backgroundColor: Colors.whiteColor,
        gap: 8,
    },
    showAllPhotosButtonText: {
        ...Fonts.medium16,
        color: Colors.primaryColor,
    },
});

export default CompetitionDetailsScreen
