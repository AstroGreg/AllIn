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
    leftBtnText?: string;
    rightBtnText?: string;
    leftBtnTextColor?: string;
    leftBtnBorderColor?: string;
    iconBgColor?: string;
}

const ConfirmationModel = ({
    onClose,
    isVisible,
    text,
    onPressYes,
    icon,
    leftBtnText = 'No',
    rightBtnText = 'Yes',
    leftBtnTextColor,
    leftBtnBorderColor,
    iconBgColor
}: ConfirmationModelProps) => {
    return (
        <Modal
            visible={isVisible}
            onRequestClose={onClose}
            transparent={true}
            animationType="fade"
        >
            <View style={Styles.mainContainer}>
                <View style={Styles.container}>
                    <View style={[Styles.iconCont, iconBgColor && { backgroundColor: iconBgColor }]}>
                        {icon}
                    </View>
                    <SizeBox height={20} />
                    <Text style={Styles.text} numberOfLines={3}>{text}</Text>
                    <SizeBox height={24} />
                    <View style={Styles.row}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={[
                                Styles.noBtn,
                                leftBtnBorderColor && { borderColor: leftBtnBorderColor }
                            ]}
                            onPress={onClose}
                        >
                            <Text style={[
                                Styles.noText,
                                leftBtnTextColor && { color: leftBtnTextColor }
                            ]}>{leftBtnText}</Text>
                        </TouchableOpacity>
                        <SizeBox width={16} />
                        <TouchableOpacity activeOpacity={0.7} style={Styles.yesBtn} onPress={onPressYes}>
                            <Text style={Styles.yesText}>{rightBtnText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default ConfirmationModel
