import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text } from 'react-native';
import { createStyles } from './StatusContainerStyles';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
const StatusContainer = ({ text, isFixed }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (_jsxs(View, Object.assign({ style: Styles.container }, { children: [_jsx(Text, Object.assign({ style: [Styles.text, !isFixed && { color: colors.pendingColor }] }, { children: text })), isFixed ? _jsx(Icons.GreenTick, { height: 16, width: 16 }) : _jsx(Icons.Pending, { height: 16, width: 16 })] })));
};
export default StatusContainer;
