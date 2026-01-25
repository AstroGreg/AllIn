import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useState, useRef } from 'react'
import Styles from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icons from '../../../constants/Icons'
import FastImage from 'react-native-fast-image'
import Colors from '../../../constants/Colors'
import { ArrowLeft2, Notification, Bank, MoneyRecive } from 'iconsax-react-nativejs'

interface BankCard {
    id: number;
    bankName: string;
    cardHolder: string;
    cardNumber: string;
}

const PaymentMethod = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [selectedAmount, setSelectedAmount] = useState('€5');
    const [customAmount, setCustomAmount] = useState('');
    const [selectedCard, setSelectedCard] = useState(1);
    const customInputRef = useRef<TextInput>(null);

    const amounts = ['€5', '€10', '€15'];

    const bankCards: BankCard[] = [
        { id: 1, bankName: 'Dutch Bangla Bank', cardHolder: 'James Ray', cardNumber: '**** **** **** 4532' },
        { id: 2, bankName: 'Dutch Bangla Bank', cardHolder: 'James Ray', cardNumber: '**** **** **** 4532' },
    ];

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Payment method</Text>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.navigate('NotificationsScreen')}>
                    <Notification size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                {/* Payment Methods Header */}
                <View style={Styles.paymentHeader}>
                    <Text style={Styles.sectionTitle}>Payment Methods</Text>
                    <TouchableOpacity activeOpacity={0.7} style={Styles.addCardBtn} onPress={() => navigation.navigate('AddNewCard')}>
                        <Text style={Styles.addCardText}>Add new card</Text>
                        <Icons.AddGrey height={18} width={18} />
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                {/* Wallet Balance Card */}
                <View style={Styles.walletCard}>
                    <View>
                        <Text style={Styles.walletLabel}>Current Wallet Balance</Text>
                        <SizeBox height={8} />
                        <Text style={Styles.walletBalance}>€72.50</Text>
                    </View>
                    <MoneyRecive size={30} color={Colors.primaryColor} variant="Bold" />
                </View>

                <SizeBox height={24} />

                {/* Amount Selection */}
                <View style={Styles.amountRow}>
                    {amounts.map((amount) => (
                        <TouchableOpacity
                            key={amount}
                            style={[
                                Styles.amountBtn,
                                selectedAmount === amount && Styles.amountBtnSelected
                            ]}
                            onPress={() => {
                                setSelectedAmount(amount);
                                setCustomAmount('');
                            }}
                        >
                            <Text style={Styles.amountText}>{amount}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={[
                            Styles.amountBtn,
                            selectedAmount === 'Custom' && Styles.amountBtnSelected
                        ]}
                        onPress={() => {
                            setSelectedAmount('Custom');
                            setTimeout(() => customInputRef.current?.focus(), 100);
                        }}
                    >
                        {selectedAmount === 'Custom' ? (
                            <TextInput
                                ref={customInputRef}
                                style={Styles.customAmountInput}
                                placeholder="€"
                                placeholderTextColor="#777777"
                                keyboardType="numeric"
                                value={customAmount}
                                onChangeText={setCustomAmount}
                            />
                        ) : (
                            <Text style={Styles.amountText}>Custom</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <SizeBox height={24} />

                {/* Payconiq Card */}
                <View style={Styles.paymentCard}>
                    <View style={Styles.paymentCardLeft}>
                        <FastImage source={Icons.PaycoinqBancontact} style={Styles.payconiqIcon} resizeMode="contain" />
                        <Text style={Styles.paymentCardText}>Pay with Payconiq Card</Text>
                    </View>
                    <TouchableOpacity style={Styles.payNowBtnOutline}>
                        <Text style={Styles.payNowTextGrey}>Pay Now</Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={24} />

                {/* Bank Cards */}
                {bankCards.map((card) => (
                    <React.Fragment key={card.id}>
                        <View style={Styles.bankCard}>
                            <View style={Styles.bankCardLeft}>
                                <View style={Styles.bankIconContainer}>
                                    <Bank size={24} color={Colors.primaryColor} variant="Bold" />
                                </View>
                                <SizeBox width={10} />
                                <View style={Styles.bankCardInfo}>
                                    <Text style={Styles.bankName}>{card.bankName}</Text>
                                    <Text style={Styles.cardHolderText}>
                                        Cardholder: <Text style={Styles.cardHolderName}>{card.cardHolder}</Text>
                                    </Text>
                                    <Text style={Styles.cardNumber}>{card.cardNumber}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[
                                    selectedCard === card.id ? Styles.payNowBtn : Styles.payNowBtnOutline
                                ]}
                                onPress={() => setSelectedCard(card.id)}
                            >
                                <Text style={selectedCard === card.id ? Styles.payNowText : Styles.payNowTextGrey}>
                                    Pay Now
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={24} />
                    </React.Fragment>
                ))}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default PaymentMethod
