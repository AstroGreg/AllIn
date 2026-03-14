import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, ArrowRight, Image, } from 'iconsax-react-nativejs';
import { createStyles } from './VideosScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const VideosScreen = ({ navigation, route }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const eventTitle = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.eventTitle) || 'BK Studentent 23';
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const videos = [
        { id: 1, price: '€0,10', resolution: '720p', thumbnail: Images.photo1 },
        { id: 2, price: '€0,10', resolution: '1080p', thumbnail: Images.photo7 },
        { id: 3, price: '€0,10', resolution: '1920p', thumbnail: Images.photo3 },
        { id: 4, price: '€0,10', resolution: '2160p', thumbnail: Images.photo4 },
        { id: 5, price: '€0,10', resolution: '720p', thumbnail: Images.photo5 },
        { id: 6, price: '€0,10', resolution: '720p', thumbnail: Images.photo6 },
    ];
    const renderVideoCard = (video) => (_jsxs(View, Object.assign({ style: Styles.videoCard }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.videoThumbnailContainer, onPress: () => navigation.navigate('VideoPlayingScreen', {
                    video: {
                        title: 'PK 800m 2023 indoor',
                        subtitle: 'Senioren, Heat 1',
                        thumbnail: video.thumbnail,
                    },
                }) }, { children: [_jsx(FastImage, { source: video.thumbnail, style: Styles.videoThumbnail, resizeMode: "cover" }), _jsx(View, Object.assign({ style: Styles.playIconContainer }, { children: _jsx(Icons.PlayCricle, { width: 22, height: 22 }) }))] })), _jsxs(View, Object.assign({ style: Styles.videoInfo }, { children: [_jsxs(View, Object.assign({ style: Styles.videoLeftInfo }, { children: [_jsx(Text, Object.assign({ style: Styles.videoPrice }, { children: video.price })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.viewButton, onPress: () => navigation.navigate('VideoPlayingScreen', {
                                    video: {
                                        title: 'PK 800m 2023 Indoor',
                                        subtitle: 'Senioren, Heat 1',
                                        thumbnail: video.thumbnail,
                                        price: video.price,
                                    },
                                    showBuyModal: true,
                                }) }, { children: [_jsx(Text, Object.assign({ style: Styles.viewButtonText }, { children: t('View') })), _jsx(ArrowRight, { size: 12, color: colors.pureWhite, variant: "Linear" })] }))] })), _jsxs(View, Object.assign({ style: Styles.videoRightInfo }, { children: [_jsx(Text, Object.assign({ style: Styles.videoResolution }, { children: video.resolution })), _jsx(TouchableOpacity, { children: _jsx(Icons.DownloadBlue, { height: 16, width: 16 }) })] }))] }))] }), video.id));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: eventTitle })), _jsx(TouchableOpacity, Object.assign({ style: Styles.imageButton, onPress: () => navigation.goBack() }, { children: _jsx(Image, { size: 24, color: colors.primaryColor, variant: "Bold" }) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: Styles.videosHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.videosLabel }, { children: t('Videos') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.downloadAllButton }, { children: _jsx(Text, Object.assign({ style: Styles.downloadAllText }, { children: t('Download all') })) }))] })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.infoCard }, { children: [_jsx(Icons.LightbulbColorful, { height: 30, width: 30 }), _jsx(Text, Object.assign({ style: Styles.infoText }, { children: t('These videos were found based on the competitions you subscribed to.') }))] })), _jsx(SizeBox, { height: 24 }), _jsx(View, Object.assign({ style: Styles.videosGrid }, { children: videos.map(renderVideoCard) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default VideosScreen;
