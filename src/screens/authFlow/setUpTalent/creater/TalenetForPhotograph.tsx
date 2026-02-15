import { View, ScrollView, Text } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../AddTalentStyles'
import SizeBox from '../../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomSearch from '../../../../components/customSearch/CustomSearch'
import Icons from '../../../../constants/Icons'
import SelcetionContainer from '../components/SelcetionContainer'
import CustomButton from '../../../../components/customButton/CustomButton'
import { useTheme } from '../../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const TalenetForPhotograph = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleSelect = (id: number) => {
        setSelectedId(id === selectedId ? null : id);
    };


    const data = [
        {
            id: 1,
            title: 'Sports & Athletic Event',
            icon: <Icons.Talent1 height={22} width={22} />,
        },
        {
            id: 2,
            title: 'Branding & Promotional Event',
            icon: <Icons.Talent2 height={22} width={22} />,
        },
        {
            id: 3,
            title: 'Concert & Live Event',
            icon: <Icons.Talent3 height={22} width={22} />,
        },
        {
            id: 4,
            title: 'Academic & Educational Event',
            icon: <Icons.Talent4 height={22} width={22} />,
        },
        {
            id: 5,
            title: 'Corporate Event',
            icon: <Icons.Talent5 height={22} width={22} />,
        },
    ]

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <SizeBox height={76} />
                <View style={Styles.contentContainer}>
                    <Text style={Styles.headingText}>{t('Select talent you want to photograph')}</Text>
                    <SizeBox height={16} />
                    <CustomSearch
                        value={search}
                        onChangeText={(text) => setSearch(text)}
                        placeholder={t('Search')}
                    />
                    <SizeBox height={24} />
                    <View style={Styles.row}>
                        <Icons.TickCircle height={16} width={16} />
                        <Text style={Styles.searchResultsText}>{t('Results:')}</Text>
                    </View>
                    <SizeBox height={24} />
                    <View style={Styles.separator} />
                    <SizeBox height={27} />
                    <View style={Styles.talentContainer}>
                        <SizeBox height={16} />
                        {
                            data?.map((item) =>
                                <SelcetionContainer
                                    title={item.title}
                                    icon={item.icon}
                                    isSelected={item.id === selectedId}
                                    onPress={() => handleSelect(item.id)}
                                />)
                        }
                    </View>
                    <SizeBox height={55} />
                    <CustomButton title={t('Next')} onPress={() => navigation.navigate('PhotographyName')} />
                </View>

            </ScrollView>
        </View>
    )
}

export default TalenetForPhotograph