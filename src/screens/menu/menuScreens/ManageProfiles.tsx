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

const ManageProfiles = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const Styles = createStyles(colors);
  const { t } = useTranslation();
  const { apiAccessToken, userProfile, updateUserProfile } = useAuth();

  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);

  const selectedEvents = useMemo(() => {
    const events = userProfile?.selectedEvents;
    return Array.isArray(events) ? [...events] : [];
  }, [userProfile?.selectedEvents]);
  const selectedEventsNormalized = useMemo(
    () =>
      selectedEvents
        .map((entry: any) => String(
          typeof entry === 'string'
            ? entry
            : entry?.id ?? entry?.value ?? entry?.event_id ?? entry?.name ?? '',
        ).trim().toLowerCase())
        .filter(Boolean),
    [selectedEvents],
  );
  const hasTrack = selectedEventsNormalized.some((entry) =>
    entry === 'track-field' || entry === 'track&field' || entry === 'track_field' || entry.includes('track'),
  );
  const hasRoad = selectedEventsNormalized.some((entry) =>
    entry === 'road-events' || entry === 'road&trail' || entry === 'road_trail' || entry.includes('road') || entry.includes('trail'),
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

  const removePersonalProfile = async (eventId: 'track-field' | 'road-events') => {
    const next = selectedEvents.filter((entry: any) => {
      const normalized = String(
        typeof entry === 'string'
          ? entry
          : entry?.id ?? entry?.value ?? entry?.event_id ?? entry?.name ?? '',
      ).trim().toLowerCase();
      if (eventId === 'track-field') {
        return !(normalized === 'track-field' || normalized === 'track&field' || normalized === 'track_field' || normalized.includes('track'));
      }
      return !(normalized === 'road-events' || normalized === 'road&trail' || normalized === 'road_trail' || normalized.includes('road') || normalized.includes('trail'));
    });
    await updateUserProfile({ selectedEvents: next as any });
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
        {hasTrack && (
          <>
            <View style={Styles.accountSettingsCard}>
              <Text style={Styles.accountSettingsTitle}>{t('trackAndField')}</Text>
              <TouchableOpacity onPress={() => removePersonalProfile('track-field')}>
                <Trash size={18} color={colors.errorColor || '#E14B4B'} variant="Linear" />
              </TouchableOpacity>
            </View>
            <SizeBox height={10} />
          </>
        )}
        {hasRoad && (
          <>
            <View style={Styles.accountSettingsCard}>
              <Text style={Styles.accountSettingsTitle}>{t('roadAndTrail')}</Text>
              <TouchableOpacity onPress={() => removePersonalProfile('road-events')}>
                <Trash size={18} color={colors.errorColor || '#E14B4B'} variant="Linear" />
              </TouchableOpacity>
            </View>
            <SizeBox height={10} />
          </>
        )}
        {!hasTrack && !hasRoad && (
          <>
            <View style={Styles.accountSettingsCard}>
              <Text style={Styles.accountSettingsTitle}>{t('No personal profiles linked yet')}</Text>
            </View>
            <SizeBox height={10} />
          </>
        )}
        {(!hasTrack || !hasRoad) && (
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
                  <TouchableOpacity onPress={() => navigation.navigate('GroupProfileScreen', { groupId })} style={{ flex: 1 }}>
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
        <TouchableOpacity
          style={Styles.accountSettingsCard}
          onPress={() => navigation.navigate('CategorySelectionScreen', { fromAddFlow: true })}
        >
          <View style={Styles.accountSettingsLeft}>
            <Add size={16} color={colors.primaryColor} variant="Linear" />
            <SizeBox width={10} />
            <Text style={Styles.accountSettingsTitle}>{t('Add')}</Text>
          </View>
        </TouchableOpacity>

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>
    </View>
  );
};

export default ManageProfiles;
