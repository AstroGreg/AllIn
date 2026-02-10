import { View, Text, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import FastImage from 'react-native-fast-image';
import Colors from '../../../constants/Colors';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import ConfirmationModel from '../../../components/confirmationModel/ConfirmationModel';
import Styles from '../SearchStyles';


interface PhotoContainerProps {
    onPressImg?: any;
    photo?: any;
    name?: string;
    price?: string;
    uploadedAt?: string;
}

const PhotoContainer = ({ onPressImg, photo, name, price, uploadedAt }: PhotoContainerProps) => {
    const deviceWidth = Dimensions.get('window').width;
    const horizontalPadding = 20; // Padding from screen edges
    const spacing = 6; // Spacing between items
    const numColumns = 3;
    const containerWidth = (deviceWidth - (2 * horizontalPadding) - (spacing * (numColumns - 1))) / numColumns;

    const [isDeleteVisible, setIsDeleteVisible] = useState(false)

    return (
        <TouchableOpacity onPress={onPressImg} style={{
            width: containerWidth,
            marginRight: spacing,
            marginBottom: spacing,
            borderRadius: 10,
            overflow: 'hidden',
            padding: 8,
            borderWidth: 0.5,
            borderColor: Colors.lightGrayColor
        }}>
            <View style={Styles.photoImgCont}>
                <FastImage
                    source={photo}
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                />
            </View>
            <SizeBox height={8} />
            <Text style={[Styles.downloadCount, { fontWeight: '400' }]} numberOfLines={1}>{name}</Text>
            <SizeBox height={4} />
            <Text style={[Styles.downloadCount, { fontWeight: '600' }]}>{price}</Text>
            {uploadedAt ? (
                <>
                    <SizeBox height={4} />
                    <Text style={[Styles.downloadCount, { fontWeight: '400' }]} numberOfLines={1}>{uploadedAt}</Text>
                </>
            ) : null}
            <View style={[Styles.btnRight, { bottom: 8, gap: 10 }, Styles.row]}>
                <TouchableOpacity style={[Styles.btnRight, { bottom: 0, right: -5 }]}>
                    <Icons.Download height={18} width={18} />
                </TouchableOpacity>
            </View>

            <ConfirmationModel
                isVisible={isDeleteVisible}
                onClose={() => setIsDeleteVisible(false)}
                text='Are You Sure You Want to Delete This photo?'
                onPressYes={() => setIsDeleteVisible(false)}
                icon={<Icons.DeleteAccount height={24} width={24} />}
            />
        </TouchableOpacity>
    )
}

export default PhotoContainer
