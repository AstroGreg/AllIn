import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from '../SearchStyles'
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface SearchResultProps {
    isUserProfile?: any;
    icon?: any;
    isAction?: boolean;
    onContainerPress?: any;
    onPressVideos?: any;
    onPressPhotos?: any;
}

const SearchResult = ({ isUserProfile, icon, isAction, onContainerPress, onPressPhotos, onPressVideos }: SearchResultProps) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);

    return (
        <TouchableOpacity onPress={onContainerPress} disabled={isAction} style={[styles.borderBox,]}>
            <View style={styles.row}>
                <View style={styles.iconContainer}>
                    {isUserProfile ?
                        <FastImage source={{ uri: "https://images.vrt.be/width1280/2024/06/07/b4bcaa52-24ad-11ef-8fc9-02b7b76bf47f.jpg" }} style={{ height: '100%', width: '100%' }} />
                        : icon}
                </View>
                <SizeBox width={20} />
                <View>
                    <Text style={styles.resultText}>{isUserProfile ? t('Elie Bacari') : t('BK Studentent 23')}</Text>
                    <SizeBox height={5} />
                    <View style={styles.row}>
                        {
                            isUserProfile ?
                                <Text style={styles.filterText}>21</Text>
                                :
                                <View style={styles.row}>
                                    <Icons.CalendarGrey height={14} width={14} />
                                    <SizeBox width={4} />
                                    <Text style={styles.filterText}>12/12/2024</Text>
                                </View>
                        }
                        <SizeBox width={6} />
                        <View style={styles.dot} />
                        <SizeBox width={6} />
                        {isUserProfile ?
                                <Text style={styles.filterText}>{t('Male')}</Text>
                            :
                            <View style={styles.row}>
                                <Icons.CalendarGrey height={14} width={14} />
                                <SizeBox width={4} />
                                <Text style={styles.filterText}>12/12/2024</Text>
                            </View>}
                    </View>
                </View>
                {!isUserProfile && <Text style={[styles.resultText, { position: 'absolute', right: 10 }]}>02:00</Text>}
            </View>
            {!isUserProfile && <SizeBox height={16} />}
            {isAction && <View style={[styles.row, { justifyContent: 'center' }]}>
                <TouchableOpacity onPress={onPressPhotos} style={[styles.eventbtns, styles.row]}>
                    <Text style={styles.eventBtnText}>{t('Photograph')}</Text>
                    <SizeBox width={6} />
                    <Icons.Camera height={18} width={18} />
                </TouchableOpacity>
                <SizeBox width={10} />
                <TouchableOpacity onPress={onPressVideos} style={[styles.eventbtns, styles.row]}>
                    <Text style={styles.eventBtnText}>{t('Videos')}</Text>
                    <SizeBox width={6} />
                    <Icons.Video height={18} width={18} />
                </TouchableOpacity>
            </View>}
        </TouchableOpacity>
    )
}

export default SearchResult
