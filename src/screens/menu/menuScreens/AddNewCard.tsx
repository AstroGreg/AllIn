import { View, Text } from 'react-native'
import React, { useState } from 'react'
import Styles from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AddCardTextInput from '../components/AddCardTextInput'
import CustomButton from '../../../components/customButton/CustomButton'

const AddNewCard = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expDate, setExpDate] = useState('');
    const [CVV, setCVV] = useState('');

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Payment Method' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />
            <SizeBox height={34} />
            <View style={Styles.container}>
                <Text style={Styles.containerTitle}>Add new card</Text>
                <SizeBox height={24} />
                <AddCardTextInput
                    label={'Name on card'}
                    placeholder={'Name on card'}
                    value={name}
                    onChangeText={(text: any) => setName(text)}
                />
                <SizeBox height={21} />
                <AddCardTextInput
                    label={'Card number'}
                    placeholder={'Card number'}
                    keyboardType={'number-pad'}
                    value={cardNumber}
                    onChangeText={(text: any) => setCardNumber(text)}
                    maxLength={12}
                />
                <SizeBox height={21} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <AddCardTextInput
                        label={'Expiry date'}
                        placeholder={'Expiry date'}
                        keyboardType={'number-pad'}
                        isHalf={true}
                        value={expDate}
                        onChangeText={(text: any) => setExpDate(text)}
                    />
                    <AddCardTextInput
                        label={'CVV'}
                        placeholder={'***'}
                        keyboardType={'number-pad'}
                        isCVV={true}
                        isHalf={true}
                        value={CVV}
                        onChangeText={(text: any) => setCVV(text)}
                        maxLength={3}
                    />
                </View>
                <SizeBox height={29} />
                <CustomButton title='Add' onPress={() => navigation.goBack()} isSmall={true} />
            </View>

        </View>
    )
}

export default AddNewCard