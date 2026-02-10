import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, Notification, ArrowRight } from 'iconsax-react-nativejs'
import { createStyles } from './UploadSummaryScreenStyles'
import SizeBox from '../../constants/SizeBox'
import { useTheme } from '../../context/ThemeContext'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'

interface UploadItem {
    id: number;
    thumbnail: any;
    price: string;
    resolution: string;
}

interface CategorySection {
    name: string;
    items: UploadItem[];
}

const UploadSummaryScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const competition = route?.params?.competition;
    const account = route?.params?.account;
    const anonymous = route?.params?.anonymous;

    const categories: CategorySection[] = [
        {
            name: '200m',
            items: [
                { id: 1, thumbnail: Images.photo1, price: '€2,00', resolution: '2160p' },
                { id: 2, thumbnail: Images.photo1, price: '€0,10', resolution: '2160p' },
            ]
        },
        {
            name: '400m',
            items: [
                { id: 3, thumbnail: Images.photo1, price: '€0,10', resolution: '3840×2160' },
                { id: 4, thumbnail: Images.photo1, price: '€2,00', resolution: '2160p' },
            ]
        },
    ];

    const handleConfirm = () => {
        navigation.navigate('CongratulationsScreen');
    };

    const renderUploadItem = (item: UploadItem) => (
        <View key={item.id} style={Styles.uploadItem}>
            <View style={Styles.thumbnailContainer}>
                <FastImage source={item.thumbnail} style={Styles.thumbnail} resizeMode="cover" />
                <View style={Styles.playButton}>
                    <Icons.PlayCricle width={22} height={22} />
                </View>
            </View>
            <View style={Styles.itemInfo}>
                <Text style={Styles.priceText}>{item.price}</Text>
                <Text style={Styles.resolutionText}>{item.resolution}</Text>
            </View>
        </View>
    );

    const renderCategory = (category: CategorySection, index: number) => (
        <View key={index} style={Styles.categorySection}>
            <Text style={Styles.categoryTitle}>{category.name}</Text>
            <SizeBox height={16} />
            <View style={Styles.itemsRow}>
                {category.items.map(renderUploadItem)}
            </View>
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Upload Summary</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {categories.map(renderCategory)}

                <SizeBox height={30} />

                {/* Confirm Button */}
                <TouchableOpacity style={Styles.confirmButton} onPress={handleConfirm}>
                    <Text style={Styles.confirmButtonText}>Confirm</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default UploadSummaryScreen;
