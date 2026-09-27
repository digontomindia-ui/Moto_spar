import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native'
import React, { useContext, useState } from 'react'
import { styles } from '../../assets/Css/HomeCss'
import CommonBtn from '../../components/HOC/CommonBtn'
import Colors from '../../constants/Colors'
import { Fonts, FontWeight } from '../../constants/Fonts'
import { HomeContext } from '../../context/HomeContext'
import RazorpayCheckout from 'react-native-razorpay';
import LottieView from 'lottie-react-native'
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions'
import IO from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'
const TopUpPayment = () => {
    const navigation = useNavigation()
    const [amount, setamount] = useState(null);
    const [paymentStatus, setpaymentStatus] = useState('');
    const [ismodalvisible, setismodalvisible] = useState(false)
    const {
        RazorpayInitiate,
        RazorpayCallback,
        loadingactivity,
    } = useContext(HomeContext);

    const handleSubmit = async () => {
        const res = await RazorpayInitiate(parseFloat(amount));

        if (res?.status) {

            console.log("res>>", res)

            RazorPay(res)
        }
    }
    const paymentSuccess = () => {
        setismodalvisible(true);
        setTimeout(() => {
            setismodalvisible(false)

        }, 3000);
    }
    const RazorPay = (detail) => {
        var options = {
            description: 'Credits towards consultation',
            image: 'https://s3-alpha-sig.figma.com/img/72a4/cb82/9e30f85c34d6db1c4ff6bfa1e5e57d65?Expires=1737331200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=D9RPCGBliBuvL2-YxAVY29yCiE-4kESjnqUhOVEUYtjAPqgYIgpnPBJ~jUeIe2~vc0lLacTGpNcRSjvkTudB36I-YrZtLJe4IYNRfS4NQTcu2T8P7Uw4dHI88FqLcEfsrglAFhhh7Gq15lrGInqiL~h3GQ8j2zKZDbEHQRJWAzLKWIfSQ8ZyPj206TcFHtSE1nMstUAtApVBTZ~GJBnxrsZmDRYMm7prD2V611JMO-WXsYg8PbSOpIOrSGMxWgWlr5xrAAK~-CO6Gef3mySncgKnXlR8g-OKG1pzO0fjdZyn5wK5M~HPnX6nEYUoENUfmUwD2omuW1j4-DsmweR0hw__',
            currency: detail?.prefill?.currency,
            key: 'rzp_test_MnmTD9Cpt7pRSS', // Your api key
            amount: detail?.prefill?.amount * 100,
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
            console.log('detail>>', detail);
            console.log('data>>', data);
            RazorpayCallback(data?.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature)
            setpaymentStatus('success');
            paymentSuccess();
        }).catch((error) => {
            // handle failure
            setpaymentStatus('failed');
            paymentSuccess();
        });
    }
    return (
        <View style={{ flex: 1 }}>
            <View style={[styles.subcontainer, { flex: 1 }]}>

                <View style={{ ...styles.CardTextflex, marginTop: 10, justifyContent: 'space-between' }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.goBack()}
                    >
                        <IO
                            name='arrow-back-outline'
                            size={responsiveFontSize(3)}
                            color={'black'}
                        />
                    </TouchableOpacity>
                    <View style={styles.header}>
                        <Text style={{ ...styles.txt20bold }}>Add Deposit</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ ...styles.divider, marginVertical: 20 }} />
                <View style={{ alignItems: 'center', justifyContent: 'center', height: '80%' }}>

                    <TextInput
                        cursorColor={Colors.btnColors.primary}

                        keyboardType='numeric'
                        style={{
                            fontSize: Fonts.font28,
                            fontWeight: FontWeight.bold,
                            color: Colors.textColors.primary,

                        }}
                        value={amount?.length > 0 ? `₹ ${amount}` : ''}
                        onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9]/g, '');
                            setamount(numericValue);
                        }}
                        placeholder='₹ 0'
                    />
                    {
                        amount?.length > 0 && amount < 500 ? <Text style={{ ...styles.txt12, color: 'red' }}>Add Minimum ₹ 500</Text> : ''
                    }
                    <View style={{ ...styles.CardTextflex, gap: 20, marginTop: 20 }}>
                        <TouchableOpacity style={{ ...styles.miniCard, paddingHorizontal: 20 }} onPress={() => setamount('500')}>
                            <Text style={{ ...styles.txt12bold, color: Colors.textColors.primary }}>₹ 500</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ ...styles.miniCard, paddingHorizontal: 20 }} onPress={() => setamount('1000')}>
                            <Text style={{ ...styles.txt12bold, color: Colors.textColors.primary }}>₹ 1000</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ ...styles.miniCard, paddingHorizontal: 20 }} onPress={() => setamount('1500')}>
                            <Text style={{ ...styles.txt12bold, color: Colors.textColors.primary }}>₹ 1500</Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </View>
            <View style={{
                padding: 20,
            }}>
                <CommonBtn height={45} title={'Pay Now'} textColor={Colors.background.primary} disable={amount?.length < 0 || amount < 500 ? true : false} bgcolor={amount?.length < 0 || amount < 500 ? 'grey' : Colors.btnColors.primary} onpress={handleSubmit} />
            </View>
            <Modal
                visible={ismodalvisible}
            // @transparent={true}

            >

                <View style={styles.modalOverlay}>

                    {/* <View style={styles.modalContent}> */}

                    {
                        paymentStatus == 'success' ? <LottieView source={require('../../assets/images/success.json')} autoPlay style={{ width: responsiveWidth(100), height: responsiveWidth(100) }} /> : paymentStatus == 'failed' ? <LottieView source={require('../../assets/images/fail.json')} autoPlay style={{ width: responsiveWidth(100), height: responsiveWidth(100) }} /> : ''
                    }

                    {/* </View> */}
                </View>
            </Modal>
        </View>
    )
}

export default TopUpPayment