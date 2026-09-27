import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Fonts, FontWeight } from '../../constants/Fonts';
import Colors from '../../constants/Colors';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
const CommonBtn = ({
  title,
  onpress,
  height,
  bgcolor,
  disable,
  width,
  icon,
  textColor,
  margin
}) => {
  const styles = StyleSheet.create({
    btn: {
      width: width ? responsiveWidth(width) : '100%',
      height: height,
      borderRadius: responsiveWidth(3),
      backgroundColor: bgcolor ? bgcolor : Colors.btnColors.primary,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: responsiveHeight(margin ? margin : 1),
      flexDirection: 'row',
      gap: 10,
    },
    btntxt: {
      fontSize: Fonts.font14,
      fontWeight: FontWeight.bold,
      color: textColor
    },
  });
  console.log('btnnnn')
  return (
    <TouchableOpacity style={styles.btn} onPress={onpress} disabled={disable} activeOpacity={0.7} >
      {icon}
      <Text style={styles.btntxt}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CommonBtn;
