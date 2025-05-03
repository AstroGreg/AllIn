import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../SearchStyles'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icons from '../../../constants/Icons'

const VideosForEvent = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const renderItem = () => {
        return (
            <View style={[Styles.borderBox, { marginBottom: 24 }]}>
                <Text style={Styles.subText}>17:45 / MIN-M (Series)</Text>
                <SizeBox height={20} />
                <View style={[Styles.row, Styles.spaceBetween]}>
                    <Text style={Styles.subText}>Author: Smith</Text>
                    <Text style={Styles.subText}>5:06 Mins</Text>
                    <Text style={Styles.subText}>5k Views</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('VideoScreen')} style={Styles.playIcon}>
                    <Icons.PlayCricle height={24} width={24} />
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Video' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <FlatList
                data={['', '', '', '', '', '']}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        <SizeBox height={24} />
                        <View style={{ marginHorizontal: 20 }}>
                            <Text style={Styles.titleText}>60 meter</Text>
                            <SizeBox height={2} />
                            <Text style={Styles.filterText}>60 meter 10 videos available</Text>
                            <SizeBox height={10} />
                            <View style={Styles.separator} />
                        </View>
                        <SizeBox height={27} />
                    </>
                }
            />
        </View>
    )
}

export default VideosForEvent