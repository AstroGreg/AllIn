import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Dimensions, Linking, Alert } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from '../userProfile/UserProfileStyles';
import { ArrowLeft2, Clock, DocumentText, Gallery } from 'iconsax-react-nativejs';
import ProfileTimeline, { TimelineEntry } from '../../components/profileTimeline/ProfileTimeline';
import { useAuth } from '../../context/AuthContext';
import {
    followProfile,
    getPosts,
    getProfileCollections,
    getProfileSummary,
    getProfileSummaryById,
    getProfileTimeline,
    unfollowProfile,
    type PostSummary,
    type ProfileCollection,
    type ProfileSummary,
    type ProfileTimelineEntry,
} from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next';
import ProfileNewsSection, { type ProfileNewsItem } from '../../components/profileNews/ProfileNewsSection';

type PostSummaryWithCover = PostSummary & { coverImage?: string | null };

const ViewUserProfileScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { apiAccessToken } = useAuth();

    const [profileTab, setProfileTab] = useState<'timeline' | 'activity' | 'collections'>('timeline');
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
    const [timelineItems, setTimelineItems] = useState<TimelineEntry[]>([]);
    const [collections, setCollections] = useState<ProfileCollection[]>([]);
    const [posts, setPosts] = useState<PostSummaryWithCover[]>([]);
    const [summary, setSummary] = useState<ProfileSummary | null>(null);
    const [viewerProfileId, setViewerProfileId] = useState<string | null>(null);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);

    const profileId = useMemo(() => {
        const fromParams = route?.params?.profileId ?? route?.params?.profile_id;
        const user = route?.params?.user;
        const resolved =
            fromParams ||
            user?.profile_id ||
            user?.profileId ||
            user?.id ||
            user?.user_id ||
            null;
        return resolved ? String(resolved) : null;
    }, [route?.params?.profileId, route?.params?.profile_id, route?.params?.user]);

    const isSignedUrl = useCallback((value?: string | null) => {
        if (!value) return false;
        const lower = String(value).toLowerCase();
        return (
            lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp=')
        );
    }, []);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    const withAccessToken = useCallback((value?: string | null) => {
        if (!value) return undefined;
        if (!apiAccessToken) return value;
        if (isSignedUrl(value)) return value;
        if (value.includes('access_token=')) return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) return () => {};
        getProfileSummary(apiAccessToken)
            .then((resp) => {
                if (mounted) setViewerProfileId(resp?.profile_id ? String(resp.profile_id) : null);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, [apiAccessToken]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!apiAccessToken || !profileId) {
                if (mounted) {
                    setTimelineItems([]);
                    setCollections([]);
                    setPosts([]);
                    setSummary(null);
                }
                return;
            }
            try {
                const info = await getProfileSummaryById(apiAccessToken, String(profileId));
                if (mounted) setSummary(info);
            } catch {
                if (mounted) setSummary(null);
            }

            try {
                const tl = await getProfileTimeline(apiAccessToken, String(profileId));
                const items = Array.isArray((tl as any)?.items) ? (tl as any).items : [];
                const mapped: TimelineEntry[] = items.map((it: ProfileTimelineEntry) => ({
                    id: String(it.id),
                    year: String((it as any)?.year ?? ''),
                    title: String((it as any)?.title ?? ''),
                    description: (it as any)?.description ?? '',
                    highlight: (it as any)?.highlight ?? '',
                    photos: [],
                    linkedBlogs: [],
                    linkedCompetitions: [],
                    coverImage: (it as any)?.cover_thumbnail_url ?? null,
                }));
                if (mounted) setTimelineItems(mapped);
            } catch {
                if (mounted) setTimelineItems([]);
            }

            try {
                const c = await getProfileCollections(apiAccessToken, String(profileId), { limit: 50 });
                if (mounted) setCollections(Array.isArray((c as any)?.collections) ? (c as any).collections : []);
            } catch {
                if (mounted) setCollections([]);
            }

            try {
                const p = await getPosts(apiAccessToken, { author_profile_id: String(profileId), limit: 50 });
                const rawPosts = Array.isArray((p as any)?.posts) ? (p as any).posts : [];
                const sortedPosts = [...rawPosts].sort((a: PostSummary, b: PostSummary) => {
                    const aTime = Date.parse(String(a?.created_at ?? ''));
                    const bTime = Date.parse(String(b?.created_at ?? ''));
                    const timeDiff = (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
                    if (timeDiff !== 0) return timeDiff;
                    const titleDiff = String(b?.title ?? '').localeCompare(String(a?.title ?? ''), undefined, {
                        numeric: true,
                        sensitivity: 'base',
                    });
                    if (titleDiff !== 0) return titleDiff;
                    return String(b?.id ?? '').localeCompare(String(a?.id ?? ''));
                });
                const mapped = sortedPosts.map((entry: PostSummary) => {
                    const cover = (entry as any)?.cover_media || null;
                    const coverCandidate = cover?.thumbnail_url || cover?.preview_url || cover?.full_url || cover?.raw_url || null;
                    const resolved = coverCandidate ? toAbsoluteUrl(String(coverCandidate)) : null;
                    const coverImage = resolved ? (withAccessToken(resolved) || resolved) : null;
                    return { ...entry, coverImage };
                });
                if (mounted) setPosts(mapped);
            } catch {
                if (mounted) setPosts([]);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, profileId, toAbsoluteUrl, withAccessToken]);

    const targetProfileId = useMemo(() => {
        const value = String(summary?.profile_id ?? profileId ?? '').trim();
        return value.length > 0 ? value : null;
    }, [profileId, summary?.profile_id]);

    const isOwnProfile = useMemo(() => {
        const viewerId = String(viewerProfileId || '').trim();
        const targetId = String(targetProfileId || '').trim();
        return viewerId.length > 0 && targetId.length > 0 && viewerId === targetId;
    }, [targetProfileId, viewerProfileId]);

    const followAllowed = useMemo(() => {
        if (!summary?.profile_id || !targetProfileId) return false;
        return !isOwnProfile;
    }, [isOwnProfile, summary?.profile_id, targetProfileId]);

    const handleToggleFollow = async () => {
        if (!apiAccessToken || !targetProfileId || !summary || isUpdatingFollow) return;
        setIsUpdatingFollow(true);
        try {
            if (summary?.is_following) {
                await unfollowProfile(apiAccessToken, targetProfileId);
                setSummary((prev) => (prev ? { ...prev, is_following: false, followers_count: Math.max(0, (prev.followers_count ?? 0) - 1) } : prev));
            } else {
                await followProfile(apiAccessToken, targetProfileId);
                setSummary((prev) => (prev ? { ...prev, is_following: true, followers_count: (prev.followers_count ?? 0) + 1 } : prev));
            }
        } finally {
            setIsUpdatingFollow(false);
        }
    };

    const profileImageUrl = useMemo(() => {
        const avatarMedia = summary?.profile?.avatar_media ?? null;
        const avatarCandidate =
            avatarMedia?.thumbnail_url ||
            avatarMedia?.preview_url ||
            avatarMedia?.full_url ||
            avatarMedia?.raw_url ||
            avatarMedia?.original_url ||
            summary?.profile?.avatar_url ||
            null;
        if (!avatarCandidate) return null;
        const resolved = toAbsoluteUrl(String(avatarCandidate));
        return withAccessToken(resolved) || resolved;
    }, [summary?.profile, toAbsoluteUrl, withAccessToken]);

    const displayName = summary?.profile?.display_name || t('Profile');
    const displayHandle = useMemo(() => {
        const raw = String(summary?.profile?.username ?? '').trim().replace(/^@+/, '');
        if (!raw) return '';
        return raw.replace(/\s+/g, '');
    }, [summary?.profile?.username]);
    const bioText = useMemo(() => {
        const raw = String(summary?.profile?.bio ?? '').trim();
        if (!raw) return t('No bio added yet.');
        const normalizedRaw = raw.replace(/^@+/, '').trim().toLowerCase();
        const normalizedHandle = displayHandle.trim().toLowerCase();
        if (normalizedHandle.length > 0 && normalizedRaw === normalizedHandle) {
            return t('No bio added yet.');
        }
        return raw;
    }, [displayHandle, summary?.profile?.bio, t]);

    const selectedEventProfilesNormalized = useMemo(() => {
        const raw = (summary?.profile as any)?.selected_events;
        const events = Array.isArray(raw) ? raw : [];
        return events
            .map((entry: any) =>
                String(
                    typeof entry === 'string'
                        ? entry
                        : entry?.id ?? entry?.value ?? entry?.event_id ?? entry?.name ?? '',
                )
                    .trim()
                    .toLowerCase(),
            )
            .filter(Boolean);
    }, [summary?.profile]);
    const hasTrackFieldProfile = selectedEventProfilesNormalized.some((entry) =>
        entry === 'track-field' || entry === 'track&field' || entry === 'track_field' || entry.includes('track'),
    );
    const hasRoadTrailProfile = selectedEventProfilesNormalized.some((entry) =>
        entry === 'road-events' || entry === 'road&trail' || entry === 'road_trail' || entry.includes('road') || entry.includes('trail'),
    );
    const isTrackProfileView = !hasRoadTrailProfile || hasTrackFieldProfile;
    const profileCategoryLabel = isTrackProfileView ? t('trackAndField') : t('roadAndTrail');
    const currentYear = useMemo(() => String(new Date().getFullYear()), []);
    const currentChestNumber = useMemo(() => {
        const raw = (summary?.profile as any)?.chest_numbers_by_year;
        if (!raw || typeof raw !== 'object') return '';
        const byYear = raw as Record<string, unknown>;
        const thisYear = String(byYear[currentYear] ?? '').trim();
        if (thisYear) return thisYear;
        const latestYear = Object.keys(byYear)
            .filter((year) => /^\d{4}$/.test(String(year)))
            .sort((a, b) => Number(b) - Number(a))
            .find((year) => String(byYear[year] ?? '').trim().length > 0);
        if (!latestYear) return '';
        return String(byYear[latestYear] ?? '').trim();
    }, [currentYear, summary?.profile]);
    const athleticsClub = useMemo(() => {
        return String(
            (summary?.profile as any)?.track_field_club ??
            (summary?.profile as any)?.athletics_club ??
            (summary?.profile as any)?.running_club ??
            (summary?.profile as any)?.running_club_name ??
            '',
        ).trim();
    }, [summary?.profile]);
    const trackFieldMainEvent = useMemo(
        () => String((summary?.profile as any)?.track_field_main_event ?? '').trim(),
        [summary?.profile],
    );
    const roadTrailMainEvent = useMemo(
        () => String((summary?.profile as any)?.road_trail_main_event ?? '').trim(),
        [summary?.profile],
    );
    const nationality = useMemo(
        () => String((summary?.profile as any)?.nationality ?? '').trim(),
        [summary?.profile],
    );
    const website = useMemo(
        () => String((summary?.profile as any)?.website ?? '').trim(),
        [summary?.profile],
    );
    const profileMetaTokens = useMemo(() => {
        const trackEventWithClub = [trackFieldMainEvent, athleticsClub].map((entry) => String(entry || '').trim()).filter(Boolean).join(' · ');
        const roadEventWithClub = [roadTrailMainEvent, athleticsClub].map((entry) => String(entry || '').trim()).filter(Boolean).join(' · ');
        if (isTrackProfileView) {
            return [nationality, currentChestNumber, trackEventWithClub].map((entry) => String(entry || '').trim()).filter(Boolean);
        }
        return [nationality, roadEventWithClub].map((entry) => String(entry || '').trim()).filter(Boolean);
    }, [athleticsClub, currentChestNumber, isTrackProfileView, nationality, roadTrailMainEvent, trackFieldMainEvent]);
    const openProfileWebsite = useCallback(async () => {
        const raw = String(website || '').trim();
        if (!raw) return;
        const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        try {
            await Linking.openURL(normalized);
        } catch {
            Alert.alert(t('Error'), t('Could not open website.'));
        }
    }, [t, website]);

    const photoCollections = useMemo(
        () => collections.filter((c) => String(c.collection_type || '').toLowerCase() === 'image'),
        [collections],
    );
    const videoCollections = useMemo(
        () => collections.filter((c) => String(c.collection_type || '').toLowerCase() === 'video'),
        [collections],
    );

    const visibleCollections = useMemo(() => {
        const list = activeTab === 'photos' ? photoCollections : videoCollections;
        return list.slice(0, 4);
    }, [activeTab, photoCollections, videoCollections]);

    const activityItems = useMemo<ProfileNewsItem[]>(() => {
        return posts.map((entry) => ({
            id: String(entry.id),
            title: String(entry.title || ''),
            date: entry.created_at ? String(entry.created_at).slice(0, 10) : '',
            description: String(entry.summary || entry.description || ''),
            coverImage: entry.coverImage ? String(entry.coverImage) : null,
        }));
    }, [posts]);

    const hasTimeline = timelineItems.length > 0;
    const hasCollections = collections.length > 0;
    const availableTabs = useMemo(() => {
        const tabs: Array<'timeline' | 'activity' | 'collections'> = ['activity'];
        if (hasTimeline) tabs.unshift('timeline');
        if (hasCollections) tabs.push('collections');
        return tabs;
    }, [hasCollections, hasTimeline]);

    useEffect(() => {
        if (!availableTabs.includes(profileTab)) {
            setProfileTab(availableTabs[0] || 'activity');
        }
    }, [availableTabs, profileTab]);

    const localStyles = useMemo(
        () =>
            StyleSheet.create({
                followButton: {
                    marginTop: 16,
                    paddingVertical: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.primaryColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: summary?.is_following ? colors.btnBackgroundColor : colors.primaryColor,
                },
                followButtonText: {
                    fontSize: 14,
                    color: summary?.is_following ? colors.primaryColor : colors.whiteColor,
                },
            }),
        [colors, summary?.is_following],
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Profile')}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <View style={Styles.profileCard}>
                    <View style={Styles.profileTopRow}>
                        <View style={Styles.profileHeaderRow}>
                            <View style={Styles.profileImageContainer}>
                                <View style={Styles.profileImageInner}>
                                    {profileImageUrl ? (
                                        <FastImage source={{ uri: profileImageUrl }} style={Styles.profileImage} resizeMode="cover" />
                                    ) : (
                                        <View style={[Styles.profileImage, { backgroundColor: colors.btnBackgroundColor }]} />
                                    )}
                                </View>
                            </View>
                            <View style={Styles.statsContainerRight}>
                                <View style={Styles.statItem}>
                                    <Text style={Styles.statValue}>{summary?.followers_count ?? 0}</Text>
                                    <Text style={Styles.statLabel}>{t('Followers')}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={Styles.profileCategoryOnly}>
                            <Icons.TrackFieldLogo width={28} height={24} />
                            <Text style={Styles.profileCategoryText}>{profileCategoryLabel}</Text>
                        </View>
                    </View>

                    <View style={Styles.profileIdentityBlock}>
                        <View style={Styles.profileIdentityRow}>
                            <View style={Styles.profileIdentityHandleWrap}>
                                {displayHandle.length > 0 ? (
                                    <Text style={Styles.userHandleInline} numberOfLines={1}>
                                        @{displayHandle}
                                    </Text>
                                ) : null}
                            </View>
                            <View style={Styles.profileIdentityNameWrap}>
                                <Text style={Styles.userName} numberOfLines={1}>
                                    {displayName}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {followAllowed && (
                        <TouchableOpacity style={localStyles.followButton} onPress={handleToggleFollow} disabled={isUpdatingFollow}>
                            {isUpdatingFollow ? (
                                <ActivityIndicator size="small" color={summary?.is_following ? colors.primaryColor : colors.whiteColor} />
                            ) : (
                                <Text style={localStyles.followButtonText}>
                                    {summary?.is_following ? t('Following') : t('Follow')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}

                    <View style={Styles.bioSection}>
                        <View style={Styles.bioHeader}>
                            <Text style={Styles.bioTitle}>{t('Bio')}</Text>
                        </View>
                        <Text style={Styles.bioText}>{bioText}</Text>
                        <View style={Styles.bioDivider} />
                    </View>
                    {profileMetaTokens.length > 0 && (
                        <View style={Styles.athleteMetaSection}>
                            <View style={Styles.athleteMetaInlineBox}>
                                {profileMetaTokens.map((token, index) => (
                                    <React.Fragment key={`meta-${token}-${index}`}>
                                        <Text style={Styles.athleteMetaInlineValue}>{token}</Text>
                                        {index < profileMetaTokens.length - 1 ? (
                                            <Text style={Styles.athleteMetaInlineDot}>•</Text>
                                        ) : null}
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>
                    )}
                    {website.length > 0 ? (
                        <View style={Styles.athleteMetaSection}>
                            <TouchableOpacity activeOpacity={0.8} onPress={openProfileWebsite}>
                                <Text style={[Styles.athleteMetaInlineValue, { color: colors.primaryColor, textDecorationLine: 'underline' }]}>
                                    {website}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>

                <View style={Styles.profileTabs}>
                    {hasTimeline && (
                        <TouchableOpacity
                            style={[Styles.profileTab, profileTab === 'timeline' && Styles.profileTabActive]}
                            onPress={() => setProfileTab('timeline')}
                        >
                            <Clock size={18} color={profileTab === 'timeline' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                            <Text style={[Styles.profileTabText, profileTab === 'timeline' && Styles.profileTabTextActive]}>{t('Timeline')}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[Styles.profileTab, profileTab === 'activity' && Styles.profileTabActive]}
                        onPress={() => setProfileTab('activity')}
                    >
                        <DocumentText size={18} color={profileTab === 'activity' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                        <Text style={[Styles.profileTabText, profileTab === 'activity' && Styles.profileTabTextActive]}>{t('News')}</Text>
                    </TouchableOpacity>
                    {hasCollections && (
                        <TouchableOpacity
                            style={[Styles.profileTab, profileTab === 'collections' && Styles.profileTabActive]}
                            onPress={() => setProfileTab('collections')}
                        >
                            <Gallery size={18} color={profileTab === 'collections' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                            <Text style={[Styles.profileTabText, profileTab === 'collections' && Styles.profileTabTextActive]}>{t('Collections')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {profileTab === 'timeline' && (
                    <ProfileTimeline
                        title={t('Timeline')}
                        items={timelineItems}
                        onPressItem={(item) => navigation.navigate('ProfileTimelineDetailScreen', { item, ownerName: displayName })}
                    />
                )}

                {profileTab === 'activity' && (
                    <ProfileNewsSection
                        styles={Styles}
                        sectionTitle={t('News')}
                        items={activityItems}
                        emptyText={t('No news yet.')}
                        blogLabel={t('Blog')}
                        onPressItem={(item) => {
                            navigation.navigate('ViewUserBlogDetailsScreen', {
                                postId: item.id,
                                postPreview: {
                                    title: item.title,
                                    date: item.date,
                                    description: item.description,
                                    coverImage: item.coverImage,
                                },
                            });
                        }}
                    />
                )}

                {profileTab === 'collections' && (
                    <View style={Styles.collectionsSection}>
                        <View style={Styles.sectionHeader}>
                            <Text style={Styles.sectionTitle}>{t('Collections')}</Text>
                        </View>

                        <View style={Styles.toggleContainer}>
                            <TouchableOpacity
                                style={[Styles.toggleButton, activeTab === 'photos' && Styles.toggleButtonActive]}
                                onPress={() => setActiveTab('photos')}
                            >
                                <Text style={activeTab === 'photos' ? Styles.toggleTextActive : Styles.toggleText}>{t('Photos')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.toggleButton, activeTab === 'videos' && Styles.toggleButtonActive]}
                                onPress={() => setActiveTab('videos')}
                            >
                                <Text style={activeTab === 'videos' ? Styles.toggleTextActive : Styles.toggleText}>{t('Videos')}</Text>
                            </TouchableOpacity>
                        </View>

                        {activeTab === 'photos' ? (
                            <View style={Styles.collectionsGrid}>
                                {visibleCollections.map((c, idx) => {
                                    const thumb = c.cover_thumbnail_url ? toAbsoluteUrl(String(c.cover_thumbnail_url)) : null;
                                    const thumbUrl = thumb ? (withAccessToken(thumb) || thumb) : null;
                                    return (
                                        <TouchableOpacity
                                            key={String(c.id || idx)}
                                            onPress={() => {
                                                if (c.cover_media_id) {
                                                    navigation.navigate('PhotoDetailScreen', {
                                                        eventTitle: c.name || t('Collection'),
                                                        media: { id: c.cover_media_id, type: 'photo' },
                                                    });
                                                }
                                            }}
                                        >
                                            {thumbUrl ? (
                                                <FastImage
                                                    source={{ uri: String(thumbUrl) }}
                                                    style={[Styles.collectionImage, { width: imageWidth }]}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={[Styles.collectionImage, { width: imageWidth, backgroundColor: colors.btnBackgroundColor }]} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={Styles.videosGrid}>
                                {visibleCollections.map((c, idx) => {
                                    const thumb = c.cover_thumbnail_url ? toAbsoluteUrl(String(c.cover_thumbnail_url)) : null;
                                    const thumbUrl = thumb ? (withAccessToken(thumb) || thumb) : null;
                                    return (
                                        <TouchableOpacity
                                            key={String(c.id || idx)}
                                            style={Styles.videoCard}
                                            onPress={() => {
                                                if (c.cover_media_id) {
                                                    navigation.navigate('PhotoDetailScreen', {
                                                        eventTitle: c.name || t('Collection'),
                                                        media: { id: c.cover_media_id, type: 'video' },
                                                    });
                                                }
                                            }}
                                        >
                                            <View style={Styles.videoThumbnailContainer}>
                                                {thumbUrl ? (
                                                    <FastImage source={{ uri: String(thumbUrl) }} style={Styles.videoThumbnail} resizeMode="cover" />
                                                ) : (
                                                    <View style={[Styles.videoThumbnail, { backgroundColor: colors.btnBackgroundColor }]} />
                                                )}
                                            </View>
                                            <Text style={Styles.videoCardTitle}>{c.name}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default ViewUserProfileScreen;
