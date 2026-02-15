import { ScrollView, Text, View } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../UploadDetailsStyles'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SizeBox from '../../../constants/SizeBox';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import CustomSearch from '../../../components/customSearch/CustomSearch';
import CustomButton from '../../../components/customButton/CustomButton';
import CustomDropdown from '../../../components/customDropdown/CustomDropdown';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next'

const SelectCategory = ({ route, navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { video } = route.params || {};

    const [search, setSearch] = useState('');
    const [selectedTalent, setSelectedTalent] = useState('');

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title={t('Upload Details')} isBack={false} onPressSetting={() => navigation.navigate('ProfileSettings')} />
            <ScrollView showsVerticalScrollIndicator={false}>


                <SizeBox height={24} />
                <View>
                    <Text style={[Styles.titleText, { marginLeft: 15 }]}>{t('Event Search')}</Text>
                    <SizeBox height={8} />
                    <View style={[Styles.row]}>
                        <View style={{ flex: 2 }}>
                            <CustomSearch value={search} placeholder={t('Event Search....')} onChangeText={(text: any) => setSearch(text)} />
                        </View>
                        <SizeBox width={5} />
                        <View style={{ flex: 1, marginRight: 20 }}>
                            <CustomButton title={t('Add New')} onPress={() => navigation.navigate('CreateCompetition')} isAdd={true} />
                        </View>
                    </View>
                    <SizeBox height={24} />
                </View>


                <CustomDropdown
                    title={t('Talent Selection')}
                    options={[
                        { label: 'Athletics', value: 'athletics' },
                        { label: 'Swimming', value: 'swimming' },
                        { label: 'Other', value: 'other' },
                    ]}
                    selectedValue={selectedTalent}
                    onSelect={setSelectedTalent}
                />
                <SizeBox height={24} />
                <CustomDropdown
                    title={t('Event Type')}
                    options={[
                        { label: '400m', value: '400m' },
                        { label: '200m', value: '200m' },
                        { label: '5k', value: '5k' },
                        { label: 'Custom', value: 'Custom' },
                    ]}
                    selectedValue={selectedTalent}
                    onSelect={setSelectedTalent}
                />
                <SizeBox height={24} />
                <CustomDropdown
                    title={t('Gender Selection')}
                    options={[
                        { label: 'Men', value: 'men' },
                        { label: 'Women', value: 'women' },
                        { label: 'Both', value: 'both' },
                    ]}
                    selectedValue={selectedTalent}
                    onSelect={setSelectedTalent}
                />
                <SizeBox height={24} />
                <CustomDropdown
                    title={t('Category Selection')}
                    options={[
                        { label: 'Seniors', value: 'seniors' },
                        { label: 'Masters', value: 'masters' },
                        { label: 'Juniors', value: 'juniors' },
                    ]}
                    selectedValue={selectedTalent}
                    onSelect={setSelectedTalent}
                />
                <SizeBox height={124} />

            </ScrollView>
            <View style={Styles.bottomBtn}>
                <CustomButton title={t('Upload')} onPress={() => { navigation.goBack() }} isSmall={true} />
            </View>
        </View>
    )
}

export default SelectCategory;