import { View, Text } from 'react-native'
import React, { useState } from 'react'
import Styles from '../MenuStyles'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SizeBox from '../../../constants/SizeBox';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import MenuContainers from '../components/MenuContainers';
import Icons from '../../../constants/Icons';
import ConfirmationModel from '../../../components/confirmationModel/ConfirmationModel';

const DeleteAndPause = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [isDeleteVisible, setIsDeleteVisible] = useState(false);
    const [isPauseVisible, setIsPauseVisible] = useState(false);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Menu' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />
            <SizeBox height={24} />
            <View style={Styles.container}>

                <Text style={Styles.containerTitle}>Delete/Pause</Text>
                <SizeBox height={16} />

                <MenuContainers
                    icon={<Icons.DeleteAccount height={20} width={20} />}
                    title='Delete your account'
                    onPress={() => setIsDeleteVisible(true)}
                    isNext={true}
                />
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.Pause height={20} width={20} />}
                    title='Pause your account'
                    onPress={() => setIsPauseVisible(true)}
                    isNext={true}
                />
            </View>

            <ConfirmationModel
                isVisible={isDeleteVisible}
                onClose={() => setIsDeleteVisible(false)}
                text='Are You Sure You Want to Delete Your Account?'
                icon={<Icons.DeleteAccount height={24} width={24} />}
                onPressYes={() => { }}
            />

            <ConfirmationModel
                isVisible={isPauseVisible}
                onClose={() => setIsPauseVisible(false)}
                text='Are You Sure You Want to Pause Your account'
                icon={<Icons.Pause height={24} width={24} />}
                onPressYes={() => { }}
            />
        </View>
    )
}

export default DeleteAndPause