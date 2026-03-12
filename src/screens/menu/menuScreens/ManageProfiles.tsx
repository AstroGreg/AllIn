import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Add, Trash } from 'iconsax-react-nativejs';
import { useAuth } from '../../../context/AuthContext';
import { deleteGroup, getMyGroups, type GroupSummary } from '../../../services/apiGateway';
import { useTranslation } from 'react-i18next';
import { getSportFocusLabel, normalizeMainDisciplines, normalizeSelectedEvents, type SportFocusId } from '../../../utils/profileSelections';

const ManageProfiles = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const Styles = createStyles(colors);
  const { t } = useTranslation();
  const { apiAccessToken, userProfile, updateUserProfile } = useAuth();

  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);
  const [updatingSelectedEvents, setUpdatingSelectedEvents] = useState(false);

  const selectedFocuses = useMemo(
    () => normalizeSelectedEvents(userProfile?.selectedEvents ?? []),
    [userProfile?.selectedEvents],
  );
  const hasSupportProfile = useMemo(() => {
    return (
      String((userProfile as any)?.supportRole ?? '').trim().length > 0 ||
      (Array.isArray((userProfile as any)?.supportClubCodes) && (userProfile as any).supportClubCodes.length > 0) ||
      (Array.isArray((userProfile as any)?.supportGroupIds) && (userProfile as any).supportGroupIds.length > 0) ||
      (Array.isArray((userProfile as any)?.supportAthletes) && (userProfile as any).supportAthletes.length > 0) ||
      (Array.isArray((userProfile as any)?.supportFocuses) && (userProfile as any).supportFocuses.length > 0) ||
      userProfile?.category === 'support'
    );
  }, [userProfile]);
  const canOpenAddProfileFlow = true;
  const linkedMainDisciplines = useMemo(
    () => normalizeMainDisciplines((userProfile as any)?.mainDisciplines ?? {}, {
      trackFieldMainEvent: userProfile?.trackFieldMainEvent ?? null,
      roadTrailMainEvent: userProfile?.roadTrailMainEvent ?? null,
    }),
    [userProfile],
  );

  const loadGroups = useCallback(async () => {
    if (!apiAccessToken) return;
    setLoadingGroups(true);
    try {
      const resp = await getMyGroups(apiAccessToken);
      setGroups(Array.isArray(resp?.groups) ? resp.groups : []);
    } catch {
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  }, [apiAccessToken]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const removePersonalProfile = async (focusId: SportFocusId) => {
    if (!apiAccessToken) {
      Alert.alert(t('Error'), t('Please sign in again.'));
      return;
    }
    const next = selectedFocuses.filter((entry) => entry !== focusId);
    const nextMainDisciplines = { ...linkedMainDisciplines };
    delete nextMainDisciplines[focusId];
    setUpdatingSelectedEvents(true);
    try {
      await updateUserProfile({
        selectedEvents: next as any,
        mainDisciplines: nextMainDisciplines,
      });
    } catch {
      Alert.alert(t('Error'), t('Failed to save. Please try again.'));
    } finally {
      setUpdatingSelectedEvents(false);
    }
  };

  const handleDeleteGroup = (group: GroupSummary) => {
    const groupId = String(group?.group_id ?? '').trim();
    if (!groupId || !apiAccessToken) return;
    Alert.alert(
      t('Delete'),
      `${t('Delete')} ${group.name || t('Group')}?`,
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: async () => {
            setBusyGroupId(groupId);
            try {
              await deleteGroup(apiAccessToken, groupId);
              setGroups((prev) => prev.filter((entry) => String(entry.group_id) !== groupId));
            } finally {
              setBusyGroupId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={Styles.mainContainer}>
      <SizeBox height={insets.top} />
      <View style={Styles.header}>
        <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={Styles.headerTitle}>{t('Manage profiles')}</Text>
        <View style={Styles.headerSpacer} />
      </View>
      <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
        <SizeBox height={24} />

        <Text style={Styles.sectionTitle}>{t('Personal profiles')}</Text>
        <SizeBox height={12} />
        {selectedFocuses.length > 0 ? selectedFocuses.map((focusId) => (
          <React.Fragment key={focusId}>
            <View style={Styles.accountSettingsCard}>
              <Text style={Styles.accountSettingsTitle}>{getSportFocusLabel(focusId, t)}</Text>
              <TouchableOpacity
                onPress={() => removePersonalProfile(focusId)}
                disabled={updatingSelectedEvents}
              >
                {updatingSelectedEvents ? (
                  <ActivityIndicator size="small" color={colors.primaryColor} />
                ) : (
                  <Trash size={18} color={colors.errorColor || '#E14B4B'} variant="Linear" />
                )}
              </TouchableOpacity>
            </View>
            <SizeBox height={10} />
          </React.Fragment>
        )) : (
          <>
            <View style={Styles.accountSettingsCard}>
              <Text style={Styles.accountSettingsTitle}>{t('No personal profiles linked yet')}</Text>
            </View>
            <SizeBox height={10} />
          </>
        )}
        {hasSupportProfile ? (
          <>
            <View style={Styles.accountSettingsCard}>
              <TouchableOpacity onPress={() => navigation.navigate('CompleteSupportDetailsScreen', { editMode: true })} style={{ flex: 1 }}>
                <Text style={Styles.accountSettingsTitle}>
                  {String((userProfile as any)?.supportRole ?? '').trim().length > 0
                    ? `${String((userProfile as any)?.supportRole).trim()} ${t('profile')}`
                    : t('Support profile')}
                </Text>
              </TouchableOpacity>
            </View>
            <SizeBox height={10} />
          </>
        ) : null}
        {canOpenAddProfileFlow && (
          <>
            <TouchableOpacity
              style={Styles.accountSettingsCard}
              onPress={() => navigation.navigate('CategorySelectionScreen', { fromAddFlow: true })}
            >
              <View style={Styles.accountSettingsLeft}>
                <Add size={16} color={colors.primaryColor} variant="Linear" />
                <SizeBox width={10} />
                <Text style={Styles.accountSettingsTitle}>{t('Add profile')}</Text>
              </View>
            </TouchableOpacity>
            <SizeBox height={10} />
          </>
        )}

        <SizeBox height={16} />
        <Text style={Styles.sectionTitle}>{t('Groups')}</Text>
        <SizeBox height={12} />
        {loadingGroups ? (
          <ActivityIndicator color={colors.primaryColor} />
        ) : (
          groups.map((group) => {
            const groupId = String(group.group_id || '');
            const busy = busyGroupId === groupId;
            return (
              <React.Fragment key={groupId}>
                <View style={Styles.accountSettingsCard}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('GroupProfileScreen', {
                      groupId,
                      showBackButton: true,
                      origin: 'profile',
                    })}
                    style={{ flex: 1 }}
                  >
                    <Text style={Styles.accountSettingsTitle}>{group.name || t('Group')}</Text>
                  </TouchableOpacity>
                  {String(group.my_role || '').toLowerCase() === 'owner' && (
                    <TouchableOpacity onPress={() => handleDeleteGroup(group)} disabled={busy}>
                      {busy ? (
                        <ActivityIndicator size="small" color={colors.primaryColor} />
                      ) : (
                        <Trash size={18} color={colors.errorColor || '#E14B4B'} variant="Linear" />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                <SizeBox height={10} />
              </React.Fragment>
            );
          })
        )}
        {(groups.length === 0 || canOpenAddProfileFlow) ? (
          <TouchableOpacity
            style={Styles.accountSettingsCard}
            onPress={() => navigation.navigate('CategorySelectionScreen', { fromAddFlow: true })}
          >
            <View style={Styles.accountSettingsLeft}>
              <Add size={16} color={colors.primaryColor} variant="Linear" />
              <SizeBox width={10} />
              <Text style={Styles.accountSettingsTitle}>{t('Add group')}</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>
    </View>
  );
};

export default ManageProfiles;
