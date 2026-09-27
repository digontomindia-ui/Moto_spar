import { View, Text, TouchableOpacity, Image, ImageBackground } from 'react-native'
import React, { useContext, useState } from 'react'
import Header from '../../components/HOC/Header'
import { styles } from '../../assets/Css/AuthCss'
import Icon from "react-native-vector-icons/FontAwesome5"

import AuthButton from '../../components/HOC/AuthButton'
import Googlebtn from '../../components/HOC/Googlebtn'
import { useNavigation } from '@react-navigation/native'
import { Textinput } from '../../components/HOC/Textinput'
import Loading from '../../components/HOC/Loading'
import { AuthContext } from '../../context/AuthContext'

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setemail] = useState('');
  const { ForgotPswds, loadingactivity } = useContext(AuthContext);
  const HandleSubmit = async () => {
    const res = await ForgotPswds(email);
    if (res == true) {
      navigation.navigate('OtpVerification', { email: email })
    }
  }
  return (
    <View style={{ flex: 1 }}>
      <Header backIcon={true} navigateTo={'Login'} />
      <View style={{ height: '92%' }} >
        <View style={styles.container}>
          <Text style={styles.text2}>Forgot your Password?</Text>
          <Text style={styles.text1}>Don’t worry, happens to all of us. Enter your email below to recover your password</Text>

          <Text style={styles.inputHeadtext}>Email</Text>
          <Textinput placeholder={'Enter Email'}
            value={email}
            onChangeText={setemail}
          />

          <View style={{ alignItems: 'center', marginBottom: 15 }}>
            {loadingactivity ? <Loading /> : <AuthButton title={'SUBMIT'} onpress={HandleSubmit} />}
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <Text style={styles.acctxt}>Go Back?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.accbtn}> Sign In</Text>
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

export default ForgotPassword