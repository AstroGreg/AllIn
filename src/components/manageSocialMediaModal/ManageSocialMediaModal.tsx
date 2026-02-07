import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import { CloseCircle, Note, ArrowDown, ArrowRight } from 'iconsax-react-nativejs'
import { createStyles } from './ManageSocialMediaModalStyles'
import { useTheme } from '../../context/ThemeContext'

interface ManageSocialMediaModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
}

const ManageSocialMediaModal = ({ visible, onClose, onSave }: ManageSocialMediaModalProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
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
                                <CloseCircle size={24} color={colors.subTextColor} variant="Linear" />
                            </TouchableOpacity>

                            {/* Social Media Input */}
                            <View style={Styles.inputContainer}>
                                <Text style={Styles.inputLabel}>Social Media</Text>
                                <TouchableOpacity style={Styles.selectInput}>
                                    <View style={Styles.selectInputContent}>
                                        <Note size={16} color={colors.grayColor} variant="Linear" />
                                        <Text style={Styles.selectInputText}>
                                            {selectedSocialMedia || 'Select Social Media'}
                                        </Text>
                                    </View>
                                    <ArrowDown size={20} color={colors.grayColor} variant="Linear" />
                                </TouchableOpacity>
                            </View>

                            {/* Buttons */}
                            <View style={Styles.buttonsContainer}>
                                <TouchableOpacity style={Styles.addMoreButton} onPress={handleAddMore}>
                                    <Text style={Styles.addMoreButtonText}>Add More</Text>
                                    <ArrowRight size={18} color={colors.subTextColor} variant="Linear" />
                                </TouchableOpacity>
                                <TouchableOpacity style={Styles.saveButton} onPress={handleSave}>
                                    <Text style={Styles.saveButtonText}>Save</Text>
                                    <ArrowRight size={18} color="#FFFFFF" variant="Linear" />
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
