import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Geolocation from 'react-native-geolocation-service';
import {styles} from '../../../assets/Css/ProfileCss';

import Header from '../../../components/HOC/Header';
import {Textinput, Textinputname} from '../../../components/HOC/Textinput';
import Colors from '../../../constants/Colors';
import CommonBtn from '../../../components/HOC/CommonBtn';
import {HomeContext} from '../../../context/HomeContext';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';
import {ScrollView} from 'react-native-gesture-handler';

const EditAddress = ({route}) => {
  const data = route?.params?.data || null;
  const [name, setname] = useState(data ? data?.name : '');
  const [email, setemail] = useState(data ? data?.email : '');
  const [mobile, setmobile] = useState(data ? data?.phone_number : '');
  const [address, setaddress] = useState(data ? data?.street_address : '');
  const [state, setstate] = useState(data ? data?.state : '');
  const [city, setcity] = useState(data ? data?.city : '');
  const [pincode, setpincode] = useState(data ? data?.postal_code : '');
  const [addType, setaddType] = useState(
    data ? (data?.address_type == 'Home' ? 'Home' : 'Office') : '',
  );
  const [lat, setlat] = useState(null);
  const [long, setlong] = useState(null);
  const {EditShippingAddress, message, AddShippingaddress} =
    useContext(HomeContext);
  const userInfo = useSelector(state => state.userData);

  const HandleSubmit = async () => {
    if (
      !name ||
      !email ||
      !mobile ||
      !address ||
      !state ||
      !city ||
      !pincode ||
      !addType
    ) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all details.',
        position: 'bottom',
      });
    }
    {
      data
        ? await EditShippingAddress(
            data?.id,
            mobile,
            address,
            state,
            city,
            pincode,
            addType,
            lat,
            long,
          )
        : await AddShippingaddress(
            userInfo?.id,
            name,
            email,
            mobile,
            address,
            state,
            city,
            pincode,
            addType,
            lat,
            long,
          );
    }
    Toast.show({
      type: 'success',
      text1: 'Address added succesfully!',
      position: 'bottom',
    });
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      position => {
        setlat(position.coords.latitude);
        setlong(position.coords.longitude);
      },
      error => {
        console.error(error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

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
        screenName={'Add New Address'}
        backIcon={true}
        navigateTo={'Address'}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.subcontainer}>
          <View style={styles.spacewide}>
            <Text style={styles.txtmediumbold}>Full Name</Text>
            <Textinputname
              placeholder={'Enter Full Name'}
              value={name}
              onChangeText={setname}
              customWidth={true}
              bgcolor={Colors.textInputColors.secondary}
            />
          </View>
          <View style={styles.spacewide}>
            <Text style={styles.txtmediumbold}>Email</Text>
            <Textinput
              placeholder={'Enter Email'}
              value={email}
              onChangeText={setemail}
              bgcolor={Colors.textInputColors.secondary}
            />
          </View>
          <View style={styles.spacewide}>
            <Text style={styles.txtmediumbold}>Mobile</Text>
            <Textinputname
              placeholder={'Enter Phone Number'}
              value={mobile}
              onChangeText={setmobile}
              maxlength={10}
              keyboardType={'Numeric'}
              customWidth={true}
              bgcolor={Colors.textInputColors.secondary}
            />
          </View>
          <View style={styles.spacewide}>
            <Text style={styles.txtmediumbold}>Address</Text>
            <Textinputname
              placeholder={'Enter Your Address'}
              value={address}
              onChangeText={setaddress}
              customWidth={true}
              bgcolor={Colors.textInputColors.secondary}
            />
          </View>
          <View style={styles.spacewide}>
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
          <View style={styles.spacewide}>
            <Text style={styles.txtmediumbold}>City</Text>
            <Textinputname
              placeholder={'Enter City'}
              value={city}
              onChangeText={setcity}
              customWidth={true}
              bgcolor={Colors.textInputColors.secondary}
            />
          </View>
          <View style={styles.spacewide}>
            <Text style={styles.txtmediumbold}>Pin Code</Text>
            <Textinputname
              placeholder={'Enter Pin Code'}
              value={pincode}
              onChangeText={setpincode}
              customWidth={true}
              bgcolor={Colors.textInputColors.secondary}
            />
          </View>
          <View style={styles.addtypeView}>
            <Text style={styles.txtmediumbold}>Address Type: </Text>
            <TouchableOpacity
              activeOpacity={0.6}
              style={[
                styles.radioButton,
                addType === 'Home' && styles.selectedButton,
              ]}
              onPress={() => setaddType('Home')}>
              <Text style={styles.radioText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.6}
              style={[
                styles.radioButton,
                addType === 'Office' && styles.selectedButton,
              ]}
              onPress={() => setaddType('Office')}>
              <Text style={styles.radioText}>Office</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.spacewide}>
            <CommonBtn
              height={5}
              title={data ? 'Update' : 'Submit'}
              onpress={HandleSubmit}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditAddress;
