import { View, Text, ImageBackground, TouchableOpacity, Image, Platform, PermissionsAndroid } from 'react-native'
import React, { use, useContext, useEffect, useState } from 'react'
import { styles } from '../../assets/Css/AuthCss'
import Colors from '../../constants/Colors'
import { Passwordinput, Textinput } from '../../components/HOC/Textinput'
import CommonBtn from '../../components/HOC/CommonBtn'
import { useNavigation } from '@react-navigation/native'
import { responsiveHeight } from 'react-native-responsive-dimensions'
import { Dropdown } from 'react-native-element-dropdown'
import { pick, types } from '@react-native-documents/picker'
import { useSelector } from 'react-redux'
import { AuthContext } from '../../context/Authcontext'
import Loading from '../../components/HOC/Loading'
import Geolocation from '@react-native-community/geolocation'

const DetailScreen = () => {
    const user = useSelector(state => state.userData);
    const { AddDetails, loadingactivity } = useContext(AuthContext);
    const navigation = useNavigation();
    const [pincode, setPincode] = useState('');
    const [address, setaddress] = useState('')
    const [experience, setExperience] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [idProof, setIdProof] = useState('');
    const [document, setdocument] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [long, setlong] = useState('');
    const [lat, setlat] = useState('');

    // error state
    const [errors, setErrors] = useState({
        pincode: '',
        experience: '',
        vehicleType: '',
        idProof: '',
        document: '',
        address: ''
    });

    const VehicleData = [
        { label: 'Two-Wheeler', data: 'Two-Wheeler' },
        { label: 'Three-Wheeler', data: 'Three-Wheeler' },
        { label: 'Four-Wheeler', data: 'Four-Wheeler' },
        { label: 'Heavy Vehicles', data: 'Heavy Vehicles' },
    ];

    const IDData = [
        { label: 'Adhar card', data: 'Adhar card' },
        { label: 'PAN Card', data: 'PAN Card' },
        { label: 'Driving License', data: 'Driving License' },
        { label: 'Voter Id', data: 'Voter Id' },
    ];

    const handlePick = async () => {
        try {
            const result = await pick({
                type: [types.images, types.pdf],
                allowMultiSelection: false,
            });

            const file = result[0];
            setdocument(result[0])
            console.log('File Picked', file);
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Error picking file',
                text2: err?.message || 'Unknown error',
                position: 'bottom',
            });
        }
    };

    const validateFields = () => {
        const newErrors = {
            pincode: pincode ? '' : 'Pincode is required',
            experience: experience ? '' : 'Experience is required',
            vehicleType: vehicleType ? '' : 'Select a vehicle type',
            idProof: idProof ? '' : 'Select an ID proof',
            document: document ? '' : 'Document required',
            address: address ? '' : "Full address required"
        };

        setErrors(newErrors);

        return Object.values(newErrors).every(err => err === '');
    };

    const handleSubmit = () => {
        if (validateFields()) {
            // proceed if valid
            //   navigation.navigate('NextScreen'); // Replace with your actual screen
            AddDetails(user?.mechanic_profile?.id, pincode, address, lat, long, experience, vehicleType, idProof, document, referralCode)
        }
    };
    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                ]);

                return (
                    granted['android.permission.ACCESS_FINE_LOCATION'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.ACCESS_COARSE_LOCATION'] ===
                    PermissionsAndroid.RESULTS.GRANTED
                );
            }
            return true;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const getLocation = async () => {
        console.log('iuksjhg')
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;

        Geolocation.getCurrentPosition(info => {
            setlat(info?.coords?.latitude);
            setlong(info?.coords?.longitude);
        });
    };

    useEffect(() => {
        getLocation();
    }, []);

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/backgroundMap.png')}
                style={{ width: '100%', height: '55%' }}
            />
            <View style={styles.overlayContainer}>
                <View style={styles.card}>
                    <Text style={{ ...styles.txt20bold, marginBottom: 10 }}>Personal Information.</Text>
                    <Text style={{ ...styles.txt14, marginBottom: 10 }}>Fill the basic details.</Text>
                    <Textinput
                        placeholder={'Enter full Address'}
                        inputType={'default'}
                        margin={1}
                        value={address}
                        onChangeText={setaddress}
                    />
                    {errors.address ? <Text style={{ color: 'red' }}>{errors.address}</Text> : null}
                    <Textinput
                        placeholder={'Service Area/Pincode'}
                        inputType={'numeric'}
                        margin={1}
                        value={pincode}
                        onChangeText={setPincode}
                    />
                    {errors.pincode ? <Text style={{ color: 'red' }}>{errors.pincode}</Text> : null}

                    <Textinput
                        placeholder={'Years of Experience'}
                        inputType={'numeric'}
                        margin={1}
                        maxlength={2}
                        value={experience}
                        onChangeText={setExperience}
                    />
                    {errors.experience ? <Text style={{ color: 'red' }}>{errors.experience}</Text> : null}

                    <View style={styles.txtinputContainer}>
                        <Dropdown
                            style={{
                                height: responsiveHeight(5),
                                width: '100%',
                                color: Colors.textColors.primary
                            }}
                            placeholderStyle={{ ...styles.txt14, color: Colors.textColors.primary, marginHorizontal: 10 }}
                            selectedTextStyle={{ ...styles.txt14, color: Colors.textColors.primary, marginHorizontal: 10 }}
                            containerStyle={{
                                flex: 1,
                                backgroundColor: Colors.background.primary,

                            }}
                            iconStyle={styles.iconStyle}
                            labelField="label"
                            itemTextStyle={{ color: Colors.textColors.primary }}
                            valueField="data"
                            data={VehicleData}
                            maxHeight={250}
                            placeholder="Select Specialisation Vehicle"
                            value={vehicleType}
                            onChange={item => setVehicleType(item.data)}
                        />
                    </View>
                    {errors.vehicleType ? <Text style={{ color: 'red' }}>{errors.vehicleType}</Text> : null}

                    <View style={styles.txtinputContainer}>
                        <Dropdown
                            style={{
                                height: responsiveHeight(5),
                                width: '100%',
                                color: Colors.textColors.primary
                            }}
                            placeholderStyle={{ ...styles.txt14, color: Colors.textColors.primary, marginHorizontal: 10 }}
                            selectedTextStyle={{ ...styles.txt14, color: Colors.textColors.primary, marginHorizontal: 10 }}
                            containerStyle={{
                                flex: 1,
                                backgroundColor: Colors.background.primary,
                            }}
                            iconStyle={styles.iconStyle}
                            itemTextStyle={{ color: Colors.textColors.primary }}
                            labelField="label"
                            valueField="data"
                            data={IDData}
                            maxHeight={250}
                            placeholder="Select ID"
                            value={idProof}
                            onChange={item => setIdProof(item.data)}
                        />
                    </View>
                    {errors.idProof ? <Text style={{ color: 'red' }}>{errors.idProof}</Text> : null}

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={{ ...styles.txtinputContainer, height: responsiveHeight(8) }}
                        onPress={handlePick}
                    >
                        {document ? (
                            <Text style={{ ...styles.txt12, textAlign: 'center', marginTop: 4, color: 'green' }}>
                                {document?.name}
                            </Text>
                        ) : <>
                            <Text style={{ ...styles.txt14, textAlign: 'center' }}>Upload Document</Text>
                            <Text style={{ ...styles.txt12, textAlign: 'center' }}>PNG, PDF, JPG</Text>
                        </>}

                    </TouchableOpacity>
                    {errors.document ? <Text style={{ color: 'red' }}>{errors.document}</Text> : null}

                    <Textinput
                        placeholder={'Referral Code (Optional)'}
                        inputType={'default'}
                        margin={1}
                        value={referralCode}
                        onChangeText={setReferralCode}
                    />

                    <CommonBtn
                        title={'Submit'}
                        height={40}
                        textColor={Colors.background.primary}
                        margin={2}
                        onpress={handleSubmit}
                    />

                    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Register')}>
                        <Text style={{
                            ...styles.txt14,
                            marginBottom: 10,
                            textAlign: 'center',
                            color: Colors.btnColors.primary
                        }}>
                            Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            {loadingactivity ? <Loading /> : null}
        </View>
    );
};

export default DetailScreen