import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from '../ViewUserProfileStyles';
import FastImage from 'react-native-fast-image';
import Images from '../../../constants/Images';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const CompetitionContainer = ({ onPressPhoto, onPressVideo }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    return (_jsxs(View, Object.assign({ style: styles.CompetitionContainer }, { children: [_jsx(View, Object.assign({ style: styles.eventImgCont }, { children: _jsx(FastImage, { source: Images.event1, style: styles.eventImg }) })), _jsx(SizeBox, { height: 10 }), _jsxs(View, Object.assign({ style: [styles.row, styles.spaceBetween] }, { children: [_jsx(Text, Object.assign({ style: styles.eventText }, { children: t('City Run Marathon') })), _jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(Icons.Location, { height: 14, width: 14 }), _jsx(SizeBox, { width: 6 }), _jsx(Text, Object.assign({ style: styles.subText }, { children: t('NY, USA') }))] }))] })), _jsx(SizeBox, { height: 6 }), _jsxs(View, Object.assign({ style: [styles.row, styles.spaceBetween] }, { children: [_jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(Icons.CalendarGrey, { height: 14, width: 14 }), _jsx(SizeBox, { width: 6 }), _jsx(Text, Object.assign({ style: styles.subText }, { children: t('14 feb 2024') }))] })), _jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(Icons.Run, { height: 14, width: 14 }), _jsx(SizeBox, { width: 6 }), _jsx(Text, Object.assign({ style: styles.subText }, { children: t('800 m') }))] }))] })), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: [styles.row, styles.spaceBetween] }, { children: [_jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.7, style: [styles.eventbtns, styles.row], onPress: onPressPhoto }, { children: [_jsx(Text, Object.assign({ style: styles.eventBtnText }, { children: t('Photograph') })), _jsx(SizeBox, { width: 6 }), _jsx(Icons.Camera, { height: 18, width: 18 })] })), _jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.7, style: [styles.eventbtns, styles.row], onPress: onPressVideo }, { children: [_jsx(Text, Object.assign({ style: styles.eventBtnText }, { children: t('Videos') })), _jsx(SizeBox, { width: 6 }), _jsx(Icons.Video, { height: 18, width: 18 })] }))] }))] })));
};
export default CompetitionContainer;
