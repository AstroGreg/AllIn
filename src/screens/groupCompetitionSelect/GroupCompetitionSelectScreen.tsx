import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, SearchNormal1 } from 'iconsax-react-nativejs';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { searchEvents, type SubscribedEvent } from '../../services/apiGateway';

const GroupCompetitionSelectScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { apiAccessToken } = useAuth();
  const groupId = String(route?.params?.groupId || '').trim();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<SubscribedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!apiAccessToken) return () => {};
    const timer = setTimeout(async () => {
      const trimmed = query.trim();
      if (!trimmed) {
        if (mounted) {
          setEvents([]);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const resp = await searchEvents(apiAccessToken, { q: trimmed, limit: 30 });
        if (!mounted) return;
        setEvents(Array.isArray(resp?.events) ? resp.events : []);
      } catch {
        if (mounted) setEvents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }, 250);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [apiAccessToken, query]);

  const selectedEvent = useMemo(
    () => events.find((event) => String(event.event_id || '') === String(selectedEventId || '')),
    [events, selectedEventId],
  );

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
    title: { fontSize: 13, color: colors.mainTextColor, marginBottom: 8 },
    searchInputWrap: {
      height: 44,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      backgroundColor: colors.cardBackground,
    },
    searchInput: { flex: 1, fontSize: 13, color: colors.mainTextColor, marginLeft: 8 },
    eventRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.lightGrayColor,
    },
    eventTitle: { fontSize: 13, color: colors.mainTextColor },
    eventMeta: { marginTop: 2, fontSize: 11, color: colors.subTextColor },
    badge: {
      borderWidth: 1,
      borderColor: colors.primaryColor,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: colors.secondaryBlueColor,
    },
    badgeText: { fontSize: 11, color: colors.primaryColor },
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
        <Text style={styles.headerTitle}>{t('Select competition')}</Text>
        <View style={{ width: 44, height: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('Choose one competition')}</Text>
          <View style={styles.searchInputWrap}>
            <SearchNormal1 size={18} color={colors.primaryColor} variant="Linear" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('Search competitions')}
              placeholderTextColor={colors.subTextColor}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {!query.trim() ? (
            <View style={styles.empty}><Text style={styles.emptyText}>{t('Type to search competitions')}</Text></View>
          ) : loading ? (
            <View style={styles.empty}><ActivityIndicator size="small" color={colors.primaryColor} /></View>
          ) : events.length === 0 ? (
            <View style={styles.empty}><Text style={styles.emptyText}>{t('No competitions found')}</Text></View>
          ) : (
            events.map((event) => {
              const eventId = String(event.event_id || '');
              const selected = selectedEventId === eventId;
              const eventName = String(event.event_name || event.event_title || t('Competition'));
              const eventMeta = [event.event_location, event.event_date].filter(Boolean).join(' · ');
              return (
                <TouchableOpacity key={eventId} style={styles.eventRow} onPress={() => setSelectedEventId(eventId)}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.eventTitle}>{eventName}</Text>
                    {eventMeta ? <Text style={styles.eventMeta}>{eventMeta}</Text> : null}
                  </View>
                  <View style={styles.badge}><Text style={styles.badgeText}>{selected ? t('Selected') : t('Select')}</Text></View>
                </TouchableOpacity>
              );
            })
          )}

          <TouchableOpacity
            style={[styles.actionButton, !selectedEvent && styles.actionButtonDisabled]}
            disabled={!selectedEvent}
            onPress={() => {
              if (!selectedEvent) return;
              navigation.navigate('GroupCompetitionAssignScreen', {
                groupId,
                eventId: String(selectedEvent.event_id || ''),
                eventName: String(selectedEvent.event_name || selectedEvent.event_title || t('Competition')),
              });
            }}
          >
            <Text style={styles.actionButtonText}>{t('Continue')}</Text>
          </TouchableOpacity>
        </View>

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>
    </View>
  );
};

export default GroupCompetitionSelectScreen;
