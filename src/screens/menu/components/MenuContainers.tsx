import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../MenuStyles'
import Icons from '../../../constants/Icons'
import SizeBox from '../../../constants/SizeBox';
import CustomSwitch from '../../../components/customSwitch/CustomSwitch';

interface MenuContainersProps {
    title?: string;
    icon?: any;
    onPress?: any;
    isNext?: boolean;
    isSelected?: boolean;
    isSwitch?: boolean;
    toggleSwitch?: any;
    isEnabled?: boolean;
}

const MenuContainers = ({ title, icon, onPress, isNext = true, isSelected, isSwitch = false, isEnabled, toggleSwitch }: MenuContainersProps) => {
    return (
        <TouchableOpacity disabled={isSwitch} activeOpacity={0.7} onPress={onPress} style={Styles.menuContainer}>
            <View style={Styles.iconCont}>
                {icon}
            </View>
            <SizeBox width={20} />
            <Text style={Styles.titlesText}>{title}</Text>
            <View style={Styles.nextArrow}>
                {isSwitch ? <CustomSwitch isEnabled={isEnabled} toggleSwitch={toggleSwitch} /> :
                    isNext ? <Icons.ArrowNext height={24} width={24} /> :
                        <View style={Styles.selectionContainer}>
                            {isSelected && <View style={Styles.selected} />}
                        </View>
                }
            </View>
        </TouchableOpacity>
    )
}

export default MenuContainers