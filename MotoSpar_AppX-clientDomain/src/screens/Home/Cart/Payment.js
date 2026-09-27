import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useContext, useState } from 'react'
import { styles } from '../../../assets/Css/CartCss'
import Header from '../../../components/HOC/Header'
import ProgressSteps from '../../../components/Atoms/ProgressSteps'
import { ScrollView } from 'react-native-gesture-handler'
import FA from 'react-native-vector-icons/FontAwesome5'
import { responsiveHeight } from 'react-native-responsive-dimensions'
import CommonBtn from '../../../components/HOC/CommonBtn'
import { HomeContext } from '../../../context/HomeContext'
import { useNavigation } from '@react-navigation/native'
import RazorpayCheckout from 'react-native-razorpay';
import Colors from '../../../constants/Colors'
const Payment = ({ route }) => {
    const buynow = route?.params?.buynow;
    const productVariant = route?.params?.productVariant;
    const totalMechanicFees = route?.params?.totalMechanicFees;
    const totalDriverFees = route?.params?.totalDriverFees;
    const delivery_charge = route?.params?.delivery_charge
    const navigation = useNavigation();
    const { finalPrice, orderAddress, PlaceOrder, RazorpayInitiate, RazorpayCallback, BuynowOrder, message } = useContext(HomeContext);
    const [selectedOption, setSelectedOption] = useState(null)
    const options = [
        { label: 'Online Payment', iconName: 'phone', value: 'PAYMENT_GATEWAY' },
        { label: 'Cash on Delivery', iconName: 'indian-rupee-sign', value: 'CASH_ON_DELIVERY' },
    ];
    const handle_COD_Order = async () => {
        try {
            const message = buynow
                ? await BuynowOrder(orderAddress, selectedOption, productVariant.id, 1, delivery_charge, totalMechanicFees, totalDriverFees)
                : await PlaceOrder(orderAddress, selectedOption);

            if (message?.status === 'success') {
                navigation.navigate('SuccessScreen', { status: 'success' });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Something went wrong',
                    position: 'bottom',
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Something went wrong',
                text2: error || 'Please try again.',
                position: 'bottom',
            });
        }

    };
    const handle_payment = async () => {
        const data = buynow
            ? await BuynowOrder(orderAddress, selectedOption, productVariant.id, 1, delivery_charge, totalMechanicFees, totalDriverFees)
            : await PlaceOrder(orderAddress, selectedOption);


        if (selectedOption === 'PAYMENT_GATEWAY') {
            const detail = await RazorpayInitiate(data?.order?.id)

            RazorPay(data?.order?.id, detail)
        }

    }
    const RazorPay = (orderid, detail) => {
        var options = {
            description: 'Credits towards consultation',
            image: 'https://s3-alpha-sig.figma.com/img/72a4/cb82/9e30f85c34d6db1c4ff6bfa1e5e57d65?Expires=1737331200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=D9RPCGBliBuvL2-YxAVY29yCiE-4kESjnqUhOVEUYtjAPqgYIgpnPBJ~jUeIe2~vc0lLacTGpNcRSjvkTudB36I-YrZtLJe4IYNRfS4NQTcu2T8P7Uw4dHI88FqLcEfsrglAFhhh7Gq15lrGInqiL~h3GQ8j2zKZDbEHQRJWAzLKWIfSQ8ZyPj206TcFHtSE1nMstUAtApVBTZ~GJBnxrsZmDRYMm7prD2V611JMO-WXsYg8PbSOpIOrSGMxWgWlr5xrAAK~-CO6Gef3mySncgKnXlR8g-OKG1pzO0fjdZyn5wK5M~HPnX6nEYUoENUfmUwD2omuW1j4-DsmweR0hw__',
            currency: 'INR',
            key: 'rzp_test_MnmTD9Cpt7pRSS', // Your api key
            amount: detail?.prefill?.amount,
            name: 'Motospar',
            order_id: detail?.data?.razorpay_order_id,
            prefill: {
                email: detail?.prefill?.email,
                contact: detail?.prefill?.contact,
                name: detail?.prefill?.name
            },
            theme: { color: Colors.btnColors.primary }
        }
        RazorpayCheckout.open(options).then((data) => {
            console.log(data)
            RazorpayCallback(detail?.data?.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature)
            navigation.navigate('SuccessScreen', { status: 'success' });
        }).catch((error) => {
            // handle failure
            navigation.navigate('SuccessScreen', { status: 'fail' });
        });
    }
    return (
        <View style={styles.container}>
            <Header screenName={'Shopping Cart'} navigateTo={'CartAddress'} backIcon={true} />
            <ScrollView style={styles.subcontainer} showsVerticalScrollIndicator={false}>
                <ProgressSteps screen={2} />
                <View style={{ ...styles.ordercontainer, marginTop: responsiveHeight(3) }}>
                    <Text style={styles.txtmediumbold}>Payment Options</Text>
                    {options.map((option) => (
                        <TouchableOpacity activeOpacity={0.6}
                            key={option.value}
                            style={{ ...styles.orderestimateCard, height: responsiveHeight(8), }}
                            onPress={() => setSelectedOption(option.value)}
                        >
                            <View style={[styles.radioButton, selectedOption === option.value && styles.radioButtonSelected]}>
                                {selectedOption === option.value && <View style={styles.radioButtonInner} />}
                            </View>
                            <Text style={styles.txtsmallbold}>{option.label}</Text>
                            {option.offer && <Text style={styles.txtsmall}>{option.offer}</Text>}
                            {/* <FA name={option.iconName} size={24} color={option.iconName === 'phone' ? '#814cfd' : '#3d3d3d'} style={styles.icon} /> */}
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
            <View style={styles.bottomView}>
                <Text style={styles.txtnormalbold}>
                    ₹{(finalPrice).toFixed(2)}
                </Text>
                <View style={{ width: '50%' }}>
                    <CommonBtn title={selectedOption === 'CASH_ON_DELIVERY' ? 'Place Order' : 'Pay Now'} height={4} onpress={() => { selectedOption === 'CASH_ON_DELIVERY' ? handle_COD_Order() : handle_payment() }} bgcolor={selectedOption ? '' : 'grey'} disable={selectedOption ? false : true} />
                </View>
            </View>
        </View>
    )
}

export default Payment