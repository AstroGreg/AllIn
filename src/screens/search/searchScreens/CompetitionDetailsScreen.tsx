import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../../../constants/Colors'
import { ArrowLeft2, Setting2, Setting5, ArrowRight } from 'iconsax-react-nativejs'
import Icons from '../../../constants/Icons'
import styles from './CompetitionDetailsScreenStyles'

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

export default CompetitionDetailsScreen
