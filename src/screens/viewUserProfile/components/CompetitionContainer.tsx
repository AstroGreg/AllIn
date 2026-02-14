import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from '../ViewUserProfileStyles'
import FastImage from 'react-native-fast-image'
import Images from '../../../constants/Images'
import SizeBox from '../../../constants/SizeBox'
import Icons from '../../../constants/Icons'
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

interface CompetitionContainerProps {
    onPressPhoto?: any;
    onPressVideo?: any;
}

const CompetitionContainer = ({ onPressPhoto, onPressVideo }: CompetitionContainerProps) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);

    return (
        <View style={styles.CompetitionContainer}>
            <View style={styles.eventImgCont}>
                <FastImage
                    source={Images.event1}
                    style={styles.eventImg}
                />
            </View>
            <SizeBox height={10} />
            <View style={[styles.row, styles.spaceBetween]}>
                <Text style={styles.eventText}>{t('City Run Marathon')}</Text>
                <View style={styles.row}>
                    <Icons.Location height={14} width={14} />
                    <SizeBox width={6} />
                    <Text style={styles.subText}>{t('NY, USA')}</Text>
                </View>
            </View>
            <SizeBox height={6} />

            <View style={[styles.row, styles.spaceBetween]}>
                <View style={styles.row}>
                    <Icons.CalendarGrey height={14} width={14} />
                    <SizeBox width={6} />
                    <Text style={styles.subText}>{t('14 feb 2024')}</Text>
                </View>
                <View style={styles.row}>
                    <Icons.Run height={14} width={14} />
                    <SizeBox width={6} />
                    <Text style={styles.subText}>{t('800 m')}</Text>
                </View>
            </View>

            <SizeBox height={12} />
            <View style={[styles.row, styles.spaceBetween]}>
                <TouchableOpacity activeOpacity={0.7} style={[styles.eventbtns, styles.row]} onPress={onPressPhoto}>
                    <Text style={styles.eventBtnText}>{t('Photograph')}</Text>
                    <SizeBox width={6} />
                    <Icons.Camera height={18} width={18} />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} style={[styles.eventbtns, styles.row]} onPress={onPressVideo}>
                    <Text style={styles.eventBtnText}>{t('Videos')}</Text>
                    <SizeBox width={6} />
                    <Icons.Video height={18} width={18} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default CompetitionContainer
