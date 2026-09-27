import { View, Text, ImageBackground, TouchableOpacity, Image } from 'react-native'
import React, { useContext, useState } from 'react'
import { styles } from '../../assets/Css/AuthCss'
import Colors from '../../constants/Colors'
import { Passwordinput, Textinput } from '../../components/HOC/Textinput'
import CommonBtn from '../../components/HOC/CommonBtn'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../../context/Authcontext'
import Loading from '../../components/HOC/Loading'


const ResetPassword = ({ route }) => {
    const navigation = useNavigation();

    const { Changepswds, Validateotp, loadingactivity } = useContext(AuthContext);
    const [password, setpassword] = useState('');
    const [confirm_password, setconfirm_password] = useState('');

    const handleSubmit = async () => {
        const res = await Changepswds(password, confirm_password);
        if (res === true) {
            setpassword('');
            setconfirm_password('')
        }
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
                    <Text style={{ ...styles.txt20bold, marginBottom: 10 }}>Time for a Fresh Start!</Text>
                    <Text style={{ ...styles.txt14, marginBottom: 10 }}>Create a new password and get back on track.</Text>
                    <Passwordinput placeholder={'Enter password'} margin={1} value={password} onChangeText={setpassword} />
                    <Passwordinput placeholder={'Confirm password'} margin={1} value={confirm_password} onChangeText={setconfirm_password} />

                    <CommonBtn title={'Submit'} height={40} textColor={Colors.background.primary} margin={2} onpress={() => handleSubmit()} />
                    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Login')}>
                        <Text style={{ ...styles.txt14, marginBottom: 10, textAlign: 'center', color: Colors.btnColors.primary }}>Back to Login</Text>
                    </TouchableOpacity>
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

export default ResetPassword