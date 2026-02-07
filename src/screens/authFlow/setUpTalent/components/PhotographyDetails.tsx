import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from '../AddTalentStyles'
import Icons from '../../../../constants/Icons';
import SizeBox from '../../../../constants/SizeBox';
import { useTheme } from '../../../../context/ThemeContext';

interface props {
    title: string;
    wesite: string;
    isSelected?: boolean;
    onPress?: () => void;
    isIcon?: boolean;
    disabled?: boolean;
    isRightAction?: boolean;
    isDelete?: boolean;
    onPressDelete?: any
}

const PhotographyDetails = ({
    title,
    wesite,
    isSelected = false,
    onPress,
    isIcon = true,
    disabled = false,
    isRightAction = true,
    isDelete = false,
    onPressDelete
}: props) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (
        <TouchableOpacity
            disabled={disabled}
            onPress={onPress}
            activeOpacity={0.7}
            style={[Styles.photographyDetailsContainer, isSelected && { borderColor: colors.primaryColor }]}
        >
            <View style={[Styles.row, { justifyContent: 'space-between', }]}>
                <Text style={Styles.tabText}>Name</Text>
                <Text style={Styles.titleText} numberOfLines={1}>{title}</Text>
            </View>
            <View style={[Styles.row, { justifyContent: 'space-between', }]}>
                <Text style={Styles.tabText}>wesite</Text>
                <Text style={Styles.titleText} numberOfLines={1}>{wesite}</Text>
            </View>

            <View style={[Styles.row, Styles.actionIcons]}>
                <TouchableOpacity onPress={onPressDelete}>
                    <Icons.EditDetails height={24} width={24} />
                </TouchableOpacity>
                <SizeBox width={0} />
                <TouchableOpacity onPress={onPressDelete}>
                    <Icons.Trash height={24} width={24} />
                </TouchableOpacity>
            </View>

        </TouchableOpacity>
    )
}

export default PhotographyDetails