import 'react-native-gesture-handler';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import React from 'react';

import {DarkTheme, NavigationContainer} from '@react-navigation/native';
import Login from './src/screens/Auth/Login';
import MainNavigation from './src/navigation/MainNavigation';
import Toast from 'react-native-toast-message';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {RootReducer} from './src/redux/RootReducer';
import Colors from './src/constants/Colors';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export const store = configureStore({
  reducer: RootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const App = () => {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
              <StatusBar barStyle={'light-content'} backgroundColor={'red'} />
              <NavigationContainer>
                <MainNavigation />
                <Toast />
              </NavigationContainer>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default App;
