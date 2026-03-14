import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from '../SearchStyles';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const SearchResult = ({ isUserProfile, icon, isAction, onContainerPress, onPressPhotos, onPressVideos }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    return (_jsxs(TouchableOpacity, Object.assign({ onPress: onContainerPress, disabled: isAction, style: [styles.borderBox,] }, { children: [_jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(View, Object.assign({ style: styles.iconContainer }, { children: isUserProfile ?
                            _jsx(FastImage, { source: { uri: "https://images.vrt.be/width1280/2024/06/07/b4bcaa52-24ad-11ef-8fc9-02b7b76bf47f.jpg" }, style: { height: '100%', width: '100%' } })
                            : icon })), _jsx(SizeBox, { width: 20 }), _jsxs(View, { children: [_jsx(Text, Object.assign({ style: styles.resultText }, { children: isUserProfile ? t('Elie Bacari') : t('BK Studentent 23') })), _jsx(SizeBox, { height: 5 }), _jsxs(View, Object.assign({ style: styles.row }, { children: [isUserProfile ?
                                        _jsx(Text, Object.assign({ style: styles.filterText }, { children: "21" }))
                                        :
                                            _jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(Icons.CalendarGrey, { height: 14, width: 14 }), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: styles.filterText }, { children: "12/12/2024" }))] })), _jsx(SizeBox, { width: 6 }), _jsx(View, { style: styles.dot }), _jsx(SizeBox, { width: 6 }), isUserProfile ?
                                        _jsx(Text, Object.assign({ style: styles.filterText }, { children: t('Male') }))
                                        :
                                            _jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(Icons.CalendarGrey, { height: 14, width: 14 }), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: styles.filterText }, { children: "12/12/2024" }))] }))] }))] }), !isUserProfile && _jsx(Text, Object.assign({ style: [styles.resultText, { position: 'absolute', right: 10 }] }, { children: "02:00" }))] })), !isUserProfile && _jsx(SizeBox, { height: 16 }), isAction && _jsxs(View, Object.assign({ style: [styles.row, { justifyContent: 'center' }] }, { children: [_jsxs(TouchableOpacity, Object.assign({ onPress: onPressPhotos, style: [styles.eventbtns, styles.row] }, { children: [_jsx(Text, Object.assign({ style: styles.eventBtnText }, { children: t('Photograph') })), _jsx(SizeBox, { width: 6 }), _jsx(Icons.Camera, { height: 18, width: 18 })] })), _jsx(SizeBox, { width: 10 }), _jsxs(TouchableOpacity, Object.assign({ onPress: onPressVideos, style: [styles.eventbtns, styles.row] }, { children: [_jsx(Text, Object.assign({ style: styles.eventBtnText }, { children: t('Videos') })), _jsx(SizeBox, { width: 6 }), _jsx(Icons.Video, { height: 18, width: 18 })] }))] }))] })));
};
export default SearchResult;
