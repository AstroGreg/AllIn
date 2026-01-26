import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";
import { ThemeColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.lightGrayColor,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
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
        color: colors.mainTextColor,
    },
    socialIcon: {
        width: 22,
        height: 22,
    },
    socialLinksCard: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: colors.cardBackground,
    },
    socialLinkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
    },
    socialLinkText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
        flex: 1,
        marginLeft: 12,
    },
    socialLinkDivider: {
        height: 0.5,
        backgroundColor: colors.lightGrayColor,
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
        color: colors.mainTextColor,
    },
    socialLinkUrl: {
        ...Fonts.regular14,
        color: colors.primaryColor,
    },
    icons: {
        height: 22,
        width: 22
    },
    titlesText: {
        ...Fonts.regular14,
        fontWeight: '400',
        color: colors.mainTextColor
    },
    talentContainer: {
        borderRadius: 10,
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.cardBackground,
    },
    containerTitle: {
        ...Fonts.regular16,
        color: colors.mainTextColor,
        fontWeight: '500',
    },
    talentList: {
        marginLeft: 12
    },
    talentTypeTitle: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        fontWeight: '400',
    },
    separator: {
        height: 0.5,
        backgroundColor: colors.lightGrayColor,
    },
    selectionContainer: {
        height: 16,
        width: 16,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selected: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: colors.primaryColor
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
        borderColor: colors.lightGrayColor,
        position: 'absolute',
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    btnText: {
        textAlign: 'center',
        ...Fonts.regular12,
        color: colors.subTextColor
    },

    //Menu container
    menuContainer: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 16,
        backgroundColor: colors.cardBackground,
    },
    iconCont: {
        height: 40,
        width: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondaryBlueColor,
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
        color: colors.subTextColor,
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
        borderBottomColor: colors.subTextColor,
        paddingVertical: 5,
        marginTop: 6,
        ...Fonts.regular16,
        color: colors.mainTextColor,
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
        color: colors.subTextColor
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
        backgroundColor: colors.whiteColor,
    },
    noBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor
    },
    noText: {
        textAlign: 'center',
        ...Fonts.regular12,
        color: colors.subTextColor
    },
    yesBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: colors.primaryColor
    },
    yesText: {
        textAlign: 'center',
        ...Fonts.regular12,
        color: colors.pureWhite
    },

    // Privacy Settings
    privacyCard: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
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
        backgroundColor: colors.secondaryBlueColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    privacyTitle: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
        flex: 1,
    },
    privacySwitch: {
        marginLeft: 'auto',
    },
    privacySubtitle: {
        ...Fonts.regular12,
        color: colors.grayColor,
        marginLeft: 56,
    },
    privacyDescription: {
        ...Fonts.regular12,
        color: colors.subTextColor,
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
        backgroundColor: colors.primaryColor,
    },
    switchThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.whiteColor,
    },
    switchThumbActive: {
        alignSelf: 'flex-end',
    },

    // Location
    locationInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondaryColor,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    locationInput: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },

    // Help
    helpCard: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
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
        backgroundColor: colors.secondaryBlueColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpContent: {
        flex: 1,
        gap: 8,
    },
    helpLabel: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    helpValue: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    helpDivider: {
        height: 0.5,
        backgroundColor: colors.lightGrayColor,
    },

    // Terms of Service
    termsSection: {
        marginBottom: 0,
    },
    termsSectionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    termsText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
        lineHeight: 22,
    },
    termsLink: {
        ...Fonts.regular14,
        color: colors.primaryColor,
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
        borderColor: colors.lightGrayColor,
    },
    addCardText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    walletCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.whiteColor,
    },
    walletLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    walletBalance: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
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
        borderColor: colors.lightGrayColor,
        minWidth: 85,
        alignItems: 'center',
    },
    amountBtnSelected: {
        borderColor: colors.primaryColor,
    },
    amountText: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    customAmountInput: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
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
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.whiteColor,
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
        color: colors.mainTextColor,
    },
    payNowBtn: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payNowBtnOutline: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payNowText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
    payNowTextGrey: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    bankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.whiteColor,
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
        color: colors.mainTextColor,
    },
    cardHolderText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    cardHolderName: {
        color: colors.mainTextColor,
    },
    cardNumber: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },

    // Add New Card
    addCardInputGroup: {
        width: '100%',
    },
    addCardLabel: {
        ...Fonts.semibold14,
        color: colors.mainTextColor,
    },
    addCardInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondaryColor,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    addCardInput: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    addCardPlaceholder: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    addCardInputText: {
        color: colors.mainTextColor,
    },
    continueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        height: 54,
        width: '100%',
    },
    continueBtnText: {
        ...Fonts.medium16,
        color: colors.pureWhite,
    },
    cancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.whiteColor,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        height: 54,
        width: '100%',
    },
    cancelBtnText: {
        ...Fonts.medium16,
        color: colors.subTextColor,
    },

    // Card Type Modal
    cardTypeModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTypeModalContent: {
        backgroundColor: colors.whiteColor,
        borderRadius: 16,
        padding: 20,
        width: '85%',
    },
    cardTypeModalTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
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
        borderColor: colors.lightGrayColor,
        marginBottom: 12,
    },
    cardTypeOptionSelected: {
        borderColor: colors.primaryColor,
        backgroundColor: 'rgba(60, 130, 246, 0.05)',
    },
    cardTypeOptionText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    cardTypeOptionTextSelected: {
        color: colors.primaryColor,
    },
    cardTypeCheckmark: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primaryColor,
    },

    // Subscription
    subscriptionTitle: {
        ...Fonts.semibold20,
        color: colors.mainTextColor,
    },
    subscriptionTabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.btnBackgroundColor,
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
        backgroundColor: colors.primaryColor,
    },
    subscriptionTabText: {
        ...Fonts.medium14,
        color: colors.subTextColor,
    },
    subscriptionActiveTabText: {
        color: colors.pureWhite,
    },
    planCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        padding: 20,
        marginBottom: 16,
    },
    popularPlanCard: {
        borderColor: colors.primaryColor,
        borderWidth: 2,
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        right: 20,
        backgroundColor: colors.primaryColor,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularBadgeText: {
        ...Fonts.medium12,
        color: colors.pureWhite,
    },
    planName: {
        ...Fonts.semibold18,
        color: colors.mainTextColor,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 8,
    },
    planPrice: {
        ...Fonts.bold28,
        color: colors.mainTextColor,
    },
    planPeriod: {
        ...Fonts.regular14,
        color: colors.subTextColor,
        marginLeft: 4,
    },
    planCredits: {
        ...Fonts.regular12,
        color: colors.primaryColor,
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
        color: colors.grayColor,
        marginLeft: 10,
        flex: 1,
    },
    getStartedButton: {
        backgroundColor: colors.whiteColor,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    popularGetStartedButton: {
        backgroundColor: colors.primaryColor,
        borderColor: colors.primaryColor,
    },
    getStartedButtonText: {
        ...Fonts.medium14,
        color: colors.primaryColor,
    },
    popularGetStartedButtonText: {
        color: colors.pureWhite,
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
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.whiteColor,
    },
    accountSettingsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    accountSettingsIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.secondaryBlueColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    accountSettingsTitle: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
        lineHeight: 22,
    },

    // Change Password
    changePasswordTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
        lineHeight: 26,
    },

    // Date Picker
    datePickerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.whiteColor,
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
        borderBottomColor: colors.lightGrayColor,
    },
    datePickerCancel: {
        ...Fonts.medium16,
        color: colors.subTextColor,
    },
    datePickerDone: {
        ...Fonts.medium16,
        color: colors.primaryColor,
    },
});

// Backward compatibility - export static styles using light colors
import { lightColors } from "../../constants/Theme";
const Styles = createStyles(lightColors);
export default Styles;