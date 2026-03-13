import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from '../MenuStyles'
import Icons from '../../../constants/Icons'
import SizeBox from '../../../constants/SizeBox';
import CustomSwitch from '../../../components/customSwitch/CustomSwitch';
import { useTheme } from '../../../context/ThemeContext';

interface MenuContainersProps {
    title?: string;
    icon?: any;
    onPress?: any;
    isNext?: boolean;
    isSelected?: boolean;
    isSwitch?: boolean;
    toggleSwitch?: any;
    isEnabled?: boolean;
    testID?: string;
}

const MenuContainers = ({ title, icon, onPress, isNext = true, isSelected, isSwitch = false, isEnabled, toggleSwitch, testID }: MenuContainersProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={isSwitch ? toggleSwitch : onPress}
            style={Styles.menuContainer}
            testID={testID}
        >
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
