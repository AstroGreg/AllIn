import { View, Text, FlatList } from 'react-native'
import React from 'react'
import EventContainer from './EventContainer'
import SizeBox from '../../../constants/SizeBox'
import Colors from '../../../constants/Colors'
import CustomButton from '../../../components/customButton/CustomButton'
import { useNavigation } from '@react-navigation/native'

interface CretedEventsProps {
    data?: any
}

const CretedEvents = ({ data }: CretedEventsProps) => {
    const navigation: any = useNavigation();

    return (
        <View>
            <FlatList
                data={data}
                numColumns={2}
                contentContainerStyle={{ flexWrap: 'wrap' }}
                style={{ marginHorizontal: 20 }}
                renderItem={({ item }: any) =>
                    <>
                        <EventContainer
                            videoUri={item.videoUri}
                            eventName={item.eventName}
                            map={item.map}
                            location={item.location}
                            date={item.date}
                            onPress={() => { }}
                            isActions={true}
                            onPressContainer={() => navigation.navigate('Videography', {
                                type: 'video'
                            })}
                        />
                        <SizeBox height={16} />
                    </>
                }
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<SizeBox height={40} />}
            />


        </View>
    )
}

export default CretedEvents