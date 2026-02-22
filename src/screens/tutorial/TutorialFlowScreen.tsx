import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../../context/ThemeContext';

type TutorialStep = {
  key:
    | 'home_download'
    | 'downloads'
    | 'ai_inputs'
    | 'ai_results'
    | 'subscribe'
    | 'hub'
    | 'upload'
    | 'finish';
  title: string;
  subtitle: string;
  actionLabel: string;
};

const STEPS: TutorialStep[] = [
  {
    key: 'home_download',
    title: 'Download demo photo',
    subtitle: 'This is a fake overview. We highlight the download action on a demo media card.',
    actionLabel: 'Download demo photo',
  },
  {
    key: 'downloads',
    title: 'My Downloads',
    subtitle: 'Downloaded files appear here. This is fake data to show the expected layout.',
    actionLabel: 'Next',
  },
  {
    key: 'ai_inputs',
    title: 'AI Search inputs',
    subtitle: 'Set competition, chest number, face, and context before running search.',
    actionLabel: 'Run demo AI search',
  },
  {
    key: 'ai_results',
    title: 'AI Search results',
    subtitle: 'Results show match type and confidence. Open any result to inspect media.',
    actionLabel: 'Next',
  },
  {
    key: 'subscribe',
    title: 'Subscribe to competition',
    subtitle: 'Subscribe to the seeded Tutorial Event so new uploads appear in your flow.',
    actionLabel: 'Subscribe (demo)',
  },
  {
    key: 'hub',
    title: 'Hub explained',
    subtitle: 'Appearances = your matches, Subscribed = followed events, Uploads = your content.',
    actionLabel: 'Next',
  },
  {
    key: 'upload',
    title: 'Add yourself to competition',
    subtitle: 'Select competition, choose checkpoint, then upload media in the fake flow.',
    actionLabel: 'Complete demo flow',
  },
  {
    key: 'finish',
    title: 'Tutorial completed',
    subtitle: 'You can quit now and start by subscribing to Tutorial Event in the real app.',
    actionLabel: 'Finish',
  },
];

const TutorialFlowScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.backgroundColor },
        top: {
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.lightGrayColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        topTitle: { color: colors.mainTextColor, fontSize: 30, fontWeight: '700' },
        topMeta: { color: colors.subTextColor, fontSize: 12, marginTop: 2 },
        quit: { color: colors.primaryColor, fontSize: 16, fontWeight: '700' },
        stageWrap: {
          flex: 1,
          paddingHorizontal: 14,
          paddingTop: 14,
        },
        stage: {
          flex: 1,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.lightGrayColor,
          overflow: 'hidden',
          backgroundColor: colors.cardBackground,
        },
        fakeHeader: {
          height: 62,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.lightGrayColor,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        fakeHeaderBall: {
          width: 32,
          height: 32,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.lightGrayColor,
          backgroundColor: colors.backgroundColor,
        },
        fakeHeaderTitle: { color: colors.mainTextColor, fontSize: 18, fontWeight: '700' },
        fakeBody: { flex: 1, padding: 14 },
        fakeCard: {
          borderWidth: 1,
          borderColor: colors.lightGrayColor,
          borderRadius: 14,
          backgroundColor: colors.backgroundColor,
          padding: 12,
        },
        fakeImage: { width: '100%', height: 180, borderRadius: 10 },
        fakeTitle: { color: colors.mainTextColor, fontSize: 24, fontWeight: '700', marginTop: 10 },
        fakeMeta: { color: colors.subTextColor, fontSize: 16, marginTop: 4 },
        fakeRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        fakePill: {
          borderWidth: 1,
          borderColor: colors.lightGrayColor,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: colors.cardBackground,
        },
        fakePillText: { color: colors.mainTextColor, fontSize: 14, fontWeight: '600' },
        fakePrimaryPill: {
          borderWidth: 1,
          borderColor: colors.primaryColor,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 8,
          backgroundColor: colors.secondaryBlueColor,
        },
        fakePrimaryPillText: { color: colors.primaryColor, fontSize: 14, fontWeight: '700' },
        fakeInput: {
          borderWidth: 1,
          borderColor: colors.lightGrayColor,
          borderRadius: 10,
          backgroundColor: colors.backgroundColor,
          minHeight: 44,
          justifyContent: 'center',
          paddingHorizontal: 12,
          marginBottom: 8,
        },
        fakeInputText: { color: colors.subTextColor, fontSize: 14 },
        fakeResultCard: {
          borderWidth: 1,
          borderColor: colors.lightGrayColor,
          borderRadius: 10,
          padding: 10,
          marginBottom: 8,
          backgroundColor: colors.backgroundColor,
        },
        fakeResultTitle: { color: colors.mainTextColor, fontSize: 14, fontWeight: '700' },
        fakeResultMeta: { color: colors.subTextColor, fontSize: 12, marginTop: 2 },
        dimmer: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.42)',
        },
        spotlight: {
          position: 'absolute',
          borderWidth: 2,
          borderColor: colors.primaryColor,
          borderRadius: 12,
          backgroundColor: 'transparent',
        },
        explainer: {
          marginTop: 12,
          marginHorizontal: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.primaryColor,
          backgroundColor: colors.cardBackground,
          padding: 14,
        },
        explainerTitle: { color: colors.mainTextColor, fontSize: 18, fontWeight: '700' },
        explainerText: { color: colors.subTextColor, fontSize: 14, lineHeight: 20, marginTop: 6 },
        explainerBtn: {
          marginTop: 10,
          height: 42,
          borderRadius: 10,
          backgroundColor: colors.primaryColor,
          alignItems: 'center',
          justifyContent: 'center',
        },
        explainerBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
        bottom: {
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 10),
          flexDirection: 'row',
          gap: 10,
        },
        navBtn: {
          flex: 1,
          height: 44,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.lightGrayColor,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.cardBackground,
        },
        navBtnPrimary: {
          backgroundColor: colors.primaryColor,
          borderColor: colors.primaryColor,
        },
        navText: { color: colors.mainTextColor, fontSize: 14, fontWeight: '600' },
        navTextPrimary: { color: '#fff' },
      }),
    [colors, insets.bottom],
  );

  const goNext = () => {
    if (isLast) {
      navigation.goBack();
      return;
    }
    setIndex((v) => Math.min(v + 1, STEPS.length - 1));
  };

  const stageTitle =
    step.key === 'downloads'
      ? 'Downloads'
      : step.key === 'ai_inputs' || step.key === 'ai_results'
        ? 'AI Search'
        : step.key === 'subscribe' || step.key === 'hub'
          ? 'Hub'
          : 'Overview';

  const spotlightStyle = (() => {
    if (step.key === 'home_download') return { right: 28, top: 290, width: 126, height: 48 };
    if (step.key === 'downloads') return { left: 24, right: 24, top: 108, height: 226 };
    if (step.key === 'ai_inputs') return { left: 24, right: 24, top: 100, height: 204 };
    if (step.key === 'ai_results') return { left: 24, right: 24, top: 100, height: 130 };
    if (step.key === 'subscribe') return { left: 24, right: 24, top: 122, height: 108 };
    if (step.key === 'hub') return { left: 24, right: 24, top: 100, height: 116 };
    if (step.key === 'upload') return { left: 24, right: 24, top: 100, height: 148 };
    return { left: 24, right: 24, top: 100, height: 90 };
  })();

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top }} />
      <View style={styles.top}>
        <View>
          <Text style={styles.topTitle}>Tutorial</Text>
          <Text style={styles.topMeta}>{`${index + 1} / ${STEPS.length}`}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.quit}>Quit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stageWrap}>
        <View style={styles.stage}>
          <View style={styles.fakeHeader}>
            <View style={styles.fakeHeaderBall} />
            <Text style={styles.fakeHeaderTitle}>{stageTitle}</Text>
            <View style={styles.fakeHeaderBall} />
          </View>
          <View style={styles.fakeBody}>
            {(step.key === 'home_download' || step.key === 'downloads') && (
              <View style={styles.fakeCard}>
                <FastImage source={{ uri: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop' }} style={styles.fakeImage} />
                <Text style={styles.fakeTitle}>Brussels City Run 2026</Text>
                <Text style={styles.fakeMeta}>Demo athlete • 18 Mar 2026</Text>
                <View style={styles.fakeRow}>
                  <View style={styles.fakePill}><Text style={styles.fakePillText}>Share</Text></View>
                  <View style={styles.fakePrimaryPill}><Text style={styles.fakePrimaryPillText}>Download</Text></View>
                </View>
              </View>
            )}
            {step.key === 'ai_inputs' && (
              <View style={styles.fakeCard}>
                <View style={styles.fakeInput}><Text style={styles.fakeInputText}>Competition: Tutorial Event</Text></View>
                <View style={styles.fakeInput}><Text style={styles.fakeInputText}>Chest number: 4455</Text></View>
                <View style={styles.fakeInput}><Text style={styles.fakeInputText}>Face image: Selected</Text></View>
                <View style={styles.fakeInput}><Text style={styles.fakeInputText}>Context: 800m final</Text></View>
              </View>
            )}
            {step.key === 'ai_results' && (
              <View style={styles.fakeCard}>
                <View style={styles.fakeResultCard}>
                  <Text style={styles.fakeResultTitle}>Tutorial Event • Heat A</Text>
                  <Text style={styles.fakeResultMeta}>Face 98% • Chest match</Text>
                </View>
                <View style={styles.fakeResultCard}>
                  <Text style={styles.fakeResultTitle}>Tutorial Event • Finish</Text>
                  <Text style={styles.fakeResultMeta}>Context 91%</Text>
                </View>
              </View>
            )}
            {step.key === 'subscribe' && (
              <View style={styles.fakeCard}>
                <View style={styles.fakeResultCard}>
                  <Text style={styles.fakeResultTitle}>Tutorial Event</Text>
                  <Text style={styles.fakeResultMeta}>Brussels • 18/03/2026</Text>
                </View>
                <View style={styles.fakePrimaryPill}><Text style={styles.fakePrimaryPillText}>Subscribe</Text></View>
              </View>
            )}
            {(step.key === 'hub' || step.key === 'upload' || step.key === 'finish') && (
              <View style={styles.fakeCard}>
                {step.key === 'hub' && (
                  <>
                    <View style={styles.fakeRow}>
                      <View style={styles.fakePill}><Text style={styles.fakePillText}>Appearances</Text></View>
                      <View style={styles.fakePill}><Text style={styles.fakePillText}>Subscribed</Text></View>
                      <View style={styles.fakePill}><Text style={styles.fakePillText}>Uploads</Text></View>
                    </View>
                    <Text style={styles.fakeMeta}>Manage your matches, subscriptions, and uploads.</Text>
                  </>
                )}
                {step.key === 'upload' && (
                  <>
                    <View style={styles.fakeResultCard}><Text style={styles.fakeResultTitle}>1. Select competition</Text></View>
                    <View style={styles.fakeResultCard}><Text style={styles.fakeResultTitle}>2. Select checkpoint</Text></View>
                    <View style={styles.fakeResultCard}><Text style={styles.fakeResultTitle}>3. Add photo/video</Text></View>
                  </>
                )}
                {step.key === 'finish' && (
                  <Text style={styles.fakeMeta}>Start with real Search and subscribe to Tutorial Event.</Text>
                )}
              </View>
            )}
          </View>
          <View style={styles.dimmer} />
          <View style={[styles.spotlight, spotlightStyle]} />
        </View>
      </View>

      <View style={styles.explainer}>
        <Text style={styles.explainerTitle}>{step.title}</Text>
        <Text style={styles.explainerText}>{step.subtitle}</Text>
        <TouchableOpacity style={styles.explainerBtn} onPress={goNext}>
          <Text style={styles.explainerBtnText}>{step.actionLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.navBtn} disabled={index === 0} onPress={() => setIndex((v) => Math.max(v - 1, 0))}>
          <Text style={styles.navText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={goNext}>
          <Text style={[styles.navText, styles.navTextPrimary]}>{isLast ? 'Finish' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TutorialFlowScreen;
