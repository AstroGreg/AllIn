import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../HomeStyles'
import Icons from '../../../constants/Icons'
import SizeBox from '../../../constants/SizeBox'
import BorderButton from '../../../components/borderButton/BorderButton'
import Video from 'react-native-video'
import ActionBtn from './ActionBtn'
import ShimmerEffect from '../../../components/shimmerEffect/ShimmerEffect'
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

interface CompetitionContainerProps {
    videoUri?: string;
    CompetitionName?: string;
    map?: string;
    location?: string;
    date?: string;
    onPress?: any;
    isActions?: boolean;
    onPressContainer?: any;
}

const CompetitionContainer = ({
    videoUri,
    CompetitionName,
    map,
    location,
    date,
    onPress,
    isActions = false,
    onPressContainer
}: CompetitionContainerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);

    const handleVideoPress = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <TouchableOpacity activeOpacity={0.7} style={styles.CompetitionContainer} onPress={onPressContainer}>
            <View style={styles.VideoContainer}>
                <TouchableOpacity
                    style={styles.videoWrapper}
                    onPress={handleVideoPress}
                    activeOpacity={0.9}>
                    {isLoading && (
                        <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
                            <ShimmerEffect
                                width="100%"
                                height="100%"
                                borderRadius={8}
                            />
                        </View>
                    )}
                    <Video
                        source={{ uri: videoUri }}
                        style={{ width: '100%', height: '100%' }}
                        controls={isPlaying}
                        resizeMode="cover"
                        poster="placeholder-image-url" // Add a placeholder image URL
                        posterResizeMode="cover"
                        repeat={false}
                        paused={!isPlaying}
                        onLoad={() => setIsLoading(false)}
                        onError={() => setIsLoading(false)}
                    />
                    {!isPlaying && (
                        <View style={styles.playButtonOverlay}>
                            <View style={styles.playButton}>
                                <Icons.PlayCricle width={32} height={32} />
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            <SizeBox height={11} />

            <View style={styles.rowCenter}>
                <Icons.competitionCalendar height={20} width={20} />
                <SizeBox width={6} />
                <Text numberOfLines={1} style={styles.eventTitle} >{CompetitionName}</Text>
            </View>

            <SizeBox height={6} />
            {
                map &&   
                <View style={styles.rowCenter}>
                    <Icons.Map height={16} width={16} />
                    <SizeBox width={6} />
                    <Text numberOfLines={1} style={styles.eventSubText}>{map}</Text>
                </View>
            }
        
            <SizeBox height={6} />

            <View style={[styles.rowCenter]}>
                <View style={[styles.rowCenter, { width: '50%' }]}>
                    <Icons.Location height={16} width={16} />
                    <SizeBox width={6} />
                    <Text numberOfLines={1} style={styles.eventSubText}>{location}</Text>
                </View>
                <View style={[styles.rowCenter, { width: '50%' }]}>
                    <Icons.CalendarGrey height={16} width={16} />
                    <SizeBox width={6} />
                    <Text numberOfLines={1} style={styles.eventSubText} >{date}</Text>
                </View>
            </View>

            <SizeBox height={12} />

            {isActions ?
                <View style={[styles.rowCenter, { justifyContent: 'space-between' }]}>
                    <ActionBtn title={t('Edit')} icon={<Icons.Edit height={14} width={14} />} />
                    <ActionBtn title={t('Delete')} icon={<Icons.DeleteCompetition height={14} width={14} />} />
                </View>
                : <BorderButton title={t('Participant')} onPress={onPress} />}

        </TouchableOpacity>
    )
}

export default CompetitionContainer
