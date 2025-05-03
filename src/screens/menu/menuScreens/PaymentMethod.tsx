import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Styles from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icons from '../../../constants/Icons'
import MenuContainers from '../components/MenuContainers'
import FastImage from 'react-native-fast-image'
import CustomButton from '../../../components/customButton/CustomButton'

const PaymentMethod = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const [isSelected, setIsSelected] = useState(1);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Payment Method' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />
            <SizeBox height={34} />
            <View style={Styles.container}>
                <View style={Styles.row}>
                    <Text style={Styles.containerTitle}>Payment Methods</Text>
                    <TouchableOpacity activeOpacity={0.7} style={Styles.borderBtn} onPress={() => navigation.navigate('AddNewCard')}>
                        <Text style={Styles.btnText}>Add new card</Text>
                        <Icons.AddGrey height={18} width={18} />
                    </TouchableOpacity>
                </View>

                <SizeBox height={25} />

                <TouchableOpacity activeOpacity={0.7} style={Styles.menuContainer} onPress={() => setIsSelected(1)}>
                    <FastImage source={Icons.MasterCard} style={Styles.paymentIcons} />
                    <SizeBox width={12} />
                    <Text style={Styles.titlesText}>Pay with Master Card</Text>

                    <View style={[Styles.selectionContainer, Styles.nextArrow]}>
                        {isSelected === 1 && <View style={Styles.selected} />}
                    </View>
                </TouchableOpacity>
                <SizeBox height={24} />

                <TouchableOpacity activeOpacity={0.7} style={Styles.menuContainer} onPress={() => setIsSelected(2)}>
                    <FastImage source={Icons.Payconiq} style={Styles.paymentIcons} />
                    <SizeBox width={12} />
                    <Text style={Styles.titlesText}>Pay with Payconiq Card</Text>

                    <View style={[Styles.selectionContainer, Styles.nextArrow]}>
                        {isSelected === 2 && <View style={Styles.selected} />}
                    </View>
                </TouchableOpacity>
                <SizeBox height={24} />

                <TouchableOpacity activeOpacity={0.7} style={Styles.menuContainer} onPress={() => setIsSelected(3)}>
                    <FastImage source={Icons.Bancontact} style={Styles.paymentIcons} />
                    <SizeBox width={12} />
                    <Text style={Styles.titlesText}>Pay with Bancontact</Text>

                    <View style={[Styles.selectionContainer, Styles.nextArrow]}>
                        {isSelected === 3 && <View style={Styles.selected} />}
                    </View>
                </TouchableOpacity>

                <SizeBox height={30} />
                <CustomButton title='Pay' onPress={() => { }} isSmall={true} />
            </View>
        </View>
    )
}

export default PaymentMethod