import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Dimensions } from 'react-native';
import Video from 'react-native-video';
import Icons from '../../constants/Icons';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles } from './VideoStyles';
import Slider from '@react-native-community/slider';
import ReportMistakeModal from './components/ReportMistakeModal';
import DescriptionModal from './components/DescriptionModal';
import ReviewReport from './components/ReviewReport';
import SubmitionModal from './components/SubmitionModal';
import ShimmerEffect from '../../components/shimmerEffect/ShimmerEffect';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const VideoScreen = ({ navigation, route }) => {
    // const videoUrl = 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK+studenten+2023.MP4'; // sample video
    const { videoUrl } = route.params || { videoUrl: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK+studenten+2023.MP4' };
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [reportModal, setReportModal] = useState(false);
    const [descriptionModal, setDescriptionModal] = useState(false);
    const [reviewModal, setReviewModal] = useState(false);
    const [submitionModal, setSubmitionModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const screenWidth = Dimensions.get('window').width;
    const videoHeight = (screenWidth * 9) / 16; // 16:9 aspect ratio
    // Modify the onLoad function
    const onLoad = (data) => {
        setDuration(data.duration);
        setIsLoading(false);
    };
    // Add seek function
    const onSeek = (value) => {
        var _a;
        (_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.seek(value);
    };
    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };
    const handleMuteToggle = () => {
        setIsMuted(!isMuted);
    };
    const handleNext10Seconds = () => {
        var _a;
        (_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.seek(currentTime + 3);
    };
    const handlePrevious10Seconds = () => {
        var _a;
        (_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.seek(currentTime - 3);
    };
    const onProgress = (data) => {
        setCurrentTime(data.currentTime);
    };
    const handleTapVideo = () => {
        setShowControls(!showControls);
    };
    return (_jsxs(View, Object.assign({ style: Styles.container }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.topHeader }, { children: [_jsx(TouchableOpacity, Object.assign({ onPress: () => navigation.goBack() }, { children: _jsx(Icons.BackArrow, { height: 24, width: 24 }) })), _jsxs(View, Object.assign({ style: { flex: 1, marginLeft: 10 } }, { children: [_jsx(Text, Object.assign({ style: Styles.title }, { children: t('PK 800m 2023 indoor') })), _jsx(Text, Object.assign({ style: Styles.subtitle }, { children: t('Senioren, Heat 1') }))] })), _jsx(TouchableOpacity, Object.assign({ onPress: () => setReportModal(true) }, { children: _jsx(Icons.More, { height: 24, width: 24 }) }))] })), (showControls || !isPlaying) && (_jsx(View, Object.assign({ style: Styles.progressContainer }, { children: _jsx(Slider, { style: Styles.progressBar, value: currentTime, minimumValue: 0, maximumValue: duration, minimumTrackTintColor: colors.primaryColor, maximumTrackTintColor: colors.lightGrayColor, thumbTintColor: colors.primaryColor, onSlidingComplete: onSeek }) }))), isLoading && (_jsx(View, Object.assign({ style: [Styles.video] }, { children: _jsx(ShimmerEffect, { width: screenWidth, height: '100%', borderRadius: 0 }) }))), _jsx(TouchableWithoutFeedback, Object.assign({ onPress: handleTapVideo }, { children: _jsx(Video, { ref: videoRef, source: { uri: videoUrl }, style: Styles.video, resizeMode: "cover", muted: isMuted, paused: !isPlaying, repeat: true, onProgress: onProgress, onLoad: onLoad }) })), _jsxs(View, Object.assign({ style: Styles.rightActions }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.actionButton, onPress: () => console.log('Download') }, { children: _jsx(Icons.EditBlue, { height: 21, width: 21 }) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.actionButton, onPress: () => console.log('Edit') }, { children: _jsx(Icons.EditBlue, { height: 21, width: 21 }) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.actionButton, onPress: handleMuteToggle }, { children: _jsx(Icons.Volume, { height: 21, width: 21 }) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.actionButton, onPress: () => console.log('Share') }, { children: _jsx(Icons.Share, { height: 21, width: 21 }) }))] })), (showControls || !isPlaying) && (_jsxs(View, Object.assign({ style: Styles.bottomControls }, { children: [_jsx(TouchableOpacity, Object.assign({ onPress: handlePrevious10Seconds }, { children: _jsx(Icons.PreviousVideo, { height: 50, width: 50 }) })), _jsx(TouchableOpacity, Object.assign({ onPress: handlePlayPause, style: Styles.playButton }, { children: _jsx(Icons.PlayCricle, { height: 52, width: 52 }) })), _jsx(TouchableOpacity, Object.assign({ onPress: handleNext10Seconds }, { children: _jsx(Icons.NextVideo, { height: 50, width: 50 }) }))] }))), _jsx(ReportMistakeModal, { isVisible: reportModal, onClose: () => setReportModal(false), onPressNext: () => { setReportModal(false); setDescriptionModal(true); } }), _jsx(DescriptionModal, { isVisible: descriptionModal, onClose: () => setDescriptionModal(false), onPressPrevious: () => { setDescriptionModal(false); setReportModal(true); }, onPressNext: () => { setDescriptionModal(false); setReviewModal(true); } }), _jsx(ReviewReport, { isVisible: reviewModal, onClose: () => setReviewModal(false), onPressNext: () => { setReviewModal(false); setSubmitionModal(true); } }), _jsx(SubmitionModal, { isVisible: submitionModal, onClose: () => setSubmitionModal(false) })] })));
};
export default VideoScreen;
