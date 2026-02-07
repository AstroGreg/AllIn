import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Image } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { createStyles } from './SearchStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import Icons from '../../constants/Icons'
import Images from '../../constants/Images'
import FastImage from 'react-native-fast-image'
import LinearGradient from 'react-native-linear-gradient'
import { ArrowLeft2, Notification, SearchNormal1, Calendar, Location, CloseCircle, Clock, ArrowDown2, Camera, Add, Note, ArrowRight } from 'iconsax-react-nativejs'
import { useRoute } from '@react-navigation/native'

interface FilterChip {
    id: number;
    label: string;
    value: string;
}

interface EventResult {
    id: number;
    name: string;
    date: string;
    location: string;
}

interface UserResult {
    id: number;
    name: string;
    type: 'Athlete' | 'Photographer';
    activity: string;
    location: string;
    isFollowing?: boolean;
}

interface SavedFace {
    id: number;
    name: string;
    image: string;
}

interface GroupResult {
    id: number;
    name: string;
    activity: string;
    location: string;
    images: string[];
}

interface ContextResult {
    id: number;
    name: string;
    type: string;
    bib: string;
    avatar: string;
    isAiSearched?: boolean;
}

interface BibResult {
    id: number;
    name: string;
    type: string;
    bib?: string;
    place?: string;
    time?: string;
    status?: string;
    avatar: string;
    isAiSearched?: boolean;
}

const SearchScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const route = useRoute<any>();
    const [search, setSearch] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Competition');
    const [showFaceSaved, setShowFaceSaved] = useState(false);
    const [selectedFaces, setSelectedFaces] = useState<number[]>([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [modalFilterType, setModalFilterType] = useState('');
    const [modalInputValue, setModalInputValue] = useState('');
    const modalInputRef = useRef<TextInput>(null);

    // Handle openBIB param from navigation
    useEffect(() => {
        if (route.params?.openBIB) {
            setSelectedFilter('BIB');
            setModalFilterType('BIB');
            setModalInputValue('');
            setShowFilterModal(true);
            setTimeout(() => modalInputRef.current?.focus(), 100);
        }
    }, [route.params?.openBIB]);

    const filters = ['Competition', 'Athelete', 'Location', 'Photographer', 'Chest Number', 'Face saved', 'BIB', 'Add Face', 'Group', 'Context'];

    const [activeChips, setActiveChips] = useState<FilterChip[]>([]);

    const savedFaces: SavedFace[] = [
        { id: 1, name: 'Kevin', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
        { id: 2, name: 'James', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
        { id: 3, name: 'Jhon', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' },
        { id: 4, name: 'Ray', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
        { id: 5, name: 'Kevin', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200' },
        { id: 6, name: 'Kevin', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200' },
        { id: 7, name: 'Kevin', image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=200' },
        { id: 8, name: 'Kevin', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200' },
        { id: 9, name: 'Kevin', image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200' },
        { id: 10, name: 'Kevin', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200' },
        { id: 11, name: 'Kevin', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200' },
        { id: 12, name: 'Kevin', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200' },
    ];

    const eventResults: EventResult[] = [
        { id: 1, name: 'BK Studenten 23', date: '27/05/2025', location: 'Gent' },
        { id: 2, name: 'Vlaams Kampioenschap', date: '27/05/2025', location: 'Hasselt' },
        { id: 3, name: 'IFAM 2024', date: '27/05/2025', location: 'Brussels' },
        { id: 4, name: 'KBC Nacht 2024', date: '27/05/2025', location: 'Hasselt' },
        { id: 5, name: 'Meeting voor mon', date: '27/05/2025', location: 'Leuven' },
    ];

    const userResults: UserResult[] = [
        { id: 1, name: 'James Ray', type: 'Athlete', activity: 'Marathon', location: 'Dhaka', isFollowing: false },
        { id: 2, name: 'James Ray', type: 'Athlete', activity: 'Marathon', location: 'Dhaka', isFollowing: false },
        { id: 3, name: 'James Ray', type: 'Athlete', activity: 'Marathon', location: 'Dhaka', isFollowing: false },
        { id: 4, name: 'James Ray', type: 'Athlete', activity: 'Marathon', location: 'Dhaka', isFollowing: false },
        { id: 5, name: 'James Ray', type: 'Photographer', activity: 'Sports Events', location: 'Dhaka' },
        { id: 6, name: 'James Ray', type: 'Photographer', activity: 'Sports Events', location: 'Dhaka' },
        { id: 7, name: 'James Ray', type: 'Photographer', activity: 'Sports Events', location: 'Dhaka' },
        { id: 8, name: 'James Ray', type: 'Photographer', activity: 'Sports Events', location: 'Dhaka' },
        { id: 9, name: 'James Ray', type: 'Photographer', activity: 'Sports Events', location: 'Dhaka' },
        { id: 10, name: 'James Ray', type: 'Photographer', activity: 'Sports Events', location: 'Dhaka' },
    ];

    const groupResults: GroupResult[] = [
        {
            id: 1,
            name: 'Group 1',
            activity: 'Sports Events',
            location: 'Dhaka',
            images: [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            ]
        },
        {
            id: 2,
            name: 'Group 2',
            activity: 'Sports Events',
            location: 'Dhaka',
            images: [
                'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100',
                'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100',
                'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=100',
                'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100',
            ]
        },
        {
            id: 3,
            name: 'Group 3',
            activity: 'Sports Events',
            location: 'Dhaka',
            images: [
                'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100',
                'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100',
                'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100',
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
            ]
        },
        {
            id: 4,
            name: 'Group 4',
            activity: 'Sports Events',
            location: 'Dhaka',
            images: [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            ]
        },
        {
            id: 5,
            name: 'Group 5',
            activity: 'Sports Events',
            location: 'Dhaka',
            images: [
                'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100',
                'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100',
                'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=100',
                'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100',
            ]
        },
        {
            id: 6,
            name: 'Group 6',
            activity: 'Sports Events',
            location: 'Dhaka',
            images: [
                'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100',
                'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100',
                'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100',
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
            ]
        },
    ];

    const contextResults: ContextResult[] = [
        {
            id: 1,
            name: 'James Ray',
            type: 'Athlete',
            bib: '#2827',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
            isAiSearched: true,
        },
        {
            id: 2,
            name: 'James Ray',
            type: 'Athlete',
            bib: '#2827',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        },
        {
            id: 3,
            name: 'James Ray',
            type: 'Athlete',
            bib: '#2827',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        },
        {
            id: 4,
            name: 'James Ray',
            type: 'Athlete',
            bib: '#2827',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        },
    ];

    const bibResults: BibResult[] = [
        {
            id: 1,
            name: 'James Ray',
            type: 'Athlete',
            bib: '#2827',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
            isAiSearched: true,
        },
        {
            id: 2,
            name: 'James Ray',
            type: 'Athlete',
            place: '1st',
            time: '1:23:45',
            status: 'Finished',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        },
        {
            id: 3,
            name: 'James Ray',
            type: 'Athlete',
            place: '1st',
            time: '1:23:45',
            status: 'Finished',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        },
        {
            id: 4,
            name: 'James Ray',
            type: 'Athlete',
            place: '1st',
            time: '1:23:45',
            status: 'Finished',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        },
    ];

    const removeChip = (chipId: number) => {
        setActiveChips(prev => prev.filter(chip => chip.id !== chipId));
    };

    const toggleFace = (faceId: number) => {
        setSelectedFaces(prev => {
            if (prev.includes(faceId)) {
                return prev.filter(id => id !== faceId);
            } else {
                return [...prev, faceId];
            }
        });
    };

    const removeFaceFilter = (faceId: number) => {
        setSelectedFaces(prev => prev.filter(id => id !== faceId));
    };

    const handleFilterPress = (filter: string) => {
        if (filter === 'Add Face') {
            navigation.navigate('SearchFaceCaptureScreen');
            return;
        }
        setSelectedFilter(filter);
        setHasSearched(true);
        if (filter === 'Face saved') {
            setShowFaceSaved(!showFaceSaved);
        } else {
            setShowFaceSaved(false);
            // Show modal for value-based filters (Location, Chest Number, BIB, Context)
            if (filter === 'Location' || filter === 'Chest Number' || filter === 'BIB' || filter === 'Context') {
                setModalFilterType(filter);
                setModalInputValue('');
                setShowFilterModal(true);
                setTimeout(() => modalInputRef.current?.focus(), 100);
            }
        }
    };

    const handleModalSubmit = () => {
        if (modalInputValue.trim()) {
            const newChip: FilterChip = {
                id: Date.now(),
                label: modalFilterType,
                value: modalInputValue.trim()
            };
            setActiveChips(prev => [...prev, newChip]);
            setHasSearched(true);
        }
        setShowFilterModal(false);
        setModalInputValue('');
    };

    const handleModalClose = () => {
        setShowFilterModal(false);
        setModalInputValue('');
    };

    const renderEventCard = (event: EventResult, showCompetitionBadge: boolean = false) => (
        <TouchableOpacity
            key={event.id}
            style={Styles.eventCard}
            onPress={() => navigation.navigate(
                showCompetitionBadge ? 'CompetitionDetailsScreen' : 'Videography',
                showCompetitionBadge
                    ? { name: event.name, description: `Competition held in ${event.location}` }
                    : { type: 'photo' }
            )}
        >
            <View style={Styles.eventIconContainer}>
                <Calendar size={20} color={colors.primaryColor} variant="Linear" />
            </View>
            <SizeBox width={16} />
            <View style={Styles.eventContent}>
                <View style={Styles.eventNameRow}>
                    <Text style={Styles.eventName}>{event.name}</Text>
                    {showCompetitionBadge && (
                        <View style={Styles.competitionBadge}>
                            <Text style={Styles.competitionBadgeText}>Competition</Text>
                        </View>
                    )}
                </View>
                <SizeBox height={4} />
                <View style={Styles.eventDetails}>
                    <View style={Styles.eventDetailItem}>
                        <Calendar size={14} color="#9B9F9F" variant="Linear" />
                        <SizeBox width={4} />
                        <Text style={Styles.eventDetailText}>{event.date}</Text>
                    </View>
                    <View style={Styles.eventDetailItem}>
                        <Location size={14} color="#9B9F9F" variant="Linear" />
                        <SizeBox width={4} />
                        <Text style={Styles.eventDetailText}>{event.location}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderUserCard = (user: UserResult) => (
        <TouchableOpacity
            key={user.id}
            style={Styles.userCard}
            onPress={() => navigation.navigate('ViewUserProfileScreen', { user })}
        >
            <View style={Styles.userCardContent}>
                <View style={Styles.userHeader}>
                    <FastImage
                        source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }}
                        style={Styles.userAvatar}
                    />
                    <SizeBox width={8} />
                    <View style={Styles.userInfo}>
                        <View style={Styles.userNameRow}>
                            <Text style={Styles.userName}>{user.name}</Text>
                            <View style={Styles.userTypeBadge}>
                                <Text style={Styles.userTypeText}>{user.type}</Text>
                            </View>
                        </View>
                        <View style={Styles.userDetails}>
                            <View style={Styles.userDetailItem}>
                                {user.type === 'Athlete' ? (
                                    <Icons.Run height={16} width={16} />
                                ) : (
                                    <Camera size={16} color="#9B9F9F" variant="Linear" />
                                )}
                                <SizeBox width={4} />
                                <Text style={Styles.userDetailText}>{user.activity}</Text>
                            </View>
                            <View style={Styles.userDetailItem}>
                                <Location size={16} color="#9B9F9F" variant="Linear" />
                                <SizeBox width={4} />
                                <Text style={Styles.userDetailText}>{user.location}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                {user.type === 'Athlete' && (
                    <>
                        <SizeBox height={10} />
                        <TouchableOpacity
                            style={Styles.followBtn}
                            onPress={() => navigation.navigate('ViewUserProfileScreen', { user })}
                        >
                            <Text style={Styles.followBtnText}>Follow</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderGroupCard = (group: GroupResult) => (
        <TouchableOpacity
            key={group.id}
            style={Styles.userCard}
            onPress={() => navigation.navigate('EventsScreen', {
                name: group.name,
                activity: group.activity,
                location: group.location
            })}
        >
            <View style={Styles.userCardContent}>
                <View style={Styles.userHeader}>
                    <View style={Styles.groupAvatarGrid}>
                        <View style={Styles.groupAvatarRow}>
                            <FastImage
                                source={{ uri: group.images[0] }}
                                style={Styles.groupAvatarTopLeft}
                            />
                            <FastImage
                                source={{ uri: group.images[1] }}
                                style={Styles.groupAvatarTopRight}
                            />
                        </View>
                        <View style={Styles.groupAvatarRow}>
                            <FastImage
                                source={{ uri: group.images[2] }}
                                style={Styles.groupAvatarBottomLeft}
                            />
                            <FastImage
                                source={{ uri: group.images[3] }}
                                style={Styles.groupAvatarBottomRight}
                            />
                        </View>
                    </View>
                    <SizeBox width={8} />
                    <View style={Styles.userInfo}>
                        <View style={Styles.userNameRow}>
                            <Text style={Styles.userName}>{group.name}</Text>
                            <View style={Styles.userTypeBadge}>
                                <Text style={Styles.userTypeText}>Photographer</Text>
                            </View>
                        </View>
                        <View style={Styles.userDetails}>
                            <View style={Styles.userDetailItem}>
                                <Camera size={16} color="#9B9F9F" variant="Linear" />
                                <SizeBox width={4} />
                                <Text style={Styles.userDetailText}>{group.activity}</Text>
                            </View>
                            <View style={Styles.userDetailItem}>
                                <Location size={16} color="#9B9F9F" variant="Linear" />
                                <SizeBox width={4} />
                                <Text style={Styles.userDetailText}>{group.location}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderContextResultCard = (result: ContextResult) => (
        <View key={result.id} style={Styles.contextResultCardWrapper}>
            <View
                style={[
                    Styles.contextResultCard,
                    result.isAiSearched && Styles.contextResultCardAiSearched,
                ]}
            >
                <View style={Styles.contextResultHeader}>
                    <FastImage
                        source={{ uri: result.avatar }}
                        style={Styles.contextAvatar}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                    <SizeBox width={8} />
                    <View style={Styles.contextResultInfo}>
                        <View style={Styles.contextResultNameRow}>
                            <Text style={Styles.contextResultName}>{result.name}</Text>
                            <View style={Styles.contextTypeBadge}>
                                <Text style={Styles.contextTypeBadgeText}>{result.type}</Text>
                            </View>
                        </View>
                        <View style={Styles.contextBibRow}>
                            <Note size={16} color="#9B9F9F" variant="Linear" />
                            <SizeBox width={4} />
                            <Text style={Styles.contextBibLabel}>Bib:</Text>
                            <View style={{ flex: 1 }} />
                            <Text style={Styles.contextBibValue}>{result.bib}</Text>
                        </View>
                    </View>
                </View>

                <SizeBox height={10} />

                <View style={Styles.contextCardFooter}>
                    <TouchableOpacity
                        style={Styles.contextViewDetailsButton}
                        onPress={() => navigation.navigate('ViewUserProfileScreen', { user: result })}
                    >
                        <Text style={Styles.contextViewDetailsText}>View Details</Text>
                        <ArrowRight size={24} color="#FFFFFF" variant="Linear" />
                    </TouchableOpacity>

                    {result.isAiSearched && (
                        <LinearGradient
                            colors={['#155DFC', '#7F22FE']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={Styles.contextAiSearchedBadge}
                        >
                            <Text style={Styles.contextAiSearchedText}>Ai Searched</Text>
                        </LinearGradient>
                    )}
                </View>
            </View>
        </View>
    );

    const renderContextResults = () => (
        <View>
            {contextResults.map(renderContextResultCard)}
        </View>
    );

    const renderBibResultCard = (result: BibResult) => (
        <View key={result.id} style={Styles.bibResultCardWrapper}>
            <View
                style={[
                    Styles.bibResultCard,
                    result.isAiSearched && Styles.bibResultCardAiSearched,
                ]}
            >
                <View style={Styles.bibResultHeader}>
                    <FastImage
                        source={{ uri: result.avatar }}
                        style={Styles.bibAvatar}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                    <SizeBox width={8} />
                    <View style={Styles.bibResultInfo}>
                        <View style={Styles.bibResultNameRow}>
                            <Text style={Styles.bibResultName}>{result.name}</Text>
                            <View style={Styles.bibTypeBadge}>
                                <Text style={Styles.bibTypeBadgeText}>{result.type}</Text>
                            </View>
                        </View>
                        {result.isAiSearched && result.bib ? (
                            <View style={Styles.bibBibRow}>
                                <View style={Styles.bibBibLeft}>
                                    <Note size={16} color="#9B9F9F" variant="Linear" />
                                    <SizeBox width={4} />
                                    <Text style={Styles.bibBibLabel}>Bib:</Text>
                                </View>
                                <Text style={Styles.bibBibValue}>{result.bib}</Text>
                            </View>
                        ) : (
                            <View style={Styles.bibDetailsRow}>
                                <View style={Styles.bibDetailItem}>
                                    <Note size={16} color="#9B9F9F" variant="Linear" />
                                    <SizeBox width={4} />
                                    <Text style={Styles.bibDetailText}>Place: {result.place}</Text>
                                </View>
                                <View style={Styles.bibDetailItem}>
                                    <Clock size={16} color="#9B9F9F" variant="Linear" />
                                    <SizeBox width={4} />
                                    <Text style={Styles.bibDetailText}>{result.time}</Text>
                                </View>
                                <View style={Styles.bibDetailItem}>
                                    <Note size={16} color="#9B9F9F" variant="Linear" />
                                    <SizeBox width={4} />
                                    <Text style={Styles.bibDetailText}>Status: {result.status}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                <SizeBox height={10} />

                <View style={Styles.bibCardFooter}>
                    <TouchableOpacity
                        style={Styles.bibViewDetailsButton}
                        onPress={() => navigation.navigate('ViewUserProfileScreen', { user: result })}
                    >
                        <Text style={Styles.bibViewDetailsButtonText}>View Details</Text>
                    </TouchableOpacity>

                    {result.isAiSearched && (
                        <LinearGradient
                            colors={['#155DFC', '#7F22FE']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={Styles.bibAiSearchedBadge}
                        >
                            <Text style={Styles.bibAiSearchedText}>Ai Searched</Text>
                        </LinearGradient>
                    )}
                </View>
            </View>
        </View>
    );

    const renderBibResults = () => (
        <View>
            {bibResults.map(renderBibResultCard)}
        </View>
    );

    const renderNoResults = () => (
        <View style={Styles.noResultsContainer}>
            <Image
                source={Images.noResult}
                style={Styles.noResultsImage}
                resizeMode="cover"
            />
            <SizeBox height={14} />
            <Text style={Styles.noResultsText}>No results found</Text>
        </View>
    );

    // Check if there are results based on selected filter
    const hasResults = () => {
        if (!hasSearched) return false;
        if (selectedFilter === 'Competition') return eventResults.length > 0;
        if (selectedFilter === 'Athelete') return userResults.filter(u => u.type === 'Athlete').length > 0;
        if (selectedFilter === 'Photographer') return userResults.filter(u => u.type === 'Photographer').length > 0;
        if (selectedFilter === 'Group') return groupResults.length > 0;
        if (selectedFilter === 'Context') return contextResults.length > 0;
        if (selectedFilter === 'BIB') return bibResults.length > 0;
        return eventResults.length > 0 || userResults.length > 0;
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Search</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                {/* Search Bar */}
                <View style={Styles.searchRow}>
                    <View style={Styles.searchInputContainer}>
                        <SearchNormal1 size={16} color="#9B9F9F" variant="Linear" />
                        <SizeBox width={6} />
                        <TextInput
                            style={Styles.searchInput}
                            placeholder="Running...."
                            placeholderTextColor="#9B9F9F"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('AISearchOptions')}>
                        <LinearGradient
                            colors={['#6366F1', '#3B82F6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={Styles.aiButton}
                        >
                            <Icons.AiWhiteSquare width={24} height={24} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                {/* Filter Tabs */}
                <View style={Styles.filterTabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    Styles.filterTab,
                                    (selectedFilter === filter || (filter === 'Face saved' && showFaceSaved)) && Styles.filterTabActive
                                ]}
                                onPress={() => handleFilterPress(filter)}
                            >
                                {filter === 'Add Face' && (
                                    <Add size={14} color={selectedFilter === filter ? colors.whiteColor : '#777777'} variant="Linear" />
                                )}
                                {filter === 'Add Face' && <SizeBox width={4} />}
                                <Text style={[
                                    Styles.filterTabText,
                                    (selectedFilter === filter || (filter === 'Face saved' && showFaceSaved)) && Styles.filterTabTextActive
                                ]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        {/* Selected Face Chips in filter row */}
                        {selectedFaces.map((faceId) => {
                            const face = savedFaces.find(f => f.id === faceId);
                            if (!face) return null;
                            return (
                                <TouchableOpacity
                                    key={`face-${faceId}`}
                                    style={[Styles.filterTab, Styles.filterTabActive]}
                                    onPress={() => removeFaceFilter(faceId)}
                                >
                                    <Text style={[Styles.filterTabText, Styles.filterTabTextActive]}>
                                        {face.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <SizeBox height={16} />

                {/* Active Filter Chips */}
                <View style={Styles.activeChipsContainer}>
                    {activeChips.map((chip) => (
                        <TouchableOpacity
                            key={chip.id}
                            style={Styles.activeChip}
                            onPress={() => removeChip(chip.id)}
                        >
                            <Text style={Styles.activeChipText}>
                                {chip.label}: {chip.value}
                            </Text>
                            <CloseCircle size={16} color="#FFFFFF" variant="Linear" />
                        </TouchableOpacity>
                    ))}
                    {/* Selected Face Active Chips */}
                    {selectedFaces.map((faceId) => {
                        const face = savedFaces.find(f => f.id === faceId);
                        if (!face) return null;
                        return (
                            <TouchableOpacity
                                key={`active-face-${faceId}`}
                                style={Styles.activeChip}
                                onPress={() => removeFaceFilter(faceId)}
                            >
                                <Text style={Styles.activeChipText}>
                                    {face.name}
                                </Text>
                                <CloseCircle size={16} color="#FFFFFF" variant="Linear" />
                            </TouchableOpacity>
                        );
                    })}
                    <TouchableOpacity style={Styles.timeRangeChip}>
                        <Clock size={14} color="#9B9F9F" variant="Linear" />
                        <SizeBox width={4} />
                        <Text style={Styles.timeRangeText}>Time Range</Text>
                        <SizeBox width={4} />
                        <ArrowDown2 size={14} color="#9B9F9F" variant="Linear" />
                    </TouchableOpacity>
                </View>

                {/* Face Saved Grid */}
                {showFaceSaved && (
                    <>
                        <SizeBox height={16} />
                        <View style={Styles.faceSavedContainer}>
                            <View style={Styles.faceSavedGrid}>
                                {savedFaces.map((face) => (
                                    <TouchableOpacity
                                        key={face.id}
                                        style={Styles.faceItem}
                                        onPress={() => toggleFace(face.id)}
                                    >
                                        <FastImage
                                            source={{ uri: face.image }}
                                            style={[
                                                Styles.faceImage,
                                                selectedFaces.includes(face.id) && Styles.faceImageSelected
                                            ]}
                                        />
                                        <SizeBox height={4} />
                                        <Text style={Styles.faceName}>{face.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </>
                )}

                <SizeBox height={24} />

                {/* Results Header */}
                <View style={Styles.resultsHeader}>
                    <Text style={Styles.resultsTitle}>Searched results</Text>
                    {hasSearched && (
                        <View style={Styles.resultsBadge}>
                            <Text style={Styles.resultsBadgeText}>430 Events Available</Text>
                        </View>
                    )}
                </View>

                <SizeBox height={16} />

                {/* Results based on selected filter */}
                {!hasSearched ? (
                    // Show no results initially
                    renderNoResults()
                ) : selectedFilter === 'Competition' ? (
                    // Show only competition/event results
                    eventResults.length > 0 ? eventResults.map(event => renderEventCard(event, true)) : renderNoResults()
                ) : selectedFilter === 'Athelete' || selectedFilter === 'Photographer' ? (
                    // Show only user results for Athlete/Photographer
                    userResults.filter(user => selectedFilter === 'Athelete' ? user.type === 'Athlete' : user.type === 'Photographer').length > 0 ? (
                        userResults
                            .filter(user =>
                                selectedFilter === 'Athelete' ? user.type === 'Athlete' : user.type === 'Photographer'
                            )
                            .map(renderUserCard)
                    ) : renderNoResults()
                ) : selectedFilter === 'Group' ? (
                    // Show only group results
                    groupResults.length > 0 ? groupResults.map(renderGroupCard) : renderNoResults()
                ) : selectedFilter === 'Context' ? (
                    // Show context/AI search results
                    contextResults.length > 0 ? renderContextResults() : renderNoResults()
                ) : selectedFilter === 'BIB' ? (
                    // Show BIB search results
                    bibResults.length > 0 ? renderBibResults() : renderNoResults()
                ) : (
                    // Show mixed results for other filters
                    eventResults.length > 0 || userResults.length > 0 ? (
                        <>
                            {eventResults.slice(0, 2).map(event => renderEventCard(event, false))}
                            <SizeBox height={24} />
                            {userResults.map(renderUserCard)}
                        </>
                    ) : renderNoResults()
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 100 : 120} />
            </ScrollView>

            {/* Filter Input Modal */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="fade"
                onRequestClose={handleModalClose}
            >
                <TouchableOpacity
                    style={Styles.modalOverlay}
                    activeOpacity={1}
                    onPress={handleModalClose}
                >
                    <View style={Styles.modalContainer}>
                        <TouchableOpacity activeOpacity={1}>
                            <Text style={Styles.modalTitle}>{modalFilterType}</Text>
                            <SizeBox height={16} />
                            <View style={Styles.modalInputContainer}>
                                <TextInput
                                    ref={modalInputRef}
                                    style={Styles.modalInput}
                                    placeholder={
                                        modalFilterType === 'BIB' ? 'Enter BIB number (e.g., 2827)' :
                                        modalFilterType === 'Context' ? 'Enter context (e.g., Podium, Finish Line)' :
                                        `Enter ${modalFilterType}`
                                    }
                                    placeholderTextColor="#9B9F9F"
                                    value={modalInputValue}
                                    onChangeText={setModalInputValue}
                                    onSubmitEditing={handleModalSubmit}
                                    returnKeyType="done"
                                />
                            </View>
                            <SizeBox height={20} />
                            <View style={Styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={Styles.modalCancelButton}
                                    onPress={handleModalClose}
                                >
                                    <Text style={Styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        Styles.modalSubmitButton,
                                        !modalInputValue.trim() && Styles.modalSubmitButtonDisabled
                                    ]}
                                    onPress={handleModalSubmit}
                                    disabled={!modalInputValue.trim()}
                                >
                                    <Text style={Styles.modalSubmitText}>Add Filter</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default SearchScreen
