import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Auth/Login';
import Register from '../screens/Auth/Register';
import DetailScreen from '../screens/Auth/DetailScreen';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import Verification from '../screens/Auth/Verification';
import ResetPassword from '../screens/Auth/ResetPassword';
import Home from '../screens/Home/Home';
import Jobs from '../screens/Home/Jobs';
import Wallet from '../screens/Home/Wallet/Wallet';
import Profile from '../screens/Home/Profile';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Support from '../screens/Home/Support';
import { styles } from '../assets/Css/AuthCss';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ScrollView } from 'react-native-gesture-handler';
import Colors from '../constants/Colors';
import { AuthContext, AuthProvider } from '../context/Authcontext';
import OtpLoginVerification from '../screens/Auth/OtpLoginVerification';
import { useSelector } from 'react-redux';
import EditProfile from '../screens/Home/EditProfile';
import { HomeProvider } from '../context/HomeContext';
import { SERVER_URL } from '../constants/SERVER_URL';
import JobHistory from '../screens/Home/JobHistory';
import Refer from '../screens/Home/Refer';
import Transaction from '../screens/Home/Wallet/Transaction';
import Notification from '../screens/Home/Notification';
import SpecificOngoingJob from '../screens/Home/JobMangement/SpecificOngoingJob';

import CompletedJob from '../screens/Home/JobMangement/CompletedJob';
import OngoingJobList from '../screens/Home/JobMangement/OngoingJobList';
import Setting from '../screens/Home/Setting';
import CancelJob from '../screens/Home/JobMangement/CancelJob';
import JobPictureUpload from '../screens/Home/JobMangement/JobPictureUpload';
import SuccessScreen from '../screens/Home/JobMangement/SuccessScreen';
import VerificationScreen from '../screens/Auth/VerificationScreen';
import TopUpPayment from '../screens/Home/TopUpPayment';
import { SafeAreaView } from 'react-native-safe-area-context';
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const DrawerList = [
  { id: 1, label: 'Job History', navigateto: 'JobHistory' },
  // { id: 2, label: 'Opportunities', navigateto: '' },
  { id: 3, label: 'Refer Friends', navigateto: 'Refer' },
  { id: 4, label: 'Notification', navigateto: 'Notification' },
  { id: 5, label: 'Settings', navigateto: 'Setting' },
];
const AuthNavigation = () => {
  return (
    <AuthProvider>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LoginOtp"
          component={OtpLoginVerification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Verification"
          component={Verification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerificationScreen"
          component={VerificationScreen}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </AuthProvider>
  );
};

const DrawerNavigation = () => {
  const DrawerContent = props => <CustomDrawerContent {...props} />;

  return (
    <AuthProvider>
      <Drawer.Navigator
        initialRouteName="home"
        drawerContent={DrawerContent}
        screenOptions={{
          drawerStyle: {
            width: '70%', // Set the width of the drawer here
          },
        }}>
        <Drawer.Screen
          name="home"
          component={Home}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    </AuthProvider>
  );
};
const CustomDrawerContent = ({ navigation }) => {
  const user = useSelector(state => state.userData);
  const notificationCount = useSelector(state => state.notificationCount);
  const { Logout, loadingactivity } = useContext(AuthContext);
  const userRtoken = useSelector(state => state.refreshToken);
  const [serverurl, setserverurl] = useState('');
  useEffect(() => {
    const fetchServerUrl = async () => {
      try {
        const url = await SERVER_URL(); // Assuming SERVER_URL returns a string
        setserverurl(url);
      } catch (error) {
        console.error('Error fetching server URL:', error);
      }
    };

    fetchServerUrl();
  }, []);
  return (
    <View style={{ ...styles.drawerContent }}>
      <View style={{ ...styles.userInfo }}>
        <Image
          style={styles.ProfileImg}
          source={
            user?.profile_picture
              ? { uri: `${serverurl}${user?.profile_picture}` }
              : require('../assets/images/profile.png')
          }
        />

        <View style={{ width: '80%' }}>
          <Text style={{ ...styles.txt16bold }}>{user?.full_name}</Text>
          <Text style={{ ...styles.txt12 }}>{user?.email}</Text>
        </View>
      </View>
      <ScrollView>
        {DrawerList?.map(item => {
          return (
            <View key={item?.id}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.option}
                onPress={() => {
                  navigation.navigate(item?.navigateto);
                  navigation.closeDrawer();
                }}>
                {item?.label === 'Notification' ? (
                  <View style={styles.CardTextflex}>
                    <Text style={{ ...styles.txt18bold }} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <View style={styles.NotificationCounter}>
                      <Text style={{ ...styles.txt12, color: 'white' }}>
                        {notificationCount}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={{ ...styles.txt18bold }} numberOfLines={1}>
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={{ ...styles.line }} />
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
        }}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.option}
          onPress={() => {
            navigation.navigate('Support');
            navigation.closeDrawer();
          }}>
          <Text style={styles.txt18bold} numberOfLines={1}>
            Support & Help
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={{ marginTop: 15, marginBottom: '20%' }}
          onPress={() => {
            Logout(userRtoken);
          }}>
          <Text style={{ ...styles.txt18bold, color: 'red' }} numberOfLines={1}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const Bottomtabs = () => {
  const user = useSelector(state => state.userData);
  const [serverurl, setserverurl] = useState('');
  useEffect(() => {
    const fetchServerUrl = async () => {
      try {
        const url = await SERVER_URL(); // Assuming SERVER_URL returns a string
        setserverurl(url);
      } catch (error) {
        console.error('Error fetching server URL:', error);
      }
    };

    fetchServerUrl();
  }, []);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;

          if (route.name === 'Home') {
            icon = focused ? (
              <Image
                source={require('../assets/images/homeActive.png')}
                style={{ width: 25, height: 25 }}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('../assets/images/home.png')}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            );
          } else if (route.name === 'Job') {
            icon = focused ? (
              <Image
                source={require('../assets/images/jobActive.png')}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('../assets/images/job.png')}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            );
          } else if (route.name === 'Wallet') {
            icon = focused ? (
              <Image
                source={require('../assets/images/walletActive.png')}
                style={{ width: 25, height: 25 }}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('../assets/images/wallet.png')}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            );
          } else if (route.name === 'Profile') {
            icon = focused ? (
              <Image
                source={
                  user?.profile_picture
                    ? { uri: `${serverurl}${user?.profile_picture}` } // Show existing image from API
                    : require('../assets/images/profile.png') // Default image
                }
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 50,
                  resizeMode: 'cover',
                  borderWidth: 1,
                  borderColor: Colors.btnColors.primary,
                  padding: 5,
                }}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={
                  user?.profile_picture
                    ? { uri: `${serverurl}${user?.profile_picture}` } // Show existing image from API
                    : require('../assets/images/profile.png') // Default image
                }
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 40,
                  resizeMode: 'cover',
                }}
                resizeMode="contain"
              />
            );
          }

          // You can return any component that you like here!
          return icon;
        },
        tabBarActiveTintColor: '#F95F19',
        tabBarInactiveTintColor: Colors.textColors.primary,
        tabBarStyle: {
          height: 60,
          backgroundColor: Colors.background.secondary,
        },
        tabBarLabelStyle: {
          fontSize: 14,
        },
      })}>
      <Tab.Screen
        name="Home"
        component={DrawerNavigation}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Job" component={Jobs} options={{ headerShown: false }} />
      <Tab.Screen
        name="Wallet"
        component={Wallet}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};
const Homestack = () => {
  return (
    <HomeProvider>
      <Stack.Navigator initialRouteName="Bottomtabs">
        <Stack.Screen
          name="Bottomtabs"
          component={Bottomtabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Support"
          component={Support}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="JobHistory"
          component={JobHistory}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Refer"
          component={Refer}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Transaction"
          component={Transaction}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notification"
          component={Notification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SpecificOngoingJob"
          component={SpecificOngoingJob}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CompletedJob"
          component={CompletedJob}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OngoingJobList"
          component={OngoingJobList}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Setting"
          component={Setting}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CancelJob"
          component={CancelJob}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="JobPictureUpload"
          component={JobPictureUpload}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Success"
          component={SuccessScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TopupPayment"
          component={TopUpPayment}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </HomeProvider>
  );
};

const MainNavigation = () => {
  const loggedIn = useSelector(state => state.loggedIn);
  const user = useSelector(state => state.userData);

  return loggedIn ? user?.mechanic_profile?.top_up_balance > 0 ?
    <SafeAreaView style={{ flex: 1 }}>
      <Homestack />
    </SafeAreaView> : <HomeProvider>
      <TopUpPayment />
    </HomeProvider>
    : <AuthNavigation />;
  // return <AuthNavigation />
};

export default MainNavigation;
