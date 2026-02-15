import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from '../UploadDetailsStyles';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import CustomButton from '../../../components/customButton/CustomButton';
import CustomSearch from '../../../components/customSearch/CustomSearch';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next'

const UploadedImagesScreen = ({ route, navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { images } = route.params || {};
    const [search, setSearch] = useState('');

    const renderItem = ({ item }: any) => (
        <View style={Styles.imgContainer}>
            <FastImage
                source={{ uri: item.uri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
            />
        </View>
    );

    const ListHeaderComponent = ({ item }: any) => (
        <View>
            <Text style={[Styles.titleText, { marginLeft: 15 }]}>{t('Event Search')}</Text>
            <SizeBox height={8} />
            <View style={[Styles.row]}>
                <View style={{ flex: 2 }}>
                    <CustomSearch value={search} placeholder={t('Competition Search....')} onChangeText={(text: any) => setSearch(text)} />
                </View>
                <SizeBox width={5} />
                <View style={{ flex: 1, marginRight: 20 }}>
                    <CustomButton title={t('Add New')} onPress={() => navigation.navigate('CreateCompetition')} isAdd={true} />
                </View>
            </View>
            <SizeBox height={24} />
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            <CustomHeader title={`Uploaded Images`} onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <FlatList
                data={images}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                style={{ paddingTop: 24 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={ListHeaderComponent}
            />

            <View style={Styles.bottomBtn}>
                <CustomButton title={t('Upload')} onPress={() => { navigation.goBack() }} isSmall={true} />
            </View>
        </View>
    );
};

export default UploadedImagesScreen;