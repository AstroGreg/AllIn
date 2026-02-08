import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, Text, TextInput, TouchableOpacity, View} from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import {ArrowLeft2, ArrowRight, SearchNormal1} from 'iconsax-react-nativejs';
import KeyboardAvoidingContainer from '../../../components/KeyboardAvoidingContainer';
import {useAuth} from '../../../context/AuthContext';
import {ApiError, getAuthMe, searchMediaByBib} from '../../../services/apiGateway';
import {createStyles} from './BibSearchScreenStyles';

const BibSearchScreen = ({navigation}: any) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const {apiAccessToken} = useAuth();

  const [bib, setBib] = useState('');
  const [eventId, setEventId] = useState('');
  const [authMe, setAuthMe] = useState<any | null>(null);
  const [isLoadingMe, setIsLoadingMe] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const refreshMe = useCallback(async () => {
    if (!apiAccessToken) return;
    setIsLoadingMe(true);
    setErrorText(null);
    try {
      const me = await getAuthMe(apiAccessToken);
      setAuthMe(me);
      const ids: string[] = Array.isArray(me?.event_ids) ? me.event_ids.map(String) : [];
      if (!eventId.trim() && ids.length === 1) {
        setEventId(ids[0]);
      }
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
      setErrorText(msg);
    } finally {
      setIsLoadingMe(false);
    }
  }, [apiAccessToken, eventId]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const subscribedEventIds: string[] = useMemo(() => {
    const ids = Array.isArray(authMe?.event_ids) ? authMe.event_ids.map(String) : [];
    return Array.from(new Set(ids.map((s: string) => s.trim()).filter(Boolean)));
  }, [authMe?.event_ids]);

  const canSearch = bib.trim().length > 0 && eventId.trim().length > 0 && !isSearching;

  const runSearch = useCallback(async () => {
    if (!apiAccessToken) {
      Alert.alert('Missing API token', 'Log in or set a Dev API token to use BIB Search.');
      return;
    }

    const safeBib = bib.trim();
    const safeEventId = eventId.trim();
    if (!safeBib || !safeEventId) {
      Alert.alert('Missing info', 'Please enter a BIB number and an event id.');
      return;
    }

    setIsSearching(true);
    setErrorText(null);
    try {
      const res = await searchMediaByBib(apiAccessToken, {event_id: safeEventId, bib: safeBib});
      const results = Array.isArray(res?.results) ? res.results : [];

      navigation.navigate('AISearchResultsScreen', {
        matchedCount: results.length,
        results: results.map(r => ({...r, event_id: safeEventId})),
        matchType: 'bib',
      });
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 402) {
        setErrorText('Insufficient AI tokens to run this search.');
        return;
      }
      const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
      setErrorText(msg);
    } finally {
      setIsSearching(false);
    }
  }, [apiAccessToken, bib, eventId, navigation]);

  return (
    <View style={styles.mainContainer}>
      <SizeBox height={insets.top} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BIB</Text>
        <View style={{width: 44, height: 44}} />
      </View>

      <KeyboardAvoidingContainer>
        <View style={styles.container}>
          <SizeBox height={18} />
          <Text style={styles.title}>Find your photos by BIB number</Text>
          <SizeBox height={6} />
          <Text style={styles.subtitle}>
            Enter the BIB number that was on your chest. Choose the event you participated in.
          </Text>

          <SizeBox height={22} />

          <Text style={styles.inputLabel}>BIB number</Text>
          <View style={styles.inputContainer}>
            <SearchNormal1 size={20} color={colors.grayColor} variant="Linear" />
            <SizeBox width={10} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 1234"
              placeholderTextColor={colors.grayColor}
              value={bib}
              onChangeText={setBib}
              keyboardType="number-pad"
              returnKeyType="next"
            />
          </View>

          <SizeBox height={18} />

          <Text style={styles.inputLabel}>Event id</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={isLoadingMe ? 'Loading your events…' : 'Paste an event UUID'}
              placeholderTextColor={colors.grayColor}
              value={eventId}
              onChangeText={setEventId}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={runSearch}
            />
          </View>

          {subscribedEventIds.length > 0 && (
            <>
              <SizeBox height={14} />
              <View style={styles.card}>
                <Text style={styles.subtitle}>Your subscribed events (tap to select)</Text>
                <View style={styles.chipRow}>
                  {subscribedEventIds.slice(0, 12).map(id => {
                    const isActive = id === eventId.trim();
                    return (
                      <TouchableOpacity
                        key={id}
                        onPress={() => setEventId(id)}
                        style={[styles.chip, isActive && styles.chipActive]}
                        activeOpacity={0.85}>
                        <Text style={styles.chipText}>{id.slice(0, 8)}…</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}

          <SizeBox height={22} />

          <TouchableOpacity
            style={[styles.primaryButton, !canSearch && styles.primaryButtonDisabled]}
            onPress={runSearch}
            disabled={!canSearch}>
            <Text style={styles.primaryButtonText}>{isSearching ? 'Searching…' : 'Search'}</Text>
            <ArrowRight size={22} color={colors.pureWhite} variant="Linear" />
          </TouchableOpacity>

          <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
        </View>
      </KeyboardAvoidingContainer>
    </View>
  );
};

export default BibSearchScreen;
