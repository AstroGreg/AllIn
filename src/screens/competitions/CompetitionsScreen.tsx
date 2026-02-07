import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    ArrowRight2,
    Setting5,
    TickSquare,
} from 'iconsax-react-nativejs';
import Styles from './CompetitionsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';

const CompetitionsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
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
        <TouchableOpacity key={item.id} style={Styles.eventCard} activeOpacity={0.7}>
            <Text style={Styles.eventName}>{item.name}</Text>
            <View style={Styles.eventRight}>
                {item.badges.length > 0 ? (
                    <View style={Styles.badgesContainer}>
                        {item.badges.map((badge: string, index: number) => (
                            <View key={index} style={Styles.badge}>
                                <Text style={Styles.badgeText}>{badge}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <ArrowRight2 size={24} color="#9B9F9F" variant="Linear" />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Competitions</Text>
                <TouchableOpacity style={Styles.settingsButton}>
                    <Icons.Setting height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Competition Info */}
                <View style={Styles.competitionInfo}>
                    <Text style={Styles.competitionTitle}>BK Studentent 23</Text>
                    <Text style={Styles.competitionDescription}>This is the Belgium Championship 2023</Text>
                </View>

                <SizeBox height={24} />

                {/* Toggle Button */}
                <View style={Styles.toggleContainer}>
                    <TouchableOpacity
                        style={[Styles.toggleButton, activeTab === 'track' && Styles.toggleButtonActive]}
                        onPress={() => setActiveTab('track')}
                    >
                        <Text style={[Styles.toggleText, activeTab === 'track' && Styles.toggleTextActive]}>
                            Track Events
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.toggleButton, activeTab === 'field' && Styles.toggleButtonActive]}
                        onPress={() => setActiveTab('field')}
                    >
                        <Text style={[Styles.toggleText, activeTab === 'field' && Styles.toggleTextActive]}>
                            Field Events
                        </Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={24} />

                {/* Videos Section */}
                <View style={Styles.sectionHeaderContainer}>
                    <View style={Styles.sectionHeader}>
                        <Text style={Styles.sectionTitle}>Videos</Text>
                        <TouchableOpacity
                            style={Styles.filterButton}
                            onPress={() => setShowFilterPopup(!showFilterPopup)}
                        >
                            <Setting5 size={16} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>
                    </View>

                    {/* Filter Popup */}
                    {showFilterPopup && (
                        <View style={Styles.filterPopup}>
                            <TouchableOpacity
                                style={Styles.filterOption}
                                onPress={() => setShowSubscribedOnly(!showSubscribedOnly)}
                            >
                                <Text style={Styles.filterOptionText}>Show only subscribed events</Text>
                                <View style={[Styles.checkbox, showSubscribedOnly && Styles.checkboxChecked]}>
                                    {showSubscribedOnly && (
                                        <TickSquare size={24} color={Colors.primaryColor} variant="Bold" />
                                    )}
                                </View>
                            </TouchableOpacity>

                            <View style={Styles.filterDivider} />

                            <TouchableOpacity
                                style={Styles.filterOption}
                                onPress={() => setShowWithVideosOnly(!showWithVideosOnly)}
                            >
                                <Text style={Styles.filterOptionText}>Show only events with videos of me</Text>
                                <View style={[Styles.checkbox, showWithVideosOnly && Styles.checkboxChecked]}>
                                    {showWithVideosOnly && (
                                        <TickSquare size={24} color={Colors.primaryColor} variant="Bold" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <SizeBox height={27} />

                {/* Events List */}
                <View style={Styles.eventsList}>
                    {trackEvents.map(renderEventCard)}
                </View>

                <SizeBox height={24} />

                {/* Photos Section */}
                <Text style={Styles.photosTitle}>Photos</Text>

                <SizeBox height={24} />

                {/* Show All Photos Button */}
                <TouchableOpacity style={Styles.primaryButton}>
                    <Text style={Styles.primaryButtonText}>Show All Photos</Text>
                    <ArrowRight2 size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default CompetitionsScreen;
