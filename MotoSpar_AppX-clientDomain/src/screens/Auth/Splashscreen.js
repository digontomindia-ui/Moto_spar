import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux';

const Splashscreen = () => {
    const loggedIn = useSelector(state => state.loggedIn);
    const navigation=useNavigation();
    useEffect(() => {
        setTimeout(() => {
           {loggedIn? navigation.replace('Home'): navigation.replace('Login');}
        }, 500)
    }, [])
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/Logo.png')} style={{width:300,height:300}}/>
    </View>
  )
}

export default Splashscreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    }
})