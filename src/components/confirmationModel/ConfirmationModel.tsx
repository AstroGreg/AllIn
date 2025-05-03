import { View, Text, Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from './ConfirmationModelStyles'
import SizeBox from '../../constants/SizeBox';

interface ConfirmationModelProps {
    onClose?: any;
    isVisible?: boolean;
    text?: string;
    onPressYes?: any;
    icon?: any;
}

const ConfirmationModel = ({ onClose, isVisible, text, onPressYes, icon }: ConfirmationModelProps) => {
    return (
        <Modal
            visible={isVisible}
            onRequestClose={onClose}
            transparent={true}
            animationType="fade"
        >
            <View style={Styles.mainContainer}>
                <View style={Styles.container}>
                    <Text style={Styles.text}>{text}</Text>
                    <SizeBox height={10} />
                    <View style={Styles.iconCont}>
                        {icon}
                    </View>
                    <SizeBox height={14} />
                    <View style={Styles.row}>
                        <TouchableOpacity activeOpacity={0.7} style={Styles.noBtn} onPress={onClose}>
                            <Text style={Styles.noText}>No</Text>
                        </TouchableOpacity>
                        <SizeBox width={20} />
                        <TouchableOpacity activeOpacity={0.7} style={Styles.yesBtn} onPress={onPressYes}>
                            <Text style={Styles.yesText}>Yes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default ConfirmationModel