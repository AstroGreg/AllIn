import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles } from './UploadAnonymouslyStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const UploadAnonymouslyScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const handleNice = () => {
        navigation.navigate('SelectCompetitionScreen', { anonymous: true });
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(View, Object.assign({ style: Styles.header }, { children: _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Upload') })) })), _jsx(View, Object.assign({ style: Styles.content }, { children: _jsxs(View, Object.assign({ style: Styles.infoCard }, { children: [_jsx(Icons.LightbulbColorful, { width: 90, height: 90 }), _jsx(SizeBox, { height: 14 }), _jsx(Text, Object.assign({ style: Styles.infoText }, { children: t("You'll upload anonymously. Author identity is not stored on the media record.") }))] })) })), _jsxs(View, Object.assign({ style: Styles.bottomContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.niceButton, onPress: handleNice }, { children: _jsx(Text, Object.assign({ style: Styles.niceButtonText }, { children: t('Nice') })) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default UploadAnonymouslyScreen;
