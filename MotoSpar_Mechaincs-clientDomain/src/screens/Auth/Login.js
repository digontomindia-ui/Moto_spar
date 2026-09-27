import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useContext, useState } from 'react';
import { styles } from '../../assets/Css/AuthCss';
import Colors from '../../constants/Colors';
import { Passwordinput, Textinput } from '../../components/HOC/Textinput';
import CommonBtn from '../../components/HOC/CommonBtn';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/Authcontext';
import Loading from '../../components/HOC/Loading';

const Login = () => {
  const navigation = useNavigation();
  const { Signin, GoogleLogin, loadingactivity, FacebookLogin } = useContext(AuthContext);
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');

  const HandleSubmit = async () => {
    const res = await Signin(email, password);
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <ImageBackground
            source={require('../../assets/images/backgroundMap.png')}
            style={{ width: '100%', height: '55%' }}
          />
          <View style={styles.overlayContainer}>
            <View style={styles.card}>
              <Text style={{ ...styles.txt20bold, marginBottom: 10 }}>
                Your Skills, Amplified.
              </Text>
              <Text style={{ ...styles.txt14, marginBottom: 10 }}>
                Access a wider audience seeking your mechanical expertise.
              </Text>
              <Textinput
                placeholder={'Enter email address'}
                inputType={'email-address'}
                value={email}
                onChangeText={setemail}
              />
              <Passwordinput
                placeholder={'Enter your password'}
                value={password}
                onChangeText={setpassword}
              />
              <CommonBtn
                title={'Sign In'}
                height={40}
                textColor={Colors.background.primary}
                margin={2}
                onpress={HandleSubmit}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text
                  style={{
                    ...styles.txt14,
                    marginBottom: 10,
                    textAlign: 'center',
                    color: Colors.btnColors.primary,
                  }}>
                  Forgot password ?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Social Btn group */}
            <View style={styles.btnView}>
              <TouchableOpacity
                style={styles.btn}
                activeOpacity={0.8}
                onPress={handleGoogleLogin}>
                <Image
                  source={require('../../assets/images/Google.png')}
                  style={styles.btnLogo}
                />
                <Text style={styles.txt16}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btn}
                activeOpacity={0.8}
                onPress={() => handleFacebookLogin()}>
                <Image
                  source={require('../../assets/images/facebook.png')}
                  style={styles.btnLogo}
                />
                <Text style={styles.txt16}>Facebook</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                ...styles.btnView,
                gap: 2,
                marginVertical: 20
              }}>
              <Text style={styles.txt14}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.8}>
                <Text
                  style={{ ...styles.txt14bold, color: Colors.btnColors.primary }}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </View>



          {/* This stays at bottom without jumping */}


          {loadingactivity ? <Loading /> : null}
        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
};

export default Login;
