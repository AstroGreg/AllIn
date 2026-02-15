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
                    <Text style={Styles.descriptionText}>{item?.description ?? ''}</Text>
                    {item?.highlight ? (
                        <View style={Styles.highlightChip}>
                            <Text style={Styles.highlightText}>{item.highlight}</Text>
                        </View>
                    ) : null}
                    {Array.isArray(item?.photos) && item.photos.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={Styles.photoRow}>
                            {item.photos.map((uri: string, idx: number) => (
                                <Image key={`${item?.id}-photo-${idx}`} source={{ uri }} style={Styles.photoThumb} />
                            ))}
                        </ScrollView>
                    )}
                    {(Array.isArray(item?.linkedBlogs) && item.linkedBlogs.length) || (Array.isArray(item?.linkedCompetitions) && item.linkedCompetitions.length) ? (
                        <View style={Styles.linkSection}>
                            {Array.isArray(item?.linkedBlogs) && item.linkedBlogs.length ? (
                                <View style={Styles.linkGroup}>
                                    <Text style={Styles.linkTitle}>{t('Blogs')}</Text>
                                    <View style={Styles.linkRow}>
                                        {item.linkedBlogs.map((label: string) => (
                                            <View key={label} style={Styles.linkChip}>
                                                <Text style={Styles.linkChipText}>{label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : null}
                            {Array.isArray(item?.linkedCompetitions) && item.linkedCompetitions.length ? (
                                <View style={Styles.linkGroup}>
                                    <Text style={Styles.linkTitle}>{t('Competitions')}</Text>
                                    <View style={Styles.linkRow}>
                                        {item.linkedCompetitions.map((label: string) => (
                                            <View key={label} style={Styles.linkChip}>
                                                <Text style={Styles.linkChipText}>{label}</Text>
                                            </View>
                                        ))}
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
