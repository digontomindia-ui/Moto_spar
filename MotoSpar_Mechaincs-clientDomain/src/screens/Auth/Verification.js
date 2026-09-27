import { View, Text, ImageBackground, TouchableOpacity, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { styles } from '../../assets/Css/AuthCss'
import Colors from '../../constants/Colors'
import { Passwordinput, Textinput } from '../../components/HOC/Textinput'
import CommonBtn from '../../components/HOC/CommonBtn'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../../context/Authcontext'
import { OtpInput } from 'react-native-otp-entry'
import Loading from '../../components/HOC/Loading'


const Verification = ({ route }) => {
    const navigation = useNavigation()
    const email = route?.params?.email;
    const { ForgotPswds, Validateotp, loadingactivity } = useContext(AuthContext);
    const [Otp, setOtp] = useState('');
    const [counter, setCounter] = useState(50);
    const [isResendVisible, setIsResendVisible] = useState(false);
    useEffect(() => {
        let timer;

        if (counter > 0) {
            timer = setInterval(() => {
                setCounter(prev => prev - 1);
            }, 1000);
        } else {
            setIsResendVisible(true);
        }

        return () => clearInterval(timer);
    }, [counter]);
    const handleSubmit = async () => {
        const res = await Validateotp(Otp);
        if (res === true) {
            navigation.navigate('ResetPassword', { email: email })
        }
    }
    const handleResend = () => {
        ForgotPswds(email);
        setCounter(50); // Restart the timer
        setIsResendVisible(false);
    }
    return (
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
                    <Text style={{ ...styles.txt20bold, marginBottom: 10 }}>Almost There!</Text>
                    <Text style={{ ...styles.txt14, marginBottom: 10 }}>Check your Email and enter the code to continue.</Text>
                    <View style={{ marginVertical: 15 }}>
                        <OtpInput
                            numberOfDigits={6}
                            focusColor={Colors.btnColors.primary}
                            autoFocus={true}
                            hideStick={true}
                            blurOnFilled={true}
                            disabled={false}
                            type="numeric"
                            secureTextEntry={false}
                            focusStickBlinkingDuration={500}
                            onFocus={() => console.log('Focused')}
                            onBlur={() => console.log('Blurred')}
                            onTextChange={text => setOtp(text)}
                            onFilled={text => console.log(`OTP is ${text}`)}
                            textInputProps={{
                                accessibilityLabel: 'One-Time Password',
                            }}
                            theme={{
                                pinCodeTextStyle: { color: Colors.textColors.primary },
                            }}
                        />

                    </View>

                    <CommonBtn title={'Verify'} height={40} textColor={Colors.background.primary} margin={2} onpress={() =>
                        handleSubmit()} />
                    {/* <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={{ ...styles.txt14, marginBottom: 10, textAlign: 'center', color: Colors.btnColors.primary }}>Back</Text>
                    </TouchableOpacity> */}
                    {
                        isResendVisible ? (
                            <TouchableOpacity onPress={() => handleResend()}>
                                <Text style={{ ...styles.txt14, marginBottom: 10, textAlign: 'center', color: Colors.btnColors.primary }}>
                                    Resend OTP
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={{ ...styles.txt14, marginBottom: 10, textAlign: 'center', color: 'grey' }}>
                                Resend in {counter} sec
                            </Text>
                        )
                    }
                </View>

                {/* Socila Btn group */}

            </View>
            {/* <View style={{ ...styles.btnView, gap: 2, position: 'absolute', bottom: 30 }}>
                <Text style={styles.txt14}>Don't have an account?</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Register')}
                    activeOpacity={0.8}
                >
                    <Text style={{ ...styles.txt14bold, color: Colors.btnColors.primary }}>Sign up</Text>
                </TouchableOpacity>
            </View> */}
            {loadingactivity ? <Loading /> : null}
        </View>
    )
}

export default Verification