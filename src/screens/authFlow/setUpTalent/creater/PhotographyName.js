import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, ScrollView, Text } from 'react-native';
import { createStyles } from '../AddTalentStyles';
import SizeBox from '../../../../constants/SizeBox';
import FastImage from 'react-native-fast-image';
import Images from '../../../../constants/Images';
import CustomButton from '../../../../components/customButton/CustomButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomTextInput from '../../../../components/customTextInput/CustomTextInput';
import { useTheme } from '../../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const PhotographyName = ({ navigation }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 30 }), _jsx(View, Object.assign({ style: { height: 130, width: 130, alignSelf: 'center' } }, { children: _jsx(FastImage, { source: Images.talentImg, style: { height: '100%', width: '100%' } }) })), _jsx(SizeBox, { height: 30 }), _jsxs(View, Object.assign({ style: Styles.contentContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: t('Set Up Your Talent Profile') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: t('Create your profile to showcase your skills and stand out.') })), _jsx(SizeBox, { height: 24 }), _jsx(CustomTextInput, { label: t('Photography Name'), placeholder: t('Enter photography name'), subLabel: 'Leave empty to keep account name', isIcon: false }), _jsx(SizeBox, { height: 24 }), _jsx(CustomTextInput, { label: t('Website'), placeholder: t('Enter website link'), isIcon: false }), _jsx(SizeBox, { height: 86 }), _jsx(CustomButton, { title: t('Continue'), onPress: () => navigation.navigate('ViewPhotographProfile') })] }))] }))] })));
};
export default PhotographyName;
