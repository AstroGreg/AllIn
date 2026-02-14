import { View, Text } from 'react-native'
import React from 'react'
import { createStyles } from '../HomeStyles'
import Icons from '../../../constants/Icons'
import SizeBox from '../../../constants/SizeBox'
import StatusContainer from '../../../components/statusContainer/StatusContainer';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface RequestContainersProps {
    title?: string;
    date?: string;
    time?: string;
    status?: string;
    isFixed?: boolean;
}

const RequestContainers = ({
    title,
    date,
    time,
    status,
    isFixed
}: RequestContainersProps) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);

    return (
        <View style={styles.requestContainer}>
            <View style={styles.iconContainer}>
                <Icons.ReceiptEdit height={22} width={22} />
            </View>
            <SizeBox width={12} />
            <View style={{}}>
                <Text style={styles.eventTitle} numberOfLines={1}>{title}</Text>
                <SizeBox height={6} />
                <View style={styles.rowCenter}>
                    <View style={styles.rowCenter}>
                        <Icons.CalendarGrey height={12} width={12} />
                        <SizeBox width={2} />
                        <Text style={styles.requestSubText}>{date}</Text>
                    </View>
                    <View style={styles.dot} />
                    <View style={styles.rowCenter}>
                        <Icons.Timer height={12} width={12} />
                        <SizeBox width={2} />
                        <Text style={styles.requestSubText}>{time}</Text>
                    </View>
                    <View style={styles.dot} />
                    <View style={styles.rowCenter}>
                        <Icons.Edit height={12} width={12} />
                        <SizeBox width={2} />
                        <Text style={styles.requestSubText}>{t('Edit')}</Text>
                    </View>
                </View>
            </View>
            <StatusContainer text={status} isFixed={isFixed} />
        </View>
    )
}

export default RequestContainers
