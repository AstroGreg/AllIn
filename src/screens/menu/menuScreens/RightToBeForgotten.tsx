import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import Icons from '../../../constants/Icons';
import {
    ArrowLeft2,
    Notification,
    Gallery,
    ArrowDown,
    Data,
    DocumentDownload,
    Coin,
    Trash,
} from 'iconsax-react-nativejs';
import { createStyles } from './RightToBeForgottenStyles';
import { useTranslation } from 'react-i18next'

interface DataItem {
    id: number;
    label: string;
    value: string;
}

interface DataCategory {
    id: number;
    title: string;
    subtitle: string;
    markedCount: number;
    icon: 'athletic' | 'data';
    isExpanded?: boolean;
    items?: DataItem[];
}

const athleticProfileItems: DataItem[] = [
    { id: 1, label: 'Full Name', value: 'James Michael Richardson' },
    { id: 2, label: 'Full Name', value: 'James Michael Richardson' },
    { id: 3, label: 'Full Name', value: 'James Michael Richardson' },
    { id: 4, label: 'Full Name', value: 'James Michael Richardson' },
    { id: 5, label: 'Full Name', value: 'James Michael Richardson' },
    { id: 6, label: 'Full Name', value: 'James Michael Richardson' },
    { id: 7, label: 'Full Name', value: 'James Michael Richardson' },
];

const RightToBeForgotten = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const dataCategories: DataCategory[] = [
        {
            id: 1,
            title: 'Athletic Profile Information',
            subtitle: '7 item-3 MB- Created Jan 20 2026',
            markedCount: 11,
            icon: 'athletic',
            isExpanded: true,
            items: athleticProfileItems,
        },
        {
            id: 2,
            title: 'Performance & Training Data',
            subtitle: '7 item-3 MB - Created Jan 20 2026',
            markedCount: 11,
            icon: 'data',
        },
        {
            id: 3,
            title: 'Health & Biometric Data',
            subtitle: '7 item-3 MB - Created Jan 20 2026',
            markedCount: 11,
            icon: 'data',
        },
        {
            id: 4,
            title: 'Connected Devices & Wearables',
            subtitle: '7 item-3 MB - Created Jan 20 2026',
            markedCount: 11,
            icon: 'data',
        },
        {
            id: 5,
            title: 'Coach Communications & Plans',
            subtitle: '7 item-3 MB - Created Jan 20 2026',
            markedCount: 11,
            icon: 'data',
        },
        {
            id: 6,
            title: 'Social & Competition Activity',
            subtitle: '7 item-3 MB - Created Jan 20 2026',
            markedCount: 11,
            icon: 'data',
        },
        {
            id: 7,
            title: 'Sponsorship & Partnership Data',
            subtitle: '7 item-3 MB - Created Jan 20 2026',
            markedCount: 11,
            icon: 'data',
        },
    ];

    const renderDataItem = (item: DataItem) => {
        return (
            <View key={item.id} style={styles.dataItemCard}>
                <View style={styles.dataItemContent}>
                    <Text style={styles.dataItemLabel}>{item.label}</Text>
                    <Text style={styles.dataItemValue}>{item.value}</Text>
                </View>
                <Trash size={16} color="#ED5454" variant="Linear" />
            </View>
        );
    };

    const renderExpandedCategory = (category: DataCategory) => {
        return (
            <View key={category.id} style={styles.expandedCategoryContainer}>
                {/* Category Header */}
                <View style={styles.expandedCategoryCard}>
                    <View style={styles.categoryHeader}>
                        <View style={styles.categoryIconContainer}>
                            {category.icon === 'athletic' ? (
                                <Icons.AthleteBlue width={24} height={24} />
                            ) : (
                                <Data size={24} color={colors.primaryColor} variant="Linear" />
                            )}
                        </View>
                        <View style={styles.categoryInfo}>
                            <Text style={styles.categoryTitle}>{category.title}</Text>
                            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                        </View>
                    </View>
                    <View style={styles.categoryRight}>
                        {category.markedCount > 0 && (
                            <Text style={styles.markedText}>{category.markedCount} marked</Text>
                        )}
                        <ArrowDown size={16} color={colors.primaryColor} variant="Linear" />
                    </View>
                </View>

                {/* Data Items */}
                <View style={styles.dataItemsContainer}>
                    {category.items?.map(renderDataItem)}

                    {/* Delete Button */}
                    <TouchableOpacity style={styles.deleteButton}>
                        <Trash size={24} color="#ED5454" variant="Linear" />
                        <Text style={styles.deleteButtonText}>Delete Entire {category.title}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderCollapsedCategory = (category: DataCategory) => {
        return (
            <View key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                    <View style={styles.categoryIconContainer}>
                        {category.icon === 'athletic' ? (
                            <Icons.AthleteBlue width={24} height={24} />
                        ) : (
                            <Data size={24} color={colors.primaryColor} variant="Linear" />
                        )}
                    </View>
                    <View style={styles.categoryInfo}>
                        <Text style={styles.categoryTitle}>{category.title}</Text>
                        <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                    </View>
                </View>
                <View style={styles.categoryRight}>
                    {category.markedCount > 0 && (
                        <Text style={styles.markedText}>{category.markedCount} marked</Text>
                    )}
                    <ArrowDown size={16} color={colors.primaryColor} variant="Linear" />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Right to be forgotten')}</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
                <SizeBox height={24} />

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <View style={styles.infoIconContainer}>
                            <Gallery size={24} color={colors.primaryColor} variant="Linear" />
                        </View>
                        <Text style={styles.infoTitle}>{t('Your Athletic Data Rights')}</Text>
                    </View>
                    <Text style={styles.infoDescription}>
                        Under GDPR and data protection laws, you have the right to access, reviews, and permanently delete your personal athletic data. Select any data you wish to delete below.
                    </Text>
                </View>

                <SizeBox height={16} />

                {/* Stats Grid */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>{t('Total Data Size')}</Text>
                        <Text style={styles.statValue}>{t('75.5 MB')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>{t('Data Categories')}</Text>
                        <Text style={styles.statValue}>7</Text>
                    </View>
                </View>
                <SizeBox height={16} />
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>{t('Total Records')}</Text>
                        <Text style={styles.statValue}>37</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>{t('Data Last Updated')}</Text>
                        <Text style={styles.statValue}>{t('Jan 21, 2025')}</Text>
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Data Categories */}
                {dataCategories.map((category) =>
                    category.isExpanded
                        ? renderExpandedCategory(category)
                        : renderCollapsedCategory(category)
                )}

                <SizeBox height={24} />

                {/* Bottom Buttons */}
                <TouchableOpacity style={styles.downloadButton}>
                    <DocumentDownload size={24} color={colors.pureWhite} variant="Linear" />
                    <Text style={styles.downloadButtonText}>{t('Download My Athletic Data')}</Text>
                </TouchableOpacity>

                <SizeBox height={16} />

                <TouchableOpacity style={styles.exportButton}>
                    <Coin size={24} color={colors.grayColor} variant="Linear" />
                    <Text style={styles.exportButtonText}>{t('Export as CSV')}</Text>
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default RightToBeForgotten;