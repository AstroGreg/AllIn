import { View, Text, Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../PhotosStyles';
import Icons from '../../../constants/Icons';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ActionModalProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const ActionModal = ({ visible, onClose, onEdit, onDelete }: ActionModalProps) => {
    const insets = useSafeAreaInsets();
    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
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
                    <TouchableOpacity style={Styles.actionButton} onPress={onEdit}>
                        <Icons.Edit height={21} width={21} />
                        <Text style={Styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.actionButton} onPress={onDelete}>
                        <Icons.DeleteCompetition height={21} width={21} />
                        <Text style={Styles.actionText}>Delete</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

export default ActionModal