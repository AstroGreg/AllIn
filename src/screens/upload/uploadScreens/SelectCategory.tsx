import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from '../SelectCompetitionStyles';

const SelectCategory = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);

  useEffect(() => {
    const routeNames: string[] = Array.isArray(navigation?.getState?.()?.routeNames)
      ? navigation.getState().routeNames
      : [];
    const targetRoute = routeNames.includes('SelectCompetitionScreen')
      ? 'SelectCompetitionScreen'
      : 'RootUploadSelectCompetitionScreen';
    const handle = setTimeout(() => {
      navigation.replace(targetRoute, route?.params ?? {});
    }, 0);
    return () => clearTimeout(handle);
  }, [navigation, route?.params]);

  return (
    <View style={styles.mainContainer} testID="legacy-upload-category-screen">
      <SizeBox height={insets.top} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 28,
        }}
      >
        <ActivityIndicator color={colors.primaryColor} size="large" />
        <SizeBox height={18} />
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.mainTextColor,
            textAlign: 'center',
          }}
        >
          {t('Opening updated upload flow')}
        </Text>
        <SizeBox height={8} />
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: colors.subTextColor,
            textAlign: 'center',
          }}
        >
          {t('The old category picker has been replaced with the discipline and category flow.')}
        </Text>
      </View>
    </View>
  );
};

export default SelectCategory;
