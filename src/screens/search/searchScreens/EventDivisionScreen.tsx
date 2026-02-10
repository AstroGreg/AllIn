import React, {useMemo, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import {ArrowLeft2} from 'iconsax-react-nativejs';
import {createStyles} from './EventDivisionScreenStyles';

const AGE_GROUPS = [
  'Pupil',
  'Miniem',
  'Cadet',
  'Scholier',
  'Junior',
  'Beloften',
  'Seniors',
  'Masters',
];

const GENDERS = ['Men', 'Women', 'Mixed'];

const EventDivisionScreen = ({navigation, route}: any) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);

  const eventName = route?.params?.eventName || 'Event';
  const competitionName = route?.params?.competitionName || '';
  const defaultMode = route?.params?.mode || 'video';

  const [selectedAge, setSelectedAge] = useState(AGE_GROUPS[0]);
  const [selectedGender, setSelectedGender] = useState(GENDERS[0]);

  const subtitle = useMemo(() => {
    const parts = [competitionName].filter(Boolean);
    return parts.length ? parts.join(' • ') : 'Select a category and gender';
  }, [competitionName]);

  const handleOpenVideos = () => {
    navigation.navigate('VideosForEvent', {
      eventName,
      division: selectedAge,
      gender: selectedGender,
    });
  };

  const handleOpenPhotos = () => {
    navigation.navigate('AllPhotosOfEvents', {
      eventName,
      division: selectedAge,
      gender: selectedGender,
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
        <Text style={styles.title}>Choose category</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <SizeBox height={20} />
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.chipRow}>
          {AGE_GROUPS.map((item) => {
            const active = item === selectedAge;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedAge(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <SizeBox height={20} />
        <Text style={styles.sectionTitle}>Gender</Text>
        <View style={styles.chipRow}>
          {GENDERS.map((item) => {
            const active = item === selectedGender;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedGender(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenVideos}>
            <Text style={styles.primaryButtonText}>See videos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenPhotos}>
            <Text style={styles.secondaryButtonText}>See photos</Text>
          </TouchableOpacity>
        </View>

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </View>
    </View>
  );
};

export default EventDivisionScreen;
