import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Images from '../../../constants/Images'
import CustomTextInput from '../../../components/customTextInput/CustomTextInput'
import Icons from '../../../constants/Icons'
import CheckBox from '../../../components/checkbox/CheckBox'
import CustomButton from '../../../components/customButton/CustomButton'
import OrContainer from '../components/OrContainer'
import SocialBtn from '../components/SocialBtn'
import { createStyles } from './SignupScreenStyles'
import FastImage from 'react-native-fast-image'
import { useTheme } from '../../../context/ThemeContext'

const SignupScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <SizeBox height={30} />
                <View style={{ height: 130, width: 130, alignSelf: 'center' }}>
                    <FastImage source={Images.registerImg} style={{ height: '100%', width: '100%' }} />
                </View>
                <SizeBox height={30} />
                <View style={Styles.contentContainer}>

                    <Text style={Styles.headingText}>Sign Up & Get Started</Text>

                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>It only takes a minute to get started—join us now!</Text>

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='Email'
                        placeholder='Enter email'
                        icon={<Icons.Email height={16} width={16} />}
                    />

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='Password'
                        placeholder='Enter password'
                        icon={<Icons.Password height={16} width={16} />}
                        isPass={true}
                    />

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='Confirm password'
                        placeholder='Confirm password'
                        icon={<Icons.Password height={16} width={16} />}
                        isPass={true}
                    />

                    <SizeBox height={24} />

                    <View style={Styles.checkBox}>
                        <View style={Styles.checkboxIcon}>
                            <CheckBox onPressCheckBox={() => { }} />
                        </View>
                        <SizeBox width={10} />
                        <View style={Styles.termsTextContainer}>
                            <Text style={Styles.rememberMeText}>
                                By proceeding, you agree to the{' '}
                                <Text style={Styles.linkText} onPress={() => { }}>Terms of Service</Text>
                                {' '}and{' '}
                                <Text style={Styles.linkText} onPress={() => { }}>Privacy Policy.</Text>
                            </Text>
                        </View>
                    </View>

                    <SizeBox height={40} />
                    <CustomButton title={'Sign Up'} onPress={() => navigation.navigate('CreateProfileScreen')} />

                    <SizeBox height={16} />
                    <OrContainer />

                    <SizeBox height={16} />
                    <SocialBtn
                        title='Continue with Google'
                        onPress={() => navigation.navigate('CreateProfileScreen')}
                        isGoogle={true}
                    />
                    <SizeBox height={20} />
                    <SocialBtn
                        title='Continue with Apple'
                        onPress={() => navigation.navigate('CreateProfileScreen')}
                        isGoogle={false}
                    />
                    <SizeBox height={20} />
                    <View style={Styles.signUpContainer}>
                        <Text style={Styles.rememberMeText}>Already have an Account?</Text>
                        <SizeBox width={3} />
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={[Styles.rememberMeText, { color: colors.primaryColor }]}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <SizeBox height={40} />
            </ScrollView>
        </View>
    )
}

export default SignupScreen