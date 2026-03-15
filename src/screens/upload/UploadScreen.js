import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { createStyles } from './UploadStyles';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Clock } from 'iconsax-react-nativejs';
const UploadScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const handleUploadAnonymously = () => {
        navigation.navigate('SelectCompetitionScreen', { anonymous: true });
    };
    const handleUpload = () => {
        navigation.navigate('SelectCompetitionScreen', { anonymous: false });
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: [Styles.header, { flexDirection: 'row', justifyContent: 'space-between' }] }, { children: [_jsx(View, { style: { width: 36 } }), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Upload') })), _jsx(TouchableOpacity, Object.assign({ onPress: () => navigation.navigate('UploadActivityScreen'), style: { width: 36, alignItems: 'flex-end' }, activeOpacity: 0.8 }, { children: _jsx(Clock, { size: 22, color: colors.primaryColor, variant: "Linear" }) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: Styles.tipCard }, { children: [_jsx(Icons.LightbulbColorful, { width: 90, height: 90 }), _jsx(SizeBox, { height: 14 }), _jsx(Text, Object.assign({ style: Styles.tipText }, { children: t('Choose how you want to upload') }))] })), _jsx(SizeBox, { height: 16 }), _jsx(TouchableOpacity, Object.assign({ style: Styles.createAccountButton, onPress: handleUpload }, { children: _jsx(Text, Object.assign({ style: Styles.createAccountButtonText }, { children: t('Upload') })) })), _jsx(SizeBox, { height: 10 }), _jsx(TouchableOpacity, Object.assign({ style: Styles.anonymousButton, onPress: handleUploadAnonymously }, { children: _jsx(Text, Object.assign({ style: Styles.anonymousButtonText }, { children: t('Upload anonymously') })) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default UploadScreen;
