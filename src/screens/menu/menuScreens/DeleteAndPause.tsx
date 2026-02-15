import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SizeBox from '../../../constants/SizeBox';
import MenuContainers from '../components/MenuContainers';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';
import ConfirmationModel from '../../../components/confirmationModel/ConfirmationModel';
import { ArrowLeft2, Notification, Pause } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next'

const DeleteAndPause = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [isDeleteSuggestionVisible, setIsDeleteSuggestionVisible] = useState(false);
    const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
    const [isPauseVisible, setIsPauseVisible] = useState(false);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Menu')}</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <View style={Styles.container}>
                <SizeBox height={24} />
                <Text style={Styles.sectionTitle}>{t('Delete/Pause')}</Text>
                <SizeBox height={16} />

                <MenuContainers
                    icon={<Icons.DeleteAccount height={20} width={20} />}
                    title={t('Delete your account')}
                    onPress={() => setIsDeleteSuggestionVisible(true)}
                    isNext={true}
                />
                <SizeBox height={12} />

                {/* Pause Account Card with Description */}
                <TouchableOpacity
                    style={Styles.menuContainer}
                    onPress={() => setIsPauseVisible(true)}
                >
                    <View style={Styles.iconCont}>
                        <Pause size={20} color={colors.primaryColor} variant="Linear" />
                    </View>
                    <SizeBox width={20} />
                    <View style={Styles.pauseContent}>
                        <Text style={Styles.titlesText}>{t('Pause your account')}</Text>
                        <Text style={Styles.pauseDescription}>
                            Pausing your account" means temporarily stopping access while keeping all your data safe
                        </Text>
                    </View>
                    <View style={Styles.nextArrow}>
                        <Icons.ArrowNext height={24} width={24} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Delete Suggestion Modal */}
            <ConfirmationModel
                isVisible={isDeleteSuggestionVisible}
                onClose={() => {
                    setIsDeleteSuggestionVisible(false);
                    setIsDeleteConfirmVisible(true);
                }}
                text={t("Did you know you can also pause your account? This way, others won't be able to find you, but you'll still be with us for a bit")}
                icon={<Pause size={28} color={colors.pureWhite} variant="Bold" />}
                onPressYes={() => {
                    setIsDeleteSuggestionVisible(false);
                    setIsPauseVisible(true);
                }}
                leftBtnText="Delete"
                rightBtnText="Pause"
                leftBtnTextColor="#FF4D4D"
                leftBtnBorderColor="#FF4D4D"
            />

            {/* Final Delete Confirmation Modal */}
            <ConfirmationModel
                isVisible={isDeleteConfirmVisible}
                onClose={() => setIsDeleteConfirmVisible(false)}
                text={t('Are You Sure You Want to Delete Your Account?')}
                icon={<Icons.DeleteRedBold height={32} width={32} />}
                onPressYes={() => { }}
                iconBgColor="rgba(237, 84, 84, 0.4)"
            />

            {/* Pause Confirmation Modal */}
            <ConfirmationModel
                isVisible={isPauseVisible}
                onClose={() => setIsPauseVisible(false)}
                text={t('Are You Sure You Want to Pause Your Account?')}
                icon={<Pause size={28} color={colors.pureWhite} variant="Bold" />}
                onPressYes={() => { }}
            />
        </View>
    )
}

export default DeleteAndPause