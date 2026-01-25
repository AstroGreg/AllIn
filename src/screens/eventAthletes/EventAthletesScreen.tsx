import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import Colors from '../../constants/Colors';
import Styles from './EventAthletesStyles';
import { ArrowLeft2 } from 'iconsax-react-nativejs';

const EventAthletesScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const event = route?.params?.event || { title: 'City Run Marathon' };

    const athletes = [
        { id: 1, name: 'James Ray', eventType: 'Half Marathon' },
        { id: 2, name: 'Jhon Smith', eventType: 'Marathon' },
    ];

    const renderAthleteRow = (athlete: any) => (
        <View key={athlete.id} style={Styles.athleteRow}>
            <FastImage source={Images.profilePic} style={Styles.athleteAvatar} resizeMode="cover" />
            <Text style={Styles.athleteName}>{athlete.name}</Text>
            <Text style={Styles.athleteEventType}>{athlete.eventType}</Text>
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Athletes is Participating</Text>
                <View style={Styles.headerButtonPlaceholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Competition Title */}
                <Text style={Styles.competitionTitle}>Competition: {event.title}</Text>

                {/* Athletes Section */}
                <Text style={Styles.athletesSectionTitle}>Athletes</Text>

                <View style={Styles.athletesCard}>
                    {athletes.map(renderAthleteRow)}
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default EventAthletesScreen;
