import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import FastImage from 'react-native-fast-image';
import { createStyles } from '../ViewUserProfileStyles';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import ConfirmationModel from '../../../components/confirmationModel/ConfirmationModel';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const PhotosContainer = ({ onPressImg, photo, name, price }) => {
    const deviceWidth = Dimensions.get('window').width;
    const spacing = 20;
    const containerWidth = (deviceWidth - (spacing * 3)) / 2; // 3 spaces: left, middle, right
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [isDeleteVisible, setIsDeleteVisible] = useState(false);
    return (_jsxs(TouchableOpacity, Object.assign({ onPress: onPressImg, style: {
            width: containerWidth,
            marginLeft: spacing,
            marginBottom: 6,
            borderRadius: 10,
            overflow: 'hidden',
            padding: 8,
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor
        } }, { children: [_jsx(View, Object.assign({ style: styles.photoImgCont }, { children: _jsx(FastImage, { source: photo, style: {
                        width: '100%',
                        height: '100%'
                    } }) })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: [styles.downloadCount, { fontWeight: '400' }], numberOfLines: 1 }, { children: name })), _jsx(SizeBox, { height: 4 }), _jsx(Text, Object.assign({ style: [styles.downloadCount, { fontWeight: '600' }] }, { children: price })), _jsxs(View, Object.assign({ style: [styles.btnRight, { bottom: 8, gap: 10 }, styles.row] }, { children: [_jsx(TouchableOpacity, { children: _jsx(Icons.Edit, { height: 16, width: 16 }) }), _jsx(TouchableOpacity, Object.assign({ onPress: () => setIsDeleteVisible(true) }, { children: _jsx(Icons.DeleteCompetition, { height: 16, width: 16 }) }))] })), _jsx(ConfirmationModel, { isVisible: isDeleteVisible, onClose: () => setIsDeleteVisible(false), text: t('Are You Sure You Want to Delete This photo?'), onPressYes: () => setIsDeleteVisible(false), icon: _jsx(Icons.DeleteAccount, { height: 24, width: 24 }) })] })));
};
export default PhotosContainer;
