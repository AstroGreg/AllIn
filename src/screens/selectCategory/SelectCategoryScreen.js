import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles } from './SelectCategoryStyles';
import Icons from '../../constants/Icons';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const SelectCategoryScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [selectedCategory, setSelectedCategory] = useState(null);
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
    const renderCategoryCard = (category) => (_jsxs(TouchableOpacity, Object.assign({ style: [
            styles.categoryCard,
            selectedCategory === category.id && styles.categoryCardSelected
        ], onPress: () => setSelectedCategory(category.id), activeOpacity: 0.8 }, { children: [_jsxs(View, Object.assign({ style: styles.categoryCardContent }, { children: [_jsx(View, Object.assign({ style: styles.categoryIconContainer }, { children: _jsx(category.Icon, { width: 60, height: 60 }) })), _jsxs(View, Object.assign({ style: styles.categoryDetails }, { children: [_jsx(Text, Object.assign({ style: styles.categoryTitle }, { children: category.title })), _jsx(Text, Object.assign({ style: styles.categoryDescription }, { children: category.description }))] }))] })), _jsx(View, Object.assign({ style: [
                    styles.radioButton,
                    selectedCategory === category.id && styles.radioButtonSelected
                ] }, { children: selectedCategory === category.id && _jsx(View, { style: styles.radioButtonInner }) }))] }), category.id));
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(View, Object.assign({ style: styles.header }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })) })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: styles.titleSection }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: t('Select Your Category') })), _jsxs(Text, Object.assign({ style: styles.subtitle }, { children: [t('Please choose your Category'), '\n', t('to continue.')] }))] })), _jsx(View, Object.assign({ style: styles.categoriesContainer }, { children: categories.map(renderCategoryCard) }))] })), _jsx(View, Object.assign({ style: [styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }] }, { children: _jsxs(TouchableOpacity, Object.assign({ style: [
                        styles.continueButton,
                        !selectedCategory && styles.continueButtonDisabled
                    ], disabled: !selectedCategory, onPress: () => {
                        if (selectedCategory === 1 || selectedCategory === 2 || selectedCategory === 3) {
                            // Individual, Photographer/Videographer, or Group selected - go to event interest selection
                            navigation.navigate('SelectEventInterestScreen', { category: selectedCategory });
                        }
                        else {
                            // For other categories, go back for now
                            navigation.goBack();
                        }
                    } }, { children: [_jsx(Text, Object.assign({ style: styles.continueButtonText }, { children: t('Continue') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] })) }))] })));
};
export default SelectCategoryScreen;
