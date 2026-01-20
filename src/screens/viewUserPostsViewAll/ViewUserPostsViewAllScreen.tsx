import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import Styles from './ViewUserPostsViewAllScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';

const ViewUserPostsViewAllScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const posts = [
        {
            id: 1,
            type: 'single',
            title: 'IFAM Outdoor Oordegem',
            date: '09/08/2025',
            description: "Elias took part in the 800m and achieved a time close to his best 1'50\"99. For Lode it was a disappointing first half of his match DNF in the 5000m",
            image: Images.photo1,
        },
        {
            id: 2,
            type: 'single',
            title: 'BK 10000m AC Duffel',
            date: '09/06/2025',
            description: "This race meant everything to me. Running the European Championships on home soil, with my family and friends lining",
            image: Images.photo3,
        },
        {
            id: 3,
            type: 'grid',
            title: 'BK AC Brussels 02',
            date: '03/08/2025',
            description: "Kobe won silver in the 5000m and Elias ran a silver medal in the 1500m a very creditable fifth place.",
            images: [Images.photo4, Images.photo5, Images.photo6, Images.photo7],
        },
        {
            id: 4,
            type: 'single',
            title: 'BK 10000m AC Duffel',
            date: '09/06/2025',
            description: "This race meant everything to me. Running the European Championships on home soil, with my family and friends lining",
            image: Images.photo3,
        },
        {
            id: 5,
            type: 'grid',
            title: 'BK AC Brussels 02',
            date: '03/08/2025',
            description: "Kobe won silver in the 5000m and Elias ran a silver medal in the 1500m a very creditable fifth place.",
            images: [Images.photo4, Images.photo5, Images.photo6, Images.photo7],
        },
        {
            id: 6,
            type: 'single',
            title: 'BK 10000m AC Duffel',
            date: '09/06/2025',
            description: "This race meant everything to me. Running the European Championships on home soil, with my family and friends lining",
            image: Images.photo1,
        },
    ];

    const renderPostCard = (post: any) => (
        <View key={post.id} style={Styles.postCard}>
            <View>
                {post.type === 'single' ? (
                    <View style={Styles.postImageContainer}>
                        <FastImage source={post.image} style={Styles.postImage} resizeMode="cover" />
                    </View>
                ) : (
                    <View style={Styles.postGridContainer}>
                        <View style={Styles.postGridRow}>
                            <FastImage
                                source={post.images[0]}
                                style={[Styles.postGridImage, Styles.postGridImageTopLeft]}
                                resizeMode="cover"
                            />
                            <FastImage
                                source={post.images[1]}
                                style={[Styles.postGridImage, Styles.postGridImageTopRight]}
                                resizeMode="cover"
                            />
                        </View>
                        <View style={Styles.postGridRow}>
                            <FastImage
                                source={post.images[2]}
                                style={Styles.postGridImage}
                                resizeMode="cover"
                            />
                            <FastImage
                                source={post.images[3]}
                                style={Styles.postGridImage}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                )}
                <View style={Styles.postInfoBar}>
                    <Text style={Styles.postTitle}>{post.title}</Text>
                    <Text style={Styles.postDate}>{post.date}</Text>
                </View>
            </View>
            <Text style={Styles.postDescription}>{post.description}</Text>
            <TouchableOpacity style={Styles.shareButton}>
                <Text style={Styles.shareButtonText}>Share</Text>
                <Image source={Icons.ShareBlue} style={{ width: 18, height: 18, tintColor: Colors.whiteColor }} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Posts</Text>
                <View style={[Styles.headerButton, { opacity: 0 }]} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Section Header */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>Posts</Text>
                </View>

                <SizeBox height={24} />

                {/* Posts List */}
                <View style={Styles.postsContainer}>
                    {posts.map(renderPostCard)}
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default ViewUserPostsViewAllScreen;
