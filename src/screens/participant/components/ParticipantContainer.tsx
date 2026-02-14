import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from '../ParticipantStyles'
import FastImage from 'react-native-fast-image'
import Images from '../../../constants/Images'
import SizeBox from '../../../constants/SizeBox'
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

interface ParticipantContainerProps {
    onPress: any;
}

const ParticipantContainer = ({ onPress }: ParticipantContainerProps) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);

    return (
        <View style={styles.participantCont}>
            <View style={styles.imgContainer}>
                <FastImage source={Images.profilePic} style={styles.img} />
            </View>
            <SizeBox width={10} />
            <Text style={styles.userNameText}>{t('Greg Wenshell')}</Text>
            <TouchableOpacity style={styles.viewProfileBtn} onPress={onPress}>
                <Text style={styles.btnText}>
                    {t('View Profile')}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default ParticipantContainer
