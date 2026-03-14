import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
const SubscribedUsers = ({ users }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    return (_jsx(View, Object.assign({ style: styles.container }, { children: users.map((user, index) => (_jsx(Image, { source: typeof user === 'string' ? { uri: user } : user, style: [styles.image, { marginLeft: index === 0 ? 0 : -7 }] }, index))) })));
};
const createStyles = (colors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 0.5,
        borderColor: colors.pureWhite,
    },
});
export default SubscribedUsers;
