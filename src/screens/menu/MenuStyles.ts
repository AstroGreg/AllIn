import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DEDEDE',
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    searchContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        zIndex: 1,
    },
    map: {
        flex: 1,
    },
    container: {
        paddingHorizontal: 20
    },
    sectionTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    socialIcon: {
        width: 22,
        height: 22,
    },
    socialLinksCard: {
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    socialLinkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
    },
    socialLinkText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        flex: 1,
        marginLeft: 12,
    },
    socialLinkDivider: {
        height: 0.5,
        backgroundColor: Colors.lightGrayColor,
        marginVertical: 12,
    },
    connectedLinkContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        gap: 6,
    },
    socialLinkPlatform: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    socialLinkUrl: {
        ...Fonts.regular14,
        color: Colors.primaryColor,
    },
    icons: {
        height: 22,
        width: 22
    },
    titlesText: {
        ...Fonts.regular14,
        fontWeight: '400',
        color: Colors.mainTextColor
    },
    talentContainer: {
        borderRadius: 10,
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
    },
    containerTitle: {
        ...Fonts.regular16,
        color: Colors.mainTextColor,
        fontWeight: '500',
    },
    talentList: {
        marginLeft: 12
    },
    talentTypeTitle: {
        ...Fonts.regular12,
        color: Colors.subTextColor,
        fontWeight: '400',
    },
    separator: {
        height: 0.5,
        backgroundColor: Colors.lightGrayColor,
    },
    selectionContainer: {
        height: 16,
        width: 16,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selected: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: Colors.primaryColor
    },
    socialLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    borderBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        position: 'absolute',
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    btnText: {
        textAlign: 'center',
        ...Fonts.regular12,
        color: Colors.subTextColor
    },

    //Menu container
    menuContainer: {
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 16
    },
    iconCont: {
        height: 40,
        width: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.secondaryBlueColor,
    },
    nextArrow: {
        position: 'absolute',
        right: 12
    },
    pauseContent: {
        flex: 1,
        paddingRight: 30,
    },
    pauseDescription: {
        ...Fonts.regular12,
        color: '#9B9F9F',
        marginTop: 4,
        lineHeight: 18,
    },

    //Payment
    paymentIcons: {
        height: 24,
        width: 40
    },

    //Add Card TextInput Container
    textInputContainer: {

    },
    textInput: {
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.subTextColor,
        paddingVertical: 5,
        marginTop: 6,
        ...Fonts.regular16,
        color: Colors.mainTextColor,
    },

    // Profile Settings
    profilePicContainer: {
        height: 90,
        width: 90,
        borderRadius: 45,
        alignSelf: 'center'
    },
    profileImg: {
        height: '100%',
        width: '100%',
        borderRadius: 45,
    },
    editIcon: {
        position: 'absolute',
        zIndex: 1,
        bottom: 0,
        right: 5
    },
    profileLabel: {
        ...Fonts.regular14,
        color: Colors.subTextColor
    },
    linksIcon: {
        height: 20,
        width: 20
    },

    // modal
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContaint: {
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 16,
        backgroundColor: Colors.whiteColor,
    },
    noBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor
    },
    noText: {
        textAlign: 'center',
        ...Fonts.regular12,
        color: Colors.subTextColor
    },
    yesBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: Colors.primaryColor
    },
    yesText: {
        textAlign: 'center',
        ...Fonts.regular12,
        color: Colors.whiteColor
    },

    // Privacy Settings
    privacyCard: {
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
    },
    privacyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    privacyIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.secondaryBlueColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    privacyTitle: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        flex: 1,
    },
    privacySwitch: {
        marginLeft: 'auto',
    },
    privacySubtitle: {
        ...Fonts.regular12,
        color: '#777777',
        marginLeft: 56,
    },
    privacyDescription: {
        ...Fonts.regular12,
        color: '#9B9F9F',
        marginLeft: 56,
        lineHeight: 18,
    },
    switchTrack: {
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    switchTrackActive: {
        backgroundColor: Colors.primaryColor,
    },
    switchThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.whiteColor,
    },
    switchThumbActive: {
        alignSelf: 'flex-end',
    },

    // Location
    locationInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    locationInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },

    // Help
    helpCard: {
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
    },
    helpRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    helpIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.secondaryBlueColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpContent: {
        flex: 1,
        gap: 8,
    },
    helpLabel: {
        ...Fonts.regular14,
        color: Colors.subTextColor,
    },
    helpValue: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    helpDivider: {
        height: 0.5,
        backgroundColor: Colors.lightGrayColor,
    },

    // Terms of Service
    termsSection: {
        marginBottom: 0,
    },
    termsSectionTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    termsText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        lineHeight: 22,
    },
    termsLink: {
        ...Fonts.regular14,
        color: Colors.primaryColor,
        lineHeight: 22,
    },

    // Payment Method
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addCardBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
    },
    addCardText: {
        ...Fonts.regular14,
        color: Colors.subTextColor,
    },
    walletCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        backgroundColor: Colors.whiteColor,
    },
    walletLabel: {
        ...Fonts.regular12,
        color: Colors.subTextColor,
    },
    walletBalance: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    amountBtn: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        minWidth: 85,
        alignItems: 'center',
    },
    amountBtnSelected: {
        borderColor: Colors.primaryColor,
    },
    amountText: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    customAmountInput: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
        textAlign: 'center',
        padding: 0,
        minWidth: 50,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        backgroundColor: Colors.whiteColor,
    },
    paymentCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    payconiqIcon: {
        width: 34,
        height: 24,
        borderRadius: 6,
    },
    paymentCardText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    payNowBtn: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payNowBtnOutline: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        backgroundColor: Colors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payNowText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },
    payNowTextGrey: {
        ...Fonts.regular14,
        color: Colors.subTextColor,
    },
    bankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        backgroundColor: Colors.whiteColor,
    },
    bankCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    bankIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: 'rgba(60, 130, 246, 0.14)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bankCardInfo: {
        flex: 1,
        gap: 4,
    },
    bankName: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    cardHolderText: {
        ...Fonts.regular12,
        color: Colors.subTextColor,
    },
    cardHolderName: {
        color: Colors.mainTextColor,
    },
    cardNumber: {
        ...Fonts.regular12,
        color: Colors.subTextColor,
    },

    // Add New Card
    addCardInputGroup: {
        width: '100%',
    },
    addCardLabel: {
        ...Fonts.semibold14,
        color: Colors.mainTextColor,
    },
    addCardInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    addCardInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    addCardPlaceholder: {
        flex: 1,
        ...Fonts.regular14,
        color: '#777777',
    },
    addCardInputText: {
        color: Colors.mainTextColor,
    },
    continueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        height: 54,
        width: '100%',
    },
    continueBtnText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
    cancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 10,
        height: 54,
        width: '100%',
    },
    cancelBtnText: {
        ...Fonts.medium16,
        color: Colors.subTextColor,
    },

    // Card Type Modal
    cardTypeModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTypeModalContent: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 16,
        padding: 20,
        width: '85%',
    },
    cardTypeModalTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
        textAlign: 'center',
    },
    cardTypeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        marginBottom: 12,
    },
    cardTypeOptionSelected: {
        borderColor: Colors.primaryColor,
        backgroundColor: 'rgba(60, 130, 246, 0.05)',
    },
    cardTypeOptionText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    cardTypeOptionTextSelected: {
        color: Colors.primaryColor,
    },
    cardTypeCheckmark: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primaryColor,
    },

    // Subscription
    subscriptionTitle: {
        ...Fonts.semibold20,
        color: Colors.mainTextColor,
    },
    subscriptionTabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 4,
    },
    subscriptionTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    subscriptionActiveTab: {
        backgroundColor: Colors.primaryColor,
    },
    subscriptionTabText: {
        ...Fonts.medium14,
        color: '#9B9F9F',
    },
    subscriptionActiveTabText: {
        color: Colors.whiteColor,
    },
    planCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DEDEDE',
        padding: 20,
        marginBottom: 16,
    },
    popularPlanCard: {
        borderColor: Colors.primaryColor,
        borderWidth: 2,
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        right: 20,
        backgroundColor: Colors.primaryColor,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularBadgeText: {
        ...Fonts.medium12,
        color: Colors.whiteColor,
    },
    planName: {
        ...Fonts.semibold18,
        color: Colors.mainTextColor,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 8,
    },
    planPrice: {
        ...Fonts.bold28,
        color: Colors.mainTextColor,
    },
    planPeriod: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        marginLeft: 4,
    },
    planCredits: {
        ...Fonts.regular12,
        color: Colors.primaryColor,
        marginTop: 4,
    },
    featuresContainer: {
        marginTop: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureText: {
        ...Fonts.regular14,
        color: '#777777',
        marginLeft: 10,
        flex: 1,
    },
    getStartedButton: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    popularGetStartedButton: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },
    getStartedButtonText: {
        ...Fonts.medium14,
        color: Colors.primaryColor,
    },
    popularGetStartedButtonText: {
        color: Colors.whiteColor,
    },

    // Account Settings
    accountSettingsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        height: 70,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        backgroundColor: Colors.whiteColor,
    },
    accountSettingsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    accountSettingsIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.secondaryBlueColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    accountSettingsTitle: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        lineHeight: 22,
    },

    // Change Password
    changePasswordTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
        lineHeight: 26,
    },

    // Date Picker
    datePickerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.whiteColor,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DEDEDE',
    },
    datePickerCancel: {
        ...Fonts.medium16,
        color: '#9B9F9F',
    },
    datePickerDone: {
        ...Fonts.medium16,
        color: Colors.primaryColor,
    },
});

export default Styles;