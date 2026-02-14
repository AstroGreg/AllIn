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
import { createStyles } from './ReceivedRequestStateScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ReceivedRequestStateScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [description, setDescription] = useState(t('Enhance Lighting & Colors'));
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
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Received Request State')}</Text>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate('NotificationsScreen')}
                >
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Request Summary */}
                <Text style={styles.sectionTitle}>{t('Request Summary')}</Text>
                <SizeBox height={16} />

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>{t('Enhance Lighting & Colors')}</Text>
                    <View style={styles.summaryMeta}>
                        <View style={styles.metaItem}>
                            <Calendar size={12} color={colors.subTextColor} variant="Linear" />
                            <Text style={styles.metaText}>12.12.2024</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Clock size={12} color={colors.subTextColor} variant="Linear" />
                            <Text style={styles.metaText}>12:00</Text>
                        </View>
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Change the Competition Details */}
                <Text style={styles.sectionTitle}>{t('Change the Competition Details')}</Text>
                <SizeBox height={16} />

                <Text style={styles.inputLabel}>{t('Edit Competition Details')}</Text>
                <SizeBox height={8} />
                <View style={styles.textAreaContainer}>
                    <Edit2 size={16} color={colors.subTextColor} variant="Linear" />
                    <TextInput
                        style={styles.textArea}
                        placeholder={t('Write Something.....')}
                        placeholderTextColor={colors.grayColor}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                <SizeBox height={24} />

                {/* Update Status */}
                <Text style={styles.sectionTitle}>{t('Update Status')}</Text>
                <SizeBox height={16} />

                <View style={styles.statusRow}>
                    <TouchableOpacity
                        style={styles.statusOption}
                        onPress={() => handleStatusChange('fixes')}
                    >
                        <Text style={styles.statusText}>{t('Mark as Fixes')}</Text>
                        <View style={[styles.checkbox, markAsFixes && styles.checkboxChecked]}>
                            {markAsFixes && <TickSquare size={16} color={colors.primaryColor} variant="Bold" />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.statusOption}
                        onPress={() => handleStatusChange('nonIssue')}
                    >
                        <Text style={styles.statusText}>{t('Mark as Non Issue')}</Text>
                        <View style={[styles.checkbox, markAsNonIssue && styles.checkboxChecked]}>
                            {markAsNonIssue && <TickSquare size={16} color={colors.primaryColor} variant="Bold" />}
                        </View>
                    </TouchableOpacity>
                </View>

                <SizeBox height={30} />

                {/* Bottom Actions */}
                <View style={styles.bottomActions}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
                        <ArrowRight size={18} color={colors.subTextColor} variant="Linear" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.updateButton}>
                        <Text style={styles.updateButtonText}>{t('Update Request')}</Text>
                        <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default ReceivedRequestStateScreen;
