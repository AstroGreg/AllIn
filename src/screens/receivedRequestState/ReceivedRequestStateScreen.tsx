import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    Calendar,
    Clock,
    Edit2,
    ArrowRight,
    TickSquare,
} from 'iconsax-react-nativejs';
import Styles from './ReceivedRequestStateScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';

const ReceivedRequestStateScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [description, setDescription] = useState('Enhance Lighting & Colors');
    const [markAsFixes, setMarkAsFixes] = useState(true);
    const [markAsNonIssue, setMarkAsNonIssue] = useState(false);

    const handleStatusChange = (status: 'fixes' | 'nonIssue') => {
        if (status === 'fixes') {
            setMarkAsFixes(true);
            setMarkAsNonIssue(false);
        } else {
            setMarkAsFixes(false);
            setMarkAsNonIssue(true);
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Received Request State</Text>
                <TouchableOpacity
                    style={Styles.notificationButton}
                    onPress={() => navigation.navigate('NotificationsScreen')}
                >
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Request Summary */}
                <Text style={Styles.sectionTitle}>Request Summary</Text>
                <SizeBox height={16} />

                <View style={Styles.summaryCard}>
                    <Text style={Styles.summaryTitle}>Enhance Lighting & Colors</Text>
                    <View style={Styles.summaryMeta}>
                        <View style={Styles.metaItem}>
                            <Calendar size={12} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.metaText}>12.12.2024</Text>
                        </View>
                        <View style={Styles.metaItem}>
                            <Clock size={12} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.metaText}>12:00</Text>
                        </View>
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Change the Competition Details */}
                <Text style={Styles.sectionTitle}>Change the Competition Details</Text>
                <SizeBox height={16} />

                <Text style={Styles.inputLabel}>Edit Competition Details</Text>
                <SizeBox height={8} />
                <View style={Styles.textAreaContainer}>
                    <Edit2 size={16} color="#9B9F9F" variant="Linear" />
                    <TextInput
                        style={Styles.textArea}
                        placeholder="Write Something....."
                        placeholderTextColor="#777777"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                <SizeBox height={24} />

                {/* Update Status */}
                <Text style={Styles.sectionTitle}>Update Status</Text>
                <SizeBox height={16} />

                <View style={Styles.statusRow}>
                    <TouchableOpacity
                        style={Styles.statusOption}
                        onPress={() => handleStatusChange('fixes')}
                    >
                        <Text style={Styles.statusText}>Mark as Fixes</Text>
                        <View style={[Styles.checkbox, markAsFixes && Styles.checkboxChecked]}>
                            {markAsFixes && <TickSquare size={16} color="#3C82F6" variant="Bold" />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={Styles.statusOption}
                        onPress={() => handleStatusChange('nonIssue')}
                    >
                        <Text style={Styles.statusText}>Mark as Non Issue</Text>
                        <View style={[Styles.checkbox, markAsNonIssue && Styles.checkboxChecked]}>
                            {markAsNonIssue && <TickSquare size={16} color="#3C82F6" variant="Bold" />}
                        </View>
                    </TouchableOpacity>
                </View>

                <SizeBox height={30} />

                {/* Bottom Actions */}
                <View style={Styles.bottomActions}>
                    <TouchableOpacity style={Styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={Styles.cancelButtonText}>Cancel</Text>
                        <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                    </TouchableOpacity>

                    <TouchableOpacity style={Styles.updateButton}>
                        <Text style={Styles.updateButtonText}>Update Request</Text>
                        <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default ReceivedRequestStateScreen;
