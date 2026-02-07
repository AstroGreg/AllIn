import { View, Text, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import FastImage from 'react-native-fast-image';
import Styles from '../ViewUserProfileStyles';
import Colors from '../../../constants/Colors';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import ConfirmationModel from '../../../components/confirmationModel/ConfirmationModel';


interface PhotosContainerProps {
    onPressImg?: any;
    photo?: any;
    name?: string;
    price?: string;
}

const PhotosContainer = ({ onPressImg, photo, name, price }: PhotosContainerProps) => {
    const deviceWidth = Dimensions.get('window').width;
    const spacing = 20;
    const containerWidth = (deviceWidth - (spacing * 3)) / 2; // 3 spaces: left, middle, right

    const [isDeleteVisible, setIsDeleteVisible] = useState(false)

    return (
        <TouchableOpacity onPress={onPressImg} style={{
            width: containerWidth,
            marginLeft: spacing,
            marginBottom: 6,
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
            <View style={[Styles.btnRight, { bottom: 8, gap: 10 }, Styles.row]}>
                <TouchableOpacity>
                    <Icons.Edit height={16} width={16} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsDeleteVisible(true)}>
                    <Icons.DeleteCompetition height={16} width={16} />
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

export default PhotosContainer