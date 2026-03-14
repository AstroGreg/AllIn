var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { createStyles } from '../UploadDetailsStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import Icons from '../../../constants/Icons';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomButton from '../../../components/customButton/CustomButton';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const CreateCompetition = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [_selectedImages, setSelectedImages] = useState([]);
    const handleImagePicker = () => __awaiter(void 0, void 0, void 0, function* () {
        const options = {
            mediaType: 'photo',
            selectionLimit: 12,
            quality: 1,
            presentationStyle: 'fullScreen',
            assetRepresentationMode: 'current',
        };
        try {
            const result = yield launchImageLibrary(options);
            if (result.assets) {
                setSelectedImages(result.assets);
            }
        }
        catch (error) {
            console.error('Error picking images:', error);
        }
    });
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(CustomHeader, { title: `Create Competition`, onBackPress: () => navigation.goBack(), onPressSetting: () => navigation.navigate('ProfileSettings') }), _jsxs(ScrollView, Object.assign({ style: { marginHorizontal: 20 }, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(CustomTextInput, { label: t('Competition Name'), placeholder: t('Competition Name type...'), icon: _jsx(Icons.CompetitionName, { height: 16, width: 16 }) }), _jsx(SizeBox, { height: 24 }), _jsx(CustomTextInput, { label: t('Competition Location'), placeholder: t('Select location'), icon: _jsx(Icons.LocationSetting, { height: 16, width: 16 }), isDown: true }), _jsx(SizeBox, { height: 24 }), _jsx(CustomTextInput, { label: t('Competition Date'), placeholder: t('dd/mm/year'), icon: _jsx(Icons.DOB, { height: 16, width: 16 }) }), _jsx(SizeBox, { height: 24 }), _jsx(CustomTextInput, { label: t('Competition Type'), placeholder: t('Competition type custom'), icon: _jsx(Icons.LocationSetting, { height: 16, width: 16 }), isDown: true }), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.box }, { children: [_jsx(Text, Object.assign({ style: Styles.titleText }, { children: t('Upload Event Thumbnail') })), _jsx(SizeBox, { height: 12 }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.uploadContainer, onPress: () => handleImagePicker() }, { children: [_jsx(Text, Object.assign({ style: Styles.uploadText }, { children: t('Browse Files Images') })), _jsx(SizeBox, { width: 4 }), _jsx(Icons.CameraBlue, { height: 18, width: 18 })] }))] })), _jsx(SizeBox, { height: 24 }), _jsx(CustomButton, { onPress: () => navigation.goBack(), title: t('Submit') })] }))] })));
};
export default CreateCompetition;
