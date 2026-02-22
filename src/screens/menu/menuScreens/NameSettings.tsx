import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import React, { useMemo, useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, User } from 'iconsax-react-nativejs';
import { useAuth } from '../../../context/AuthContext';
import { updateProfileSummary } from '../../../services/apiGateway';
import { useTranslation } from 'react-i18next';

const NameSettings = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const Styles = createStyles(colors);
  const { t } = useTranslation();
  const { apiAccessToken, userProfile, updateUserProfile } = useAuth();

  const [firstName, setFirstName] = useState(String(userProfile?.firstName ?? ''));
  const [lastName, setLastName] = useState(String(userProfile?.lastName ?? ''));
  const [isSaving, setIsSaving] = useState(false);

  const canSave = useMemo(
    () => !isSaving && (firstName.trim().length > 0 || lastName.trim().length > 0),
    [firstName, isSaving, lastName],
  );

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();
      const displayName = `${trimmedFirst} ${trimmedLast}`.trim();
      await updateUserProfile({ firstName: trimmedFirst, lastName: trimmedLast });
      if (apiAccessToken && displayName.length > 0) {
        await updateProfileSummary(apiAccessToken, { display_name: displayName });
      }
      navigation.goBack();
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
        <Text style={Styles.headerTitle}>{t('Name')}</Text>
        <View style={Styles.headerSpacer} />
      </View>

      <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
        <SizeBox height={24} />
        <View style={Styles.addCardInputGroup}>
          <Text style={Styles.addCardLabel}>{t('First name')}</Text>
          <SizeBox height={8} />
          <View style={Styles.addCardInputContainer}>
            <User size={16} color={colors.primaryColor} variant="Linear" />
            <SizeBox width={10} />
            <TextInput
              style={Styles.addCardInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('First name')}
              placeholderTextColor={colors.grayColor}
            />
          </View>
        </View>
        <SizeBox height={14} />
        <View style={Styles.addCardInputGroup}>
          <Text style={Styles.addCardLabel}>{t('Last name')}</Text>
          <SizeBox height={8} />
          <View style={Styles.addCardInputContainer}>
            <User size={16} color={colors.primaryColor} variant="Linear" />
            <SizeBox width={10} />
            <TextInput
              style={Styles.addCardInput}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('Last name')}
              placeholderTextColor={colors.grayColor}
            />
          </View>
        </View>
        <View style={Styles.editActionsRow}>
          <TouchableOpacity style={Styles.cancelButton} onPress={() => navigation.goBack()} disabled={isSaving}>
            <Text style={Styles.cancelButtonText}>{t('Cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[Styles.saveButton, !canSave && { opacity: 0.6 }]} disabled={!canSave} onPress={handleSave}>
            {isSaving ? <ActivityIndicator size="small" color={colors.pureWhite} /> : <Text style={Styles.saveButtonText}>{t('save')}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default NameSettings;
