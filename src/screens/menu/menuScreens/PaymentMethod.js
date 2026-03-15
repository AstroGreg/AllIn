import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import React, { useState, useRef } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icons from '../../../constants/Icons';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Notification, Bank, MoneyRecive } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next';
const PaymentMethod = ({ navigation, route }) => {
    var _a;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [selectedAmount, setSelectedAmount] = useState('€5');
    const [customAmount, setCustomAmount] = useState('');
    const [selectedCard, setSelectedCard] = useState(1);
    const customInputRef = useRef(null);
    const redirectTo = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.redirectTo;
    const amounts = ['€5', '€10', '€15'];
    const handlePayNow = () => {
        if (redirectTo) {
            navigation.navigate('BottomTabBar', { screen: 'Search', params: { screen: 'AISearchScreen' } });
            return;
        }
        navigation.goBack();
    };
    const bankCards = [
        { id: 1, bankName: 'Dutch Bangla Bank', cardHolder: 'James Ray', cardNumber: '**** **** **** 4532' },
        { id: 2, bankName: 'Dutch Bangla Bank', cardHolder: 'James Ray', cardNumber: '**** **** **** 4532' },
    ];
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Payment method') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.navigate('NotificationsScreen') }, { children: _jsx(Notification, { size: 24, color: colors.primaryColor, variant: "Linear" }) }))] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.paymentHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Payment Methods') })), _jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.7, style: Styles.addCardBtn, onPress: () => navigation.navigate('AddNewCard') }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardText }, { children: t('Add new card') })), _jsx(Icons.AddGrey, { height: 18, width: 18 })] }))] })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.walletCard }, { children: [_jsxs(View, { children: [_jsx(Text, Object.assign({ style: Styles.walletLabel }, { children: t('Current Wallet Balance') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.walletBalance }, { children: t('€72.50') }))] }), _jsx(MoneyRecive, { size: 30, color: colors.primaryColor, variant: "Bold" })] })), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.amountRow }, { children: [amounts.map((amount) => (_jsx(TouchableOpacity, Object.assign({ style: [
                                    Styles.amountBtn,
                                    selectedAmount === amount && Styles.amountBtnSelected
                                ], onPress: () => {
                                    setSelectedAmount(amount);
                                    setCustomAmount('');
                                } }, { children: _jsx(Text, Object.assign({ style: Styles.amountText }, { children: amount })) }), amount))), _jsx(TouchableOpacity, Object.assign({ style: [
                                    Styles.amountBtn,
                                    selectedAmount === 'Custom' && Styles.amountBtnSelected
                                ], onPress: () => {
                                    setSelectedAmount('Custom');
                                    setTimeout(() => { var _a; return (_a = customInputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }, 100);
                                } }, { children: selectedAmount === 'Custom' ? (_jsx(TextInput, { ref: customInputRef, style: Styles.customAmountInput, placeholder: t('€'), placeholderTextColor: colors.grayColor, keyboardType: "numeric", value: customAmount, onChangeText: setCustomAmount })) : (_jsx(Text, Object.assign({ style: Styles.amountText }, { children: t('Custom') }))) }))] })), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.paymentCard }, { children: [_jsxs(View, Object.assign({ style: Styles.paymentCardLeft }, { children: [_jsx(FastImage, { source: Icons.PaycoinqBancontact, style: Styles.payconiqIcon, resizeMode: "contain" }), _jsx(Text, Object.assign({ style: Styles.paymentCardText }, { children: t('Pay with Payconiq Card') }))] })), _jsx(TouchableOpacity, Object.assign({ style: Styles.payNowBtnOutline, onPress: handlePayNow }, { children: _jsx(Text, Object.assign({ style: Styles.payNowTextGrey }, { children: t('Pay Now') })) }))] })), _jsx(SizeBox, { height: 24 }), bankCards.map((card) => (_jsxs(React.Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.bankCard }, { children: [_jsxs(View, Object.assign({ style: Styles.bankCardLeft }, { children: [_jsx(View, Object.assign({ style: Styles.bankIconContainer }, { children: _jsx(Bank, { size: 24, color: colors.primaryColor, variant: "Bold" }) })), _jsx(SizeBox, { width: 10 }), _jsxs(View, Object.assign({ style: Styles.bankCardInfo }, { children: [_jsx(Text, Object.assign({ style: Styles.bankName }, { children: card.bankName })), _jsxs(Text, Object.assign({ style: Styles.cardHolderText }, { children: [t('Cardholder'), ": ", _jsx(Text, Object.assign({ style: Styles.cardHolderName }, { children: card.cardHolder }))] })), _jsx(Text, Object.assign({ style: Styles.cardNumber }, { children: card.cardNumber }))] }))] })), _jsx(TouchableOpacity, Object.assign({ style: [
                                            selectedCard === card.id ? Styles.payNowBtn : Styles.payNowBtnOutline
                                        ], onPress: () => {
                                            setSelectedCard(card.id);
                                            handlePayNow();
                                        } }, { children: _jsx(Text, Object.assign({ style: selectedCard === card.id ? Styles.payNowText : Styles.payNowTextGrey }, { children: t('Pay Now') })) }))] })), _jsx(SizeBox, { height: 24 })] }, card.id))), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default PaymentMethod;
