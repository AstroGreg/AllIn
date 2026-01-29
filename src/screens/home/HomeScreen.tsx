import { View, ScrollView, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from './HomeStyles'
import Header from './components/Header'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import NewsFeedCard from './components/NewsFeedCard'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'
import LinearGradient from 'react-native-linear-gradient'
import { Wallet, UserAdd, ArrowRight } from 'iconsax-react-nativejs'

const HomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    const feedImages = [
        Images.photo1,
        Images.photo3,
        Images.photo4,
        Images.photo5,
        Images.photo6,
        Images.photo7,
        Images.photo8,
        Images.photo9,
    ];

    const kbcNachtImages = [
        Images.photo5,
    ];

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <Header
                userName={"David Malan"}
                onPressFeed={() => navigation.navigate('HubScreen')}
                onPressNotification={() => navigation.navigate('NotificationsScreen')}
            />

            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true} contentContainerStyle={Styles.scrollContent}>
                <SizeBox height={24} />

                {/* Wallet Balance Card */}
                <View style={Styles.walletCard}>
                    <View style={Styles.walletCardContent}>
                        <View style={Styles.walletLeftSection}>
                            <View style={Styles.walletIconContainer}>
                                <Wallet size={24} color={colors.primaryColor} variant="Linear" />
                            </View>
                            <View style={Styles.walletInfoContainer}>
                                <Text style={Styles.walletTitle}>Wallet Balance</Text>
                                <Text style={Styles.walletBalance}>€20.09</Text>
                                <View style={Styles.planBadge}>
                                    <Text style={Styles.planBadgeText}>Plan Plus</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={Styles.rechargeButton}>
                            <Text style={Styles.rechargeButtonText}>Recharge</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* AI Smart Search Card */}
                <View style={Styles.aiSearchCard}>
                    <Text style={Styles.aiSearchTitle}>AI Smart Search</Text>
                    <Text style={Styles.aiSearchDescription}>
                        Try our fast AI Search by face and get pictures and video's of you in seconds.
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Search', { screen: 'FaceSearchScreen' })}>
                        <LinearGradient
                            colors={['#155DFC', '#7F22FE']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={Styles.tryAiButton}
                        >
                            <Text style={Styles.tryAiButtonText}>Try Face Search</Text>
                            <ArrowRight size={24} color="#FFFFFF" variant="Linear" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions Section */}
                <View style={Styles.sectionContainer}>
                    <View style={Styles.sectionHeader}>
                        <Text style={Styles.sectionTitle}>Quick Actions</Text>
                    </View>
                    <View style={Styles.quickActionsGrid}>
                        {/* First Row - Add myself & My downloads */}
                        <View style={Styles.quickActionsRow}>
                            <TouchableOpacity style={Styles.quickActionCard} onPress={() => navigation.navigate('SelectEventInterestScreen')}>
                                <View style={Styles.quickActionContent}>
                                    <View style={Styles.quickActionIconContainer}>
                                        <UserAdd size={20} color={colors.primaryColor} variant="Linear" />
                                    </View>
                                    <View style={Styles.quickActionTextContainer}>
                                        <Text style={Styles.quickActionText}>Add myself</Text>
                                        <ArrowRight size={16} color={colors.primaryColor} variant="Linear" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.quickActionCard} onPress={() => navigation.navigate('DownloadsDetailsScreen')}>
                                <View style={Styles.quickActionContent}>
                                    <View style={Styles.quickActionIconContainer}>
                                        <Icons.DownloadBlue width={20} height={20} />
                                    </View>
                                    <View style={Styles.quickActionTextContainer}>
                                        <Text style={Styles.quickActionText}>My downloads</Text>
                                        <ArrowRight size={16} color={colors.primaryColor} variant="Linear" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Second Row - Context Search & Face Search */}
                        <View style={Styles.quickActionsRow}>
                            <LinearGradient
                                colors={['#155DFC', '#7F22FE']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={Styles.gradientButton}
                            >
                                <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}
                                    onPress={() => navigation.navigate('Search', { screen: 'AISearchOptions', params: { openContext: true } })}
                                >
                                    <Text style={Styles.gradientButtonText}>Context Search</Text>
                                    <ArrowRight size={24} color="#FFFFFF" variant="Linear" />
                                </TouchableOpacity>
                            </LinearGradient>
                            <LinearGradient
                                colors={['#155DFC', '#7F22FE']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={Styles.gradientButton}
                            >
                                <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}
                                    onPress={() => navigation.navigate('Search', { screen: 'SearchScreen', params: { openBIB: true } })}
                                >
                                    <Text style={Styles.gradientButtonText}>BIB Search</Text>
                                    <ArrowRight size={24} color="#FFFFFF" variant="Linear" />
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </View>
                </View>

                {/* New for you Section */}
                <View style={Styles.sectionContainer}>
                    <View style={Styles.newForYouHeader}>
                        <Text style={Styles.newForYouTitle}>New for you</Text>
                        <Text style={Styles.newForYouDescription}>
                            12 new photos in BK Studentent 23 2 new videos tagged to Chest #17
                        </Text>
                    </View>

                    {/* First card - no border, just title + image carousel */}
                    <NewsFeedCard
                        title="Belgium championships 2025"
                        images={feedImages}
                        hasBorder={true}
                    />

                    {/* Second card - has border, user post with single image */}
                    <NewsFeedCard
                        title="Belgium championships 2025"
                        description={`Elias took part in the 800m and achieved a time close to his best 1'50"99`}
                        images={[Images.photo1]}
                        hasBorder={true}
                        user={{
                            name: "Mia Moon",
                            avatar: Images.profilePic,
                            timeAgo: "3 Days Ago"
                        }}
                        onFollow={() => {}}
                        onViewBlog={() => navigation.navigate('ViewUserBlogDetailsScreen', {
                            post: {
                                title: 'Belgium championships 2025',
                                date: '27/05/2025',
                                image: Images.photo1,
                                readCount: '1k',
                                writer: 'Mia Moon',
                                writerImage: Images.profilePic,
                                description: `Elias took part in the 800m and achieved a time close to his best 1'50"99. The Belgium Championships 2025 showcased incredible athletic talent from across the country, bringing together top competitors in various track and field events.`,
                            }
                        })}
                    />

                    {/* Third card - no border, video with play button */}
                    <NewsFeedCard
                        title="KBC Nacht 2025"
                        images={kbcNachtImages}
                        hasBorder={true}
                        isVideo={true}
                        videoUri="https://awssportreels.s3.eu-central-1.amazonaws.com/PK-800m.mp4"
                    />
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default HomeScreen
