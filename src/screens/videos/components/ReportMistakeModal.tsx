import { View, Text, Modal, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import SizeBox from '../../../constants/SizeBox';
import Styles from './ModalsStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BorderButton from '../../../components/borderButton/BorderButton';

interface ReportMistakeModalProps {
    isVisible?: boolean;
    onClose?: any;
    onPressNext?: any;
}

const ReportMistakeModal = ({ isVisible, onClose, onPressNext }: ReportMistakeModalProps) => {
    const insets = useSafeAreaInsets();
    const [selectedItem, setSelectedItem] = useState(0);

    const data = [
        {
            id: 1,
            name: 'Wrong Heat',
        },
        {
            id: 2,
            name: 'Wrong Competition',
        },
        {
            id: 3,
            name: 'Wrong Results or People Tagged',
        },
        {
            id: 4,
            name: 'Other',
        },
    ]

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
                    <SizeBox height={4} />
                    <Text style={Styles.titleText}>Choose a reason for the report:</Text>
                    <SizeBox height={10} />
                    <View style={Styles.divider} />
                    <SizeBox height={19} />
                    <View style={Styles.container}>
                        {
                            data.map((item, index) => (
                                <TouchableOpacity activeOpacity={0.9} style={Styles.row} onPress={() => setSelectedItem(item.id)}>
                                    <View style={Styles.checkBox}>
                                        {selectedItem === item.id && <View style={Styles.selectedDot} />}
                                    </View>
                                    <Text style={Styles.selectionText}>{item.name}</Text>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                    <SizeBox height={16} />
                    <View style={Styles.btn}>
                        <BorderButton isFilled={true} title='Next' onPress={onPressNext} />
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>

    )
}

export default ReportMistakeModal