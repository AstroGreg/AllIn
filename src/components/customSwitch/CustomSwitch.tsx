import { View, Text, TouchableOpacity, Animated } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createStyles } from './CustomSwitchStyles';
import { useTheme } from '../../context/ThemeContext';

interface CustomSwitchProps {
    isEnabled?: boolean;
    toggleSwitch?: any;
}

const CustomSwitch = ({ isEnabled, toggleSwitch }: CustomSwitchProps) => {

    const [position] = useState(new Animated.Value(24));
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    useEffect(() => {
        // Animate whenever isEnabled changes
        Animated.timing(position, {
            toValue: isEnabled ? 18 : 2,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isEnabled]);

    return (
        <TouchableOpacity
            style={[Styles.switchBase, isEnabled ? Styles.switchOn : Styles.switchOff]}
            onPress={toggleSwitch}
            activeOpacity={0.7}
        >
            <Animated.View style={[Styles.switchThumb, { left: position }]} />
        </TouchableOpacity>
    )
}

export default CustomSwitch
