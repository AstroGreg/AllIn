import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react-nativejs';

import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import SportFocusIcon from '../../../components/profile/SportFocusIcon';
import {
  getDisciplineLabel,
  getMainDisciplineForFocus,
  getSportFocusLabel,
  normalizeMainDisciplines,
  normalizeSelectedEvents,
} from '../../../utils/profileSelections';

const AthleteDetailsHub = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const Styles = createStyles(colors);
  const { userProfile } = useAuth();

  const selectedFocuses = useMemo(
    () => normalizeSelectedEvents(userProfile?.selectedEvents ?? []),
    [userProfile?.selectedEvents],
  );
  const mainDisciplines = useMemo(
    () => normalizeMainDisciplines((userProfile as any)?.mainDisciplines ?? {}, {
      trackFieldMainEvent: (userProfile as any)?.trackFieldMainEvent ?? null,
      roadTrailMainEvent: (userProfile as any)?.roadTrailMainEvent ?? null,
    }),
    [userProfile],
  );

  return (
    <View style={Styles.mainContainer}>
      <SizeBox height={insets.top} />
      <View style={Styles.header}>
        <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={Styles.headerTitle}>{t('Athlete details')}</Text>
        <View style={Styles.headerSpacer} />
      </View>

      <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
        <SizeBox height={24} />
        <Text style={Styles.inlineHelperText}>
          {t('Choose the athlete focus you want to edit. Each focus keeps its own settings screen.')}
        </Text>
        <SizeBox height={18} />

        {selectedFocuses.map((focusId) => {
          const mainDiscipline = getMainDisciplineForFocus(mainDisciplines, focusId, {
            trackFieldMainEvent: (userProfile as any)?.trackFieldMainEvent ?? null,
            roadTrailMainEvent: (userProfile as any)?.roadTrailMainEvent ?? null,
          });
          const subtitle = mainDiscipline
            ? getDisciplineLabel(focusId, mainDiscipline, t)
            : t('No main discipline set yet');

          return (
            <React.Fragment key={focusId}>
              <TouchableOpacity
                style={Styles.accountSettingsCard}
                onPress={() => navigation.navigate('TrackFieldSettings', { focusId })}
              >
                <View style={Styles.accountSettingsLeft}>
                  <View style={Styles.accountSettingsIconContainer}>
                    <SportFocusIcon focusId={focusId} size={22} color={colors.primaryColor} />
                  </View>
                  <SizeBox width={20} />
                    <View style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                      <Text style={Styles.accountSettingsTitle} numberOfLines={1}>{getSportFocusLabel(focusId, t)}</Text>
                      <Text style={[Styles.inlineHelperText, { marginTop: 2, marginLeft: 0 }]} numberOfLines={2}>{subtitle}</Text>
                  </View>
                </View>
                <View style={Styles.accountSettingsArrowWrap}>
                  <ArrowRight2 size={22} color={colors.grayColor} variant="Linear" />
                </View>
              </TouchableOpacity>
              <SizeBox height={16} />
            </React.Fragment>
          );
        })}

        {selectedFocuses.length === 0 ? (
          <>
            <Text style={Styles.inlineHelperText}>{t('Add an athlete focus first to edit athlete details.')}</Text>
            <SizeBox height={16} />
          </>
        ) : null}

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>
    </View>
  );
};

export default AthleteDetailsHub;
