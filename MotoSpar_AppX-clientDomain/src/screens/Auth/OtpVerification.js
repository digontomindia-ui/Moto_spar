import { View, Text, TouchableOpacity, Image, ImageBackground } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Header from '../../components/HOC/Header'
import { styles } from '../../assets/Css/AuthCss'
import Icon from "react-native-vector-icons/FontAwesome5"

import AuthButton from '../../components/HOC/AuthButton'
import Googlebtn from '../../components/HOC/Googlebtn'
import { useNavigation } from '@react-navigation/native'
import { Textinput } from '../../components/HOC/Textinput'
import Loading from '../../components/HOC/Loading'
import { AuthContext } from '../../context/AuthContext'
import { OtpInput } from 'react-native-otp-entry'
import Colors from '../../constants/Colors'

const OtpVerification = ({ route }) => {
    const navigation = useNavigation();
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
        const res = await Validateotp(email, Otp);
        if (res === true) {
            navigation.navigate('Resetpass', { email: email })
        }
    }
    const handleResend = () => {
        ForgotPswds(email);
        setCounter(50); // Restart the timer
        setIsResendVisible(false);
    }

    return (
        <View style={{ flex: 1 }}>
            <Header />
            <View style={{ height: '92%' }} >
                <View style={styles.container}>
                    <Text style={styles.text2}>OTP Verification</Text>
                    <Text style={styles.text1}>Don’t worry, happens to all of us. Enter your Otp recieved via email below to reset your password.</Text>

                    <Text style={styles.inputHeadtext}>Otp</Text>
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
                            // onFocus={() => console.log('Focused')}
                            // onBlur={() => console.log('Blurred')}
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
                    {
                        isResendVisible ? (
                            <TouchableOpacity onPress={() => handleResend()}>
                                <Text style={{ ...styles.txt14, marginBottom: 10, textAlign: 'center', color: Colors.btnColors.primary }}>
                                    Resend OTP
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={{ ...styles.txt14, marginBottom: 10, textAlign: 'center', color: 'grey' }}>
                                You can resend otp in {counter} sec
                            </Text>
                        )
                    }
                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                        {loadingactivity ? <Loading /> : <AuthButton title={'SUBMIT'} onpress={handleSubmit} />}

                    </View>
                </View>

                <ImageBackground
                    source={require('../../assets/images/bottomimg.png')}
                    style={styles.bottomImg}
                />

            </View>
        </View>


    )
}

export default OtpVerification