import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { assignGroupMembersToEvent, getGroupMembers, type GroupMember } from '../../services/apiGateway';

const GroupCompetitionAssignScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { apiAccessToken } = useAuth();
  const groupId = String(route?.params?.groupId || '').trim();
  const eventId = String(route?.params?.eventId || '').trim();
  const eventName = String(route?.params?.eventName || t('Competition'));

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!apiAccessToken || !groupId) return () => {};
    (async () => {
      setLoading(true);
      try {
        const resp = await getGroupMembers(apiAccessToken, groupId);
        if (!mounted) return;
        setMembers(Array.isArray(resp?.members) ? resp.members : []);
      } catch {
        if (mounted) setMembers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [apiAccessToken, groupId]);

  const athletes = useMemo(
    () => members.filter((m) => String(m.role || '').toLowerCase() === 'athlete'),
    [members],
  );

  const toggleAthlete = (profileId: string) => {
    const safe = String(profileId || '').trim();
    if (!safe) return;
    setSelectedAthleteIds((prev) => (prev.includes(safe) ? prev.filter((id) => id !== safe) : [...prev, safe]));
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundColor },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.lightGrayColor,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.btnBackgroundColor,
      borderWidth: 1,
      borderColor: colors.borderColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, color: colors.mainTextColor },
    card: {
      marginHorizontal: 20,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 12,
      backgroundColor: colors.cardBackground,
      padding: 12,
    },
    title: { fontSize: 13, color: colors.mainTextColor },
    hint: { marginTop: 4, fontSize: 11, color: colors.subTextColor },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.lightGrayColor,
    },
    rowText: { fontSize: 13, color: colors.mainTextColor },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: { backgroundColor: colors.primaryColor },
    checkboxText: { fontSize: 12, color: colors.whiteColor },
    actionButton: {
      marginTop: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primaryColor,
      backgroundColor: colors.secondaryBlueColor,
      paddingVertical: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonDisabled: { opacity: 0.45 },
    actionButtonText: { fontSize: 13, color: colors.primaryColor },
    empty: { paddingVertical: 18, alignItems: 'center' },
    emptyText: { fontSize: 12, color: colors.subTextColor },
  }), [colors]);

  return (
    <View style={styles.container}>
      <SizeBox height={insets.top} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Add athletes')}</Text>
        <View style={{ width: 44, height: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>{eventName}</Text>
          <Text style={styles.hint}>{t('Select athletes for this competition')}</Text>

          {loading ? (
            <View style={styles.empty}><ActivityIndicator size="small" color={colors.primaryColor} /></View>
          ) : athletes.length === 0 ? (
            <View style={styles.empty}><Text style={styles.emptyText}>{t('No athletes yet')}</Text></View>
          ) : (
            athletes.map((member) => {
              const profileId = String(member.profile_id || '');
              const selected = selectedAthleteIds.includes(profileId);
              return (
                <TouchableOpacity key={profileId} style={styles.row} onPress={() => toggleAthlete(profileId)}>
                  <Text style={styles.rowText}>{member.display_name || t('Member')}</Text>
                  <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                    {selected ? <Text style={styles.checkboxText}>✓</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          <TouchableOpacity
            style={[styles.actionButton, (selectedAthleteIds.length === 0 || saving) && styles.actionButtonDisabled]}
            disabled={selectedAthleteIds.length === 0 || saving}
            onPress={async () => {
              if (!apiAccessToken || !groupId || !eventId || selectedAthleteIds.length === 0 || saving) return;
              setSaving(true);
              try {
                await assignGroupMembersToEvent(apiAccessToken, groupId, eventId, { profile_ids: selectedAthleteIds });
                navigation.navigate('GroupProfileScreen', {
                  groupId,
                  tab: 'competitions',
                  refreshTs: Date.now(),
                });
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? <ActivityIndicator size="small" color={colors.primaryColor} /> : <Text style={styles.actionButtonText}>{t('Confirm')}</Text>}
          </TouchableOpacity>
        </View>

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>
    </View>
  );
};

export default GroupCompetitionAssignScreen;
