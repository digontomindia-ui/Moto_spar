import { View, Text, Image, TouchableOpacity ,TextInput} from 'react-native'
import React, { useState } from 'react'
import { styles } from '../../assets/Css/AuthCss'
import Colors from '../../constants/Colors'



export const Textinput = ({placeholder,value,onChangeText,bgcolor,editable}) => {

  return (
    <View>
    <TextInput style={{...styles.txtinput,backgroundColor:bgcolor?bgcolor:Colors.textInputColors.primary}}
    autoCapitalize="none"
    placeholder={placeholder}
    placeholderTextColor={'grey'}
    keyboardType='email-address'
    returnKeyType="next"
    underlineColorAndroid="#f000"
    blurOnSubmit={false}
    value={value} 
    onChangeText={onChangeText}
    editable={editable}
   
    />
    </View>
  )
}

export const Textinputname = ({placeholder,value,onChangeText,bgcolor,customWidth,maxlength,height,multiline,keyboardType}) => {

  return (
    <View>
    <TextInput style={{...styles.txtinputname,backgroundColor:bgcolor?bgcolor:Colors.textInputColors.primary,width:customWidth?'100%':'90%', height:height?height:38}}
    autoCapitalize="none"
    placeholder={placeholder}
    placeholderTextColor={'grey'}
    keyboardType={keyboardType?keyboardType:'default'}
    returnKeyType="next"
    underlineColorAndroid="#f000"
    blurOnSubmit={false}
    value={value} 
    onChangeText={onChangeText}
    maxLength={maxlength}
    multiline={multiline?multiline:false}

    />
    </View>
  )
}

