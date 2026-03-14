import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from '../ParticipantStyles';
import FastImage from 'react-native-fast-image';
import Images from '../../../constants/Images';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const ParticipantContainer = ({ onPress }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    return (_jsxs(View, Object.assign({ style: styles.participantCont }, { children: [_jsx(View, Object.assign({ style: styles.imgContainer }, { children: _jsx(FastImage, { source: Images.profilePic, style: styles.img }) })), _jsx(SizeBox, { width: 10 }), _jsx(Text, Object.assign({ style: styles.userNameText }, { children: t('Greg Wenshell') })), _jsx(TouchableOpacity, Object.assign({ style: styles.viewProfileBtn, onPress: onPress }, { children: _jsx(Text, Object.assign({ style: styles.btnText }, { children: t('View Profile') })) }))] })));
};
export default ParticipantContainer;
