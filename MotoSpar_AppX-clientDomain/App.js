import 'react-native-gesture-handler';
import React from 'react';
import {Platform, StatusBar} from 'react-native';
import Colors from './src/constants/Colors';
import {configureStore} from '@reduxjs/toolkit';
import {Provider} from 'react-redux';
import {RootReducer} from './src/redux/RootReducer';
import MainNavigation from './src/navigation/MainNavigation';
import Toast from 'react-native-toast-message';
import {SafeAreaView} from 'react-native-safe-area-context';
import MotoSparChatbot from './src/components/Chatbot/MotoSparChatbot';

export const store = configureStore({
  reducer: RootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export default function App() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.headerColors.primary,
        paddingTop: Platform.OS === 'ios' ? 40 : 0,
      }}>
      <Provider store={store}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.headerColors.primary}
        />
        <MainNavigation />
        <MotoSparChatbot />
        <Toast />
      </Provider>
    </SafeAreaView>
  );
}
