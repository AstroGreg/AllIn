import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, Notification, ArrowRight } from 'iconsax-react-nativejs'
import Styles from './WatermarkScreenStyles'
import SizeBox from '../../constants/SizeBox'
import Colors from '../../constants/Colors'
import Icons from '../../constants/Icons'
import Images from '../../constants/Images'

interface SavedWatermark {
    id: number;
    name: string;
    thumbnail: any;
}

const WatermarkScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const competition = route?.params?.competition;
    const account = route?.params?.account;
    const anonymous = route?.params?.anonymous;

    const [watermarkOption, setWatermarkOption] = useState<'new' | 'saved' | 'default'>('saved');
    const [selectedWatermark, setSelectedWatermark] = useState<number>(1);

    const savedWatermarks: SavedWatermark[] = [
        { id: 1, name: 'Sample', thumbnail: Images.photo1 },
        { id: 2, name: 'Sample', thumbnail: Images.photo1 },
        { id: 3, name: 'Sample', thumbnail: Images.photo1 },
    ];

    const handleChooseFile = () => {
        // Handle file picker
    };

    const handlePreview = () => {
        navigation.navigate('UploadSummaryScreen', {
            competition,
            account,
            anonymous,
            watermark: watermarkOption === 'saved' ? savedWatermarks.find(w => w.id === selectedWatermark) : null
        });
    };

    const renderWatermarkCard = (watermark: SavedWatermark) => {
        const isSelected = selectedWatermark === watermark.id;
        return (
            <TouchableOpacity
                key={watermark.id}
                style={[Styles.watermarkCard, isSelected && Styles.watermarkCardSelected]}
                onPress={() => setSelectedWatermark(watermark.id)}
            >
                <View style={Styles.watermarkThumbnail}>
                    <FastImage source={watermark.thumbnail} style={Styles.watermarkImage} resizeMode="cover" />
                </View>
                <Text style={[Styles.watermarkName, isSelected && Styles.watermarkNameSelected]}>
                    {watermark.name}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>WaterMark</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {watermarkOption === 'default' ? (
                    <>
                        {/* Default Watermark Preview */}
                        <View style={Styles.defaultWatermarkContainer}>
                            <FastImage source={Images.fiverr} style={Styles.defaultWatermarkImage} resizeMode="contain" />
                        </View>

                        <SizeBox height={20} />
                    </>
                ) : (
                    <>
                        {/* Upload Custom Watermark Section */}
                        <View style={Styles.sectionHeader}>
                            <Text style={Styles.sectionTitle}>Upload Custom Watermark</Text>
                            <Text style={Styles.sectionSubtitle}>Leave blank for default</Text>
                        </View>

                        <SizeBox height={10} />

                        {/* Upload Area */}
                        <View style={Styles.uploadArea}>
                            <Text style={Styles.maxSizeText}>Maximum Size: 2MB</Text>
                            <Icons.UploadBlue2 width={30} height={30} />
                            <SizeBox height={24} />
                            <View style={Styles.chooseFileContainer}>
                                <TouchableOpacity style={Styles.chooseFileButton} onPress={handleChooseFile}>
                                    <Text style={Styles.chooseFileButtonText}>Choose File</Text>
                                </TouchableOpacity>
                                <Text style={Styles.noFileText}>No File Chosen</Text>
                            </View>
                        </View>

                        <SizeBox height={20} />
                    </>
                )}

                {/* Radio Options */}
                <View style={Styles.radioOptionsContainer}>
                    <TouchableOpacity
                        style={Styles.radioOption}
                        onPress={() => setWatermarkOption('new')}
                    >
                        <Text style={Styles.radioLabel}>New Watermark</Text>
                        <View style={[Styles.radioOuter, watermarkOption === 'new' && Styles.radioOuterSelected]}>
                            {watermarkOption === 'new' && <View style={Styles.radioInner} />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={Styles.radioOption}
                        onPress={() => setWatermarkOption('saved')}
                    >
                        <Text style={Styles.radioLabel}>Saved Watermarks</Text>
                        <View style={[Styles.radioOuter, watermarkOption === 'saved' && Styles.radioOuterSelected]}>
                            {watermarkOption === 'saved' && <View style={Styles.radioInner} />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={Styles.radioOption}
                        onPress={() => setWatermarkOption('default')}
                    >
                        <Text style={Styles.radioLabel}>Default</Text>
                        <View style={[Styles.radioOuter, watermarkOption === 'default' && Styles.radioOuterSelected]}>
                            {watermarkOption === 'default' && <View style={Styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                </View>

                {watermarkOption === 'saved' && (
                    <>
                        <SizeBox height={24} />

                        {/* Saved Watermarks Section */}
                        <View style={Styles.savedWatermarksHeader}>
                            <Text style={Styles.savedWatermarksTitle}>Saved Watermarks</Text>
                            <Text style={Styles.savedWatermarksSubtitle}>
                                Choose from your previously created watermarks
                            </Text>
                        </View>

                        <SizeBox height={16} />

                        {/* Watermark Cards */}
                        <View style={Styles.watermarksRow}>
                            {savedWatermarks.map(renderWatermarkCard)}
                        </View>
                    </>
                )}

                <SizeBox height={30} />

                {/* Preview Button */}
                <TouchableOpacity style={Styles.previewButton} onPress={handlePreview}>
                    <Text style={Styles.previewButtonText}>Preview</Text>
                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default WatermarkScreen;
