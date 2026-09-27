import 'react-native-gesture-handler';
import { View, Text, SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';
import React from 'react';

import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import Login from './src/screens/Auth/Login';
import MainNavigation from './src/navigation/MainNavigation';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { RootReducer } from './src/redux/RootReducer';
import Colors from './src/constants/Colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const store = configureStore({
  reducer: RootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const App = () => {
  return (
    <>

      {/* <SafeAreaView style={styles.safeArea}> */}
      <SafeAreaProvider>
        <Provider store={store}>
          <NavigationContainer>
            <StatusBar
              barStyle="dark-content"
              backgroundColor={Colors.background.primary}
            />
            <MainNavigation />
            <Toast />
          </NavigationContainer>
        </Provider>
      </SafeAreaProvider>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default App;
