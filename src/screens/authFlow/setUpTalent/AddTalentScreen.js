import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, ScrollView, Text } from 'react-native';
import { createStyles } from './AddTalentStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Images from '../../../constants/Images';
import FastImage from 'react-native-fast-image';
import CustomButton from '../../../components/customButton/CustomButton';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const AddTalentScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 30 }), _jsx(View, Object.assign({ style: { height: 130, width: 130, alignSelf: 'center' } }, { children: _jsx(FastImage, { source: Images.talentImg, style: { height: '100%', width: '100%' } }) })), _jsx(SizeBox, { height: 30 }), _jsxs(View, Object.assign({ style: Styles.contentContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: t('Set Up Your Talent Profile') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: t('Create your profile to showcase your skills and stand out.') })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.containerTitle }, { children: t('Choose Your Talent') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.talentContainer }, { children: [_jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: Styles.containerTitle }, { children: t('Talents') })), _jsx(SizeBox, { height: 10 }), _jsxs(View, Object.assign({ style: Styles.talentList }, { children: [_jsx(Text, Object.assign({ style: Styles.talentTypeTitle }, { children: t('Performer') })), _jsx(SizeBox, { height: 16 }), _jsx(CustomButton, { title: t('Add Talent'), onPress: () => navigation.navigate('SelecteTalent'), isAdd: true, isSmall: true })] })), _jsx(SizeBox, { height: 24 }), _jsx(View, { style: Styles.separator }), _jsx(SizeBox, { height: 10 }), _jsxs(View, Object.assign({ style: Styles.talentList }, { children: [_jsx(Text, Object.assign({ style: Styles.talentTypeTitle }, { children: t('Creater') })), _jsx(SizeBox, { height: 16 }), _jsx(CustomButton, { title: t('Add Talent'), onPress: () => navigation.navigate('TalenetForPhotograph'), isAdd: true, isSmall: true })] })), _jsx(SizeBox, { height: 24 }), _jsx(View, { style: Styles.separator })] })), _jsx(SizeBox, { height: 83 }), _jsx(CustomButton, { title: t('Next'), onPress: () => navigation.navigate('BottomTabBar') })] }))] }))] })));
};
export default AddTalentScreen;
