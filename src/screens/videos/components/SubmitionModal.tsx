import { Text, Modal, TouchableOpacity, Vibration, View, } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox';
import Styles from './ModalsStyles';
import BorderButton from '../../../components/borderButton/BorderButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '../../../components/customButton/CustomButton';

interface SubmitionModalProps {
    isVisible?: boolean;
    onClose?: any;
}

const SubmitionModal = ({ isVisible, onClose, }: SubmitionModalProps) => {
    const insets = useSafeAreaInsets();
    return (
        <Modal
            transparent
            animationType="fade"
            visible={isVisible}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={Styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <SizeBox height={insets.top} />
                <TouchableOpacity
                    style={Styles.modalContent}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <Text style={[Styles.titleText, { textAlign: 'center' }]}>Report has been submitted</Text>
                    <SizeBox height={16} />
                    <TouchableOpacity style={Styles.btnContianer} onPress={onClose}>
                        <Text style={Styles.btnText}>Close</Text>
                    </TouchableOpacity>
                </TouchableOpacity>

            </TouchableOpacity>
        </Modal>
    )
}

export default SubmitionModal