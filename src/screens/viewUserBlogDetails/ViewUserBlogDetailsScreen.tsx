import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, Edit2 } from 'iconsax-react-nativejs';
import Styles from './ViewUserBlogDetailsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';

const ViewUserBlogDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const post = route?.params?.post || {
        title: 'IFAM Outdoor Oordegem',
        date: '09/08/2025',
        image: Images.photo1,
        readCount: '1k',
        writer: 'James Ray',
        writerImage: Images.profile1,
        description: `The IFAM Outdoor Oordegem is an internationally renowned athletics meeting held annually in Oordegem, Belgium. Recognized by World Athletics, it attracts a diverse mix of elite and emerging athletes from across Europe and beyond who compete in a full range of track and field events, including sprints, middle- and long-distance races, hurdles, jumps, and throws. Known for its exceptionally fast track and well-organized schedule, the event has become a prime venue for athletes seeking personal bests or qualification standards for major championships. Hosted at the Sport Vlaanderen stadium in Oordegem, typically in late spring or summer, the IFAM Outdoor combines high-level competition with a welcoming atmosphere for both athletes and spectators. Its growing reputation as one of Europe's largest and most competitive outdoor meetings highlights its importance in the international athletics calendar.`,
    };

    const [selectedImage, setSelectedImage] = useState(post.image);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Blogs Details</Text>
                <View style={[Styles.headerButton, { opacity: 0 }]} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Blog Image */}
                <FastImage source={selectedImage} style={Styles.blogImage} resizeMode="cover" />

                {/* Image Gallery (if available) */}
                {post.gallery && post.gallery.length > 0 && (
                    <>
                        <SizeBox height={12} />
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={Styles.galleryContainer}
                        >
                            {post.gallery.map((img: any, index: number) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setSelectedImage(img)}
                                    activeOpacity={0.8}
                                >
                                    <FastImage
                                        source={img}
                                        style={[
                                            Styles.galleryImage,
                                            selectedImage === img && Styles.galleryImageSelected,
                                        ]}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}

                <SizeBox height={16} />

                {/* Title and Date */}
                <View style={Styles.titleRow}>
                    <Text style={Styles.blogTitle}>{post.title}</Text>
                    <Text style={Styles.blogDate}>{post.date}</Text>
                </View>

                <SizeBox height={16} />

                {/* Read Count and Writer */}
                <View style={Styles.metaRow}>
                    <View style={Styles.readCountContainer}>
                        <Edit2 size={16} color="#777777" variant="Linear" />
                        <Text style={Styles.readCountText}>{post.readCount} read</Text>
                    </View>
                    <View style={Styles.writerContainer}>
                        <Text style={Styles.writerLabel}>Writer:</Text>
                        <View style={Styles.writerInfo}>
                            <FastImage source={post.writerImage} style={Styles.writerImage} resizeMode="cover" />
                            <Text style={Styles.writerName}>{post.writer}</Text>
                        </View>
                    </View>
                </View>

                <SizeBox height={16} />

                {/* Description */}
                <Text style={Styles.description}>{post.description}</Text>

                <SizeBox height={16} />

                {/* Share Button */}
                <TouchableOpacity style={Styles.shareButton}>
                    <Text style={Styles.shareButtonText}>Share</Text>
                    <Image source={Icons.ShareBlue} style={{ width: 18, height: 18, tintColor: Colors.whiteColor }} />
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default ViewUserBlogDetailsScreen;
