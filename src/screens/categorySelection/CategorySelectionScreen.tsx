import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gallery, Camera, Profile2User, ArrowRight, TickCircle } from 'iconsax-react-nativejs';
import { createStyles } from './CategorySelectionScreenStyles';
import SizeBox from '../../constants/SizeBox';
import CustomButton from '../../components/customButton/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface CategoryOption {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    iconSelected: React.ReactNode;
}

const CategorySelectionScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState<'find' | 'sell' | 'manage'>('find');
    const [isLoading, setIsLoading] = useState(false);

    const categories: CategoryOption[] = [
        {
            id: 'find',
            title: 'Find my photos/videos',
            subtitle: 'Athlete / Parent',
            description: 'Access all your content from events and matches in one place',
            icon: <Gallery size={24} color={colors.grayColor} />,
            iconSelected: <Gallery size={24} color={colors.primaryColor} />,
        },
        {
            id: 'sell',
            title: 'Sell my photos/videos',
            subtitle: 'Photographer',
            description: 'Upload, license, and monetize your work',
            icon: <Camera size={24} color={colors.grayColor} />,
            iconSelected: <Camera size={24} color={colors.primaryColor} />,
        },
        {
            id: 'manage',
            title: 'Manage a club/event',
            subtitle: 'Club/ Admin',
            description: 'Manage photos, team members, and event content',
            icon: <Profile2User size={24} color={colors.grayColor} />,
            iconSelected: <Profile2User size={24} color={colors.primaryColor} />,
        },
    ];

    const handleContinue = async () => {
        setIsLoading(true);
        try {
            await updateUserProfile({ category: selectedCategory });
            navigation.navigate('SelectEventScreen', { selectedCategory });
        } catch (err: any) {
            Alert.alert('Error', 'Failed to save category. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestLogin = () => {
        navigation.navigate('BottomTabBar');
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={Styles.scrollContent}
            >
                <SizeBox height={60} />

                <View style={Styles.headerContainer}>
                    <Text style={Styles.headingText}>What are you here for?</Text>
                    <Text style={Styles.subHeadingText}>
                        Please choose your Category{'\n'}to continue.
                    </Text>
                </View>

                <SizeBox height={24} />

                <View style={Styles.optionsContainer}>
                    {categories.map((category) => {
                        const isSelected = selectedCategory === category.id;
                        return (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    Styles.optionCard,
                                    isSelected && Styles.optionCardSelected,
                                ]}
                                activeOpacity={0.7}
                                onPress={() => setSelectedCategory(category.id as 'find' | 'sell' | 'manage')}
                            >
                                <View style={Styles.optionContent}>
                                    <View style={Styles.optionHeader}>
                                        <View style={[
                                            Styles.iconContainer,
                                            isSelected && Styles.iconContainerSelected,
                                        ]}>
                                            {isSelected ? category.iconSelected : category.icon}
                                        </View>
                                        <View style={Styles.optionTextContainer}>
                                            <Text style={Styles.optionTitle}>{category.title}</Text>
                                            <Text style={Styles.optionSubtitle}>{category.subtitle}</Text>
                                        </View>
                                    </View>
                                    <Text style={Styles.optionDescription}>{category.description}</Text>
                                </View>

                                {isSelected ? (
                                    <TickCircle size={24} color={colors.greenColor} variant="Bold" />
                                ) : (
                                    <View style={Styles.arrowContainer}>
                                        <ArrowRight size={20} color={colors.grayColor} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <SizeBox height={40} />
            </ScrollView>

            <View style={[Styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity
                    style={Styles.guestButton}
                    activeOpacity={0.7}
                    onPress={handleGuestLogin}
                >
                    <Text style={Styles.guestButtonText}>Login as a guest</Text>
                </TouchableOpacity>
{isLoading ? (
                    <ActivityIndicator size="large" color={colors.primaryColor} />
                ) : (
                    <CustomButton title="Continue" onPress={handleContinue} />
                )}
            </View>
        </View>
    );
};

export default CategorySelectionScreen;
