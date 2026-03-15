var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import CompetitionContainer from './CompetitionContainer';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from '../HomeStyles';
import CustomButton from '../../../components/customButton/CustomButton';
import Icons from '../../../constants/Icons';
import Images from '../../../constants/Images';
import RequestContainers from './RequestContainers';
import SimilarEvents from '../../Events/components/SimilarEvents';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { getDownloadsSummary } from '../../../services/apiGateway';
const PotentialVideos = ({ data, onPressAddEvent, onPressParticipant, onPressDownloads, onPressContainer }) => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const [totalDownloads, setTotalDownloads] = useState(null);
    useEffect(() => {
        let mounted = true;
        const run = () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (!apiAccessToken) {
                if (mounted)
                    setTotalDownloads(null);
                return;
            }
            try {
                const summary = yield getDownloadsSummary(apiAccessToken);
                if (mounted)
                    setTotalDownloads(Number((_a = summary === null || summary === void 0 ? void 0 : summary.total_downloads) !== null && _a !== void 0 ? _a : 0));
            }
            catch (_b) {
                if (mounted)
                    setTotalDownloads(0);
            }
        });
        run();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken]);
    return (_jsxs(View, Object.assign({ style: {} }, { children: [_jsx(FlatList, { data: data, renderItem: ({ item }) => _jsx(CompetitionContainer, { videoUri: item.videoUri, CompetitionName: item.CompetitionName, map: item.map, location: item.location, date: item.date, onPress: onPressParticipant, onPressContainer: () => navigation.navigate('VideoPlayingScreen', {
                        video: {
                            title: item.CompetitionName || t('BK Studenten 2023'),
                            subtitle: item.map || t('Senioren, Heat 1'),
                            thumbnail: Images.photo1,
                        }
                    }) }), style: { paddingLeft: 20 }, keyExtractor: (item, index) => index.toString(), horizontal: true, showsHorizontalScrollIndicator: false }), _jsx(SizeBox, { height: 4 }), _jsx(Text, Object.assign({ style: styles.tabText }, { children: t('Followers & Spotlight') })), _jsx(SizeBox, { height: 16 }), _jsx(FlatList, { data: data, renderItem: ({ item }) => _jsx(CompetitionContainer, { videoUri: item.videoUri, CompetitionName: item.CompetitionName, map: item.map, location: item.location, date: item.date, onPress: onPressParticipant, onPressContainer: () => navigation.navigate('VideoPlayingScreen', {
                        video: {
                            title: item.CompetitionName || t('BK Studenten 2023'),
                            subtitle: item.map || t('Senioren, Heat 1'),
                            thumbnail: Images.photo1,
                        }
                    }) }), keyExtractor: (item, index) => index.toString(), horizontal: true, style: { paddingLeft: 20 }, showsHorizontalScrollIndicator: false }), _jsx(Text, Object.assign({ style: styles.headings }, { children: t('My events') })), _jsx(SizeBox, { height: 12 }), _jsx(SimilarEvents, { isSubscription: false }), _jsx(View, Object.assign({ style: { marginHorizontal: 20 } }, { children: _jsx(CustomButton, { title: t('Add Myself To Events'), onPress: onPressAddEvent }) })), _jsx(SizeBox, { height: 20 }), _jsx(Text, Object.assign({ style: styles.headings }, { children: t('Downloads') })), _jsx(SizeBox, { height: 12 }), _jsxs(TouchableOpacity, Object.assign({ style: styles.downloadContainer, onPress: onPressDownloads }, { children: [_jsx(Icons.Downloads, { height: 22, width: 22 }), _jsxs(View, Object.assign({ style: styles.rowCenter }, { children: [_jsxs(Text, Object.assign({ style: styles.downloadText }, { children: [t('Total Downloads'), ":"] })), _jsx(Text, Object.assign({ style: styles.downloadCount }, { children: totalDownloads == null ? '—' : String(totalDownloads) }))] }))] })), _jsx(SizeBox, { height: 20 }), _jsxs(View, Object.assign({ style: styles.rowCenter }, { children: [_jsx(Text, Object.assign({ style: styles.headings }, { children: t('Request for edits') })), _jsx(TouchableOpacity, Object.assign({ style: [styles.btnRight, { right: 20 }] }, { children: _jsx(Text, Object.assign({ style: [styles.eventSubText, { width: '100%', }] }, { children: t('View all') })) }))] })), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: [styles.eventSubText, { width: '100%', marginLeft: 20 }] }, { children: t('Sent') })), _jsx(SizeBox, { height: 10 }), _jsx(RequestContainers, { title: t('Enhance Lighting & Colors'), date: '12.12.2024', time: '12:00', status: t('Fixed'), isFixed: true }), _jsx(RequestContainers, { title: t('Remove Watermark/Text'), date: '12.12.2024', time: '12:00', status: t('Fixed'), isFixed: true }), _jsx(Text, Object.assign({ style: [styles.eventSubText, { width: '100%', marginLeft: 20 }] }, { children: t('Received') })), _jsx(SizeBox, { height: 10 }), _jsx(RequestContainers, { title: t('Enhance Lighting & Colors'), date: '12.12.2024', time: '12:00', status: t('Pending'), isFixed: false }), _jsx(RequestContainers, { title: t('Slow Motion Effect'), date: '12.12.2024', time: '12:00', status: t('Fixed'), isFixed: true })] })));
};
export default PotentialVideos;
