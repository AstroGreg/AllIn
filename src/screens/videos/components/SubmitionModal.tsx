import { Text, Modal, TouchableOpacity, Vibration, View, } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from './ModalsStyles';
import BorderButton from '../../../components/borderButton/BorderButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '../../../components/customButton/CustomButton';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface SubmitionModalProps {
    isVisible?: boolean;
    onClose?: any;
}

const SubmitionModal = ({ isVisible, onClose, }: SubmitionModalProps) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
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
                    <Text style={[Styles.titleText, { textAlign: 'center' }]}>{t('Report has been submitted')}</Text>
                    <SizeBox height={16} />
                    <TouchableOpacity style={Styles.btnContianer} onPress={onClose}>
                        <Text style={Styles.btnText}>{t('Close')}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>

            </TouchableOpacity>
        </Modal>
    )
}

export default SubmitionModal
