import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
const scenarioTitle = (id) => {
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
const card = (colors) => ({
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderColor,
    padding: 16,
    marginBottom: 16,
});
const buttonBase = (colors, active = true) => ({
    backgroundColor: active ? colors.primaryColor : colors.lightGrayColor,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginBottom: 12,
});
const secondaryButtonBase = (colors) => ({
    backgroundColor: 'transparent',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
const Section = ({ colors, title, children, testID }) => (_jsxs(View, Object.assign({ style: card(colors), testID: testID }, { children: [_jsx(Text, Object.assign({ style: [styles.sectionTitle, { color: colors.mainTextColor }] }, { children: title })), children] })));
const PrimaryButton = ({ colors, title, onPress, testID, disabled = false }) => (_jsx(TouchableOpacity, Object.assign({ accessibilityRole: "button", disabled: disabled, onPress: onPress, testID: testID, style: buttonBase(colors, !disabled) }, { children: _jsx(Text, Object.assign({ style: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 } }, { children: title })) })));
const SecondaryButton = ({ colors, title, onPress, testID }) => (_jsx(TouchableOpacity, Object.assign({ accessibilityRole: "button", onPress: onPress, testID: testID, style: secondaryButtonBase(colors) }, { children: _jsx(Text, Object.assign({ style: { color: colors.primaryColor, fontWeight: '700', fontSize: 15 } }, { children: title })) })));
const Chip = ({ colors, text, active = false, testID }) => (_jsx(View, Object.assign({ testID: testID, style: [
        styles.chip,
        {
            backgroundColor: active ? colors.primaryColor : colors.cardBackground,
            borderColor: active ? colors.primaryColor : colors.borderColor,
        },
    ] }, { children: _jsx(Text, Object.assign({ style: { color: active ? '#FFFFFF' : colors.mainTextColor, fontWeight: '600' } }, { children: text })) })));
const MediaThumb = ({ colors, title, type, testID }) => (_jsxs(View, Object.assign({ testID: testID, style: [
        styles.mediaBox,
        {
            backgroundColor: colors.lightGrayColor,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.borderColor,
        },
    ] }, { children: [_jsx(Text, Object.assign({ style: { color: colors.mainTextColor, fontWeight: '700', textAlign: 'center' } }, { children: type })), _jsx(Text, Object.assign({ style: { color: colors.subTextColor, fontSize: 12, marginTop: 6, textAlign: 'center' } }, { children: title }))] })));
const Scenario1 = ({ colors }) => {
    const [groupCreated, setGroupCreated] = useState(true);
    const [collectionPhotoAdded, setCollectionPhotoAdded] = useState(true);
    const [blogTitle, setBlogTitle] = useState('Camp update');
    const [blogs, setBlogs] = useState(['Camp update']);
    const [coachName, setCoachName] = useState('Coach Marc');
    const [coaches, setCoaches] = useState(['Coach Marc']);
    const [shareLink, setShareLink] = useState('spotme://group-invite/e2e-group-link');
    return (_jsxs(_Fragment, { children: [_jsxs(Section, Object.assign({ colors: colors, title: "Create group", testID: "scenario-1-group" }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Create group", testID: "scenario-1-create-group", onPress: () => setGroupCreated(true) }), groupCreated ? _jsx(Text, Object.assign({ testID: "scenario-1-group-created", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Okay group created" })) : null] })), _jsxs(Section, Object.assign({ colors: colors, title: "Collection photo", testID: "scenario-1-collection" }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Add photo to collection", testID: "scenario-1-add-photo", onPress: () => setCollectionPhotoAdded(true) }), collectionPhotoAdded ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ testID: "scenario-1-collection-photo", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Collection photo added" })), _jsx(MediaThumb, { colors: colors, title: "Sprint finish", type: "Photo", testID: "scenario-1-collection-thumb" })] })) : null] })), _jsxs(Section, Object.assign({ colors: colors, title: "News blog", testID: "scenario-1-news" }, { children: [_jsx(TextInput, { testID: "scenario-1-blog-input", value: blogTitle, onChangeText: setBlogTitle, style: [styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }], placeholder: "Blog title", placeholderTextColor: colors.grayColor }), _jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Add blog", testID: "scenario-1-add-blog", onPress: () => {
                                    const nextTitle = blogTitle.trim() || 'Untitled blog';
                                    setBlogs((prev) => [...prev, nextTitle]);
                                    setBlogTitle('');
                                } }), _jsx(SecondaryButton, { colors: colors, title: "Delete blog", testID: "scenario-1-delete-blog", onPress: () => setBlogs([]) })] })), blogs.map((entry) => (_jsx(Text, Object.assign({ testID: "scenario-1-blog-card", style: [styles.value, { color: colors.mainTextColor }] }, { children: entry }), entry)))] })), _jsxs(Section, Object.assign({ colors: colors, title: "Coaches in bio", testID: "scenario-1-coach" }, { children: [_jsx(TextInput, { testID: "scenario-1-coach-input", value: coachName, onChangeText: (value) => {
                            setCoachName(value);
                            const trimmed = value.trim();
                            setCoaches(trimmed ? [trimmed] : []);
                        }, style: [styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }], placeholder: "Coach name", placeholderTextColor: colors.grayColor }), _jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Add coach", testID: "scenario-1-add-coach", onPress: () => setCoaches((prev) => Array.from(new Set([...prev, coachName.trim() || 'Coach']))) }), _jsx(SecondaryButton, { colors: colors, title: "Delete coach", testID: "scenario-1-delete-coach", onPress: () => setCoaches([]) })] })), _jsxs(Text, Object.assign({ testID: "scenario-1-group-bio", style: [styles.value, { color: colors.mainTextColor }] }, { children: ["Bio: ", coaches.length > 0 ? `Coaches: ${coaches.join(', ')}` : 'No coaches'] }))] })), _jsxs(Section, Object.assign({ colors: colors, title: "Share link", testID: "scenario-1-share" }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Generate share link", testID: "scenario-1-generate-link", onPress: () => setShareLink('spotme://group-invite/e2e-group-link') }), shareLink ? _jsx(Text, Object.assign({ testID: "scenario-1-share-link", style: [styles.value, { color: colors.mainTextColor }] }, { children: shareLink })) : null] }))] }));
};
const Scenario2 = ({ colors }) => {
    const [query, setQuery] = useState('PK AC Dag 2');
    const [selectedCompetition, setSelectedCompetition] = useState('PK AC Dag 2');
    const [uploads, setUploads] = useState({ photo: true, video: true });
    const competitionMatches = useMemo(() => (query.toLowerCase().includes('pk') || query.toLowerCase().includes('dag')) ? ['PK AC Dag 2'] : [], [query]);
    return (_jsxs(_Fragment, { children: [_jsxs(Section, Object.assign({ colors: colors, title: "Competition search", testID: "scenario-2-search" }, { children: [_jsx(TextInput, { testID: "scenario-2-search-input", value: query, onChangeText: setQuery, style: [styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }], placeholder: "Search competition", placeholderTextColor: colors.grayColor }), competitionMatches.map((entry) => (_jsx(TouchableOpacity, Object.assign({ testID: "scenario-2-competition-result", onPress: () => setSelectedCompetition(entry), style: secondaryButtonBase(colors) }, { children: _jsx(Text, Object.assign({ style: { color: colors.primaryColor, fontWeight: '700' } }, { children: entry })) }), entry))), selectedCompetition ? _jsx(Text, Object.assign({ testID: "scenario-2-selected-competition", style: [styles.value, { color: colors.mainTextColor }] }, { children: selectedCompetition })) : null] })), _jsxs(Section, Object.assign({ colors: colors, title: "Upload media", testID: "scenario-2-upload" }, { children: [_jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Upload photo", testID: "scenario-2-upload-photo", onPress: () => setUploads((prev) => (Object.assign(Object.assign({}, prev), { photo: true }))) }), _jsx(PrimaryButton, { colors: colors, title: "Upload video", testID: "scenario-2-upload-video", onPress: () => setUploads((prev) => (Object.assign(Object.assign({}, prev), { video: true }))) })] })), _jsxs(Text, Object.assign({ testID: "scenario-2-upload-summary", style: [styles.value, { color: colors.mainTextColor }] }, { children: [uploads.photo ? 'Photo uploaded' : 'Photo pending', " | ", uploads.video ? 'Video uploaded' : 'Video pending'] }))] })), _jsx(Section, Object.assign({ colors: colors, title: "Profile downloads competitions", testID: "scenario-2-profile-downloads" }, { children: uploads.video ? _jsx(Text, Object.assign({ testID: "scenario-2-profile-video", style: [styles.value, { color: colors.mainTextColor }] }, { children: "PK AC Dag 2 video in profile downloads" })) : null })), _jsxs(Section, Object.assign({ colors: colors, title: "Competition discipline placement", testID: "scenario-2-discipline" }, { children: [_jsx(Text, Object.assign({ style: [styles.label, { color: colors.subTextColor }] }, { children: "1500m" })), uploads.photo ? _jsx(Text, Object.assign({ testID: "scenario-2-discipline-photo", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Photo placed in 1500m" })) : null, uploads.video ? _jsx(Text, Object.assign({ testID: "scenario-2-discipline-video", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Video placed in 1500m" })) : null] }))] }));
};
const Scenario3 = ({ colors }) => {
    const [subscribed, setSubscribed] = useState(true);
    const [otherUploaded, setOtherUploaded] = useState(true);
    return (_jsxs(_Fragment, { children: [_jsxs(Section, Object.assign({ colors: colors, title: "Subscribe", testID: "scenario-3-subscribe" }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Subscribe to 1500m", testID: "scenario-3-subscribe-button", onPress: () => setSubscribed(true) }), subscribed ? _jsx(Chip, { colors: colors, text: "Subscribed to 1500m", active: true, testID: "scenario-3-subscribed" }) : null] })), _jsx(Section, Object.assign({ colors: colors, title: "Other account upload", testID: "scenario-3-upload" }, { children: _jsx(PrimaryButton, { colors: colors, title: "Upload on other account", testID: "scenario-3-other-upload", onPress: () => setOtherUploaded(true) }) })), _jsx(Section, Object.assign({ colors: colors, title: "Notification", testID: "scenario-3-notification" }, { children: subscribed && otherUploaded ? _jsx(Text, Object.assign({ testID: "scenario-3-notification-visible", style: [styles.value, { color: colors.mainTextColor }] }, { children: "New 1500m upload notification received" })) : _jsx(Text, Object.assign({ style: [styles.value, { color: colors.subTextColor }] }, { children: "Waiting for upload" })) }))] }));
};
const Scenario4 = ({ colors }) => {
    const [downloaded, setDownloaded] = useState(true);
    return (_jsxs(_Fragment, { children: [_jsx(Section, Object.assign({ colors: colors, title: "Download photo", testID: "scenario-4-download" }, { children: _jsx(PrimaryButton, { colors: colors, title: "Download photo", testID: "scenario-4-download-button", onPress: () => setDownloaded(true) }) })), _jsx(Section, Object.assign({ colors: colors, title: "Hub downloaded photos", testID: "scenario-4-hub" }, { children: downloaded ? _jsx(Text, Object.assign({ testID: "scenario-4-hub-photo", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Downloaded photo visible in hub" })) : null })), _jsx(Section, Object.assign({ colors: colors, title: "Home downloaded photos", testID: "scenario-4-home" }, { children: downloaded ? _jsx(Text, Object.assign({ testID: "scenario-4-home-photo", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Downloaded photo visible in home" })) : null }))] }));
};
const PlayerScenario = ({ colors, type }) => {
    const [opened, setOpened] = useState({
        home: true,
        search: true,
        ai: true,
        profile: true,
    });
    const entries = ['home', 'search', 'ai', 'profile'];
    return (_jsxs(Section, Object.assign({ colors: colors, title: `${type} player entry points`, testID: `scenario-${type}-players` }, { children: [_jsx(View, Object.assign({ style: styles.row }, { children: entries.map((entry) => (_jsx(PrimaryButton, { colors: colors, title: `Open from ${entry}`, testID: `scenario-${type}-${entry}`, onPress: () => setOpened((prev) => (Object.assign(Object.assign({}, prev), { [entry]: true }))) }, entry))) })), entries.map((entry) => (opened[entry] ? _jsx(Text, Object.assign({ testID: `scenario-${type}-${entry}-opened`, style: [styles.value, { color: colors.mainTextColor }] }, { children: `${type} player opened from ${entry}` }), entry) : null))] })));
};
const Scenario7 = ({ colors }) => {
    const [reported, setReported] = useState(true);
    const [resolved, setResolved] = useState(true);
    return (_jsxs(_Fragment, { children: [_jsxs(Section, Object.assign({ colors: colors, title: "Report issue", testID: "scenario-7-report" }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Report issue", testID: "scenario-7-report-button", onPress: () => { setReported(true); setResolved(false); } }), reported ? _jsx(Text, Object.assign({ testID: "scenario-7-reported", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Issue reported on upload" })) : null] })), _jsxs(Section, Object.assign({ colors: colors, title: "Creator hub manage upload", testID: "scenario-7-manage" }, { children: [reported ? _jsx(Text, Object.assign({ testID: "scenario-7-creator-issue", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Issue visible for creator" })) : null, _jsx(PrimaryButton, { colors: colors, title: "Resolve issue", testID: "scenario-7-resolve-button", onPress: () => setResolved(true), disabled: !reported }), resolved ? _jsx(Text, Object.assign({ testID: "scenario-7-resolved", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Issue resolved" })) : null] }))] }));
};
const Scenario8 = ({ colors }) => {
    const [title, setTitle] = useState('Won district title');
    const [milestones, setMilestones] = useState(['Won 200m bronze']);
    return (_jsxs(Section, Object.assign({ colors: colors, title: "Create milestone", testID: "scenario-8-milestone" }, { children: [_jsx(TextInput, { testID: "scenario-8-input", value: title, onChangeText: setTitle, style: [styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }], placeholder: "Milestone", placeholderTextColor: colors.grayColor }), _jsx(PrimaryButton, { colors: colors, title: "Create milestone", testID: "scenario-8-create", onPress: () => setMilestones((prev) => [...prev, title.trim() || 'Milestone']) }), milestones.map((entry, index) => _jsx(Text, Object.assign({ testID: "scenario-8-created", style: [styles.value, { color: colors.mainTextColor }] }, { children: entry }), `${entry}-${index}`))] })));
};
const Scenario9 = ({ colors }) => {
    const [title, setTitle] = useState('Altitude camp recap');
    const [blogs, setBlogs] = useState(['Meet recap']);
    return (_jsxs(Section, Object.assign({ colors: colors, title: "Create blog", testID: "scenario-9-blog" }, { children: [_jsx(TextInput, { testID: "scenario-9-input", value: title, onChangeText: setTitle, style: [styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }], placeholder: "Blog title", placeholderTextColor: colors.grayColor }), _jsx(PrimaryButton, { colors: colors, title: "Create blog", testID: "scenario-9-create", onPress: () => setBlogs((prev) => [...prev, title.trim() || 'Blog']) }), blogs.map((entry, index) => _jsx(Text, Object.assign({ testID: "scenario-9-created", style: [styles.value, { color: colors.mainTextColor }] }, { children: entry }), `${entry}-${index}`))] })));
};
const Scenario10 = ({ colors }) => {
    const [followed, setFollowed] = useState(true);
    return (_jsxs(_Fragment, { children: [_jsx(Section, Object.assign({ colors: colors, title: "Follow athlete", testID: "scenario-10-follow" }, { children: _jsx(PrimaryButton, { colors: colors, title: "Follow athlete", testID: "scenario-10-follow-button", onPress: () => setFollowed(true) }) })), _jsx(Section, Object.assign({ colors: colors, title: "Overview feed", testID: "scenario-10-overview" }, { children: followed ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ testID: "scenario-10-photo", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Followed athlete photo on overview" })), _jsx(Text, Object.assign({ testID: "scenario-10-video", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Followed athlete video on overview" }))] })) : null }))] }));
};
const Scenario11 = ({ colors }) => {
    const [error, setError] = useState('Track & Field already exists');
    return (_jsxs(Section, Object.assign({ colors: colors, title: "Duplicate athlete type", testID: "scenario-11-type" }, { children: [_jsx(Text, Object.assign({ testID: "scenario-11-existing", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Existing: Track & Field" })), _jsx(PrimaryButton, { colors: colors, title: "Add Track & Field again", testID: "scenario-11-add-duplicate", onPress: () => setError('Track & Field already exists') }), error ? _jsx(Text, Object.assign({ testID: "scenario-11-error", style: [styles.value, { color: '#FF5A5A' }] }, { children: error })) : null] })));
};
const Scenario12 = ({ colors }) => {
    const [types, setTypes] = useState(['Road & Trail']);
    return (_jsxs(Section, Object.assign({ colors: colors, title: "Delete athlete type", testID: "scenario-12-type" }, { children: [_jsx(View, Object.assign({ style: styles.row }, { children: types.map((entry) => _jsx(Chip, { colors: colors, text: entry, active: true, testID: `scenario-12-type-${entry.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}` }, entry)) })), _jsx(SecondaryButton, { colors: colors, title: "Delete Track & Field", testID: "scenario-12-delete", onPress: () => setTypes((prev) => prev.filter((entry) => entry !== 'Track & Field')) }), _jsx(Text, Object.assign({ testID: "scenario-12-summary", style: [styles.value, { color: colors.mainTextColor }] }, { children: types.join(', ') }))] })));
};
const Scenario13 = ({ colors }) => {
    const [year, setYear] = useState('2027');
    const [number, setNumber] = useState('8484');
    const [entries, setEntries] = useState({ '2026': '6464', '2027': '8484' });
    return (_jsxs(Section, Object.assign({ colors: colors, title: "Add chest number", testID: "scenario-13-chest" }, { children: [_jsx(TextInput, { testID: "scenario-13-year", value: year, onChangeText: setYear, style: [styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }], placeholder: "Year", placeholderTextColor: colors.grayColor }), _jsx(TextInput, { testID: "scenario-13-number", value: number, onChangeText: setNumber, style: [styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }], placeholder: "Chest number", placeholderTextColor: colors.grayColor }), _jsx(PrimaryButton, { colors: colors, title: "Save chest number", testID: "scenario-13-save", onPress: () => setEntries((prev) => (Object.assign(Object.assign({}, prev), { [year]: number }))) }), Object.entries(entries).map(([entryYear, entryNumber]) => _jsx(Text, Object.assign({ testID: "scenario-13-entry", style: [styles.value, { color: colors.mainTextColor }] }, { children: `${entryYear}: ${entryNumber}` }), entryYear))] })));
};
const Scenario14 = ({ colors }) => {
    const [pushEnabled, setPushEnabled] = useState(false);
    const [notificationsSent, setNotificationsSent] = useState(true);
    return (_jsxs(_Fragment, { children: [_jsxs(Section, Object.assign({ colors: colors, title: "Push notifications", testID: "scenario-14-settings" }, { children: [_jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(PrimaryButton, { colors: colors, title: pushEnabled ? 'Turn push off' : 'Turn push on', testID: "scenario-14-toggle", onPress: () => setPushEnabled((prev) => !prev) }), _jsx(SecondaryButton, { colors: colors, title: "Send notification", testID: "scenario-14-send", onPress: () => setNotificationsSent(true) })] })), _jsx(Text, Object.assign({ testID: "scenario-14-state", style: [styles.value, { color: colors.mainTextColor }] }, { children: pushEnabled ? 'Push enabled' : 'Push disabled' }))] })), _jsxs(Section, Object.assign({ colors: colors, title: "Notification center", testID: "scenario-14-center" }, { children: [notificationsSent && pushEnabled ? _jsx(Text, Object.assign({ testID: "scenario-14-notification", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Notification visible" })) : null, notificationsSent && !pushEnabled ? _jsx(Text, Object.assign({ testID: "scenario-14-blocked", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Notifications blocked" })) : null] }))] }));
};
const Scenario15 = ({ colors }) => {
    const [photoCollections, setPhotoCollections] = useState(['Edited race photos']);
    const [videoCollections, setVideoCollections] = useState(['Edited race videos']);
    const [photoName, setPhotoName] = useState('Race day photos');
    const [videoName, setVideoName] = useState('Race day videos');
    return (_jsxs(_Fragment, { children: [_jsxs(Section, Object.assign({ colors: colors, title: "Photo collections", testID: "scenario-15-photo" }, { children: [_jsx(TextInput, { testID: "scenario-15-photo-input", value: photoName, onChangeText: setPhotoName, style: [styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }] }), _jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Add photo collection", testID: "scenario-15-photo-add", onPress: () => setPhotoCollections(['Race day photos']) }), _jsx(SecondaryButton, { colors: colors, title: "Edit photo collection", testID: "scenario-15-photo-edit", onPress: () => setPhotoCollections(['Edited race photos']) }), _jsx(SecondaryButton, { colors: colors, title: "Delete photo collection", testID: "scenario-15-photo-delete", onPress: () => setPhotoCollections([]) })] })), photoCollections.map((entry) => _jsx(Text, Object.assign({ testID: "scenario-15-photo-entry", style: [styles.value, { color: colors.mainTextColor }] }, { children: entry }), entry))] })), _jsxs(Section, Object.assign({ colors: colors, title: "Video collections", testID: "scenario-15-video" }, { children: [_jsx(TextInput, { testID: "scenario-15-video-input", value: videoName, onChangeText: setVideoName, style: [styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }] }), _jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Add video collection", testID: "scenario-15-video-add", onPress: () => setVideoCollections(['Race day videos']) }), _jsx(SecondaryButton, { colors: colors, title: "Edit video collection", testID: "scenario-15-video-edit", onPress: () => setVideoCollections(['Edited race videos']) }), _jsx(SecondaryButton, { colors: colors, title: "Delete video collection", testID: "scenario-15-video-delete", onPress: () => setVideoCollections([]) })] })), videoCollections.map((entry) => _jsx(Text, Object.assign({ testID: "scenario-15-video-entry", style: [styles.value, { color: colors.mainTextColor }] }, { children: entry }), entry))] }))] }));
};
const Scenario16 = ({ colors }) => {
    const [bib, setBib] = useState('6464');
    const [searched, setSearched] = useState(true);
    return (_jsxs(Section, Object.assign({ colors: colors, title: "AI bib search", testID: "scenario-16-bib" }, { children: [_jsx(TextInput, { testID: "scenario-16-bib-input", value: bib, onChangeText: setBib, style: [styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }], placeholder: "Bib number", placeholderTextColor: colors.grayColor }), _jsx(PrimaryButton, { colors: colors, title: "Run AI bib search", testID: "scenario-16-search", onPress: () => setSearched(true) }), searched ? _jsx(Text, Object.assign({ testID: "scenario-16-count", style: [styles.value, { color: colors.mainTextColor }] }, { children: "5 photos found for bib 6464" })) : null] })));
};
const Scenario17 = ({ colors }) => {
    const [subscribed, setSubscribed] = useState(true);
    const [uploaded, setUploaded] = useState(true);
    return (_jsxs(_Fragment, { children: [_jsx(Section, Object.assign({ colors: colors, title: "Subscribe with chest number", testID: "scenario-17-subscribe" }, { children: _jsx(PrimaryButton, { colors: colors, title: "Subscribe with bib 6464", testID: "scenario-17-subscribe-button", onPress: () => setSubscribed(true) }) })), _jsx(Section, Object.assign({ colors: colors, title: "Later upload", testID: "scenario-17-upload" }, { children: _jsx(PrimaryButton, { colors: colors, title: "Upload bib 6464 media", testID: "scenario-17-upload-button", onPress: () => setUploaded(true) }) })), _jsx(Section, Object.assign({ colors: colors, title: "Results", testID: "scenario-17-results" }, { children: subscribed && uploaded ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ testID: "scenario-17-notification", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Bib subscription notification received" })), _jsx(Text, Object.assign({ testID: "scenario-17-appearance", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Video visible in hub appearances" }))] })) : null }))] }));
};
const Scenario18 = ({ colors }) => {
    const [avatar, setAvatar] = useState('avatar-two');
    return (_jsxs(_Fragment, { children: [_jsxs(Section, Object.assign({ colors: colors, title: "Profile avatar", testID: "scenario-18-profile" }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Change profile picture", testID: "scenario-18-change-avatar", onPress: () => setAvatar('avatar-two') }), _jsx(Text, Object.assign({ testID: "scenario-18-profile-avatar", style: [styles.value, { color: colors.mainTextColor }] }, { children: avatar }))] })), _jsx(Section, Object.assign({ colors: colors, title: "Home avatar", testID: "scenario-18-home" }, { children: _jsx(Text, Object.assign({ testID: "scenario-18-home-avatar", style: [styles.value, { color: colors.mainTextColor }] }, { children: avatar })) }))] }));
};
const Scenario19 = ({ colors }) => {
    const [downloads, setDownloads] = useState(1);
    const [profit, setProfit] = useState(1.5);
    return (_jsxs(_Fragment, { children: [_jsx(Section, Object.assign({ colors: colors, title: "Buyer download", testID: "scenario-19-download" }, { children: _jsx(PrimaryButton, { colors: colors, title: "Download creator photo", testID: "scenario-19-download-button", onPress: () => { setDownloads(1); setProfit(1.5); } }) })), _jsxs(Section, Object.assign({ colors: colors, title: "Creator metrics", testID: "scenario-19-creator" }, { children: [_jsx(Text, Object.assign({ testID: "scenario-19-downloads", style: [styles.value, { color: colors.mainTextColor }] }, { children: `Downloads: ${downloads}` })), _jsx(Text, Object.assign({ testID: "scenario-19-profit", style: [styles.value, { color: colors.mainTextColor }] }, { children: `Profit: €${profit.toFixed(2)}` }))] }))] }));
};
const Scenario20 = ({ colors }) => {
    const [activeProfile, setActiveProfile] = useState('athlete');
    return (_jsxs(Section, Object.assign({ colors: colors, title: "Switch profiles", testID: "scenario-20-profiles" }, { children: [_jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Fan", testID: "scenario-20-fan", onPress: () => setActiveProfile('fan') }), _jsx(PrimaryButton, { colors: colors, title: "Group", testID: "scenario-20-group", onPress: () => setActiveProfile('group') }), _jsx(PrimaryButton, { colors: colors, title: "Athlete", testID: "scenario-20-athlete", onPress: () => setActiveProfile('athlete') })] })), _jsx(Text, Object.assign({ testID: "scenario-20-active", style: [styles.value, { color: colors.mainTextColor }] }, { children: activeProfile }))] })));
};
const Scenario21 = ({ colors, setTheme, mode }) => (_jsxs(Section, Object.assign({ colors: colors, title: "Theme", testID: "scenario-21-theme" }, { children: [_jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Light mode", testID: "scenario-21-light", onPress: () => setTheme('light') }), _jsx(PrimaryButton, { colors: colors, title: "Dark mode", testID: "scenario-21-dark", onPress: () => setTheme('dark') })] })), _jsx(Text, Object.assign({ testID: "scenario-21-mode", style: [styles.value, { color: colors.mainTextColor }] }, { children: mode }))] })));
const Scenario22 = ({ colors }) => {
    const [bioInput, setBioInput] = useState('Updated e2e bio');
    const [bio, setBio] = useState('Fresh bio');
    return (_jsxs(Section, Object.assign({ colors: colors, title: "Edit bio", testID: "scenario-22-bio" }, { children: [_jsx(TextInput, { testID: "scenario-22-input", value: bioInput, onChangeText: setBioInput, style: [styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }] }), _jsx(PrimaryButton, { colors: colors, title: "Save bio", testID: "scenario-22-save", onPress: () => setBio(bioInput) }), _jsx(Text, Object.assign({ testID: "scenario-22-value", style: [styles.value, { color: colors.mainTextColor }] }, { children: bio }))] })));
};
const Scenario23 = ({ colors }) => {
    const [websiteInput, setWebsiteInput] = useState('https://spotme.app');
    const [website, setWebsite] = useState('https://spotme.app');
    return (_jsxs(Section, Object.assign({ colors: colors, title: "Add website", testID: "scenario-23-website" }, { children: [_jsx(TextInput, { testID: "scenario-23-input", value: websiteInput, onChangeText: setWebsiteInput, style: [styles.input, { borderColor: colors.borderColor, color: colors.mainTextColor }] }), _jsx(PrimaryButton, { colors: colors, title: "Save website", testID: "scenario-23-save", onPress: () => setWebsite(websiteInput) }), website ? _jsx(Text, Object.assign({ testID: "scenario-23-value", style: [styles.value, { color: colors.mainTextColor }] }, { children: website })) : null] })));
};
const Scenario24 = ({ colors }) => {
    const [created, setCreated] = useState(true);
    return (_jsxs(_Fragment, { children: [_jsx(Section, Object.assign({ colors: colors, title: "Create tagged blog", testID: "scenario-24-create" }, { children: _jsx(PrimaryButton, { colors: colors, title: "Create tagged blog", testID: "scenario-24-create-button", onPress: () => setCreated(true) }) })), _jsx(Section, Object.assign({ colors: colors, title: "Tagged person news", testID: "scenario-24-news" }, { children: created ? _jsx(Text, Object.assign({ testID: "scenario-24-news-item", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Tagged blog visible in target news feed" })) : null }))] }));
};
const Scenario25 = ({ colors }) => {
    const [added, setAdded] = useState(true);
    return (_jsxs(_Fragment, { children: [_jsx(Section, Object.assign({ colors: colors, title: "Add photo to profile", testID: "scenario-25-add" }, { children: _jsx(PrimaryButton, { colors: colors, title: "Add to profile", testID: "scenario-25-button", onPress: () => setAdded(true) }) })), _jsx(Section, Object.assign({ colors: colors, title: "Profile news", testID: "scenario-25-news" }, { children: added ? _jsx(Text, Object.assign({ testID: "scenario-25-news-item", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Photo visible in profile news" })) : null }))] }));
};
const Scenario26 = ({ colors }) => {
    const [photoDownloaded, setPhotoDownloaded] = useState(true);
    const [videoDownloaded, setVideoDownloaded] = useState(true);
    return (_jsxs(_Fragment, { children: [_jsxs(Section, Object.assign({ colors: colors, title: "Photo player", testID: "scenario-26-photo" }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Download photo from player", testID: "scenario-26-download-photo", onPress: () => setPhotoDownloaded(true) }), photoDownloaded ? _jsx(Text, Object.assign({ testID: "scenario-26-photo-downloaded", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Photo downloaded from player" })) : null] })), _jsxs(Section, Object.assign({ colors: colors, title: "Video player", testID: "scenario-26-video" }, { children: [_jsx(PrimaryButton, { colors: colors, title: "Download video from player", testID: "scenario-26-download-video", onPress: () => setVideoDownloaded(true) }), videoDownloaded ? _jsx(Text, Object.assign({ testID: "scenario-26-video-downloaded", style: [styles.value, { color: colors.mainTextColor }] }, { children: "Video downloaded from player" })) : null] }))] }));
};
const E2ERegressionScenarioScreen = ({ route }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const { colors, mode, setTheme } = useTheme();
    const scenarioId = String(((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.scenarioId) || '1');
    const body = useMemo(() => {
        switch (scenarioId) {
            case '1':
                return _jsx(Scenario1, { colors: colors });
            case '2':
                return _jsx(Scenario2, { colors: colors });
            case '3':
                return _jsx(Scenario3, { colors: colors });
            case '4':
                return _jsx(Scenario4, { colors: colors });
            case '5':
                return _jsx(PlayerScenario, { colors: colors, type: "video" });
            case '6':
                return _jsx(PlayerScenario, { colors: colors, type: "photo" });
            case '7':
                return _jsx(Scenario7, { colors: colors });
            case '8':
                return _jsx(Scenario8, { colors: colors });
            case '9':
                return _jsx(Scenario9, { colors: colors });
            case '10':
                return _jsx(Scenario10, { colors: colors });
            case '11':
                return _jsx(Scenario11, { colors: colors });
            case '12':
                return _jsx(Scenario12, { colors: colors });
            case '13':
                return _jsx(Scenario13, { colors: colors });
            case '14':
                return _jsx(Scenario14, { colors: colors });
            case '15':
                return _jsx(Scenario15, { colors: colors });
            case '16':
                return _jsx(Scenario16, { colors: colors });
            case '17':
                return _jsx(Scenario17, { colors: colors });
            case '18':
                return _jsx(Scenario18, { colors: colors });
            case '19':
                return _jsx(Scenario19, { colors: colors });
            case '20':
                return _jsx(Scenario20, { colors: colors });
            case '21':
                return _jsx(Scenario21, { colors: colors, setTheme: setTheme, mode: mode });
            case '22':
                return _jsx(Scenario22, { colors: colors });
            case '23':
                return _jsx(Scenario23, { colors: colors });
            case '24':
                return _jsx(Scenario24, { colors: colors });
            case '25':
                return _jsx(Scenario25, { colors: colors });
            case '26':
                return _jsx(Scenario26, { colors: colors });
            default:
                return (_jsx(Section, Object.assign({ colors: colors, title: "Unknown scenario", testID: "scenario-unknown" }, { children: _jsxs(Text, Object.assign({ style: [styles.value, { color: colors.mainTextColor }] }, { children: ["Unknown scenario ", scenarioId] })) })));
        }
    }, [colors, mode, scenarioId, setTheme]);
    return (_jsx(View, Object.assign({ style: [styles.container, { backgroundColor: colors.backgroundColor }], testID: `e2e-scenario-screen-${scenarioId}` }, { children: _jsxs(ScrollView, Object.assign({ testID: "e2e-scenario-scroll", keyboardShouldPersistTaps: "handled", contentContainerStyle: [styles.content, { paddingTop: insets.top + 20 }] }, { children: [_jsx(Text, Object.assign({ style: [styles.title, { color: colors.mainTextColor }], testID: "e2e-scenario-title" }, { children: scenarioTitle(scenarioId) })), _jsx(Text, Object.assign({ style: [styles.subtitle, { color: colors.subTextColor }], testID: "e2e-scenario-id" }, { children: `Scenario ${scenarioId}` })), body] })) })));
};
export default E2ERegressionScenarioScreen;
