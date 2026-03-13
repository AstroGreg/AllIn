import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import React, { useMemo, useState, useEffect } from 'react';
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
import {
    createGroup,
    getGroup,
    getMediaById,
    inviteGroupMember,
    searchClubs,
    searchGroups,
    searchProfiles,
    uploadMediaBatch,
    updateGroup,
    type ProfileSearchResult,
} from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { getFilteredCityOptions } from '../../constants/locationSuggestions';
import { getSportFocusDefinitions, getSportFocusLabel, normalizeFocusId, type SportFocusId } from '../../utils/profileSelections';
import { buildBottomTabGroupProfileReset } from '../../utils/navigationResets';

type MemberPick = ProfileSearchResult & { role: 'athlete' | 'coach' };
type GroupFocus = SportFocusId;

const CreateGroupProfileScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken, authBootstrap } = useAuth();
    const mode = route?.params?.mode === 'edit' ? 'edit' : 'create';
    const editGroupId = route?.params?.groupId ? String(route.params.groupId) : null;
    const initialSelectedFocuses = useMemo(() => {
        const raw = route?.params?.selectedFocuses ?? route?.params?.selectedEvents ?? [];
        if (!Array.isArray(raw)) return [] as GroupFocus[];
        return Array.from(
            new Set(
                raw
                    .map((entry: any) => String(entry || '').trim().toLowerCase())
                    .map((entry: string) => normalizeFocusId(entry) || '')
                    .filter(Boolean),
            ),
        ) as GroupFocus[];
    }, [route?.params?.selectedEvents, route?.params?.selectedFocuses]);
    const hasIncomingFocusSelection = Array.isArray(route?.params?.selectedFocuses) || Array.isArray(route?.params?.selectedEvents);
    const focusLocked = mode === 'create' && Boolean(route?.params?.focusLocked) && hasIncomingFocusSelection;

    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupWebsite, setGroupWebsite] = useState('');
    const [isBaseLocationFocused, setIsBaseLocationFocused] = useState(false);
    const [missingRequiredFields, setMissingRequiredFields] = useState<{ groupName: boolean; groupDescription: boolean }>({
        groupName: false,
        groupDescription: false,
    });
    const [roleMode, setRoleMode] = useState<'athlete' | 'coach'>('athlete');
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<ProfileSearchResult[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<MemberPick[]>([]);
    const [manualCoachNames, setManualCoachNames] = useState<string[]>([]);
    const [selectedFocuses, setSelectedFocuses] = useState<GroupFocus[]>(
        initialSelectedFocuses.length > 0 ? initialSelectedFocuses : ['track-field'],
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingGroup, setIsLoadingGroup] = useState(false);
    const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null);
    const [iconUploadFile, setIconUploadFile] = useState<{ uri: string; type: string; name: string } | null>(null);
    const [groupNameStatus, setGroupNameStatus] = useState<{ state: 'idle' | 'checking' | 'available' | 'group' | 'club'; message: string | null }>({
        state: 'idle',
        message: null,
    });
    const [originalGroupName, setOriginalGroupName] = useState('');
    const activeProfileId = String(authBootstrap?.profile_id || '').trim();

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || mode !== 'edit' || !editGroupId) return () => {};
        (async () => {
            setIsLoadingGroup(true);
            try {
                const resp = await getGroup(apiAccessToken, editGroupId);
                if (!mounted) return;
                setGroupName(String(resp?.group?.name ?? ''));
                setOriginalGroupName(String(resp?.group?.name ?? ''));
                setGroupDescription(
                    String(
                        (resp?.group as any)?.location ??
                        (resp?.group as any)?.base_location ??
                        (resp?.group as any)?.city ??
                        resp?.group?.bio ??
                        resp?.group?.description ??
                        '',
                    ),
                );
                setGroupWebsite(String((resp?.group as any)?.website ?? ''));
                const serverCoachNames = Array.isArray(resp?.group?.coaches)
                    ? resp.group.coaches.map((entry) => String(entry || '').trim()).filter(Boolean)
                    : [];
                setManualCoachNames(serverCoachNames);
                const serverFocusesRaw = [
                    ...(Array.isArray((resp?.group as any)?.focuses) ? ((resp?.group as any)?.focuses as string[]) : []),
                    ...(Array.isArray((resp?.group as any)?.competition_focuses) ? ((resp?.group as any)?.competition_focuses as string[]) : []),
                    ...(Array.isArray((resp?.group as any)?.selected_events) ? ((resp?.group as any)?.selected_events as string[]) : []),
                ]
                    .map((entry) => String(entry || '').trim().toLowerCase())
                    .filter(Boolean);
                const normalizedServerFocuses = Array.from(
                    new Set(
                        serverFocusesRaw
                            .map((entry) => normalizeFocusId(entry) || '')
                            .filter(Boolean),
                    ),
                ) as GroupFocus[];
                if (normalizedServerFocuses.length > 0) {
                    setSelectedFocuses(normalizedServerFocuses);
                }
                const avatarMediaId = String(resp?.group?.avatar_media_id ?? '').trim();
                if (avatarMediaId) {
                    try {
                        const media = await getMediaById(apiAccessToken, avatarMediaId);
                        if (!mounted) return;
                        const raw = media?.thumbnail_url || media?.preview_url || media?.full_url || media?.raw_url || media?.original_url || null;
                        setIconPreviewUrl(toAbsoluteUrl(raw ? String(raw) : null));
                    } catch {
                        if (mounted) setIconPreviewUrl(null);
                    }
                } else {
                    setIconPreviewUrl(null);
                }
            } catch {
                // ignore
            } finally {
                if (mounted) setIsLoadingGroup(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, editGroupId, mode]);

    const filteredCityOptions = useMemo(() => getFilteredCityOptions(groupDescription), [groupDescription]);
    const showCitySuggestions = isBaseLocationFocused && filteredCityOptions.length > 0;

    const localStyles = useMemo(
        () =>
            StyleSheet.create({
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
                locationInput: {
                    ...styles.textInput,
                    paddingVertical: 12,
                },
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
            }),
        [colors, styles],
    );

    const toAbsoluteUrl = (value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
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

        const handler = setTimeout(async () => {
            const term = query.trim();
            if (!term) {
                if (mounted) setResults([]);
                return;
            }
            setSearching(true);
            try {
                const resp = await searchProfiles(apiAccessToken, { q: term, limit: 10 });
                if (mounted) {
                    const nextResults = Array.isArray(resp?.profiles)
                        ? resp.profiles.filter((profile) => String(profile?.profile_id || '').trim() !== activeProfileId)
                        : [];
                    setResults(nextResults);
                }
            } catch {
                if (mounted) setResults([]);
            } finally {
                if (mounted) setSearching(false);
            }
        }, 300);

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
        const handler = setTimeout(async () => {
            try {
                const [groupsResp, clubsResp] = await Promise.all([
                    searchGroups(apiAccessToken, { q: groupName.trim(), limit: 12 }),
                    searchClubs(apiAccessToken, { q: groupName.trim(), limit: 12 }),
                ]);
                if (!mounted) return;

                const exactGroup = Array.isArray(groupsResp?.groups)
                    ? groupsResp.groups.find((entry) => String(entry?.name || '').trim().replace(/\s+/g, ' ').toLowerCase() === normalizedName)
                    : null;
                if (exactGroup) {
                    setGroupNameStatus({ state: 'group', message: t('A group with this name already exists.') });
                    return;
                }

                const exactClub = Array.isArray(clubsResp?.clubs)
                    ? clubsResp.clubs.find((entry) => String(entry?.name || '').trim().replace(/\s+/g, ' ').toLowerCase() === normalizedName)
                    : null;
                if (exactClub) {
                    setGroupNameStatus({ state: 'club', message: t('This name is already used by an official club.') });
                    return;
                }

                setGroupNameStatus({ state: 'available', message: null });
            } catch {
                if (mounted) setGroupNameStatus({ state: 'idle', message: null });
            }
        }, 280);

        return () => {
            mounted = false;
            clearTimeout(handler);
        };
    }, [apiAccessToken, groupName, mode, originalGroupName, t]);

    const selectedIds = useMemo(() => new Set(selectedMembers.map((m) => m.profile_id)), [selectedMembers]);

    const addMember = (profile: ProfileSearchResult) => {
        const memberProfileId = String(profile?.profile_id || '').trim();
        if (!memberProfileId || memberProfileId === activeProfileId || selectedIds.has(memberProfileId)) return;
        setSelectedMembers((prev) => [...prev, { ...profile, role: roleMode }]);
    };

    const removeMember = (profileId: string) => {
        setSelectedMembers((prev) => prev.filter((m) => m.profile_id !== profileId));
    };

    const handleSelectCity = (label: string) => {
        setGroupDescription(label);
        setIsBaseLocationFocused(false);
        if (missingRequiredFields.groupDescription && label.trim()) {
            setMissingRequiredFields((prev) => ({ ...prev, groupDescription: false }));
        }
    };

    const selectedAthletes = useMemo(() => selectedMembers.filter((m) => m.role === 'athlete'), [selectedMembers]);
    const selectedCoaches = useMemo(() => selectedMembers.filter((m) => m.role === 'coach'), [selectedMembers]);
    const focusOptions = useMemo(
        () => getSportFocusDefinitions().map((focus) => ({
            id: focus.id as GroupFocus,
            label: getSportFocusLabel(focus.id, t),
            icon: <SportFocusIcon focusId={focus.id} size={16} color={colors.primaryColor} />,
        })),
        [colors.primaryColor, t],
    );
    const visibleFocusOptions = useMemo(() => {
        if (!focusLocked) return focusOptions;
        const selectedSet = new Set(selectedFocuses);
        return focusOptions.filter((focus) => selectedSet.has(focus.id));
    }, [focusLocked, focusOptions, selectedFocuses]);
    const toggleFocus = (id: GroupFocus) => {
        if (focusLocked) return;
        setSelectedFocuses((prev) => {
            if (prev.includes(id)) {
                const next = prev.filter((entry) => entry !== id);
                return next.length > 0 ? next : prev;
            }
            return [...prev, id];
        });
    };
    const removeManualCoachName = (name: string) => {
        setManualCoachNames((prev) => prev.filter((entry) => String(entry).toLowerCase() !== String(name).toLowerCase()));
    };

    const pickIconImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            presentationStyle: 'fullScreen',
            assetRepresentationMode: 'current',
        });
        const asset = result.assets?.[0];
        if (!asset?.uri) return;
        setIconPreviewUrl(String(asset.uri));
        setIconUploadFile({
            uri: String(asset.uri),
            type: String(asset.type || 'image/jpeg'),
            name: String(asset.fileName || `group-icon-${Date.now()}.jpg`),
        });
    };

    const handleCreateGroup = async () => {
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
            let avatarMediaId: string | undefined;
            if (iconUploadFile) {
                const uploaded = await uploadMediaBatch(apiAccessToken, {
                    files: [iconUploadFile],
                    skip_profile_collection: true,
                });
                const uploadedId = String(uploaded?.results?.[0]?.media_id || '').trim();
                if (uploadedId) avatarMediaId = uploadedId;
            }
            const coachNames = Array.from(
                new Set(
                    [
                        ...manualCoachNames.map((entry) => String(entry || '').trim()).filter(Boolean),
                        ...selectedCoaches.map((member) => String(member.display_name || '').trim()).filter(Boolean),
                    ].filter(Boolean),
                ),
            );
            const focusPayload = Array.from(new Set(selectedFocuses));
            const groupLocation = groupDescription.trim();

            if (mode === 'edit' && editGroupId) {
                const updated = await updateGroup(apiAccessToken, editGroupId, {
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
                groupId = String((updated as any)?.group?.group_id || editGroupId).trim();
            } else {
                const created = await createGroup(apiAccessToken, {
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
                groupId = String((created as any)?.group?.group_id || (created as any)?.group?.id || '').trim();
            }
            if (groupId) {
                if (mode === 'edit') {
                    const additions = selectedMembers.map((member) =>
                        inviteGroupMember(apiAccessToken, groupId, {
                            profile_id: member.profile_id,
                            role: 'member',
                            public_roles: [member.role],
                        }),
                    );
                    if (additions.length) {
                        await Promise.allSettled(additions);
                    }
                }
                navigation.dispatch(
                    CommonActions.reset(
                        buildBottomTabGroupProfileReset(groupId, {
                            showBackButton: true,
                            origin: 'profile',
                        }),
                    ),
                );
            } else {
                Alert.alert(t('Error'), t('Could not create group. Please try again.'));
            }
        } catch (err: any) {
            Alert.alert(t('Error'), String(err?.message ?? err));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.mainContainer} testID="create-group-screen">
            <SizeBox height={insets.top} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{mode === 'edit' ? t('Edit Group') : t('Create Group')}</Text>
                    <Text style={styles.subtitle}>
                        {mode === 'edit'
                            ? t('Invite athletes and coaches to your group')
                            : t('Set up your group details. Members can join after creation.')}
                    </Text>
                </View>

                {isLoadingGroup ? (
                    <View style={localStyles.emptyState}>
                        <ActivityIndicator size="small" color={colors.primaryColor} />
                    </View>
                ) : null}

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Group icon')}</Text>
                        <TouchableOpacity
                            style={[styles.inputContainer, { height: 120, justifyContent: 'center', overflow: 'hidden' }]}
                            onPress={pickIconImage}
                            activeOpacity={0.85}
                        >
                            {iconPreviewUrl ? (
                                <FastImage source={{ uri: iconPreviewUrl }} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" />
                            ) : (
                                <Text style={styles.subtitle}>{t('Tap to select icon')}</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Group Name')}</Text>
                        <View style={[styles.inputContainer, missingRequiredFields.groupName && localStyles.requiredErrorBorder]}>
                            <People size={22} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('Enter group name')}
                                placeholderTextColor={colors.grayColor}
                                value={groupName}
                                onChangeText={(value) => {
                                    setGroupName(value);
                                    if (missingRequiredFields.groupName && value.trim()) {
                                        setMissingRequiredFields((prev) => ({ ...prev, groupName: false }));
                                    }
                                }}
                                testID="create-group-name-input"
                            />
                        </View>
                        {groupNameStatus.state === 'checking' ? (
                            <Text style={localStyles.fieldHelper}>{t('Checking group name...')}</Text>
                        ) : null}
                        {groupNameStatus.message ? (
                            <Text style={localStyles.fieldError}>{groupNameStatus.message}</Text>
                        ) : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Based in (required)')}</Text>
                        <View style={localStyles.locationFieldWrap}>
                            <View
                                style={[
                                    localStyles.locationInputRow,
                                    isBaseLocationFocused && localStyles.locationInputRowFocused,
                                    missingRequiredFields.groupDescription && localStyles.requiredErrorBorder,
                                ]}
                            >
                                <Icons.Location height={16} width={16} />
                                <TextInput
                                    style={localStyles.locationInput}
                                    placeholder={t('City')}
                                    placeholderTextColor={colors.grayColor}
                                    value={groupDescription}
                                    onChangeText={(value) => {
                                        setGroupDescription(value);
                                        if (missingRequiredFields.groupDescription && value.trim()) {
                                            setMissingRequiredFields((prev) => ({ ...prev, groupDescription: false }));
                                        }
                                    }}
                                    autoCapitalize="words"
                                    onFocus={() => setIsBaseLocationFocused(true)}
                                    onBlur={() => {
                                        setTimeout(() => setIsBaseLocationFocused(false), 120);
                                    }}
                                    testID="create-group-city-input"
                                />
                            </View>
                            {showCitySuggestions ? (
                                <View style={localStyles.locationResultsDropdown}>
                                    {filteredCityOptions.map(({ label }, index) => (
                                        <TouchableOpacity
                                            key={label}
                                            style={[
                                                localStyles.locationResultRow,
                                                index === filteredCityOptions.length - 1 && localStyles.locationResultRowLast,
                                            ]}
                                            activeOpacity={0.85}
                                            onPress={() => handleSelectCity(label)}
                                        >
                                            <Text style={localStyles.locationResultText}>{label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : null}
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Website')}</Text>
                        <View style={styles.inputContainer}>
                            <Edit2 size={22} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('Enter website link (optional)')}
                                placeholderTextColor={colors.grayColor}
                                value={groupWebsite}
                                onChangeText={setGroupWebsite}
                                autoCapitalize="none"
                                keyboardType="url"
                                testID="create-group-website-input"
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Focus')}</Text>
                        <View style={localStyles.focusChipsRow}>
                            {visibleFocusOptions.map((focus) => {
                                const active = selectedFocuses.includes(focus.id);
                                return (
                                    <TouchableOpacity
                                        key={`focus-${focus.id}`}
                                        style={[localStyles.focusChip, active && localStyles.focusChipActive]}
                                        activeOpacity={focusLocked ? 1 : 0.85}
                                        onPress={() => toggleFocus(focus.id)}
                                        disabled={focusLocked}
                                    >
                                        {focus.icon}
                                        <Text style={active ? localStyles.focusChipTextActive : localStyles.focusChipText}>
                                            {focus.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {mode === 'edit' ? (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{t('Add Members')}</Text>
                                <View style={localStyles.roleToggle}>
                                    <TouchableOpacity
                                        style={[localStyles.roleButton, roleMode === 'athlete' && localStyles.roleButtonActive]}
                                        onPress={() => setRoleMode('athlete')}
                                    >
                                        <Text style={roleMode === 'athlete' ? localStyles.roleTextActive : localStyles.roleText}>
                                            {t('Athletes')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[localStyles.roleButton, roleMode === 'coach' && localStyles.roleButtonActive]}
                                        onPress={() => setRoleMode('coach')}
                                    >
                                        <Text style={roleMode === 'coach' ? localStyles.roleTextActive : localStyles.roleText}>
                                            {t('Coaches')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputContainer}>
                                    <SearchNormal1 size={20} color={colors.primaryColor} variant="Linear" />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder={t('Search users')}
                                        placeholderTextColor={colors.grayColor}
                                        value={query}
                                        onChangeText={setQuery}
                                    />
                                </View>

                                {searching && (
                                    <View style={localStyles.emptyState}>
                                        <ActivityIndicator size="small" color={colors.primaryColor} />
                                    </View>
                                )}

                                {!searching && query.trim().length > 0 && results.length === 0 && (
                                    <View style={localStyles.emptyState}>
                                        <Text style={localStyles.emptyText}>{t('No results')}</Text>
                                    </View>
                                )}

                                {!searching && results.map((profile) => (
                                    <View key={profile.profile_id} style={localStyles.resultCard}>
                                        <View>
                                            <Text style={localStyles.resultName}>
                                                {profile.display_name || t('Unnamed user')}
                                            </Text>
                                            <Text style={localStyles.resultRole}>
                                                {roleMode === 'coach' ? t('Coach') : t('Athlete')}
                                            </Text>
                                        </View>
                                        <TouchableOpacity style={localStyles.addButton} onPress={() => addMember(profile)}>
                                            <Add size={16} color={colors.whiteColor} variant="Linear" />
                                            <Text style={localStyles.addButtonText}>{t('Add')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{t('Selected Athletes')}</Text>
                                {selectedAthletes.length === 0 ? (
                                    <Text style={styles.subtitle}>{t('No athletes added yet')}</Text>
                                ) : (
                                    <View style={localStyles.chipRow}>
                                        {selectedAthletes.map((member) => (
                                            <TouchableOpacity
                                                key={member.profile_id}
                                                style={localStyles.chip}
                                                onPress={() => removeMember(member.profile_id)}
                                            >
                                                <Profile2User size={14} color={colors.primaryColor} variant="Linear" />
                                                <Text style={localStyles.chipText}>
                                                    {member.display_name || t('Athlete')}
                                                </Text>
                                                <CloseCircle size={14} color={colors.subTextColor} variant="Linear" />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{t('Selected Coaches')}</Text>
                                {selectedCoaches.length === 0 && manualCoachNames.length === 0 ? (
                                    <Text style={styles.subtitle}>{t('No coaches added yet')}</Text>
                                ) : (
                                    <View style={localStyles.chipRow}>
                                        {manualCoachNames.map((coachName) => (
                                            <TouchableOpacity
                                                key={`manual-coach-${coachName}`}
                                                style={localStyles.chip}
                                                onPress={() => removeManualCoachName(coachName)}
                                            >
                                                <Profile2User size={14} color={colors.primaryColor} variant="Linear" />
                                                <Text style={localStyles.chipText}>{coachName}</Text>
                                                <CloseCircle size={14} color={colors.subTextColor} variant="Linear" />
                                            </TouchableOpacity>
                                        ))}
                                        {selectedCoaches.map((member) => (
                                            <TouchableOpacity
                                                key={member.profile_id}
                                                style={localStyles.chip}
                                                onPress={() => removeMember(member.profile_id)}
                                            >
                                                <Profile2User size={14} color={colors.primaryColor} variant="Linear" />
                                                <Text style={localStyles.chipText}>
                                                    {member.display_name || t('Coach')}
                                                </Text>
                                                <CloseCircle size={14} color={colors.subTextColor} variant="Linear" />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </>
                    ) : null}
                </View>

                <TouchableOpacity
                    style={[styles.continueButton, isSaving && { opacity: 0.5 }]}
                    onPress={handleCreateGroup}
                    disabled={isSaving}
                    testID="create-group-submit"
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color={colors.whiteColor} />
                    ) : (
                        <>
                            <Text style={styles.continueButtonText}>{mode === 'edit' ? t('Save') : t('Create Group')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
        </View>
    );
};

export default CreateGroupProfileScreen;
