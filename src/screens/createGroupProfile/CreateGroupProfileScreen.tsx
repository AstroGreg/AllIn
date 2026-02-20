import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import React, { useMemo, useState, useEffect } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles } from './CreateGroupProfileStyles';
import { ArrowLeft2, People, Edit2, SearchNormal1, Add, CloseCircle, Profile2User } from 'iconsax-react-nativejs';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
    addGroupMember,
    createGroup,
    searchProfiles,
    type ProfileSearchResult,
} from '../../services/apiGateway';

type MemberPick = ProfileSearchResult & { role: 'athlete' | 'coach' };

const CreateGroupProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken } = useAuth();

    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [roleMode, setRoleMode] = useState<'athlete' | 'coach'>('athlete');
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<ProfileSearchResult[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<MemberPick[]>([]);
    const [isSaving, setIsSaving] = useState(false);

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
            }),
        [colors],
    );

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
            const created = await createGroup(apiAccessToken, {
                name: groupName.trim(),
                description: groupDescription.trim() || undefined,
            });
            const groupId = String((created as any)?.group?.group_id || (created as any)?.group?.id || '').trim();
            if (groupId) {
                const additions = selectedMembers.map((member) =>
                    addGroupMember(apiAccessToken, groupId, {
                        profile_id: member.profile_id,
                        role: member.role,
                    }),
                );
                if (additions.length) {
                    await Promise.allSettled(additions);
                }
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'BottomTabBar' }],
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
                    <Text style={styles.title}>{t('Create Group')}</Text>
                    <Text style={styles.subtitle}>{t('Add athletes and coaches to your group')}</Text>
                </View>

                <View style={styles.formContainer}>
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
                        {selectedCoaches.length === 0 ? (
                            <Text style={styles.subtitle}>{t('No coaches added yet')}</Text>
                        ) : (
                            <View style={localStyles.chipRow}>
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
                            <Text style={styles.continueButtonText}>{t('Create Group')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
        </View>
    );
};

export default CreateGroupProfileScreen;
