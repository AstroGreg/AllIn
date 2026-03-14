import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text } from 'react-native';
import { createStyles } from '../HomeStyles';
import Icons from '../../../constants/Icons';
import SizeBox from '../../../constants/SizeBox';
import StatusContainer from '../../../components/statusContainer/StatusContainer';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const RequestContainers = ({ title, date, time, status, isFixed }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    return (_jsxs(View, Object.assign({ style: styles.requestContainer }, { children: [_jsx(View, Object.assign({ style: styles.iconContainer }, { children: _jsx(Icons.ReceiptEdit, { height: 22, width: 22 }) })), _jsx(SizeBox, { width: 12 }), _jsxs(View, Object.assign({ style: {} }, { children: [_jsx(Text, Object.assign({ style: styles.eventTitle, numberOfLines: 1 }, { children: title })), _jsx(SizeBox, { height: 6 }), _jsxs(View, Object.assign({ style: styles.rowCenter }, { children: [_jsxs(View, Object.assign({ style: styles.rowCenter }, { children: [_jsx(Icons.CalendarGrey, { height: 12, width: 12 }), _jsx(SizeBox, { width: 2 }), _jsx(Text, Object.assign({ style: styles.requestSubText }, { children: date }))] })), _jsx(View, { style: styles.dot }), _jsxs(View, Object.assign({ style: styles.rowCenter }, { children: [_jsx(Icons.Timer, { height: 12, width: 12 }), _jsx(SizeBox, { width: 2 }), _jsx(Text, Object.assign({ style: styles.requestSubText }, { children: time }))] })), _jsx(View, { style: styles.dot }), _jsxs(View, Object.assign({ style: styles.rowCenter }, { children: [_jsx(Icons.Edit, { height: 12, width: 12 }), _jsx(SizeBox, { width: 2 }), _jsx(Text, Object.assign({ style: styles.requestSubText }, { children: t('Edit') }))] }))] }))] })), _jsx(StatusContainer, { text: status, isFixed: isFixed })] })));
};
export default RequestContainers;
