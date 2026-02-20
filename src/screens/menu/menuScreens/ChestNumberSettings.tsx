import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Pressable, ActivityIndicator, Alert } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowDown2, ArrowLeft2 } from 'iconsax-react-nativejs'
import { useAuth } from '../../../context/AuthContext'
import { ApiError, getProfileSummary, updateProfileSummary } from '../../../services/apiGateway'
import { useTranslation } from 'react-i18next'

const ChestNumberSettings = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const { apiAccessToken, userProfile, updateUserProfile } = useAuth();

    const currentYear = useMemo(() => new Date().getFullYear(), []);
    const currentYearString = useMemo(() => String(currentYear), [currentYear]);
    const [selectedYear, setSelectedYear] = useState<string>(currentYearString);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [chestByYear, setChestByYear] = useState<Record<string, string>>({});
    const [chestInput, setChestInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const yearOptions = useMemo(() => {
        const out: string[] = [];
        for (let y = currentYear; y >= 2000; y -= 1) out.push(String(y));
        return out;
    }, [currentYear]);

    const normalizeChestByYear = useCallback((raw: any): Record<string, string> => {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
        const out: Record<string, string> = {};
        for (const [year, chest] of Object.entries(raw as Record<string, unknown>)) {
            const safeYear = String(year ?? '').trim();
            if (!/^\d{4}$/.test(safeYear)) continue;
            const parsed = Number(chest);
            if (!Number.isInteger(parsed) || parsed < 0) continue;
            out[safeYear] = String(parsed);
        }
        return out;
    }, []);

    useEffect(() => {
        let active = true;
        (async () => {
            const local = normalizeChestByYear(userProfile?.chestNumbersByYear ?? {});
            if (active) {
                setChestByYear(local);
                setIsLoading(!apiAccessToken);
            }
            if (!apiAccessToken) return;

            try {
                const summary = await getProfileSummary(apiAccessToken);
                if (!active) return;
                const server = normalizeChestByYear(summary?.profile?.chest_numbers_by_year ?? {});
                setChestByYear(server);
                await updateUserProfile({ chestNumbersByYear: server });
            } catch {
                // keep local fallback
            } finally {
                if (active) setIsLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [apiAccessToken, normalizeChestByYear, updateUserProfile, userProfile?.chestNumbersByYear]);

    useEffect(() => {
        setChestInput(String(chestByYear[selectedYear] ?? ''));
    }, [chestByYear, selectedYear]);

    const currentChest = useMemo(() => {
        const thisYear = String(chestByYear[currentYearString] ?? '').trim();
        if (thisYear.length > 0) return thisYear;
        const latestYear = Object.keys(chestByYear)
            .filter((year) => /^\d{4}$/.test(String(year)))
            .sort((a, b) => Number(b) - Number(a))
            .find((year) => String(chestByYear[year] ?? '').trim().length > 0);
        return latestYear ? String(chestByYear[latestYear]).trim() : '';
    }, [chestByYear, currentYearString]);

    const canSave = useMemo(() => {
        if (isSaving || isLoading) return false;
        const normalizedInput = String(chestInput ?? '').replace(/[^0-9]/g, '').trim();
        const stored = String(chestByYear[selectedYear] ?? '').trim();
        return normalizedInput !== stored;
    }, [chestByYear, chestInput, isLoading, isSaving, selectedYear]);

    const handleCancelEdit = () => {
        setChestInput(String(chestByYear[selectedYear] ?? ''));
    };

    const handleSave = async () => {
        if (!/^\d{4}$/.test(String(selectedYear))) return;
        const normalizedInput = String(chestInput ?? '').replace(/[^0-9]/g, '').trim();
        const nextByYear: Record<string, string> = { ...chestByYear };
        if (!normalizedInput) {
            delete nextByYear[selectedYear];
        } else {
            const parsed = Number(normalizedInput);
            if (!Number.isInteger(parsed) || parsed < 0) {
                Alert.alert(t('Save failed'), t('Please try again'));
                return;
            }
            nextByYear[selectedYear] = String(parsed);
        }

        const payload = Object.entries(nextByYear).reduce((acc, [year, chest]) => {
            const parsed = Number(chest);
            if (/^\d{4}$/.test(String(year)) && Number.isInteger(parsed) && parsed >= 0) {
                acc[String(year)] = parsed;
            }
            return acc;
        }, {} as Record<string, number>);

        setIsSaving(true);
        try {
            if (apiAccessToken) {
                const updated = await updateProfileSummary(apiAccessToken, { chest_numbers_by_year: payload });
                const stored = normalizeChestByYear(updated?.profile?.chest_numbers_by_year ?? payload);
                setChestByYear(stored);
                await updateUserProfile({ chestNumbersByYear: stored });
            } else {
                setChestByYear(nextByYear);
                await updateUserProfile({ chestNumbersByYear: nextByYear });
            }
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            Alert.alert(t('Save failed'), message || t('Please try again'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Chest number by year')}</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.changePasswordTitle}>{t('Chest number by year')}</Text>
                <SizeBox height={16} />

                <View style={Styles.currentValueCard}>
                    <View>
                        <Text style={Styles.currentValueLabel}>{t('Current chest number')}</Text>
                        <Text style={Styles.currentValueText}>{currentChest || t('Not set')}</Text>
                    </View>
                </View>

                <SizeBox height={24} />

                {isLoading ? (
                    <View style={{ paddingVertical: 20 }}>
                        <ActivityIndicator color={colors.primaryColor} />
                    </View>
                ) : (
                    <>
                        <View style={Styles.addCardInputGroup}>
                            <Text style={Styles.addCardLabel}>{t('year')}</Text>
                            <SizeBox height={8} />
                            <TouchableOpacity style={Styles.addCardInputContainer} onPress={() => setShowYearPicker(true)}>
                                <Text style={Styles.addCardInputText}>{selectedYear}</Text>
                                <ArrowDown2 size={18} color={colors.grayColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>

                        <SizeBox height={16} />

                        <View style={Styles.addCardInputGroup}>
                            <Text style={Styles.addCardLabel}>{t('chestNumber')}</Text>
                            <SizeBox height={8} />
                            <View style={Styles.addCardInputContainer}>
                                <TextInput
                                    style={Styles.addCardInput}
                                    placeholder={t('chestNumber')}
                                    placeholderTextColor={colors.grayColor}
                                    keyboardType="number-pad"
                                    value={chestInput}
                                    onChangeText={(value) => setChestInput(String(value || '').replace(/[^0-9]/g, ''))}
                                    editable={!isSaving}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSave}
                                />
                            </View>
                        </View>

                        <View style={Styles.editActionsRow}>
                            <TouchableOpacity style={Styles.cancelButton} disabled={isSaving} onPress={handleCancelEdit}>
                                <Text style={Styles.cancelButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.saveButton, !canSave && { opacity: 0.6 }]}
                                disabled={!canSave}
                                onPress={handleSave}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color={colors.pureWhite} />
                                ) : (
                                    <Text style={Styles.saveButtonText}>{t('save')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            <Modal
                visible={showYearPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowYearPicker(false)}
            >
                <View style={Styles.selectionModalOverlay}>
                    <Pressable
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => setShowYearPicker(false)}
                    />
                    <View style={Styles.selectionModalCard}>
                        <Text style={Styles.selectionModalTitle}>{t('year')}</Text>
                        <ScrollView>
                            {yearOptions.map((year) => (
                                <TouchableOpacity
                                    key={`chest-year-${year}`}
                                    style={Styles.selectionOption}
                                    onPress={() => {
                                        setSelectedYear(year);
                                        setShowYearPicker(false);
                                    }}
                                >
                                    <Text style={Styles.selectionOptionText}>{year}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default ChestNumberSettings
