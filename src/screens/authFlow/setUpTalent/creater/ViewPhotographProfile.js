import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, ScrollView, Text } from 'react-native';
import { useState } from 'react';
import { createStyles } from '../AddTalentStyles';
import SizeBox from '../../../../constants/SizeBox';
import FastImage from 'react-native-fast-image';
import Images from '../../../../constants/Images';
import CustomButton from '../../../../components/customButton/CustomButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SelcetionContainer from '../components/SelcetionContainer';
import PhotographyDetails from '../components/PhotographyDetails';
import { useTheme } from '../../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const ViewPhotographProfile = ({ navigation }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const [events, setEvents] = useState([
        { id: 1, title: 'Athletics' },
        { id: 2, title: 'Football' },
        // Add more default events if needed
    ]);
    const handleDeleteCompetition = (id) => {
        setEvents(events.filter(event => event.id !== id));
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 30 }), _jsx(View, Object.assign({ style: { height: 110, width: 110, alignSelf: 'center' } }, { children: _jsx(FastImage, { source: Images.talentImg, style: { height: '100%', width: '100%' } }) })), _jsx(SizeBox, { height: 30 }), _jsxs(View, Object.assign({ style: Styles.contentContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: t('Set Up Your Talent Profile') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: t('Create your profile to showcase your skills and stand out.') })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.containerTitle }, { children: t('Photography') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.talentContainer }, { children: [_jsx(SizeBox, { height: 16 }), _jsx(PhotographyDetails, { title: t('Signature Photography'), wesite: 'www.signaturephotography.com', disabled: true, isRightAction: false }), _jsx(Text, Object.assign({ style: Styles.containerTitle }, { children: t('Events') })), _jsx(SizeBox, { height: 10 }), events.map((event) => (_jsx(SelcetionContainer, { isIcon: false, title: event.title, disabled: true, isRightAction: true, isDelete: true, onPressDelete: () => handleDeleteCompetition(event.id) }, event.id))), _jsx(SizeBox, { height: 16 }), _jsx(CustomButton, { title: t('Add Event'), onPress: () => navigation.navigate('TalenetForPhotograph'), isAdd: true, isSmall: true }), _jsx(SizeBox, { height: 16 })] })), _jsx(SizeBox, { height: 20 }), _jsx(CustomButton, { title: t('Next'), onPress: () => navigation.navigate('AddTalentScreen') }), _jsx(SizeBox, { height: 86 })] }))] }))] })));
};
export default ViewPhotographProfile;
