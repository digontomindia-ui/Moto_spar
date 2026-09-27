import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { styles } from '../../assets/Css/ProfileCss';
import Header from '../../components/HOC/Header';
import Ion from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions';
import Colors from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CommonBtn from '../../components/HOC/CommonBtn';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAppToken } from '../../constants/GetAsyncStorageData';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Loading from '../../components/HOC/Loading';
import CustomAlert from '../../components/Atoms/CustomAlert';
import { postAuth } from '../../repository/Repo';

const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const userInfo = useSelector((state) => state.userData);
  const userRtoken = useSelector((state) => state.refreshToken);

  const [isAlertVisible, setAlertVisible] = useState(false);
  const [loadingactivity, setLoadingActivity] = useState(false);

  const Logout = async () => {
    setLoadingActivity(true);
    try {
      const token = await getAppToken();
      if (!token) {
        setLoadingActivity(false);
        return Alert.alert('Validation Error', 'Something went wrong');
      }

      const body = { refresh_token: userRtoken };
      const res = await postAuth('logout', body);

      if (res?.data) {
        await GoogleSignin.signOut();
        await AsyncStorage.multiRemove(['@usertoken', '@userdetails']);
        dispatch({ type: 'SET_LOGGEDIN', payload: false });
        dispatch({ type: 'REMOVE_USER_DATA' });
        dispatch({ type: 'SET_TOKEN', payload: null });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingActivity(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header screenName="My Profile" />
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image Section */}
        <View style={styles.imgConatiner}>
          <View style={styles.imgView}>
            <Image
              source={
                userInfo?.profile_picture
                  ? { uri: `https://api.motospar.com${userInfo.profile_picture}` }
                  : require('../../assets/images/defaultprofile.webp')
              }
              style={styles.profileImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.txtverybigbold}>{userInfo.full_name}</Text>
        </View>

        {/* Contact Info Section */}
        <View style={styles.infoContainer}>
          {userInfo?.phone_number ?
            <View style={styles.infoAlign}>
              <Ion name="call-outline" size={responsiveFontSize(2.5)} color={Colors.textColors.secondary} />
              <Text style={{ ...styles.txtsmall, color: Colors.textColors.secondary }}>
                {userInfo?.phone_number}
              </Text>
            </View>
            :
            null
          }
          {
            userInfo?.email ?
              <View style={styles.infoAlign}>
                <Ion name="mail-outline" size={responsiveFontSize(2.5)} color={Colors.textColors.secondary} />
                <Text style={{ ...styles.txtsmall, color: Colors.textColors.secondary }}>
                  {userInfo?.email}
                </Text>
              </View>
              :
              null
          }
        </View>

        <View style={styles.divider} />

        {/* Options Section */}
        <View>
          <TouchableOpacity activeOpacity={0.6} style={styles.optionbar} onPress={() => navigation.navigate('EditProfile')}>
            <Ion name="person-outline" size={responsiveFontSize(2.5)} color={Colors.textColors.primary} />
            <Text style={styles.txtmediumbold}>Manage My Account</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} style={styles.optionbar} onPress={() => navigation.navigate('AllOrders')}>
            <Ion name="cube-outline" size={responsiveFontSize(2.5)} color={Colors.textColors.primary} />
            <Text style={styles.txtmediumbold}>My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} style={styles.optionbar} onPress={() => navigation.navigate('Wishlist')}>
            <Ion name="heart-outline" size={responsiveFontSize(2.5)} color={Colors.textColors.primary} />
            <Text style={styles.txtmediumbold}>My Wishlist</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} style={styles.optionbar} onPress={() => navigation.navigate('Address')}>
            <Ion name="location-outline" size={responsiveFontSize(2.5)} color={Colors.textColors.primary} />
            <Text style={styles.txtmediumbold}>My Addresses</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Support Section */}
        <View>
          <TouchableOpacity activeOpacity={0.6} style={styles.optionbar} onPress={() => navigation.navigate('ContactUs')}>
            <Ion name="call-outline" size={responsiveFontSize(2.5)} color={Colors.textColors.primary} />
            <Text style={styles.txtmediumbold}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} style={styles.optionbar} onPress={() => navigation.navigate('Terms')}>
            <Ion name="document-outline" size={responsiveFontSize(2.5)} color={Colors.textColors.primary} />
            <Text style={styles.txtmediumbold}>Terms & Policy</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={{ ...styles.alignment, marginVertical: responsiveWidth(4) }}>
          <CommonBtn height={5} title="Log Out" onpress={() => setAlertVisible(true)} bgcolor="red" />
        </View>

        {/* Custom Alert and Loading */}
        {isAlertVisible && (
          <CustomAlert
            title="Log Out"
            body="Are you sure you want to Logout?"
            visible={isAlertVisible}
            onClose={() => setAlertVisible(false)}
            onConfirm={Logout}
          />
        )}
        {loadingactivity && <Loading />}
      </ScrollView>
    </View>
  );
};

export default Profile;
