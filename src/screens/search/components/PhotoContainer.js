import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import FastImage from 'react-native-fast-image';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import ConfirmationModel from '../../../components/confirmationModel/ConfirmationModel';
import { createStyles } from '../SearchStyles';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const PhotoContainer = ({ onPressImg, photo, name, price, uploadedAt }) => {
    const deviceWidth = Dimensions.get('window').width;
    const horizontalPadding = 20; // Padding from screen edges
    const spacing = 6; // Spacing between items
    const numColumns = 3;
    const containerWidth = (deviceWidth - (2 * horizontalPadding) - (spacing * (numColumns - 1))) / numColumns;
    const [isDeleteVisible, setIsDeleteVisible] = useState(false);
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    return (_jsxs(TouchableOpacity, Object.assign({ onPress: onPressImg, style: {
            width: containerWidth,
            marginRight: spacing,
            marginBottom: spacing,
            borderRadius: 10,
            overflow: 'hidden',
            padding: 8,
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor,
            backgroundColor: colors.cardBackground,
        } }, { children: [_jsx(View, Object.assign({ style: Styles.photoImgCont }, { children: _jsx(FastImage, { source: photo, style: {
                        width: '100%',
                        height: '100%'
                    } }) })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: [Styles.downloadCount, { fontWeight: '400' }], numberOfLines: 1 }, { children: name })), _jsx(SizeBox, { height: 4 }), _jsx(Text, Object.assign({ style: [Styles.downloadCount, { fontWeight: '600' }] }, { children: price })), uploadedAt ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 4 }), _jsx(Text, Object.assign({ style: [Styles.downloadCount, { fontWeight: '400' }], numberOfLines: 1 }, { children: uploadedAt }))] })) : null, _jsx(View, Object.assign({ style: [Styles.btnRight, { bottom: 8, gap: 10 }, Styles.row] }, { children: _jsx(TouchableOpacity, Object.assign({ style: [Styles.btnRight, { bottom: 0, right: -5 }] }, { children: _jsx(Icons.Download, { height: 18, width: 18 }) })) })), _jsx(ConfirmationModel, { isVisible: isDeleteVisible, onClose: () => setIsDeleteVisible(false), text: t('Are you sure you want to delete this photo?'), onPressYes: () => setIsDeleteVisible(false), icon: _jsx(Icons.DeleteAccount, { height: 24, width: 24 }) })] })));
};
export default PhotoContainer;
