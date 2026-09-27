import { View, Text, TouchableOpacity,TextInput } from 'react-native'
import React, { useState } from 'react'
import { styles } from '../../assets/Css/AuthCss'
import Icon from "react-native-vector-icons/FontAwesome5"
const Passwordinput = ({value,onChangeText}) => {
  const [togglepassword, settogglepassword] = useState(true)
  return (
    <View style={styles.passwordinput}>
      <TextInput style={{ paddingRight: 120,color:'black',width:"85%"}}
        autoCapitalize="none"
        keyboardType='default'
        value={value}
        onChangeText={onChangeText}
        placeholder='Enter Password '
        placeholderTextColor={'grey'}
        returnKeyType="next"
        secureTextEntry={togglepassword}
        underlineColorAndroid="#f000"
        blurOnSubmit={false}
      />

      <TouchableOpacity activeOpacity={0.6} style={{ marginRight: 10 }} onPress={() => settogglepassword(!togglepassword)}>
        {togglepassword ?
          <Icon name='eye-slash' size={16} color={'black'} />
          :
          <Icon name='eye' size={16} color={'black'} />
        }
      </TouchableOpacity>
    </View>
  )
}

export default Passwordinput