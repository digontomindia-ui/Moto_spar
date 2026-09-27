import { View, Text, Image } from 'react-native';
import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Auth/Login';
import Register from '../screens/Auth/Register';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import ResetPassword from '../screens/Auth/ResetPassword';
import { AuthContext, AuthProvider } from '../context/AuthContext';
import Home from '../screens/Home/Home';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import Splashscreen from '../screens/Auth/Splashscreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Car from '../screens/Home/Car';
import Bike from '../screens/Home/Bike';
import Profile from '../screens/Home/Profile';
import SpecificProductScreen from '../screens/Home/SpecificProductScreen';
import { HomeProvider } from '../context/HomeContext';
import Cart from '../screens/Home/Cart/Cart';
import Address from '../screens/Home/ProfileScreens/Address';
import EditAddress from '../screens/Home/ProfileScreens/EditAddress';
import CartAddress from '../screens/Home/Cart/CartAddress';
import Payment from '../screens/Home/Cart/Payment';
import SuccessScreen from '../screens/Home/Cart/SuccessScreen';
import AllOrders from '../screens/Home/Orders/AllOrders';
import Wishlist from '../screens/Home/ProfileScreens/Wishlist';
import OrderDetail from '../screens/Home/Orders/OrderDetail';
import EditProfile from '../screens/Home/ProfileScreens/EditProfile';
import StatusScreen from '../screens/Home/Orders/StatusScreen';
import CarProducts from '../screens/Home/AllProductsScreens/Accessories';
import BikeProducts from '../screens/Home/AllProductsScreens/BikeProducts';
import NotificationsScreen from '../screens/Home/NotificationScreen';
import ContactUs from '../screens/Home/ProfileScreens/ContactUs';
import ContactSuccess from '../screens/Home/ProfileScreens/ContactSuccess';
import Terms from '../screens/Home/ProfileScreens/Terms';
import Verification from '../screens/Auth/OtpVerification';
import OtpVerification from '../screens/Auth/OtpVerification';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthNavigation = () => {
  return (
    <AuthProvider>
      <HomeProvider>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Forgotpass"
            component={ForgotPassword}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Resetpass"
            component={ResetPassword}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OtpVerification"
            component={OtpVerification}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </HomeProvider>
    </AuthProvider>
  );
};
const HomeNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;

          if (route.name === 'Car') {
            icon = focused ? (
              <Image
                source={require('../assets/images/carFocused.png')}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('../assets/images/car.png')}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            );
          } else if (route.name === 'Bike') {
            icon = focused ? (
              <Image
                source={require('../assets/images/bikeFocused.png')}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('../assets/images/Bike.png')}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            );
          } else if (route.name === 'Profile') {
            icon = focused ? (
              <Image
                source={require('../assets/images/profileIconFocused.png')}
                style={{ width: 25, height: 25 }}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('../assets/images/profileIcon.png')}
                style={{ width: 25, height: 25 }}
                resizeMode="contain"
              />
            );
          }

          // You can return any component that you like here!
          return icon;
        },
        tabBarActiveTintColor: '#F95F19',
        tabBarInactiveTintColor: '#BBBBBB',
        tabBarStyle: {
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 8,
        },
      })}>
      <Tab.Screen name="Car" component={Car} options={{ headerShown: false }} />
      <Tab.Screen name="Bike" component={Bike} options={{ headerShown: false }} />
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
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeNavigation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CarProducts"
          component={CarProducts}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BikeProducts"
          component={BikeProducts}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProductScreen"
          component={SpecificProductScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cart"
          component={Cart}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CartAddress"
          component={CartAddress}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Payment"
          component={Payment}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SuccessScreen"
          component={SuccessScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Address"
          component={Address}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditAddress"
          component={EditAddress}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AllOrders"
          component={AllOrders}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StatusScreen"
          component={StatusScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Wishlist"
          component={Wishlist}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactUs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContactSuccess"
          component={ContactSuccess}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Terms"
          component={Terms}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notification"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </HomeProvider>
  );
};
const MainNavigation = () => {
  const loggedIn = useSelector(state => state.loggedIn);
  return (
    <NavigationContainer>
      {loggedIn ? <Homestack /> : <AuthNavigation />}
      {/* <AuthNavigation/> */}
      {/* <Cart /> */}
    </NavigationContainer>
  );
};
export default MainNavigation;
