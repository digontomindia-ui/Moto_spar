import { View, Text, ImageBackground, TouchableOpacity, Image, useWindowDimensions, KeyboardAvoidingView } from 'react-native'
import React, { useContext, useState } from 'react'
import { styles } from '../../assets/Css/AuthCss'
import Colors from '../../constants/Colors'
import { Passwordinput, Textinput } from '../../components/HOC/Textinput'
import CommonBtn from '../../components/HOC/CommonBtn'
import { CommonActions, useNavigation } from '@react-navigation/native'
import { AuthContext } from '../../context/Authcontext'
import Loading from '../../components/HOC/Loading'
import { ScrollView } from 'react-native-gesture-handler'


const Register = () => {
    const navigation = useNavigation()
    const { width } = useWindowDimensions();

    const isSmallScreen = width < 350;
    const { Register, loadingactivity, FacebookLogin, GoogleLogin } = useContext(AuthContext);
    const [firstname, setfirstname] = useState('');
    const [lastname, setlastname] = useState('')
    const [email, setemail] = useState('');
    const [phone_number, setphone_number] = useState('')
    const [password, setpassword] = useState('');
    const [cnfpassword, setcnfpassword] = useState('');
    const HandleSignup = async () => {
        const res = await Register(
            firstname, lastname, email, password, cnfpassword, phone_number
        )
        if (res?.status === false) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0, // Index of the new screen
                    routes: [
                        {
                            name: 'VerificationScreen',
                        }
                    ], // Name of the new screen
                })
            );

        }
    }
    const handleGoogleLogin = async () => {
        const res = await GoogleLogin();
        if (res?.status === false) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0, // Index of the new screen
                    routes: [
                        {
                            name: 'VerificationScreen',
                        }
                    ], // Name of the new screen
                })
            );

        }
        else if (res?.data?.user?.mechanic_profile?.is_verified == false) {
            navigation.navigate('Detail');
        }

    };
    const handleFacebookLogin = async () => {
        const res = await FacebookLogin();
        if (res?.status === false) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0, // Index of the new screen
                    routes: [
                        {
                            name: 'VerificationScreen',
                        }
                    ], // Name of the new screen
                })
            );

        }
        else if (res?.data?.user?.mechanic_profile?.is_verified == false) {
            navigation.navigate('Detail');
        }

    };
    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#fff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <ImageBackground
                        source={require('../../assets/images/backgroundMap.png')}
                        style={
                            {
                                width: '100%',
                                height: '55%',

                            }
                        }
                    />
                    <View style={styles.overlayContainer}>
                        <View style={styles.card}>
                            <Text style={{ ...styles.txt20bold, marginBottom: 10 }}>Join Us Today!</Text>
                            <Text style={{ ...styles.txt14, marginBottom: 10 }}>Get Expert mechanic services anywhere, anytime.</Text>
                            <View
                                style={{
                                    flexDirection: isSmallScreen ? 'column' : 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    gap: 10,
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Textinput placeholder={'Enter First Name'} inputType={'default'} margin={1} value={firstname} onChangeText={setfirstname} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Textinput placeholder={'Enter Last Name'} inputType={'default'} margin={1} value={lastname} onChangeText={setlastname} />
                                </View>
                            </View>
                            <Textinput placeholder={'Enter your Email Address'} inputType={'email-address'} margin={1} value={email} onChangeText={setemail} />
                            <Textinput placeholder={'Enter Phone Number'} inputType={'numeric'} margin={1} value={phone_number} onChangeText={setphone_number} />
                            <Passwordinput placeholder={'Enter password'} margin={1} value={password} onChangeText={setpassword} />
                            <Passwordinput placeholder={'Confirm password'} margin={1} value={cnfpassword} onChangeText={setcnfpassword} />
                            <CommonBtn title={'Next'} height={40} textColor={Colors.background.primary} margin={2} onpress={() => HandleSignup()} />
                            <TouchableOpacity activeOpacity={0.8}>
                                <Text style={{ ...styles.txt14, marginBottom: 10, textAlign: 'center', color: Colors.btnColors.primary }}>Terms and Conditions</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Socila Btn group */}
                        <View style={styles.btnView}>
                            <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={() => handleGoogleLogin()}>
                                <Image
                                    source={require('../../assets/images/Google.png')}
                                    style={styles.btnLogo}
                                />
                                <Text style={styles.txt16}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={() => handleFacebookLogin()}>
                                <Image
                                    source={require('../../assets/images/facebook.png')}
                                    style={styles.btnLogo}
                                />
                                <Text style={styles.txt16}>Facebook</Text>
                            </TouchableOpacity>

                        </View>

                        <View style={{ ...styles.btnView, gap: 2, marginVertical: 20 }}>
                            <Text style={styles.txt14}>Already have an account?</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Login')}
                                activeOpacity={0.8}
                            >
                                <Text style={{ ...styles.txt14bold, color: Colors.btnColors.primary }}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loadingactivity ? <Loading /> : null}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default Register