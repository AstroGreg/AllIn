import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft2, Setting2, Setting5, Add } from 'iconsax-react-nativejs'
import { createStyles } from './CompetitionDetailsStyles'
import SizeBox from '../../constants/SizeBox'
import { useTheme } from '../../context/ThemeContext'
import Icons from '../../constants/Icons'

interface EventCategory {
    id: number;
    name: string;
}

const CompetitionDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const competition = route?.params?.competition;
    const account = route?.params?.account;
    const anonymous = route?.params?.anonymous;

    const [activeTab, setActiveTab] = useState('track');

    const videoCategories: EventCategory[] = [
        { id: 1, name: '200 Meters' },
        { id: 2, name: '400 Meters' },
        { id: 3, name: '800 Meters' },
        { id: 4, name: '5000 Meters' },
    ];

    const handleUploadToCategory = (category: EventCategory, type: 'video' | 'photo') => {
        navigation.navigate('UploadDetailsScreen', {
            competition,
            category,
            type,
            account,
            anonymous
        });
    };

    const handleAddVideoCategory = () => {
        // Navigate to add video category screen
    };

    const handleAddPhotoCategory = () => {
        // Navigate to add photo category screen
    };

    const handleAddUnlabelledPhotos = () => {
        navigation.navigate('UploadDetailsScreen', {
            competition,
            type: 'photo',
            unlabelled: true,
            account,
            anonymous
        });
    };

    const handleFinish = () => {
        navigation.navigate('WatermarkScreen', {
            competition,
            account,
            anonymous
        });
    };

    const renderCategoryCard = (category: EventCategory) => (
        <View key={category.id} style={Styles.categoryCard}>
            <Text style={Styles.categoryName}>{category.name}</Text>
            <TouchableOpacity
                style={Styles.uploadIconButton}
                onPress={() => handleUploadToCategory(category, 'video')}
            >
                <Icons.UploadWhite width={20} height={20} />
            </TouchableOpacity>
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
                <Text style={Styles.headerTitle}>{competition?.name || 'BK Studenten 2023'}</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Setting2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Tip Card */}
                <View style={Styles.tipCard}>
                    <Icons.LightbulbColorful width={90} height={90} />
                    <SizeBox height={14} />
                    <Text style={Styles.tipText}>
                        Pricing per photo is based on image resolution. Video pricing depends on both resolution and length.
                    </Text>
                </View>

                <SizeBox height={24} />

                {/* Toggle Tabs */}
                <View style={Styles.toggleContainer}>
                    <TouchableOpacity
                        style={[Styles.toggleTab, activeTab === 'track' && Styles.toggleTabActive]}
                        onPress={() => setActiveTab('track')}
                    >
                        <Text style={[Styles.toggleTabText, activeTab === 'track' && Styles.toggleTabTextActive]}>
                            Track Events
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.toggleTab, activeTab === 'field' && Styles.toggleTabActive]}
                        onPress={() => setActiveTab('field')}
                    >
                        <Text style={[Styles.toggleTabText, activeTab === 'field' && Styles.toggleTabTextActive]}>
                            Field Events
                        </Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={24} />

                {/* Videos Section */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>Videos</Text>
                    <TouchableOpacity style={Styles.sectionFilterButton}>
                        <Setting5 size={16} color={colors.pureWhite} variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={24} />

                {/* Video Categories */}
                {videoCategories.map(renderCategoryCard)}

                <SizeBox height={30} />

                {/* Add Video Category Button */}
                <TouchableOpacity style={Styles.addCategoryButton} onPress={handleAddVideoCategory}>
                    <Text style={Styles.addCategoryButtonText}>Add Video Category</Text>
                    <Add size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={24} />

                {/* Photos Section */}
                <Text style={Styles.sectionTitle}>Photos</Text>

                <SizeBox height={24} />

                {/* Add Photo Category Button */}
                <TouchableOpacity style={Styles.addCategoryButton} onPress={handleAddPhotoCategory}>
                    <Text style={Styles.addCategoryButtonText}>Add Photo Category</Text>
                    <Add size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={14} />

                {/* Add Unlabelled Photos Button */}
                <TouchableOpacity style={Styles.unlabelledButton} onPress={handleAddUnlabelledPhotos}>
                    <Text style={Styles.unlabelledButtonText}>Add Unlabelled Photos</Text>
                    <Icons.UploadBlue2 width={20} height={20} />
                </TouchableOpacity>

                <SizeBox height={24} />

                {/* Divider */}
                <View style={Styles.divider} />

                <SizeBox height={24} />

                {/* Finish Button */}
                <TouchableOpacity style={Styles.finishButton} onPress={handleFinish}>
                    <Text style={Styles.finishButtonText}>Finish</Text>
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default CompetitionDetailsScreen;
