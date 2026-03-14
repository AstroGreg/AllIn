import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, TextInput } from 'react-native';
import { createStyles } from './CustomSearchStyles';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
const CustomSearch = ({ value, onChangeText, placeholder }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (_jsxs(View, Object.assign({ style: Styles.searchContainer }, { children: [_jsx(Icons.Search, { height: 20, width: 20 }), _jsx(TextInput, { value: value, onChangeText: onChangeText, placeholder: placeholder, style: Styles.searchBarText, placeholderTextColor: colors.subTextColor })] })));
};
export default CustomSearch;
