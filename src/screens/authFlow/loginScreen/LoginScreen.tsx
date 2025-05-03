import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import Styles from './LoginStyles'
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
import FastImage from 'react-native-fast-image'

const LoginScreen = ({ navigation }: any) => {

    const insets = useSafeAreaInsets();
    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <SizeBox height={30} />
                <View style={{ height: 130, width: 130, alignSelf: 'center' }}>
                    <FastImage source={Images.loginImg} style={{ height: '100%', width: '100%' }} />
                </View>
                <SizeBox height={30} />
                <View style={Styles.contentContainer}>

                    <Text style={Styles.headingText}>Sign In to Your Account</Text>

                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>Access your account and stay connected.</Text>

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='Email'
                        placeholder='Enter email'
                        icon={<Icons.Email height={22} width={22} />}
                    />

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='Password'
                        placeholder='Enter password'
                        icon={<Icons.Password height={20} width={20} />}
                        isPass={true}
                    />

                    <SizeBox height={14} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={Styles.checkBox}>
                            <CheckBox onPressCheckBox={() => { }} />
                            <SizeBox width={6} />
                            <Text style={Styles.rememberMeText}>Remember Me</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={Styles.forgotPass}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <SizeBox height={40} />
                    <CustomButton title={'Continue'} onPress={() => navigation.navigate('BottomTabBar')} />

                    <SizeBox height={16} />
                    <OrContainer />

                    <SizeBox height={16} />
                    <SocialBtn
                        title='Continue with Google'
                        onPress={() => navigation.navigate('AddTalentScreen')}
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
                        <Text style={Styles.rememberMeText}>Don't have an account?</Text>
                        <SizeBox width={3} />
                        <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
                            <Text style={[Styles.rememberMeText, { color: Colors.primaryColor }]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                <SizeBox height={40} />
            </ScrollView>
        </View>
    )
}

export default LoginScreen