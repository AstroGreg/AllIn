import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { useAuth } from '../../../context/AuthContext';
import { ApiError, getProfileSummary, updateProfileSummary } from '../../../services/apiGateway';
import { useTranslation } from 'react-i18next';

const RoadTrailSettings = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const Styles = createStyles(colors);
  const { apiAccessToken, userProfile, updateUserProfile } = useAuth();

  const [mainEventInput, setMainEventInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!apiAccessToken) {
        if (!active) return;
        setMainEventInput(String((userProfile as any)?.roadTrailMainEvent ?? ''));
        setWebsiteInput(String((userProfile as any)?.website ?? ''));
        setIsLoading(false);
        return;
      }
      try {
        const summary = await getProfileSummary(apiAccessToken);
        if (!active) return;
        setMainEventInput(String(summary?.profile?.road_trail_main_event ?? (userProfile as any)?.roadTrailMainEvent ?? ''));
        setWebsiteInput(String(summary?.profile?.website ?? (userProfile as any)?.website ?? ''));
      } catch {
        if (!active) return;
        setMainEventInput(String((userProfile as any)?.roadTrailMainEvent ?? ''));
        setWebsiteInput(String((userProfile as any)?.website ?? ''));
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [apiAccessToken, userProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const value = String(mainEventInput || '').trim() || null;
      const website = String(websiteInput || '').trim() || null;
      if (apiAccessToken) {
        await updateProfileSummary(apiAccessToken, { road_trail_main_event: value, website });
      }
      await updateUserProfile({
        roadTrailMainEvent: String(mainEventInput || '').trim(),
        website: String(websiteInput || '').trim(),
      } as any);
      navigation.goBack();
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
        <Text style={Styles.headerTitle}>{t('roadAndTrail')}</Text>
        <View style={Styles.headerSpacer} />
      </View>
      <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
        <SizeBox height={24} />
        {isLoading ? (
          <ActivityIndicator color={colors.primaryColor} />
        ) : (
          <>
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
                  autoCorrect={false}
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
    </View>
  );
};

export default RoadTrailSettings;
