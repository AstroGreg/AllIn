import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from '../constants/Icons';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next'

export type AiSearchType = 'bib' | 'context' | 'face' | 'combined';

interface AiSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: AiSearchType) => void;
  title?: string;
  activeFilters?: string[];
}

const options: Array<{
  id: AiSearchType;
  label: string;
  subtitle: string;
  color: string;
  gradient: string[];
  icon: React.ReactNode;
}> = [
  {
    id: 'combined',
    label: 'Combined',
    subtitle: 'Chest + face + context',
    color: '#0EA5E9',
    gradient: ['#0EA5E9', '#38BDF8'],
    icon: <Icons.AiWhiteSquare width={22} height={22} />,
  },
  {
    id: 'bib',
    label: 'Chest number',
    subtitle: 'Find your photos by number',
    color: '#2563EB',
    gradient: ['#1D4ED8', '#60A5FA'],
    icon: <Icons.HashWhite width={26} height={26} />,
  },
  {
    id: 'face',
    label: 'Face',
    subtitle: 'Use your face to match',
    color: '#4F46E5',
    gradient: ['#4338CA', '#818CF8'],
    icon: <Icons.FacescanWhite width={26} height={26} />,
  },
  {
    id: 'context',
    label: 'Context',
    subtitle: 'Search by scene or moment',
    color: '#7C3AED',
    gradient: ['#6D28D9', '#A78BFA'],
    icon: <Icons.ImageWhite width={26} height={26} />,
  },
];

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
      justifyContent: 'flex-start',
    },
    background: {
      ...StyleSheet.absoluteFillObject,
    },
    container: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      width: '100%',
      alignSelf: 'stretch',
      alignItems: 'stretch',
    },
    content: {
      flex: 1,
      paddingTop: 18,
      paddingBottom: 24,
      paddingHorizontal: 20,
    },
    header: {
      marginBottom: 18,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.btnBackgroundColor,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
    },
    headerPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: isDark ? 'rgba(60, 130, 246, 0.18)' : '#EAF1FF',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(60, 130, 246, 0.35)' : '#D7E6FF',
    },
    headerPillText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primaryColor,
      letterSpacing: 0.3,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.mainTextColor,
    },
    subtitle: {
      fontSize: 13,
      color: colors.subTextColor,
      marginTop: 6,
    },
    searchLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.subTextColor,
      marginBottom: 10,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    optionsList: {
      width: '100%',
      alignSelf: 'stretch',
      alignItems: 'stretch',
    },
    optionButton: {
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: 'transparent',
      width: '100%',
      alignSelf: 'stretch',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    },
    optionInner: {
      height: 96,
      width: '100%',
      borderRadius: 24,
      overflow: 'hidden',
    },
    optionBackground: {
      ...StyleSheet.absoluteFillObject,
    },
    optionContent: {
      flex: 1,
      paddingHorizontal: 18,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255,0.25)',
      marginRight: 12,
      flexShrink: 0,
    },
    optionTextWrap: {
      flex: 1,
      justifyContent: 'center',
      paddingRight: 8,
    },
    optionButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.pureWhite,
      lineHeight: 20,
    },
    optionSubtitle: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 4,
      lineHeight: 16,
    },
  });

const AiSearchModal = ({ visible, onClose, onSelect, title = 'AI Search' }: AiSearchModalProps) => {
    const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, colors.backgroundColor !== '#FFFFFF');
  const screenWidth = Dimensions.get('window').width;
  const translateX = useRef(new Animated.Value(-screenWidth)).current;
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsClosing(false);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: -screenWidth,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [screenWidth, translateX, visible]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    Animated.timing(translateX, {
      toValue: -screenWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsClosing(false);
      onClose();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <LinearGradient
          colors={
            colors.backgroundColor === '#FFFFFF'
              ? ['#F4F8FF', '#FFFFFF']
              : ['#0B1020', '#0A0F1E']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        />
        <Animated.View style={[styles.container, { transform: [{ translateX }] }]}>
          <View
            style={[
              styles.content,
              { paddingTop: Math.max(insets.top + 8, 20), paddingBottom: Math.max(insets.bottom + 16, 24) },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerTopRow}>
                <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                  <Icons.BackArrow width={20} height={20} />
                </TouchableOpacity>
                <View style={styles.headerPill}>
                  <Text style={styles.headerPillText}>{t('AI SEARCH')}</Text>
                </View>
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{t('Pick a mode for AI search')}</Text>
            </View>

          <Text style={styles.searchLabel}>{t('Search by')}</Text>
          <View style={styles.optionsList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => onSelect(option.id)}
                activeOpacity={0.85}
                style={styles.optionButton}
              >
                <View style={styles.optionInner}>
                  <LinearGradient colors={option.gradient} style={styles.optionBackground} />
                  <View style={styles.optionContent}>
                    <View style={styles.optionIconWrap}>{option.icon}</View>
                    <View style={styles.optionTextWrap}>
                      <Text style={styles.optionButtonText}>{option.label}</Text>
                      <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AiSearchModal;