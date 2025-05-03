import { View, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import Styles from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import CustomSearch from '../../../components/customSearch/CustomSearch'


const Location = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('')
    const [region, setRegion] = useState<Region>({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title="Location" onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />
            <View style={{ flex: 1 }}>
                <View style={Styles.searchContainer}>
                    <CustomSearch
                        placeholder='Search location'
                        value={search}
                        onChangeText={(text) => setSearch(text)}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({

});

export default Location