import {StyleSheet} from 'react-native';
import {Fonts, FontWeight} from '../../constants/Fonts';
import Colors from '../../constants/Colors';
import AuthButton from '../../components/HOC/AuthButton';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

export const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginVertical: 25,
    // marginLeft:30
    marginHorizontal: 40,
  },
  text1: {
    fontSize: Fonts.font16,
    fontWeight: FontWeight.medium,
    color: Colors.textColors.secondary,
  },
  text2: {
    fontSize: Fonts.font36,
    fontWeight: FontWeight.bold,
    color: Colors.textColors.primary,
    marginTop: 20,
  },
  text2register: {
    fontSize: Fonts.font36,
    fontWeight: FontWeight.bold,
    color: Colors.textColors.primary,
    marginTop: 5,
  },
  inputHeadtext: {
    marginTop: 18,
    fontSize: Fonts.font16,
    fontWeight: FontWeight.normal,
    color: Colors.textColors.primary,
  },
  txtinput: {
    width: '100%',
    height: 38,
    borderRadius: 4,
    backgroundColor: Colors.textInputColors.primary,
    marginTop: 5,
    fontSize: Fonts.font14,
    fontWeight: FontWeight.medium,
    color: 'black',
    paddingLeft: 12,
  },
  txtinputname: {
    width: '90%',
    height: 38,
    borderRadius: 4,
    marginRight: 70,
    backgroundColor: Colors.textInputColors.primary,
    marginTop: 5,
    fontSize: Fonts.font14,
    fontWeight: FontWeight.medium,
    color: 'black',
    paddingLeft: 12,
    paddingTop: 5, // Space for text to start from the top
    textAlignVertical: 'top', // Ensures text aligns to the top
  },
  passwordinput: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textInputColors.primary,
    borderRadius: 4,
    marginTop: 5,
    color: 'black',
    fontSize: Fonts.font14,
    fontWeight: FontWeight.medium,
    paddingLeft: 12,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  authbutton: {
    width: responsiveWidth(43),
    height: responsiveHeight(5),
    marginTop: 20,
    // marginLeft:70,
    justifyContent: 'center',
    backgroundColor: Colors.btnColors.primary,
    borderRadius: 20,
  },
  btntext: {
    fontSize: Fonts.font16,
    fontWeight: FontWeight.bold,
    color: Colors.background,
    //     marginRight:13,
    //    marginTop:3
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: 7,
    fontSize: Fonts.font12,
    fontWeight: FontWeight.normal,
    color: Colors.textColors.primary,
  },
  googlebutton: {
    width: 214,
    height: 47,
    marginTop: 20,
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 20,
    elevation: 0.5,
    shadowColor: 'black',
    shadowRadius: 4,
  },
  googlebtntext: {
    fontSize: Fonts.font16,
    fontWeight: FontWeight.bold,
    color: Colors.textColors.primary,
    marginTop: 8,
    marginLeft: 7,
  },
  acctxt: {
    fontSize: Fonts.font16,
    fontWeight: FontWeight.medium,
    color: Colors.textColors.secondary,
    // marginLeft:25
  },
  accbtn: {
    fontSize: Fonts.font16,
    fontWeight: FontWeight.medium,
    color: Colors.btnColors.primary,
  },
  bottomimg: {
    width: 180,
    height: 185,
    marginLeft: 180,
    bottom: 0,
    // position:'absolute'
  },
  OR: {
    FontWeight: FontWeight.bold,
    fontSize: Fonts.font16,
    color: Colors.textColors.primary,
    marginTop: 10,
  },
  imgregister: {
    width: 180, // Width of the image
    height: 185, // Height of the image
    position: 'absolute', // Absolute positioning
    right: -20, // Align to the right
    bottom: -10, // Align to the bottom
    pointerEvents: 'none',
  },
  bottomImg: {
    position: 'absolute',
    width: 180,
    height: 180,
    right: 0,
    bottom: 0,
    resizeMode: 'contain',
    pointerEvents: 'none', // Prevents interaction with the image
  },
});
