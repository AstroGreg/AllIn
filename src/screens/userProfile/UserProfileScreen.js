var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Modal, ActivityIndicator, Alert, Linking, TextInput } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from './UserProfileStyles';
import { User, Edit2, Clock, ArrowRight, DocumentText, Gallery, DocumentDownload, Add } from 'iconsax-react-nativejs';
import { launchImageLibrary } from 'react-native-image-picker';
import ProfileTimeline from '../../components/profileTimeline/ProfileTimeline';
import { useAuth } from '../../context/AuthContext';
import { deletePost, getDownloadsSummary, getHomeOverview, getMyGroups, getPosts, getProfileCollectionByType, getProfileSummary, getProfileTimeline, getUploadedCompetitions, updateProfileSummary, uploadMediaBatch, } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ProfileNewsSection from '../../components/profileNews/ProfileNewsSection';
import SportFocusIcon from '../../components/profile/SportFocusIcon';
import SupportProfileSummary, { getSupportProfileBadgeLabel } from '../../components/profile/SupportProfileSummary';
import E2EPerfReady from '../../components/e2e/E2EPerfReady';
import { focusUsesChestNumbers, getDisciplineLabel, getMainDisciplineForFocus, getProfileCollectionScopeKey, getSportFocusLabel, normalizeMainDisciplines, normalizeProfileModeId, normalizeSelectedEvents, } from '../../utils/profileSelections';
const UserProfileScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const { user, userProfile, authBootstrap, apiAccessToken, updateUserProfile } = useAuth();
    const perfStartedAtRef = useRef(Date.now());
    const defaultProfileImage = useMemo(() => {
        var _a;
        const googlePicture = String((_a = user === null || user === void 0 ? void 0 : user.picture) !== null && _a !== void 0 ? _a : '').trim();
        return googlePicture ? { uri: googlePicture } : Images.profilePic;
    }, [user === null || user === void 0 ? void 0 : user.picture]);
    const [activeTab, setActiveTab] = useState('photos');
    const [timelineItems, setTimelineItems] = useState([]);
    const [profileTab, setProfileTab] = useState('timeline');
    const [blogEntries, setBlogEntries] = useState([]);
    const [profileCategory, setProfileCategory] = useState(null);
    const [showProfileSwitcherModal, setShowProfileSwitcherModal] = useState(false);
    const [pendingDeleteBlog, setPendingDeleteBlog] = useState(null);
    const [isDeletingBlog, setIsDeletingBlog] = useState(false);
    const [profileImage, setProfileImage] = useState(defaultProfileImage);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [downloadsSummary, setDownloadsSummary] = useState(null);
    const [profileSummary, setProfileSummary] = useState(null);
    const currentYear = useMemo(() => String(new Date().getFullYear()), []);
    const [chestNumbersByYear, setChestNumbersByYear] = useState({});
    const [photoCollectionItems, setPhotoCollectionItems] = useState([]);
    const [videoCollectionItems, setVideoCollectionItems] = useState([]);
    const [uploadedCompetitions, setUploadedCompetitions] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [didLoadProfileData, setDidLoadProfileData] = useState(false);
    const [isTimelineLoading, setIsTimelineLoading] = useState(false);
    const [hasLoadedTimeline, setHasLoadedTimeline] = useState(false);
    const [isActivityLoading, setIsActivityLoading] = useState(false);
    const [hasLoadedActivity, setHasLoadedActivity] = useState(false);
    const [isDownloadsLoading, setIsDownloadsLoading] = useState(false);
    const [hasLoadedDownloads, setHasLoadedDownloads] = useState(false);
    const [isCollectionsLoading, setIsCollectionsLoading] = useState(false);
    const [hasLoadedCollections, setHasLoadedCollections] = useState(false);
    const [websiteEditVisible, setWebsiteEditVisible] = useState(false);
    const [websiteDraft, setWebsiteDraft] = useState('');
    const [websiteSaveBusy, setWebsiteSaveBusy] = useState(false);
    const { width } = Dimensions.get('window');
    const showBackButton = Boolean((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.showBackButton) || String(((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.origin) || '').toLowerCase() === 'search';
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);
    const selectedEventProfiles = useMemo(() => {
        var _a;
        const serverEvents = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.selected_events;
        if (Array.isArray(serverEvents) && serverEvents.length > 0) {
            return serverEvents;
        }
        const localEvents = userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents;
        return Array.isArray(localEvents) ? localEvents : [];
    }, [(_c = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _c === void 0 ? void 0 : _c.selected_events, userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents]);
    const selectedFocusesFromProfile = useMemo(() => normalizeSelectedEvents(selectedEventProfiles), [selectedEventProfiles]);
    const hasSupportProfile = useMemo(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return (String((_c = (_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.support_role) !== null && _b !== void 0 ? _b : userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportRole) !== null && _c !== void 0 ? _c : '').trim().length > 0 ||
            (Array.isArray((_d = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _d === void 0 ? void 0 : _d.support_club_codes) && ((_e = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _e === void 0 ? void 0 : _e.support_club_codes.length) > 0) ||
            (Array.isArray((_f = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _f === void 0 ? void 0 : _f.support_group_ids) && ((_g = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _g === void 0 ? void 0 : _g.support_group_ids.length) > 0) ||
            (Array.isArray((_h = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _h === void 0 ? void 0 : _h.support_athlete_profile_ids) && ((_j = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _j === void 0 ? void 0 : _j.support_athlete_profile_ids.length) > 0) ||
            (Array.isArray((_k = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _k === void 0 ? void 0 : _k.support_focuses) && ((_l = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _l === void 0 ? void 0 : _l.support_focuses.length) > 0) ||
            (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportClubCodes) && (userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportClubCodes.length) > 0) ||
            (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportGroupIds) && (userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportGroupIds.length) > 0) ||
            (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportAthleteProfileIds) && (userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportAthleteProfileIds.length) > 0) ||
            (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportFocuses) && (userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportFocuses.length) > 0) ||
            (userProfile === null || userProfile === void 0 ? void 0 : userProfile.category) === 'support');
    }, [profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile, userProfile]);
    const selectedFocuses = useMemo(() => selectedFocusesFromProfile, [selectedFocusesFromProfile]);
    const bootstrapProfileId = String((authBootstrap === null || authBootstrap === void 0 ? void 0 : authBootstrap.profile_id) || '').trim();
    const summaryProfileId = String((profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile_id) || '').trim();
    const hasConcreteProfileRecord = summaryProfileId.length > 0 ||
        bootstrapProfileId.length > 0 ||
        (authBootstrap === null || authBootstrap === void 0 ? void 0 : authBootstrap.has_profiles) === true;
    const hasAnyLinkedProfiles = hasConcreteProfileRecord || selectedFocuses.length > 0 || myGroups.length > 0 || hasSupportProfile;
    const shouldShowEmptyProfileState = didLoadProfileData && !hasAnyLinkedProfiles;
    const perfReady = Boolean(profileImage) || (didLoadProfileData && (profileSummary !== null || shouldShowEmptyProfileState));
    const profileCategoryLabel = profileCategory ? (profileCategory === 'support' ? t('Support') : getSportFocusLabel(profileCategory, t)) : '';
    const collectionScopeKey = useMemo(() => {
        if (profileCategory)
            return getProfileCollectionScopeKey(profileCategory);
        if (selectedFocuses.length > 0)
            return getProfileCollectionScopeKey(selectedFocuses[0]);
        if (hasSupportProfile)
            return 'support';
        return 'default';
    }, [hasSupportProfile, profileCategory, selectedFocuses]);
    const showDownloadsTab = true;
    const renderFocusIcon = useCallback((focusId, size = 20) => (_jsx(SportFocusIcon, { focusId: focusId, size: size, color: colors.primaryColor })), [colors.primaryColor]);
    const normalizeChestByYear = useCallback((raw) => {
        if (!raw || typeof raw !== 'object')
            return {};
        const out = {};
        for (const [year, chest] of Object.entries(raw)) {
            const safeYear = String(year || '').trim();
            if (!/^\d{4}$/.test(safeYear))
                continue;
            const parsed = Number(chest);
            if (!Number.isInteger(parsed) || parsed < 0)
                continue;
            out[safeYear] = String(parsed);
        }
        return out;
    }, []);
    const isSignedUrl = useCallback((value) => {
        if (!value)
            return false;
        const lower = String(value).toLowerCase();
        return (lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp='));
    }, []);
    const toAbsoluteUrl = useCallback((value) => {
        if (!value)
            return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://'))
            return raw;
        const base = getApiBaseUrl();
        if (!base)
            return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);
    const withAccessToken = useCallback((value) => {
        if (!value)
            return undefined;
        if (!apiAccessToken)
            return value;
        if (isSignedUrl(value))
            return value;
        if (value.includes('access_token='))
            return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);
    const resolveThumbUrl = useCallback((media) => {
        const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || media.original_url || null;
        const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);
    const resolveMediaUrl = useCallback((media) => {
        const candidate = media.preview_url || media.full_url || media.original_url || media.raw_url || null;
        const resolved = candidate ? toAbsoluteUrl(String(candidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);
    const resolveTimelineMediaThumb = useCallback((media) => {
        const thumbCandidate = (media === null || media === void 0 ? void 0 : media.thumbnail_url) || (media === null || media === void 0 ? void 0 : media.preview_url) || (media === null || media === void 0 ? void 0 : media.full_url) || (media === null || media === void 0 ? void 0 : media.raw_url) || (media === null || media === void 0 ? void 0 : media.original_url) || null;
        const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);
    const timelineStorageKey = useMemo(() => {
        const key = (user === null || user === void 0 ? void 0 : user.sub) || (userProfile === null || userProfile === void 0 ? void 0 : userProfile.username) || (user === null || user === void 0 ? void 0 : user.email) || 'self';
        return `@profile_timeline_${key}`;
    }, [user === null || user === void 0 ? void 0 : user.email, user === null || user === void 0 ? void 0 : user.sub, userProfile === null || userProfile === void 0 ? void 0 : userProfile.username]);
    const blogStorageKey = useMemo(() => {
        const key = (user === null || user === void 0 ? void 0 : user.sub) || (userProfile === null || userProfile === void 0 ? void 0 : userProfile.username) || (user === null || user === void 0 ? void 0 : user.email) || 'self';
        return `@profile_blogs_${key}`;
    }, [user === null || user === void 0 ? void 0 : user.email, user === null || user === void 0 ? void 0 : user.sub, userProfile === null || userProfile === void 0 ? void 0 : userProfile.username]);
    useEffect(() => {
        if (profileCategory === 'support' && hasSupportProfile)
            return;
        if (profileCategory && profileCategory !== 'support' && selectedFocuses.includes(profileCategory))
            return;
        if (selectedFocuses.length > 0) {
            setProfileCategory(selectedFocuses[0]);
            return;
        }
        if (hasSupportProfile) {
            setProfileCategory('support');
            return;
        }
        if (profileCategory !== null)
            setProfileCategory(null);
    }, [hasSupportProfile, profileCategory, selectedFocuses]);
    const loadProfileShell = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _l, _m, _o, _p, _q, _r;
        const localChestByYear = normalizeChestByYear((_l = userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear) !== null && _l !== void 0 ? _l : {});
        setChestNumbersByYear(localChestByYear);
        setProfileImage(defaultProfileImage);
        if (apiAccessToken) {
            let shellReady = false;
            try {
                const summary = yield getProfileSummary(apiAccessToken);
                setProfileSummary(summary);
                const serverChestByYear = normalizeChestByYear((_o = (_m = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _m === void 0 ? void 0 : _m.chest_numbers_by_year) !== null && _o !== void 0 ? _o : {});
                setChestNumbersByYear(serverChestByYear);
                const avatarMedia = (_q = (_p = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _p === void 0 ? void 0 : _p.avatar_media) !== null && _q !== void 0 ? _q : null;
                const avatarCandidate = (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.thumbnail_url) ||
                    (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.preview_url) ||
                    (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.full_url) ||
                    (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.raw_url) ||
                    (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.original_url) ||
                    ((_r = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _r === void 0 ? void 0 : _r.avatar_url) ||
                    null;
                if (avatarCandidate) {
                    const resolved = toAbsoluteUrl(String(avatarCandidate));
                    const withToken = withAccessToken(resolved) || resolved;
                    if (withToken) {
                        setProfileImage({ uri: withToken });
                    }
                }
                else {
                    setProfileImage(defaultProfileImage);
                }
                shellReady = true;
            }
            catch (_s) {
                setProfileSummary(null);
                setProfileImage(defaultProfileImage);
            }
            if (!didLoadProfileData || shellReady) {
                setDidLoadProfileData(true);
            }
            try {
                const resp = yield getMyGroups(apiAccessToken);
                setMyGroups(Array.isArray(resp === null || resp === void 0 ? void 0 : resp.groups) ? resp.groups : []);
            }
            catch (_t) {
                setMyGroups([]);
            }
        }
        else {
            setProfileSummary(null);
            setProfileImage(defaultProfileImage);
            setMyGroups([]);
            setDidLoadProfileData(true);
        }
    }), [
        apiAccessToken,
        defaultProfileImage,
        didLoadProfileData,
        normalizeChestByYear,
        toAbsoluteUrl,
        userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear,
        withAccessToken,
    ]);
    const loadTimelineTab = useCallback((force = false) => __awaiter(void 0, void 0, void 0, function* () {
        if (!force && (hasLoadedTimeline || isTimelineLoading))
            return;
        setIsTimelineLoading(true);
        if (apiAccessToken) {
            try {
                const resp = yield getProfileTimeline(apiAccessToken, 'me');
                const items = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.items) ? resp.items : [];
                const mapped = items.map((it) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    const mediaItems = Array.isArray(it === null || it === void 0 ? void 0 : it.media) ? it.media : [];
                    const photos = mediaItems
                        .map((media) => resolveTimelineMediaThumb(media))
                        .filter(Boolean);
                    const coverUrl = (it === null || it === void 0 ? void 0 : it.cover_thumbnail_url) ? toAbsoluteUrl(String(it.cover_thumbnail_url)) : null;
                    const backgroundImage = coverUrl ? (withAccessToken(coverUrl) || coverUrl) : null;
                    const linkedPosts = Array.isArray(it === null || it === void 0 ? void 0 : it.linked_posts) ? it.linked_posts : [];
                    const linkedEvents = Array.isArray(it === null || it === void 0 ? void 0 : it.linked_events) ? it.linked_events : [];
                    const eventDate = (_a = it === null || it === void 0 ? void 0 : it.event_date) !== null && _a !== void 0 ? _a : null;
                    const yearValue = eventDate ? new Date(String(eventDate)).getFullYear() : Number((_b = it === null || it === void 0 ? void 0 : it.year) !== null && _b !== void 0 ? _b : '');
                    return {
                        id: String(it.id),
                        year: Number.isFinite(yearValue) ? String(yearValue) : String((_c = it === null || it === void 0 ? void 0 : it.year) !== null && _c !== void 0 ? _c : ''),
                        date: eventDate ? String(eventDate) : null,
                        title: String((_d = it === null || it === void 0 ? void 0 : it.title) !== null && _d !== void 0 ? _d : ''),
                        description: (_e = it === null || it === void 0 ? void 0 : it.description) !== null && _e !== void 0 ? _e : '',
                        highlight: (_f = it === null || it === void 0 ? void 0 : it.highlight) !== null && _f !== void 0 ? _f : '',
                        photos,
                        mediaItems,
                        cover_media_id: (_g = it === null || it === void 0 ? void 0 : it.cover_media_id) !== null && _g !== void 0 ? _g : null,
                        backgroundImage: backgroundImage || undefined,
                        linkedBlogs: linkedPosts.map((p) => { var _a; return ({ id: String(p.id), title: String((_a = p.title) !== null && _a !== void 0 ? _a : t('Blog')) }); }),
                        linkedCompetitions: linkedEvents.map((e) => {
                            var _a, _b, _c;
                            return ({
                                id: String(e.event_id),
                                title: String((_a = e.event_name) !== null && _a !== void 0 ? _a : t('competition')),
                                event_date: (_b = e.event_date) !== null && _b !== void 0 ? _b : null,
                                event_location: (_c = e.event_location) !== null && _c !== void 0 ? _c : null,
                            });
                        }),
                        linkedBlogIds: linkedPosts.map((p) => String(p.id)),
                        linkedCompetitionIds: linkedEvents.map((e) => String(e.event_id)),
                    };
                });
                setTimelineItems(mapped);
            }
            catch (_u) {
                setTimelineItems([]);
            }
        }
        else {
            setTimelineItems([]);
        }
        setHasLoadedTimeline(true);
        setIsTimelineLoading(false);
    }), [
        apiAccessToken,
        hasLoadedTimeline,
        isTimelineLoading,
        resolveTimelineMediaThumb,
        t,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const loadActivityTab = useCallback((force = false) => __awaiter(void 0, void 0, void 0, function* () {
        var _v;
        if (!force && (hasLoadedActivity || isActivityLoading))
            return;
        setIsActivityLoading(true);
        const postsProfileId = (profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile_id) ? String(profileSummary.profile_id) : null;
        if (apiAccessToken && profileCategory === 'support') {
            try {
                const overview = yield getHomeOverview(apiAccessToken, 'me');
                const feedPosts = Array.isArray((_v = overview === null || overview === void 0 ? void 0 : overview.overview) === null || _v === void 0 ? void 0 : _v.feed_posts) ? overview.overview.feed_posts : [];
                const mapped = [...feedPosts]
                    .sort((a, b) => {
                    var _a, _b, _c, _d;
                    const aTime = Date.parse(String((_b = (_a = a === null || a === void 0 ? void 0 : a.post) === null || _a === void 0 ? void 0 : _a.created_at) !== null && _b !== void 0 ? _b : ''));
                    const bTime = Date.parse(String((_d = (_c = b === null || b === void 0 ? void 0 : b.post) === null || _c === void 0 ? void 0 : _c.created_at) !== null && _d !== void 0 ? _d : ''));
                    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
                })
                    .map((entry) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
                    const media = (_a = entry === null || entry === void 0 ? void 0 : entry.media) !== null && _a !== void 0 ? _a : null;
                    const coverCandidate = (media === null || media === void 0 ? void 0 : media.thumbnail_url) || (media === null || media === void 0 ? void 0 : media.preview_url) || (media === null || media === void 0 ? void 0 : media.full_url) || (media === null || media === void 0 ? void 0 : media.raw_url) || null;
                    const resolved = coverCandidate ? toAbsoluteUrl(String(coverCandidate)) : null;
                    const rawPostType = String((_c = (_b = entry === null || entry === void 0 ? void 0 : entry.post) === null || _b === void 0 ? void 0 : _b.post_type) !== null && _c !== void 0 ? _c : '').trim().toLowerCase();
                    return {
                        id: String((_e = (_d = entry === null || entry === void 0 ? void 0 : entry.post) === null || _d === void 0 ? void 0 : _d.id) !== null && _e !== void 0 ? _e : ''),
                        kind: rawPostType === 'photo' || rawPostType === 'video' ? rawPostType : 'blog',
                        postId: String((_g = (_f = entry === null || entry === void 0 ? void 0 : entry.post) === null || _f === void 0 ? void 0 : _f.id) !== null && _g !== void 0 ? _g : ''),
                        mediaId: String((_j = (_h = media === null || media === void 0 ? void 0 : media.media_id) !== null && _h !== void 0 ? _h : media === null || media === void 0 ? void 0 : media.id) !== null && _j !== void 0 ? _j : '').trim() || null,
                        mediaType: (media === null || media === void 0 ? void 0 : media.type) === 'video' ? 'video' : ((media === null || media === void 0 ? void 0 : media.media_id) || (media === null || media === void 0 ? void 0 : media.id) ? 'image' : null),
                        title: String((_l = (_k = entry === null || entry === void 0 ? void 0 : entry.post) === null || _k === void 0 ? void 0 : _k.title) !== null && _l !== void 0 ? _l : ''),
                        createdAt: ((_m = entry === null || entry === void 0 ? void 0 : entry.post) === null || _m === void 0 ? void 0 : _m.created_at) ? String(entry.post.created_at) : null,
                        date: ((_o = entry === null || entry === void 0 ? void 0 : entry.post) === null || _o === void 0 ? void 0 : _o.created_at) ? String(entry.post.created_at).slice(0, 10) : '',
                        description: String((_s = (_q = (_p = entry === null || entry === void 0 ? void 0 : entry.post) === null || _p === void 0 ? void 0 : _p.summary) !== null && _q !== void 0 ? _q : (_r = entry === null || entry === void 0 ? void 0 : entry.post) === null || _r === void 0 ? void 0 : _r.description) !== null && _s !== void 0 ? _s : ''),
                        coverImage: resolved ? (withAccessToken(resolved) || resolved) : null,
                        canDelete: String((_v = (_u = (_t = entry === null || entry === void 0 ? void 0 : entry.post) === null || _t === void 0 ? void 0 : _t.author) === null || _u === void 0 ? void 0 : _u.profile_id) !== null && _v !== void 0 ? _v : '') === String((_w = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile_id) !== null && _w !== void 0 ? _w : ''),
                    };
                })
                    .filter((entry) => entry.id.length > 0);
                setBlogEntries(mapped);
            }
            catch (_w) {
                setBlogEntries([]);
            }
            setHasLoadedActivity(true);
            setIsActivityLoading(false);
            return;
        }
        if (apiAccessToken && postsProfileId) {
            try {
                const resp = yield getPosts(apiAccessToken, {
                    author_profile_id: String(postsProfileId),
                    limit: 50,
                    include_original: false,
                });
                const posts = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.posts) ? resp.posts : [];
                const sortedPosts = [...posts].sort((a, b) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    const aCreated = (_b = (_a = a === null || a === void 0 ? void 0 : a.created_at) !== null && _a !== void 0 ? _a : a === null || a === void 0 ? void 0 : a.createdAt) !== null && _b !== void 0 ? _b : null;
                    const bCreated = (_d = (_c = b === null || b === void 0 ? void 0 : b.created_at) !== null && _c !== void 0 ? _c : b === null || b === void 0 ? void 0 : b.createdAt) !== null && _d !== void 0 ? _d : null;
                    const aTime = Date.parse(String(aCreated !== null && aCreated !== void 0 ? aCreated : ''));
                    const bTime = Date.parse(String(bCreated !== null && bCreated !== void 0 ? bCreated : ''));
                    const timeDiff = (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
                    if (timeDiff !== 0)
                        return timeDiff;
                    const titleDiff = String((_e = b === null || b === void 0 ? void 0 : b.title) !== null && _e !== void 0 ? _e : '').localeCompare(String((_f = a === null || a === void 0 ? void 0 : a.title) !== null && _f !== void 0 ? _f : ''), undefined, {
                        numeric: true,
                        sensitivity: 'base',
                    });
                    if (titleDiff !== 0)
                        return titleDiff;
                    return String((_g = b === null || b === void 0 ? void 0 : b.id) !== null && _g !== void 0 ? _g : '').localeCompare(String((_h = a === null || a === void 0 ? void 0 : a.id) !== null && _h !== void 0 ? _h : ''));
                });
                const mapped = sortedPosts.map((p) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    const createdAtRaw = (_b = (_a = p === null || p === void 0 ? void 0 : p.created_at) !== null && _a !== void 0 ? _a : p === null || p === void 0 ? void 0 : p.createdAt) !== null && _b !== void 0 ? _b : null;
                    const cover = (p === null || p === void 0 ? void 0 : p.cover_media) || null;
                    const coverCandidate = (cover === null || cover === void 0 ? void 0 : cover.thumbnail_url) || (cover === null || cover === void 0 ? void 0 : cover.preview_url) || (cover === null || cover === void 0 ? void 0 : cover.full_url) || (cover === null || cover === void 0 ? void 0 : cover.raw_url) || null;
                    const resolved = coverCandidate ? toAbsoluteUrl(String(coverCandidate)) : null;
                    const coverImage = resolved ? (withAccessToken(resolved) || resolved) : null;
                    const rawPostType = String((_c = p === null || p === void 0 ? void 0 : p.post_type) !== null && _c !== void 0 ? _c : '').trim().toLowerCase();
                    return ({
                        id: String(p.id),
                        postId: String(p.id),
                        kind: rawPostType === 'photo' || rawPostType === 'video' ? rawPostType : 'blog',
                        mediaId: String((_d = cover === null || cover === void 0 ? void 0 : cover.media_id) !== null && _d !== void 0 ? _d : '').trim() || null,
                        mediaType: (cover === null || cover === void 0 ? void 0 : cover.type) === 'video' ? 'video' : ((cover === null || cover === void 0 ? void 0 : cover.media_id) ? 'image' : null),
                        title: String(p.title || ''),
                        createdAt: createdAtRaw ? String(createdAtRaw) : null,
                        date: createdAtRaw ? String(createdAtRaw).slice(0, 10) : '',
                        description: p.summary || p.description || '',
                        coverImage,
                        likes_count: Number((_e = p === null || p === void 0 ? void 0 : p.likes_count) !== null && _e !== void 0 ? _e : 0),
                        views_count: Number((_f = p === null || p === void 0 ? void 0 : p.views_count) !== null && _f !== void 0 ? _f : 0),
                        canDelete: String((_h = (_g = p === null || p === void 0 ? void 0 : p.author) === null || _g === void 0 ? void 0 : _g.profile_id) !== null && _h !== void 0 ? _h : '') === String(postsProfileId),
                    });
                });
                setBlogEntries(mapped);
            }
            catch (_x) {
                setBlogEntries([]);
            }
        }
        else {
            setBlogEntries([]);
        }
        setHasLoadedActivity(true);
        setIsActivityLoading(false);
    }), [
        apiAccessToken,
        hasLoadedActivity,
        isActivityLoading,
        profileCategory,
        profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile_id,
        t,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const loadDownloadsTab = useCallback((force = false) => __awaiter(void 0, void 0, void 0, function* () {
        var _y, _z, _0;
        if (!force && (hasLoadedDownloads || isDownloadsLoading))
            return;
        setIsDownloadsLoading(true);
        if (apiAccessToken) {
            try {
                const summary = yield getDownloadsSummary(apiAccessToken);
                setDownloadsSummary({
                    total_downloads: Number((_y = summary === null || summary === void 0 ? void 0 : summary.total_downloads) !== null && _y !== void 0 ? _y : 0),
                    total_views: Number((_z = summary === null || summary === void 0 ? void 0 : summary.total_views) !== null && _z !== void 0 ? _z : 0),
                    total_profit_cents: Number((_0 = summary === null || summary === void 0 ? void 0 : summary.total_profit_cents) !== null && _0 !== void 0 ? _0 : 0),
                });
            }
            catch (_1) {
                setDownloadsSummary({ total_downloads: 0, total_views: 0, total_profit_cents: 0 });
            }
            try {
                const resp = yield getUploadedCompetitions(apiAccessToken, { limit: 200 });
                setUploadedCompetitions(Array.isArray(resp === null || resp === void 0 ? void 0 : resp.competitions) ? resp.competitions : []);
            }
            catch (_2) {
                setUploadedCompetitions([]);
            }
        }
        else {
            setDownloadsSummary(null);
            setUploadedCompetitions([]);
        }
        setHasLoadedDownloads(true);
        setIsDownloadsLoading(false);
    }), [apiAccessToken, hasLoadedDownloads, isDownloadsLoading]);
    const loadCollections = useCallback((force = false) => __awaiter(void 0, void 0, void 0, function* () {
        if (!force && (hasLoadedCollections || isCollectionsLoading))
            return;
        setIsCollectionsLoading(true);
        if (!apiAccessToken || !hasAnyLinkedProfiles) {
            setPhotoCollectionItems([]);
            setVideoCollectionItems([]);
            setHasLoadedCollections(true);
            setIsCollectionsLoading(false);
            return;
        }
        try {
            const resp = yield getProfileCollectionByType(apiAccessToken, 'image', {
                scope_key: collectionScopeKey,
                include_original: false,
            });
            setPhotoCollectionItems(Array.isArray(resp === null || resp === void 0 ? void 0 : resp.items) ? resp.items : []);
        }
        catch (_3) {
            setPhotoCollectionItems([]);
        }
        try {
            const resp = yield getProfileCollectionByType(apiAccessToken, 'video', {
                scope_key: collectionScopeKey,
                include_original: false,
            });
            setVideoCollectionItems(Array.isArray(resp === null || resp === void 0 ? void 0 : resp.items) ? resp.items : []);
        }
        catch (_4) {
            setVideoCollectionItems([]);
        }
        setHasLoadedCollections(true);
        setIsCollectionsLoading(false);
    }), [apiAccessToken, collectionScopeKey, hasAnyLinkedProfiles, hasLoadedCollections, isCollectionsLoading]);
    useFocusEffect(useCallback(() => {
        void loadProfileShell();
        if (profileTab === 'timeline')
            setHasLoadedTimeline(false);
        if (profileTab === 'activity')
            setHasLoadedActivity(false);
        if (profileTab === 'downloads')
            setHasLoadedDownloads(false);
        if (profileTab === 'collections')
            setHasLoadedCollections(false);
    }, [loadProfileShell, profileTab]));
    useEffect(() => {
        setPhotoCollectionItems([]);
        setVideoCollectionItems([]);
        setHasLoadedCollections(false);
    }, [collectionScopeKey]);
    useEffect(() => {
        if (!didLoadProfileData || !hasAnyLinkedProfiles)
            return;
        if (profileTab === 'timeline') {
            void loadTimelineTab();
            return;
        }
        if (profileTab === 'activity') {
            void loadActivityTab();
            return;
        }
        if (profileTab === 'downloads' && showDownloadsTab) {
            void loadDownloadsTab();
            return;
        }
        if (profileTab === 'collections') {
            void loadCollections();
        }
    }, [
        didLoadProfileData,
        hasAnyLinkedProfiles,
        loadActivityTab,
        loadCollections,
        loadDownloadsTab,
        loadTimelineTab,
        profileTab,
        showDownloadsTab,
    ]);
    const openAddTimeline = () => {
        navigation.navigate('ProfileTimelineEditScreen', {
            mode: 'add',
            storageKey: timelineStorageKey,
            blogStorageKey,
            competitionOptions,
            collectionScopeKey,
        });
    };
    const openEditTimeline = (item) => {
        navigation.navigate('ProfileTimelineEditScreen', {
            mode: 'edit',
            storageKey: timelineStorageKey,
            item,
            blogStorageKey,
            competitionOptions,
            collectionScopeKey,
        });
    };
    const openTimelineDetail = (item) => {
        var _a;
        navigation.navigate('ProfileTimelineDetailScreen', {
            item,
            ownerName: (_a = user === null || user === void 0 ? void 0 : user.name) !== null && _a !== void 0 ? _a : t('Profile'),
        });
    };
    const openBlogEditor = (entry) => {
        navigation.navigate('ProfileBlogEditorScreen', {
            mode: entry ? 'edit' : 'add',
            storageKey: blogStorageKey,
            entry,
            collectionScopeKey,
        });
    };
    const setCategory = useCallback((value) => {
        if (value === 'support') {
            if (!hasSupportProfile)
                return;
            setProfileCategory('support');
            return;
        }
        if (!selectedFocuses.includes(value))
            return;
        setProfileCategory(value);
    }, [hasSupportProfile, selectedFocuses]);
    const openProfileMenu = () => {
        setShowProfileSwitcherModal(true);
    };
    const handleHeaderAction = useCallback(() => {
        if (!hasAnyLinkedProfiles) {
            navigation.navigate('CategorySelectionScreen', { fromAddFlow: true });
            return;
        }
        openProfileMenu();
    }, [hasAnyLinkedProfiles, navigation]);
    useEffect(() => {
        var _a, _b;
        const shouldOpen = Boolean((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.openProfileSwitcher);
        if (!shouldOpen)
            return;
        setShowProfileSwitcherModal(true);
        (_b = navigation.setParams) === null || _b === void 0 ? void 0 : _b.call(navigation, { openProfileSwitcher: false });
    }, [navigation, (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.openProfileSwitcher]);
    useEffect(() => {
        var _a, _b;
        const forcedCategory = normalizeProfileModeId((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.forceProfileCategory);
        if (!forcedCategory)
            return;
        setCategory(forcedCategory);
        (_b = navigation.setParams) === null || _b === void 0 ? void 0 : _b.call(navigation, { forceProfileCategory: undefined });
    }, [navigation, (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.forceProfileCategory, setCategory]);
    const e2eAvatarFixtureFile = useMemo(() => {
        var _a;
        const raw = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.e2eAvatarFixtureFile;
        if (!raw || typeof raw !== 'object')
            return null;
        const uri = String((raw === null || raw === void 0 ? void 0 : raw.uri) || '').trim();
        if (!uri)
            return null;
        return {
            uri,
            type: String((raw === null || raw === void 0 ? void 0 : raw.type) || 'image/jpeg').trim(),
            name: String((raw === null || raw === void 0 ? void 0 : raw.name) || `avatar-${Date.now()}.jpg`).trim(),
        };
    }, [(_f = route === null || route === void 0 ? void 0 : route.params) === null || _f === void 0 ? void 0 : _f.e2eAvatarFixtureFile]);
    const handleProfileImageChange = () => __awaiter(void 0, void 0, void 0, function* () {
        var _5, _6, _7, _8, _9, _10, _11, _12, _13;
        let asset = null;
        if (e2eAvatarFixtureFile) {
            asset = {
                uri: e2eAvatarFixtureFile.uri,
                type: e2eAvatarFixtureFile.type,
                fileName: e2eAvatarFixtureFile.name,
            };
        }
        else {
            const result = yield launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
                presentationStyle: 'fullScreen',
                assetRepresentationMode: 'current',
            });
            asset = (_6 = (_5 = result === null || result === void 0 ? void 0 : result.assets) === null || _5 === void 0 ? void 0 : _5[0]) !== null && _6 !== void 0 ? _6 : null;
        }
        if (!(asset === null || asset === void 0 ? void 0 : asset.uri))
            return;
        setProfileImage({ uri: asset.uri });
        if (!apiAccessToken)
            return;
        setIsUpdatingAvatar(true);
        try {
            const uploadResp = yield uploadMediaBatch(apiAccessToken, {
                files: [
                    {
                        uri: asset.uri,
                        type: (_7 = asset.type) !== null && _7 !== void 0 ? _7 : 'image/jpeg',
                        name: (_8 = asset.fileName) !== null && _8 !== void 0 ? _8 : `avatar-${Date.now()}.jpg`,
                    },
                ],
                skip_profile_collection: true,
            });
            const firstResult = Array.isArray(uploadResp === null || uploadResp === void 0 ? void 0 : uploadResp.results) ? uploadResp.results.find((r) => (r === null || r === void 0 ? void 0 : r.media_id) || (r === null || r === void 0 ? void 0 : r.storage_key)) : null;
            const mediaId = (_9 = firstResult === null || firstResult === void 0 ? void 0 : firstResult.media_id) !== null && _9 !== void 0 ? _9 : null;
            let updated = null;
            if (mediaId) {
                updated = yield updateProfileSummary(apiAccessToken, { avatar_media_id: String(mediaId) });
            }
            else if (firstResult === null || firstResult === void 0 ? void 0 : firstResult.storage_key) {
                updated = yield updateProfileSummary(apiAccessToken, { avatar_url: String(firstResult.storage_key) });
            }
            if (updated) {
                setProfileSummary(updated);
                const avatarMedia = (_11 = (_10 = updated === null || updated === void 0 ? void 0 : updated.profile) === null || _10 === void 0 ? void 0 : _10.avatar_media) !== null && _11 !== void 0 ? _11 : null;
                const avatarCandidate = (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.thumbnail_url) ||
                    (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.preview_url) ||
                    (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.full_url) ||
                    (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.raw_url) ||
                    (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.original_url) ||
                    ((_12 = updated === null || updated === void 0 ? void 0 : updated.profile) === null || _12 === void 0 ? void 0 : _12.avatar_url) ||
                    null;
                if (avatarCandidate) {
                    const resolved = toAbsoluteUrl(String(avatarCandidate));
                    const withToken = withAccessToken(resolved) || resolved;
                    if (withToken) {
                        setProfileImage({ uri: withToken });
                    }
                }
            }
        }
        catch (e) {
            Alert.alert(t('Upload failed'), String((_13 = e === null || e === void 0 ? void 0 : e.message) !== null && _13 !== void 0 ? _13 : e));
        }
        finally {
            setIsUpdatingAvatar(false);
        }
    });
    const currentChestNumber = useMemo(() => {
        var _a, _b, _c;
        const byYear = normalizeChestByYear((_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.chest_numbers_by_year) !== null && _b !== void 0 ? _b : chestNumbersByYear);
        const thisYearChest = String((_c = byYear[currentYear]) !== null && _c !== void 0 ? _c : '').trim();
        if (thisYearChest.length > 0)
            return thisYearChest;
        const latestYear = Object.keys(byYear)
            .filter((year) => /^\d{4}$/.test(String(year)))
            .sort((a, b) => Number(b) - Number(a))
            .find((year) => { var _a; return String((_a = byYear[year]) !== null && _a !== void 0 ? _a : '').trim().length > 0; });
        if (!latestYear)
            return '';
        return String(byYear[latestYear]).trim();
    }, [chestNumbersByYear, currentYear, normalizeChestByYear, (_g = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _g === void 0 ? void 0 : _g.chest_numbers_by_year]);
    const normalizeMembership = useCallback((entry) => {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!entry || typeof entry !== 'object')
            return null;
        const groupId = String((_b = (_a = entry === null || entry === void 0 ? void 0 : entry.group_id) !== null && _a !== void 0 ? _a : entry === null || entry === void 0 ? void 0 : entry.id) !== null && _b !== void 0 ? _b : '').trim();
        const name = String((_c = entry === null || entry === void 0 ? void 0 : entry.name) !== null && _c !== void 0 ? _c : '').trim();
        if (!groupId || !name)
            return null;
        const location = String((_d = entry === null || entry === void 0 ? void 0 : entry.location) !== null && _d !== void 0 ? _d : '').trim();
        const roleRaw = String((_f = (_e = entry === null || entry === void 0 ? void 0 : entry.role) !== null && _e !== void 0 ? _e : entry === null || entry === void 0 ? void 0 : entry.my_role) !== null && _f !== void 0 ? _f : '').trim();
        const officialClubCode = String((_g = entry === null || entry === void 0 ? void 0 : entry.official_club_code) !== null && _g !== void 0 ? _g : '').trim();
        const isOfficialClub = Boolean(entry === null || entry === void 0 ? void 0 : entry.is_official_club) || officialClubCode.length > 0;
        return {
            group_id: groupId,
            name,
            location,
            role: roleRaw.length > 0 ? roleRaw : null,
            is_official_club: isOfficialClub,
            official_club_code: officialClubCode.length > 0 ? officialClubCode : null,
        };
    }, []);
    const profileMemberships = useMemo(() => {
        var _a, _b;
        const merged = new Map();
        const summaryGroups = Array.isArray((_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.groups)
            ? (_b = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _b === void 0 ? void 0 : _b.groups
            : [];
        const allGroups = [...summaryGroups, ...(myGroups || [])];
        allGroups.forEach((entry) => {
            const normalized = normalizeMembership(entry);
            if (!normalized)
                return;
            const existing = merged.get(normalized.group_id);
            if (!existing) {
                merged.set(normalized.group_id, normalized);
                return;
            }
            merged.set(normalized.group_id, Object.assign(Object.assign({}, existing), { location: existing.location || normalized.location, role: existing.role || normalized.role, is_official_club: existing.is_official_club || normalized.is_official_club, official_club_code: existing.official_club_code || normalized.official_club_code }));
        });
        return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }, [myGroups, normalizeMembership, profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile]);
    const communityMemberships = useMemo(() => profileMemberships.filter((entry) => !entry.is_official_club), [profileMemberships]);
    const officialMemberships = useMemo(() => profileMemberships.filter((entry) => entry.is_official_club), [profileMemberships]);
    const trackFieldMainEvent = useMemo(() => {
        var _a, _b, _c;
        return String((_c = (_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.track_field_main_event) !== null && _b !== void 0 ? _b : userProfile === null || userProfile === void 0 ? void 0 : userProfile.trackFieldMainEvent) !== null && _c !== void 0 ? _c : '').trim();
    }, [profileSummary, userProfile]);
    const roadTrailMainEvent = useMemo(() => {
        var _a, _b, _c;
        return String((_c = (_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.road_trail_main_event) !== null && _b !== void 0 ? _b : userProfile === null || userProfile === void 0 ? void 0 : userProfile.roadTrailMainEvent) !== null && _c !== void 0 ? _c : '').trim();
    }, [profileSummary, userProfile]);
    const profileMainDisciplines = useMemo(() => {
        var _a, _b, _c;
        return normalizeMainDisciplines((_c = (_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.main_disciplines) !== null && _b !== void 0 ? _b : userProfile === null || userProfile === void 0 ? void 0 : userProfile.mainDisciplines) !== null && _c !== void 0 ? _c : {}, {
            trackFieldMainEvent,
            roadTrailMainEvent,
        });
    }, [profileSummary, roadTrailMainEvent, trackFieldMainEvent, userProfile]);
    const profileWebsite = useMemo(() => {
        var _a, _b, _c;
        return String((_c = (_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.website) !== null && _b !== void 0 ? _b : userProfile === null || userProfile === void 0 ? void 0 : userProfile.website) !== null && _c !== void 0 ? _c : '').trim();
    }, [profileSummary, userProfile === null || userProfile === void 0 ? void 0 : userProfile.website]);
    const profileNationality = useMemo(() => {
        var _a, _b, _c;
        return String((_c = (_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.nationality) !== null && _b !== void 0 ? _b : userProfile === null || userProfile === void 0 ? void 0 : userProfile.nationality) !== null && _c !== void 0 ? _c : '').trim();
    }, [profileSummary, userProfile === null || userProfile === void 0 ? void 0 : userProfile.nationality]);
    const supportRole = useMemo(() => { var _a, _b, _c; return String((_c = (_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.support_role) !== null && _b !== void 0 ? _b : userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportRole) !== null && _c !== void 0 ? _c : '').trim(); }, [profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile, userProfile]);
    const supportProfileBadgeLabel = useMemo(() => getSupportProfileBadgeLabel(supportRole, t), [supportRole, t]);
    const supportFocuses = useMemo(() => { var _a, _b, _c; return normalizeSelectedEvents((_c = (_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.support_focuses) !== null && _b !== void 0 ? _b : userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportFocuses) !== null && _c !== void 0 ? _c : []); }, [profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile, userProfile]);
    const supportClubs = useMemo(() => {
        var _a, _b;
        const hydrated = Array.isArray((_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.support_clubs)
            ? (_b = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _b === void 0 ? void 0 : _b.support_clubs
            : Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportClubs)
                ? userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportClubs
                : [];
        return hydrated
            .map((club) => {
            var _a, _b, _c, _d;
            const code = String((_a = club === null || club === void 0 ? void 0 : club.code) !== null && _a !== void 0 ? _a : '').trim().toUpperCase();
            const name = String((_b = club === null || club === void 0 ? void 0 : club.name) !== null && _b !== void 0 ? _b : '').trim();
            if (!code || !name)
                return null;
            return {
                id: code,
                title: name,
                subtitle: [String((_c = club === null || club === void 0 ? void 0 : club.city) !== null && _c !== void 0 ? _c : '').trim(), String((_d = club === null || club === void 0 ? void 0 : club.federation) !== null && _d !== void 0 ? _d : '').trim()].filter(Boolean).join(' · '),
            };
        })
            .filter(Boolean);
    }, [profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile, userProfile]);
    const supportGroups = useMemo(() => {
        var _a, _b;
        const hydrated = Array.isArray((_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.support_groups)
            ? (_b = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _b === void 0 ? void 0 : _b.support_groups
            : Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportGroups)
                ? userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportGroups
                : [];
        return hydrated
            .map((group) => {
            var _a, _b, _c, _d;
            const id = String((_a = group === null || group === void 0 ? void 0 : group.group_id) !== null && _a !== void 0 ? _a : '').trim();
            const name = String((_b = group === null || group === void 0 ? void 0 : group.name) !== null && _b !== void 0 ? _b : '').trim();
            if (!id || !name)
                return null;
            return {
                id,
                title: name,
                subtitle: [String((_c = group === null || group === void 0 ? void 0 : group.role) !== null && _c !== void 0 ? _c : '').trim(), String((_d = group === null || group === void 0 ? void 0 : group.location) !== null && _d !== void 0 ? _d : '').trim()].filter(Boolean).join(' · '),
            };
        })
            .filter(Boolean);
    }, [profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile, userProfile]);
    const directTrackFieldClub = useMemo(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const hydrated = (_c = (_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.track_field_club_detail) !== null && _b !== void 0 ? _b : userProfile === null || userProfile === void 0 ? void 0 : userProfile.trackFieldClubDetail) !== null && _c !== void 0 ? _c : null;
        const hydratedName = String((_d = hydrated === null || hydrated === void 0 ? void 0 : hydrated.name) !== null && _d !== void 0 ? _d : '').trim();
        const raw = String((_g = (_f = (_e = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _e === void 0 ? void 0 : _e.track_field_club) !== null && _f !== void 0 ? _f : userProfile === null || userProfile === void 0 ? void 0 : userProfile.trackFieldClub) !== null && _g !== void 0 ? _g : '').trim();
        const title = hydratedName || raw;
        if (!title)
            return null;
        return {
            id: String((_h = hydrated === null || hydrated === void 0 ? void 0 : hydrated.code) !== null && _h !== void 0 ? _h : raw).trim() || title,
            title,
            subtitle: [String((_j = hydrated === null || hydrated === void 0 ? void 0 : hydrated.city) !== null && _j !== void 0 ? _j : '').trim(), String((_k = hydrated === null || hydrated === void 0 ? void 0 : hydrated.federation) !== null && _k !== void 0 ? _k : '').trim()].filter(Boolean).join(' · '),
        };
    }, [profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile, userProfile]);
    const runningClubGroup = useMemo(() => {
        var _a, _b, _c, _d, _e, _f, _g;
        const hydrated = (_c = (_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.running_club_group) !== null && _b !== void 0 ? _b : userProfile === null || userProfile === void 0 ? void 0 : userProfile.runningClubGroup) !== null && _c !== void 0 ? _c : null;
        const groupId = String((_d = hydrated === null || hydrated === void 0 ? void 0 : hydrated.group_id) !== null && _d !== void 0 ? _d : '').trim();
        const name = String((_e = hydrated === null || hydrated === void 0 ? void 0 : hydrated.name) !== null && _e !== void 0 ? _e : '').trim();
        if (!groupId || !name)
            return null;
        return {
            id: groupId,
            title: name,
            subtitle: [String((_f = hydrated === null || hydrated === void 0 ? void 0 : hydrated.role) !== null && _f !== void 0 ? _f : '').trim(), String((_g = hydrated === null || hydrated === void 0 ? void 0 : hydrated.location) !== null && _g !== void 0 ? _g : '').trim()].filter(Boolean).join(' · '),
        };
    }, [profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile, userProfile]);
    const profileDistance = useMemo(() => {
        var _a;
        const activeFocus = profileCategory && profileCategory !== 'support' ? profileCategory : (_a = selectedFocuses[0]) !== null && _a !== void 0 ? _a : null;
        if (!activeFocus)
            return '';
        const disciplineKey = getMainDisciplineForFocus(profileMainDisciplines, activeFocus, {
            trackFieldMainEvent,
            roadTrailMainEvent,
        });
        if (!disciplineKey)
            return '';
        return getDisciplineLabel(activeFocus, disciplineKey, t);
    }, [profileCategory, profileMainDisciplines, roadTrailMainEvent, selectedFocuses, t, trackFieldMainEvent]);
    const athleteProfileCategory = useMemo(() => (profileCategory && profileCategory !== 'support' ? profileCategory : null), [profileCategory]);
    const formatMetaDisplayValue = useCallback((value) => {
        const trimmed = String(value || '').trim();
        if (trimmed.length <= 11)
            return trimmed;
        return `${trimmed.slice(0, 11)}...`;
    }, []);
    const visibleOfficialClubs = useMemo(() => {
        if (profileCategory === 'support')
            return supportClubs;
        const merged = new Map();
        const makeClubKey = (title, subtitle) => `${String(title || '').trim().toLowerCase()}|${String(subtitle || '').trim().toLowerCase()}`;
        officialMemberships.forEach((entry) => {
            var _a;
            const subtitle = [(_a = entry.role) !== null && _a !== void 0 ? _a : '', entry.location].filter(Boolean).join(' · ');
            merged.set(makeClubKey(entry.name, subtitle), {
                id: entry.group_id,
                title: entry.name,
                subtitle,
            });
        });
        if (directTrackFieldClub) {
            const key = makeClubKey(directTrackFieldClub.title, directTrackFieldClub.subtitle);
            if (!merged.has(key)) {
                merged.set(key, directTrackFieldClub);
            }
        }
        return Array.from(merged.values());
    }, [directTrackFieldClub, officialMemberships, profileCategory, supportClubs]);
    const visibleGroups = useMemo(() => {
        if (profileCategory === 'support')
            return supportGroups;
        const merged = new Map();
        communityMemberships.forEach((entry) => {
            var _a;
            merged.set(entry.group_id, {
                id: entry.group_id,
                title: entry.name,
                subtitle: [(_a = entry.role) !== null && _a !== void 0 ? _a : '', entry.location].filter(Boolean).join(' · '),
            });
        });
        if (runningClubGroup)
            merged.set(runningClubGroup.id, runningClubGroup);
        return Array.from(merged.values());
    }, [communityMemberships, profileCategory, runningClubGroup, supportGroups]);
    const singleOfficialClub = visibleOfficialClubs.length === 1 ? visibleOfficialClubs[0] : null;
    const singleCommunityGroup = visibleGroups.length === 1 ? visibleGroups[0] : null;
    const profileMetaItems = useMemo(() => {
        var _a, _b;
        const baseItems = profileCategory === 'support'
            ? []
            : [
                { key: 'nationality', value: profileNationality },
                { key: 'chest', value: athleteProfileCategory && focusUsesChestNumbers(athleteProfileCategory) ? currentChestNumber : '' },
                { key: 'distance', value: profileDistance },
            ];
        return [
            ...baseItems,
            { key: 'singleClub', value: (_a = singleOfficialClub === null || singleOfficialClub === void 0 ? void 0 : singleOfficialClub.title) !== null && _a !== void 0 ? _a : '' },
            { key: 'singleGroup', value: (_b = singleCommunityGroup === null || singleCommunityGroup === void 0 ? void 0 : singleCommunityGroup.title) !== null && _b !== void 0 ? _b : '' },
        ]
            .map((entry) => (Object.assign(Object.assign({}, entry), { value: formatMetaDisplayValue(String(entry.value || '').trim()) })))
            .filter((entry) => entry.value.length > 0);
    }, [
        athleteProfileCategory,
        currentChestNumber,
        formatMetaDisplayValue,
        profileCategory,
        profileDistance,
        profileNationality,
        singleCommunityGroup === null || singleCommunityGroup === void 0 ? void 0 : singleCommunityGroup.title,
        singleOfficialClub === null || singleOfficialClub === void 0 ? void 0 : singleOfficialClub.title,
    ]);
    const openProfileWebsite = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        const raw = String(profileWebsite || '').trim();
        if (!raw)
            return;
        const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        try {
            yield Linking.openURL(normalized);
        }
        catch (_14) {
            Alert.alert(t('Error'), t('Could not open website.'));
        }
    }), [profileWebsite, t]);
    const openWebsiteEditor = useCallback(() => {
        setWebsiteDraft(String(profileWebsite || ''));
        setWebsiteEditVisible(true);
    }, [profileWebsite]);
    const saveWebsiteOnly = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _15, _16;
        const nextValue = String(websiteDraft || '').trim();
        if (websiteSaveBusy)
            return;
        setWebsiteSaveBusy(true);
        try {
            if (apiAccessToken) {
                const updated = yield updateProfileSummary(apiAccessToken, { website: nextValue || null });
                if (updated)
                    setProfileSummary(updated);
            }
            yield updateUserProfile({ website: nextValue });
            setWebsiteEditVisible(false);
        }
        catch (e) {
            const message = String((_16 = (_15 = e === null || e === void 0 ? void 0 : e.message) !== null && _15 !== void 0 ? _15 : e) !== null && _16 !== void 0 ? _16 : '');
            Alert.alert(t('Save failed'), message || t('Please try again'));
        }
        finally {
            setWebsiteSaveBusy(false);
        }
    }), [apiAccessToken, t, updateUserProfile, websiteDraft, websiteSaveBusy]);
    const profileDisplayName = useMemo(() => {
        var _a, _b, _c;
        const fromSummary = String((_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.display_name) !== null && _b !== void 0 ? _b : '').trim();
        const normalizedSummary = fromSummary.toLowerCase();
        const isPlaceholderSummary = !fromSummary ||
            normalizedSummary === 'new user' ||
            normalizedSummary === 'newuser' ||
            normalizedSummary.includes('|') ||
            normalizedSummary.endsWith('.auth@allin.local');
        if (!isPlaceholderSummary)
            return fromSummary;
        const fromLocal = [userProfile === null || userProfile === void 0 ? void 0 : userProfile.firstName, userProfile === null || userProfile === void 0 ? void 0 : userProfile.lastName]
            .filter((part) => String(part !== null && part !== void 0 ? part : '').trim().length > 0)
            .join(' ')
            .trim();
        if (fromLocal)
            return fromLocal;
        const fromAuth = String((_c = user === null || user === void 0 ? void 0 : user.name) !== null && _c !== void 0 ? _c : '').trim();
        if (fromAuth)
            return fromAuth;
        return t('Profile');
    }, [profileSummary, t, user === null || user === void 0 ? void 0 : user.name, userProfile === null || userProfile === void 0 ? void 0 : userProfile.firstName, userProfile === null || userProfile === void 0 ? void 0 : userProfile.lastName]);
    const profileHandle = useMemo(() => {
        var _a, _b, _c, _d;
        const raw = (_d = (_c = (_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.username) !== null && _b !== void 0 ? _b : userProfile === null || userProfile === void 0 ? void 0 : userProfile.username) !== null && _c !== void 0 ? _c : user === null || user === void 0 ? void 0 : user.nickname) !== null && _d !== void 0 ? _d : ((user === null || user === void 0 ? void 0 : user.email) ? String(user.email).split('@')[0] : '');
        const safe = String(raw !== null && raw !== void 0 ? raw : '').trim().replace(/^@+/, '');
        if (!safe)
            return '';
        return safe.replace(/\s+/g, '');
    }, [profileSummary, user === null || user === void 0 ? void 0 : user.email, user === null || user === void 0 ? void 0 : user.nickname, userProfile === null || userProfile === void 0 ? void 0 : userProfile.username]);
    const profileBioText = useMemo(() => {
        var _a, _b, _c;
        const raw = String((_c = (_b = (_a = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _a === void 0 ? void 0 : _a.bio) !== null && _b !== void 0 ? _b : userProfile === null || userProfile === void 0 ? void 0 : userProfile.bio) !== null && _c !== void 0 ? _c : '').trim();
        if (!raw)
            return t('Write your bio...');
        const normalizedRaw = raw.replace(/^@+/, '').trim().toLowerCase();
        const normalizedHandle = profileHandle.trim().toLowerCase();
        if (normalizedHandle.length > 0 && normalizedRaw === normalizedHandle) {
            return t('Write your bio...');
        }
        return raw;
    }, [profileHandle, (_h = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.profile) === null || _h === void 0 ? void 0 : _h.bio, t, userProfile === null || userProfile === void 0 ? void 0 : userProfile.bio]);
    const sortCollectionItems = useCallback((items) => {
        const featured = items
            .filter((it) => it.featured_rank != null)
            .sort((a, b) => { var _a, _b; return Number((_a = a.featured_rank) !== null && _a !== void 0 ? _a : 0) - Number((_b = b.featured_rank) !== null && _b !== void 0 ? _b : 0); });
        const rest = items
            .filter((it) => it.featured_rank == null)
            .sort((a, b) => {
            var _a, _b;
            const aTime = new Date(((_a = a.added_at) !== null && _a !== void 0 ? _a : a.created_at) || 0).getTime();
            const bTime = new Date(((_b = b.added_at) !== null && _b !== void 0 ? _b : b.created_at) || 0).getTime();
            return bTime - aTime;
        });
        return [...featured, ...rest];
    }, []);
    const collectionItemsForTab = useMemo(() => {
        const items = activeTab === 'photos' ? photoCollectionItems : videoCollectionItems;
        const target = activeTab === 'photos' ? 'image' : 'video';
        return items.filter((item) => String(item.type).toLowerCase() === target);
    }, [activeTab, photoCollectionItems, videoCollectionItems]);
    const visibleCollectionItems = useMemo(() => sortCollectionItems(collectionItemsForTab).slice(0, 4), [collectionItemsForTab, sortCollectionItems]);
    const competitionOptions = useMemo(() => uploadedCompetitions.map((entry) => entry.event_name).filter(Boolean), [uploadedCompetitions]);
    const formatEventDate = useCallback((value) => {
        if (!value)
            return '';
        const raw = String(value);
        const dt = new Date(raw);
        if (Number.isNaN(dt.getTime()))
            return raw.slice(0, 10);
        return dt.toLocaleDateString();
    }, []);
    const formatMoney = useCallback((cents) => {
        if (cents == null || !Number.isFinite(Number(cents)))
            return '-';
        return `€${(Number(cents) / 100).toFixed(2)}`;
    }, []);
    const formatCount = useCallback((value) => {
        const num = Number(value !== null && value !== void 0 ? value : 0);
        if (!Number.isFinite(num))
            return '0';
        if (num >= 1000000)
            return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000)
            return `${(num / 1000).toFixed(1)}K`;
        return String(Math.max(0, Math.floor(num)));
    }, []);
    const previewCompetitions = useMemo(() => uploadedCompetitions.slice(0, 5), [uploadedCompetitions]);
    const activityItems = useMemo(() => {
        const toTimestamp = (value) => {
            if (!value)
                return 0;
            const ts = Date.parse(String(value));
            return Number.isNaN(ts) ? 0 : ts;
        };
        const toDateLabel = (value) => {
            if (!value)
                return '';
            const raw = String(value);
            const dt = new Date(raw);
            if (Number.isNaN(dt.getTime()))
                return raw.slice(0, 10);
            return dt.toLocaleDateString();
        };
        const newsItems = blogEntries.map((entry) => {
            var _a;
            return ({
                id: String(entry.id),
                kind: entry.kind === 'photo' || entry.kind === 'video' ? entry.kind : 'blog',
                postId: String((_a = entry.postId) !== null && _a !== void 0 ? _a : entry.id),
                mediaId: entry.mediaId ? String(entry.mediaId) : null,
                mediaType: entry.mediaType === 'video' ? 'video' : entry.mediaType === 'image' ? 'image' : null,
                title: String(entry.title || ''),
                sortAt: entry.createdAt ? String(entry.createdAt) : (entry.date ? String(entry.date) : null),
                date: entry.createdAt ? toDateLabel(String(entry.createdAt)) : (entry.date ? String(entry.date) : ''),
                description: entry.description ? String(entry.description) : '',
                coverImage: entry.coverImage ? String(entry.coverImage) : null,
                canDelete: entry.canDelete !== false,
            });
        });
        return newsItems.sort((a, b) => {
            var _a, _b, _c, _d;
            const aDate = toTimestamp((_b = (_a = a.sortAt) !== null && _a !== void 0 ? _a : a.date) !== null && _b !== void 0 ? _b : null);
            const bDate = toTimestamp((_d = (_c = b.sortAt) !== null && _c !== void 0 ? _c : b.date) !== null && _d !== void 0 ? _d : null);
            if (bDate !== aDate)
                return bDate - aDate;
            return String(b.id).localeCompare(String(a.id));
        });
    }, [blogEntries]);
    const handleSwipeDeleteBlog = useCallback((item) => {
        if (item.canDelete === false)
            return;
        setPendingDeleteBlog(item);
    }, []);
    const confirmDeleteBlog = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _17;
        if (!apiAccessToken || !pendingDeleteBlog || isDeletingBlog)
            return;
        setIsDeletingBlog(true);
        const blogId = String((_17 = pendingDeleteBlog.postId) !== null && _17 !== void 0 ? _17 : pendingDeleteBlog.id);
        try {
            yield deletePost(apiAccessToken, blogId);
            setBlogEntries((prev) => prev.filter((entry) => String(entry.id) !== blogId));
            setPendingDeleteBlog(null);
        }
        catch (_18) {
            Alert.alert(t('Error'), t('Could not delete this post.'));
        }
        finally {
            setIsDeletingBlog(false);
        }
    }), [apiAccessToken, isDeletingBlog, pendingDeleteBlog, t]);
    const handlePressActivityItem = useCallback((item) => {
        var _a;
        if (item.kind === 'photo' && item.mediaId) {
            navigation.navigate('PhotoDetailScreen', {
                eventTitle: item.title,
                media: {
                    id: item.mediaId,
                    type: 'image',
                },
            });
            return;
        }
        if (item.kind === 'video' && item.mediaId) {
            navigation.navigate('VideoPlayingScreen', {
                video: {
                    media_id: item.mediaId,
                    title: item.title,
                    thumbnail: item.coverImage ? { uri: String(item.coverImage) } : undefined,
                    uri: '',
                },
            });
            return;
        }
        const postId = String((_a = item.postId) !== null && _a !== void 0 ? _a : item.id);
        navigation.navigate('ViewUserBlogDetailsScreen', {
            postId,
            postPreview: {
                title: item.title,
                date: item.date,
                description: item.description,
                coverImage: item.coverImage,
            },
        });
    }, [navigation]);
    if (shouldShowEmptyProfileState) {
        return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "user-profile-empty-state" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [showBackButton ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(Icons.BackArrow, { width: 20, height: 20 }) }))) : (_jsx(View, { style: Styles.headerSpacer })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Profile') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: handleHeaderAction }, { children: _jsx(Add, { size: 24, color: colors.primaryColor, variant: "Linear" }) }))] })), _jsxs(View, Object.assign({ style: Styles.emptyProfileContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.emptyProfileAddButton, onPress: () => navigation.navigate('CategorySelectionScreen', { fromAddFlow: true }), activeOpacity: 0.85 }, { children: _jsx(Text, Object.assign({ style: Styles.emptyProfileAddPlus }, { children: "+" })) })), _jsx(Text, Object.assign({ style: Styles.emptyProfileTitle }, { children: t('No profiles yet') })), _jsx(Text, Object.assign({ style: Styles.emptyProfileSubtitle }, { children: t('Tap plus to create your first profile') }))] }))] })));
    }
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "user-profile-screen" }, { children: [_jsx(E2EPerfReady, { screen: "profile", ready: perfReady, startedAtMs: perfStartedAtRef.current }), _jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [showBackButton ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(Icons.BackArrow, { width: 20, height: 20 }) }))) : (_jsx(View, { style: Styles.headerSpacer })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Profile') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: handleHeaderAction }, { children: shouldShowEmptyProfileState ? (_jsx(Add, { size: 24, color: colors.primaryColor, variant: "Linear" })) : (_jsx(User, { size: 24, color: colors.primaryColor, variant: "Linear" })) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: Styles.profileCard }, { children: [_jsx(View, Object.assign({ style: Styles.profileTopRow }, { children: _jsxs(View, Object.assign({ style: Styles.profileHeaderRow }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.profileImageContainer, activeOpacity: 0.8, onPress: handleProfileImageChange, testID: "profile-avatar-button" }, { children: [_jsxs(View, Object.assign({ style: Styles.profileImageInner }, { children: [_jsx(FastImage, { source: profileImage, style: Styles.profileImage }), isUpdatingAvatar && (_jsx(View, Object.assign({ style: Styles.profileImageLoading }, { children: _jsx(ActivityIndicator, { color: colors.primaryColor }) })))] })), _jsx(View, Object.assign({ style: Styles.profileImageEditBadge }, { children: _jsx(Edit2, { size: 14, color: "#FFFFFF", variant: "Linear" }) }))] })), _jsxs(View, Object.assign({ style: Styles.statsContainerRight }, { children: [_jsxs(View, Object.assign({ style: Styles.statItem }, { children: [_jsx(Text, Object.assign({ style: Styles.statValue }, { children: formatCount((_j = profileSummary === null || profileSummary === void 0 ? void 0 : profileSummary.followers_count) !== null && _j !== void 0 ? _j : 0) })), _jsx(Text, Object.assign({ style: Styles.statLabel }, { children: t('Followers') }))] })), profileCategoryLabel.length > 0 ? (_jsxs(_Fragment, { children: [_jsx(View, { style: Styles.statDivider }), _jsxs(View, Object.assign({ style: Styles.statItem }, { children: [profileCategory ? renderFocusIcon(profileCategory, 24) : null, _jsx(Text, Object.assign({ style: Styles.statLabel }, { children: profileCategory === 'support' ? supportProfileBadgeLabel : profileCategoryLabel }))] }))] })) : null] }))] })) })), _jsx(View, Object.assign({ style: Styles.profileIdentityBlock }, { children: _jsxs(View, Object.assign({ style: Styles.profileIdentityRow }, { children: [_jsx(View, Object.assign({ style: Styles.profileIdentityHandleWrap }, { children: profileHandle.length > 0 ? (_jsxs(Text, Object.assign({ style: Styles.userHandleInline, numberOfLines: 1 }, { children: ["@", profileHandle] }))) : null })), _jsx(View, Object.assign({ style: Styles.profileIdentityNameWrap }, { children: _jsx(Text, Object.assign({ style: Styles.userName, numberOfLines: 1 }, { children: profileDisplayName })) }))] })) })), _jsxs(View, Object.assign({ style: Styles.bioSection }, { children: [_jsxs(View, Object.assign({ style: Styles.bioHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.bioTitle }, { children: t('Bio') })), _jsx(TouchableOpacity, Object.assign({ testID: "profile-edit-bio-button", onPress: () => navigation.navigate('EditBioScreens') }, { children: _jsx(Edit2, { size: 16, color: colors.mainTextColor, variant: "Linear" }) }))] })), _jsx(Text, Object.assign({ style: Styles.bioText }, { children: profileBioText })), _jsx(View, { style: Styles.bioDivider })] })), profileCategory === 'support' ? (_jsx(View, Object.assign({ style: Styles.athleteMetaSection }, { children: _jsx(SupportProfileSummary, { role: supportRole, focuses: supportFocuses, t: t }) }))) : null, profileMetaItems.length > 0 && (_jsx(View, Object.assign({ style: Styles.athleteMetaSection }, { children: _jsx(View, Object.assign({ style: Styles.athleteMetaInlineBox }, { children: profileMetaItems.map((entry) => (_jsx(View, Object.assign({ style: Styles.athleteMetaPill }, { children: _jsx(Text, Object.assign({ style: Styles.athleteMetaPillText }, { children: entry.value })) }), entry.key))) })) }))), profileWebsite.length > 0 ? (_jsx(View, Object.assign({ style: Styles.athleteMetaSection }, { children: _jsxs(View, Object.assign({ style: Styles.websiteInlineRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.websiteInlineLinkWrap, activeOpacity: 0.8, onPress: openProfileWebsite }, { children: _jsx(Text, Object.assign({ style: Styles.websiteInlineLinkText, numberOfLines: 1, ellipsizeMode: "tail" }, { children: profileWebsite })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.websiteInlineEditButton, onPress: openWebsiteEditor }, { children: _jsx(Edit2, { size: 15, color: colors.primaryColor, variant: "Linear" }) }))] })) }))) : null, profileWebsite.length === 0 ? (_jsx(View, Object.assign({ style: Styles.athleteMetaSection }, { children: _jsx(TouchableOpacity, Object.assign({ style: Styles.websiteInlineAddButton, onPress: openWebsiteEditor }, { children: _jsx(Text, Object.assign({ style: [
                                            Styles.websiteInlineLinkText,
                                            { textDecorationLine: 'none' },
                                        ], numberOfLines: 1 }, { children: t('Add website') })) })) }))) : null, visibleOfficialClubs.length > 1 ? (_jsxs(View, Object.assign({ style: Styles.membershipSection }, { children: [_jsx(Text, Object.assign({ style: Styles.membershipTitle }, { children: t('Official clubs') })), _jsx(View, Object.assign({ style: Styles.membershipWrap }, { children: visibleOfficialClubs.map((club) => (_jsxs(View, Object.assign({ style: Styles.membershipChip }, { children: [_jsx(Text, Object.assign({ style: Styles.membershipChipTitle, numberOfLines: 1 }, { children: club.title })), club.subtitle.length > 0 ? (_jsx(Text, Object.assign({ style: Styles.membershipChipMeta, numberOfLines: 1 }, { children: club.subtitle }))) : null] }), club.id))) }))] }))) : null, visibleGroups.length > 1 ? (_jsxs(View, Object.assign({ style: Styles.membershipSection }, { children: [_jsx(Text, Object.assign({ style: Styles.membershipTitle }, { children: t(profileCategory === 'support' ? 'Groups' : 'Community groups') })), _jsx(View, Object.assign({ style: Styles.membershipWrap }, { children: visibleGroups.map((group) => (_jsxs(TouchableOpacity, Object.assign({ style: Styles.membershipChip, activeOpacity: 0.85, onPress: () => navigation.navigate('GroupProfileScreen', {
                                                groupId: group.id,
                                                showBackButton: true,
                                                origin: 'profile',
                                            }) }, { children: [_jsx(Text, Object.assign({ style: Styles.membershipChipTitle, numberOfLines: 1 }, { children: group.title })), group.subtitle.length > 0 ? (_jsx(Text, Object.assign({ style: Styles.membershipChipMeta, numberOfLines: 1 }, { children: group.subtitle }))) : null] }), group.id))) }))] }))) : null, _jsx(SizeBox, { height: 10 })] })), _jsxs(View, Object.assign({ style: Styles.profileTabs }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: [Styles.profileTab, profileTab === 'timeline' && Styles.profileTabActive], onPress: () => setProfileTab('timeline') }, { children: [_jsx(Clock, { size: 18, color: profileTab === 'timeline' ? colors.primaryColor : colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.profileTabText, profileTab === 'timeline' && Styles.profileTabTextActive] }, { children: t('Timeline') }))] })), _jsxs(TouchableOpacity, Object.assign({ style: [Styles.profileTab, profileTab === 'activity' && Styles.profileTabActive], onPress: () => setProfileTab('activity') }, { children: [_jsx(DocumentText, { size: 18, color: profileTab === 'activity' ? colors.primaryColor : colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.profileTabText, profileTab === 'activity' && Styles.profileTabTextActive] }, { children: t('News') }))] })), _jsxs(TouchableOpacity, Object.assign({ style: [Styles.profileTab, profileTab === 'collections' && Styles.profileTabActive], onPress: () => setProfileTab('collections') }, { children: [_jsx(Gallery, { size: 18, color: profileTab === 'collections' ? colors.primaryColor : colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.profileTabText, profileTab === 'collections' && Styles.profileTabTextActive] }, { children: t('Collections') }))] })), showDownloadsTab && (_jsxs(TouchableOpacity, Object.assign({ style: [Styles.profileTab, profileTab === 'downloads' && Styles.profileTabActive], onPress: () => setProfileTab('downloads') }, { children: [_jsx(DocumentDownload, { size: 18, color: profileTab === 'downloads' ? colors.primaryColor : colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.profileTabText, profileTab === 'downloads' && Styles.profileTabTextActive] }, { children: t('Downloads') }))] })))] })), profileTab === 'timeline' && (!hasLoadedTimeline && timelineItems.length === 0 ? (_jsxs(View, Object.assign({ style: Styles.tabLoadingContainer }, { children: [_jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: Styles.emptyProfileSubtitle }, { children: t('Loading timeline...') }))] }))) : (_jsx(ProfileTimeline, { title: t('Timeline'), items: timelineItems, editable: true, onAdd: openAddTimeline, onEdit: (item) => {
                            var _a;
                            const original = (_a = timelineItems.find((entry) => entry.id === item.id)) !== null && _a !== void 0 ? _a : item;
                            openEditTimeline(original);
                        }, onPressItem: openTimelineDetail }))), profileTab === 'activity' && (!hasLoadedActivity && activityItems.length === 0 ? (_jsxs(View, Object.assign({ style: Styles.tabLoadingContainer }, { children: [_jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: Styles.emptyProfileSubtitle }, { children: t('Loading news...') }))] }))) : (_jsx(ProfileNewsSection, { styles: Styles, sectionTitle: t('News'), actionLabel: profileCategory === 'support' ? undefined : t('Add blog'), onPressAction: profileCategory === 'support' ? undefined : (() => openBlogEditor()), enableSwipeDelete: profileCategory !== 'support', onSwipeDelete: handleSwipeDeleteBlog, items: activityItems, emptyText: profileCategory === 'support' ? t('No news yet.') : t('No news yet. Publish a blog or add media to your news page.'), blogLabel: t('Blog'), photoLabel: t('Photo'), videoLabel: t('Video'), onPressItem: handlePressActivityItem }))), profileTab === 'collections' && (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.collectionsSection }, { children: [_jsxs(View, Object.assign({ style: Styles.sectionHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Collections') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.actionPill, onPress: () => {
                                                    if (activeTab === 'photos') {
                                                        navigation.navigate('ViewUserCollectionsPhotosScreen', { initialTab: 'photos' });
                                                    }
                                                    else if (activeTab === 'videos') {
                                                        navigation.navigate('ViewUserCollectionsVideosScreen', { initialTab: 'videos' });
                                                    }
                                                } }, { children: _jsx(Text, Object.assign({ style: Styles.actionPillText }, { children: t('View all') })) }))] })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.toggleContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [Styles.toggleButton, activeTab === 'photos' && Styles.toggleButtonActive], onPress: () => setActiveTab('photos') }, { children: _jsx(Text, Object.assign({ style: activeTab === 'photos' ? Styles.toggleTextActive : Styles.toggleText }, { children: t('Photos') })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.toggleButton, activeTab === 'videos' && Styles.toggleButtonActive], onPress: () => setActiveTab('videos') }, { children: _jsx(Text, Object.assign({ style: activeTab === 'videos' ? Styles.toggleTextActive : Styles.toggleText }, { children: t('Videos') })) }))] })), _jsx(SizeBox, { height: 16 }), !hasLoadedCollections && photoCollectionItems.length === 0 && videoCollectionItems.length === 0 ? (_jsxs(View, Object.assign({ style: Styles.tabLoadingContainer }, { children: [_jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: Styles.emptyProfileSubtitle }, { children: t('Loading collections...') }))] }))) : activeTab === 'photos' ? (_jsxs(View, Object.assign({ style: Styles.collectionsCard }, { children: [_jsx(View, Object.assign({ style: Styles.collectionsGrid }, { children: visibleCollectionItems.map((item) => {
                                                    const thumb = resolveThumbUrl(item);
                                                    return (_jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.85, onPress: () => {
                                                            navigation.navigate('PhotoDetailScreen', {
                                                                eventTitle: t('Collections'),
                                                                media: {
                                                                    id: item.media_id,
                                                                    type: item.type,
                                                                },
                                                            });
                                                        } }, { children: thumb ? (_jsx(FastImage, { source: { uri: String(thumb) }, style: [Styles.collectionImage, { width: imageWidth }], resizeMode: "cover" })) : (_jsx(View, { style: [Styles.collectionImage, { width: imageWidth, backgroundColor: '#1a1a1a' }] })) }), String(item.media_id)));
                                                }) })), visibleCollectionItems.length === 0 && (_jsx(Text, Object.assign({ style: Styles.emptyText }, { children: t('No collections yet.') })))] }))) : (_jsxs(View, Object.assign({ style: Styles.collectionsCard }, { children: [_jsx(View, Object.assign({ style: Styles.collectionsGrid }, { children: visibleCollectionItems.map((item) => {
                                                    const thumb = resolveThumbUrl(item);
                                                    return (_jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.85, onPress: () => {
                                                            const mediaUrl = resolveMediaUrl(item);
                                                            navigation.navigate('VideoPlayingScreen', {
                                                                video: {
                                                                    media_id: item.media_id,
                                                                    title: t('Video'),
                                                                    thumbnail: thumb ? { uri: String(thumb) } : undefined,
                                                                    uri: mediaUrl !== null && mediaUrl !== void 0 ? mediaUrl : '',
                                                                },
                                                            });
                                                        } }, { children: thumb ? (_jsx(FastImage, { source: { uri: String(thumb) }, style: [Styles.collectionImage, { width: imageWidth }], resizeMode: "cover" })) : (_jsx(View, { style: [Styles.collectionImage, { width: imageWidth, backgroundColor: '#1a1a1a' }] })) }), String(item.media_id)));
                                                }) })), visibleCollectionItems.length === 0 && (_jsx(Text, Object.assign({ style: Styles.emptyText }, { children: t('No collections yet.') })))] })))] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.mainEditButton, onPress: () => {
                                    if (activeTab === 'photos') {
                                        navigation.navigate('EditPhotoCollectionsScreen', { collectionScopeKey });
                                    }
                                    else {
                                        navigation.navigate('EditVideoCollectionsScreen', { collectionScopeKey });
                                    }
                                } }, { children: [_jsx(Text, Object.assign({ style: Styles.mainEditButtonText }, { children: t('Edit') })), _jsx(Edit2, { size: 18, color: "#FFFFFF", variant: "Linear" })] }))] })), profileTab === 'downloads' && showDownloadsTab && (!hasLoadedDownloads && downloadsSummary === null && uploadedCompetitions.length === 0 ? (_jsxs(View, Object.assign({ style: Styles.tabLoadingContainer }, { children: [_jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: Styles.emptyProfileSubtitle }, { children: t('Loading downloads...') }))] }))) : (_jsxs(View, Object.assign({ style: Styles.downloadsSection }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Downloads') })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.downloadsCard, activeOpacity: 0.8, onPress: () => navigation.navigate('DownloadsDetailsScreen', { mode: 'profit' }) }, { children: [_jsxs(View, Object.assign({ style: Styles.downloadsContent }, { children: [_jsx(View, Object.assign({ style: Styles.downloadsIconContainer }, { children: _jsx(Icons.DownloadColorful, { width: 24, height: 24 }) })), _jsxs(Text, { children: [_jsxs(Text, Object.assign({ style: Styles.downloadsText }, { children: [t('Total downloads'), ": "] })), _jsx(Text, Object.assign({ style: Styles.downloadsTextBold }, { children: downloadsSummary ? String(downloadsSummary.total_downloads) : '-' }))] })] })), _jsxs(View, Object.assign({ style: Styles.downloadsDetailsButton }, { children: [_jsx(Text, Object.assign({ style: Styles.downloadsDetailsButtonText }, { children: t('Details') })), _jsx(ArrowRight, { size: 18, color: "#9B9F9F", variant: "Linear" })] }))] })), _jsxs(View, Object.assign({ style: Styles.earningsRow }, { children: [_jsxs(View, Object.assign({ style: Styles.earningsCard }, { children: [_jsx(Text, Object.assign({ style: Styles.earningsLabel }, { children: t('Views') })), _jsx(Text, Object.assign({ style: Styles.earningsValue }, { children: downloadsSummary ? String(downloadsSummary.total_views) : '-' }))] })), _jsxs(View, Object.assign({ style: Styles.earningsCard }, { children: [_jsx(Text, Object.assign({ style: Styles.earningsLabel }, { children: t('Profit') })), _jsx(Text, Object.assign({ style: Styles.earningsValue }, { children: downloadsSummary ? formatMoney((_k = downloadsSummary.total_profit_cents) !== null && _k !== void 0 ? _k : 0) : '-' }))] }))] })), _jsxs(View, Object.assign({ style: Styles.downloadAnalyticsSection }, { children: [_jsxs(View, Object.assign({ style: Styles.sectionHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.downloadAnalyticsTitle }, { children: t('Competitions') })), _jsx(TouchableOpacity, Object.assign({ onPress: () => navigation.navigate('DownloadsDetailsScreen', { mode: 'competitions' }) }, { children: _jsx(Text, Object.assign({ style: Styles.viewAllText }, { children: t('View more') })) }))] })), previewCompetitions.map((item) => {
                                        var _a, _b;
                                        return (_jsxs(TouchableOpacity, Object.assign({ style: Styles.competitionCard, activeOpacity: 0.85, onPress: () => navigation.navigate('DownloadsDetailsScreen', {
                                                mode: 'competition-media',
                                                competition: item,
                                            }) }, { children: [item.cover_thumbnail_url ? (_jsx(FastImage, { source: { uri: String(item.cover_thumbnail_url) }, style: Styles.competitionThumb, resizeMode: "cover" })) : (_jsx(View, { style: Styles.competitionThumbPlaceholder })), _jsxs(View, Object.assign({ style: Styles.competitionInfo }, { children: [_jsx(Text, Object.assign({ style: Styles.competitionTitle }, { children: item.event_name || t('competition') })), _jsxs(Text, Object.assign({ style: Styles.competitionMeta }, { children: [Number((_a = item.uploads_count) !== null && _a !== void 0 ? _a : 0), " ", t('uploads'), " | ", formatEventDate(item.event_date)] })), _jsx(Text, Object.assign({ style: Styles.competitionMetaSecondary }, { children: (_b = item.event_location) !== null && _b !== void 0 ? _b : '' }))] }))] }), item.event_id));
                                    }), previewCompetitions.length === 0 && (_jsx(Text, Object.assign({ style: Styles.emptyText }, { children: t('No competitions found.') })))] }))] })))), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ visible: showProfileSwitcherModal, transparent: true, animationType: "fade", onRequestClose: () => setShowProfileSwitcherModal(false) }, { children: _jsx(TouchableOpacity, Object.assign({ style: Styles.profileSwitcherBackdrop, activeOpacity: 1, onPress: () => setShowProfileSwitcherModal(false) }, { children: _jsxs(TouchableOpacity, Object.assign({ activeOpacity: 1, style: Styles.profileSwitcherSheet, onPress: () => { } }, { children: [_jsx(View, { style: Styles.profileSwitcherHandle }), _jsx(Text, Object.assign({ style: Styles.profileSwitcherTitle }, { children: t('Switch profile') })), _jsx(SizeBox, { height: 8 }), selectedFocuses.map((focusId) => (_jsxs(TouchableOpacity, Object.assign({ style: Styles.profileSwitcherRow, onPress: () => {
                                    setCategory(focusId);
                                    setShowProfileSwitcherModal(false);
                                } }, { children: [_jsx(View, Object.assign({ style: Styles.profileSwitcherAvatar }, { children: renderFocusIcon(focusId, 20) })), _jsx(Text, Object.assign({ style: Styles.profileSwitcherLabel }, { children: getSportFocusLabel(focusId, t) })), _jsx(Text, Object.assign({ style: Styles.profileSwitcherCheck }, { children: profileCategory === focusId ? '✓' : '' }))] }), focusId))), hasSupportProfile ? (_jsxs(TouchableOpacity, Object.assign({ style: Styles.profileSwitcherRow, onPress: () => {
                                    setCategory('support');
                                    setShowProfileSwitcherModal(false);
                                } }, { children: [_jsx(View, Object.assign({ style: Styles.profileSwitcherAvatar }, { children: renderFocusIcon('support', 20) })), _jsx(Text, Object.assign({ style: Styles.profileSwitcherLabel }, { children: t('Support') })), _jsx(Text, Object.assign({ style: Styles.profileSwitcherCheck }, { children: profileCategory === 'support' ? '✓' : '' }))] }))) : null, myGroups
                                .map((group) => {
                                var _a, _b;
                                return ({
                                    id: String((_a = group === null || group === void 0 ? void 0 : group.group_id) !== null && _a !== void 0 ? _a : '').trim(),
                                    name: String((_b = group === null || group === void 0 ? void 0 : group.name) !== null && _b !== void 0 ? _b : '').trim(),
                                });
                            })
                                .filter((group) => group.id.length > 0)
                                .map((group) => (_jsxs(TouchableOpacity, Object.assign({ style: Styles.profileSwitcherRow, onPress: () => {
                                    setShowProfileSwitcherModal(false);
                                    navigation.navigate('GroupProfileScreen', {
                                        groupId: group.id,
                                        showBackButton: true,
                                        origin: 'profile',
                                    });
                                } }, { children: [_jsx(View, Object.assign({ style: Styles.profileSwitcherAvatar }, { children: _jsx(Icons.GroupColorful, { width: 18, height: 18 }) })), _jsx(Text, Object.assign({ style: Styles.profileSwitcherLabel }, { children: group.name || t('Group') })), _jsx(Text, { style: Styles.profileSwitcherCheck })] }), group.id))), _jsxs(TouchableOpacity, Object.assign({ style: [Styles.profileSwitcherRow, Styles.profileSwitcherAddRow], onPress: () => {
                                    setShowProfileSwitcherModal(false);
                                    navigation.navigate('CategorySelectionScreen', { fromAddFlow: true });
                                } }, { children: [_jsx(View, Object.assign({ style: Styles.profileSwitcherAvatarAdd }, { children: _jsx(Text, Object.assign({ style: Styles.profileSwitcherPlus }, { children: "+" })) })), _jsx(Text, Object.assign({ style: Styles.profileSwitcherAddLabel }, { children: t('Add') })), _jsx(Text, { style: Styles.profileSwitcherCheck })] }))] })) })) })), _jsx(Modal, Object.assign({ visible: Boolean(pendingDeleteBlog), transparent: true, animationType: "fade", onRequestClose: () => {
                    if (!isDeletingBlog)
                        setPendingDeleteBlog(null);
                } }, { children: _jsx(TouchableOpacity, Object.assign({ style: Styles.categoryModalBackdrop, activeOpacity: 1, onPress: () => {
                        if (!isDeletingBlog)
                            setPendingDeleteBlog(null);
                    } }, { children: _jsxs(TouchableOpacity, Object.assign({ activeOpacity: 1, style: [
                            Styles.categoryModalCard,
                            {
                                backgroundColor: colors.modalBackground,
                                borderWidth: 0.5,
                                borderColor: colors.lightGrayColor,
                                borderRadius: 16,
                                padding: 16,
                            },
                        ], onPress: () => { } }, { children: [_jsx(Text, Object.assign({ style: Styles.categoryModalTitle }, { children: t('Delete blog') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: [Styles.emptyStateText, { textAlign: 'center' }] }, { children: t('Are you sure you want to delete this post?') })), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 } }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [Styles.categoryOption, { flex: 1, borderRadius: 10 }], disabled: isDeletingBlog, onPress: () => setPendingDeleteBlog(null) }, { children: _jsx(Text, Object.assign({ style: Styles.categoryOptionText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: {
                                            minWidth: 110,
                                            minHeight: 44,
                                            borderRadius: 12,
                                            backgroundColor: colors.errorColor || '#D32F2F',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                        }, disabled: isDeletingBlog, onPress: confirmDeleteBlog }, { children: isDeletingBlog ? (_jsx(ActivityIndicator, { size: "small", color: "#FFFFFF" })) : (_jsx(Text, Object.assign({ style: [Styles.categoryOptionText, { color: '#FFFFFF' }] }, { children: t('Delete') }))) }))] }))] })) })) })), _jsx(Modal, Object.assign({ visible: websiteEditVisible, transparent: true, animationType: "fade", onRequestClose: () => {
                    if (!websiteSaveBusy)
                        setWebsiteEditVisible(false);
                } }, { children: _jsx(TouchableOpacity, Object.assign({ style: Styles.categoryModalBackdrop, activeOpacity: 1, onPress: () => {
                        if (!websiteSaveBusy)
                            setWebsiteEditVisible(false);
                    } }, { children: _jsxs(TouchableOpacity, Object.assign({ activeOpacity: 1, style: [
                            Styles.categoryModalCard,
                            {
                                backgroundColor: colors.modalBackground,
                                borderWidth: 0.5,
                                borderColor: colors.lightGrayColor,
                                borderRadius: 16,
                                padding: 16,
                            },
                        ], onPress: () => { } }, { children: [_jsx(Text, Object.assign({ style: Styles.categoryModalTitle }, { children: t('Website') })), _jsx(SizeBox, { height: 10 }), _jsx(View, Object.assign({ style: {
                                    borderWidth: 1,
                                    borderColor: colors.lightGrayColor,
                                    borderRadius: 10,
                                    backgroundColor: colors.secondaryColor,
                                    paddingHorizontal: 12,
                                    minHeight: 46,
                                    justifyContent: 'center',
                                } }, { children: _jsx(TextInput, { style: { color: colors.mainTextColor, fontSize: 14, paddingVertical: 10 }, value: websiteDraft, onChangeText: setWebsiteDraft, placeholder: t('Enter website link (optional)'), placeholderTextColor: colors.grayColor, autoCapitalize: "none", autoCorrect: false, keyboardType: "url" }) })), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 } }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [Styles.categoryOption, { flex: 1, borderRadius: 10 }], disabled: websiteSaveBusy, onPress: () => setWebsiteEditVisible(false) }, { children: _jsx(Text, Object.assign({ style: Styles.categoryOptionText }, { children: t('cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: {
                                            minWidth: 110,
                                            minHeight: 44,
                                            borderRadius: 12,
                                            backgroundColor: colors.primaryColor,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                        }, disabled: websiteSaveBusy, onPress: saveWebsiteOnly }, { children: websiteSaveBusy ? (_jsx(ActivityIndicator, { size: "small", color: "#FFFFFF" })) : (_jsx(Text, Object.assign({ style: [Styles.categoryOptionText, { color: '#FFFFFF' }] }, { children: t('save') }))) }))] }))] })) })) }))] })));
};
export default UserProfileScreen;
