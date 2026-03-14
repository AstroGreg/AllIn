import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useState } from 'react';
import { createStyles } from '../ViewUserProfileStyles';
import SizeBox from '../../../constants/SizeBox';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PhotosContainer from '../components/PhotosContainer';
import VideoContainer from '../components/VideoContainer';
import Images from '../../../constants/Images';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const MediaScreens = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [selectedTab, setSelectedTab] = useState(0); // 0 for Photos, 1 for videos
    const VideoData = [
        {
            id: 1,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK-2024.mp4',
            timer: '2300'
        },
        {
            id: 2,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK+studenten+2023.MP4',
            timer: '2300'
        },
        {
            id: 3,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/PK-800m.mp4',
            timer: '2300'
        },
        {
            id: 4,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/PK-1500m.mp4',
            timer: '2300'
        },
        {
            id: 5,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/PK-400m.mp4',
            timer: '2300'
        },
        {
            id: 6,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK-2024.mp4',
            timer: '2300'
        },
        {
            id: 7,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK+studenten+2023.MP4',
            timer: '2300'
        },
        {
            id: 8,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/PK-800m.mp4',
            timer: '2300'
        },
    ];
    const PhotoData = [
        {
            id: 1,
            name: 'Passionate',
            photo: Images.photo1,
            price: '$15'
        },
        {
            id: 2,
            name: 'Passionate',
            photo: Images.photo3,
            price: '$15'
        },
        {
            id: 3,
            name: 'Passionate',
            photo: Images.photo4,
            price: '$15'
        },
        {
            id: 4,
            name: 'Passionate',
            photo: Images.photo5,
            price: '$15'
        },
        {
            id: 5,
            name: 'Passionate',
            photo: Images.photo6,
            price: '$15'
        },
        {
            id: 6,
            name: 'Passionate',
            photo: Images.photo7,
            price: '$15'
        },
        {
            id: 7,
            name: 'Passionate',
            photo: Images.photo8,
            price: '$15'
        },
        {
            id: 8,
            name: 'Passionate',
            photo: Images.photo9,
            price: '$15'
        },
        {
            id: 9,
            name: 'Passionate',
            photo: Images.photo5,
            price: '$15'
        },
        {
            id: 10,
            name: 'Passionate',
            photo: Images.photo4,
            price: '$15'
        },
        {
            id: 11,
            name: 'Passionate',
            photo: Images.photo9,
            price: '$15'
        },
    ];
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(CustomHeader, { title: t('Media'), onBackPress: () => navigation.goBack(), onPressSetting: () => navigation.navigate('ProfileSettings') }), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: styles.toggleBtnContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [selectedTab === 0 && styles.selectedTab, { height: '100%' }], onPress: () => setSelectedTab(0) }, { children: _jsx(Text, Object.assign({ style: [styles.btnText, { textAlign: 'right' }, selectedTab === 0 && styles.selectedTabText] }, { children: t('Photos') })) })), _jsx(SizeBox, { width: 48 }), _jsx(TouchableOpacity, Object.assign({ style: [selectedTab === 1 && styles.selectedTab, { height: '100%' }], onPress: () => setSelectedTab(1) }, { children: _jsx(Text, Object.assign({ style: [styles.btnText, selectedTab === 1 && styles.selectedTabText, { textAlign: 'left' }] }, { children: t('Video') })) }))] })), selectedTab === 0 &&
                _jsx(FlatList, { data: PhotoData, renderItem: ({ item }) => _jsx(PhotosContainer, { photo: item.photo, name: item.name, price: item.price, onPressImg: () => navigation.navigate('PhotoDetailScreen', {
                            eventTitle: t('BK Studenten 2023'),
                            photo: {
                                title: t(`PK 2025 indoor ${item.name}`),
                                views: '122K+',
                                thumbnail: item.photo,
                            }
                        }) }), keyExtractor: (item, index) => index.toString(), numColumns: 2, contentContainerStyle: {
                        paddingRight: 20,
                        paddingTop: 20,
                    }, style: { flex: 1 }, ListFooterComponent: _jsx(SizeBox, { height: 30 }) }), selectedTab === 1 &&
                _jsx(FlatList, { data: VideoData, renderItem: ({ item }) => _jsx(VideoContainer, { event: item.name, CompetitionName: item.event, videoUri: item.videoUri, timer: item.timer, onPressVideo: () => navigation.navigate('VideoPlayingScreen', {
                            video: {
                                title: t('BK Studenten 2023'),
                                subtitle: item.event,
                                thumbnail: Images.photo1,
                            }
                        }) }), keyExtractor: (item, index) => index.toString(), numColumns: 2, contentContainerStyle: {
                        paddingRight: 20,
                        paddingTop: 20,
                    }, style: { flex: 1 }, ListFooterComponent: _jsx(SizeBox, { height: 30 }) })] })));
};
export default MediaScreens;
