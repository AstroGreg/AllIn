import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { createStyles } from './ConfirmationModelStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
const ConfirmationModel = ({ onClose, isVisible, text, onPressYes, icon, leftBtnText = 'No', rightBtnText = 'Yes', leftBtnTextColor, leftBtnBorderColor, iconBgColor }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (_jsx(Modal, Object.assign({ visible: isVisible, onRequestClose: onClose, transparent: true, animationType: "fade" }, { children: _jsx(View, Object.assign({ style: Styles.mainContainer }, { children: _jsxs(View, Object.assign({ style: Styles.container }, { children: [_jsx(View, Object.assign({ style: [Styles.iconCont, iconBgColor && { backgroundColor: iconBgColor }] }, { children: icon })), _jsx(SizeBox, { height: 20 }), _jsx(Text, Object.assign({ style: Styles.text, numberOfLines: 3 }, { children: text })), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.row }, { children: [_jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.7, style: [
                                    Styles.noBtn,
                                    leftBtnBorderColor && { borderColor: leftBtnBorderColor }
                                ], onPress: onClose }, { children: _jsx(Text, Object.assign({ style: [
                                        Styles.noText,
                                        leftBtnTextColor && { color: leftBtnTextColor }
                                    ] }, { children: leftBtnText })) })), _jsx(SizeBox, { width: 16 }), _jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.7, style: Styles.yesBtn, onPress: onPressYes }, { children: _jsx(Text, Object.assign({ style: Styles.yesText }, { children: rightBtnText })) }))] }))] })) })) })));
};
export default ConfirmationModel;
