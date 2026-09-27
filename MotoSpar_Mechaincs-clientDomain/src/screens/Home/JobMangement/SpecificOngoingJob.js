import { View, Text, TouchableOpacity, Image, Share, Alert, Linking, Platform, PermissionsAndroid } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'

import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions'
import { useNavigation } from '@react-navigation/native'
import { styles } from '../../../assets/Css/JobCss';
import CommonBtn from '../../../components/HOC/CommonBtn';
import Colors from '../../../constants/Colors';
import { HomeContext } from '../../../context/HomeContext';
import { useSelector } from 'react-redux';
import MapView, { Marker, Polyline } from 'react-native-maps';
import OTPModal from '../../../components/Modals/OTPModal';
import Geolocation from '@react-native-community/geolocation';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_ACCESS_TOKEN } from '../../../constants/MapboxConfig';


const SpecificOngoingJob = () => {


    const navigation = useNavigation()
    const {

        SpecificAcceptedJob,

        setValidatedOtp_data,
        ValidatedOtp_data,

        JobStart,
        loadingactivity,
    } = useContext(HomeContext);
    const user = useSelector(state => state.userData);
    const [long, setlong] = useState(null);
    const [lat, setlat] = useState(null);
    const [Otp, setOtp] = useState('');
    const [showModal, setshowModal] = useState(false)

    // location of both users
    const MechanicLocation = { latitude: lat, longitude: long };
    const CustomerLocation = { latitude: SpecificAcceptedJob?.order_details?.shipping_address_details?.latitude, longitude: SpecificAcceptedJob?.order_details?.shipping_address_details?.longitude };


    const sendSMS = (phoneNumber, message) => {
        const body = encodeURIComponent(message || '');
        const url = Platform.select({
            ios: `sms:${phoneNumber}&body=${body}`,     // iOS uses &body
            android: `sms:${phoneNumber}?body=${body}`, // Android uses ?body
        });

        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert("Error", "SMS is not supported on this device");
                }
            })
            .catch((err) => console.error('An error occurred', err));
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




    Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

    // to redirect on google maps with the mechanic to customer location path

     const getLocation = async () => {
       
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;

        const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                position => resolve(position),
                error => reject(error),
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                },
            );
        });
    };
     const position = await getCurrentLocation();
     const { latitude, longitude } = position.coords;
   
        setlat(latitude);
        setlong(longitude);
    };
    const origin = [long, lat]; // Mechanic location(longitude, latitude)
    const destination = [SpecificAcceptedJob?.order_details?.shipping_address_details?.longitude, SpecificAcceptedJob?.order_details?.shipping_address_details?.latitude]; // Customer Location (longitude, latitude)

    const [route, setRoute] = useState(null);

    useEffect(() => {
        const getRoute = async () => {
            const res = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`
            );
            const json = await res.json();
            setRoute(json.routes[0].geometry.coordinates);

        };
        getRoute();
        getLocation()
    }, []);

    return (
        <View style={[styles.container, { flex: 1 }]}>
            {/* Main content area */}
            <View style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.subcontainer}>
                    <View style={styles.CardTextflex}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.goBack()}
                        >
                            <IO
                                name='arrow-back-outline'
                                size={responsiveFontSize(3)}
                                color={'black'}
                            />
                        </TouchableOpacity>
                        <View style={styles.header}>
                            <Text style={{ ...styles.txt20bold }}>Job ({SpecificAcceptedJob?.order_details?.order_code})</Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>
                    <View style={{
                        ...styles.divider, marginBottom: 0
                    }} />

                </View>


                {/* Invite stats */}
                <View style={[styles.subcontainer, { flex: 1 }]}>

                    <View style={styles.CardTextflex}>
                        <View>
                            <View style={styles.CardTextflex}>
                                <View
                                    style={{
                                        marginHorizontal: 10,
                                        width: responsiveWidth(10),
                                        height: responsiveWidth(10),
                                        borderRadius: responsiveWidth(5),
                                        backgroundColor: Colors?.btnColors?.primary,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text
                                        style={{ ...styles.txt22bold, color: 'white' }}
                                    >
                                        {SpecificAcceptedJob?.order_details?.customer_details?.first_name?.slice(0, 1)}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.txt16}>{SpecificAcceptedJob?.order_details?.customer_details?.full_name}</Text>
                                    <Text style={styles.txt12}>{SpecificAcceptedJob?.order_details?.customer_details?.phone_number}</Text>
                                </View>
                            </View>

                        </View>
                        <View style={{ ...styles.CardTextflex, gap: 15 }}>

                            <TouchableOpacity activeOpacity={0.7} onPress={() => Linking.openURL(`tel:${SpecificAcceptedJob?.order_details?.customer_details?.phone_number}`)}>
                                <IO
                                    name='call-outline'
                                    size={responsiveFontSize(3)}
                                    color={Colors.btnColors.success}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.7} onPress={() =>
                                sendSMS(
                                    SpecificAcceptedJob?.order_details?.customer_details?.phone_number,
                                    `Hey I am ${user?.full_name}, your mechanic...`
                                )
                            }
                            >
                                <IO
                                    name='chatbubble-ellipses-outline'
                                    size={responsiveFontSize(3)}
                                    color={Colors.btnColors.primary}
                                />
                            </TouchableOpacity>

                        </View>




                    </View>
                    {/* Map */}
                    <View style={{ width: '100%', height: '95%', alignSelf: 'center', marginTop: 10 }}>
                        {
                            origin && destination && lat && long ?
                                <Mapbox.MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.NavigationNight} // more like Google Maps
                                    logoEnabled={false}
                                    compassEnabled={true}>
                                    <Mapbox.Camera
                                        zoomLevel={14}
                                        centerCoordinate={origin}
                                        // followUserLocation={true}
                                        followUserMode="normal"
                                    />
                                    <Mapbox.PointAnnotation id="origin" coordinate={origin} />
                                    <Mapbox.PointAnnotation id="destination" coordinate={destination} />
                                    {route && (
                                        <Mapbox.ShapeSource
                                            id="routeSource"
                                            shape={{
                                                type: 'Feature',
                                                geometry: {
                                                    type: 'LineString',
                                                    coordinates: route,
                                                },
                                            }}
                                        >
                                            <Mapbox.LineLayer id="routeFill" style={{ lineColor: 'blue', lineWidth: 4 }} />
                                        </Mapbox.ShapeSource>
                                    )}
                                </Mapbox.MapView> :
                                <Text style={{ ...styles.txt20bold, alignSelf: 'center', marginTop: 20 }}>Fetching location...</Text>
                        }
                    </View>
                </View>

            </View>

            {/* Sticked Bottom Text */}
            <View style={{
                padding: 20,
            }}>
                {SpecificAcceptedJob && SpecificAcceptedJob?.job_status === 'pending' &&

                    <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                        <IO
                            name='information-circle-outline'
                            size={responsiveFontSize(2.5)}
                            color={'black'}
                        />
                        <Text style={styles.txt12bold}>After you reach to the destination please click on start to start the job.</Text>
                    </View>
                }
                <View style={styles.CardTextflex}>
                    <CommonBtn height={40} title={'Cancel'} textColor={'white'} onpress={() => navigation.navigate('CancelJob')} width={44} bgcolor={'red'} />
                    {
                        SpecificAcceptedJob && SpecificAcceptedJob?.job_status === 'in_progress' ?
                            <CommonBtn height={40} title={'Done'} textColor={'white'} onpress={() => navigation.navigate('JobPictureUpload')} width={44} bgcolor={Colors.btnColors.success} />
                            :
                            <CommonBtn height={40} title={'Start'} textColor={'white'} onpress={() =>
                                JobStart(SpecificAcceptedJob?.id)
                                // setshowModal(true)
                            } width={44} bgcolor={Colors.btnColors.success} />

                    }

                </View>
            </View>


        </View>
    )
}




export default SpecificOngoingJob
