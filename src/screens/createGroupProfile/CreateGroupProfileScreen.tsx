import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import React, { useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles } from './CreateGroupProfileStyles';
import { ArrowLeft2, People, Edit2, SearchNormal1, Add, CloseCircle, Profile2User } from 'iconsax-react-nativejs';
import { launchImageLibrary } from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
    createGroup,
    getGroup,
    getMediaById,
    inviteGroupMember,
    searchProfiles,
    uploadMediaBatch,
    updateGroup,
    type ProfileSearchResult,
} from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';

type MemberPick = ProfileSearchResult & { role: 'athlete' | 'coach' };
type GroupFocus = 'track-field' | 'road-events';

const CreateGroupProfileScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const mode = route?.params?.mode === 'edit' ? 'edit' : 'create';
    const editGroupId = route?.params?.groupId ? String(route.params.groupId) : null;
    const initialSelectedFocuses = useMemo(() => {
        const raw = route?.params?.selectedFocuses ?? route?.params?.selectedEvents ?? [];
        if (!Array.isArray(raw)) return [] as GroupFocus[];
        return Array.from(
            new Set(
                raw
                    .map((entry: any) => String(entry || '').trim().toLowerCase())
                    .map((entry: string) => {
                        if (entry.includes('track')) return 'track-field';
                        if (entry.includes('road') || entry.includes('trail')) return 'road-events';
                        return '';
                    })
                    .filter(Boolean),
            ),
        ) as GroupFocus[];
    }, [route?.params?.selectedEvents, route?.params?.selectedFocuses]);
    const hasIncomingFocusSelection = Array.isArray(route?.params?.selectedFocuses) || Array.isArray(route?.params?.selectedEvents);
    const focusLocked = mode === 'create' && Boolean(route?.params?.focusLocked) && hasIncomingFocusSelection;

    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupWebsite, setGroupWebsite] = useState('');
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

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || mode !== 'edit' || !editGroupId) return () => {};
        (async () => {
            setIsLoadingGroup(true);
            try {
                const resp = await getGroup(apiAccessToken, editGroupId);
                if (!mounted) return;
                setGroupName(String(resp?.group?.name ?? ''));
                setGroupDescription(String(resp?.group?.bio ?? resp?.group?.description ?? ''));
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
                            .map((entry) => {
                                if (entry.includes('track')) return 'track-field';
                                if (entry.includes('road') || entry.includes('trail')) return 'road-events';
                                return '';
                            })
                            .filter(Boolean),
                    ),
                ) as GroupFocus[];
                if (normalizedServerFocuses.length > 0) {
                    setSelectedFocuses(normalizedServerFocuses);
                } else {
                    const stored = String((await AsyncStorage.getItem(`@group_focuses_${editGroupId}`)) || '').trim();
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            const fromStorage = (Array.isArray(parsed) ? parsed : [])
                                .map((entry: any) => String(entry || '').trim().toLowerCase())
                                .filter((entry: string) => entry === 'track-field' || entry === 'road-events') as GroupFocus[];
                            if (fromStorage.length > 0) {
                                setSelectedFocuses(Array.from(new Set(fromStorage)));
                            }
                        } catch {
                            // ignore
                        }
                    }
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

    const localStyles = useMemo(
        () =>
            StyleSheet.create({
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
            }),
        [colors],
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
        if (!apiAccessToken) {
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
                if (mounted) setResults(resp.profiles || []);
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
    }, [apiAccessToken, query]);

    const selectedIds = useMemo(() => new Set(selectedMembers.map((m) => m.profile_id)), [selectedMembers]);

    const addMember = (profile: ProfileSearchResult) => {
        if (!profile?.profile_id || selectedIds.has(profile.profile_id)) return;
        setSelectedMembers((prev) => [...prev, { ...profile, role: roleMode }]);
    };

    const removeMember = (profileId: string) => {
        setSelectedMembers((prev) => prev.filter((m) => m.profile_id !== profileId));
    };

    const selectedAthletes = useMemo(() => selectedMembers.filter((m) => m.role === 'athlete'), [selectedMembers]);
    const selectedCoaches = useMemo(() => selectedMembers.filter((m) => m.role === 'coach'), [selectedMembers]);
    const focusOptions = useMemo(
        () => [
            { id: 'track-field' as GroupFocus, label: t('trackAndField'), icon: <Icons.TrackFieldLogo width={16} height={16} /> },
            { id: 'road-events' as GroupFocus, label: t('roadAndTrail'), icon: <Icons.PersonRunningColorful width={16} height={16} /> },
        ],
        [t],
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
        if (!groupName.trim()) {
            Alert.alert(t('Error'), t('Please enter a group name'));
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
                const uploaded = await uploadMediaBatch(apiAccessToken, { files: [iconUploadFile] });
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

            if (mode === 'edit' && editGroupId) {
                const updated = await updateGroup(apiAccessToken, editGroupId, {
                    name: groupName.trim(),
                    description: groupDescription.trim() || undefined,
                    bio: groupDescription.trim() || undefined,
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
                    description: groupDescription.trim() || undefined,
                    bio: groupDescription.trim() || undefined,
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
                await AsyncStorage.setItem(`@group_focuses_${groupId}`, JSON.stringify(focusPayload));
                const additions = selectedMembers.map((member) =>
                    inviteGroupMember(apiAccessToken, groupId, {
                        profile_id: member.profile_id,
                        role: member.role,
                    }),
                );
                if (additions.length) {
                    await Promise.allSettled(additions);
                }
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'BottomTabBar',
                            params: {
                                screen: 'Profile',
                                params: {
                                    screen: 'GroupProfileScreen',
                                    params: { groupId },
                                },
                            },
                        },
                    ],
                });
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
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{mode === 'edit' ? t('Edit Group') : t('Create Group')}</Text>
                    <Text style={styles.subtitle}>{t('Add athletes and coaches to your group')}</Text>
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
                        <View style={styles.inputContainer}>
                            <People size={22} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('Enter group name')}
                                placeholderTextColor={colors.grayColor}
                                value={groupName}
                                onChangeText={setGroupName}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Description')}</Text>
                        <View style={styles.inputContainer}>
                            <Edit2 size={22} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('Optional description')}
                                placeholderTextColor={colors.grayColor}
                                value={groupDescription}
                                onChangeText={setGroupDescription}
                            />
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
                </View>

                <TouchableOpacity
                    style={[styles.continueButton, isSaving && { opacity: 0.5 }]}
                    onPress={handleCreateGroup}
                    disabled={isSaving}
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
