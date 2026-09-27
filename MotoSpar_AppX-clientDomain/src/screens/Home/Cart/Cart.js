import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Header from '../../../components/HOC/Header'
import { styles } from '../../../assets/Css/CartCss'
import Ion from 'react-native-vector-icons/Ionicons'
import Colors from '../../../constants/Colors'
import CartProduct from '../../../components/Atoms/CartProduct'
import AuthButton from '../../../components/HOC/AuthButton'
import CommonBtn from '../../../components/HOC/CommonBtn'
import { responsiveWidth } from 'react-native-responsive-dimensions'
import { useSelector } from 'react-redux'
import { HomeContext } from '../../../context/HomeContext'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import Loading from '../../../components/HOC/Loading'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
const Cart = ({ route }) => {
  const buy = route?.params?.buynow;

  const navigation = useNavigation();
  const {
    specificProduct,
    setfinalPrice,
    finalPrice,
    GetCartItem,
    cartProduct,
    singleOrderQty,
    loadingactivity,
    DeleteCartItem,
  } = useContext(HomeContext);

  const [subTotal, setsubTotal] = useState(0);
  const [discount, setdiscount] = useState(0);
  const [deliveryFee, setdeliveryFee] = useState(0);
  const [mechanic_fees, setmechanic_fees] = useState(0);
  const [driver_fees, setdriver_fees] = useState(0);

  useEffect(() => {
    GetCartItem();
  }, []);

  const SummaryCalculation = () => {
    let newSubTotal = 0;
    let newDiscount = 0;
    let newdeliveryfee = 0;
    let newmechanic_fee = 0;
    let newdriver_fee = 0;

    // Check if cartProduct is defined and is an array
    if (Array.isArray(cartProduct)) {
      cartProduct.forEach((product) => {
        newSubTotal += Number(product?.variant_details?.price) * product?.quantity;
        newDiscount += Number(product?.price_at_addition) * product?.quantity;
        newdeliveryfee += Number(product?.delivery_charge);
        newmechanic_fee += Number(product?.mechanic_fees) * product?.quantity;
        newdriver_fee += Number(product?.driver_fees);
      });
    }

    setsubTotal(newSubTotal);
    setdiscount(newDiscount);
    setdeliveryFee(newdeliveryfee);
    setmechanic_fees(newmechanic_fee);
    setdriver_fees(newdriver_fee);

    // Update final price after all calculations
    setfinalPrice(
      parseFloat(newDiscount) +
      parseFloat(newdeliveryfee) +
      parseFloat(newmechanic_fee) +
      parseFloat(newdriver_fee)
    );
  };

  useEffect(() => {
    SummaryCalculation();
  }, [cartProduct]); // Dependency ensures calculations are updated when cartProduct changes
  return (
    cartProduct?.length == 0 ?
      <View style={styles.container}>
        <Header backIcon={true} screenName={'Shopping Cart'} navigateTo={'ProductScreen'} />
        <View style={styles.infoScreenView}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>Your Cart is Empty!!</Text>
          <View style={{ width: responsiveWidth(50), marginVertical: responsiveWidth(2) }}>
            <CommonBtn onpress={() => navigation.navigate('Home')} title={'Shop Now'} height={4} />
          </View>
        </View>
      </View>
      :
      <View style={styles.container}>
        <Header backIcon={true} screenName={'Shopping Cart'} navigateTo={'ProductScreen'} />
        <ScrollView style={styles.subcontainer} showsVerticalScrollIndicator={false}>
          <View style={styles.productcontainer}>
            {buy ?
              <CartProduct item={specificProduct} buy={true} />
              :
              <FlatList
                scrollEnabled={false}
                data={cartProduct}
                renderItem={({ item }) => (
                  <CartProduct item={item} mechanicFee={item?.mechanic_fees} />
                )
                }
              />
            }
          </View>
          <View style={styles.ordercontainer}>

            <View style={{ marginBottom: 15 }}>
              <Text style={styles.txtmediumbold}>Order Summary</Text>
            </View>

            <View style={styles.detail}>
              <Text style={styles.txtsmall}>SubTotal</Text>
              <Text style={styles.txtmediumbold}>₹{buy ? specificProduct?.variants[0]?.price * singleOrderQty : (subTotal).toFixed(2)}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.txtsmall}>Discount</Text>
              <Text style={styles.discountPrice}>- ₹{buy ? (specificProduct?.variants[0]?.price * singleOrderQty - specificProduct?.variants[0]?.discount * singleOrderQty).toFixed(2) : (subTotal - discount).toFixed(2)}</Text>
            </View>
            {mechanic_fees > 0 &&
              <View style={styles.detail}>
                <Text style={styles.txtsmall}>Mechanic Fee</Text>
                <Text style={styles.txtmediumbold}>₹{mechanic_fees}</Text>
              </View>
            }
            {
              driver_fees > 0 &&
              <View style={styles.detail}>
                <Text style={styles.txtsmall}>Driver Fee</Text>
                <Text style={styles.txtmediumbold}>₹{driver_fees}</Text>
              </View>
            }
            <View style={styles.detail}>
              <Text style={styles.txtsmall}>Delivery Fee</Text>
              <Text style={styles.txtmediumbold}>₹{deliveryFee}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detail}>
              <Text style={styles.txtsmallbold}>Total</Text>
              <Text style={styles.txtmediumbold}>₹{(finalPrice).toFixed(2)}</Text>

            </View>
            {/* for promo code */}
            {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', marginTop: 15 }} >
              <TouchableOpacity style={styles.capsule}>
                <Ion name='pricetag-outline' color={Colors.textColors.primary} size={14} />
                <View style={{ marginHorizontal: responsiveWidth(3.5) }}>
                  <Text style={styles.txtsmall}>Add Promo code</Text>
                </View>
              </TouchableOpacity>
              <View style={{ width: '40%' }}>
                <CommonBtn title={'Apply'} height={3.5} />
              </View>
            </View> */}
          </View>
        </ScrollView>
        <View style={styles.Proceedbtn}>
          <CommonBtn title={'Proceed'} onpress={() => navigation.navigate('CartAddress')} height={5} />
        </View>
        {loadingactivity ? <Loading /> : null}
      </View>

  )
}

export default Cart