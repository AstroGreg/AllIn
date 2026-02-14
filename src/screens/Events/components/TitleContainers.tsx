import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from '../EventsStyles';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface TitleContainersProps {
    title?: string;
    onActionPress?: any;
}

const TitleContainers = ({ title, onActionPress }: TitleContainersProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    return (
        <View style={[Styles.rowCenter, { paddingHorizontal: 20 }]}>
            <Text style={Styles.titleText}>{title}</Text>
            <TouchableOpacity onPress={onActionPress}>
                <Text style={Styles.actionText}>{t('View all')}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default TitleContainers
