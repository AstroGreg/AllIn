import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import SizeBox from '../../../constants/SizeBox';
import Styles from './ModalsStyles';
import BorderButton from '../../../components/borderButton/BorderButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icons from '../../../constants/Icons';
import Colors from '../../../constants/Colors';

interface DescriptionModalProps {
    isVisible?: boolean;
    onClose?: any;
    onPressNext?: any;
    onPressPrevious?: any;
}


const DescriptionModal = ({ isVisible, onClose, onPressPrevious, onPressNext }: DescriptionModalProps) => {
    const insets = useSafeAreaInsets();
    const [bio, setBio] = useState('');

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
                    <SizeBox height={10} />
                    <View style={Styles.divider} />
                    <SizeBox height={19} />

                    <View style={Styles.bioContainer}>
                        <View style={Styles.iconRow}>
                            <View style={Styles.icon}>
                                <Icons.Edit height={16} width={16} />
                            </View>
                            <TextInput
                                style={Styles.textInput}
                                placeholder="Add a shot description"
                                placeholderTextColor={Colors.subTextColor}
                                multiline
                                value={bio}
                                onChangeText={setBio}
                            />
                        </View>
                    </View>

                    <SizeBox height={16} />
                    <View style={[Styles.row, { justifyContent: 'space-between' }]}>
                        <BorderButton title='Previous' onPress={onPressPrevious} />
                        <BorderButton isFilled={true} title='Next' onPress={onPressNext} />
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

export default DescriptionModal