import React, { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../constants/Theme';

interface SubscribedUsers {
    users: any;
}

const SubscribedUsers = ({ users }: SubscribedUsers) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    return (
        <View style={styles.container}>
            {users.map((user: any, index: any) => (
                <Image
                    key={index}
                    source={typeof user === 'string' ? { uri: user } : user}
                    style={[styles.image, { marginLeft: index === 0 ? 0 : -7 }]}
                />
            ))}
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
