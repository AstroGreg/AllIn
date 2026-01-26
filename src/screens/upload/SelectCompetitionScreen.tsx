import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, Notification, SearchNormal1, Setting5, CloseCircle, Clock, Location, Calendar, VideoSquare, ArrowRight, ArrowDown2 } from 'iconsax-react-nativejs'
import { createStyles } from './SelectCompetitionStyles'
import SizeBox from '../../constants/SizeBox'
import { useTheme } from '../../context/ThemeContext'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'

interface Competition {
    id: number;
    name: string;
    videoCount: number;
    location: string;
    date: string;
    thumbnail: any;
}

const SelectCompetitionScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const account = route?.params?.account;
    const anonymous = route?.params?.anonymous;

    const [searchText, setSearchText] = useState('');
    const [activeFilter, setActiveFilter] = useState('Competition');
    const [selectedCompetition, setSelectedCompetition] = useState('BK');

    const filterOptions = ['Competition', 'Event', 'Location'];

    const competitions: Competition[] = [
        { id: 1, name: 'BK Studentent 23', videoCount: 254, location: 'Berlin, Germany', date: '27.5.2025', thumbnail: Images.photo1 },
        { id: 2, name: 'BK Studentent 23', videoCount: 254, location: 'Berlin, Germany', date: '27.5.2025', thumbnail: Images.photo1 },
    ];

    const handleUploadToCompetition = (competition: Competition) => {
        navigation.navigate('CompetitionDetailsScreen', {
            competition,
            account,
            anonymous
        });
    };

    const renderCompetitionCard = (competition: Competition) => (
        <View key={competition.id} style={Styles.competitionCard}>
            <View style={Styles.competitionContent}>
                <View style={Styles.thumbnailContainer}>
                    <FastImage source={competition.thumbnail} style={Styles.thumbnail} resizeMode="cover" />
                </View>
                <View style={Styles.competitionInfo}>
                    <View style={Styles.competitionHeader}>
                        <Text style={Styles.competitionName}>{competition.name}</Text>
                        <View style={Styles.videoCountRow}>
                            <VideoSquare size={16} color={colors.grayColor} variant="Linear" />
                            <Text style={Styles.videoCountText}>{competition.videoCount} Videos</Text>
                        </View>
                    </View>
                    <View style={Styles.infoRow}>
                        <Text style={Styles.infoLabel}>Location</Text>
                        <View style={Styles.infoValueRow}>
                            <Location size={16} color={colors.grayColor} variant="Linear" />
                            <Text style={Styles.infoValue}>{competition.location}</Text>
                        </View>
                    </View>
                    <View style={Styles.infoRow}>
                        <Text style={Styles.infoLabel}>Date</Text>
                        <View style={Styles.infoValueRow}>
                            <Calendar size={16} color={colors.grayColor} variant="Linear" />
                            <Text style={Styles.infoValue}>{competition.date}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={Styles.uploadButton}
                onPress={() => handleUploadToCompetition(competition)}
            >
                <Text style={Styles.uploadButtonText}>Upload</Text>
                <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Upload</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Tip Card */}
                <View style={Styles.tipCard}>
                    <Icons.LightbulbColorful width={90} height={90} />
                    <SizeBox height={14} />
                    <Text style={Styles.tipText}>
                        Select the competition you would like to add photos/videos to
                    </Text>
                </View>

                <SizeBox height={24} />

                {/* Search Bar */}
                <View style={Styles.searchRow}>
                    <View style={Styles.searchInputContainer}>
                        <SearchNormal1 size={16} color={colors.grayColor} variant="Linear" />
                        <TextInput
                            style={Styles.searchInput}
                            placeholder="Running...."
                            placeholderTextColor={colors.grayColor}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                    <TouchableOpacity style={Styles.filterButton}>
                        <Setting5 size={24} color={colors.pureWhite} variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                {/* Filter Tabs */}
                <View style={Styles.filterTabsRow}>
                    {filterOptions.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                Styles.filterTab,
                                activeFilter === filter && Styles.filterTabActive
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[
                                Styles.filterTabText,
                                activeFilter === filter && Styles.filterTabTextActive
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <SizeBox height={16} />

                {/* Active Filters Row */}
                <View style={Styles.activeFiltersRow}>
                    {selectedCompetition && (
                        <TouchableOpacity style={Styles.activeFilterChip}>
                            <Text style={Styles.activeFilterText}>Competition: {selectedCompetition}</Text>
                            <CloseCircle size={16} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={Styles.timeRangeButton}>
                        <Clock size={14} color={colors.grayColor} variant="Linear" />
                        <Text style={Styles.timeRangeText}>Time Range</Text>
                        <ArrowDown2 size={14} color={colors.grayColor} variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                {/* Results Header */}
                <View style={Styles.resultsHeader}>
                    <Text style={Styles.resultsTitle}>Searched results</Text>
                    <View style={Styles.resultsCountBadge}>
                        <Text style={Styles.resultsCountText}>430 Events Available</Text>
                    </View>
                </View>

                <SizeBox height={16} />

                {/* Competition Cards */}
                {competitions.map(renderCompetitionCard)}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default SelectCompetitionScreen;
