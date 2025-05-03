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
import Colors from '../../../constants/Colors'
import Styles from './SignupScreenStyles'
import FastImage from 'react-native-fast-image'

const SignupScreen = ({ navigation }: any) => {
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
                        icon={<Icons.Email height={22} width={22} />}
                    />

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='Username'
                        placeholder='Enter Username'
                        icon={<Icons.User height={18} width={18} />}
                    />

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='First Name'
                        placeholder='Enter First Name'
                        icon={<Icons.User height={18} width={18} />}
                    />

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='Last Name'
                        placeholder='Last Name'
                        icon={<Icons.User height={18} width={18} />}
                    />

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='Your Birthdate'
                        placeholder='dd/mm/yyyy'
                        icon={<Icons.DOB height={20} width={20} />}
                    />

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='Password'
                        placeholder='Enter password'
                        icon={<Icons.Password height={20} width={20} />}
                        isPass={true}
                    />

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='Confirm password'
                        placeholder='Confirm password'
                        icon={<Icons.Password height={20} width={20} />}
                        isPass={true}
                    />

                    <SizeBox height={14} />

                    <View style={Styles.checkBox}>
                        <CheckBox onPressCheckBox={() => { }} />
                        <SizeBox width={6} />

                        <View style={[Styles.checkBox, { flexWrap: 'wrap' }]}>
                            <Text style={Styles.rememberMeText}>By proceeding, you agree to the </Text>
                            <TouchableOpacity onPress={() => { }}>
                                <Text style={[Styles.rememberMeText, { color: Colors.primaryColor, textDecorationLine: 'underline', }]}>Terms of Service</Text>
                            </TouchableOpacity>
                            <Text style={Styles.rememberMeText}> and </Text>
                            <TouchableOpacity onPress={() => { }}>
                                <Text style={[Styles.rememberMeText, { color: Colors.primaryColor, textDecorationLine: 'underline', }]}>Privacy Policy.</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <SizeBox height={40} />
                    <CustomButton title={'Continue'} onPress={() => navigation.navigate('LanguageScreen')} />

                    <SizeBox height={16} />
                    <OrContainer />

                    <SizeBox height={16} />
                    <SocialBtn
                        title='Continue with Google'
                        onPress={() => { }}
                        isGoogle={true}
                    />
                    <SizeBox height={20} />
                    <SocialBtn
                        title='Continue with Apple'
                        onPress={() => { }}
                        isGoogle={false}
                    />
                    <SizeBox height={20} />
                    <View style={Styles.signUpContainer}>
                        <Text style={Styles.rememberMeText}>Already have an Account?</Text>
                        <SizeBox width={3} />
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={[Styles.rememberMeText, { color: Colors.primaryColor }]}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <SizeBox height={40} />
            </ScrollView>
        </View>
    )
}

export default SignupScreen