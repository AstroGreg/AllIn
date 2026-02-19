import React, {useState} from 'react';
import {Alert, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft2} from 'iconsax-react-nativejs';
import SizeBox from '../../../constants/SizeBox';
import {useTheme} from '../../../context/ThemeContext';
import {useAuth} from '../../../context/AuthContext';
import KeyboardAvoidingContainer from '../../../components/KeyboardAvoidingContainer';
import { useTranslation } from 'react-i18next'

const DevApiTokenScreen = ({navigation}: any) => {
    const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const {devApiToken, setDevApiToken, clearDevApiToken} = useAuth();

  const [tokenInput, setTokenInput] = useState(devApiToken ?? '');

  return (
    <View style={{flex: 1, backgroundColor: colors.backgroundColor}}>
      <SizeBox height={insets.top} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.lightGrayColor,
        }}>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.btnBackgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={{color: colors.mainTextColor, fontSize: 18, fontWeight: '600'}}>
          {t('Dev API Token')}
        </Text>
        <View style={{width: 44}} />
      </View>

      <KeyboardAvoidingContainer>
        <View style={{padding: 20, flex: 1}}>
        <Text style={{color: colors.mainTextColor, fontWeight: '600', marginBottom: 8}}>
          {t('Paste Bearer token')}
        </Text>
        <TextInput
          style={{
            minHeight: 120,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            borderRadius: 10,
            padding: 12,
            color: colors.mainTextColor,
            backgroundColor: colors.cardBackground,
          }}
          value={tokenInput}
          onChangeText={setTokenInput}
          placeholder={t('Paste token here')}
          placeholderTextColor={colors.grayColor}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />

        <SizeBox height={16} />

        <TouchableOpacity
          style={{
            height: 54,
            borderRadius: 10,
            backgroundColor: colors.primaryColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={async () => {
            const tokenValue = tokenInput.trim();
            if (!tokenValue) {
              Alert.alert(t('Missing token'), t('Paste a token first.'));
              return;
            }
            await setDevApiToken(tokenValue);
            Alert.alert(t('Saved'), t('Dev API token saved. Face Search will use it immediately.'));
          }}>
          <Text style={{color: '#fff', fontWeight: '600'}}>{t('Save Token')}</Text>
        </TouchableOpacity>

        <SizeBox height={12} />

        <TouchableOpacity
          style={{
            height: 54,
            borderRadius: 10,
            backgroundColor: colors.btnBackgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
          }}
          onPress={() => {
            Alert.alert(t('Clear token'), t('Remove the dev token override?'), [
              {text: t('Cancel'), style: 'cancel'},
              {
                text: t('Clear'),
                style: 'destructive',
                onPress: async () => {
                  await clearDevApiToken();
                  setTokenInput('');
                },
              },
            ]);
          }}>
          <Text style={{color: colors.mainTextColor, fontWeight: '600'}}>{t('Clear Token')}</Text>
        </TouchableOpacity>

        <SizeBox height={16} />
        <Text style={{color: colors.grayColor}}>
          {t("Note: this is for development only. Don't ship with real tokens stored on-device.")}
        </Text>
        <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
        </View>
      </KeyboardAvoidingContainer>
    </View>
  );
};

export default DevApiTokenScreen;
