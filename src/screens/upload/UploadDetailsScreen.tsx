import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Styles from './UploadDetailsStyles'
import SizeBox from '../../constants/SizeBox'
import CustomHeader from '../../components/customHeader/CustomHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icons from '../../constants/Icons'
import CustomSwitch from '../../components/customSwitch/CustomSwitch'
import { launchImageLibrary } from 'react-native-image-picker';

const UploadDetailsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [isEnabled, setIsEnabled] = useState(true);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const toggleSwitch = () => {
        setIsEnabled(prev => !prev);
    };

    const handleImagePicker = async () => {
        const options: any = {
            mediaType: 'photo',
            selectionLimit: 0,
            quality: 1,
        };

        try {
            const result: any = await launchImageLibrary(options);

            if (result.assets) {
                setSelectedImages(result.assets);
                setSelectedVideo(null);
            }
        } catch (error) {
            console.error('Error picking images:', error);
        }
    };

    const handleVideoPicker = async () => {
        const options: any = {
            mediaType: 'video',
            selectionLimit: 1,
            quality: 1,
        };

        try {
            const result: any = await launchImageLibrary(options);
            if (result.assets && result.assets[0]) {
                setSelectedVideo(result.assets[0]);
                setSelectedImages([]); // Clear images when video is selected
            }
        } catch (error) {
            console.error('Error picking video:', error);
        }
    };

    const handleUpload = () => {
        if (selectedImages.length > 0) {
            navigation.navigate('UploadedImagesScreen', { images: selectedImages });
        } else if (selectedVideo) {
            navigation.navigate('SelectCategory', { video: selectedVideo });
        }
    };


    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Upload Details' isBack={false} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <View style={Styles.container}>
                <Text style={Styles.titleText}>Upload</Text>

                {selectedImages.length > 0 && (
                    <View style={Styles.selectedImagesContainer}>
                        <Text style={Styles.subText}>
                            Selected {selectedImages.length} images
                        </Text>
                    </View>
                )}

                {selectedVideo && (
                    <View style={Styles.selectedVideoContainer}>
                        <Text style={Styles.subText}>
                            Selected video: {selectedVideo.fileName}
                        </Text>
                        <Text style={Styles.videoDetails}>
                            Duration: {Math.round(selectedVideo.duration)} seconds
                        </Text>
                    </View>
                )}

                <SizeBox height={12} />
                <TouchableOpacity style={Styles.uploadContainer} onPress={() => handleImagePicker()}>
                    <Text style={Styles.uploadText}>Browse Files Images</Text>
                    <SizeBox width={4} />
                    <Icons.CameraBlue height={18} width={18} />
                </TouchableOpacity>

                <SizeBox height={12} />
                <TouchableOpacity style={Styles.uploadContainer} onPress={() => handleVideoPicker()}>
                    <Text style={Styles.uploadText}>Browse Files Videos</Text>
                    <SizeBox width={4} />
                    <Icons.VideoBlue height={18} width={18} />
                </TouchableOpacity>
                <SizeBox height={16} />

                <View style={[Styles.row, { justifyContent: 'space-between' }]}>
                    <View style={Styles.row}>
                        <Icons.HidePassword height={19} width={19} />
                        <SizeBox width={4} />
                        <Text style={Styles.subText}>Upload anonymously</Text>
                    </View>

                    <CustomSwitch isEnabled={isEnabled} toggleSwitch={toggleSwitch} />
                </View>
                <SizeBox height={20} />

                <TouchableOpacity
                    style={[
                        Styles.btnContianer,
                        { opacity: (selectedImages.length > 0 || selectedVideo) ? 1 : 0.5 }
                    ]}
                    onPress={handleUpload}
                    disabled={!(selectedImages.length > 0 || selectedVideo)}
                >
                    <Text style={Styles.btnText}>{selectedVideo ? 'Next' : 'Upload'}</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}

export default UploadDetailsScreen