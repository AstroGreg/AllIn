import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft2, Export, Subtitle, Edit2, ArrowRight } from 'iconsax-react-nativejs'
import Colors from '../../constants/Colors'
import SizeBox from '../../constants/SizeBox'
import Styles from './CreateNewPostStyles'

const CreateNewPostScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');

    const handleCreatePost = () => {
        // Handle create post logic here
        navigation.goBack();
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Create New Post</Text>
                <View style={Styles.headerButtonPlaceholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Section Title */}
                <Text style={Styles.sectionTitle}>Create New Post</Text>

                <SizeBox height={16} />

                {/* Upload Photo */}
                <View style={Styles.inputContainer}>
                    <Text style={Styles.inputLabel}>Upload Photo</Text>
                    <SizeBox height={8} />
                    <TouchableOpacity style={Styles.uploadContainer}>
                        <Export size={24} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox height={4} />
                        <Text style={Styles.uploadText}>Drag and Drop here</Text>
                        <Text style={Styles.uploadOrText}>or</Text>
                        <TouchableOpacity style={Styles.browseButton}>
                            <Text style={Styles.browseButtonText}>Browse Files</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>

                <SizeBox height={24} />

                {/* Title Input */}
                <View style={Styles.inputContainer}>
                    <Text style={Styles.inputLabel}>Title</Text>
                    <SizeBox height={8} />
                    <View style={Styles.textInputContainer}>
                        <Subtitle size={16} color="#777777" variant="Linear" />
                        <TextInput
                            style={Styles.textInput}
                            placeholder="Enter title"
                            placeholderTextColor="#777777"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Summary Input */}
                <View style={Styles.inputContainer}>
                    <Text style={Styles.inputLabel}>Summary</Text>
                    <SizeBox height={8} />
                    <View style={Styles.textAreaContainer}>
                        <Edit2 size={16} color="#777777" variant="Linear" />
                        <TextInput
                            style={Styles.textArea}
                            placeholder="Write Something......"
                            placeholderTextColor="#777777"
                            value={summary}
                            onChangeText={setSummary}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Description Input */}
                <View style={Styles.inputContainer}>
                    <Text style={Styles.inputLabel}>Description</Text>
                    <SizeBox height={8} />
                    <View style={Styles.textAreaContainer}>
                        <Edit2 size={16} color="#777777" variant="Linear" />
                        <TextInput
                            style={Styles.textArea}
                            placeholder="Write Something......"
                            placeholderTextColor="#777777"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <SizeBox height={30} />

                {/* Bottom Buttons */}
                <View style={Styles.buttonsContainer}>
                    <TouchableOpacity style={Styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={Styles.cancelButtonText}>Cancel</Text>
                        <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.createButton} onPress={handleCreatePost}>
                        <Text style={Styles.createButtonText}>Create New Post</Text>
                        <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default CreateNewPostScreen
