import React, {useState} from 'react';
import {Alert, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft2} from 'iconsax-react-nativejs';
import SizeBox from '../../../constants/SizeBox';
import {useTheme} from '../../../context/ThemeContext';
import {useAuth} from '../../../context/AuthContext';
import KeyboardAvoidingContainer from '../../../components/KeyboardAvoidingContainer';
import { useTranslation } from 'react-i18next'

const DEFAULT_DEV_API_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpNLTc5M0NEdVB3RTR2dUxfaEJnbCJ9.eyJwcm9maWxlX2lkIjoiOWYzYzFkN2UtOGEyYi00YzlkLWJmNzItMWM1YjlhOGE2ZTIxIiwiaXNzIjoiaHR0cHM6Ly9kZXYtbGZ6azBuODF6anAwYzN4My51cy5hdXRoMC5jb20vIiwic3ViIjoiS3ZXMWJ3U1hMUVZ0a2swM0QyTjFBSE5oNVAwQ3pHTnhAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbXlqb3VybmV5LmNvZmZlZS9tYWluX2FwaS8iLCJpYXQiOjE3NzE0MjYyNDgsImV4cCI6MTc3MTUxMjY0OCwic2NvcGUiOiJyZWFkOnVzZXJzIHdyaXRlOm1lZGlhIGxpc3Q6bWVkaWEgc2VhcmNoOm1lZGlhIGFjY2VzczphaSBkZWxldGU6bWVkaWEiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJLdlcxYndTWExRVnRrazAzRDJOMUFITmg1UDBDekdOeCIsInBlcm1pc3Npb25zIjpbInJlYWQ6dXNlcnMiLCJ3cml0ZTptZWRpYSIsImxpc3Q6bWVkaWEiLCJzZWFyY2g6bWVkaWEiLCJhY2Nlc3M6YWkiLCJkZWxldGU6bWVkaWEiXX0.BwTIq80nrOAtTURMBiFhx_uSIy1ebBpYe_TiUZpEpdWh8Cb7v5Zo-p3GV-LG8FDjJcOsKT6midWy_U34qudTga0L8x20m5l6tIw6JLu1u3fQAHDw8zykJbu0aZp8P2UkgQdecI6I60Q0BkhTICpD6j4u8ndvOSOlVVsGambx3O0DjKAJ31fzjXHBXCm2FJmeoADGjVXb-lqgcpLwd1hGS7oUkKBdpNAw_9enZhCnv1XkLbybvs99n_Z3vShVO75OjxQ3XcT9B6mckYLrzR1pAxCvvwd9jsbvtRjFqn4zHMdv1jXCKAegXl22-I7RR_uyHSMyPQm4kHG9zuXKu12w6g';

const DevApiTokenScreen = ({navigation}: any) => {
    const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const {devApiToken, setDevApiToken, clearDevApiToken} = useAuth();

  const [tokenInput, setTokenInput] = useState(devApiToken ?? DEFAULT_DEV_API_TOKEN);

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
          placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
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
          Note: this is for development only. Don’t ship with real tokens stored on-device.
        </Text>
        <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
        </View>
      </KeyboardAvoidingContainer>
    </View>
  );
};

export default DevApiTokenScreen;
