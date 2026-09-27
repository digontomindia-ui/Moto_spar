import { View, Text, TouchableOpacity, Image, Modal, Button, RefreshControl } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { styles } from '../../../assets/Css/CartCss';
import Header from '../../../components/HOC/Header';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import ProgressSteps from '../../../components/Atoms/ProgressSteps';
import { HomeContext } from '../../../context/HomeContext';
import Ion from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import Colors from '../../../constants/Colors';
import CommonBtn from '../../../components/HOC/CommonBtn';
import Loading from '../../../components/HOC/Loading';
import Model from '../../../components/Atoms/Modal';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const CartAddress = ({ route }) => {
  const buynow = route?.params?.buynow;
  const product = route?.params?.item;
  const productVariant = route?.params?.itemVariant;
  const totalMechanicFees = route?.params?.totalMechanicFees;
  const totalDriverFees = route?.params?.totalDriverFees;
  const delivery_charge = route?.params?.delivery_charge;
  const navigation = useNavigation();
  const { GetShippingAddress, shippingAddress, cartProduct, loadingactivity, setorderAddress, setfinalPrice, finalPrice, setloadingactivity } =
    useContext(HomeContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false); // State to handle pull-to-refresh

  useEffect(() => {
    setloadingactivity(true)
    GetShippingAddress();
  }, []);

  // Refresh data when pull-to-refresh is triggered
  const onRefresh = () => {
    setRefreshing(true);
    GetShippingAddress(); // Re-fetch shipping address or any other required data
    setTimeout(() => setRefreshing(false), 1000); // Reset refreshing state after 1 second
  };

  useEffect(() => {
    if (buynow && route?.params?.totalPrice) {
      setfinalPrice(route.params.totalPrice); // Update `finalPrice` only if `buynow` is true
    }
  }, [buynow, route?.params?.totalPrice]);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleDataSubmit = (data) => {
    setIndex(data);
    closeModal();
  };

  setorderAddress(shippingAddress[index ? index : 0]?.id);

  const calculateDeliveryDate = (deliveryDays, created_at) => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + deliveryDays);
    return currentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const deliverydate = calculateDeliveryDate(product?.delivery_time);

  return (
    <View style={styles.container}>
      <Header screenName={'Shopping Cart'} navigateTo={'Cart'} backIcon={true} />
      <ScrollView
        style={styles.subcontainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Pull-to-refresh
        }
      >
        <ProgressSteps screen={1} />

        {shippingAddress.length <= 0 ? (
          <TouchableOpacity activeOpacity={0.6} style={styles.btn} onPress={() => navigation.navigate('EditAddress')}>
            <Text style={{ ...styles.txtmediumbold, color: Colors.btnColors.primary }}>Add New Address</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addContainer}>
            {shippingAddress[index ? index : 0]?.address_type === 'Home' ? (
              <Ion name="home-outline" size={responsiveFontSize(2.3)} color={Colors.textColors.primary} />
            ) : (
              <Ion name="business-outline" size={responsiveFontSize(2.3)} color={Colors.textColors.primary} />
            )}
            <View style={styles.addtxt}>
              <Text style={styles.txtmediumbold}>{shippingAddress[index ? index : 0]?.address_type}</Text>
              <Text style={styles.txtmediumbold}>{shippingAddress[index ? index : 0]?.name}</Text>
              <View style={styles.space}>
                <Text style={styles.txtsmall}>
                  {shippingAddress[index ? index : 0]?.street_address}, {shippingAddress[index ? index : 0]?.city},{' '}
                  {shippingAddress[index ? index : 0]?.state} {shippingAddress[index ? index : 0]?.postal_code}
                </Text>
              </View>
              <Text style={styles.txtsmall}>
                Phone Number: {shippingAddress[index ? index : 0]?.phone_number}
                {index}
              </Text>
              <View style={styles.btnAlignment}>
                <TouchableOpacity activeOpacity={0.6} onPress={openModal}>
                  <Text style={styles.addBtn}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={styles.ordercontainer}>
          <Text style={styles.txtmediumbold}>Delivery Estimate</Text>
          {buynow ? (
            <View style={styles.orderestimateCard}>
              <Image
                source={
                  productVariant.images[0]
                    ? { uri: `https://api.motospar.com${productVariant.images[0]?.image}` }
                    : require('../../../assets/images/Logo.png')
                }
                style={styles.orderImg}
                resizeMode="contain"
              />
              <View style={{ width: '75%', justifyContent: "center", gap: 5 }}>
                <Text style={styles.txtsmallbold}>{product?.name}</Text>
                <Text style={styles.txtmedium}>Delivery by  {calculateDeliveryDate(product?.delivery_time, product?.created_at)}</Text>
                <Text style={[styles.txtverysmall, styles.space]} numberOfLines={2}>
                  (Delivery Date may change once order is placed)
                </Text>
              </View>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={cartProduct}
              renderItem={({ item }) => (
                <View style={styles.orderestimateCard}>
                  <Image
                    source={
                      item?.variant_details?.images[0]
                        ? { uri: `https://api.motospar.com${item?.variant_details?.images[0]?.image}` }
                        : require('../../../assets/images/Logo.png')
                    }
                    style={styles.orderImg}
                    resizeMode="contain"
                  />
                  <View style={{ width: '75%', justifyContent: "center", gap: 5 }}>
                    <Text style={styles.txtsmallbold}>{item?.product?.name}</Text>
                    <Text style={styles.txtmedium}>
                      Delivery by {calculateDeliveryDate(item?.product?.delivery_time, item?.created_at)}
                    </Text>
                    <Text style={[styles.txtverysmall, styles.space]} numberOfLines={2}>
                      (Delivery Date may change once order is placed)
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
      <Model visible={modalVisible} onClose={closeModal} onDataSubmit={handleDataSubmit} />
      <View style={styles.Proceedbtn}>
        {shippingAddress?.length <= 0 ? (
          <CommonBtn
            title={'Proceed'}
            bgcolor={Colors.btnColors.tertiary}
            height={5}
            onpress={() => {
              Toast.show({
                type: 'error',
                text1: 'Please add an address',
                position: 'bottom',
              });
            }}
          />
        ) : (
          <CommonBtn
            title={'Proceed'}
            onpress={() =>
              navigation.navigate('Payment', {
                buynow: buynow,
                productVariant: productVariant,
                totalMechanicFees: totalMechanicFees,
                totalDriverFees: totalDriverFees,
                delivery_charge: delivery_charge,
              })
            }
            height={5}
          />
        )}
      </View>

      {loadingactivity ? <Loading /> : null}
    </View>
  );
};

export default CartAddress;
