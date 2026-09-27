import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import Colors from '../../constants/Colors';
import {Fonts, FontWeight} from '../../constants/Fonts';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Ion from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineSlices} from '@reduxjs/toolkit';
import {HomeContext} from '../../context/HomeContext';

const {width} = Dimensions.get('screen');

const Header = ({backIcon, navigateTo, homeHeader, screenName}) => {
  const navigation = useNavigation();

  const {UnreadCount, cartCount} = useContext(HomeContext);

  return (
    <View style={styles.header}>
      {backIcon && (
        <View style={{marginTop: 20, marginLeft: 10}}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={Colors.background} />
          </TouchableOpacity>
        </View>
      )}

      {screenName ? (
        <Text style={styles.screentitle}>{screenName}</Text>
      ) : (
        <View style={styles.subheader}>
          <Image
            source={require('../../assets/images/Logo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>MotoSpar</Text>
        </View>
      )}

      {homeHeader && (
        <View style={styles.homeIcon}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate('Notification')}>
            <Icon name="bell" size={22} color={Colors.background} />
            {/* Counter Badge */}

            <View style={styles.cartCounter}>
              <Text style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>
                {UnreadCount}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate('Cart')}
            style={{position: 'relative'}}>
            <Ion name="cart-outline" size={25} color={Colors.background} />

            {/* Counter Badge */}
            {cartCount > 0 && (
              <View style={styles.cartCounter}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>
                  {cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    width: '100%',
    height: 60,
    backgroundColor: Colors.headerColors.primary,
  },
  subheader: {
    flexDirection: 'row',
  },
  homeIcon: {
    flexDirection: 'row',
    margin: 20,
    gap: 15,
    height: 40,
    position: 'absolute',
    right: 0,
  },
  title: {
    color: Colors.background,
    fontSize: Fonts.font18,
    fontWeight: FontWeight.extrabold,
    alignSelf: 'center',
  },
  screentitle: {
    color: Colors.background,
    fontSize: Fonts.font18,
    fontWeight: FontWeight.extrabold,
    alignSelf: 'center',
    marginLeft: 20,
  },
  logo: {
    width: 36,
    height: 36,
    marginTop: 12,
    marginLeft: 16,
    marginRight: 10,
  },
  cartCounter: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: responsiveWidth(2),
    height: responsiveWidth(4),
    width: responsiveWidth(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;
