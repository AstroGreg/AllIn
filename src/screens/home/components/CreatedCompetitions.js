import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { View, FlatList } from 'react-native';
import CompetitionContainer from './CompetitionContainer';
import SizeBox from '../../../constants/SizeBox';
import { useNavigation } from '@react-navigation/native';
const CreatedCompetitions = ({ data }) => {
    const navigation = useNavigation();
    return (_jsx(View, { children: _jsx(FlatList, { data: data, numColumns: 2, contentContainerStyle: { flexWrap: 'wrap' }, style: { marginHorizontal: 20 }, renderItem: ({ item }) => _jsxs(_Fragment, { children: [_jsx(CompetitionContainer, { videoUri: item.videoUri, CompetitionName: item.CompetitionName, location: item.location, date: item.date, onPress: () => { }, isActions: true, onPressContainer: () => navigation.navigate('Videography', {
                            type: 'video'
                        }) }), _jsx(SizeBox, { height: 16 })] }), keyExtractor: (item, index) => index.toString(), showsVerticalScrollIndicator: false, ListFooterComponent: _jsx(SizeBox, { height: 40 }) }) }));
};
export default CreatedCompetitions;
