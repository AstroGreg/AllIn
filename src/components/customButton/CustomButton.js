import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from './CustomButtonStyle';
import Icons from '../../constants/Icons';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
const CustomButton = ({ title, onPress, isSmall = false, isAdd = false, isBack = false, isSecondary = false, testID, }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const useSecondaryStyle = isBack || isSecondary;
    return (_jsx(TouchableOpacity, Object.assign({ style: [
            Styles.buttonContainer,
            useSecondaryStyle && Styles.secondaryButtonContainer,
            isSmall && { height: 48 },
        ], testID: testID, activeOpacity: 0.7, onPress: onPress }, { children: isBack ? (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.backIconRotate }, { children: useSecondaryStyle ? (_jsx(Icons.RightBtnIconBlue, { height: 20, width: 20 })) : (_jsx(Icons.RightBtnIcon, { height: 20, width: 20 })) })), _jsx(SizeBox, { width: 8 }), _jsx(Text, Object.assign({ style: [Styles.btnText, useSecondaryStyle && Styles.secondaryBtnText] }, { children: title }))] })) : (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: [Styles.btnText, useSecondaryStyle && Styles.secondaryBtnText] }, { children: title })), _jsx(SizeBox, { width: 8 }), isAdd ? _jsx(Icons.AddWhite, { height: 20, width: 20 })
                    : _jsx(Icons.RightBtnIcon, { height: 20, width: 20 })] })) })));
};
export default CustomButton;
