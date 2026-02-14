import { View, Text, FlatList, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import CompetitionContainer from './CompetitionContainer'
import SizeBox from '../../../constants/SizeBox'
import { createStyles } from '../HomeStyles'
import CustomButton from '../../../components/customButton/CustomButton'
import Icons from '../../../constants/Icons'
import Images from '../../../constants/Images'
import RequestContainers from './RequestContainers'
import SimilarEvents from '../../Events/components/SimilarEvents'
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

interface PotentialVideosProps {
    data: any;
    onPressAddEvent: any;
    onPressParticipant: any;
    onPressDownloads: any;
    onPressContainer?: any;
}

const PotentialVideos = ({ data, onPressAddEvent, onPressParticipant, onPressDownloads, onPressContainer }: PotentialVideosProps,) => {
    const navigation: any = useNavigation();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);

    return (
        <View style={{}}>
            <FlatList
                data={data}
                renderItem={({ item }: any) =>
                    <CompetitionContainer
                        videoUri={item.videoUri}
                        CompetitionName={item.CompetitionName}
                        map={item.map}
                        location={item.location}
                        date={item.date}
                        onPress={onPressParticipant}
                        onPressContainer={() => navigation.navigate('VideoPlayingScreen', {
                            video: {
                                title: item.CompetitionName || t('BK Studenten 2023'),
                                subtitle: item.map || t('Senioren, Heat 1'),
                                thumbnail: Images.photo1,
                            }
                        })}
                    />
                }
                style={{ paddingLeft: 20 }}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            />

            <SizeBox height={4} />

            <Text style={styles.tabText}>{t('Followers & Spotlight')}</Text>
            <SizeBox height={16} />
            <FlatList
                data={data}
                renderItem={({ item }: any) =>
                    <CompetitionContainer
                        videoUri={item.videoUri}
                        CompetitionName={item.CompetitionName}
                        map={item.map}
                        location={item.location}
                        date={item.date}
                        onPress={onPressParticipant}
                        onPressContainer={() => navigation.navigate('VideoPlayingScreen', {
                            video: {
                                title: item.CompetitionName || t('BK Studenten 2023'),
                                subtitle: item.map || t('Senioren, Heat 1'),
                                thumbnail: Images.photo1,
                            }
                        })}
                    />
                }
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                style={{ paddingLeft: 20 }}
                showsHorizontalScrollIndicator={false}
            />

            <Text style={styles.headings}>{t('My events')}</Text>
            <SizeBox height={12} />
            <SimilarEvents isSubscription={false} />

            <View style={{ marginHorizontal: 20 }}>
                <CustomButton title={t('Add Myself To Events')} onPress={onPressAddEvent} />
            </View>
            <SizeBox height={20} />

            <Text style={styles.headings}>{t('Downloads')}</Text>
            <SizeBox height={12} />

            <TouchableOpacity style={styles.downloadContainer} onPress={onPressDownloads}>
                <Icons.Downloads height={22} width={22} />
                <View style={styles.rowCenter}>
                    <Text style={styles.downloadText}>
                        {t('Total Downloads')}:
                    </Text>
                    <Text style={styles.downloadCount}>
                        346,456
                    </Text>
                </View>
            </TouchableOpacity>

            <SizeBox height={20} />
            <View style={styles.rowCenter}>
                <Text style={styles.headings}>{t('Request for edits')}</Text>
                <TouchableOpacity style={[styles.btnRight, { right: 20 }]}>
                    <Text style={[styles.eventSubText, { width: '100%', }]}>{t('View all')}</Text>
                </TouchableOpacity>
            </View>

            <SizeBox height={16} />

            <Text style={[styles.eventSubText, { width: '100%', marginLeft: 20 }]}>{t('Sent')}</Text>

            <SizeBox height={10} />

            <RequestContainers
                title={t('Enhance Lighting & Colors')}
                date='12.12.2024'
                time='12:00'
                status={t('Fixed')}
                isFixed={true}
            />
            <RequestContainers
                title={t('Remove Watermark/Text')}
                date='12.12.2024'
                time='12:00'
                status={t('Fixed')}
                isFixed={true}
            />

            <Text style={[styles.eventSubText, { width: '100%', marginLeft: 20 }]}>{t('Received')}</Text>

            <SizeBox height={10} />

            <RequestContainers
                title={t('Enhance Lighting & Colors')}
                date='12.12.2024'
                time='12:00'
                status={t('Pending')}
                isFixed={false}
            />
            <RequestContainers
                title={t('Slow Motion Effect')}
                date='12.12.2024'
                time='12:00'
                status={t('Fixed')}
                isFixed={true}
            />

        </View>
    )
}

export default PotentialVideos
