import { View, Text } from 'react-native'
import React from 'react'
import Styles from '../HomeStyles'
import Icons from '../../../constants/Icons'
import SizeBox from '../../../constants/SizeBox'
import StatusContainer from '../../../components/statusContainer/StatusContainer';

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
    return (
        <View style={Styles.requestContainer}>
            <View style={Styles.iconContainer}>
                <Icons.ReceiptEdit height={22} width={22} />
            </View>
            <SizeBox width={12} />
            <View style={{}}>
                <Text style={Styles.eventTitle} numberOfLines={1}>{title}</Text>
                <SizeBox height={6} />
                <View style={Styles.rowCenter}>
                    <View style={Styles.rowCenter}>
                        <Icons.CalendarGrey height={12} width={12} />
                        <SizeBox width={2} />
                        <Text style={Styles.requestSubText}>{date}</Text>
                    </View>
                    <View style={Styles.dot} />
                    <View style={Styles.rowCenter}>
                        <Icons.Timer height={12} width={12} />
                        <SizeBox width={2} />
                        <Text style={Styles.requestSubText}>{time}</Text>
                    </View>
                    <View style={Styles.dot} />
                    <View style={Styles.rowCenter}>
                        <Icons.Edit height={12} width={12} />
                        <SizeBox width={2} />
                        <Text style={Styles.requestSubText}>Edit</Text>
                    </View>
                </View>
            </View>
            <StatusContainer text={status} isFixed={isFixed} />
        </View>
    )
}

export default RequestContainers