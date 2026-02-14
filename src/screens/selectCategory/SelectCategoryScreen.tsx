import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles } from './SelectCategoryStyles';
import Icons from '../../constants/Icons';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const SelectCategoryScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    const categories = [
        {
            id: 1,
            title: t('Individual'),
            description: t('Lorem Ipsum is simply dummy text of the printing'),
            Icon: Icons.IndividualColorful,
        },
        {
            id: 2,
            title: t('Photographer / Videographer'),
            description: t('Lorem Ipsum is simply dummy text of the printing'),
            Icon: Icons.PhotographerColorful,
        },
        {
            id: 3,
            title: t('Group'),
            description: t('Lorem Ipsum is simply dummy text of the printing'),
            Icon: Icons.GroupColorful,
        },
    ];

    const renderCategoryCard = (category: any) => (
        <TouchableOpacity
            key={category.id}
            style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardSelected
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.8}
        >
            <View style={styles.categoryCardContent}>
                <View style={styles.categoryIconContainer}>
                    <category.Icon width={60} height={60} />
                </View>
                <View style={styles.categoryDetails}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
            </View>
            <View style={[
                styles.radioButton,
                selectedCategory === category.id && styles.radioButtonSelected
            ]}>
                {selectedCategory === category.id && <View style={styles.radioButtonInner} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{t('Select Your Category')}</Text>
                    <Text style={styles.subtitle}>{t('Please choose your Category')}{'\n'}{t('to continue.')}</Text>
                </View>

                {/* Categories List */}
                <View style={styles.categoriesContainer}>
                    {categories.map(renderCategoryCard)}
                </View>
            </ScrollView>

            {/* Continue Button */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        !selectedCategory && styles.continueButtonDisabled
                    ]}
                    disabled={!selectedCategory}
                    onPress={() => {
                        if (selectedCategory === 1 || selectedCategory === 2 || selectedCategory === 3) {
                            // Individual, Photographer/Videographer, or Group selected - go to event interest selection
                            navigation.navigate('SelectEventInterestScreen', { category: selectedCategory });
                        } else {
                            // For other categories, go back for now
                            navigation.goBack();
                        }
                    }}
                >
                    <Text style={styles.continueButtonText}>{t('Continue')}</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SelectCategoryScreen;
