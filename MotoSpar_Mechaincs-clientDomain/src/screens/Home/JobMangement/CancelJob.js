import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React, { useContext, useState } from 'react'
import { styles } from '../../../assets/Css/JobCss'
import IO from 'react-native-vector-icons/Ionicons';
import CommonBtn from '../../../components/HOC/CommonBtn';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import { HomeContext } from '../../../context/HomeContext';
import Colors from '../../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
const CancelJob = () => {
    const navigation = useNavigation()
    const { SpecificAcceptedJob, DeclineJob, loadingactivity } = useContext(HomeContext);
    const [msg, setmsg] = useState('');
    const handleDecline = async () => {
        const res = await DeclineJob(SpecificAcceptedJob?.id, msg)
        if (res) {
            navigation.navigate('Bottomtabs')
        }
    }
    return (
        <View style={[styles.container, { flex: 1 }]}>
            {/* Main content area */}
            <View style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.subcontainer}>
                    <View style={styles.CardTextflex}>
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
                            <Text style={{ ...styles.txt20bold }}>Job ({SpecificAcceptedJob?.order_details?.order_code})</Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>
                    <View style={{
                        ...styles.divider, marginBottom: 0
                    }} />
                </View>


                {/*  Job description card */}
                <View style={[styles.subcontainer, { flex: 1 }]}>
                    <View style={styles.card}>
                        <Text style={styles.txt14}>Job ID ({SpecificAcceptedJob?.order_details?.order_code})</Text>
                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                            <Text style={{ ...styles.txt14bold, color: 'red' }}>Issue:</Text>
                            <Text style={{ ...styles.txt14, color: 'red' }}>{SpecificAcceptedJob?.notes}</Text>

                        </View>
                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>

                            <Text style={styles.txt14bold}>Product:</Text>
                            <Text style={styles.txt14}>{SpecificAcceptedJob?.variant_name}</Text>

                        </View>
                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                            <Text style={styles.txt14bold}>Customer Name:</Text>
                            <Text style={styles.txt14}>{SpecificAcceptedJob?.order_details?.customer_details?.full_name}</Text>

                        </View>
                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                            <Text style={styles.txt14bold}>Mobile Number:</Text>
                            <Text style={styles.txt14}>{SpecificAcceptedJob?.order_details?.customer_details?.phone_number}</Text>

                        </View>
                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                            <Text style={{ ...styles.txt14bold, alignSelf: 'flex-start' }}>Location:</Text>
                            <View >
                                <Text style={styles.txt14} >{SpecificAcceptedJob?.order_details?.shipping_address_details?.street_address}, {SpecificAcceptedJob?.order_details?.shipping_address_details?.city}, {SpecificAcceptedJob?.order_details?.shipping_address_details?.postal_code}, {SpecificAcceptedJob?.order_details?.shipping_address_details?.state}</Text>
                                {/* <TouchableOpacity activeOpacity={0.7} >
                                        <Text style={{ ...styles.txt14, color: Colors.btnColors.primary, textDecorationLine: 'underline' }}>Google Map</Text>
                                    </TouchableOpacity> */}
                            </View>

                        </View>
                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                            <Text style={styles.txt14bold}>Estimate Payment:</Text>
                            <Text style={{ ...styles.txt14, color: 'green' }}>₹{SpecificAcceptedJob?.mechanic_fees}</Text>

                        </View>
                    </View>
                    <Text style={{ ...styles.txt18bold, marginVertical: 10 }}>Cancellation</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline={true}
                        numberOfLines={5}
                        placeholder='Type your reason here (optional)'
                        placeholderTextColor='#999'
                        value={msg}
                        onChangeText={setmsg}
                        textAlignVertical='top'
                        returnKeyType='send'
                        keyboardType='default'
                    />
                </View>
            </View>

            {/* Sticked Bottom Text */}
            <View style={{
                padding: 20,
            }}>

                <View style={styles.CardTextflex}>
                    <CommonBtn height={40} title={'Submit'} textColor={'white'} onpress={handleDecline} bgcolor={Colors?.btnColors?.primary} />


                </View>
            </View>


        </View>
    )
}

export default CancelJob