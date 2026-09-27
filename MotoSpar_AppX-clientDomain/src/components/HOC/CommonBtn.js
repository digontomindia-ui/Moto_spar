import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import Colors from '../../constants/Colors'
import { Fonts, FontWeight } from '../../constants/Fonts'

const CommonBtn = ({title , onpress,height,bgcolor,disable}) => {
    const styles = StyleSheet.create({
        btn:{
            width:'100%',
            height:responsiveHeight(height),
            borderRadius:responsiveWidth(5),
            backgroundColor:bgcolor?bgcolor:Colors.btnColors.primary,
            alignItems:'center',
            justifyContent:'center'
          },
          btntxt:{
            fontSize:Fonts.font14,
            fontWeight:FontWeight.bold,
            color:Colors.background
          },
    })
  return (
    <TouchableOpacity  activeOpacity={0.6} style={styles.btn}  onPress={onpress} disabled={disable}>
        <Text style={styles.btntxt}>{title}</Text>
        </TouchableOpacity>
  )
}

export default CommonBtn

