import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Fonts from '../../constants/Fonts';
import { useTheme } from '../../context/ThemeContext';
import {
  getSportFocusLabel,
  type SportFocusId,
} from '../../utils/profileSelections';
import SportFocusIcon from './SportFocusIcon';

type TranslateFn = (value: string) => string;

type SupportProfileSummaryProps = {
  role?: string | null;
  focuses: SportFocusId[];
  t: TranslateFn;
};

const ROLE_COPY: Record<string, string> = {
  fan: 'Fan profile',
  parent: 'Parent profile',
  coach: 'Coach profile',
  supporter: 'Support profile',
  support: 'Support profile',
  family: 'Family profile',
};

const toTitleCase = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

export function getSupportProfileBadgeLabel(role: string | null | undefined, t?: TranslateFn): string {
  const normalized = String(role || '').trim().toLowerCase();
  const fallback = t ? t('Support profile') : 'Support profile';
  if (!normalized) return fallback;
  const predefined = ROLE_COPY[normalized];
  if (predefined) return t ? t(predefined) : predefined;
  const title = toTitleCase(String(role || '').trim());
  return title ? `${title} ${t ? t('profile') : 'profile'}` : fallback;
}

const SupportProfileSummary = ({ role, focuses, t }: SupportProfileSummaryProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: '100%',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.lightGrayColor,
          backgroundColor: colors.btnBackgroundColor,
          paddingHorizontal: 14,
          paddingVertical: 14,
          gap: 12,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        },
        roleBadge: {
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 7,
          backgroundColor: colors.primaryColor,
          alignSelf: 'flex-start',
        },
        roleBadgeText: {
          ...Fonts.medium12,
          color: colors.whiteColor,
        },
        subtitle: {
          ...Fonts.regular11,
          color: colors.subTextColor,
          flexShrink: 1,
          textAlign: 'right',
        },
        focusWrap: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        },
        focusChip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          maxWidth: '100%',
          paddingHorizontal: 11,
          paddingVertical: 8,
          borderRadius: 12,
          backgroundColor: colors.backgroundColor,
          borderWidth: 1,
          borderColor: colors.lightGrayColor,
        },
        focusLabel: {
          ...Fonts.medium12,
          color: colors.mainTextColor,
          flexShrink: 1,
        },
      }),
    [colors],
  );

  const badgeLabel = getSupportProfileBadgeLabel(role, t);
  const subtitle = focuses.length > 1 ? t('Multi-sport support') : t('Focused support');

  if (focuses.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{badgeLabel}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{badgeLabel}</Text>
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.focusWrap}>
        {focuses.map((focusId) => (
          <View key={focusId} style={styles.focusChip}>
            <SportFocusIcon focusId={focusId} size={18} />
            <Text style={styles.focusLabel} numberOfLines={1}>
              {getSportFocusLabel(focusId, t)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SupportProfileSummary;
