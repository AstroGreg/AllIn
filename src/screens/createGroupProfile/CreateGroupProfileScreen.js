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
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useMemo, useState, useEffect } from 'react';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { createStyles } from './CreateGroupProfileStyles';
import { ArrowLeft2, People, Edit2, SearchNormal1, Add, CloseCircle, Profile2User } from 'iconsax-react-nativejs';
import { launchImageLibrary } from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import SportFocusIcon from '../../components/profile/SportFocusIcon';
import { createGroup, getGroup, getMediaById, inviteGroupMember, searchClubs, searchGroups, searchProfiles, uploadMediaBatch, updateGroup, } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { getFilteredCityOptions } from '../../constants/locationSuggestions';
import { getSportFocusDefinitions, getSportFocusLabel, normalizeFocusId } from '../../utils/profileSelections';
import { buildBottomTabGroupProfileReset } from '../../utils/navigationResets';
const CreateGroupProfileScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken, authBootstrap } = useAuth();
    const mode = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.mode) === 'edit' ? 'edit' : 'create';
    const editGroupId = ((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.groupId) ? String(route.params.groupId) : null;
    const initialSelectedFocuses = useMemo(() => {
        var _a, _b, _c, _d;
        const raw = (_d = (_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.selectedFocuses) !== null && _b !== void 0 ? _b : (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.selectedEvents) !== null && _d !== void 0 ? _d : [];
        if (!Array.isArray(raw))
            return [];
        return Array.from(new Set(raw
            .map((entry) => String(entry || '').trim().toLowerCase())
            .map((entry) => normalizeFocusId(entry) || '')
            .filter(Boolean)));
    }, [(_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.selectedEvents, (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.selectedFocuses]);
    const hasIncomingFocusSelection = Array.isArray((_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.selectedFocuses) || Array.isArray((_f = route === null || route === void 0 ? void 0 : route.params) === null || _f === void 0 ? void 0 : _f.selectedEvents);
    const focusLocked = mode === 'create' && Boolean((_g = route === null || route === void 0 ? void 0 : route.params) === null || _g === void 0 ? void 0 : _g.focusLocked) && hasIncomingFocusSelection;
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupWebsite, setGroupWebsite] = useState('');
    const [isBaseLocationFocused, setIsBaseLocationFocused] = useState(false);
    const [missingRequiredFields, setMissingRequiredFields] = useState({
        groupName: false,
        groupDescription: false,
    });
    const [roleMode, setRoleMode] = useState('athlete');
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [manualCoachNames, setManualCoachNames] = useState([]);
    const [selectedFocuses, setSelectedFocuses] = useState(initialSelectedFocuses.length > 0 ? initialSelectedFocuses : ['track-field']);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingGroup, setIsLoadingGroup] = useState(false);
    const [iconPreviewUrl, setIconPreviewUrl] = useState(null);
    const [iconUploadFile, setIconUploadFile] = useState(null);
    const [groupNameStatus, setGroupNameStatus] = useState({
        state: 'idle',
        message: null,
    });
    const [originalGroupName, setOriginalGroupName] = useState('');
    const activeProfileId = String((authBootstrap === null || authBootstrap === void 0 ? void 0 : authBootstrap.profile_id) || '').trim();
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || mode !== 'edit' || !editGroupId)
            return () => { };
        (() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
            setIsLoadingGroup(true);
            try {
                const resp = yield getGroup(apiAccessToken, editGroupId);
                if (!mounted)
                    return;
                setGroupName(String((_b = (_a = resp === null || resp === void 0 ? void 0 : resp.group) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : ''));
                setOriginalGroupName(String((_d = (_c = resp === null || resp === void 0 ? void 0 : resp.group) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : ''));
                setGroupDescription(String((_p = (_m = (_k = (_h = (_f = (_e = resp === null || resp === void 0 ? void 0 : resp.group) === null || _e === void 0 ? void 0 : _e.location) !== null && _f !== void 0 ? _f : (_g = resp === null || resp === void 0 ? void 0 : resp.group) === null || _g === void 0 ? void 0 : _g.base_location) !== null && _h !== void 0 ? _h : (_j = resp === null || resp === void 0 ? void 0 : resp.group) === null || _j === void 0 ? void 0 : _j.city) !== null && _k !== void 0 ? _k : (_l = resp === null || resp === void 0 ? void 0 : resp.group) === null || _l === void 0 ? void 0 : _l.bio) !== null && _m !== void 0 ? _m : (_o = resp === null || resp === void 0 ? void 0 : resp.group) === null || _o === void 0 ? void 0 : _o.description) !== null && _p !== void 0 ? _p : ''));
                setGroupWebsite(String((_r = (_q = resp === null || resp === void 0 ? void 0 : resp.group) === null || _q === void 0 ? void 0 : _q.website) !== null && _r !== void 0 ? _r : ''));
                const serverCoachNames = Array.isArray((_s = resp === null || resp === void 0 ? void 0 : resp.group) === null || _s === void 0 ? void 0 : _s.coaches)
                    ? resp.group.coaches.map((entry) => String(entry || '').trim()).filter(Boolean)
                    : [];
                setManualCoachNames(serverCoachNames);
                const serverFocusesRaw = [
                    ...(Array.isArray((_t = resp === null || resp === void 0 ? void 0 : resp.group) === null || _t === void 0 ? void 0 : _t.focuses) ? (_u = resp === null || resp === void 0 ? void 0 : resp.group) === null || _u === void 0 ? void 0 : _u.focuses : []),
                    ...(Array.isArray((_v = resp === null || resp === void 0 ? void 0 : resp.group) === null || _v === void 0 ? void 0 : _v.competition_focuses) ? (_w = resp === null || resp === void 0 ? void 0 : resp.group) === null || _w === void 0 ? void 0 : _w.competition_focuses : []),
                    ...(Array.isArray((_x = resp === null || resp === void 0 ? void 0 : resp.group) === null || _x === void 0 ? void 0 : _x.selected_events) ? (_y = resp === null || resp === void 0 ? void 0 : resp.group) === null || _y === void 0 ? void 0 : _y.selected_events : []),
                ]
                    .map((entry) => String(entry || '').trim().toLowerCase())
                    .filter(Boolean);
                const normalizedServerFocuses = Array.from(new Set(serverFocusesRaw
                    .map((entry) => normalizeFocusId(entry) || '')
                    .filter(Boolean)));
                if (normalizedServerFocuses.length > 0) {
                    setSelectedFocuses(normalizedServerFocuses);
                }
                const avatarMediaId = String((_0 = (_z = resp === null || resp === void 0 ? void 0 : resp.group) === null || _z === void 0 ? void 0 : _z.avatar_media_id) !== null && _0 !== void 0 ? _0 : '').trim();
                if (avatarMediaId) {
                    try {
                        const media = yield getMediaById(apiAccessToken, avatarMediaId);
                        if (!mounted)
                            return;
                        const raw = (media === null || media === void 0 ? void 0 : media.thumbnail_url) || (media === null || media === void 0 ? void 0 : media.preview_url) || (media === null || media === void 0 ? void 0 : media.full_url) || (media === null || media === void 0 ? void 0 : media.raw_url) || (media === null || media === void 0 ? void 0 : media.original_url) || null;
                        setIconPreviewUrl(toAbsoluteUrl(raw ? String(raw) : null));
                    }
                    catch (_1) {
                        if (mounted)
                            setIconPreviewUrl(null);
                    }
                }
                else {
                    setIconPreviewUrl(null);
                }
            }
            catch (_2) {
                // ignore
            }
            finally {
                if (mounted)
                    setIsLoadingGroup(false);
            }
        }))();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, editGroupId, mode]);
    const filteredCityOptions = useMemo(() => getFilteredCityOptions(groupDescription), [groupDescription]);
    const showCitySuggestions = isBaseLocationFocused && filteredCityOptions.length > 0;
    const localStyles = useMemo(() => StyleSheet.create({
        locationFieldWrap: {
            gap: 8,
        },
        locationInputRow: {
            minHeight: 54,
            borderWidth: 0.5,
            borderRadius: 10,
            borderColor: colors.borderColor,
            backgroundColor: colors.secondaryColor,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        locationInputRowFocused: {
            borderColor: colors.primaryColor,
            borderWidth: 1,
        },
        locationInput: Object.assign(Object.assign({}, styles.textInput), { paddingVertical: 12 }),
        locationResultsDropdown: {
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor,
            borderRadius: 10,
            backgroundColor: colors.cardBackground,
            maxHeight: 210,
            overflow: 'hidden',
        },
        locationResultRow: {
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        locationResultRowLast: {
            borderBottomWidth: 0,
        },
        locationResultText: {
            color: colors.mainTextColor,
            fontSize: 14,
        },
        roleToggle: {
            flexDirection: 'row',
            gap: 10,
        },
        roleButton: {
            flex: 1,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.borderColor,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        roleButtonActive: {
            backgroundColor: colors.secondaryBlueColor,
            borderColor: colors.primaryColor,
        },
        roleText: {
            fontSize: 13,
            color: colors.subTextColor,
        },
        roleTextActive: {
            fontSize: 13,
            color: colors.primaryColor,
        },
        chipRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        chip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor: colors.btnBackgroundColor,
            borderWidth: 1,
            borderColor: colors.borderColor,
        },
        chipText: {
            fontSize: 12,
            color: colors.mainTextColor,
        },
        resultCard: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        resultName: {
            fontSize: 14,
            color: colors.mainTextColor,
        },
        resultRole: {
            fontSize: 12,
            color: colors.subTextColor,
        },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: colors.primaryColor,
        },
        addButtonText: {
            fontSize: 12,
            color: colors.whiteColor,
        },
        emptyState: {
            paddingVertical: 20,
            alignItems: 'center',
        },
        emptyText: {
            fontSize: 12,
            color: colors.subTextColor,
        },
        focusChipsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
        },
        focusChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.btnBackgroundColor,
            paddingHorizontal: 14,
            paddingVertical: 9,
        },
        focusChipActive: {
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
        },
        focusChipText: {
            fontSize: 12,
            color: colors.subTextColor,
        },
        focusChipTextActive: {
            color: colors.primaryColor,
            fontSize: 12,
        },
        requiredErrorBorder: {
            borderColor: colors.errorColor || '#D32F2F',
            borderWidth: 1.5,
        },
        fieldHelper: {
            fontSize: 12,
            color: colors.subTextColor,
        },
        fieldError: {
            fontSize: 12,
            color: colors.errorColor || '#D32F2F',
        },
    }), [colors, styles]);
    const toAbsoluteUrl = (value) => {
        if (!value)
            return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://'))
            return raw;
        const base = getApiBaseUrl();
        if (!base)
            return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    };
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || mode !== 'edit') {
            setResults([]);
            return () => {
                mounted = false;
            };
        }
        const handler = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            const term = query.trim();
            if (!term) {
                if (mounted)
                    setResults([]);
                return;
            }
            setSearching(true);
            try {
                const resp = yield searchProfiles(apiAccessToken, { q: term, limit: 10 });
                if (mounted) {
                    const nextResults = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.profiles)
                        ? resp.profiles.filter((profile) => String((profile === null || profile === void 0 ? void 0 : profile.profile_id) || '').trim() !== activeProfileId)
                        : [];
                    setResults(nextResults);
                }
            }
            catch (_a) {
                if (mounted)
                    setResults([]);
            }
            finally {
                if (mounted)
                    setSearching(false);
            }
        }), 300);
        return () => {
            mounted = false;
            clearTimeout(handler);
        };
    }, [activeProfileId, apiAccessToken, mode, query]);
    useEffect(() => {
        let mounted = true;
        const normalizedName = String(groupName || '').trim().replace(/\s+/g, ' ').toLowerCase();
        const normalizedOriginal = String(originalGroupName || '').trim().replace(/\s+/g, ' ').toLowerCase();
        if (!apiAccessToken || normalizedName.length < 2) {
            setGroupNameStatus({ state: 'idle', message: null });
            return () => {
                mounted = false;
            };
        }
        if (mode === 'edit' && normalizedName === normalizedOriginal) {
            setGroupNameStatus({ state: 'available', message: null });
            return () => {
                mounted = false;
            };
        }
        setGroupNameStatus({ state: 'checking', message: null });
        const handler = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const [groupsResp, clubsResp] = yield Promise.all([
                    searchGroups(apiAccessToken, { q: groupName.trim(), limit: 12 }),
                    searchClubs(apiAccessToken, { q: groupName.trim(), limit: 12 }),
                ]);
                if (!mounted)
                    return;
                const exactGroup = Array.isArray(groupsResp === null || groupsResp === void 0 ? void 0 : groupsResp.groups)
                    ? groupsResp.groups.find((entry) => String((entry === null || entry === void 0 ? void 0 : entry.name) || '').trim().replace(/\s+/g, ' ').toLowerCase() === normalizedName)
                    : null;
                if (exactGroup) {
                    setGroupNameStatus({ state: 'group', message: t('A group with this name already exists.') });
                    return;
                }
                const exactClub = Array.isArray(clubsResp === null || clubsResp === void 0 ? void 0 : clubsResp.clubs)
                    ? clubsResp.clubs.find((entry) => String((entry === null || entry === void 0 ? void 0 : entry.name) || '').trim().replace(/\s+/g, ' ').toLowerCase() === normalizedName)
                    : null;
                if (exactClub) {
                    setGroupNameStatus({ state: 'club', message: t('This name is already used by an official club.') });
                    return;
                }
                setGroupNameStatus({ state: 'available', message: null });
            }
            catch (_a) {
                if (mounted)
                    setGroupNameStatus({ state: 'idle', message: null });
            }
        }), 280);
        return () => {
            mounted = false;
            clearTimeout(handler);
        };
    }, [apiAccessToken, groupName, mode, originalGroupName, t]);
    const selectedIds = useMemo(() => new Set(selectedMembers.map((m) => m.profile_id)), [selectedMembers]);
    const addMember = (profile) => {
        const memberProfileId = String((profile === null || profile === void 0 ? void 0 : profile.profile_id) || '').trim();
        if (!memberProfileId || memberProfileId === activeProfileId || selectedIds.has(memberProfileId))
            return;
        setSelectedMembers((prev) => [...prev, Object.assign(Object.assign({}, profile), { role: roleMode })]);
    };
    const removeMember = (profileId) => {
        setSelectedMembers((prev) => prev.filter((m) => m.profile_id !== profileId));
    };
    const handleSelectCity = (label) => {
        setGroupDescription(label);
        setIsBaseLocationFocused(false);
        if (missingRequiredFields.groupDescription && label.trim()) {
            setMissingRequiredFields((prev) => (Object.assign(Object.assign({}, prev), { groupDescription: false })));
        }
    };
    const selectedAthletes = useMemo(() => selectedMembers.filter((m) => m.role === 'athlete'), [selectedMembers]);
    const selectedCoaches = useMemo(() => selectedMembers.filter((m) => m.role === 'coach'), [selectedMembers]);
    const focusOptions = useMemo(() => getSportFocusDefinitions().map((focus) => ({
        id: focus.id,
        label: getSportFocusLabel(focus.id, t),
        icon: _jsx(SportFocusIcon, { focusId: focus.id, size: 16, color: colors.primaryColor }),
    })), [colors.primaryColor, t]);
    const visibleFocusOptions = useMemo(() => {
        if (!focusLocked)
            return focusOptions;
        const selectedSet = new Set(selectedFocuses);
        return focusOptions.filter((focus) => selectedSet.has(focus.id));
    }, [focusLocked, focusOptions, selectedFocuses]);
    const toggleFocus = (id) => {
        if (focusLocked)
            return;
        setSelectedFocuses((prev) => {
            if (prev.includes(id)) {
                const next = prev.filter((entry) => entry !== id);
                return next.length > 0 ? next : prev;
            }
            return [...prev, id];
        });
    };
    const removeManualCoachName = (name) => {
        setManualCoachNames((prev) => prev.filter((entry) => String(entry).toLowerCase() !== String(name).toLowerCase()));
    };
    const pickIconImage = () => __awaiter(void 0, void 0, void 0, function* () {
        var _h;
        const result = yield launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            presentationStyle: 'fullScreen',
            assetRepresentationMode: 'current',
        });
        const asset = (_h = result.assets) === null || _h === void 0 ? void 0 : _h[0];
        if (!(asset === null || asset === void 0 ? void 0 : asset.uri))
            return;
        setIconPreviewUrl(String(asset.uri));
        setIconUploadFile({
            uri: String(asset.uri),
            type: String(asset.type || 'image/jpeg'),
            name: String(asset.fileName || `group-icon-${Date.now()}.jpg`),
        });
    });
    const handleCreateGroup = () => __awaiter(void 0, void 0, void 0, function* () {
        var _j, _k, _l, _m, _o, _p;
        const nextMissingRequiredFields = {
            groupName: !groupName.trim(),
            groupDescription: !groupDescription.trim(),
        };
        setMissingRequiredFields(nextMissingRequiredFields);
        if (nextMissingRequiredFields.groupName || nextMissingRequiredFields.groupDescription) {
            return;
        }
        if (groupNameStatus.state === 'group' || groupNameStatus.state === 'club') {
            Alert.alert(t('Choose a different name'), groupNameStatus.message || t('This name is not available.'));
            return;
        }
        if (!apiAccessToken) {
            Alert.alert(t('Error'), t('You must be logged in'));
            return;
        }
        setIsSaving(true);
        try {
            let groupId = '';
            let avatarMediaId;
            if (iconUploadFile) {
                const uploaded = yield uploadMediaBatch(apiAccessToken, {
                    files: [iconUploadFile],
                    skip_profile_collection: true,
                });
                const uploadedId = String(((_k = (_j = uploaded === null || uploaded === void 0 ? void 0 : uploaded.results) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.media_id) || '').trim();
                if (uploadedId)
                    avatarMediaId = uploadedId;
            }
            const coachNames = Array.from(new Set([
                ...manualCoachNames.map((entry) => String(entry || '').trim()).filter(Boolean),
                ...selectedCoaches.map((member) => String(member.display_name || '').trim()).filter(Boolean),
            ].filter(Boolean)));
            const focusPayload = Array.from(new Set(selectedFocuses));
            const groupLocation = groupDescription.trim();
            if (mode === 'edit' && editGroupId) {
                const updated = yield updateGroup(apiAccessToken, editGroupId, {
                    name: groupName.trim(),
                    description: groupLocation || undefined,
                    bio: groupLocation || undefined,
                    location: groupLocation || undefined,
                    city: groupLocation || undefined,
                    base_location: groupLocation || undefined,
                    website: String(groupWebsite || '').trim() || undefined,
                    coaches: coachNames,
                    focuses: focusPayload,
                    competition_focuses: focusPayload,
                    selected_events: focusPayload,
                    avatar_media_id: avatarMediaId,
                });
                groupId = String(((_l = updated === null || updated === void 0 ? void 0 : updated.group) === null || _l === void 0 ? void 0 : _l.group_id) || editGroupId).trim();
            }
            else {
                const created = yield createGroup(apiAccessToken, {
                    name: groupName.trim(),
                    description: groupLocation || undefined,
                    bio: groupLocation || undefined,
                    location: groupLocation || undefined,
                    city: groupLocation || undefined,
                    base_location: groupLocation || undefined,
                    website: String(groupWebsite || '').trim() || undefined,
                    coaches: coachNames,
                    focuses: focusPayload,
                    competition_focuses: focusPayload,
                    selected_events: focusPayload,
                    avatar_media_id: avatarMediaId,
                });
                groupId = String(((_m = created === null || created === void 0 ? void 0 : created.group) === null || _m === void 0 ? void 0 : _m.group_id) || ((_o = created === null || created === void 0 ? void 0 : created.group) === null || _o === void 0 ? void 0 : _o.id) || '').trim();
            }
            if (groupId) {
                if (mode === 'edit') {
                    const additions = selectedMembers.map((member) => inviteGroupMember(apiAccessToken, groupId, {
                        profile_id: member.profile_id,
                        role: 'member',
                        public_roles: [member.role],
                    }));
                    if (additions.length) {
                        yield Promise.allSettled(additions);
                    }
                }
                navigation.dispatch(CommonActions.reset(buildBottomTabGroupProfileReset(groupId, {
                    showBackButton: true,
                    origin: 'profile',
                })));
            }
            else {
                Alert.alert(t('Error'), t('Could not create group. Please try again.'));
            }
        }
        catch (err) {
            Alert.alert(t('Error'), String((_p = err === null || err === void 0 ? void 0 : err.message) !== null && _p !== void 0 ? _p : err));
        }
        finally {
            setIsSaving(false);
        }
    });
    return (_jsxs(View, Object.assign({ style: styles.mainContainer, testID: "create-group-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(View, Object.assign({ style: styles.header }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 20, color: colors.primaryColor, variant: "Linear" }) })) })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, keyboardShouldPersistTaps: "always", contentContainerStyle: styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: styles.titleSection }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: mode === 'edit' ? t('Edit Group') : t('Create Group') })), _jsx(Text, Object.assign({ style: styles.subtitle }, { children: mode === 'edit'
                                    ? t('Invite athletes and coaches to your group')
                                    : t('Set up your group details. Members can join after creation.') }))] })), isLoadingGroup ? (_jsx(View, Object.assign({ style: localStyles.emptyState }, { children: _jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }) }))) : null, _jsxs(View, Object.assign({ style: styles.formContainer }, { children: [_jsxs(View, Object.assign({ style: styles.inputGroup }, { children: [_jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Group icon') })), _jsx(TouchableOpacity, Object.assign({ style: [styles.inputContainer, { height: 120, justifyContent: 'center', overflow: 'hidden' }], onPress: pickIconImage, activeOpacity: 0.85 }, { children: iconPreviewUrl ? (_jsx(FastImage, { source: { uri: iconPreviewUrl }, style: { width: '100%', height: '100%', borderRadius: 8 }, resizeMode: "cover" })) : (_jsx(Text, Object.assign({ style: styles.subtitle }, { children: t('Tap to select icon') }))) }))] })), _jsxs(View, Object.assign({ style: styles.inputGroup }, { children: [_jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Group Name') })), _jsxs(View, Object.assign({ style: [styles.inputContainer, missingRequiredFields.groupName && localStyles.requiredErrorBorder] }, { children: [_jsx(People, { size: 22, color: colors.primaryColor, variant: "Linear" }), _jsx(TextInput, { style: styles.textInput, placeholder: t('Enter group name'), placeholderTextColor: colors.grayColor, value: groupName, onChangeText: (value) => {
                                                    setGroupName(value);
                                                    if (missingRequiredFields.groupName && value.trim()) {
                                                        setMissingRequiredFields((prev) => (Object.assign(Object.assign({}, prev), { groupName: false })));
                                                    }
                                                }, testID: "create-group-name-input" })] })), groupNameStatus.state === 'checking' ? (_jsx(Text, Object.assign({ style: localStyles.fieldHelper }, { children: t('Checking group name...') }))) : null, groupNameStatus.message ? (_jsx(Text, Object.assign({ style: localStyles.fieldError }, { children: groupNameStatus.message }))) : null] })), _jsxs(View, Object.assign({ style: styles.inputGroup }, { children: [_jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Based in (required)') })), _jsxs(View, Object.assign({ style: localStyles.locationFieldWrap }, { children: [_jsxs(View, Object.assign({ style: [
                                                    localStyles.locationInputRow,
                                                    isBaseLocationFocused && localStyles.locationInputRowFocused,
                                                    missingRequiredFields.groupDescription && localStyles.requiredErrorBorder,
                                                ] }, { children: [_jsx(Icons.Location, { height: 16, width: 16 }), _jsx(TextInput, { style: localStyles.locationInput, placeholder: t('City'), placeholderTextColor: colors.grayColor, value: groupDescription, onChangeText: (value) => {
                                                            setGroupDescription(value);
                                                            if (missingRequiredFields.groupDescription && value.trim()) {
                                                                setMissingRequiredFields((prev) => (Object.assign(Object.assign({}, prev), { groupDescription: false })));
                                                            }
                                                        }, autoCapitalize: "words", onFocus: () => setIsBaseLocationFocused(true), onBlur: () => {
                                                            setTimeout(() => setIsBaseLocationFocused(false), 120);
                                                        }, testID: "create-group-city-input" })] })), showCitySuggestions ? (_jsx(View, Object.assign({ style: localStyles.locationResultsDropdown }, { children: filteredCityOptions.map(({ label }, index) => (_jsx(TouchableOpacity, Object.assign({ style: [
                                                        localStyles.locationResultRow,
                                                        index === filteredCityOptions.length - 1 && localStyles.locationResultRowLast,
                                                    ], activeOpacity: 0.85, onPress: () => handleSelectCity(label) }, { children: _jsx(Text, Object.assign({ style: localStyles.locationResultText }, { children: label })) }), label))) }))) : null] }))] })), _jsxs(View, Object.assign({ style: styles.inputGroup }, { children: [_jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Website') })), _jsxs(View, Object.assign({ style: styles.inputContainer }, { children: [_jsx(Edit2, { size: 22, color: colors.primaryColor, variant: "Linear" }), _jsx(TextInput, { style: styles.textInput, placeholder: t('Enter website link (optional)'), placeholderTextColor: colors.grayColor, value: groupWebsite, onChangeText: setGroupWebsite, autoCapitalize: "none", keyboardType: "url", testID: "create-group-website-input" })] }))] })), _jsxs(View, Object.assign({ style: styles.inputGroup }, { children: [_jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Focus') })), _jsx(View, Object.assign({ style: localStyles.focusChipsRow }, { children: visibleFocusOptions.map((focus) => {
                                            const active = selectedFocuses.includes(focus.id);
                                            return (_jsxs(TouchableOpacity, Object.assign({ style: [localStyles.focusChip, active && localStyles.focusChipActive], activeOpacity: focusLocked ? 1 : 0.85, onPress: () => toggleFocus(focus.id), disabled: focusLocked }, { children: [focus.icon, _jsx(Text, Object.assign({ style: active ? localStyles.focusChipTextActive : localStyles.focusChipText }, { children: focus.label }))] }), `focus-${focus.id}`));
                                        }) }))] })), mode === 'edit' ? (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: styles.inputGroup }, { children: [_jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Add Members') })), _jsxs(View, Object.assign({ style: localStyles.roleToggle }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [localStyles.roleButton, roleMode === 'athlete' && localStyles.roleButtonActive], onPress: () => setRoleMode('athlete') }, { children: _jsx(Text, Object.assign({ style: roleMode === 'athlete' ? localStyles.roleTextActive : localStyles.roleText }, { children: t('Athletes') })) })), _jsx(TouchableOpacity, Object.assign({ style: [localStyles.roleButton, roleMode === 'coach' && localStyles.roleButtonActive], onPress: () => setRoleMode('coach') }, { children: _jsx(Text, Object.assign({ style: roleMode === 'coach' ? localStyles.roleTextActive : localStyles.roleText }, { children: t('Coaches') })) }))] })), _jsxs(View, Object.assign({ style: styles.inputContainer }, { children: [_jsx(SearchNormal1, { size: 20, color: colors.primaryColor, variant: "Linear" }), _jsx(TextInput, { style: styles.textInput, placeholder: t('Search users'), placeholderTextColor: colors.grayColor, value: query, onChangeText: setQuery })] })), searching && (_jsx(View, Object.assign({ style: localStyles.emptyState }, { children: _jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }) }))), !searching && query.trim().length > 0 && results.length === 0 && (_jsx(View, Object.assign({ style: localStyles.emptyState }, { children: _jsx(Text, Object.assign({ style: localStyles.emptyText }, { children: t('No results') })) }))), !searching && results.map((profile) => (_jsxs(View, Object.assign({ style: localStyles.resultCard }, { children: [_jsxs(View, { children: [_jsx(Text, Object.assign({ style: localStyles.resultName }, { children: profile.display_name || t('Unnamed user') })), _jsx(Text, Object.assign({ style: localStyles.resultRole }, { children: roleMode === 'coach' ? t('Coach') : t('Athlete') }))] }), _jsxs(TouchableOpacity, Object.assign({ style: localStyles.addButton, onPress: () => addMember(profile) }, { children: [_jsx(Add, { size: 16, color: colors.whiteColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: localStyles.addButtonText }, { children: t('Add') }))] }))] }), profile.profile_id)))] })), _jsxs(View, Object.assign({ style: styles.inputGroup }, { children: [_jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Selected Athletes') })), selectedAthletes.length === 0 ? (_jsx(Text, Object.assign({ style: styles.subtitle }, { children: t('No athletes added yet') }))) : (_jsx(View, Object.assign({ style: localStyles.chipRow }, { children: selectedAthletes.map((member) => (_jsxs(TouchableOpacity, Object.assign({ style: localStyles.chip, onPress: () => removeMember(member.profile_id) }, { children: [_jsx(Profile2User, { size: 14, color: colors.primaryColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: localStyles.chipText }, { children: member.display_name || t('Athlete') })), _jsx(CloseCircle, { size: 14, color: colors.subTextColor, variant: "Linear" })] }), member.profile_id))) })))] })), _jsxs(View, Object.assign({ style: styles.inputGroup }, { children: [_jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Selected Coaches') })), selectedCoaches.length === 0 && manualCoachNames.length === 0 ? (_jsx(Text, Object.assign({ style: styles.subtitle }, { children: t('No coaches added yet') }))) : (_jsxs(View, Object.assign({ style: localStyles.chipRow }, { children: [manualCoachNames.map((coachName) => (_jsxs(TouchableOpacity, Object.assign({ style: localStyles.chip, onPress: () => removeManualCoachName(coachName) }, { children: [_jsx(Profile2User, { size: 14, color: colors.primaryColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: localStyles.chipText }, { children: coachName })), _jsx(CloseCircle, { size: 14, color: colors.subTextColor, variant: "Linear" })] }), `manual-coach-${coachName}`))), selectedCoaches.map((member) => (_jsxs(TouchableOpacity, Object.assign({ style: localStyles.chip, onPress: () => removeMember(member.profile_id) }, { children: [_jsx(Profile2User, { size: 14, color: colors.primaryColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: localStyles.chipText }, { children: member.display_name || t('Coach') })), _jsx(CloseCircle, { size: 14, color: colors.subTextColor, variant: "Linear" })] }), member.profile_id)))] })))] }))] })) : null] })), _jsx(TouchableOpacity, Object.assign({ style: [styles.continueButton, isSaving && { opacity: 0.5 }], onPress: handleCreateGroup, disabled: isSaving, testID: "create-group-submit" }, { children: isSaving ? (_jsx(ActivityIndicator, { size: "small", color: colors.whiteColor })) : (_jsx(_Fragment, { children: _jsx(Text, Object.assign({ style: styles.continueButtonText }, { children: mode === 'edit' ? t('Save') : t('Create Group') })) })) }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom : 20 })] })));
};
export default CreateGroupProfileScreen;
