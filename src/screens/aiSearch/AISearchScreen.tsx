import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import React, { useState } from 'react';
import { createStyles } from './AISearchStyles';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Icons from '../../constants/Icons';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';

const AISearchScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const Styles = createStyles(colors);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleOptionPress = (optionId: string) => {
        setSelectedOption(optionId);
        setShowModal(true);
    };

    const searchOptions = [
        {
            id: 'bib',
            title: 'BIB Number Search',
            description: 'Instantly find every photo from your event.',
            badge: 'Fastest',
            badgeIcon: 'bolt',
            gradientColors: ['#2B7FFF', '#155DFC'],
            icon: 'hash',
            badgeBgColor: '#DBEAFE',
            badgeBorderColor: '#BEDBFF',
            badgeTextColor: '#1447E6',
        },
        {
            id: 'context',
            title: 'Context Search',
            description: "Search things like 'red shirt', 'finish line', or 'sunset'.",
            badge: 'AI Magic',
            badgeIcon: 'ai',
            gradientColors: ['#8E51FF', '#9810FA'],
            icon: 'image',
            badgeBgColor: '#F3E8FF',
            badgeBorderColor: '#E9D4FF',
            badgeTextColor: '#8200DB',
        },
        {
            id: 'face',
            title: 'Face Search',
            description: 'Add your face once. AI finds you forever.',
            badge: 'Best Results',
            badgeIcon: 'target',
            gradientColors: ['#615FFF', '#7F22FE'],
            icon: 'facescan',
            badgeBgColor: '#E0E7FF',
            badgeBorderColor: '#C6D2FF',
            badgeTextColor: '#432DD7',
            hasBlurEffect: true,
        },
    ];

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'hash':
                return <Icons.HashWhite width={32} height={32} />;
            case 'image':
                return <Icons.ImageWhite width={32} height={32} />;
            case 'facescan':
                return <Icons.FacescanWhite width={32} height={32} />;
            default:
                return null;
        }
    };

    const getBadgeIcon = (iconName: string) => {
        switch (iconName) {
            case 'bolt':
                return <Icons.BoltBlue width={16} height={16} />;
            case 'ai':
                return <Icons.AiViolate width={16} height={16} />;
            case 'target':
                return <Icons.TargetBlue width={16} height={16} />;
            default:
                return null;
        }
    };

    const renderSearchOption = (option: any) => {
        const isSelected = selectedOption === option.id;

        return (
            <TouchableOpacity
                key={option.id}
                style={[
                    Styles.searchOptionCard,
                    isSelected && Styles.searchOptionCardSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => handleOptionPress(option.id)}
            >
                <View style={Styles.searchOptionContent}>
                    {/* Icon Container */}
                    <View style={isSelected ? Styles.iconContainerWrapper : null}>
                        {option.hasBlurEffect && <View style={Styles.iconBlurEffect} />}
                        <LinearGradient
                            colors={option.gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={Styles.iconContainer}
                        >
                            {getIcon(option.icon)}
                        </LinearGradient>
                    </View>

                    {/* Text Content */}
                    <View style={Styles.textContainer}>
                        <Text style={Styles.optionTitle}>{option.title}</Text>
                        <Text style={Styles.optionDescription}>{option.description}</Text>

                        {/* Badge */}
                        <View
                            style={[
                                Styles.badge,
                                {
                                    backgroundColor: option.badgeBgColor,
                                    borderColor: option.badgeBorderColor,
                                },
                            ]}
                        >
                            {getBadgeIcon(option.badgeIcon)}
                            <Text style={[Styles.badgeText, { color: option.badgeTextColor }]}>
                                {option.badge}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Progress Bar */}
                {isSelected && (
                    <LinearGradient
                        colors={option.gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={Styles.progressBar}
                    />
                )}
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

            {/* Top Section with Gradient Background */}
            <LinearGradient
                colors={isDark ? [colors.backgroundColor, colors.backgroundColor] : ['#F5F3FF', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={Styles.topSection}
            >
                {/* Title Section */}
                <View style={Styles.titleSection}>
                    <Text style={Styles.mainTitle}>How Should AI</Text>
                    <Text style={Styles.mainTitle}>Find You?</Text>
                    <SizeBox height={12} />
                    <Text style={Styles.subtitle}>Choose what you remember.</Text>
                    <Text style={Styles.subtitle}>AI handles the rest.</Text>
                </View>
            </LinearGradient>

            {/* Search Options */}
            <ScrollView
                style={Styles.optionsContainer}
                contentContainerStyle={Styles.optionsContent}
                showsVerticalScrollIndicator={false}
            >
                {searchOptions.map(renderSearchOption)}
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
                            Fast AI Search by face, bib number, or context in seconds. Got notified instantly.
                        </Text>

                        {/* Subscribe Button */}
                        <TouchableOpacity onPress={() => {
                            setShowModal(false);
                            navigation.navigate('PaymentMethod');
                        }}>
                            <LinearGradient
                                colors={['#155DFC', '#7F22FE']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={Styles.subscribeButton}
                            >
                                <Text style={Styles.subscribeButtonText}>Subscribe Now</Text>
                                <ArrowRight size={24} color="#FFFFFF" variant="Linear" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default AISearchScreen;
