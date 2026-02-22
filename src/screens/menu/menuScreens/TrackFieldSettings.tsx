import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowDown2, ArrowLeft2 } from 'iconsax-react-nativejs';
import { useAuth } from '../../../context/AuthContext';
import { ApiError, getProfileSummary, updateProfileSummary } from '../../../services/apiGateway';
import { useTranslation } from 'react-i18next';

const TrackFieldSettings = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const Styles = createStyles(colors);
  const { apiAccessToken, userProfile, updateUserProfile } = useAuth();

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [chestByYear, setChestByYear] = useState<Record<string, string>>({});
  const [chestInput, setChestInput] = useState('');
  const [clubInput, setClubInput] = useState('');
  const [mainEventInput, setMainEventInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const yearOptions = useMemo(() => {
    const out: string[] = [];
    for (let y = currentYear; y >= 2000; y -= 1) out.push(String(y));
    return out;
  }, [currentYear]);
  const quickYears = useMemo(() => yearOptions.slice(0, 4), [yearOptions]);

  const normalizeChestByYear = useCallback((raw: any): Record<string, string> => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const out: Record<string, string> = {};
    for (const [year, chest] of Object.entries(raw as Record<string, unknown>)) {
      const safeYear = String(year ?? '').trim();
      if (!/^\d{4}$/.test(safeYear)) continue;
      const parsed = Number(chest);
      if (!Number.isInteger(parsed) || parsed < 0) continue;
      out[safeYear] = String(parsed);
    }
    return out;
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!apiAccessToken) {
        if (!active) return;
        setChestByYear(normalizeChestByYear(userProfile?.chestNumbersByYear ?? {}));
        setClubInput(String((userProfile as any)?.trackFieldClub ?? ''));
        setMainEventInput(String((userProfile as any)?.trackFieldMainEvent ?? ''));
        setWebsiteInput(String((userProfile as any)?.website ?? ''));
        setIsLoading(false);
        return;
      }
      try {
        const summary = await getProfileSummary(apiAccessToken);
        if (!active) return;
        setChestByYear(normalizeChestByYear(summary?.profile?.chest_numbers_by_year ?? {}));
        setClubInput(String(summary?.profile?.track_field_club ?? (userProfile as any)?.trackFieldClub ?? ''));
        setMainEventInput(String(summary?.profile?.track_field_main_event ?? (userProfile as any)?.trackFieldMainEvent ?? ''));
        setWebsiteInput(String(summary?.profile?.website ?? (userProfile as any)?.website ?? ''));
      } catch {
        if (!active) return;
        setChestByYear(normalizeChestByYear(userProfile?.chestNumbersByYear ?? {}));
        setWebsiteInput(String((userProfile as any)?.website ?? ''));
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [apiAccessToken, normalizeChestByYear, updateUserProfile, userProfile]);

  useEffect(() => {
    setChestInput(String(chestByYear[selectedYear] ?? ''));
  }, [chestByYear, selectedYear]);

  const handleSave = async () => {
    const normalizedChest = String(chestInput ?? '').replace(/[^0-9]/g, '').trim();
    const nextByYear = { ...chestByYear };
    if (!normalizedChest) delete nextByYear[selectedYear];
    else nextByYear[selectedYear] = normalizedChest;

    const payloadChest = Object.entries(nextByYear).reduce((acc, [year, chest]) => {
      const parsed = Number(chest);
      if (/^\d{4}$/.test(year) && Number.isInteger(parsed) && parsed >= 0) acc[year] = parsed;
      return acc;
    }, {} as Record<string, number>);

    setIsSaving(true);
    try {
      if (apiAccessToken) {
        const updated = await updateProfileSummary(apiAccessToken, {
          chest_numbers_by_year: payloadChest,
          track_field_club: String(clubInput || '').trim() || null,
          track_field_main_event: String(mainEventInput || '').trim() || null,
          website: String(websiteInput || '').trim() || null,
        });
        const stored = normalizeChestByYear(updated?.profile?.chest_numbers_by_year ?? payloadChest);
        setChestByYear(stored);
      } else {
        setChestByYear(nextByYear);
      }
      await updateUserProfile({
        chestNumbersByYear: nextByYear,
        trackFieldClub: String(clubInput || '').trim(),
        trackFieldMainEvent: String(mainEventInput || '').trim(),
        website: String(websiteInput || '').trim(),
      } as any);
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
      Alert.alert(t('Save failed'), message || t('Please try again'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={Styles.mainContainer}>
      <SizeBox height={insets.top} />
      <View style={Styles.header}>
        <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={Styles.headerTitle}>{t('trackAndField')}</Text>
        <View style={Styles.headerSpacer} />
      </View>

      <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
        <SizeBox height={24} />
        {isLoading ? (
          <ActivityIndicator color={colors.primaryColor} />
        ) : (
          <>
            <View style={Styles.addCardInputGroup}>
              <Text style={Styles.addCardLabel}>{t('year')}</Text>
              <SizeBox height={8} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {quickYears.map((year) => {
                  const active = selectedYear === year;
                  return (
                    <TouchableOpacity
                      key={`quick-year-${year}`}
                      style={{
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: active ? colors.primaryColor : colors.borderColor,
                        backgroundColor: active ? colors.secondaryBlueColor : colors.btnBackgroundColor,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                      }}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text style={{ color: active ? colors.primaryColor : colors.subTextColor, fontSize: 12 }}>{year}</Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.borderColor,
                    backgroundColor: colors.btnBackgroundColor,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                  }}
                  onPress={() => setShowYearPicker(true)}
                >
                  <Text style={{ color: colors.subTextColor, fontSize: 12 }}>{t('More years')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <SizeBox height={14} />
            <View style={Styles.addCardInputGroup}>
              <Text style={Styles.addCardLabel}>{t('chestNumber')}</Text>
              <SizeBox height={8} />
              <View style={Styles.addCardInputContainer}>
                <TextInput
                  style={Styles.addCardInput}
                  value={chestInput}
                  onChangeText={(value) => setChestInput(String(value || '').replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  placeholder={t('chestNumber')}
                  placeholderTextColor={colors.grayColor}
                />
              </View>
            </View>
            <SizeBox height={14} />
            <View style={Styles.addCardInputGroup}>
              <Text style={Styles.addCardLabel}>{t('Represented Club')}</Text>
              <SizeBox height={8} />
              <View style={Styles.addCardInputContainer}>
                <TextInput
                  style={Styles.addCardInput}
                  value={clubInput}
                  onChangeText={setClubInput}
                  placeholder={t('Represented Club')}
                  placeholderTextColor={colors.grayColor}
                />
              </View>
            </View>
            <SizeBox height={14} />
            <View style={Styles.addCardInputGroup}>
              <Text style={Styles.addCardLabel}>{t('Main event')}</Text>
              <SizeBox height={8} />
              <View style={Styles.addCardInputContainer}>
                <TextInput
                  style={Styles.addCardInput}
                  value={mainEventInput}
                  onChangeText={setMainEventInput}
                  placeholder={t('Main event')}
                  placeholderTextColor={colors.grayColor}
                />
              </View>
            </View>
            <SizeBox height={14} />
            <View style={Styles.addCardInputGroup}>
              <Text style={Styles.addCardLabel}>{t('Website')}</Text>
              <SizeBox height={8} />
              <View style={Styles.addCardInputContainer}>
                <TextInput
                  style={Styles.addCardInput}
                  value={websiteInput}
                  onChangeText={setWebsiteInput}
                  placeholder={t('Enter website link (optional)')}
                  placeholderTextColor={colors.grayColor}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            </View>
            <View style={Styles.editActionsRow}>
              <TouchableOpacity style={[Styles.saveButton, { marginLeft: 'auto' }]} onPress={handleSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator size="small" color={colors.pureWhite} /> : <Text style={Styles.saveButtonText}>{t('save')}</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}
        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>

      <Modal visible={showYearPicker} transparent animationType="fade" onRequestClose={() => setShowYearPicker(false)}>
        <View style={Styles.selectionModalOverlay}>
          <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={() => setShowYearPicker(false)} />
          <View style={Styles.selectionModalCard}>
            <Text style={Styles.selectionModalTitle}>{t('year')}</Text>
            <ScrollView>
              {yearOptions.map((year) => (
                <TouchableOpacity
                  key={`tf-year-${year}`}
                  style={Styles.selectionOption}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={Styles.selectionOptionText}>{year}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TrackFieldSettings;
