import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft2, Trash} from 'iconsax-react-nativejs';
import {useTheme} from '../../context/ThemeContext';
import {useTranslation} from 'react-i18next';
import SizeBox from '../../constants/SizeBox';
import {createStyles} from './UploadActivityScreenStyles';
import {listUploadSessions, removeUploadSession, type UploadSession} from '../../services/uploadSessions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const UploadActivityScreen = ({navigation}: any) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const {t} = useTranslation();

  const [sessions, setSessions] = useState<UploadSession[]>([]);

  const load = useCallback(async () => {
    const data = await listUploadSessions();
    setSessions(data);
  }, []);

  useEffect(() => {
    load();
    const tmr = setInterval(load, 2500);
    return () => clearInterval(tmr);
  }, [load]);

  const open = useCallback(
    (s: UploadSession) => {
      navigation.navigate('UploadProgressScreen', {
        competition: {id: s.competitionId},
        anonymous: s.anonymous,
        watermarkText: s.watermarkText ?? '',
        sessionId: s.id,
        autoStart: false,
      });
    },
    [navigation],
  );

  const labelFor = useCallback(
    (s: UploadSession) => {
      if (s.phase === 'processing') return t('Processing');
      if (s.phase === 'done') return t('Done');
      if (s.phase === 'failed') return t('Failed');
      return t('Starting upload');
    },
    [t],
  );

  const progressFor = useCallback((s: UploadSession) => {
    if (s.phase === 'processing') {
      const denom = Math.max(1, Number(s.processing_total ?? 0));
      return Math.min(1, Number(s.processing_ready ?? 0) / denom);
    }
    const denom = Math.max(1, Number(s.total ?? 0));
    return Math.min(1, Number(s.uploaded ?? 0) / denom);
  }, []);

  const metaFor = useCallback(
    (s: UploadSession) => {
      if (s.phase === 'processing') return `${s.processing_ready ?? 0}/${s.processing_total ?? 0} ${t('ready')}`;
      return `${s.uploaded ?? 0}/${s.total ?? 0} ${t('uploaded')}`;
    },
    [t],
  );

  const headerRight = useMemo(() => {
    const anyDone = sessions.some((s) => s.phase === 'done' || s.phase === 'failed');
    if (!anyDone) return <View style={styles.headerBtn} />;
    return (
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={async () => {
          const done = sessions.filter((s) => s.phase === 'done' || s.phase === 'failed');
          for (const s of done) {
            await removeUploadSession(s.id);
          }
          load();
        }}
        activeOpacity={0.8}
      >
        <Trash size={20} color={colors.primaryColor} variant="Linear" />
      </TouchableOpacity>
    );
  }, [colors.primaryColor, load, sessions, styles.headerBtn]);

  return (
    <View style={styles.mainContainer}>
      <SizeBox height={insets.top} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Upload activity')}</Text>
        {headerRight}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 24}]}>
        <TouchableOpacity
          style={[styles.card, {marginBottom: 16}]}
          activeOpacity={0.9}
          onPress={() => {
            Alert.alert(
              t('Reset local upload data?'),
              t('This clears upload drafts, upload sessions, and cached local upload files on this device.'),
              [
                {text: t('Cancel'), style: 'cancel'},
                {
                  text: t('Reset'),
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const keys = await AsyncStorage.getAllKeys();
                      const toRemove = keys.filter((k) =>
                        k.startsWith('@upload_assets_') ||
                        k.startsWith('@upload_counts_') ||
                        k.startsWith('@upload_session_') ||
                        k.startsWith('@upload_activity_') ||
                        k === '@upload_sessions_v1',
                      );
                      if (toRemove.length > 0) await AsyncStorage.multiRemove(toRemove);
                    } catch {}
                    try {
                      const dir = `${RNFS.DocumentDirectoryPath}/allin_uploads`;
                      const exists = await RNFS.exists(dir);
                      if (exists) {
                        await RNFS.unlink(dir);
                      }
                    } catch {}
                    load();
                  },
                },
              ],
            );
          }}
        >
          <Text style={styles.title}>{t('Reset')}</Text>
          <Text style={styles.meta}>{t('Clear cached upload drafts and sessions')}</Text>
        </TouchableOpacity>

        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>{t('No uploads yet.')}</Text>
        ) : null}

        {sessions.map((s) => {
          const p = progressFor(s);
          return (
            <TouchableOpacity key={s.id} style={styles.card} activeOpacity={0.85} onPress={() => open(s)}>
              <View style={styles.rowTop}>
                <View style={{flex: 1, paddingRight: 12}}>
                  <Text style={styles.title} numberOfLines={1}>
                    {t('Upload')} • {String(s.competitionId).slice(0, 8)}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {metaFor(s)}
                  </Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{labelFor(s)}</Text>
                </View>
              </View>

              <View style={styles.barTrack}>
                <View style={[styles.barFill, {width: `${Math.round(p * 100)}%`}]} />
              </View>

              <View style={styles.actionsRow}>
                <Text style={styles.meta}>{new Date(s.updatedAt).toLocaleString()}</Text>
                <TouchableOpacity
                  onPress={async () => {
                    await removeUploadSession(s.id);
                    load();
                  }}
                >
                  <Text style={styles.actionText}>{t('Delete')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default UploadActivityScreen;
