import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { styles } from '../../../assets/Css/CartCss'
import Header from '../../../components/HOC/Header'
import AuthButton from '../../../components/HOC/AuthButton'
import { CommonActions, useNavigation } from '@react-navigation/native'
import LottieView from 'lottie-react-native'
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions'
import IO from'react-native-vector-icons/Ionicons'

const SuccessScreen = ({ route }) => {
  status = route.params.status;
  const review =route.params.review;
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
     <TouchableOpacity activeOpacity={0.6} onPress={()=>navigation.navigate('Car')}>
     <IO name="close-outline" size={responsiveFontSize(5)} color={'black'}/>
     </TouchableOpacity>
     {
      review?
      <View style={styles.infoScreenView}>
      {
        status == 'success' ? <LottieView source={require('../../../assets/images/success.json')} autoPlay style={{ width: responsiveWidth(50), height: responsiveWidth(50) }} /> :
          <LottieView source={require('../../../assets/images/fail.json')} autoPlay style={{ width: responsiveWidth(30), height: responsiveWidth(30) }} />
      }

      <Text style={{...styles.txtlargebold,textAlign:'center'}}>{status == 'success' ? `Thankyou ${'\n'} your review has been submitted!` : 'Payment Failed!'}</Text>
    </View>:
     <View style={styles.infoScreenView}>
     {
       status == 'success' ? <LottieView source={require('../../../assets/images/success.json')} autoPlay style={{ width: responsiveWidth(50), height: responsiveWidth(50) }} /> :
         <LottieView source={require('../../../assets/images/fail.json')} autoPlay style={{ width: responsiveWidth(30), height: responsiveWidth(30) }} />
     }

     <Text style={styles.txtlargebold}>{status == 'success' ? 'Your order is successfully placed!' : 'Payment Failed!'}</Text>
     {
       status == 'success' ? <AuthButton title={'View Order'} onpress={() => navigation.replace('AllOrders')} /> : null
     }
   </View>
     }
    </View>
  )
}

export default SuccessScreen