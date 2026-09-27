import { View, Text, Alert } from 'react-native';
import React, { useContext, useState } from 'react';
import { styles } from '../../assets/Css/AuthCss';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Header from '../../components/HOC/Header';
import AuthButton from '../../components/HOC/AuthButton';
import { AuthContext } from '../../context/AuthContext';
import Loading from '../../components/HOC/Loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postAuth } from '../../repository/Repo';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getAppToken } from '../../constants/GetAsyncStorageData';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const Home = () => {
  const [loadingactivity, setloadingactivity] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userRtoken = useSelector(state => state.refreshToken);

  const Logout = async () => {
    setloadingactivity(true);
    if ((await getAppToken()) === '') {
      setloadingactivity(false);
      return Alert.alert('Validation Error', 'Something went wrong');
    } else {
      try {
        var body = {
          refresh_token: userRtoken,
        };
        const res = await postAuth('logout', body);
        console.log('>>res..Logout.', res);

        if (res?.data) {
          await GoogleSignin.hasPlayServices();
          // const userInfo = await GoogleSignin.signIn();
          // const serverAuthCode = userInfo.serverAuthCode;
          // const userToken = await GoogleSignin.getTokens();
          // const accessToken = userToken.accessToken;
          await GoogleSignin.signOut();
          await AsyncStorage.removeItem('@usertoken');
          await AsyncStorage.removeItem('@userdetails');
          dispatch({
            type: 'SET_LOGGEDIN',
            payload: false,
          });
          dispatch({
            type: 'REMOVE_USER_DATA',
          });
          dispatch({
            type: 'SET_TOKEN',
            payload: null,
          });
          setloadingactivity(false);
          Alert.alert('Success', res?.message);
        } else {
          setloadingactivity(false);
          Alert.alert('Error', res?.message);
        }
      } catch (e) {
        setloadingactivity(false);
        console.log('errorr... in Logout..authcontext', e);
      }
    }
  };
  return (
    <View style={{ backgroundColor: Colors.background }}>
      <Header homeHeader={true}/>
      <View style={styles.container}>
        {loadingactivity ? (
          <Loading />
        ) : (
          <AuthButton title={'Logout'} onpress={Logout} />
        )}
      </View>
    </View>
  );
};

export default Home;
