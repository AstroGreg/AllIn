import { View, Text, FlatList, ScrollView } from 'react-native'
import React, { useState } from 'react'
import CustomHeader from '../../components/customHeader/CustomHeader'
import { createStyles } from './EventsStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomSearch from '../../components/customSearch/CustomSearch'
import TitleContainers from '../Events/components/TitleContainers'
import FeaturedEvents from '../Events/components/FeaturedEvents'
import SimilarEvents from '../Events/components/SimilarEvents'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const EventsScreen = ({ navigation }: any) => {

  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const { colors } = useTheme();
  const Styles = createStyles(colors);
  const { t } = useTranslation();

  const RenderFeaturedEvents = () => {
    return (
      <FeaturedEvents
        onPressSubscribe={() => navigation.navigate('ChooseEventScreen')}
      />
    )
  }

  const RenderSimilarEvents = () => {
    return (
      <SimilarEvents
        onPressSubscribe={() => navigation.navigate('ChooseEventScreen')}
      />
    )
  }

  return (
    <View style={Styles.mainContainer}>
      <SizeBox height={insets.top} />
      <CustomHeader title={t('Events')} onBackPress={() => navigation.navigate('BottomTabBar')} onPressSetting={() => navigation.navigate('ProfileSettings')} />

      <ScrollView style={Styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        <SizeBox height={24} />
        <CustomSearch value={search} placeholder={t('Search...')} onChangeText={(text) => setSearch(text)} />
        <SizeBox height={24} />

        <TitleContainers title={t('Featured events')} onActionPress={() => { }} />
        <SizeBox height={16} />
        <FlatList
          data={['', '', '']}
          renderItem={RenderFeaturedEvents}
          keyExtractor={(item, index) => index.toString()}
          horizontal={true}
          style={{ paddingLeft: 20 }}
          showsHorizontalScrollIndicator={false}
        />

        <SizeBox height={24} />
        <TitleContainers title={t('Similar events')} onActionPress={() => { }} />
        <SizeBox height={16} />
        <FlatList
          data={['', '', '']}
          renderItem={RenderSimilarEvents}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
        <SizeBox height={24} />
      </ScrollView>
    </View>
  )
}

export default EventsScreen
