import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { styles } from '../../assets/Css/CartCss';
import Ion from 'react-native-vector-icons/Ionicons';
import { HomeContext } from '../../context/HomeContext';
import Toast from 'react-native-toast-message';
import { responsiveWidth } from 'react-native-responsive-dimensions';

const CartProduct = ({ item, buy }) => {
  const {
    DeleteCartItem,
    GetCartItem,
    EditCart,
    loadingactivity,
    setCartCount,
    cartProduct
  } = useContext(HomeContext);

  const [quantity, setQuantity] = useState(item?.quantity);
  const [Ismechnaic_fees, setIsmechnaic_fees] = useState(item?.mechanic_fees > 0);
  const [Isdriver_fees, setIsdriver_fees] = useState(item?.driver_fees > 0);

  const handleQuantityChange = async (newQuantity) => {
    setQuantity(newQuantity);
    try {
      await EditCart(
        newQuantity,
        item?.variant_details?.discounted_price,
        item?.id,
        Ismechnaic_fees ? item?.mechanic_fees : undefined,
        Isdriver_fees ? item?.driver_fees : undefined
      );
      await GetCartItem();
    } catch (error) {
    }
  };

  const handleDeleteCartItem = async (id) => {
    try {
      await DeleteCartItem(id);
      Toast.show({
        type: 'success',
        text1: 'Cart Item Deleted Successfully',
        position: 'bottom'
      });
      await GetCartItem();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: error || 'Please try again.',
        position: 'bottom',
      });
    }
  };

  useEffect(() => {
    const totalQuantity = Array.isArray(cartProduct) && cartProduct.length > 0
      ? cartProduct.reduce((acc, item) => acc + item.quantity, 0)
      : 0;
    setCartCount(totalQuantity);
  }, [cartProduct]);

  return (
    <View style={styles.Productcard}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={styles.imgCard}>
          <Image
            source={item?.variant_details?.images[0]
              ? { uri: `https://api.motospar.com${item?.variant_details?.images[0]?.image}` }
              : require('../../assets/images/Logo.png')}
            style={styles.productImg}
            resizeMode="contain"
          />
        </View>
        <View style={{ width: '55%', justifyContent: "center", gap: 5 }}>
          <Text style={styles.txtsmallbold} numberOfLines={2}>{item?.product?.name}</Text>
          <Text style={styles.txtsmall}>Size: {item?.variant_details?.size}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={styles.txtnormalbold}>₹{(item?.variant_details?.discounted_price * quantity).toFixed(2)}</Text>
            <Text style={styles.txtpricecut}>₹{item?.variant_details?.price * quantity}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <View style={styles.capsule}>
              <TouchableOpacity activeOpacity={0.6} onPress={() => {
                if (quantity > 1) {
                  handleQuantityChange(quantity - 1);
                }
              }}>
                <Text style={styles.txtsmallbold}>-   </Text>
              </TouchableOpacity>

              <Text style={styles.txtverysmallbold}>{quantity}</Text>

              <TouchableOpacity activeOpacity={0.6} onPress={() => {
                handleQuantityChange(quantity + 1);
              }}>
                <Text style={styles.txtsmallbold}>   +</Text>
              </TouchableOpacity>
            </View>
            {!buy && (
              <TouchableOpacity activeOpacity={0.6} onPress={() => handleDeleteCartItem(item?.id)}>
                <Ion name='trash-outline' size={14} color='red' />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {/* Mechanic Fees */}
      {Ismechnaic_fees && (
        <View style={{ ...styles.top, margin: 5 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Image
              source={require('../../assets/images/mechanic.png')}
              style={{
                width: responsiveWidth(6),
                height: responsiveWidth(6),
                margin: responsiveWidth(2)
              }}
            />
            <View>
              <Text style={styles.txtsmallbold}>
                Added Mechanic for installation{'  '}₹{item?.mechanic_fees * quantity || 0}
              </Text>
              <Text style={styles.txtverysmall}>
                (A Mechanic will come to your {'\n'}doorstep for installation of the product)
              </Text>
            </View>
          </View>
        </View>
      )}
      {/* Driver Fees */}
      {Isdriver_fees && (
        <View style={{ ...styles.top, margin: 5 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Image
              source={require('../../assets/images/person.png')}
              style={{
                width: responsiveWidth(6),
                height: responsiveWidth(6),
                margin: responsiveWidth(2)
              }}
            />
            <View>
              <Text style={styles.txtsmallbold}>
                Added vehicle pickup service{'  '}₹{item?.driver_fees || 0}
              </Text>
              <Text style={styles.txtverysmall}>
                (A driver will come to your doorstep{'\n'} and pickup the vehicle to the workshop)
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CartProduct;
