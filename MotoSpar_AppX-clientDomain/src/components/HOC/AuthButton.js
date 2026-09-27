import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { styles } from '../../assets/Css/AuthCss'
import Icon from "react-native-vector-icons/FontAwesome5"

const AuthButton = ({title,onpress}) => {
  return (
    <View style={styles.authbutton}>
     <TouchableOpacity 
     activeOpacity={0.6}
     onPress={onpress}
     style={{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:20}}>
        <Text style={styles.btntext}>{title}</Text>
        <Icon name='arrow-right' size={18} color={'white'}/>
     </TouchableOpacity>
    </View>
  )
}

export default AuthButton
