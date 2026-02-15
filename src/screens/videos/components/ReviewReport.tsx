import { View, Text, Modal, TouchableOpacity, } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from './ModalsStyles';
import BorderButton from '../../../components/borderButton/BorderButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface ReviewReportProps {
    isVisible?: boolean;
    onClose?: any;
    onPressNext?: any;
    onPressEdit?: any;
}

const ReviewReport = ({ isVisible, onClose, onPressEdit, onPressNext }: ReviewReportProps) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();

    return (
        <Modal
            transparent
            animationType="fade"
            visible={isVisible}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={Styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <SizeBox height={insets.top} />
                <TouchableOpacity
                    style={Styles.modalContent}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <Text style={Styles.titleText}>{t('Report mistake')}</Text>
                    <SizeBox height={16} />
                    <Text style={Styles.subTitleText}>{t('Review your report')}</Text>
                    <SizeBox height={16} />
                    <View style={[Styles.row, { gap: 0 }]}>
                        <Text style={Styles.subTitleText}>{t('Reason:')}</Text>
                        <SizeBox width={1} />
                        <Text style={Styles.selectionText}>{t('Wrong heat')}</Text>
                    </View>
                    <SizeBox height={16} />
                    <Text style={Styles.subTitleText}>{t('Description:')}</Text>
                    <SizeBox height={4} />
                    <Text numberOfLines={3} style={Styles.selectionText}>{t('Abcdefghkj')}</Text>

                    <SizeBox height={16} />
                    <View style={[Styles.row, { justifyContent: 'space-between' }]}>
                        <BorderButton title={t('Edit')} onPress={onPressEdit} />
                        <BorderButton isFilled={true} title={t('Submit')} onPress={onPressNext} />
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

export default ReviewReport