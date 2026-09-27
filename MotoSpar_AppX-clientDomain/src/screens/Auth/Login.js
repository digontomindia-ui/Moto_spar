import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useContext, useState} from 'react';
import Header from '../../components/HOC/Header';
import {styles} from '../../assets/Css/AuthCss';
import Passwordinput from '../../components/HOC/Passwordinput';
import AuthButton from '../../components/HOC/AuthButton';
import Googlebtn from '../../components/HOC/Googlebtn';
import {useNavigation} from '@react-navigation/native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {Textinput} from '../../components/HOC/Textinput';
import Loading from '../../components/HOC/Loading';
import {AuthContext} from '../../context/AuthContext';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const Login = () => {
  const navigation = useNavigation();
  const {Login, GoogleLogin, loadingactivity, message} =
    useContext(AuthContext);
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');

  const HandleSignin = async () => {
    await Login(email, password);
  };
  return (
    <View style={{flex: 1}}>
      <Header />
      <View style={{backgroundColor: Colors.background, height: '92%'}}>
        <View style={styles.container}>
          <Text style={styles.text1}>Welcome back!</Text>
          <Text style={styles.text2}>Sign in</Text>
          <Text style={styles.inputHeadtext}>Email</Text>
          <Textinput
            placeholder={'Enter Email'}
            value={email}
            onChangeText={setemail}
          />
          <Text style={styles.inputHeadtext}>Password</Text>
          <Passwordinput value={password} onChangeText={setpassword} />
          <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('Forgotpass')}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
          <View style={{alignItems: 'center'}}>
            <AuthButton title={'SIGN IN'} onpress={HandleSignin} />
            <View style={{flexDirection: 'row', marginTop: 20}}>
              <Text style={styles.acctxt}>I don't have an account?</Text>
              <TouchableOpacity activeOpacity={0.6}onPress={() => navigation.navigate('Register')}>
                <Text style={styles.accbtn}> Sign Up</Text>
              </TouchableOpacity>
            </View>
            {Platform.OS === 'android' && (
              <>
                <Text style={styles.OR}>--- OR ---</Text>
                <Googlebtn title={'Sign in'} onPress={GoogleLogin} />
              </>
            )}
          </View>
        </View>

        <ImageBackground
          source={require('../../assets/images/bottomimg.png')}
          style={styles.bottomImg}
        />
      </View>

      {loadingactivity ? <Loading /> : null}
    </View>
  );
};

export default Login;
