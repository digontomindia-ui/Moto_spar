import React, { createContext, useState, useEffect, useRef } from 'react';
import {
  Alert,
  ToastAndroid,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect, useDispatch } from 'react-redux';
import {
  postGoogle,
  postUser,
  postAuth,
  postFormdatatAuth,
  postCommon,
  postFormdataCommon,
  GetAuth,
  patchFormdatatAuth,
} from '../repository/Repo';
import { useNavigation } from '@react-navigation/native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import { LoginManager, AccessToken, Profile } from 'react-native-fbsdk-next';

const AuthContext = createContext();
// '938179568180-09ded7cdlun4nll6ldpb803j6ncskt2h.apps.googleusercontent.com'
const AuthProvider = ({ children }) => {
  GoogleSignin.configure({
    webClientId:
      Platform.OS === 'android'
        ? '938179568180-nvkvvs6mt9b2hr2jm152b7hac9p5l7da.apps.googleusercontent.com'
        : '938179568180-09ded7cdlun4nll6ldpb803j6ncskt2h.apps.googleusercontent.com',
    offlineAccess: true,
  });

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [loggedIn, setloggedIn] = useState(false);
  const [loadingactivity, setloadingactivity] = useState(false);
  const [user, setuser] = useState('');
  const [userToken, setuserToken] = useState('');
  const [message, setmessage] = useState('');
  const [userEmail, setuserEmail] = useState('');
  const [userOtp, setuserOtp] = useState(null);
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
        console.log('isLoggedIn', users);

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

  const Signin = async (email, password) => {
    setloadingactivity(true);
    if (email === '' || password === '') {
      setloadingactivity(false);
      Toast.show({
        type: 'error',
        text1: 'please enter Valid email or password',
        position: 'top',
      });
    } else {
      try {
        var body = {
          email,
          password,
        };

        const res = await postCommon('login-via-email', body);

        if (res?.status === true) {
          console.log('res>>', res);
          await AsyncStorage.setItem('@usertoken', res?.data?.access);
          await AsyncStorage.setItem('@user_refreshtoken', res?.data?.refresh);
          await AsyncStorage.setItem(
            '@userdetails',
            JSON.stringify(res?.data.user),
          );

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

          {
            res?.data?.user?.mechanic_profile?.is_verified &&
              dispatch({
                type: 'SET_LOGGEDIN',
                payload: true,
              });
          }

          Toast.show({
            type: 'success',
            text1: res?.message,
            position: 'top',
          });
          setloggedIn(res?.data?.user?.mechanic_profile?.is_verified);
          setloadingactivity(false);
          // Alert.alert('Success', res?.message);
          // navigatio.navigate('Home')
          return res;
        } else {
          console.log('error', res);
          setloadingactivity(false);
          Toast.show({
            type: 'error',
            text1: res?.message,
            position: 'top',
          });
          return res;
        }
        return res?.status;
      } catch (e) {
        setloadingactivity(false);
      }
    }
  };
  const SigninOtpVerify = async (phone_number, verification_code) => {
    setloadingactivity(true);
    if (verification_code === '') {
      setloadingactivity(false);
      Toast.show({
        type: 'error',
        text1: 'please enter OTP',
        position: 'top',
      });
    } else {
      try {
        var body = {
          country_code: '91',
          phone_number,
          verification_code,
        };

        const res = await postCommon('login-via-number', body);
        if (res?.status == true) {
          console.log('res>>', res);
          await AsyncStorage.setItem('@usertoken', res?.data?.access);
          await AsyncStorage.setItem('@user_refreshtoken', res?.data?.refresh);
          await AsyncStorage.setItem(
            '@userdetails',
            JSON.stringify(res?.data.user),
          );
          await AsyncStorage.setItem(
            '@user_activePlan',
            JSON.stringify(res?.data?.user?.subscription_status),
          );
          dispatch({
            type: 'SET_TOKEN',
            payload: res?.data?.access,
          });
          dispatch({
            type: 'DEVICE_TOKEN',
            payload: device_token,
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
          Toast.show({
            type: 'success',
            text1: res?.message,
            position: 'top',
          });
          setloggedIn(true);
          setloadingactivity(false);
        } else {
          console.log('error', res);
          setloadingactivity(false);
          Toast.show({
            type: 'error',
            text1: res?.message,
            position: 'top',
          });
        }
        return res?.status;
      } catch (e) {
        setloadingactivity(false);
      }
    }
  };

  const GoogleLogin = async () => {
    setloadingactivity(true);

    try {
      console.log('Attempting Google sign-in...');
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const userToken = await GoogleSignin.getTokens();

      if (!userToken?.accessToken) {
        throw new Error('Failed to retrieve access token');
      }

      console.log('Google Access Token:', userToken.accessToken);

      const body = { access_token: userToken.accessToken, account_type: 'mechanic' };
      const res = await postGoogle('google/login/callback', body);
      console.log('res', res)
      if (res?.data?.status === 'success') {

        const { access, refresh, user } = res?.data;

        await AsyncStorage.setItem('@usertoken', access);
        await AsyncStorage.setItem('@user_refreshtoken', refresh);
        await AsyncStorage.setItem('@userdetails', JSON.stringify(user));


        dispatch({ type: 'SET_TOKEN', payload: access });
        dispatch({ type: 'SET_REFRESHTOKEN', payload: refresh });
        dispatch({ type: 'SET_USER_DATA', payload: user });

        if (res?.data?.user?.mechanic_profile?.is_verified) {
          dispatch({ type: 'SET_LOGGEDIN', payload: true });
        }
        else {
          return res
        }
      } else {
        console.warn('Login failed:', res);
        return res
      }
    } catch (error) {
      console.log('Google Sign-In Error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Error', 'User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('In Progress', 'Sign-in already in progress');
      } else if (error.code === statusCodes.DEVELOPER_ERROR) {
        // Developer error detected - clear Google Sign-In cache
        Alert.alert(
          'Developer Error',
          'Check your Web Client ID and SHA certificate',
        );
        await GoogleSignin.signOut();
        await GoogleSignin.revokeAccess();
      } else if (error.response) {
        const errorData = error.response.data;
        Alert.alert(
          'Error',
          `${errorData['non_field_errors'][0]} Kindly login through Email and Password`,
        );
        await GoogleSignin.signOut();
        await GoogleSignin.revokeAccess();
      }
    } finally {
      setloadingactivity(false);
    }
  };

  const Register = async (
    f_name,
    l_name,
    email,
    pswd,
    conPswd,
    phone_number,
  ) => {
    setloadingactivity(true);
    console.log(
      'Registering user:',
      f_name,
      l_name,
      email,
      pswd,
      conPswd,
      phone_number,
    );

    // Input Validation
    if (
      !f_name ||
      !l_name ||
      !email ||
      !pswd ||
      // !conPswd ||
      !phone_number
    ) {
      setloadingactivity(false);
      Toast.show({
        type: 'error',
        text1: 'All fields are required.',
        position: 'bottom',
      });
      return;
    }

    if (pswd !== conPswd) {
      setloadingactivity(false);
      Toast.show({
        type: 'error',
        text1: 'Password and confirm password do not match.',
        position: 'bottom',
      });
      return;
    }

    try {
      console.log('Attempting registration...');
      var body = {
        first_name: f_name,
        last_name: l_name,
        email,

        password: pswd,
        confirm_password: conPswd,

        phone_number,
      };

      const res = await postCommon('mechanic/register', body);
      console.log(res);
      if (res?.status === true) {
        console.log('Registration successful:', res);

        await AsyncStorage.setItem('@usertoken', res?.data?.access);
        await AsyncStorage.setItem('@user_refreshtoken', res?.data?.refresh);
        await AsyncStorage.setItem(
          '@userdetails',
          JSON.stringify(res?.data.user),
        );

        dispatch({ type: 'SET_TOKEN', payload: res?.data?.access });
        dispatch({ type: 'SET_REFRESHTOKEN', payload: res?.data?.refresh });
        dispatch({ type: 'SET_USER_DATA', payload: res?.data?.user });
        // dispatch({ type: 'SET_LOGGEDIN', payload: true });

        // setloggedIn(true);
        return res;
      } else {
        console.log('Registration failed:', res);
        Toast.show({
          type: 'error',
          text1: res?.message || 'Registration failed. Please try again.',
          position: 'bottom',
        });
        return res;
      }
    } catch (e) {
      console.error('Registration error:', e);
      Toast.show({
        type: 'error',
        text1: 'An unexpected error occurred. Please try again.',
        position: 'bottom',
      });
    } finally {
      setloadingactivity(false);
    }
  };

  const Logout = async token => {
    setloadingactivity(true);
    try {
      if (!token) {
        setloadingactivity(false);
        return Alert.alert('Validation Error', token ? token : 'null');
      }

      const body = { refresh_token: token };
      const res = await postAuth('logout', body);

      if (res?.data) {
        console.log('res>>>', res);
        await GoogleSignin.signOut();
        await AsyncStorage.multiRemove(['@usertoken', '@userdetails']);
        dispatch({ type: 'SET_LOGGEDIN', payload: false });
        dispatch({ type: 'REMOVE_USER_DATA' });
        dispatch({ type: 'SET_TOKEN', payload: null });
        Toast.show({
          type: 'success',
          text1: 'Logged Out succesfully!',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.log('res>>>', res);
      console.error(error);
    } finally {
      setloadingactivity(false);
    }
  };
  const ForgotPswds = async email => {
    setuserEmail(email);
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
      const res = await postCommon('request-password-reset', body);

      if (res?.status === true) {
        setuserEmail(email);
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
  const Validateotp = async otp => {
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
        email: userEmail,
        otp,
      };
      const res = await postCommon('password-reset/verify-otp', body);

      if (res?.status === true) {
        setuserOtp(otp);
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
  const Changepswds = async (new_password, confirm_password) => {
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
        email: userEmail,
        new_password,
        confirm_password,
      };
      console.log(body);
      const res = await postCommon('reset-password', body);

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

  const NumberSignin = async (country_code, phone_number) => {
    setloadingactivity(true);

    try {
      var body = {
        country_code,
        phone_number,
      };

      const res = await postCommon('login/phone', body);
      if (res?.data?.status == 'success') {
        setloadingactivity(false);
        console.log('res>>', res);
        Toast.show({
          type: 'success',
          text1: res?.message,
          position: 'bottom',
        });
        return res?.status;
      } else {
        console.log('error', res);
        setloadingactivity(false);
        Toast.show({
          type: 'error',
          text1: res?.message,
          position: 'bottom',
        });
        return res?.status;
      }
    } catch (e) {
      setloadingactivity(false);
    }
  };
  const NumberOtpVerification = async (
    country_code,
    phone_number,
    otp,
    device_token,
  ) => {
    setloadingactivity(true);

    try {
      var body = {
        country_code,
        phone_number,
        otp,
        device_token,
      };

      const res = await postCommon('login/verify-2fa-phone', body);
      if (res?.data?.status == 'success') {
        setloadingactivity(false);
        console.log('res>>', res);
        AsyncStorage.setItem('@usertoken', res?.data?.access);
        AsyncStorage.setItem('@user_refreshtoken', res?.data?.refresh);
        AsyncStorage.setItem('@userdetails', JSON.stringify(res?.data.user));
        await AsyncStorage.setItem(
          '@user_activePlan',
          JSON.stringify(res?.data?.user?.subscription_status),
        );
        dispatch({
          type: 'SET_TOKEN',
          payload: res?.data?.access,
        });
        dispatch({
          type: 'DEVICE_TOKEN',
          payload: device_token,
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
        dispatch({
          type: 'SET_USER_ACTIVE_SUBSCRIPTION',
          payload: res?.data?.user?.subscription_status,
        });
        setloggedIn(true);
        return res?.status;
      } else {
        console.log('error', res);
        setloadingactivity(false);
        return res?.status;
      }
    } catch (e) {
      setloadingactivity(false);
    }
  };
  const AddDetails = async (
    id,
    pincode,
    address,
    lat,
    long,
    experience,
    vehicleType,
    idproof,
    document,
    referralCode,
  ) => {
    setloadingactivity(true);
    console.log(id);
    try {
      const formData = new FormData();

      // Add product details
      formData.append('years_of_experience', experience);
      formData.append('base_postal_code', pincode);
      formData.append('specialization', vehicleType);
      formData.append('uploaded_documents', document);
      formData.append('uploaded_documents_type', idproof);
      formData.append('base_address', address);
      formData.append('latitude', lat);
      formData.append('longitude', long);
      formData.append('referral_code', referralCode);

      const res = await patchFormdatatAuth(
        `mechanic/profile/${id}/edit`,
        formData,
      );
      console.log('res>>', res);

      if (res?.status === true) {
        AsyncStorage.setItem('@userdetails', JSON.stringify(res?.data?.user));

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
      } else {
        console.log('errr');
        Toast.show({
          type: 'error',
          text1: res?.data?.details,
          position: 'bottom',
        });
        setloadingactivity(false);
      }
    } catch (e) {
      setloadingactivity(false);
    }
  };

  const FacebookLogin = async () => {
    try {
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        Alert.alert('User cancelled the login process');
      }

      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        Alert.alert('Something went wrong obtaining access token');
      }

      const graphResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture.type(large)&access_token=${data.accessToken}`,
      );

      const userInfo = await graphResponse.json();

      if (data && userInfo) {
        const body = {
          first_name: userInfo?.first_name,
          last_name: userInfo?.last_name,
          email: userInfo?.email,
          image_url: userInfo?.picture?.data?.url,
          account_type: 'mechanic',
        };
        const res = await postGoogle('facebook/login', body);

        if (res?.status === true) {
          await AsyncStorage.setItem('@usertoken', res?.data?.access);
          await AsyncStorage.setItem('@user_refreshtoken', res?.data?.refresh);
          await AsyncStorage.setItem(
            '@userdetails',
            JSON.stringify(res?.data.user),
          );

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
          {
            res?.data?.user?.mechanic_profile?.is_verified &&
              dispatch({
                type: 'SET_LOGGEDIN',
                payload: true,
              });
          }
          setloggedIn(true);

          setloadingactivity(false);
          return res;
        } else {
          console.warn('Login failed in FacebookLogin:', res);
          return res;
        }
      }
    } catch (e) {
      console.log('ERror in..FacebookLogin ', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        Register,
        Signin,
        SigninOtpVerify,
        GoogleLogin,
        Logout,
        ForgotPswds,
        Changepswds,
        loadingactivity,
        Validateotp,
        AddDetails,
        FacebookLogin,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
export { AuthProvider, AuthContext };
