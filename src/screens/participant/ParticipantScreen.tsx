import { FlatList, View, Text } from 'react-native'
import React from 'react'
import Styles from './ParticipantStyles';
import SizeBox from '../../constants/SizeBox';
import CustomHeader from '../../components/customHeader/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ParticipantContainer from './components/ParticipantContainer';

const ParticipantScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const headerComponent = () => {
        return (
            <>
                <SizeBox height={24} />
                <Text style={Styles.sportsName}>800m</Text>
                <View style={Styles.rowCenter}>
                    <Text style={Styles.subSportsName}>Beligian Championships 2024</Text>
                    <SizeBox height={2} />
                    <Text style={Styles.subSportsName}>1k +Participant</Text>
                </View>
                <SizeBox height={16} />
            </>
        )
    }

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Participant' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <FlatList
                data={['', '', '', '', '']}
                renderItem={() => <ParticipantContainer onPress={() => navigation.navigate('UserProfileScreen')} />}
                keyExtractor={(item, index) => index.toString()}
                style={{ paddingHorizontal: 20, }}
                ListHeaderComponent={headerComponent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

export default ParticipantScreen