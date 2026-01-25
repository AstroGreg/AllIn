import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import { CloseCircle, Note, ArrowDown, ArrowRight } from 'iconsax-react-nativejs'
import Colors from '../../constants/Colors'
import Styles from './ManageSocialMediaModalStyles'

interface ManageSocialMediaModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
}

const ManageSocialMediaModal = ({ visible, onClose, onSave }: ManageSocialMediaModalProps) => {
    const [selectedSocialMedia, setSelectedSocialMedia] = useState('');

    const handleAddMore = () => {
        // Handle add more logic
    };

    const handleSave = () => {
        onSave();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={Styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={Styles.modalContainer}>
                            {/* Close Button */}
                            <TouchableOpacity style={Styles.closeButton} onPress={onClose}>
                                <CloseCircle size={24} color="#9B9F9F" variant="Linear" />
                            </TouchableOpacity>

                            {/* Social Media Input */}
                            <View style={Styles.inputContainer}>
                                <Text style={Styles.inputLabel}>Social Media</Text>
                                <TouchableOpacity style={Styles.selectInput}>
                                    <View style={Styles.selectInputContent}>
                                        <Note size={16} color="#777777" variant="Linear" />
                                        <Text style={Styles.selectInputText}>
                                            {selectedSocialMedia || 'Select Social Media'}
                                        </Text>
                                    </View>
                                    <ArrowDown size={20} color="#777777" variant="Linear" />
                                </TouchableOpacity>
                            </View>

                            {/* Buttons */}
                            <View style={Styles.buttonsContainer}>
                                <TouchableOpacity style={Styles.addMoreButton} onPress={handleAddMore}>
                                    <Text style={Styles.addMoreButtonText}>Add More</Text>
                                    <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                                </TouchableOpacity>
                                <TouchableOpacity style={Styles.saveButton} onPress={handleSave}>
                                    <Text style={Styles.saveButtonText}>Save</Text>
                                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default ManageSocialMediaModal
