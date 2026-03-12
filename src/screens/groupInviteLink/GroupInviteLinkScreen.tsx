import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft2, TickCircle} from 'iconsax-react-nativejs';
import {useTranslation} from 'react-i18next';
import SizeBox from '../../constants/SizeBox';
import {useTheme} from '../../context/ThemeContext';
import {useAuth} from '../../context/AuthContext';
import {
  ApiError,
  getGroupInviteLink,
  redeemGroupInviteLink,
  type GroupInviteLink,
} from '../../services/apiGateway';

const GroupInviteLinkScreen = ({navigation, route}: any) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const {t} = useTranslation();
  const {apiAccessToken} = useAuth();
  const token = String(route?.params?.token || '').trim();

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [invite, setInvite] = useState<GroupInviteLink | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.backgroundColor,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.borderColor,
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
        headerTitle: {
          fontSize: 18,
          color: colors.mainTextColor,
          fontWeight: '600',
        },
        hero: {
          paddingHorizontal: 20,
          paddingTop: 22,
          paddingBottom: 10,
        },
        card: {
          marginHorizontal: 20,
          marginTop: 14,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.borderColor,
          backgroundColor: colors.cardBackground,
          padding: 18,
          gap: 10,
        },
        groupName: {
          fontSize: 24,
          fontWeight: '700',
          color: colors.mainTextColor,
        },
        meta: {
          fontSize: 14,
          color: colors.subTextColor,
        },
        badgeRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        },
        badge: {
          borderRadius: 999,
          borderWidth: 1,
          borderColor: colors.primaryColor,
          backgroundColor: colors.secondaryBlueColor,
          paddingHorizontal: 10,
          paddingVertical: 6,
        },
        badgeText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.primaryColor,
        },
        bodyText: {
          fontSize: 14,
          lineHeight: 21,
          color: colors.mainTextColor,
        },
        footer: {
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 20) + 16,
          paddingTop: 18,
          gap: 12,
        },
        primaryButton: {
          height: 52,
          borderRadius: 14,
          backgroundColor: colors.primaryColor,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: joining ? 0.7 : 1,
        },
        secondaryButton: {
          height: 52,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.borderColor,
          backgroundColor: colors.btnBackgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
        },
        buttonText: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.pureWhite,
        },
        secondaryButtonText: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.mainTextColor,
        },
        centeredState: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        },
        stateTitle: {
          fontSize: 20,
          fontWeight: '700',
          color: colors.mainTextColor,
          textAlign: 'center',
        },
        stateMessage: {
          marginTop: 10,
          fontSize: 14,
          lineHeight: 21,
          color: colors.subTextColor,
          textAlign: 'center',
        },
      }),
    [colors, insets.bottom, joining],
  );

  const loadInvite = useCallback(async () => {
    if (!token) {
      setErrorMessage(t('Invalid invitation link'));
      setInvite(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const resp = await getGroupInviteLink(token);
      setInvite(resp?.invite_link ?? null);
    } catch (error: any) {
      const message = error instanceof ApiError ? error.message : String(error?.message ?? error);
      setInvite(null);
      setErrorMessage(message || t('Unable to open invitation link.'));
    } finally {
      setLoading(false);
    }
  }, [t, token]);

  useEffect(() => {
    loadInvite();
  }, [loadInvite]);

  const openGroup = useCallback(
    (groupId: string) => {
      const safeGroupId = String(groupId || '').trim();
      if (!safeGroupId) return;
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'BottomTabBar',
            params: {
              screen: 'Profile',
              params: {
                screen: 'GroupProfileScreen',
                params: {
                  groupId: safeGroupId,
                  showBackButton: true,
                  origin: 'invite-link',
                },
              },
            },
          },
        ],
      });
    },
    [navigation],
  );

  const handleRedeem = useCallback(async () => {
    if (!token) return;
    if (!apiAccessToken) {
      navigation.navigate('LoginScreen');
      return;
    }
    setJoining(true);
    try {
      const resp = await redeemGroupInviteLink(apiAccessToken, token);
      openGroup(resp.group_id);
    } catch (error: any) {
      const message = error instanceof ApiError ? error.message : String(error?.message ?? error);
      Alert.alert(t('Join failed'), message || t('Unable to join this group right now.'));
    } finally {
      setJoining(false);
    }
  }, [apiAccessToken, navigation, openGroup, t, token]);

  const status = String(invite?.status || '').trim().toLowerCase();
  const inviteRoles = Array.isArray(invite?.public_roles) ? invite!.public_roles!.map(role => String(role || '').trim()).filter(Boolean) : [];
  const canJoin = status === 'active';

  return (
    <View style={styles.container}>
      <SizeBox height={insets.top} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Join group')}</Text>
        <View style={{width: 44, height: 44}} />
      </View>

      {loading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="small" color={colors.primaryColor} />
          <Text style={styles.stateMessage}>{t('Loading invitation...')}</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centeredState}>
          <Text style={styles.stateTitle}>{t('Invitation unavailable')}</Text>
          <Text style={styles.stateMessage}>{errorMessage}</Text>
          <TouchableOpacity style={[styles.secondaryButton, {marginTop: 18, width: '100%'}]} onPress={loadInvite}>
            <Text style={styles.secondaryButtonText}>{t('Try again')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.hero}>
            <Text style={styles.stateTitle}>{t('Group invitation')}</Text>
            <Text style={styles.stateMessage}>
              {t('This link lets you join the shared group directly in the app.')}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.groupName}>{invite?.group_name || t('Group')}</Text>
            {invite?.group_location ? <Text style={styles.meta}>{invite.group_location}</Text> : null}
            {invite?.group_bio ? <Text style={styles.bodyText}>{invite.group_bio}</Text> : null}
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {invite?.permission_role === 'admin' ? t('Admin access') : t('Member access')}
                </Text>
              </View>
              {inviteRoles.map((role) => (
                <View key={role} style={styles.badge}>
                  <Text style={styles.badgeText}>{t(role === 'athlete' ? 'Athlete' : role === 'coach' ? 'Coach' : role === 'physio' ? 'Physio' : role)}</Text>
                </View>
              ))}
              {status ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{t(status === 'active' ? 'Active link' : status === 'expired' ? 'Expired link' : status === 'revoked' ? 'Revoked link' : 'Used link')}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.footer}>
            {apiAccessToken ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRedeem}
                disabled={!canJoin || joining}>
                {joining ? (
                  <ActivityIndicator size="small" color={colors.pureWhite} />
                ) : (
                  <Text style={styles.buttonText}>{t('Join this group')}</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={styles.buttonText}>{t('Sign in to join')}</Text>
              </TouchableOpacity>
            )}

            {invite?.group_id ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={() => openGroup(String(invite.group_id))}>
                <Text style={styles.secondaryButtonText}>{t('Open group')}</Text>
              </TouchableOpacity>
            ) : null}
            {canJoin && apiAccessToken ? (
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                <TickCircle size={18} color={colors.primaryColor} variant="Bold" />
                <Text style={styles.meta}>{t('You can join directly from this screen.')}</Text>
              </View>
            ) : null}
          </View>
        </>
      )}
    </View>
  );
};

export default GroupInviteLinkScreen;
