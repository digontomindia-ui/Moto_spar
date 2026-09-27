import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import Header from '../../../components/HOC/Header';
import { Textinput, Textinputname } from '../../../components/HOC/Textinput';
import CommonBtn from '../../../components/HOC/CommonBtn';
import { styles } from '../../../assets/Css/ProfileCss';
import Colors from '../../../constants/Colors';
import { ScrollView } from 'react-native-gesture-handler';
import FA5 from 'react-native-vector-icons/FontAwesome5';
import { Fonts } from '../../../constants/Fonts';
import Toast from 'react-native-toast-message';
import ImageCropPicker from 'react-native-image-crop-picker';
import { HomeContext } from '../../../context/HomeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getAppToken } from '../../../constants/GetAsyncStorageData';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { postAuth } from '../../../repository/Repo';
import Loading from '../../../components/HOC/Loading';
import { Picker } from '@react-native-picker/picker';
import { responsiveWidth } from 'react-native-responsive-dimensions';
const EditProfile = () => {
  const userInfo = useSelector(state => state.userData);
  const { EditProfile, message } = useContext(HomeContext);
  const [firstName, setfirstName] = useState(
    userInfo?.first_name ? userInfo?.first_name : '',
  );
  const [lastName, setlastName] = useState(
    userInfo?.last_name ? userInfo?.last_name : '',
  );
  const [email, setemail] = useState(userInfo?.email ? userInfo?.email : 'N/A');
  const [mobile, setmobile] = useState(
    userInfo?.phone_number ? userInfo?.phone_number : '',
  );
  const [address, setaddress] = useState(
    userInfo?.address ? userInfo?.address : '',
  );
  const [state, setstate] = useState(userInfo?.state ? userInfo?.state : '');
  const [city, setcity] = useState(userInfo?.city ? userInfo?.city : '');
  const [pincode, setpincode] = useState(
    userInfo?.postal_code ? userInfo?.postal_code : '',
  );
  const [profile_picture, setprofile_picture] = useState(
    userInfo?.profile_picture ? userInfo?.profile_picture : '',
  );
  const [temp_profile, settemp_profile] = useState('');

  const [loadingactivity, setloadingactivity] = useState(false);
  const hnadlePickimage = async () => {
    try {
      const response = await ImageCropPicker.openPicker({
        width: 400, // Set the width to 400
        height: 400, // Set the height to 400
        cropping: true,
        includeBase64: true, // Include Base64 if required for your backend
        freeStyleCropEnabled: true, // Allow free cropping
      });


      if (response) {
        // Set the selected image to profile_picture
        settemp_profile(response?.path)
        setprofile_picture(response);

      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        position: 'bottom',
      });

      // Show an error toast message
      useEffect(() => {
        Toast.show({
          type: 'error',
          text1: 'Something went wrong',
          text2: error?.message || 'Please try again.',
          position: 'bottom',
        });
      }, [error]);
    }
  };
  const HandleEditProfile = async () => {
    const updatedData = {
      firstName,
      lastName,
      mobile,
      address,
      state,
      pincode,
    };
    if (profile_picture && typeof profile_picture !== 'string') {
      updatedData.profile_picture = profile_picture; // Add image only if it's updated
    }

    await EditProfile(updatedData);


  };

  const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
  ];
  return (
    <View style={styles.container}>
      <Header
        screenName={'Manage Account'}
        backIcon={true}
        navigateTo={'Profile'}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.alignment}>
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.txtverybigbold}>Personal Detail</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.imgConatiner}
            onPress={() => hnadlePickimage('profile')}>
            <View>
              <Image
                source={
                  temp_profile // show picked image first
                    ? { uri: temp_profile }
                    : userInfo?.profile_picture // else show backend image
                      ? { uri: `https://api.motospar.com${userInfo.profile_picture}` }
                      : require('../../../assets/images/defaultprofile.webp') // fallback
                }
                style={styles.profileImg}
              />
            </View>
            <View style={styles.editProfileImg}>
              <FA5 name="pen" color={Colors.background} size={Fonts.font8} />
            </View>
          </TouchableOpacity>
          <Text style={styles.txtmediumbold}>First Name</Text>
          <Textinputname
            placeholder={'Enter Full Name'}
            value={firstName}
            onChangeText={setfirstName}
            customWidth={true}
            bgcolor={Colors.textInputColors.secondary}
          />
        </View>
        <View style={styles.alignment}>
          <Text style={styles.txtmediumbold}>Last Name</Text>
          <Textinputname
            placeholder={'Enter Full Name'}
            value={lastName}
            onChangeText={setlastName}
            customWidth={true}
            bgcolor={Colors.textInputColors.secondary}
          />
        </View>
        <View style={styles.alignment}>
          <Text style={styles.txtmediumbold}>Email</Text>
          <Textinput
            placeholder={'Enter Email'}
            value={email}
            onChangeText={setemail}
            bgcolor={Colors.textInputColors.secondary}
            editable={false}
          />
        </View>
        <View style={styles.alignment}>
          <Text style={styles.txtmediumbold}>Mobile</Text>
          <Textinputname
            placeholder={'Enter Phone Number'}
            value={mobile}
            onChangeText={setmobile}
            customWidth={true}
            maxlength={10}
            keyboardType={'Numeric'}
            bgcolor={Colors.textInputColors.secondary}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.alignment}>
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.txtverybigbold}>Personal Address Detail</Text>
          </View>
          <Text style={styles.txtmediumbold}>Address</Text>
          <Textinputname
            placeholder={'Enter Your Address'}
            value={address}
            onChangeText={setaddress}
            customWidth={true}
            bgcolor={Colors.textInputColors.secondary}
          />
        </View>
        <View style={styles.alignment}>
          <Text style={styles.txtmediumbold}>State</Text>
          <Picker
            selectedValue={state}
            style={styles.picker}
            onValueChange={itemValue => setstate(itemValue)}>
            <Picker.Item label="Select State" value="" />
            {indianStates.map((stateName, index) => (
              <Picker.Item key={index} label={stateName} value={stateName} />
            ))}
          </Picker>
        </View>
        <View style={styles.alignment}>
          <Text style={styles.txtmediumbold}>Pin Code</Text>
          <Textinputname
            placeholder={'Enter Pin Code'}
            value={pincode}
            onChangeText={setpincode}
            customWidth={true}
            bgcolor={Colors.textInputColors.secondary}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.alignment}>
          <CommonBtn height={5} title={'Update'} onpress={HandleEditProfile} />
        </View>
        {loadingactivity ? <Loading /> : null}
      </ScrollView>
    </View>
  );
};

export default EditProfile;
