import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Trash } from 'iconsax-react-nativejs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from './ProfileTimelineEditStyles';
import type { TimelineEntry } from '../../components/profileTimeline/ProfileTimeline';

const ProfileTimelineEditScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const mode: 'add' | 'edit' = route?.params?.mode ?? 'add';
    const storageKey: string = route?.params?.storageKey ?? '@profile_timeline_self';
    const item: TimelineEntry | null = route?.params?.item ?? null;
    const blogStorageKey: string | null = route?.params?.blogStorageKey ?? null;
    const competitionOptions: string[] = route?.params?.competitionOptions ?? [];

    const [form, setForm] = useState({
        year: '',
        title: '',
        description: '',
        highlight: '',
    });
    const [photos, setPhotos] = useState<string[]>([]);
    const [backgroundImage, setBackgroundImage] = useState<string>('');
    const [linkedBlogs, setLinkedBlogs] = useState<string[]>([]);
    const [linkedCompetitions, setLinkedCompetitions] = useState<string[]>([]);
    const [availableBlogs, setAvailableBlogs] = useState<Array<{ id: string; title: string }>>([]);

    useEffect(() => {
        if (item) {
            setForm({
                year: item.year,
                title: item.title,
                description: item.description,
                highlight: item.highlight ?? '',
            });
            setPhotos(Array.isArray(item.photos) ? item.photos : []);
            setBackgroundImage(item.backgroundImage ?? '');
            setLinkedBlogs(Array.isArray(item.linkedBlogs) ? item.linkedBlogs : []);
            setLinkedCompetitions(Array.isArray(item.linkedCompetitions) ? item.linkedCompetitions : []);
        }
    }, [item]);

    useEffect(() => {
        const loadBlogs = async () => {
            if (!blogStorageKey) return;
            const stored = await AsyncStorage.getItem(blogStorageKey);
            if (!stored) return;
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    const list = parsed
                        .map((entry: any) => ({ id: String(entry.id), title: String(entry.title ?? 'Blog') }))
                        .filter((entry: any) => entry.title);
                    setAvailableBlogs(list);
                }
            } catch {
                // ignore
            }
        };
        loadBlogs();
    }, [blogStorageKey]);

    const saveItem = useCallback(async () => {
        const year = form.year.trim();
        const title = form.title.trim();
        const description = form.description.trim();
        if (!year || !title || !description) return;
        const stored = await AsyncStorage.getItem(storageKey);
        const list: TimelineEntry[] = stored ? JSON.parse(stored) : [];

        if (mode === 'edit' && item) {
            const updated = list.map((entry) =>
                entry.id === item.id
                    ? {
                        ...entry,
                        year,
                        title,
                        description,
                        highlight: form.highlight.trim(),
                        photos,
                        backgroundImage: backgroundImage || undefined,
                        linkedBlogs,
                        linkedCompetitions,
                    }
                    : entry,
            );
            await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
        } else {
            const next: TimelineEntry = {
                id: `tl-${Date.now()}`,
                year,
                title,
                description,
                highlight: form.highlight.trim(),
                photos,
                backgroundImage: backgroundImage || undefined,
                linkedBlogs,
                linkedCompetitions,
            };
            const updated = [...list, next].sort((a, b) => Number(a.year) - Number(b.year));
            await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
        }
        navigation.goBack();
    }, [form.description, form.highlight, form.title, form.year, item, linkedBlogs, linkedCompetitions, mode, navigation, photos, storageKey]);

    const deleteItem = useCallback(async () => {
        if (!item) return;
        const stored = await AsyncStorage.getItem(storageKey);
        const list: TimelineEntry[] = stored ? JSON.parse(stored) : [];
        const updated = list.filter((entry) => entry.id !== item.id);
        await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
        navigation.goBack();
    }, [item, navigation, storageKey]);

    const addPhotos = useCallback(async () => {
        const res = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 6,
            quality: 0.9,
        });
        if (res.didCancel || !res.assets) return;
        const uris = res.assets.map((asset) => asset.uri).filter(Boolean) as string[];
        if (uris.length === 0) return;
        setPhotos((prev) => [...prev, ...uris]);
    }, []);

    const pickBackground = useCallback(async () => {
        const res = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            quality: 0.9,
        });
        if (res.didCancel || !res.assets) return;
        const uri = res.assets[0]?.uri;
        if (!uri) return;
        setBackgroundImage(uri);
    }, []);

    const clearBackground = useCallback(() => {
        setBackgroundImage('');
    }, []);

    const removePhoto = useCallback((uri: string) => {
        setPhotos((prev) => prev.filter((item) => item !== uri));
    }, []);

    const toggleBlog = useCallback((title: string) => {
        setLinkedBlogs((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));
    }, []);

    const toggleCompetition = useCallback((title: string) => {
        setLinkedCompetitions((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));
    }, []);

    const blogChoices = useMemo(() => availableBlogs.map((b) => b.title), [availableBlogs]);
    const competitionChoices = useMemo(() => competitionOptions, [competitionOptions]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>
                    {mode === 'edit' ? 'Edit milestone' : 'Add milestone'}
                </Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView contentContainerStyle={Styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>Year</Text>
                    <TextInput
                        style={Styles.fieldInput}
                        placeholder="2026"
                        placeholderTextColor="#9B9F9F"
                        value={form.year}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, year: text }))}
                    />
                </View>
                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>Title</Text>
                    <TextInput
                        style={Styles.fieldInput}
                        placeholder="Qualified for nationals"
                        placeholderTextColor="#9B9F9F"
                        value={form.title}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, title: text }))}
                    />
                </View>
                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>Description</Text>
                    <TextInput
                        style={[Styles.fieldInput, Styles.fieldTextarea]}
                        placeholder="Share the highlight and what it meant."
                        placeholderTextColor="#9B9F9F"
                        value={form.description}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
                        multiline
                    />
                </View>
                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>Highlight (optional)</Text>
                    <TextInput
                        style={Styles.fieldInput}
                        placeholder="PB 1:54.30"
                        placeholderTextColor="#9B9F9F"
                        value={form.highlight}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, highlight: text }))}
                    />
                </View>

                <View style={Styles.fieldBlock}>
                    <View style={Styles.inlineHeader}>
                        <Text style={Styles.fieldLabel}>Timeline background</Text>
                        <TouchableOpacity style={Styles.inlineAction} onPress={pickBackground}>
                            <Text style={Styles.inlineActionText}>Select image</Text>
                        </TouchableOpacity>
                    </View>
                    {!backgroundImage ? (
                        <Text style={Styles.helperText}>Pick one image to show as the timeline card background.</Text>
                    ) : (
                        <View style={Styles.backgroundPreviewRow}>
                            <Image source={{ uri: backgroundImage }} style={Styles.backgroundPreview} />
                            <TouchableOpacity style={Styles.inlineAction} onPress={clearBackground}>
                                <Text style={Styles.inlineActionText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={Styles.fieldBlock}>
                    <View style={Styles.inlineHeader}>
                        <Text style={Styles.fieldLabel}>Milestone photos</Text>
                        <TouchableOpacity style={Styles.inlineAction} onPress={addPhotos}>
                            <Text style={Styles.inlineActionText}>Add photos</Text>
                        </TouchableOpacity>
                    </View>
                    {photos.length === 0 ? (
                        <Text style={Styles.helperText}>Add up to 6 photos to show this milestone.</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={Styles.photoRow}>
                            {photos.map((uri) => (
                                <TouchableOpacity key={uri} onPress={() => removePhoto(uri)}>
                                    <Image source={{ uri }} style={Styles.photoThumb} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>Link blogs</Text>
                    {blogChoices.length === 0 ? (
                        <Text style={Styles.helperText}>Create a blog to link it here.</Text>
                    ) : (
                        <View style={Styles.choiceRow}>
                            {blogChoices.map((title) => {
                                const active = linkedBlogs.includes(title);
                                return (
                                    <TouchableOpacity
                                        key={title}
                                        style={[Styles.choiceChip, active && Styles.choiceChipActive]}
                                        onPress={() => toggleBlog(title)}
                                    >
                                        <Text style={[Styles.choiceChipText, active && Styles.choiceChipTextActive]}>{title}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={Styles.fieldBlock}>
                    <Text style={Styles.fieldLabel}>Link competitions</Text>
                    {competitionChoices.length === 0 ? (
                        <Text style={Styles.helperText}>Subscribe to a competition to link it here.</Text>
                    ) : (
                        <View style={Styles.choiceRow}>
                            {competitionChoices.map((title) => {
                                const active = linkedCompetitions.includes(title);
                                return (
                                    <TouchableOpacity
                                        key={title}
                                        style={[Styles.choiceChip, active && Styles.choiceChipActive]}
                                        onPress={() => toggleCompetition(title)}
                                    >
                                        <Text style={[Styles.choiceChipText, active && Styles.choiceChipTextActive]}>{title}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={Styles.actionRow}>
                    <TouchableOpacity style={Styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={Styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.saveButton} onPress={saveItem}>
                        <Text style={Styles.saveText}>Save</Text>
                    </TouchableOpacity>
                </View>

                {mode === 'edit' && item ? (
                    <TouchableOpacity style={Styles.deleteButton} onPress={deleteItem}>
                        <Trash size={16} color="#ED5454" variant="Linear" />
                        <Text style={Styles.deleteText}>Delete milestone</Text>
                    </TouchableOpacity>
                ) : null}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 16 : 32} />
            </ScrollView>
        </View>
    );
};

export default ProfileTimelineEditScreen;
