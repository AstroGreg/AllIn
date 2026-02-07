import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import Colors from '../../constants/Colors';
import Styles from './DownloadsDetailsStyles';
import { ArrowLeft2, User, Gallery, VideoPlay, DocumentDownload, ArrowUp, ArrowRight } from 'iconsax-react-nativejs';
import Icons from '../../constants/Icons';

const DownloadsDetailsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const recentDownloads = [
        { id: 1, image: Images.photo1, price: '€0,10', resolution: '3840×2160' },
        { id: 2, image: Images.photo3, price: '€0,15', resolution: '3840×2160' },
        { id: 3, image: Images.photo4, price: '€0,10', resolution: '3840×2160' },
        { id: 4, image: Images.photo5, price: '€0,15', resolution: '3840×2160' },
    ];

    const renderDownloadCard = (item: any) => (
        <View key={item.id} style={Styles.downloadCard}>
            <FastImage source={item.image} style={Styles.downloadCardImage} resizeMode="cover" />
            <View style={Styles.downloadCardContent}>
                <View style={Styles.downloadCardLeft}>
                    <Text style={Styles.downloadCardPrice}>{item.price}</Text>
                    <TouchableOpacity style={Styles.viewButton}>
                        <Text style={Styles.viewButtonText}>View</Text>
                        <ArrowRight size={10} color={Colors.whiteColor} variant="Linear" />
                    </TouchableOpacity>
                </View>
                <View style={Styles.downloadCardRight}>
                    <Text style={Styles.downloadCardResolution}>{item.resolution}</Text>
                    <TouchableOpacity style={Styles.downloadIconButton}>
                        <Icons.DownloadBlue width={24} height={24} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Downloads</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <User size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Total Profit Card */}
                <View style={Styles.totalProfitCard}>
                    <View style={Styles.totalProfitHeader}>
                        <View style={Styles.totalProfitLabelContainer}>
                            <View style={Styles.iconCircle}>
                                <Gallery size={16} color={Colors.primaryColor} variant="Bold" />
                            </View>
                            <Text style={Styles.totalProfitLabel}>Total Profit</Text>
                        </View>
                        <TouchableOpacity style={Styles.downloadButton}>
                            <Text style={Styles.downloadButtonText}>Download</Text>
                            <DocumentDownload size={18} color="#9B9F9F" variant="Linear" />
                        </TouchableOpacity>
                    </View>
                    <View style={Styles.totalProfitRow}>
                        <Text style={Styles.totalProfitAmount}>$456.67</Text>
                        <View style={Styles.downloadsStatsContainer}>
                            <View style={Styles.downloadsCountContainer}>
                                <Text style={Styles.downloadsCountLabel}>Downloads: </Text>
                                <Text style={Styles.downloadsCountValue}>10,000</Text>
                            </View>
                            <View style={Styles.percentageContainer}>
                                <ArrowUp size={16} color="#00BD48" variant="Linear" />
                                <Text style={Styles.percentageText}>90%</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={Styles.statsCardsRow}>
                    {/* Photos Card */}
                    <View style={Styles.statsCard}>
                        <View style={Styles.statsCardHeader}>
                            <View style={Styles.iconCircle}>
                                <Gallery size={16} color={Colors.primaryColor} variant="Bold" />
                            </View>
                            <Text style={Styles.statsCardTitle}>Photos</Text>
                        </View>
                        <View style={Styles.statsCardContent}>
                            <View style={Styles.statsRow}>
                                <View style={Styles.statsColumn}>
                                    <Text style={Styles.statsLabel}>Downloads</Text>
                                    <Text style={Styles.statsValue}>10,000</Text>
                                </View>
                                <View style={Styles.statsColumnEnd}>
                                    <Text style={Styles.statsLabel}>Profit per Photo</Text>
                                    <Text style={Styles.statsValue}>1.15$</Text>
                                </View>
                            </View>
                            <View style={Styles.totalEarningsRow}>
                                <Text style={Styles.statsLabel}>Total Earnings:</Text>
                                <Text style={Styles.statsValue}>$456.67</Text>
                            </View>
                        </View>
                    </View>

                    {/* Videos Card */}
                    <View style={Styles.statsCard}>
                        <View style={Styles.statsCardHeader}>
                            <View style={Styles.iconCircle}>
                                <VideoPlay size={16} color={Colors.primaryColor} variant="Linear" />
                            </View>
                            <Text style={Styles.statsCardTitle}>Videos</Text>
                        </View>
                        <View style={Styles.statsCardContent}>
                            <View style={Styles.statsRow}>
                                <View style={Styles.statsColumn}>
                                    <Text style={Styles.statsLabel}>Downloads</Text>
                                    <Text style={Styles.statsValue}>10,000</Text>
                                </View>
                                <View style={Styles.statsColumnEnd}>
                                    <Text style={Styles.statsLabel}>Profit per Video</Text>
                                    <Text style={Styles.statsValue}>1.15$</Text>
                                </View>
                            </View>
                            <View style={Styles.totalEarningsRow}>
                                <Text style={Styles.statsLabel}>Total Earnings:</Text>
                                <Text style={Styles.statsValue}>$456.67</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Recent Downloads Section */}
                <View style={Styles.recentDownloadsSection}>
                    <Text style={Styles.recentDownloadsTitle}>Recent Downloads</Text>
                    <View style={Styles.downloadCardsGrid}>
                        {recentDownloads.map(renderDownloadCard)}
                    </View>
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default DownloadsDetailsScreen;
