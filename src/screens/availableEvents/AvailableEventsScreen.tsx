import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {
    ArrowLeft2,
    ArrowRight,
    ArrowDown2,
    Calendar,
    Clock,
    CloseCircle,
    Location,
    VideoSquare,
    SearchNormal1,
    Setting5,
} from 'iconsax-react-nativejs';
import Styles from './AvailableEventsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';

const filterOptions = ['Competition', 'Event', 'Location', 'AI Face search', 'Chest number'];

const AvailableEventsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [searchText, setSearchText] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Competition');
    const [activeFilters, setActiveFilters] = useState<{ type: string; value: string }[]>([
        { type: 'Competition', value: 'BK' }
    ]);

    const removeFilter = (index: number) => {
        setActiveFilters(activeFilters.filter((_, i) => i !== index));
    };

    const availableEvents = [
        {
            id: 1,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27.5.2025',
            thumbnail: Images.photo4,
        },
        {
            id: 2,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27.5.2025',
            thumbnail: Images.photo5,
        },
        {
            id: 3,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27.5.2025',
            thumbnail: Images.photo4,
        },
        {
            id: 4,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27.5.2025',
            thumbnail: Images.photo5,
        },
    ];

    const renderEventCard = (item: any) => (
        <View key={item.id} style={Styles.eventCard}>
            <View style={Styles.cardRow}>
                <FastImage source={item.thumbnail} style={Styles.squareThumbnail} resizeMode="cover" />
                <View style={Styles.cardInfo}>
                    <View style={Styles.eventTitleRow}>
                        <Text style={Styles.cardTitle}>{item.title}</Text>
                        <View style={Styles.videosCount}>
                            <VideoSquare size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.detailText}>{item.videos}</Text>
                        </View>
                    </View>
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>Location</Text>
                        <View style={Styles.detailValue}>
                            <Location size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.detailText}>{item.location}</Text>
                        </View>
                    </View>
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>Date</Text>
                        <View style={Styles.detailValue}>
                            <Calendar size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.detailText}>{item.date}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={Styles.cardActions}>
                <TouchableOpacity
                    style={Styles.addMyselfButton}
                    onPress={() => navigation.navigate('AddToEventScreen', {
                        event: {
                            title: item.title,
                            date: item.date,
                            location: item.location,
                        }
                    })}
                >
                    <Text style={Styles.addMyselfButtonText}>Add Myself</Text>
                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={Styles.viewButton}
                    onPress={() => navigation.navigate('CompetitionsScreen', {
                        event: {
                            title: item.title,
                            date: item.date,
                            location: item.location,
                        }
                    })}
                >
                    <Text style={Styles.viewButtonText}>View</Text>
                    <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Events</Text>
                <TouchableOpacity
                    style={Styles.notificationButton}
                    onPress={() => navigation.navigate('NotificationsScreen')}
                >
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[Styles.searchContainer, showFilters && { marginBottom: 16 }]}>
                <View style={Styles.searchInputWrapper}>
                    <SearchNormal1 size={16} color="#9B9F9F" variant="Linear" />
                    <TextInput
                        style={Styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor="#9B9F9F"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
                <TouchableOpacity
                    style={Styles.filterButton}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Setting5 size={24} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            {/* Filter Options */}
            {showFilters && (
                <View style={Styles.filtersContainer}>
                    {/* Filter Chips */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={Styles.filterChipsRow}
                    >
                        {filterOptions.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    Styles.filterChip,
                                    selectedFilter === filter && Styles.filterChipActive
                                ]}
                                onPress={() => setSelectedFilter(filter)}
                            >
                                <Text style={[
                                    Styles.filterChipText,
                                    selectedFilter === filter && Styles.filterChipTextActive
                                ]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Active Filters Row */}
                    <View style={Styles.activeFiltersRow}>
                        {activeFilters.map((filter, index) => (
                            <TouchableOpacity
                                key={index}
                                style={Styles.activeFilterChip}
                                onPress={() => removeFilter(index)}
                            >
                                <Text style={Styles.activeFilterText}>
                                    {filter.type}: {filter.value}
                                </Text>
                                <CloseCircle size={16} color={Colors.whiteColor} variant="Linear" />
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={Styles.timeRangeButton}>
                            <Clock size={14} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.timeRangeText}>Time Range</Text>
                            <ArrowDown2 size={14} color="#9B9F9F" variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Available Events Section */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>{showFilters ? 'Searched results' : 'Available Events'}</Text>
                    {showFilters ? (
                        <View style={Styles.eventsCountBadge}>
                            <Text style={Styles.eventsCountText}>430 Events Available</Text>
                        </View>
                    ) : (
                        <TouchableOpacity>
                            <Text style={Styles.viewAllText}>View all</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {availableEvents.map(renderEventCard)}

                <SizeBox height={20} />
            </ScrollView>
        </View>
    );
};

export default AvailableEventsScreen;
