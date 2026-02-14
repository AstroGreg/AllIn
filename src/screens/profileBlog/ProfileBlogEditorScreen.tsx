import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Add, Trash } from 'iconsax-react-nativejs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../context/ThemeContext';
import SizeBox from '../../constants/SizeBox';
import { createStyles } from './ProfileBlogEditorStyles';

type BlogMedia = {
    uri: string;
    type: 'image' | 'video';
};

type BlogEntry = {
    id: string;
    title: string;
    description: string;
    date: string;
    media: BlogMedia[];
};

const ProfileBlogEditorScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const storageKey: string = route?.params?.storageKey ?? '@profile_blogs_self';
    const mode: 'add' | 'edit' = route?.params?.mode ?? 'add';
    const entry: BlogEntry | null = route?.params?.entry ?? null;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [media, setMedia] = useState<BlogMedia[]>([]);

    useEffect(() => {
        if (entry) {
            setTitle(entry.title);
            setDescription(entry.description);
            setDate(entry.date);
            setMedia(entry.media ?? []);
        }
    }, [entry]);

    const pickMedia = useCallback(async () => {
        const result = await launchImageLibrary({
            mediaType: 'mixed',
            selectionLimit: 6,
        });
        const items = result.assets ?? [];
        const mapped = items
            .filter((asset) => asset.uri)
            .map((asset) => ({
                uri: asset.uri as string,
                type: asset.type?.startsWith('video') ? 'video' : 'image',
            }));
        if (mapped.length > 0) {
            setMedia((prev) => [...prev, ...mapped].slice(0, 12));
        }
    }, []);

    const saveEntry = useCallback(async () => {
        if (!title.trim() || !description.trim()) return;
        const stored = await AsyncStorage.getItem(storageKey);
        const list: BlogEntry[] = stored ? JSON.parse(stored) : [];
        const nextDate = date.trim() || new Date().toLocaleDateString('en-GB');
        if (mode === 'edit' && entry) {
            const updated = list.map((item) =>
                item.id === entry.id
                    ? {
                        ...item,
                        title: title.trim(),
                        description: description.trim(),
                        date: nextDate,
                        media,
                    }
                    : item,
            );
            await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
        } else {
            const next: BlogEntry = {
                id: `blog-${Date.now()}`,
                title: title.trim(),
                description: description.trim(),
                date: nextDate,
                media,
            };
            await AsyncStorage.setItem(storageKey, JSON.stringify([next, ...list]));
        }
        navigation.goBack();
    }, [date, description, entry, media, mode, navigation, storageKey, title]);

    const deleteEntry = useCallback(async () => {
        if (!entry) return;
        const stored = await AsyncStorage.getItem(storageKey);
        const list: BlogEntry[] = stored ? JSON.parse(stored) : [];
        const updated = list.filter((item) => item.id !== entry.id);
        await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
        navigation.goBack();
    }, [entry, navigation, storageKey]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{mode === 'edit' ? 'Edit blog' : 'New blog'}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView contentContainerStyle={Styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>Title</Text>
                    <TextInput
                        style={Styles.fieldInput}
                        placeholder="PK 400m Limburg 2025"
                        placeholderTextColor="#9B9F9F"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>
                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>Date</Text>
                    <TextInput
                        style={Styles.fieldInput}
                        placeholder="04/02/2026"
                        placeholderTextColor="#9B9F9F"
                        value={date}
                        onChangeText={setDate}
                    />
                </View>
                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>Description</Text>
                    <TextInput
                        style={[Styles.fieldInput, Styles.fieldTextarea]}
                        placeholder="Write your story and results."
                        placeholderTextColor="#9B9F9F"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>

                <View style={Styles.mediaHeader}>
                    <Text style={Styles.fieldLabel}>Media</Text>
                    <TouchableOpacity style={Styles.mediaAddButton} onPress={pickMedia}>
                        <Add size={14} color="#FFFFFF" variant="Linear" />
                        <Text style={Styles.mediaAddText}>Add media</Text>
                    </TouchableOpacity>
                </View>
                <View style={Styles.mediaGrid}>
                    {media.map((item, index) => (
                        <View key={`${item.uri}-${index}`} style={Styles.mediaTile}>
                            <Image source={{ uri: item.uri }} style={Styles.mediaImage} />
                            {item.type === 'video' && (
                                <View style={Styles.mediaBadge}>
                                    <Text style={Styles.mediaBadgeText}>Video</Text>
                                </View>
                            )}
                        </View>
                    ))}
                    {media.length === 0 && (
                        <Text style={Styles.mediaEmptyText}>No media added yet.</Text>
                    )}
                </View>

                <View style={Styles.actionRow}>
                    <TouchableOpacity style={Styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={Styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.saveButton} onPress={saveEntry}>
                        <Text style={Styles.saveText}>Save</Text>
                    </TouchableOpacity>
                </View>

                {mode === 'edit' && entry ? (
                    <TouchableOpacity style={Styles.deleteButton} onPress={deleteEntry}>
                        <Trash size={16} color="#ED5454" variant="Linear" />
                        <Text style={Styles.deleteText}>Delete blog</Text>
                    </TouchableOpacity>
                ) : null}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 16 : 32} />
            </ScrollView>
        </View>
    );
};

export default ProfileBlogEditorScreen;

