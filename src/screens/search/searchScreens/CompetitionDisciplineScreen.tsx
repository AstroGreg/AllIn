import React, {useMemo, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import {ArrowLeft2} from 'iconsax-react-nativejs';
import {createStyles} from './CompetitionDisciplineScreenStyles';
import { useTranslation } from 'react-i18next'
import { SUBSCRIPTION_CATEGORY_OPTIONS, type SubscriptionCategoryLabel } from '../../../utils/eventSubscription';

const EventDivisionScreen = ({navigation, route}: any) => {
    const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);

  const eventName = route?.params?.eventName || 'Event';
  const competitionName = route?.params?.competitionName || '';
  const eventId = route?.params?.eventId;
  const competitionId = route?.params?.competitionId;
  const disciplineId = route?.params?.disciplineId;
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<SubscriptionCategoryLabel>('All');

  const subtitle = useMemo(() => {
    const parts = [competitionName].filter(Boolean);
    return parts.length ? parts.join(' • ') : 'Select a category';
  }, [competitionName]);

  const handleOpenVideos = () => {
    navigation.navigate('VideosForEvent', {
      eventName,
      eventId,
      competitionId: competitionId ?? eventId,
      disciplineId,
      categoryLabel: selectedCategoryLabel,
      categoryLabels: [selectedCategoryLabel],
    });
  };

  const handleOpenPhotos = () => {
    navigation.navigate('AllPhotosOfEvents', {
      eventName,
      eventId,
      competitionId: competitionId ?? eventId,
      disciplineId,
      categoryLabel: selectedCategoryLabel,
      categoryLabels: [selectedCategoryLabel],
    });
  };

  return (
    <View style={styles.mainContainer}>
      <SizeBox height={insets.top} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{eventName}</Text>
        <View style={{width: 44, height: 44}} />
      </View>

      <View style={styles.container}>
        <SizeBox height={18} />
        <Text style={styles.title}>{t('Choose category')}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <SizeBox height={20} />
        <Text style={styles.sectionTitle}>{t('Category')}</Text>
        <View style={styles.chipRow}>
          {SUBSCRIPTION_CATEGORY_OPTIONS.map((item) => {
            const active = item === selectedCategoryLabel;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCategoryLabel(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item === 'All' ? t('All') : t(item)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenVideos}>
            <Text style={styles.primaryButtonText}>{t('See videos')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenPhotos}>
            <Text style={styles.secondaryButtonText}>{t('See photos')}</Text>
          </TouchableOpacity>
        </View>

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </View>
    </View>
  );
};

export default EventDivisionScreen;
