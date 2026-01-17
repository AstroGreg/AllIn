import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {
    ArrowLeft2,
    ArrowRight,
    VideoCircle,
} from 'iconsax-react-nativejs';
import Styles from './PhotosScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';

const PhotosScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const eventTitle = route?.params?.eventTitle || 'BK Studentent 23';
    const walletBalance = route?.params?.walletBalance || '€20,09';

    const photos = [
        { id: 1, price: '€0,10', resolution: '3840×2160', thumbnail: Images.photo1 },
        { id: 2, price: '€0,15', resolution: '3840×2160', thumbnail: Images.photo2 },
        { id: 3, price: '€0,20', resolution: '3840×2160', thumbnail: Images.photo3 },
        { id: 4, price: '€0,15', resolution: '3840×2160', thumbnail: Images.photo4 },
        { id: 5, price: '€0,15', resolution: '3840×2160', thumbnail: Images.photo5 },
        { id: 6, price: '€0,20', resolution: '3840×2160', thumbnail: Images.photo6 },
    ];

    const renderPhotoCard = (photo: any) => (
        <View key={photo.id} style={Styles.photoCard}>
            <FastImage
                source={photo.thumbnail}
                style={Styles.photoThumbnail}
                resizeMode="cover"
            />
            <View style={Styles.photoInfo}>
                <View style={Styles.photoLeftInfo}>
                    <Text style={Styles.photoPrice}>{photo.price}</Text>
                    <TouchableOpacity style={Styles.viewButton}>
                        <Text style={Styles.viewButtonText}>View</Text>
                        <ArrowRight size={12} color={Colors.whiteColor} variant="Linear" />
                    </TouchableOpacity>
                </View>
                <View style={Styles.photoRightInfo}>
                    <Text style={Styles.photoResolution}>{photo.resolution}</Text>
                    <TouchableOpacity>
                        <Icons.Download height={24} width={24} />
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
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{eventTitle}</Text>
                <TouchableOpacity style={Styles.videoButton}>
                    <VideoCircle size={24} color={Colors.primaryColor} variant="Bold" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Wallet Balance Row */}
                <View style={Styles.walletRow}>
                    <View style={Styles.walletInfo}>
                        <Text style={Styles.walletLabel}>Wallet Balance:</Text>
                        <Text style={Styles.walletBalance}>{walletBalance}</Text>
                    </View>
                    <TouchableOpacity style={Styles.rechargeButton}>
                        <Text style={Styles.rechargeButtonText}>Recharge</Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                {/* Photos Header */}
                <View style={Styles.photosHeader}>
                    <Text style={Styles.photosLabel}>Photos</Text>
                    <TouchableOpacity style={Styles.downloadAllButton}>
                        <Text style={Styles.downloadAllText}>Download All</Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                {/* Info Card */}
                <View style={Styles.infoCard}>
                    <Icons.BellColorful height={30} width={30} />
                    <Text style={Styles.infoText}>
                        These photos were found through facial recognition or by matching your chest number.
                    </Text>
                </View>

                <SizeBox height={24} />

                {/* Photos Grid */}
                <View style={Styles.photosGrid}>
                    {photos.map(renderPhotoCard)}
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default PhotosScreen;
