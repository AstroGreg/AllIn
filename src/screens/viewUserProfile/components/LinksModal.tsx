import { View, Text, Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox';
import FastImage from 'react-native-fast-image';
import Icons from '../../../constants/Icons';
import { createStyles } from '../ViewUserProfileStyles';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface LinksModalProps {
    isVisible: boolean;
    onClose: any;
}

const LinksModal = ({ isVisible, onClose }: LinksModalProps) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);

    return (
        <Modal
            visible={isVisible}
            onRequestClose={onClose}
            transparent={true}
            animationType='fade'
        >
            <TouchableOpacity
                style={Styles.modalContainer}
                activeOpacity={1}
                onPress={onClose}>
                <TouchableOpacity
                    style={Styles.talentContainer}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}>

                    <SizeBox height={16} />
                    <TouchableOpacity style={Styles.socialLinks}>
                        <FastImage source={Icons.Strava} style={Styles.icons} />
                        <SizeBox width={12} />
                        <Text style={Styles.eventText}>{t('Connect with Strava')}</Text>
                        <View style={[Styles.nextArrow, { right: 0 }]}>
                            <Icons.ArrowNext height={24} width={24} />
                        </View>
                    </TouchableOpacity>
                    <SizeBox height={14} />

                    {/* <View style={[Styles.separator, { marginHorizontal: 0 }]} />
                    <SizeBox height={14} />
                    <TouchableOpacity style={Styles.socialLinks}>
                        <FastImage source={Icons.Facebook} style={Styles.icons} />
                        <SizeBox width={12} />
                        <Text style={Styles.eventText}>{t('Connect with Facebook')}</Text>
                        <View style={[Styles.nextArrow, { right: 0 }]}>
                            <Icons.ArrowNext height={24} width={24} />
                        </View>
                    </TouchableOpacity>
                    <SizeBox height={14} /> */}

                    <View style={[Styles.separator, { marginHorizontal: 0 }]} />
                    <SizeBox height={14} />

                    <TouchableOpacity style={Styles.socialLinks}>
                        <FastImage source={Icons.Instagram} style={Styles.icons} />
                        <SizeBox width={12} />
                        <Text style={Styles.eventText}>{t('Connect with Instagram')}</Text>
                        <View style={[Styles.nextArrow, { right: 0 }]}>
                            <Icons.ArrowNext height={24} width={24} />
                        </View>
                    </TouchableOpacity>
                    <SizeBox height={16} />


                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

export default LinksModal