import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Styles from '../UploadDetailsStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import CustomTextInput from '../../../components/customTextInput/CustomTextInput'
import Icons from '../../../constants/Icons'
import { launchImageLibrary } from 'react-native-image-picker';
import CustomButton from '../../../components/customButton/CustomButton'


const CreateCompetition = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [selectedImages, setSelectedImages] = useState([]);

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
            }
        } catch (error) {
            console.error('Error picking images:', error);
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title={`Create Competition`} onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />
            <ScrollView style={{ marginHorizontal: 20 }} showsVerticalScrollIndicator={false} >
                <SizeBox height={24} />
                <CustomTextInput
                    label='Competition Name'
                    placeholder='Competition Name type...'
                    icon={<Icons.CompetitionName height={16} width={16} />}
                />
                <SizeBox height={24} />
                <CustomTextInput
                    label='Competition Location'
                    placeholder='Select location'
                    icon={<Icons.LocationSetting height={16} width={16} />}
                    isDown={true}
                />
                <SizeBox height={24} />
                <CustomTextInput
                    label='Competition Date'
                    placeholder='dd/mm/year'
                    icon={<Icons.DOB height={16} width={16} />}
                />
                <SizeBox height={24} />
                <CustomTextInput
                    label='Competition Type'
                    placeholder='Competition type custom'
                    icon={<Icons.LocationSetting height={16} width={16} />}
                    isDown={true}
                />
                <SizeBox height={24} />
                <View style={Styles.box}>
                    <Text style={Styles.titleText}>Upload Event Thumbnail</Text>
                    <SizeBox height={12} />
                    <TouchableOpacity style={Styles.uploadContainer} onPress={() => handleImagePicker()}>
                        <Text style={Styles.uploadText}>Browse Files Images</Text>
                        <SizeBox width={4} />
                        <Icons.CameraBlue height={18} width={18} />
                    </TouchableOpacity>
                </View>

                <SizeBox height={24} />

                <CustomButton onPress={() => navigation.goBack()} title='Submit' />
            </ScrollView>
        </View>
    )
}

export default CreateCompetition