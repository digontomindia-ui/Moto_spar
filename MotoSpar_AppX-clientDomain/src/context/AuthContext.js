import React, { createContext, useState, useEffect, useRef } from 'react';
import {
  Alert,
  ToastAndroid,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { postGoogle, postUser, postAuth } from '../repository/Repo';
import { useNavigation } from '@react-navigation/native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  if (Platform.OS === 'android') {
    GoogleSignin.configure({
      webClientId:
        '818269488302-svso0iqe2cfb53d87s99q2b4h4betkj1.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [loggedIn, setloggedIn] = useState(false);
  const [loadingactivity, setloadingactivity] = useState(false);
  const [user, setuser] = useState('');
  const [userToken, setuserToken] = useState('');
  const [message, setmessage] = useState('');
  const showAlert = (navigateto, msg) => {
    return Alert.alert('Success', msg, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'OK', onPress: () => navigation.navigate(navigateto) },
    ]);
  };
  const isLoggedIn = async () => {
    try {
      let value = await AsyncStorage.getItem('@usertoken');
      let users = await AsyncStorage.getItem('@userdetails');
      let refreshToken = await AsyncStorage.getItem('@user_refreshtoken');
      if (users) {
        users = JSON.parse(users);
        dispatch({
          type: 'SET_TOKEN',
          payload: value,
        });
        dispatch({
          type: 'SET_REFRESHTOKEN',
          payload: refreshToken,
        });
        dispatch({
          type: 'SET_USER_DATA',
          payload: users,
        });
        dispatch({
          type: 'SET_LOGGEDIN',
          payload: true,
        });
        setloggedIn(true);
      }
    } catch (e) {
      setloggedIn(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, [loggedIn]);

  const Login = async (email, pswd) => {
    setloadingactivity(true);
    if (email === '' || pswd === '') {
      setloadingactivity(false);
      return Alert.alert(
        'Validation Error',
        'Please enter both email and password.',
      );
    } else {
      try {
        var body = {
          email: email,
          password: pswd,
        };

        const res = await postUser('login-via-email', body);
        if (res?.data?.status == 'success') {
          AsyncStorage.setItem('@usertoken', res?.data?.access);
          AsyncStorage.setItem('@user_refreshtoken', res?.data?.refresh);
          AsyncStorage.setItem('@userdetails', JSON.stringify(res?.data.user));
          dispatch({
            type: 'SET_TOKEN',
            payload: res?.data?.access,
          });
          dispatch({
            type: 'SET_REFRESHTOKEN',
            payload: res?.data?.refresh,
          });
          dispatch({
            type: 'SET_USER_DATA',
            payload: res?.data?.user,
          });
          dispatch({
            type: 'SET_LOGGEDIN',
            payload: true,
          });
          setloggedIn(true);
          setloadingactivity(false);
          // Alert.alert('Success', res?.message);
          // navigation.navigate('Home')
        } else {
          setloadingactivity(false);
          Toast.show({
            type: 'error',
            text1: 'Invalid email or password',
            position: 'bottom',
          });
        }
      } catch (e) {
        setloadingactivity(false);
      }
    }
  };

  const GoogleLogin = async () => {
    setloadingactivity(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const serverAuthCode = userInfo.serverAuthCode;
      const userToken = await GoogleSignin.getTokens();
      const accessToken = userToken.accessToken;

      var body = {
        access_token: accessToken,
      };

      const res = await postGoogle('google/login/callback', body);
      if (res?.data) {
        AsyncStorage.setItem('@usertoken', res?.data?.access);
        AsyncStorage.setItem('@user_refreshtoken', res?.data?.refresh);
        AsyncStorage.setItem('@userdetails', JSON.stringify(res?.data.user));

        dispatch({
          type: 'SET_TOKEN',
          payload: res?.data?.access,
        });
        dispatch({
          type: 'SET_REFRESHTOKEN',
          payload: res?.data?.refresh,
        });
        dispatch({
          type: 'SET_USER_DATA',
          payload: res?.data?.user,
        });
        dispatch({
          type: 'SET_LOGGEDIN',
          payload: true,
        });
        setloggedIn(true);
        setloadingactivity(false);
        // Alert.alert('Success', res?.message);
        // navigation.navigate('Home')
      } else {
        setloadingactivity(false);
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setloadingactivity(false);
        Alert.alert('Error', 'user cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setloadingactivity(false);
        Alert.alert('In Progress', 'sign in already in progress');
      } else if (error.response) {
        setloadingactivity(false);
        const errorData = error.response.data;
        Alert.alert(
          'error',
          errorData['non_field_errors'][0] +
          'Kindly Login through Email and Password',
        );
        await GoogleSignin.signOut();
      }
    }
  };

  const Register = async (f_name, l_name, email, pswd, conPswd) => {
    setloadingactivity(true);
    if (
      f_name === '' ||
      l_name === '' ||
      email === '' ||
      pswd === '' ||
      conPswd === ''
    ) {
      setloadingactivity(false);
      return Alert.alert('Validation Error', 'All feilds are required.');
    } else if (pswd != conPswd) {
      setloadingactivity(false);
      return Alert.alert(
        'Validation Error',
        'Password and confirm password do not match.',
      );
    } else {
      try {
        var body = {
          first_name: f_name,
          last_name: l_name,
          email: email,
          password: pswd,
          confirm_password: conPswd,
        };
        const res = await postUser('customer/register', body);
        if (res?.data) {
          AsyncStorage.setItem('@usertoken', res?.data?.access);
          AsyncStorage.setItem('@user_refreshtoken', res?.data?.refresh);
          AsyncStorage.setItem('@userdetails', JSON.stringify(res?.data.user));

          dispatch({
            type: 'SET_TOKEN',
            payload: res?.data?.access,
          });
          dispatch({
            type: 'SET_REFRESHTOKEN',
            payload: res?.data?.refresh,
          });
          dispatch({
            type: 'SET_USER_DATA',
            payload: res?.data?.user,
          });
          dispatch({
            type: 'SET_LOGGEDIN',
            payload: true,
          });
          setloggedIn(true);
          // Alert.alert('Success', res?.message);
          //navigation.navigate('Home')
        } else {
          setloadingactivity(false);
        }
      } catch (e) {
        setloadingactivity(false);
      }
    }
  };
  const ForgotPswds = async email => {

    setloadingactivity(true);

    if (!email || email.trim() === '') {
      setloadingactivity(false);
      Toast.show({
        type: 'error',
        text1: 'Email is required',
        position: 'top',
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setloadingactivity(false);
      Toast.show({
        type: 'error',
        text1: 'Enter valid email address',
        position: 'top',
      });
    }

    try {
      const body = { email: email };
      const res = await postUser('request-password-reset', body);

      if (res?.status === true) {

        Toast.show({
          type: 'success',
          text1: res?.message,
          position: 'top',
        });
        return res?.status;
      } else {
        Toast.show({
          type: 'error',
          text1: res?.message,
          position: 'top',
        });
        return res?.status;
      }
    } catch (e) {
      console.error('ForgotPswds Error:', e);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong. Please try again.',
        position: 'bottom',
      });
    } finally {
      setloadingactivity(false);
    }
  };
  const Validateotp = async (email, otp) => {
    setloadingactivity(true);

    if (!otp || otp === '') {
      setloadingactivity(false);
      Toast.show({
        type: 'error',
        text1: 'Otp is required',
        position: 'top',
      });
    }

    try {
      const body = {
        email,
        otp,
      };
      const res = await postUser('password-reset/verify-otp', body);

      if (res?.status === true) {
        return res?.status;
      } else {
        Toast.show({
          type: 'error',
          text1: res?.message,
          position: 'top',
        });
        return res?.status;
      }
    } catch (e) {
      console.error('ForgotPswds Error:', e);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong. Please try again',
        position: 'bottom',
      });
    } finally {
      setloadingactivity(false);
    }
  };
  const ForgotResetPswd = async (email, new_password, confirm_password) => {
    setloadingactivity(true);

    // Basic validations
    if (!new_password || !confirm_password) {
      setloadingactivity(false);
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Both password fields are required.',
        position: 'top',
      });
      return;
    }

    if (new_password !== confirm_password) {
      setloadingactivity(false);
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Password and Confirm Password do not match.',
        position: 'top',
      });
      return;
    }

    if (new_password.length < 6) {
      setloadingactivity(false);
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Password must be at least 6 characters long.',
        position: 'top',
      });
      return;
    }

    try {
      const body = {
        email,
        new_password,
        confirm_password,
      };
      console.log(body);
      const res = await postUser('reset-password', body);

      if (res?.status === true) {
        Toast.show({
          type: 'success',
          text1: res?.message || 'Password updated successfully.',
          position: 'top',
        });
        return res?.status;
      } else {
        console.log('Server Response:', res);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: res?.message || 'Failed to update password.',
          position: 'top',
        });
        return res?.status;
      }
    } catch (e) {
      console.error('Chnagepswds Error:', e);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.',
        position: 'top',
      });
    } finally {
      setloadingactivity(false);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        Login,
        Register,
        ForgotPswds,
        Validateotp,
        ForgotResetPswd,
        GoogleLogin,
        loadingactivity,
        loggedIn,
        message,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
export { AuthProvider, AuthContext };
