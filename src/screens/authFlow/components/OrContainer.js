import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text } from 'react-native';
import { createStyles } from './Styles';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const OrContainer = () => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (_jsxs(View, Object.assign({ style: Styles.orContainer }, { children: [_jsx(View, { style: Styles.grayLines }), _jsx(Text, Object.assign({ style: Styles.orText }, { children: t('Or') })), _jsx(View, { style: Styles.grayLines })] })));
};
export default OrContainer;
