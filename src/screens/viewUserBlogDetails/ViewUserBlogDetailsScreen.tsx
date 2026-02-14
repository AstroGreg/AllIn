import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { createStyles } from './ViewUserBlogDetailsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useEvents } from '../../context/EventsContext';
import { useTranslation } from 'react-i18next';
import { translateText } from '../../i18n';

const ViewUserBlogDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t, i18n } = useTranslation();
    const Styles = createStyles(colors);
    const { eventNameById } = useEvents();
    const post = route?.params?.post || {
        title: 'IFAM Outdoor Oordegem',
        date: '09/08/2025',
        image: Images.photo1,
        readCount: '1k',
        writer: 'James Ray',
        writerImage: Images.profile1,
        description: `The IFAM Outdoor Oordegem is an internationally renowned athletics meeting held annually in Oordegem, Belgium. Recognized by World Athletics, it attracts a diverse mix of elite and emerging athletes from across Europe and beyond who compete in a full range of track and field events, including sprints, middle- and long-distance races, hurdles, jumps, and throws. Known for its exceptionally fast track and well-organized schedule, the event has become a prime venue for athletes seeking personal bests or qualification standards for major championships. Hosted at the Sport Vlaanderen stadium in Oordegem, typically in late spring or summer, the IFAM Outdoor combines high-level competition with a welcoming atmosphere for both athletes and spectators. Its growing reputation as one of Europe's largest and most competitive outdoor meetings highlights its importance in the international athletics calendar.`,
    };

    const galleryItems = useMemo(() => {
        if (Array.isArray(post.galleryItems) && post.galleryItems.length > 0) {
            return post.galleryItems;
        }
        if (Array.isArray(post.gallery) && post.gallery.length > 0) {
            return post.gallery.map((img: any) => ({
                image: img,
                type: 'image',
                videoUri: undefined,
            }));
        }
        return [{ image: post.image, type: 'image', videoUri: undefined }];
    }, [post.gallery, post.galleryItems, post.image]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const selectedItem = galleryItems[selectedIndex] ?? galleryItems[0];
    const isSelectedVideo = selectedItem?.type === 'video' && !!selectedItem?.videoUri;
    const canOpenDetail = Boolean(selectedItem?.media);

    const translatedDescription = useMemo(() => {
        return translateText(post.description ?? '', i18n.language);
    }, [i18n.language, post.description]);

    const openMediaDetail = useCallback((item: any) => {
        const media = item?.media;
        if (!media) return;
        navigation.navigate('PhotoDetailScreen', {
            eventTitle: eventNameById(media.event_id),
            media: {
                id: media.media_id,
                eventId: media.event_id,
                thumbnailUrl: media.thumbnail_url,
                previewUrl: media.preview_url,
                originalUrl: media.original_url,
                fullUrl: media.full_url,
                rawUrl: media.raw_url,
                hlsManifestPath: media.hls_manifest_path,
                type: media.type,
                assets: media.assets ?? [],
            },
        });
    }, [eventNameById, navigation]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('blogDetails')}</Text>
                <View style={[Styles.headerButton, { opacity: 0 }]} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <SizeBox height={8} />

                {/* Title */}
                <View style={Styles.headerCard}>
                    <Text style={Styles.blogTitle}>{post.title}</Text>
                    <Text style={Styles.metaInline}>
                        {[post.readCount ? `${post.readCount} ${t('read')}` : '', post.date || ''].filter(Boolean).join(' • ')}
                    </Text>
                </View>

                <SizeBox height={10} />

                {/* Author */}
                <View style={Styles.authorRow}>
                    <FastImage source={post.writerImage} style={Styles.writerImage} resizeMode="cover" />
                    <Text style={Styles.writerName}>{post.writer}</Text>
                </View>

                <SizeBox height={8} />

                {/* Description */}
                <TouchableOpacity
                    style={Styles.translateToggle}
                    onPress={() => setShowTranslation((prev) => !prev)}
                    activeOpacity={0.8}
                >
                    <Text style={Styles.translateToggleText}>
                        {showTranslation ? t('showOriginal') : t('showTranslation')}
                    </Text>
                </TouchableOpacity>
                <Text style={Styles.description}>
                    {showTranslation ? translatedDescription : post.description}
                </Text>

                <SizeBox height={8} />

                {/* Share Button */}
                <TouchableOpacity style={Styles.shareButton}>
                    <Text style={Styles.shareButtonText}>{t('share')}</Text>
                    <Image source={Icons.ShareBlue} style={{ width: 18, height: 18, tintColor: '#FFFFFF' }} />
                </TouchableOpacity>

                <SizeBox height={8} />

                {/* Media Carousel (bottom) */}
                {galleryItems.length > 0 && (
                    <>
                        <Text style={Styles.sectionLabel}>{t('media')}</Text>
                        <SizeBox height={4} />
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={Styles.galleryContainer}
                        >
                            {galleryItems.map((item: any, index: number) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setSelectedIndex(index);
                                        openMediaDetail(item);
                                    }}
                                    activeOpacity={0.8}
                                    disabled={!item?.media}
                                >
                                    <View style={Styles.galleryThumbWrap}>
                                        <FastImage
                                            source={item.image}
                                            style={[
                                                Styles.galleryImage,
                                                selectedIndex === index && Styles.galleryImageSelected,
                                            ]}
                                            resizeMode="cover"
                                        />
                                        {item?.type === 'video' && (
                                            <View style={Styles.galleryPlayOverlay}>
                                                <View style={Styles.galleryPlayButton}>
                                                    <Icons.PlayCricle height={28} width={28} />
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 16 : 32} />
            </ScrollView>
        </View>
    );
};

export default ViewUserBlogDetailsScreen;
