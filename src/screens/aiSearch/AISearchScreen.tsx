import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import React, { useState } from 'react';
import { createStyles } from './AISearchStyles';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Icons from '../../constants/Icons';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';

const AISearchScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleOptionPress = (optionId: string) => {
        setSelectedOption(optionId);
        setShowModal(true);
    };

    const searchOptions = [
        { id: 'bib', label: 'Chest number' },
        { id: 'face', label: 'Face' },
        { id: 'context', label: 'Context' },
    ];

    const renderSearchOption = (option: any) => {
        const isSelected = selectedOption === option.id;

        return (
            <TouchableOpacity
                key={option.id}
                style={[Styles.optionButton, isSelected && Styles.optionButtonActive]}
                activeOpacity={0.85}
                onPress={() => handleOptionPress(option.id)}
            >
                <Text style={[Styles.optionButtonText, isSelected && Styles.optionButtonTextActive]}>
                    {option.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>AI Search</Text>
                <View style={{width: 44, height: 44}} />
            </View>

            {/* Top Section */}
            <View style={Styles.topSection}>
                {/* Title Section */}
                <View style={Styles.titleSection}>
                    <Text style={Styles.mainTitle}>How Should AI</Text>
                    <Text style={Styles.mainTitle}>Find You?</Text>
                    <SizeBox height={12} />
                    <Text style={Styles.subtitle}>Choose what you remember.</Text>
                    <Text style={Styles.subtitle}>AI handles the rest.</Text>
                </View>
            </View>

            {/* Search Options */}
            <ScrollView
                style={Styles.optionsContainer}
                contentContainerStyle={Styles.optionsContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={Styles.searchByLabel}>Search by</Text>
                <View style={Styles.optionsRow}>
                    {searchOptions.map(renderSearchOption)}
                </View>
                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            {/* Subscription Modal */}
            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <TouchableOpacity
                    style={Styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowModal(false)}
                >
                    <TouchableOpacity activeOpacity={1} style={Styles.modalContainer}>
                        {/* Modal Header with Icon and Price */}
                        <View style={Styles.modalHeader}>
                            <Icons.AiColorful width={80} height={80} />
                            <Text style={Styles.modalPrice}>$19/month</Text>
                        </View>

                        {/* Modal Title */}
                        <Text style={Styles.modalTitle}>Find Your Photos</Text>
                        <Text style={Styles.modalTitle}>& Videos Instantly</Text>

                        {/* Modal Description */}
                        <Text style={Styles.modalDescription}>
                            Fast AI search by face, chest number, or context in seconds.
                        </Text>

                        {/* Subscribe Button */}
                        <TouchableOpacity onPress={() => {
                            setShowModal(false);
                            navigation.navigate('PaymentMethod');
                        }}>
                            <View style={Styles.subscribeButton}>
                                <Text style={Styles.subscribeButtonText}>Subscribe Now</Text>
                                <ArrowRight size={24} color="#FFFFFF" variant="Linear" />
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default AISearchScreen;
