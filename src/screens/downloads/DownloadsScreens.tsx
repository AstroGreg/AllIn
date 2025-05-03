import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import Styles from './DownloadsStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomHeader from '../../components/customHeader/CustomHeader'
import FastImage from 'react-native-fast-image'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import Fonts from '../../constants/Fonts'
import Colors from '../../constants/Colors'

const DownloadsScreens = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const renderItem = () => {
        return (
            <View style={Styles.downloadContainer}>
                <View style={Styles.imgContainer}>
                    <FastImage
                        source={Images.event1}
                        style={Styles.imges}
                    />
                </View>
                <SizeBox height={15} />
                <View style={[Styles.rowCenter, { justifyContent: "space-between" }]}>
                    <View style={Styles.rowCenter}>
                        <Icons.CalendarGrey height={12} width={12} />
                        <SizeBox width={2} />
                        <Text style={Styles.requestSubText}>12.12.2024</Text>
                    </View>

                    <View style={Styles.rowCenter}>
                        <Icons.Timer height={12} width={12} />
                        <SizeBox width={2} />
                        <Text style={Styles.requestSubText}>12:50 PM</Text>
                    </View>
                </View>
                <SizeBox height={10} />
                <View style={[Styles.rowCenter, { justifyContent: "space-between" }]}>
                    <Text style={Styles.eventTitle} numberOfLines={1}>Saint Barthélemy</Text>
                    <Text style={Styles.eventTitle} numberOfLines={1}>$4</Text>
                </View>

            </View>
        )
    }

    return (
        <View style={Styles.mainContainers}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Totals Downloads' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />
            <SizeBox height={24} />
            <View style={[Styles.rowCenter, { justifyContent: 'space-between' }]}>
                <Text style={Styles.headings}>Esther Howard</Text>
                <Text style={[Styles.headings, {
                    ...Fonts.regular12,
                    color: Colors.grayColor,
                }]}>Downloads: 1400+</Text>
            </View>
            <SizeBox height={10} />

            <FlatList
                data={['', '', '', '', '', '', '', '', '']}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                contentContainerStyle={[Styles.flatListContainer, Styles.contentContainer]}
                showsVerticalScrollIndicator={false}
            />

        </View>
    )
}

export default DownloadsScreens