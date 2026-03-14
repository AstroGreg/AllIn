import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { createStyles } from '../HomeStyles';
import Icons from '../../../constants/Icons';
import SizeBox from '../../../constants/SizeBox';
import BorderButton from '../../../components/borderButton/BorderButton';
import Video from 'react-native-video';
import ActionBtn from './ActionBtn';
import ShimmerEffect from '../../../components/shimmerEffect/ShimmerEffect';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const CompetitionContainer = ({ videoUri, CompetitionName, map, location, date, onPress, isActions = false, onPressContainer }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const handleVideoPress = () => {
        setIsPlaying(!isPlaying);
    };
    return (_jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.7, style: styles.CompetitionContainer, onPress: onPressContainer }, { children: [_jsx(View, Object.assign({ style: styles.VideoContainer }, { children: _jsxs(TouchableOpacity, Object.assign({ style: styles.videoWrapper, onPress: handleVideoPress, activeOpacity: 0.9 }, { children: [isLoading && (_jsx(View, Object.assign({ style: [StyleSheet.absoluteFill, { zIndex: 1 }] }, { children: _jsx(ShimmerEffect, { width: "100%", height: "100%", borderRadius: 8 }) }))), _jsx(Video, { source: { uri: videoUri }, style: { width: '100%', height: '100%' }, controls: isPlaying, resizeMode: "cover", poster: "placeholder-image-url" // Add a placeholder image URL
                            , posterResizeMode: "cover", repeat: false, paused: !isPlaying, onLoad: () => setIsLoading(false), onError: () => setIsLoading(false) }), !isPlaying && (_jsx(View, Object.assign({ style: styles.playButtonOverlay }, { children: _jsx(View, Object.assign({ style: styles.playButton }, { children: _jsx(Icons.PlayCricle, { width: 32, height: 32 }) })) })))] })) })), _jsx(SizeBox, { height: 11 }), _jsxs(View, Object.assign({ style: styles.rowCenter }, { children: [_jsx(Icons.competitionCalendar, { height: 20, width: 20 }), _jsx(SizeBox, { width: 6 }), _jsx(Text, Object.assign({ numberOfLines: 1, style: styles.eventTitle }, { children: CompetitionName }))] })), _jsx(SizeBox, { height: 6 }), map &&
                _jsxs(View, Object.assign({ style: styles.rowCenter }, { children: [_jsx(Icons.Map, { height: 16, width: 16 }), _jsx(SizeBox, { width: 6 }), _jsx(Text, Object.assign({ numberOfLines: 1, style: styles.eventSubText }, { children: map }))] })), _jsx(SizeBox, { height: 6 }), _jsxs(View, Object.assign({ style: [styles.rowCenter] }, { children: [_jsxs(View, Object.assign({ style: [styles.rowCenter, { width: '50%' }] }, { children: [_jsx(Icons.Location, { height: 16, width: 16 }), _jsx(SizeBox, { width: 6 }), _jsx(Text, Object.assign({ numberOfLines: 1, style: styles.eventSubText }, { children: location }))] })), _jsxs(View, Object.assign({ style: [styles.rowCenter, { width: '50%' }] }, { children: [_jsx(Icons.CalendarGrey, { height: 16, width: 16 }), _jsx(SizeBox, { width: 6 }), _jsx(Text, Object.assign({ numberOfLines: 1, style: styles.eventSubText }, { children: date }))] }))] })), _jsx(SizeBox, { height: 12 }), isActions ?
                _jsxs(View, Object.assign({ style: [styles.rowCenter, { justifyContent: 'space-between' }] }, { children: [_jsx(ActionBtn, { title: t('Edit'), icon: _jsx(Icons.Edit, { height: 14, width: 14 }) }), _jsx(ActionBtn, { title: t('Delete'), icon: _jsx(Icons.DeleteCompetition, { height: 14, width: 14 }) })] }))
                : _jsx(BorderButton, { title: t('Participant'), onPress: onPress })] })));
};
export default CompetitionContainer;
