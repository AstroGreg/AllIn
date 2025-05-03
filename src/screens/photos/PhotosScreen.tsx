import { View, Text, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Styles from './PhotosStyles'
import SizeBox from '../../constants/SizeBox'
import CustomHeader from '../../components/customHeader/CustomHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Icons from '../../constants/Icons'
import ActionModal from './components/ActionModal'
import Images from '../../constants/Images'

const PhotosScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { photoUri } = route.params || { photoUri: Images.photo4 }
    const deviceWidth = Dimensions.get('window').width;
    const deviceHeight = Dimensions.get('window').height;
    const padding = 20;
    const containerWidth = deviceWidth - (padding * 2);
    const containerHeight = deviceHeight - (padding * 2) - insets.top - 56 - insets.bottom; // 56 is header height

    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Photos' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />
            <View style={{
                padding: padding,
                flex: 1,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <View style={{
                    width: containerWidth,
                    height: containerHeight,
                    borderRadius: 10,
                    overflow: 'hidden'
                }}>
                    <FastImage
                        source={photoUri}
                        style={{
                            width: '100%',
                            height: '100%'
                        }}
                        resizeMode={FastImage.resizeMode.stretch}
                    />

                    <View style={Styles.views}>
                        <Icons.Eye height={24} width={24} />
                        <SizeBox width={4} />
                        <Text style={Styles.viewCount}>122K+</Text>
                    </View>
                    <TouchableOpacity style={Styles.moreActionIcon} onPress={() => setModalVisible(true)}>
                        <Icons.MoreAction height={24} width={24} />
                    </TouchableOpacity>

                    <Text style={[Styles.viewCount, Styles.imgText]}>PK 2025 indoor Passionate </Text>

                    <TouchableOpacity style={Styles.downBtn}>
                        <Text style={Styles.viewCount}>Download</Text>
                    </TouchableOpacity>

                </View>
            </View>

            <ActionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onEdit={() => {
                    setModalVisible(false);
                    console.log('Edit pressed');
                }}
                onDelete={() => {
                    setModalVisible(false);
                    console.log('Delete pressed');
                }}
            />
            <SizeBox height={insets.bottom} />
        </View>
    )
}

export default PhotosScreen