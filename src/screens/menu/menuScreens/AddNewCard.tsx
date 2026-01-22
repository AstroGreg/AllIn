import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native'
import React, { useState } from 'react'
import Styles from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../../../constants/Colors'
import { ArrowLeft2, Notification, Cards, User, Card, Calendar, Note, ArrowRight2, ArrowDown2 } from 'iconsax-react-nativejs'

const cardTypes = ['Bancontact', 'Maestro', 'Master'];

const AddNewCard = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const [cardType, setCardType] = useState('');
    const [showCardTypeModal, setShowCardTypeModal] = useState(false);
    const [name, setName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expDate, setExpDate] = useState('');
    const [cvv, setCvv] = useState('');

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Add Card</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.sectionTitle}>Add New Card</Text>
                <SizeBox height={16} />

                {/* Card Type */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>Card Type</Text>
                    <SizeBox height={8} />
                    <TouchableOpacity style={Styles.addCardInputContainer} onPress={() => setShowCardTypeModal(true)}>
                        <Cards size={16} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <Text style={[Styles.addCardPlaceholder, cardType && Styles.addCardInputText]}>
                            {cardType || 'Select Card type'}
                        </Text>
                        <ArrowDown2 size={20} color="#777777" variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={24} />

                {/* Name on Card */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>Name on Card</Text>
                    <SizeBox height={8} />
                    <View style={Styles.addCardInputContainer}>
                        <User size={16} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.addCardInput}
                            placeholder="Enter Card Holder Name"
                            placeholderTextColor="#777777"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Card Number */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>Card Number</Text>
                    <SizeBox height={8} />
                    <View style={Styles.addCardInputContainer}>
                        <Card size={16} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.addCardInput}
                            placeholder="Enter Card Number"
                            placeholderTextColor="#777777"
                            value={cardNumber}
                            onChangeText={setCardNumber}
                            keyboardType="numeric"
                            maxLength={16}
                        />
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Expiry Date */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>Expiry Date</Text>
                    <SizeBox height={8} />
                    <View style={Styles.addCardInputContainer}>
                        <Calendar size={16} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.addCardInput}
                            placeholder="Enter Expiry Date"
                            placeholderTextColor="#777777"
                            value={expDate}
                            onChangeText={setExpDate}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <SizeBox height={24} />

                {/* CVV */}
                <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>CVV</Text>
                    <SizeBox height={8} />
                    <View style={Styles.addCardInputContainer}>
                        <Note size={16} color={Colors.primaryColor} variant="Linear" />
                        <SizeBox width={10} />
                        <TextInput
                            style={Styles.addCardInput}
                            placeholder="Enter CVV"
                            placeholderTextColor="#777777"
                            value={cvv}
                            onChangeText={setCvv}
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry
                        />
                    </View>
                </View>

                <SizeBox height={30} />

                {/* Continue Button */}
                <TouchableOpacity style={Styles.continueBtn} onPress={() => navigation.goBack()}>
                    <Text style={Styles.continueBtnText}>Continue</Text>
                    <ArrowRight2 size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={24} />

                {/* Cancel Button */}
                <TouchableOpacity style={Styles.cancelBtn} onPress={() => navigation.goBack()}>
                    <Text style={Styles.cancelBtnText}>Cancel</Text>
                    <ArrowRight2 size={18} color={Colors.subTextColor} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            {/* Card Type Selection Modal */}
            <Modal
                visible={showCardTypeModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCardTypeModal(false)}
            >
                <TouchableOpacity
                    style={Styles.cardTypeModalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCardTypeModal(false)}
                >
                    <View style={Styles.cardTypeModalContent}>
                        <Text style={Styles.cardTypeModalTitle}>Select Card Type</Text>
                        <SizeBox height={16} />
                        {cardTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    Styles.cardTypeOption,
                                    cardType === type && Styles.cardTypeOptionSelected
                                ]}
                                onPress={() => {
                                    setCardType(type);
                                    setShowCardTypeModal(false);
                                }}
                            >
                                <Text style={[
                                    Styles.cardTypeOptionText,
                                    cardType === type && Styles.cardTypeOptionTextSelected
                                ]}>
                                    {type}
                                </Text>
                                {cardType === type && (
                                    <View style={Styles.cardTypeCheckmark} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default AddNewCard
