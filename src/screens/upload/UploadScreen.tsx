import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { createStyles } from './UploadStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Icons from '../../constants/Icons'
import Images from '../../constants/Images'
import { useTheme } from '../../context/ThemeContext'
import { Camera, Add } from 'iconsax-react-nativejs'

interface Account {
    id: number;
    name: string;
    sport: string;
    avatar: any;
}

const UploadScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    const accounts: Account[] = [
        { id: 1, name: 'James Ray', sport: 'Boxing', avatar: Images.profile1 },
        { id: 2, name: 'James Ray 2', sport: 'Running', avatar: Images.profile1 },
    ];

    const handleSelectAccount = (account: Account) => {
        navigation.navigate('SelectCompetitionScreen', { account });
    };

    const handleCreatePhotographerAccount = () => {
        // Navigate to create photographer account screen
        navigation.navigate('CreatePhotographerAccount');
    };

    const handleUploadAnonymously = () => {
        navigation.navigate('UploadAnonymouslyScreen');
    };

    const renderAccountCard = (account: Account) => (
        <View key={account.id} style={Styles.accountCard}>
            <View style={Styles.accountInfo}>
                <View style={Styles.avatarContainer}>
                    <FastImage source={account.avatar} style={Styles.avatar} resizeMode="cover" />
                </View>
                <View style={Styles.accountDetails}>
                    <Text style={Styles.accountName}>{account.name}</Text>
                    <View style={Styles.sportRow}>
                        <Camera size={16} color="#9B9F9F" variant="Linear" />
                        <Text style={Styles.sportText}>{account.sport}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={Styles.selectButton}
                onPress={() => handleSelectAccount(account)}
            >
                <Text style={Styles.selectButtonText}>Select</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <Text style={Styles.headerTitle}>Upload</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={Styles.scrollContent}
            >
                {/* Tip Card */}
                <View style={Styles.tipCard}>
                    <Icons.LightbulbColorful width={90} height={90} />
                    <SizeBox height={14} />
                    <Text style={Styles.tipText}>Select account you would like to use</Text>
                </View>

                <SizeBox height={16} />

                {/* Account Cards */}
                {accounts.map(renderAccountCard)}

                <SizeBox height={16} />

                {/* Create Photographer Account Button */}
                <TouchableOpacity
                    style={Styles.createAccountButton}
                    onPress={handleCreatePhotographerAccount}
                >
                    <Text style={Styles.createAccountButtonText}>Create Photographer Account</Text>
                    <Add size={18} color="#FFFFFF" variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={14} />

                {/* Upload Anonymously Button */}
                <TouchableOpacity
                    style={Styles.anonymousButton}
                    onPress={handleUploadAnonymously}
                >
                    <Text style={Styles.anonymousButtonText}>Upload Anonymously</Text>
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default UploadScreen;
