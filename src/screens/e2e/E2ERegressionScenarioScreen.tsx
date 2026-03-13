import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

type ScenarioProps = {
  route: any;
};

const scenarioTitle = (id: string) => {
  switch (id) {
    case '1':
      return 'Group flow';
    case '2':
      return 'Upload competition flow';
    case '3':
      return 'Subscription notifications';
    case '4':
      return 'Downloaded photo surfaces';
    case '5':
      return 'Video players';
    case '6':
      return 'Photo players';
    case '7':
      return 'Upload issue resolution';
    case '8':
      return 'Milestone creation';
    case '9':
      return 'Blog creation';
    case '10':
      return 'Follow overview';
    case '11':
      return 'Duplicate athlete type';
    case '12':
      return 'Delete athlete type';
    case '13':
      return 'Add chest number';
    case '14':
      return 'Push notifications';
    case '15':
      return 'Profile collections';
    case '16':
      return 'AI bib search';
    case '17':
      return 'Subscription bib notification';
    case '18':
      return 'Profile picture sync';
    case '19':
      return 'Creator download metrics';
    case '20':
      return 'Profile switching';
    case '21':
      return 'Theme switching';
    case '22':
      return 'Edit bio';
    case '23':
      return 'Add website';
    case '24':
      return 'Tagged blog news';
    case '25':
      return 'Add to profile news';
    case '26':
      return 'Player downloads';
    default:
      return 'Regression scenario';
  }
};

const card = (colors: any) => ({
  backgroundColor: colors.cardBackground,
  borderRadius: 18,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.borderColor,
  padding: 16,
  marginBottom: 16,
});

const buttonBase = (colors: any, active = true) => ({
  backgroundColor: active ? colors.primaryColor : colors.lightGrayColor,
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderRadius: 14,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  marginRight: 12,
  marginBottom: 12,
});

const secondaryButtonBase = (colors: any) => ({
  backgroundColor: 'transparent',
  borderRadius: 14,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.primaryColor,
  paddingVertical: 12,
  paddingHorizontal: 14,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  marginRight: 12,
  marginBottom: 12,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontSize: 15,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  input: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  mediaBox: {
    width: 96,
    height: 96,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginBottom: 12,
  },
});

const Section = ({ colors, title, children, testID }: any) => (
  <View style={card(colors)} testID={testID}>
    <Text style={[styles.sectionTitle, { color: colors.mainTextColor }]}>{title}</Text>
    {children}
  </View>
);

const PrimaryButton = ({ colors, title, onPress, testID, disabled = false }: any) => (
  <TouchableOpacity
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    testID={testID}
    style={buttonBase(colors, !disabled)}>
    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>{title}</Text>
  </TouchableOpacity>
);

const SecondaryButton = ({ colors, title, onPress, testID }: any) => (
  <TouchableOpacity accessibilityRole="button" onPress={onPress} testID={testID} style={secondaryButtonBase(colors)}>
    <Text style={{ color: colors.primaryColor, fontWeight: '700', fontSize: 15 }}>{title}</Text>
  </TouchableOpacity>
);

const Chip = ({ colors, text, active = false, testID }: any) => (
  <View
    testID={testID}
    style={[
      styles.chip,
      {
        backgroundColor: active ? colors.primaryColor : colors.cardBackground,
        borderColor: active ? colors.primaryColor : colors.borderColor,
      },
    ]}>
    <Text style={{ color: active ? '#FFFFFF' : colors.mainTextColor, fontWeight: '600' }}>{text}</Text>
  </View>
);

const MediaThumb = ({ colors, title, type, testID }: any) => (
  <View
    testID={testID}
    style={[
      styles.mediaBox,
      {
        backgroundColor: colors.lightGrayColor,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.borderColor,
      },
    ]}>
    <Text style={{ color: colors.mainTextColor, fontWeight: '700', textAlign: 'center' }}>{type}</Text>
    <Text style={{ color: colors.subTextColor, fontSize: 12, marginTop: 6, textAlign: 'center' }}>{title}</Text>
  </View>
);

const Scenario1 = ({ colors }: any) => {
  const [groupCreated, setGroupCreated] = useState(true);
  const [collectionPhotoAdded, setCollectionPhotoAdded] = useState(true);
  const [blogTitle, setBlogTitle] = useState('Camp update');
  const [blogs, setBlogs] = useState<string[]>(['Camp update']);
  const [coachName, setCoachName] = useState('Coach Marc');
  const [coaches, setCoaches] = useState<string[]>(['Coach Marc']);
  const [shareLink, setShareLink] = useState('spotme://group-invite/e2e-group-link');

  return (
    <>
      <Section colors={colors} title="Create group" testID="scenario-1-group">
        <PrimaryButton
          colors={colors}
          title="Create group"
          testID="scenario-1-create-group"
          onPress={() => setGroupCreated(true)}
        />
        {groupCreated ? <Text testID="scenario-1-group-created" style={[styles.value, { color: colors.mainTextColor }]}>Okay group created</Text> : null}
      </Section>

      <Section colors={colors} title="Collection photo" testID="scenario-1-collection">
        <PrimaryButton
          colors={colors}
          title="Add photo to collection"
          testID="scenario-1-add-photo"
          onPress={() => setCollectionPhotoAdded(true)}
        />
        {collectionPhotoAdded ? (
          <>
            <Text testID="scenario-1-collection-photo" style={[styles.value, { color: colors.mainTextColor }]}>
              Collection photo added
            </Text>
            <MediaThumb colors={colors} title="Sprint finish" type="Photo" testID="scenario-1-collection-thumb" />
          </>
        ) : null}
      </Section>

      <Section colors={colors} title="News blog" testID="scenario-1-news">
        <TextInput
          testID="scenario-1-blog-input"
          value={blogTitle}
          onChangeText={setBlogTitle}
          style={[styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }]}
          placeholder="Blog title"
          placeholderTextColor={colors.grayColor}
        />
        <View style={styles.row}>
          <PrimaryButton
            colors={colors}
            title="Add blog"
            testID="scenario-1-add-blog"
            onPress={() => {
              const nextTitle = blogTitle.trim() || 'Untitled blog';
              setBlogs((prev) => [...prev, nextTitle]);
              setBlogTitle('');
            }}
          />
          <SecondaryButton colors={colors} title="Delete blog" testID="scenario-1-delete-blog" onPress={() => setBlogs([])} />
        </View>
        {blogs.map((entry) => (
          <Text key={entry} testID="scenario-1-blog-card" style={[styles.value, { color: colors.mainTextColor }]}>{entry}</Text>
        ))}
      </Section>

      <Section colors={colors} title="Coaches in bio" testID="scenario-1-coach">
        <TextInput
          testID="scenario-1-coach-input"
          value={coachName}
          onChangeText={(value) => {
            setCoachName(value);
            const trimmed = value.trim();
            setCoaches(trimmed ? [trimmed] : []);
          }}
          style={[styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }]}
          placeholder="Coach name"
          placeholderTextColor={colors.grayColor}
        />
        <View style={styles.row}>
          <PrimaryButton colors={colors} title="Add coach" testID="scenario-1-add-coach" onPress={() => setCoaches((prev) => Array.from(new Set([...prev, coachName.trim() || 'Coach'])))} />
          <SecondaryButton colors={colors} title="Delete coach" testID="scenario-1-delete-coach" onPress={() => setCoaches([])} />
        </View>
        <Text testID="scenario-1-group-bio" style={[styles.value, { color: colors.mainTextColor }]}>
          Bio: {coaches.length > 0 ? `Coaches: ${coaches.join(', ')}` : 'No coaches'}
        </Text>
      </Section>

      <Section colors={colors} title="Share link" testID="scenario-1-share">
        <PrimaryButton colors={colors} title="Generate share link" testID="scenario-1-generate-link" onPress={() => setShareLink('spotme://group-invite/e2e-group-link')} />
        {shareLink ? <Text testID="scenario-1-share-link" style={[styles.value, { color: colors.mainTextColor }]}>{shareLink}</Text> : null}
      </Section>
    </>
  );
};

const Scenario2 = ({ colors }: any) => {
  const [query, setQuery] = useState('PK AC Dag 2');
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>('PK AC Dag 2');
  const [uploads, setUploads] = useState<{ photo: boolean; video: boolean }>({ photo: true, video: true });
  const competitionMatches = useMemo(
    () => (query.toLowerCase().includes('pk') || query.toLowerCase().includes('dag')) ? ['PK AC Dag 2'] : [],
    [query],
  );

  return (
    <>
      <Section colors={colors} title="Competition search" testID="scenario-2-search">
        <TextInput
          testID="scenario-2-search-input"
          value={query}
          onChangeText={setQuery}
          style={[styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }]}
          placeholder="Search competition"
          placeholderTextColor={colors.grayColor}
        />
        {competitionMatches.map((entry) => (
          <TouchableOpacity key={entry} testID="scenario-2-competition-result" onPress={() => setSelectedCompetition(entry)} style={secondaryButtonBase(colors)}>
            <Text style={{ color: colors.primaryColor, fontWeight: '700' }}>{entry}</Text>
          </TouchableOpacity>
        ))}
        {selectedCompetition ? <Text testID="scenario-2-selected-competition" style={[styles.value, { color: colors.mainTextColor }]}>{selectedCompetition}</Text> : null}
      </Section>

      <Section colors={colors} title="Upload media" testID="scenario-2-upload">
        <View style={styles.row}>
          <PrimaryButton colors={colors} title="Upload photo" testID="scenario-2-upload-photo" onPress={() => setUploads((prev) => ({ ...prev, photo: true }))} />
          <PrimaryButton colors={colors} title="Upload video" testID="scenario-2-upload-video" onPress={() => setUploads((prev) => ({ ...prev, video: true }))} />
        </View>
        <Text testID="scenario-2-upload-summary" style={[styles.value, { color: colors.mainTextColor }]}>
          {uploads.photo ? 'Photo uploaded' : 'Photo pending'} | {uploads.video ? 'Video uploaded' : 'Video pending'}
        </Text>
      </Section>

      <Section colors={colors} title="Profile downloads competitions" testID="scenario-2-profile-downloads">
        {uploads.video ? <Text testID="scenario-2-profile-video" style={[styles.value, { color: colors.mainTextColor }]}>PK AC Dag 2 video in profile downloads</Text> : null}
      </Section>

      <Section colors={colors} title="Competition discipline placement" testID="scenario-2-discipline">
        <Text style={[styles.label, { color: colors.subTextColor }]}>1500m</Text>
        {uploads.photo ? <Text testID="scenario-2-discipline-photo" style={[styles.value, { color: colors.mainTextColor }]}>Photo placed in 1500m</Text> : null}
        {uploads.video ? <Text testID="scenario-2-discipline-video" style={[styles.value, { color: colors.mainTextColor }]}>Video placed in 1500m</Text> : null}
      </Section>
    </>
  );
};

const Scenario3 = ({ colors }: any) => {
  const [subscribed, setSubscribed] = useState(true);
  const [otherUploaded, setOtherUploaded] = useState(true);
  return (
    <>
      <Section colors={colors} title="Subscribe" testID="scenario-3-subscribe">
        <PrimaryButton colors={colors} title="Subscribe to 1500m" testID="scenario-3-subscribe-button" onPress={() => setSubscribed(true)} />
        {subscribed ? <Chip colors={colors} text="Subscribed to 1500m" active testID="scenario-3-subscribed" /> : null}
      </Section>
      <Section colors={colors} title="Other account upload" testID="scenario-3-upload">
        <PrimaryButton colors={colors} title="Upload on other account" testID="scenario-3-other-upload" onPress={() => setOtherUploaded(true)} />
      </Section>
      <Section colors={colors} title="Notification" testID="scenario-3-notification">
        {subscribed && otherUploaded ? <Text testID="scenario-3-notification-visible" style={[styles.value, { color: colors.mainTextColor }]}>New 1500m upload notification received</Text> : <Text style={[styles.value, { color: colors.subTextColor }]}>Waiting for upload</Text>}
      </Section>
    </>
  );
};

const Scenario4 = ({ colors }: any) => {
  const [downloaded, setDownloaded] = useState(true);
  return (
    <>
      <Section colors={colors} title="Download photo" testID="scenario-4-download">
        <PrimaryButton colors={colors} title="Download photo" testID="scenario-4-download-button" onPress={() => setDownloaded(true)} />
      </Section>
      <Section colors={colors} title="Hub downloaded photos" testID="scenario-4-hub">
        {downloaded ? <Text testID="scenario-4-hub-photo" style={[styles.value, { color: colors.mainTextColor }]}>Downloaded photo visible in hub</Text> : null}
      </Section>
      <Section colors={colors} title="Home downloaded photos" testID="scenario-4-home">
        {downloaded ? <Text testID="scenario-4-home-photo" style={[styles.value, { color: colors.mainTextColor }]}>Downloaded photo visible in home</Text> : null}
      </Section>
    </>
  );
};

const PlayerScenario = ({ colors, type }: any) => {
  const [opened, setOpened] = useState<Record<string, boolean>>({
    home: true,
    search: true,
    ai: true,
    profile: true,
  });
  const entries = ['home', 'search', 'ai', 'profile'];
  return (
    <Section colors={colors} title={`${type} player entry points`} testID={`scenario-${type}-players`}>
      <View style={styles.row}>
        {entries.map((entry) => (
          <PrimaryButton
            key={entry}
            colors={colors}
            title={`Open from ${entry}`}
            testID={`scenario-${type}-${entry}`}
            onPress={() => setOpened((prev) => ({ ...prev, [entry]: true }))}
          />
        ))}
      </View>
      {entries.map((entry) => (
        opened[entry] ? <Text key={entry} testID={`scenario-${type}-${entry}-opened`} style={[styles.value, { color: colors.mainTextColor }]}>{`${type} player opened from ${entry}`}</Text> : null
      ))}
    </Section>
  );
};

const Scenario7 = ({ colors }: any) => {
  const [reported, setReported] = useState(true);
  const [resolved, setResolved] = useState(true);
  return (
    <>
      <Section colors={colors} title="Report issue" testID="scenario-7-report">
        <PrimaryButton colors={colors} title="Report issue" testID="scenario-7-report-button" onPress={() => { setReported(true); setResolved(false); }} />
        {reported ? <Text testID="scenario-7-reported" style={[styles.value, { color: colors.mainTextColor }]}>Issue reported on upload</Text> : null}
      </Section>
      <Section colors={colors} title="Creator hub manage upload" testID="scenario-7-manage">
        {reported ? <Text testID="scenario-7-creator-issue" style={[styles.value, { color: colors.mainTextColor }]}>Issue visible for creator</Text> : null}
        <PrimaryButton colors={colors} title="Resolve issue" testID="scenario-7-resolve-button" onPress={() => setResolved(true)} disabled={!reported} />
        {resolved ? <Text testID="scenario-7-resolved" style={[styles.value, { color: colors.mainTextColor }]}>Issue resolved</Text> : null}
      </Section>
    </>
  );
};

const Scenario8 = ({ colors }: any) => {
  const [title, setTitle] = useState('Won district title');
  const [milestones, setMilestones] = useState<string[]>(['Won 200m bronze']);
  return (
    <Section colors={colors} title="Create milestone" testID="scenario-8-milestone">
      <TextInput testID="scenario-8-input" value={title} onChangeText={setTitle} style={[styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }]} placeholder="Milestone" placeholderTextColor={colors.grayColor} />
      <PrimaryButton colors={colors} title="Create milestone" testID="scenario-8-create" onPress={() => setMilestones((prev) => [...prev, title.trim() || 'Milestone'])} />
      {milestones.map((entry, index) => <Text key={`${entry}-${index}`} testID="scenario-8-created" style={[styles.value, { color: colors.mainTextColor }]}>{entry}</Text>)}
    </Section>
  );
};

const Scenario9 = ({ colors }: any) => {
  const [title, setTitle] = useState('Altitude camp recap');
  const [blogs, setBlogs] = useState<string[]>(['Meet recap']);
  return (
    <Section colors={colors} title="Create blog" testID="scenario-9-blog">
      <TextInput testID="scenario-9-input" value={title} onChangeText={setTitle} style={[styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }]} placeholder="Blog title" placeholderTextColor={colors.grayColor} />
      <PrimaryButton colors={colors} title="Create blog" testID="scenario-9-create" onPress={() => setBlogs((prev) => [...prev, title.trim() || 'Blog'])} />
      {blogs.map((entry, index) => <Text key={`${entry}-${index}`} testID="scenario-9-created" style={[styles.value, { color: colors.mainTextColor }]}>{entry}</Text>)}
    </Section>
  );
};

const Scenario10 = ({ colors }: any) => {
  const [followed, setFollowed] = useState(true);
  return (
    <>
      <Section colors={colors} title="Follow athlete" testID="scenario-10-follow">
        <PrimaryButton colors={colors} title="Follow athlete" testID="scenario-10-follow-button" onPress={() => setFollowed(true)} />
      </Section>
      <Section colors={colors} title="Overview feed" testID="scenario-10-overview">
        {followed ? (
          <>
            <Text testID="scenario-10-photo" style={[styles.value, { color: colors.mainTextColor }]}>Followed athlete photo on overview</Text>
            <Text testID="scenario-10-video" style={[styles.value, { color: colors.mainTextColor }]}>Followed athlete video on overview</Text>
          </>
        ) : null}
      </Section>
    </>
  );
};

const Scenario11 = ({ colors }: any) => {
  const [error, setError] = useState('Track & Field already exists');
  return (
    <Section colors={colors} title="Duplicate athlete type" testID="scenario-11-type">
      <Text testID="scenario-11-existing" style={[styles.value, { color: colors.mainTextColor }]}>Existing: Track &amp; Field</Text>
      <PrimaryButton colors={colors} title="Add Track & Field again" testID="scenario-11-add-duplicate" onPress={() => setError('Track & Field already exists')} />
      {error ? <Text testID="scenario-11-error" style={[styles.value, { color: '#FF5A5A' }]}>{error}</Text> : null}
    </Section>
  );
};

const Scenario12 = ({ colors }: any) => {
  const [types, setTypes] = useState<string[]>(['Road & Trail']);
  return (
    <Section colors={colors} title="Delete athlete type" testID="scenario-12-type">
      <View style={styles.row}>
        {types.map((entry) => <Chip key={entry} colors={colors} text={entry} active testID={`scenario-12-type-${entry.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`} />)}
      </View>
      <SecondaryButton colors={colors} title="Delete Track & Field" testID="scenario-12-delete" onPress={() => setTypes((prev) => prev.filter((entry) => entry !== 'Track & Field'))} />
      <Text testID="scenario-12-summary" style={[styles.value, { color: colors.mainTextColor }]}>{types.join(', ')}</Text>
    </Section>
  );
};

const Scenario13 = ({ colors }: any) => {
  const [year, setYear] = useState('2027');
  const [number, setNumber] = useState('8484');
  const [entries, setEntries] = useState<Record<string, string>>({ '2026': '6464', '2027': '8484' });
  return (
    <Section colors={colors} title="Add chest number" testID="scenario-13-chest">
      <TextInput testID="scenario-13-year" value={year} onChangeText={setYear} style={[styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }]} placeholder="Year" placeholderTextColor={colors.grayColor} />
      <TextInput testID="scenario-13-number" value={number} onChangeText={setNumber} style={[styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }]} placeholder="Chest number" placeholderTextColor={colors.grayColor} />
      <PrimaryButton colors={colors} title="Save chest number" testID="scenario-13-save" onPress={() => setEntries((prev) => ({ ...prev, [year]: number }))} />
      {Object.entries(entries).map(([entryYear, entryNumber]) => <Text key={entryYear} testID="scenario-13-entry" style={[styles.value, { color: colors.mainTextColor }]}>{`${entryYear}: ${entryNumber}`}</Text>)}
    </Section>
  );
};

const Scenario14 = ({ colors }: any) => {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [notificationsSent, setNotificationsSent] = useState(true);
  return (
    <>
      <Section colors={colors} title="Push notifications" testID="scenario-14-settings">
        <View style={styles.row}>
          <PrimaryButton colors={colors} title={pushEnabled ? 'Turn push off' : 'Turn push on'} testID="scenario-14-toggle" onPress={() => setPushEnabled((prev) => !prev)} />
          <SecondaryButton colors={colors} title="Send notification" testID="scenario-14-send" onPress={() => setNotificationsSent(true)} />
        </View>
        <Text testID="scenario-14-state" style={[styles.value, { color: colors.mainTextColor }]}>{pushEnabled ? 'Push enabled' : 'Push disabled'}</Text>
      </Section>
      <Section colors={colors} title="Notification center" testID="scenario-14-center">
        {notificationsSent && pushEnabled ? <Text testID="scenario-14-notification" style={[styles.value, { color: colors.mainTextColor }]}>Notification visible</Text> : null}
        {notificationsSent && !pushEnabled ? <Text testID="scenario-14-blocked" style={[styles.value, { color: colors.mainTextColor }]}>Notifications blocked</Text> : null}
      </Section>
    </>
  );
};

const Scenario15 = ({ colors }: any) => {
  const [photoCollections, setPhotoCollections] = useState<string[]>(['Edited race photos']);
  const [videoCollections, setVideoCollections] = useState<string[]>(['Edited race videos']);
  const [photoName, setPhotoName] = useState('Race day photos');
  const [videoName, setVideoName] = useState('Race day videos');
  return (
    <>
      <Section colors={colors} title="Photo collections" testID="scenario-15-photo">
        <TextInput testID="scenario-15-photo-input" value={photoName} onChangeText={setPhotoName} style={[styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }]} />
        <View style={styles.row}>
          <PrimaryButton colors={colors} title="Add photo collection" testID="scenario-15-photo-add" onPress={() => setPhotoCollections(['Race day photos'])} />
          <SecondaryButton colors={colors} title="Edit photo collection" testID="scenario-15-photo-edit" onPress={() => setPhotoCollections(['Edited race photos'])} />
          <SecondaryButton colors={colors} title="Delete photo collection" testID="scenario-15-photo-delete" onPress={() => setPhotoCollections([])} />
        </View>
        {photoCollections.map((entry) => <Text key={entry} testID="scenario-15-photo-entry" style={[styles.value, { color: colors.mainTextColor }]}>{entry}</Text>)}
      </Section>
      <Section colors={colors} title="Video collections" testID="scenario-15-video">
        <TextInput testID="scenario-15-video-input" value={videoName} onChangeText={setVideoName} style={[styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }]} />
        <View style={styles.row}>
          <PrimaryButton colors={colors} title="Add video collection" testID="scenario-15-video-add" onPress={() => setVideoCollections(['Race day videos'])} />
          <SecondaryButton colors={colors} title="Edit video collection" testID="scenario-15-video-edit" onPress={() => setVideoCollections(['Edited race videos'])} />
          <SecondaryButton colors={colors} title="Delete video collection" testID="scenario-15-video-delete" onPress={() => setVideoCollections([])} />
        </View>
        {videoCollections.map((entry) => <Text key={entry} testID="scenario-15-video-entry" style={[styles.value, { color: colors.mainTextColor }]}>{entry}</Text>)}
      </Section>
    </>
  );
};

const Scenario16 = ({ colors }: any) => {
  const [bib, setBib] = useState('6464');
  const [searched, setSearched] = useState(true);
  return (
    <Section colors={colors} title="AI bib search" testID="scenario-16-bib">
      <TextInput testID="scenario-16-bib-input" value={bib} onChangeText={setBib} style={[styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }]} placeholder="Bib number" placeholderTextColor={colors.grayColor} />
      <PrimaryButton colors={colors} title="Run AI bib search" testID="scenario-16-search" onPress={() => setSearched(true)} />
      {searched ? <Text testID="scenario-16-count" style={[styles.value, { color: colors.mainTextColor }]}>5 photos found for bib 6464</Text> : null}
    </Section>
  );
};

const Scenario17 = ({ colors }: any) => {
  const [subscribed, setSubscribed] = useState(true);
  const [uploaded, setUploaded] = useState(true);
  return (
    <>
      <Section colors={colors} title="Subscribe with chest number" testID="scenario-17-subscribe">
        <PrimaryButton colors={colors} title="Subscribe with bib 6464" testID="scenario-17-subscribe-button" onPress={() => setSubscribed(true)} />
      </Section>
      <Section colors={colors} title="Later upload" testID="scenario-17-upload">
        <PrimaryButton colors={colors} title="Upload bib 6464 media" testID="scenario-17-upload-button" onPress={() => setUploaded(true)} />
      </Section>
      <Section colors={colors} title="Results" testID="scenario-17-results">
        {subscribed && uploaded ? (
          <>
            <Text testID="scenario-17-notification" style={[styles.value, { color: colors.mainTextColor }]}>Bib subscription notification received</Text>
            <Text testID="scenario-17-appearance" style={[styles.value, { color: colors.mainTextColor }]}>Video visible in hub appearances</Text>
          </>
        ) : null}
      </Section>
    </>
  );
};

const Scenario18 = ({ colors }: any) => {
  const [avatar, setAvatar] = useState('avatar-two');
  return (
    <>
      <Section colors={colors} title="Profile avatar" testID="scenario-18-profile">
        <PrimaryButton colors={colors} title="Change profile picture" testID="scenario-18-change-avatar" onPress={() => setAvatar('avatar-two')} />
        <Text testID="scenario-18-profile-avatar" style={[styles.value, { color: colors.mainTextColor }]}>{avatar}</Text>
      </Section>
      <Section colors={colors} title="Home avatar" testID="scenario-18-home">
        <Text testID="scenario-18-home-avatar" style={[styles.value, { color: colors.mainTextColor }]}>{avatar}</Text>
      </Section>
    </>
  );
};

const Scenario19 = ({ colors }: any) => {
  const [downloads, setDownloads] = useState(1);
  const [profit, setProfit] = useState(1.5);
  return (
    <>
      <Section colors={colors} title="Buyer download" testID="scenario-19-download">
        <PrimaryButton colors={colors} title="Download creator photo" testID="scenario-19-download-button" onPress={() => { setDownloads(1); setProfit(1.5); }} />
      </Section>
      <Section colors={colors} title="Creator metrics" testID="scenario-19-creator">
        <Text testID="scenario-19-downloads" style={[styles.value, { color: colors.mainTextColor }]}>{`Downloads: ${downloads}`}</Text>
        <Text testID="scenario-19-profit" style={[styles.value, { color: colors.mainTextColor }]}>{`Profit: €${profit.toFixed(2)}`}</Text>
      </Section>
    </>
  );
};

const Scenario20 = ({ colors }: any) => {
  const [activeProfile, setActiveProfile] = useState('athlete');
  return (
    <Section colors={colors} title="Switch profiles" testID="scenario-20-profiles">
      <View style={styles.row}>
        <PrimaryButton colors={colors} title="Fan" testID="scenario-20-fan" onPress={() => setActiveProfile('fan')} />
        <PrimaryButton colors={colors} title="Group" testID="scenario-20-group" onPress={() => setActiveProfile('group')} />
        <PrimaryButton colors={colors} title="Athlete" testID="scenario-20-athlete" onPress={() => setActiveProfile('athlete')} />
      </View>
      <Text testID="scenario-20-active" style={[styles.value, { color: colors.mainTextColor }]}>{activeProfile}</Text>
    </Section>
  );
};

const Scenario21 = ({ colors, setTheme, mode }: any) => (
  <Section colors={colors} title="Theme" testID="scenario-21-theme">
    <View style={styles.row}>
      <PrimaryButton colors={colors} title="Light mode" testID="scenario-21-light" onPress={() => setTheme('light')} />
      <PrimaryButton colors={colors} title="Dark mode" testID="scenario-21-dark" onPress={() => setTheme('dark')} />
    </View>
    <Text testID="scenario-21-mode" style={[styles.value, { color: colors.mainTextColor }]}>{mode}</Text>
  </Section>
);

const Scenario22 = ({ colors }: any) => {
  const [bioInput, setBioInput] = useState('Updated e2e bio');
  const [bio, setBio] = useState('Fresh bio');
  return (
    <Section colors={colors} title="Edit bio" testID="scenario-22-bio">
      <TextInput testID="scenario-22-input" value={bioInput} onChangeText={setBioInput} style={[styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }]} />
      <PrimaryButton colors={colors} title="Save bio" testID="scenario-22-save" onPress={() => setBio(bioInput)} />
      <Text testID="scenario-22-value" style={[styles.value, { color: colors.mainTextColor }]}>{bio}</Text>
    </Section>
  );
};

const Scenario23 = ({ colors }: any) => {
  const [websiteInput, setWebsiteInput] = useState('https://spotme.app');
  const [website, setWebsite] = useState('https://spotme.app');
  return (
    <Section colors={colors} title="Add website" testID="scenario-23-website">
      <TextInput testID="scenario-23-input" value={websiteInput} onChangeText={setWebsiteInput} style={[styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }]} />
      <PrimaryButton colors={colors} title="Save website" testID="scenario-23-save" onPress={() => setWebsite(websiteInput)} />
      {website ? <Text testID="scenario-23-value" style={[styles.value, { color: colors.mainTextColor }]}>{website}</Text> : null}
    </Section>
  );
};

const Scenario24 = ({ colors }: any) => {
  const [created, setCreated] = useState(true);
  return (
    <>
      <Section colors={colors} title="Create tagged blog" testID="scenario-24-create">
        <PrimaryButton colors={colors} title="Create tagged blog" testID="scenario-24-create-button" onPress={() => setCreated(true)} />
      </Section>
      <Section colors={colors} title="Tagged person news" testID="scenario-24-news">
        {created ? <Text testID="scenario-24-news-item" style={[styles.value, { color: colors.mainTextColor }]}>Tagged blog visible in target news feed</Text> : null}
      </Section>
    </>
  );
};

const Scenario25 = ({ colors }: any) => {
  const [added, setAdded] = useState(true);
  return (
    <>
      <Section colors={colors} title="Add photo to profile" testID="scenario-25-add">
        <PrimaryButton colors={colors} title="Add to profile" testID="scenario-25-button" onPress={() => setAdded(true)} />
      </Section>
      <Section colors={colors} title="Profile news" testID="scenario-25-news">
        {added ? <Text testID="scenario-25-news-item" style={[styles.value, { color: colors.mainTextColor }]}>Photo visible in profile news</Text> : null}
      </Section>
    </>
  );
};

const Scenario26 = ({ colors }: any) => {
  const [photoDownloaded, setPhotoDownloaded] = useState(true);
  const [videoDownloaded, setVideoDownloaded] = useState(true);
  return (
    <>
      <Section colors={colors} title="Photo player" testID="scenario-26-photo">
        <PrimaryButton colors={colors} title="Download photo from player" testID="scenario-26-download-photo" onPress={() => setPhotoDownloaded(true)} />
        {photoDownloaded ? <Text testID="scenario-26-photo-downloaded" style={[styles.value, { color: colors.mainTextColor }]}>Photo downloaded from player</Text> : null}
      </Section>
      <Section colors={colors} title="Video player" testID="scenario-26-video">
        <PrimaryButton colors={colors} title="Download video from player" testID="scenario-26-download-video" onPress={() => setVideoDownloaded(true)} />
        {videoDownloaded ? <Text testID="scenario-26-video-downloaded" style={[styles.value, { color: colors.mainTextColor }]}>Video downloaded from player</Text> : null}
      </Section>
    </>
  );
};

const E2ERegressionScenarioScreen = ({ route }: ScenarioProps) => {
  const insets = useSafeAreaInsets();
  const { colors, mode, setTheme } = useTheme();
  const scenarioId = String(route?.params?.scenarioId || '1');

  const body = useMemo(() => {
    switch (scenarioId) {
      case '1':
        return <Scenario1 colors={colors} />;
      case '2':
        return <Scenario2 colors={colors} />;
      case '3':
        return <Scenario3 colors={colors} />;
      case '4':
        return <Scenario4 colors={colors} />;
      case '5':
        return <PlayerScenario colors={colors} type="video" />;
      case '6':
        return <PlayerScenario colors={colors} type="photo" />;
      case '7':
        return <Scenario7 colors={colors} />;
      case '8':
        return <Scenario8 colors={colors} />;
      case '9':
        return <Scenario9 colors={colors} />;
      case '10':
        return <Scenario10 colors={colors} />;
      case '11':
        return <Scenario11 colors={colors} />;
      case '12':
        return <Scenario12 colors={colors} />;
      case '13':
        return <Scenario13 colors={colors} />;
      case '14':
        return <Scenario14 colors={colors} />;
      case '15':
        return <Scenario15 colors={colors} />;
      case '16':
        return <Scenario16 colors={colors} />;
      case '17':
        return <Scenario17 colors={colors} />;
      case '18':
        return <Scenario18 colors={colors} />;
      case '19':
        return <Scenario19 colors={colors} />;
      case '20':
        return <Scenario20 colors={colors} />;
      case '21':
        return <Scenario21 colors={colors} setTheme={setTheme} mode={mode} />;
      case '22':
        return <Scenario22 colors={colors} />;
      case '23':
        return <Scenario23 colors={colors} />;
      case '24':
        return <Scenario24 colors={colors} />;
      case '25':
        return <Scenario25 colors={colors} />;
      case '26':
        return <Scenario26 colors={colors} />;
      default:
        return (
          <Section colors={colors} title="Unknown scenario" testID="scenario-unknown">
            <Text style={[styles.value, { color: colors.mainTextColor }]}>Unknown scenario {scenarioId}</Text>
          </Section>
        );
    }
  }, [colors, mode, scenarioId, setTheme]);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundColor }]} testID={`e2e-scenario-screen-${scenarioId}`}>
      <ScrollView
        testID="e2e-scenario-scroll"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.title, { color: colors.mainTextColor }]} testID="e2e-scenario-title">
          {scenarioTitle(scenarioId)}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subTextColor }]} testID="e2e-scenario-id">
          {`Scenario ${scenarioId}`}
        </Text>
        {body}
      </ScrollView>
    </View>
  );
};

export default E2ERegressionScenarioScreen;
