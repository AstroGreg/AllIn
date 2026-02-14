import { View, Text, FlatList } from 'react-native'
import React from 'react'
import CompetitionContainer from './CompetitionContainer'
import SizeBox from '../../../constants/SizeBox'
import CustomButton from '../../../components/customButton/CustomButton'
import { useNavigation } from '@react-navigation/native'

interface CreatedCompetitionsProps {
    data?: any
}

const CreatedCompetitions = ({ data }: CreatedCompetitionsProps) => {
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
                        <CompetitionContainer
                            videoUri={item.videoUri}
                            CompetitionName={item.CompetitionName}
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

export default CreatedCompetitions
