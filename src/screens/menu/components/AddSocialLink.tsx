import { View, Text, Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../MenuStyles';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import Icons from '../../../constants/Icons';
import SizeBox from '../../../constants/SizeBox';

interface AddSocialLinkProps {
    isVisible?: boolean;
    onClose?: any;
    onYesPress?: any;
}

const AddSocialLink = ({
    isVisible,
    onClose,
    onYesPress
}: AddSocialLinkProps) => {
    return (
        <Modal
            visible={isVisible}
            onRequestClose={onClose}
            style={Styles.mainContainer}
            animationType='fade'
            transparent={true}
        >
            <View style={Styles.modalContainer}>
                <View style={Styles.modalContaint}>
                    <CustomTextInput
                        label='Platform'
                        placeholder='Add social platform'
                        icon={<Icons.WebsiteBlue height={16} width={16} />}
                    />
                    <SizeBox height={16} />
                    <CustomTextInput
                        label='Profile Name'
                        placeholder='Add Profile Name'
                        icon={<Icons.User height={16} width={16} />}
                    />
                    <SizeBox height={16} />
                    <CustomTextInput
                        label='Add Profile Link'
                        placeholder='Add Profile Link'
                        icon={<Icons.LinkBlue height={16} width={16} />}
                    />
                    <SizeBox height={24} />
                    <View style={[Styles.row, { justifyContent: 'flex-end' }]}>
                        <TouchableOpacity activeOpacity={0.7} style={Styles.noBtn} onPress={onClose}>
                            <Text style={Styles.noText}>Cancel</Text>
                        </TouchableOpacity>
                        <SizeBox width={20} />
                        <TouchableOpacity activeOpacity={0.7} style={Styles.yesBtn} onPress={onYesPress}>
                            <Text style={Styles.yesText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default AddSocialLink