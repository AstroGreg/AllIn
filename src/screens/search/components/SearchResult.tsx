import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../SearchStyles'
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import FastImage from 'react-native-fast-image';

interface SearchResultProps {
    isUserProfile?: any;
    icon?: any;
    isAction?: boolean;
    onContainerPress?: any;
    onPressVideos?: any;
    onPressPhotos?: any;
}

const SearchResult = ({ isUserProfile, icon, isAction, onContainerPress, onPressPhotos, onPressVideos }: SearchResultProps) => {
    return (
        <TouchableOpacity onPress={onContainerPress} disabled={isAction} style={[Styles.borderBox,]}>
            <View style={Styles.row}>
                <View style={Styles.iconContainer}>
                    {isUserProfile ?
                        <FastImage source={{ uri: "https://images.vrt.be/width1280/2024/06/07/b4bcaa52-24ad-11ef-8fc9-02b7b76bf47f.jpg" }} style={{ height: '100%', width: '100%' }} />
                        : icon}
                </View>
                <SizeBox width={20} />
                <View>
                    <Text style={Styles.resultText}>{isUserProfile ? 'Elie Bacari' : 'BK Studentent 23'}</Text>
                    <SizeBox height={5} />
                    <View style={Styles.row}>
                        {
                            isUserProfile ?
                                <Text style={Styles.filterText}>21</Text>
                                :
                                <View style={Styles.row}>
                                    <Icons.CalendarGrey height={14} width={14} />
                                    <SizeBox width={4} />
                                    <Text style={Styles.filterText}>12/12/2024</Text>
                                </View>
                        }
                        <SizeBox width={6} />
                        <View style={Styles.dot} />
                        <SizeBox width={6} />
                        {isUserProfile ?
                            <Text style={Styles.filterText}>Male</Text>
                            :
                            <View style={Styles.row}>
                                <Icons.CalendarGrey height={14} width={14} />
                                <SizeBox width={4} />
                                <Text style={Styles.filterText}>12/12/2024</Text>
                            </View>}
                    </View>
                </View>
                {!isUserProfile && <Text style={[Styles.resultText, { position: 'absolute', right: 10 }]}>02:00</Text>}
            </View>
            {!isUserProfile && <SizeBox height={16} />}
            {isAction && <View style={[Styles.row, { justifyContent: 'center' }]}>
                <TouchableOpacity onPress={onPressPhotos} style={[Styles.eventbtns, Styles.row]}>
                    <Text style={Styles.eventBtnText}>Photograph</Text>
                    <SizeBox width={6} />
                    <Icons.Camera height={18} width={18} />
                </TouchableOpacity>
                <SizeBox width={10} />
                <TouchableOpacity onPress={onPressVideos} style={[Styles.eventbtns, Styles.row]}>
                    <Text style={Styles.eventBtnText}>Videos</Text>
                    <SizeBox width={6} />
                    <Icons.Video height={18} width={18} />
                </TouchableOpacity>
            </View>}
        </TouchableOpacity>
    )
}

export default SearchResult