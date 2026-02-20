import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { createStyles } from './CompleteAthleteDetailsScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import Images from '../../../constants/Images';
import Icons from '../../../constants/Icons';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { Buildings, CloseCircle } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next'
import { ApiError, GroupSummary, searchGroups } from '../../../services/apiGateway';

const CompleteAthleteDetailsScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile, apiAccessToken } = useAuth();

    const [chestNumber, setChestNumber] = useState('');
    const [website, setWebsite] = useState('');
    const [runningClub, setRunningClub] = useState('');
    const [runningClubGroupId, setRunningClubGroupId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [clubModalVisible, setClubModalVisible] = useState(false);
    const [clubQuery, setClubQuery] = useState('');
    const [groupOptions, setGroupOptions] = useState<GroupSummary[]>([]);
    const [groupsLoading, setGroupsLoading] = useState(false);
    const [groupsError, setGroupsError] = useState<string | null>(null);

    useEffect(() => {
        if (!clubModalVisible || !apiAccessToken) return;
        let mounted = true;
        const timeout = setTimeout(async () => {
            setGroupsLoading(true);
            setGroupsError(null);
            try {
                const res = await searchGroups(apiAccessToken, {
                    q: clubQuery.trim() || undefined,
                    limit: 200,
                });
                if (!mounted) return;
                const sorted = [...(res.groups || [])].sort((a, b) =>
                    String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' }),
                );
                setGroupOptions(sorted);
            } catch (e: any) {
                if (!mounted) return;
                const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                setGroupsError(msg);
                setGroupOptions([]);
            } finally {
                if (mounted) setGroupsLoading(false);
            }
        }, 250);

        return () => {
            mounted = false;
            clearTimeout(timeout);
        };
    }, [apiAccessToken, clubModalVisible, clubQuery]);

    const handleSkip = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'BottomTabBar' }],
        });
    };

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            const trimmedChest = String(chestNumber || '').trim();
            const currentYear = String(new Date().getFullYear());
            const chestNumbersByYear =
                trimmedChest.length > 0
                    ? { [currentYear]: trimmedChest }
                    : {};
            await updateUserProfile({
                chestNumbersByYear,
                website,
                runningClub,
                runningClubGroupId,
            });
            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabBar' }],
            });
        } catch (err: any) {
            Alert.alert(t('Error'), t('Failed to save details. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectRunningClub = (group: GroupSummary) => {
        setRunningClub(String(group.name || ''));
        setRunningClubGroupId(String(group.group_id || ''));
        setClubModalVisible(false);
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <SizeBox height={30} />

                <View style={Styles.imageContainer}>
                    <FastImage
                        source={Images.signup4}
                        style={Styles.headerImage}
                        resizeMode="contain"
                    />
                </View>

                <SizeBox height={30} />

                <View style={Styles.contentContainer}>
                    <Text style={Styles.headingText}>
                        Complete Your Athlete Details
                    </Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>
                        Add your information and club details
                    </Text>

                    <SizeBox height={24} />

                    <View style={Styles.formContainer}>
                        <CustomTextInput
                            label={t('Chest Number')}
                            placeholder={t('Enter Chest Number')}
                            icon={<Icons.User height={16} width={16} />}
                            value={chestNumber}
                            onChangeText={setChestNumber}
                        />

                        <CustomTextInput
                            label={t('Website')}
                            placeholder={t('Enter website link')}
                            icon={<Icons.WebsiteBlue height={16} width={16} />}
                            value={website}
                            onChangeText={setWebsite}
                            autoCapitalize="none"
                        />

                        <Text style={Styles.clubFieldLabel}>{t('Running Club')}</Text>
                        <TouchableOpacity
                            style={Styles.clubFieldContainer}
                            activeOpacity={0.8}
                            onPress={() => setClubModalVisible(true)}
                        >
                            <View style={Styles.clubFieldLeft}>
                                <Buildings size={16} color={colors.primaryColor} />
                                <SizeBox width={10} />
                                <Text style={runningClub ? Styles.clubFieldText : Styles.clubFieldPlaceholder}>
                                    {runningClub || t('Choose Running Club')}
                                </Text>
                            </View>
                            <Icons.Dropdown height={20} width={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={Styles.buttonContainer}>
                    <TouchableOpacity
                        style={Styles.skipButton}
                        activeOpacity={0.7}
                        onPress={handleSkip}
                    >
                        <Text style={Styles.skipButtonText}>{t('Skip')}</Text>
                        <Icons.RightBtnIconGrey height={18} width={18} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[Styles.finishButton, isLoading && { opacity: 0.5 }]}
                        activeOpacity={0.7}
                        onPress={handleFinish}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Text style={Styles.finishButtonText}>{t('Finish')}</Text>
                                <Icons.RightBtnIcon height={18} width={18} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <SizeBox height={40} />
            </ScrollView>

            <Modal
                visible={clubModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setClubModalVisible(false)}
            >
                <View style={Styles.modalBackdrop}>
                    <View style={Styles.modalCard}>
                        <View style={Styles.modalHeader}>
                            <Text style={Styles.modalTitle}>{t('Select Running Club')}</Text>
                            <TouchableOpacity onPress={() => setClubModalVisible(false)}>
                                <CloseCircle size={22} color={colors.grayColor} />
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={12} />
                        <TextInput
                            style={Styles.searchInput}
                            placeholder={t('Search club')}
                            placeholderTextColor={colors.grayColor}
                            value={clubQuery}
                            onChangeText={setClubQuery}
                        />
                        <SizeBox height={10} />
                        {groupsLoading ? (
                            <ActivityIndicator size="small" color={colors.primaryColor} />
                        ) : groupsError ? (
                            <Text style={Styles.emptyText}>{groupsError}</Text>
                        ) : (
                            <FlatList
                                data={groupOptions}
                                keyExtractor={(item) => String(item.group_id)}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={Styles.groupItem}
                                        onPress={() => handleSelectRunningClub(item)}
                                    >
                                        <Text style={Styles.groupItemText}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={<Text style={Styles.emptyText}>{t('No groups found')}</Text>}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CompleteAthleteDetailsScreen;
