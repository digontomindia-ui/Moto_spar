import { View, Text, TouchableOpacity, Image, ImageBackground } from 'react-native'
import React, { useContext, useState } from 'react'
import Header from '../../components/HOC/Header'
import { styles } from '../../assets/Css/AuthCss'
import AuthButton from '../../components/HOC/AuthButton'
import { Textinput } from '../../components/HOC/Textinput'
import { useNavigation } from '@react-navigation/native'
import Passwordinput from '../../components/HOC/Passwordinput'
import { AuthContext } from '../../context/AuthContext'

const ResetPassword = ({ route }) => {
  const email = route?.params?.email;
  const navigation = useNavigation();
  const { ForgotResetPswd, loadingactivity } = useContext(AuthContext);
  const [password, setpassword] = useState('');
  const [confirm_pass, setconfirm_pass] = useState('')


  const HandleResetpass = async () => {
    setpassword('');
    const res = await ForgotResetPswd(email, password, confirm_pass)
    if (res === true) {
      navigation.navigate('Login')
    }
  }
  return (
    <View style={{ flex: 1 }}>
      <Header />


      <View style={{ height: "92%" }}>
        <View style={styles.container}>
          <Text style={styles.text2register}>Reset Password</Text>
          <Text style={styles.text1}>Don’t worry, happens to all of us. Reset your password</Text>
          <Text style={styles.inputHeadtext}>Password</Text>
          <Passwordinput value={password} onChangeText={setpassword} />
          <Text style={styles.inputHeadtext}>Confirm Password</Text>
          <Passwordinput value={confirm_pass} onChangeText={setconfirm_pass} />

          <View style={{ alignItems: 'center', marginBottom: 15 }}>
            <AuthButton title={'SUBMIT'} onpress={HandleResetpass} />
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <Text style={styles.acctxt}>Go Back?</Text>
              <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.accbtn}>Sign In</Text>
              </TouchableOpacity>
            </View>
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

export default ResetPassword