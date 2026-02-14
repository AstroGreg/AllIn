import React, { useRef, useState } from 'react';
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

const VideoScreen = ({ navigation, route }: any) => {
    // const videoUrl = 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK+studenten+2023.MP4'; // sample video
    const { videoUrl } = route.params || { videoUrl: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK+studenten+2023.MP4' };
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const videoRef = useRef<any>(null);
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
    const onLoad = (data: any) => {
        setDuration(data.duration);
        setIsLoading(false);
    };

    // Add seek function
    const onSeek = (value: number) => {
        videoRef.current?.seek(value);
    };


    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleMuteToggle = () => {
        setIsMuted(!isMuted);
    };

    const handleNext10Seconds = () => {
        videoRef.current?.seek(currentTime + 3);
    };

    const handlePrevious10Seconds = () => {
        videoRef.current?.seek(currentTime - 3);
    };

    const onProgress = (data: any) => {
        setCurrentTime(data.currentTime);
    };

    const handleTapVideo = () => {
        setShowControls(!showControls);
    };

    return (
        <View style={Styles.container}>
            <SizeBox height={insets.top} />


            {/* Top Header */}
            <View style={Styles.topHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icons.BackArrow height={24} width={24} />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={Styles.title}>{t('PK 800m 2023 indoor')}</Text>
                    <Text style={Styles.subtitle}>{t('Senioren, Heat 1')}</Text>
                </View>

                <TouchableOpacity onPress={() => setReportModal(true)}>
                    <Icons.More height={24} width={24} />
                </TouchableOpacity>
            </View>

            {(showControls || !isPlaying) && (
                <View style={Styles.progressContainer}>
                    <Slider
                        style={Styles.progressBar}
                        value={currentTime}
                        minimumValue={0}
                        maximumValue={duration}
                        minimumTrackTintColor={colors.primaryColor}
                        maximumTrackTintColor={colors.lightGrayColor}
                        thumbTintColor={colors.primaryColor}
                        onSlidingComplete={onSeek}
                    />
                </View>
            )}

            {isLoading && (
                <View style={[Styles.video]}>
                    <ShimmerEffect
                        width={screenWidth}
                        height={'100%'}
                        borderRadius={0}
                    />
                </View>
            )}
            {/* Tap wrapper */}
            <TouchableWithoutFeedback onPress={handleTapVideo}>
                <Video
                    ref={videoRef}
                    source={{ uri: videoUrl }}
                    style={Styles.video}
                    resizeMode="cover"
                    muted={isMuted}
                    paused={!isPlaying}
                    repeat
                    onProgress={onProgress}
                    onLoad={onLoad}
                />
            </TouchableWithoutFeedback>

            {/* Right Actions */}
            <View style={Styles.rightActions}>
                <TouchableOpacity style={Styles.actionButton} onPress={() => console.log('Download')}>
                    <Icons.EditBlue height={21} width={21} />
                </TouchableOpacity>

                <TouchableOpacity style={Styles.actionButton} onPress={() => console.log('Edit')}>
                    <Icons.EditBlue height={21} width={21} />
                </TouchableOpacity>

                <TouchableOpacity style={Styles.actionButton} onPress={handleMuteToggle}>
                    <Icons.Volume height={21} width={21} />
                </TouchableOpacity>

                <TouchableOpacity style={Styles.actionButton} onPress={() => console.log('Share')}>
                    <Icons.Share height={21} width={21} />
                </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            {(showControls || !isPlaying) && (
                <View style={Styles.bottomControls}>
                    <TouchableOpacity onPress={handlePrevious10Seconds}>
                        <Icons.PreviousVideo height={50} width={50} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handlePlayPause} style={Styles.playButton}>
                        <Icons.PlayCricle height={52} width={52} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleNext10Seconds}>
                        <Icons.NextVideo height={50} width={50} />
                    </TouchableOpacity>
                </View>
            )}

            <ReportMistakeModal
                isVisible={reportModal}
                onClose={() => setReportModal(false)}
                onPressNext={() => { setReportModal(false); setDescriptionModal(true) }}
            />

            <DescriptionModal
                isVisible={descriptionModal}
                onClose={() => setDescriptionModal(false)}
                onPressPrevious={() => { setDescriptionModal(false); setReportModal(true); }}
                onPressNext={() => { setDescriptionModal(false); setReviewModal(true); }}
            />

            <ReviewReport
                isVisible={reviewModal}
                onClose={() => setReviewModal(false)}
                onPressNext={() => { setReviewModal(false); setSubmitionModal(true) }}
            />

            <SubmitionModal
                isVisible={submitionModal}
                onClose={() => setSubmitionModal(false)}
            />
        </View>
    );
};


export default VideoScreen;
