import { View, Text } from 'react-native';
import React from 'react';
import Styles from './CongratulationsStyles';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '../../components/customButton/CustomButton';
import { CommonActions } from '@react-navigation/native';

interface CongratulationsScreenProps {
    navigation?: any;
}

const CongratulationsScreen = ({ navigation }: CongratulationsScreenProps) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <View style={Styles.imageContainer}>
                <FastImage source={Images.congratulations} style={Styles.img} />
            </View>
            <SizeBox height={24} />
            <Text style={Styles.screenHeader}>Congratulations</Text>
            <SizeBox height={8} />
            <Text style={Styles.subText}>Welcome to the new event. You will get the notifications regularly.</Text>
            <SizeBox height={100} />
            <CustomButton title='Back' onPress={() => {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'EventsScreen' }],
                    })
                )
            }}
            />
        </View>
    )
}

export default CongratulationsScreen