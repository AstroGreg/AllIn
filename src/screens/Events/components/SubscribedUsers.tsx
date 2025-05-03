import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Colors from '../../../constants/Colors';

interface SubscribedUsers {
    users: any;
}

const SubscribedUsers = ({ users }: SubscribedUsers) => {
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

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 0.5,
        borderColor: Colors.whiteColor,
    },
});

export default SubscribedUsers;
