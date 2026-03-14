import { jsx as _jsx } from "react/jsx-runtime";
import { TouchableOpacity, Animated } from 'react-native';
import { useEffect, useState } from 'react';
import { createStyles } from './CustomSwitchStyles';
import { useTheme } from '../../context/ThemeContext';
const CustomSwitch = ({ isEnabled, toggleSwitch }) => {
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
    return (_jsx(TouchableOpacity, Object.assign({ style: [Styles.switchBase, isEnabled ? Styles.switchOn : Styles.switchOff], onPress: toggleSwitch, activeOpacity: 0.7 }, { children: _jsx(Animated.View, { style: [Styles.switchThumb, { left: position }] }) })));
};
export default CustomSwitch;
