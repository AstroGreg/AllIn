import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, Eye, MoreCircle } from 'iconsax-react-nativejs';
import LinearGradient from 'react-native-linear-gradient';
import { createStyles } from './PhotoDetailScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import { useTheme } from '../../context/ThemeContext';

const PhotoDetailScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const eventTitle = route?.params?.eventTitle || 'BK Studentent 23';
    const photo = route?.params?.photo || {
        title: 'PK 2025 indoor Passionate',
        views: '122K+',
        thumbnail: Images.photo1,
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{eventTitle}</Text>
                <View style={Styles.placeholder} />
            </View>

            <View style={Styles.content}>
                {/* Question Card */}
                <View style={Styles.questionCard}>
                    <Text style={Styles.questionText}>Is this photo of you or another person</Text>
                    <View style={Styles.buttonsRow}>
                        <TouchableOpacity style={Styles.noButton}>
                            <Text style={Styles.buttonText}>No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.yesButton}>
                            <Text style={Styles.buttonText}>Yes</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <SizeBox height={18} />

                {/* Photo Preview */}
                <View style={Styles.photoContainer}>
                    <FastImage
                        source={photo.thumbnail}
                        style={Styles.photoImage}
                        resizeMode="cover"
                    />

                    {/* Top Row - Views and More */}
                    <View style={Styles.topRow}>
                        <View style={Styles.viewsContainer}>
                            <Eye size={24} color="#FFFFFF" variant="Linear" />
                            <Text style={Styles.viewsText}>{photo.views}</Text>
                        </View>
                        <TouchableOpacity>
                            <MoreCircle size={24} color="#FFFFFF" variant="Linear" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Gradient and Info */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
                        locations={[0, 0.74, 1]}
                        style={Styles.gradientOverlay}
                    >
                        <View style={Styles.bottomRow}>
                            <Text style={Styles.photoTitle}>{photo.title}</Text>
                            <TouchableOpacity style={Styles.downloadButton}>
                                <Text style={Styles.downloadButtonText}>Download</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </View>
        </View>
    );
};

export default PhotoDetailScreen;
