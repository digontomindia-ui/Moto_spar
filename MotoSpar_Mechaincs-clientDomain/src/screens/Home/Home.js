import { View, Text, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { styles } from '../../assets/Css/HomeCss';
import Colors from '../../constants/Colors';
import { HomeContext } from '../../context/HomeContext';
import Mapbox from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import { MAPBOX_ACCESS_TOKEN } from '../../constants/MapboxConfig';

const Home = () => {
    const navigation = useNavigation();
    const [lat, setlat] = useState('');
    const [long, setlong] = useState('');

    const { fetchNotifications, GetStatistics, statistics, GetJobs,
        mechanic_Jobs, loadingactivity, } = useContext(HomeContext);
    const [shippingCoords, setShippingCoords] = useState([]);


    Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
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
        console.log('Location permission granted:', hasPermission);
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
  

    useEffect(() => {
        GetStatistics();
        fetchNotifications();
        getLocation()
        GetJobs(0)
    }, [])

    const origin = [long, lat]; // mechaninc location (longitude, latitude)

    const [route, setRoute] = useState(null);

    useEffect(() => {
        const getRoute = async () => {
            const res = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`
            );
            const json = await res.json();
            setRoute(json.routes[0].geometry.coordinates);
           
        };
        const coords = mechanic_Jobs.map((item) => [
            parseFloat(item?.order_details?.shipping_address_details?.longitude),
            parseFloat(item?.order_details?.shipping_address_details?.latitude),
            // console.log(item?.order_details?.shipping_address_details?.longitude),
        ]);

        setShippingCoords(coords);
        // getRoute();
    }, []);

    return (

        <View style={[styles.container, { flex: 1 }]}>
            {/* Main content area */}
            <View style={{ flex: 1 }}>
                {/* Header */}

                <View style={styles.subcontainer}>
                    <View style={{ ...styles.CardTextflex, justifyContent: 'space-between', marginTop: 10 }}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                        >
                            <IO
                                name='menu-outline'
                                size={responsiveFontSize(4)}
                                color={'black'}
                            />
                        </TouchableOpacity>
                        <View style={styles.header}>
                            <Text style={{ ...styles.txt20bold }}>MotoSpar</Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>
                    <View style={styles.divider} />
                </View>

                {/* Map */}
                <View style={{ width: '100%', height: '85%', alignSelf: 'center' }}>

                    {lat && long ? (
                        <Mapbox.MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.NavigationNight} // more like Google Maps
                            logoEnabled={false}
                            compassEnabled={true}>
                            <Mapbox.Camera
                                zoomLevel={17}
                                centerCoordinate={origin}
                                followUserMode="normal"
                            />
                            <Mapbox.PointAnnotation id="origin" coordinate={origin} />
                            {shippingCoords.map((coord, index) => (
                                <Mapbox.PointAnnotation
                                    key={`point-${index}`}
                                    id={`point-${index}`}
                                    coordinate={coord}
                                />
                            ))}

                        </Mapbox.MapView>
                    ) : (
                        <Text style={{ ...styles.txt20bold, alignSelf: 'center', marginTop: 20 }}>Fetching location...</Text>
                    )}

                </View>
            </View>

            {/* Sticked Bottom Text */}
            <View style={{
                padding: 20,
            }}>
                {
                    statistics && statistics?.jobs_last_2_hours !== 0 ?
                        <View style={{
                            ...styles.card,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 20,
                            padding: 10
                        }}>
                            <View>
                                <View style={styles.CardTextflex}>
                                    <Text style={{ ...styles.txt16bold }}>New Job Request</Text>
                                    <View style={{ ...styles.miniCard, backgroundColor: Colors.btnColors.primary, borderWidth: 0 }}></View>
                                </View>
                                <Text style={styles.txt14}>{`You have ${statistics?.jobs_last_2_hours} new job requests`}</Text>
                            </View>
                            <TouchableOpacity style={{
                                ...styles.miniCard, borderWidth: 0,
                                backgroundColor: Colors.btnColors.primary,
                                paddingHorizontal: 10
                            }} onPress={() => navigation.navigate('Bottomtabs', { screen: 'Job' })}>
                                <Text style={{ ...styles.txt12bold, color: 'white' }}>View Jobs</Text>
                            </TouchableOpacity>
                        </View> :
                        null
                }

                <View style={{
                    ...styles.card,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                    padding: 10
                }}>
                    <View>
                        <View style={styles.CardTextflex}>
                            <Text style={{ ...styles.txt16bold }}>On Going Job</Text>
                            <View style={{ ...styles.miniCard, backgroundColor: Colors.btnColors.pending, borderWidth: 0 }}></View>
                        </View>
                        <Text style={styles.txt14}>{statistics && statistics?.pending_jobs == 1 || 0 ? `${statistics ? statistics?.pending_jobs : 'N/A'} job is in progress` : `${statistics ? statistics?.pending_jobs : 'N/A'} jobs are in progress`}</Text>
                    </View>
                    {
                        statistics && statistics?.pending_jobs !== 0 ?
                            <TouchableOpacity style={{
                                ...styles.miniCard, borderWidth: 0,
                                backgroundColor: Colors.btnColors.primary,
                                paddingHorizontal: 10
                            }} onPress={() => navigation.navigate('OngoingJobList')}>
                                <Text style={{ ...styles.txt12bold, color: 'white' }}>View Jobs</Text>
                            </TouchableOpacity>
                            :
                            null
                    }
                </View>
            </View>
        </View >
    )
}

export default Home
