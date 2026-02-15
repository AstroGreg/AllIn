import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from './ProfileTimelineDetailStyles';
import { useTranslation } from 'react-i18next'

const ProfileTimelineDetailScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const item = route?.params?.item;
    const ownerName = route?.params?.ownerName || t('Profile');
    const displayPhotos = Array.isArray(item?.photos) && item.photos.length > 0
        ? item.photos
        : Array.isArray(item?.mediaItems)
            ? item.mediaItems
                .map((media: any) => media?.thumbnail_url || media?.preview_url || media?.full_url || media?.raw_url)
                .filter(Boolean)
            : [];
    const linkedBlogs = Array.isArray(item?.linkedBlogs) ? item.linkedBlogs : [];
    const linkedCompetitions = Array.isArray(item?.linkedCompetitions) ? item.linkedCompetitions : [];

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Timeline')}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView contentContainerStyle={Styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={Styles.ownerText}>{ownerName}</Text>
                <View style={Styles.heroCard}>
                    <Text style={Styles.yearBadge}>{item?.year ?? '—'}</Text>
                    <Text style={Styles.titleText}>{item?.title ?? t('Timeline highlight')}</Text>
                    {item?.date ? (
                        <Text style={Styles.metaText}>{new Date(String(item.date)).toLocaleString()}</Text>
                    ) : null}
                    <Text style={Styles.descriptionText}>{item?.description ?? ''}</Text>
                    {item?.highlight ? (
                        <View style={Styles.highlightChip}>
                            <Text style={Styles.highlightText}>{item.highlight}</Text>
                        </View>
                    ) : null}
                    {displayPhotos.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={Styles.photoRow}>
                            {displayPhotos.map((uri: string, idx: number) => (
                                <Image key={`${item?.id}-photo-${idx}`} source={{ uri }} style={Styles.photoThumb} />
                            ))}
                        </ScrollView>
                    )}
                    {linkedBlogs.length || linkedCompetitions.length ? (
                        <View style={Styles.linkSection}>
                            {linkedBlogs.length ? (
                                <View style={Styles.linkGroup}>
                                    <Text style={Styles.linkTitle}>{t('Blogs')}</Text>
                                    <View style={Styles.linkRow}>
                                        {linkedBlogs.map((label: any) => {
                                            const text = typeof label === 'string' ? label : String(label?.title ?? '');
                                            return (
                                            <View key={text} style={Styles.linkChip}>
                                                <Text style={Styles.linkChipText}>{text}</Text>
                                            </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            ) : null}
                            {linkedCompetitions.length ? (
                                <View style={Styles.linkGroup}>
                                    <Text style={Styles.linkTitle}>{t('Competitions')}</Text>
                                    <View style={Styles.linkRow}>
                                        {linkedCompetitions.map((label: any) => {
                                            const text = typeof label === 'string' ? label : String(label?.title ?? '');
                                            return (
                                            <View key={text} style={Styles.linkChip}>
                                                <Text style={Styles.linkChipText}>{text}</Text>
                                            </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    ) : null}
                </View>
                <SizeBox height={insets.bottom > 0 ? insets.bottom + 16 : 32} />
            </ScrollView>
        </View>
    );
};

export default ProfileTimelineDetailScreen;
