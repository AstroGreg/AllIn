import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Styles from './SelectCategoryStyles';
import Icons from '../../constants/Icons';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';

const SelectCategoryScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    const categories = [
        {
            id: 1,
            title: 'Individual',
            description: 'Lorem Ipsum is simply dummy text of the printing',
            Icon: Icons.IndividualColorful,
        },
        {
            id: 2,
            title: 'Photographer / Videographer',
            description: 'Lorem Ipsum is simply dummy text of the printing',
            Icon: Icons.PhotographerColorful,
        },
        {
            id: 3,
            title: 'Group',
            description: 'Lorem Ipsum is simply dummy text of the printing',
            Icon: Icons.GroupColorful,
        },
    ];

    const renderCategoryCard = (category: any) => (
        <TouchableOpacity
            key={category.id}
            style={[
                Styles.categoryCard,
                selectedCategory === category.id && Styles.categoryCardSelected
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.8}
        >
            <View style={Styles.categoryCardContent}>
                <View style={Styles.categoryIconContainer}>
                    <category.Icon width={60} height={60} />
                </View>
                <View style={Styles.categoryDetails}>
                    <Text style={Styles.categoryTitle}>{category.title}</Text>
                    <Text style={Styles.categoryDescription}>{category.description}</Text>
                </View>
            </View>
            <View style={[
                Styles.radioButton,
                selectedCategory === category.id && Styles.radioButtonSelected
            ]}>
                {selectedCategory === category.id && <View style={Styles.radioButtonInner} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Title Section */}
                <View style={Styles.titleSection}>
                    <Text style={Styles.title}>Select Your Category</Text>
                    <Text style={Styles.subtitle}>Please choose your Category{'\n'}to continue.</Text>
                </View>

                {/* Categories List */}
                <View style={Styles.categoriesContainer}>
                    {categories.map(renderCategoryCard)}
                </View>
            </ScrollView>

            {/* Continue Button */}
            <View style={[Styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={[
                        Styles.continueButton,
                        !selectedCategory && Styles.continueButtonDisabled
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
                    <Text style={Styles.continueButtonText}>Continue</Text>
                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SelectCategoryScreen;
