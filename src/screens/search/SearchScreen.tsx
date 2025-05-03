import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Styles from './SearchStyles'
import CustomHeader from '../../components/customHeader/CustomHeader'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomSearch from '../../components/customSearch/CustomSearch'
import Icons from '../../constants/Icons'
import SearchResult from './components/SearchResult'

const SearchScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [selectedFilter, setSelectedFilter] = useState(0);

    const Filter = [
        {
            id: 1,
            name: 'Competition'
        },
        {
            id: 2,
            name: 'Athelete'
        },
        {
            id: 3,
            name: 'Location'
        },
        {
            id: 4,
            name: 'Photographer'
        }
    ]

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Search' isBack={false} onPressSetting={() => navigation.navigate('ProfileSettings')} />
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                <SizeBox height={24} />
                <CustomSearch placeholder='Running....' value={search} onChangeText={(text: any) => setSearch(text)} />
                <SizeBox height={24} />
                <View style={Styles.borderBox}>
                    <View style={Styles.row}>
                        <Icons.Filter height={16} width={16} />
                        <SizeBox width={6} />
                        <Text style={Styles.subText}>Filter by:</Text>
                    </View>
                    <SizeBox height={12} />

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {Filter?.map((item, index) => (
                            <TouchableOpacity activeOpacity={0.5} key={index.toString()} style={[Styles.filterCont, selectedFilter === item.id && Styles.selectedFilterCont]} onPress={() => setSelectedFilter(item.id)}>
                                <Text style={[Styles.filterText, selectedFilter === item.id && Styles.selectedFilterText]}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <SizeBox height={23} />
                    <View style={[Styles.row, { justifyContent: 'space-between' }]}>
                        <View style={Styles.row}>
                            <Icons.TickCircle height={16} width={16} />
                            <SizeBox width={6} />
                            <Text style={Styles.subText}>Results:</Text>
                        </View>
                        <View style={Styles.row}>
                            <Icons.CalendarGrey height={16} width={16} />
                            <SizeBox width={6} />
                            <Text style={Styles.subText}>Talent: Running</Text>
                        </View>
                    </View>
                </View>
                <SizeBox height={24} />
                <View style={[Styles.row, { justifyContent: 'space-between', marginHorizontal: 20 }]}>
                    <Text style={Styles.titleText}>Searched results</Text>
                    <TouchableOpacity activeOpacity={0.5}>
                        <Text style={Styles.filterText}>View all</Text>
                    </TouchableOpacity>
                </View>
                <SizeBox height={16} />
                <Text style={[Styles.filterText, { marginHorizontal: 20 }]}>2024</Text>
                <SizeBox height={10} />

                <SearchResult
                    isUserProfile={true}
                    onContainerPress={() => navigation.navigate('UserProfileScreen')}
                />
                <SizeBox height={10} />
                <SearchResult
                    icon={<Icons.EventCalendar height={34} width={34} />}
                    isAction={true}
                    onPressPhotos={() => navigation.navigate('Videography', { type: 'photo' })}
                    onPressVideos={() => navigation.navigate('Videography', { type: 'video' })}
                />
                <SizeBox height={10} />
                <SearchResult
                    icon={<Icons.CameraWhite height={24} width={24} />}
                    isAction={true}
                    onPressPhotos={() => navigation.navigate('Videography', { type: 'photo' })}
                    onPressVideos={() => navigation.navigate('Videography', { type: 'video' })}
                />
                <SizeBox height={30} />
            </ScrollView>
        </View>
    )
}

export default SearchScreen