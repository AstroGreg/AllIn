import { View, Text, Modal, TouchableOpacity, } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox';
import Styles from './ModalsStyles';
import BorderButton from '../../../components/borderButton/BorderButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReviewReportProps {
    isVisible?: boolean;
    onClose?: any;
    onPressNext?: any;
    onPressEdit?: any;
}

const ReviewReport = ({ isVisible, onClose, onPressEdit, onPressNext }: ReviewReportProps) => {
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
                    <Text style={Styles.titleText}>Report Mistake</Text>
                    <SizeBox height={16} />
                    <Text style={Styles.subTitleText}>Review Your Report</Text>
                    <SizeBox height={16} />
                    <View style={[Styles.row, { gap: 0 }]}>
                        <Text style={Styles.subTitleText}>Reason:</Text>
                        <SizeBox width={1} />
                        <Text style={Styles.selectionText}>Wrong Heat</Text>
                    </View>
                    <SizeBox height={16} />
                    <Text style={Styles.subTitleText}>Description:</Text>
                    <SizeBox height={4} />
                    <Text numberOfLines={3} style={Styles.selectionText}>Abcdefghkj</Text>

                    <SizeBox height={16} />
                    <View style={[Styles.row, { justifyContent: 'space-between' }]}>
                        <BorderButton title='Edit' onPress={onPressEdit} />
                        <BorderButton isFilled={true} title='Submit' onPress={onPressNext} />
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

export default ReviewReport