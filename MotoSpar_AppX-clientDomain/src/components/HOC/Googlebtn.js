import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { styles } from '../../assets/Css/AuthCss'

const Googlebtn = ({title,onPress}) => {
  return (
    <View style={styles.googlebutton}>
    <TouchableOpacity activeOpacity={0.6} style={{flexDirection:'row',justifyContent:'center'}} onPress={onPress}>
       <Image source={require('../../assets/images/google.png')} style={{width:39,height:39}}/>
       <Text style={styles.googlebtntext}>{title} with Google</Text>
    </TouchableOpacity>
   </View>
  )
}

export default Googlebtn