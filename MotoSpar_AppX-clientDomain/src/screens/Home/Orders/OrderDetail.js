import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import React, { useContext, useState } from 'react'
import { HomeContext } from '../../../context/HomeContext';
import Header from '../../../components/HOC/Header';
import { styles } from '../../../assets/Css/OrderCss';
import { ScrollView } from 'react-native-gesture-handler';
import Colors from '../../../constants/Colors';
import Ion from 'react-native-vector-icons/Ionicons'
import { responsiveFontSize, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import OrderStatus from '../../../components/HOC/OrderStatus';
import { useNavigation } from '@react-navigation/native';

const OrderDetail = () => {
    const navigation = useNavigation();
    const { specificOrder } = useContext(HomeContext);
    const [orderStatus, setorderStatus] = useState('')
    let subtotal = specificOrder?.order_items?.reduce((sum, item) => {
        return sum + (parseFloat(item.variant_details?.price * item?.quantity) || 0);
    }, 0);

    let discount = specificOrder?.order_items?.reduce((sum, item) => {
        return sum + (parseFloat(item.price * item?.quantity) || 0);
    }, 0);
    let mechnaicfee = specificOrder?.order_items?.reduce((sum, item) => {
        return sum + (parseFloat(item.mechanic_fees * item?.quantity) || 0);
    }, 0);
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Header screenName={`Order ID - #${specificOrder?.order_code}`} backIcon={true} navigateTo={'AllOrders'} />
            <View style={styles.subcontainer}>
                <View style={styles.ordercontainer}>
                    <FlatList
                        scrollEnabled={false}
                        data={specificOrder.order_items}
                        renderItem={({ item }) => (
                            <>
                                <TouchableOpacity activeOpacity={0.6} style={styles.Productcard} onPress={() => { navigation.navigate('StatusScreen', { item: item }) }}>
                                    <View style={styles.imgCard}>
                                        <Image
                                            source={item?.variant_details?.images[0]
                                                ? { uri: `https://api.motospar.com${item?.variant_details?.images[0]?.image}` }
                                                : require('../../../assets/images/Logo.png')}
                                            style={styles.productImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <View style={{ width: '55%' }}>
                                        <Text style={styles.txtsmallbold} numberOfLines={1}>{item?.product?.name}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveFontSize(1) }}>
                                            <Text style={styles.txtsmall}>Size: {item?.variant_details?.size}</Text>
                                            <Text style={styles.txtsmallbold}>Qty: {item?.quantity}</Text>
                                        </View>
                                        <View style={{ marginVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                            <Text style={styles.txtnormalbold}>₹{item?.price * item?.quantity}</Text>
                                            <Text style={styles.txtpricecut}>₹{item?.variant_details?.price * item?.quantity}</Text>
                                        </View>
                                        {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveFontSize(1) }}>
                                            <View style={styles.smallCapsule}>
                                               
                                            </View>
                                            {item?.order_status === 'DELIVERED' ? null :
                                                <TouchableOpacity style={styles.smallCapsule}>
                                                    <Text style={styles.txtsmallbold}>Cancel</Text>
                                                </TouchableOpacity>
                                            }

                                        </View> */}
                                        <TouchableOpacity style={{ ...styles.smallCapsule, width: '60%' }}>
                                            <Text style={styles.statustxt}>
                                                · {item?.order_status === 'ADMIN_REVIEW' ? 'In Review'
                                                    : item?.order_status === 'PENDING' ? 'In Review'
                                                        : item?.order_status === 'ASSIGNED_TO_VENDOR' ? 'Confirmed'
                                                            : item?.order_status === 'VENDOR_ACCEPTED' ? 'In Process'
                                                                : item?.order_status === 'DELIVERED' ? 'Delivered'
                                                                    : null}
                                            </Text>
                                        </TouchableOpacity>

                                    </View>

                                </TouchableOpacity>

                            </>

                        )}
                        keyExtractor={(item) => item.id}
                    />
                </View>
                <View style={styles.ordercontainer}>
                    <View style={{ marginBottom: 5 }}>
                        <Text style={styles.txtmediumbold}>Address Detail</Text>
                    </View>
                    <Text style={styles.txtmedium}>{specificOrder?.shipping_address_details?.name}</Text>
                    <Text style={styles.txtsmall}>{specificOrder?.shipping_address_details?.street_address},{' '} {specificOrder?.shipping_address_details?.city},</Text>
                    <Text style={styles.txtsmall}>{specificOrder?.shipping_address_details?.state} - {specificOrder?.shipping_address_details?.postal_code}</Text>
                    <Text style={styles.txtsmall}>Phone Number:{specificOrder?.shipping_address_details?.phone_number}</Text>
                </View>
                <View style={styles.ordercontainer}>
                    <View style={{ marginBottom: 5 }}>
                        <Text style={styles.txtmediumbold}>Order Summary</Text>
                    </View>

                    <View style={styles.detail}>
                        <Text style={styles.txtsmall}>SubTotal</Text>
                        <Text style={styles.txtmediumbold}>₹{(subtotal).toFixed(2)}</Text>
                    </View>
                    <View style={styles.detail}>
                        <Text style={styles.txtsmall}>Discount</Text>
                        <Text style={styles.discountPrice}>- ₹{(subtotal - discount).toFixed(2)}</Text>
                    </View>
                    <View style={styles.detail}>
                        <Text style={styles.txtsmall}>Mechanic Fee</Text>
                        <Text style={styles.txtmediumbold}>₹{(mechnaicfee).toFixed(2)}</Text>
                    </View>
                    <View style={styles.detail}>
                        <Text style={styles.txtsmall}>Driver Fee</Text>
                        <Text style={styles.txtmediumbold}>₹{specificOrder?.driver_fees}</Text>
                    </View>
                    <View style={styles.detail}>
                        <Text style={styles.txtsmall}>Delivery Fee</Text>
                        <Text style={styles.txtmediumbold}>₹{specificOrder?.delivery_charge}</Text>
                    </View>
                    <View style={styles.divider}></View>
                    <View style={styles.detail}>
                        <Text style={styles.txtsmallbold}>Total</Text>
                        <Text style={styles.txtmediumbold}>₹{specificOrder?.total_price}</Text>

                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

export default OrderDetail