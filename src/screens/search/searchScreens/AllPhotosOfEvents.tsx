import { View, Text, FlatList } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox'
import Styles from '../SearchStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import PhotoContainer from '../components/PhotoContainer';
import Images from '../../../constants/Images';

const AllPhotosOfEvents = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const data = [
        {
            id: 1,
            name: 'Passionate',
            photo: Images.photo1,
            price: '$15'
        },
        {
            id: 2,
            name: 'Passionate',
            photo: Images.photo3,
            price: '$15'
        },
        {
            id: 3,
            name: 'Passionate',
            photo: Images.photo4,
            price: '$15'
        },
        {
            id: 4,
            name: 'Passionate',
            photo: Images.photo5,
            price: '$15'
        },
        {
            id: 5,
            name: 'Passionate',
            photo: Images.photo6,
            price: '$15'
        },
        {
            id: 6,
            name: 'Passionate',
            photo: Images.photo7,
            price: '$15'
        },
        {
            id: 7,
            name: 'Passionate',
            photo: Images.photo8,
            price: '$15'
        },
        {
            id: 8,
            name: 'Passionate',
            photo: Images.photo9,
            price: '$15'
        },
        {
            id: 9,
            name: 'Passionate',
            photo: Images.photo5,
            price: '$15'
        },
        {
            id: 10,
            name: 'Passionate',
            photo: Images.photo4,
            price: '$15'
        },
        {
            id: 11,
            name: 'Passionate',
            photo: Images.photo9,
            price: '$15'
        },
    ]

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='All Photograph' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <FlatList
                data={data}
                renderItem={({ item }) =>
                    <PhotoContainer
                        photo={item.photo}
                        name={item.name}
                        price={item.price}
                        onPressImg={() => navigation.navigate('PhotosScreen', { photoUri: item.photo })}
                    />
                }
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                contentContainerStyle={{
                    paddingHorizontal: 20, // Add horizontal padding
                    paddingTop: 20,
                }}
                columnWrapperStyle={{
                    justifyContent: 'flex-start', // Align items from start
                }}
                ListHeaderComponent={
                    <>
                        <Text style={Styles.titleText}>Talent : Running</Text>
                        <SizeBox height={16} />
                    </>
                }
                style={{ flex: 1 }}
                ListFooterComponent={<SizeBox height={30} />}
            />
        </View>
    )
}

export default AllPhotosOfEvents