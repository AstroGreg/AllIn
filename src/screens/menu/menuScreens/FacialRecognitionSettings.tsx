import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Scan } from 'iconsax-react-nativejs';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next'

const FacialRecognitionSettings = ({ navigation }: any) => {
    const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const Styles = createStyles(colors);

  const startEnroll = useCallback(() => {
    navigation.navigate('SearchFaceCaptureScreen', {
      mode: 'enrolFace',
      replace: true,
      templatesPerAngle: 3,
      afterEnroll: { screen: 'ProfileSettings' },
    });
  }, [navigation]);

  return (
    <View style={Styles.mainContainer}>
      <SizeBox height={insets.top} />

      <View style={Styles.header}>
        <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={Styles.headerTitle}>{t('Facial Recognition')}</Text>
        <View style={Styles.headerSpacer} />
      </View>

      <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
        <SizeBox height={24} />

        <View style={[Styles.accountSettingsCard, { flexDirection: 'column', alignItems: 'flex-start' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={Styles.accountSettingsIconContainer}>
              <Scan size={20} color={colors.primaryColor} variant="Linear" />
            </View>
            <SizeBox width={12} />
            <Text style={Styles.accountSettingsTitle}>{t('Facial Recognition Templates')}</Text>
          </View>

          <SizeBox height={12} />
          <Text style={{ color: colors.grayColor, lineHeight: 20 }}>
            Capture a full set of angles. If you do this multiple times (append), we store multiple templates per angle (different lighting/distance) for higher accuracy.
          </Text>

          <SizeBox height={16} />
          <TouchableOpacity
            onPress={startEnroll}
            style={{
              backgroundColor: colors.primaryColor,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              alignSelf: 'stretch',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.pureWhite, fontWeight: '600' }}>{t('Enroll Face (3 per angle)')}</Text>
          </TouchableOpacity>

        </View>

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>
    </View>
  );
};

export default FacialRecognitionSettings;