import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useMemo } from 'react'
import SizeBox from '../../../constants/SizeBox'
import Styles from '../SearchStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/customHeader/CustomHeader';

const AllPhotosOfEvents = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const eventName = route?.params?.eventName || 'Event';
    const division = route?.params?.division;
    const gender = route?.params?.gender;

    const formatDate = (value?: string) => {
        if (!value) return '—';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const data = useMemo(() => ([
        {
            id: 1,
            name: 'Passionate',
            photoUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
            price: '$15',
            uploadedAt: '2026-02-05',
        },
        {
            id: 2,
            name: 'Passionate',
            photoUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
            price: '$15',
            uploadedAt: '2026-02-02',
        },
        {
            id: 3,
            name: 'Passionate',
            photoUrl: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=800&q=80',
            price: '$15',
            uploadedAt: '2026-01-29',
        },
    ]), []);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='All Photograph' onBackPress={() => navigation.goBack()} />

            <FlatList
                data={data}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={{
                            marginHorizontal: 20,
                            marginBottom: 16,
                            borderRadius: 14,
                            overflow: 'hidden',
                            backgroundColor: '#FFFFFF',
                            borderWidth: 1,
                            borderColor: '#E8ECF2',
                        }}
                        onPress={() => navigation.navigate('PhotoDetailScreen', {
                            eventTitle: eventName,
                            media: {
                                type: 'image',
                                title: `${eventName} ${item.name}`,
                                thumbnailUrl: item.photoUrl,
                                previewUrl: item.photoUrl,
                                originalUrl: item.photoUrl,
                                fullUrl: item.photoUrl,
                            },
                        })}
                    >
                        <Image
                            source={{ uri: item.photoUrl }}
                            style={{ width: '100%', height: 180 }}
                            resizeMode="cover"
                        />
                        <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                            <Text style={[Styles.titleText, { fontSize: 16 }]} numberOfLines={1}>{eventName}</Text>
                            <SizeBox height={6} />
                            <Text style={Styles.subText} numberOfLines={1}>
                                {item.name} • {item.price}
                            </Text>
                            <SizeBox height={4} />
                            <Text style={Styles.subText} numberOfLines={1}>
                                Uploaded {formatDate(item.uploadedAt)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{
                    paddingTop: 20,
                    paddingBottom: 10,
                }}
                ListHeaderComponent={
                    <View style={{ marginLeft: 20 }}>
                        <Text style={Styles.titleText}>{eventName}</Text>
                        {(division || gender) && (
                            <>
                                <SizeBox height={6} />
                                <Text style={Styles.filterText}>{[division, gender].filter(Boolean).join(' • ')}</Text>
                            </>
                        )}
                        <SizeBox height={16} />
                    </View>
                }
                style={{ flex: 1 }}
                ListFooterComponent={<SizeBox height={30} />}
            />
        </View>
    )
}

export default AllPhotosOfEvents
