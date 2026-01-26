import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from '../AddTalentStyles'
import Icons from '../../../../constants/Icons';
import { useTheme } from '../../../../context/ThemeContext';

interface props {
    title: string;
    icon?: any;
    isSelected?: boolean;
    onPress?: () => void;
    isIcon?: boolean;
    disabled?: boolean;
    isRightAction?: boolean;
    isDelete?: boolean;
    onPressDelete?: any
}

const SelcetionContainer = ({
    title,
    icon,
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
            style={[Styles.selectionContainer, isSelected && { borderColor: colors.primaryColor }]}
        >
            {isIcon && icon}
            <Text style={Styles.titleText}>{title}</Text>
            {isRightAction && (
                isDelete ? (
                    <TouchableOpacity onPress={onPressDelete} style={Styles.deleteBtn}>
                        <Icons.Trash height={24} width={24} />
                    </TouchableOpacity>
                ) : (
                    <View style={Styles.selectionBtn}>
                        {isSelected && <View style={Styles.selectedBtn} />}
                    </View>
                )
            )}
        </TouchableOpacity>
    )
}

export default SelcetionContainer