import { View, Text } from 'react-native'
import React, { useContext, useState } from 'react'
import { styles } from '../../../assets/Css/ProfileCss'
import Header from '../../../components/HOC/Header'
import Ion from 'react-native-vector-icons/Ionicons'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import Colors from '../../../constants/Colors'
import { Textinput, Textinputname } from '../../../components/HOC/Textinput'
import CommonBtn from '../../../components/HOC/CommonBtn'
import { HomeContext } from '../../../context/HomeContext'
import { useNavigation } from '@react-navigation/native'
const ContactUs = () => {
    const navigation=useNavigation()
    const [name, setname] = useState('');
    const [email, setemail] = useState('');
    const [phone_number, setphone_number] = useState(null);
    const [message, setmessage] = useState('');
    const { Contact, loadingactivity} = useContext(HomeContext);
    const HandleSubmit=async()=>{
       const res=await Contact(name,email,phone_number,message);
       
       if(res==='success'){
        setname('');
        setemail('');
        setphone_number('');
        setmessage('');
       navigation.navigate('ContactSuccess',{status:'success'})
       }
    }
    return (
        <View style={styles.container}>
            <Header screenName={'Contact Us'} backIcon={true} />
            <View style={styles.subcontainer}>
                <Text style={{ ...styles.txtnormalbold, marginBottom: 10 }}>Contact Information</Text>

                <View style={styles.infoAlign}>
                    <Ion name='call-outline' size={responsiveFontSize(2.5)} />
                    <Text style={{ ...styles.txtsmall, color: Colors.textColors.secondary }}>+91 79082 54954</Text>
                </View>
                <View style={styles.infoAlign}>
                    <Ion name='mail-outline' size={responsiveFontSize(2.5)} color={Colors.textColors.secondary} />
                    <Text style={{ ...styles.txtsmall, color: Colors.textColors.secondary }}>support@motospar.com</Text>

                </View>
                <View style={{ ...styles.divider, marginVertical: responsiveWidth(4) }}></View>
                <View style={{ ...styles.formContainer, marginTop: responsiveWidth(2), backgroundColor:Colors.textInputColors.secondary}}>
                    <Text style={{ ...styles.txtmediumbold, textAlign: 'center', color: Colors.textColors.secondary }}>Contact Form</Text>
                    <View style={styles.spacewide}>
                    <Textinputname
                        placeholder={'Name'}
                        value={name}
                        onChangeText={setname}
                        keyboardType={'default'}
                        customWidth={true}
                        bgcolor={Colors.background}
                    />
                    </View>
                    <View style={styles.spacewide}>
                    <Textinput
                        placeholder={'Email'}
                        value={email}
                        onChangeText={setemail}
                        bgcolor={Colors.background}
                    />
                    </View>
                    <View style={styles.spacewide}>
                    <Textinputname
                        placeholder={'Enter Phone Number'}
                        value={phone_number}
                        onChangeText={setphone_number}
                        maxlength={10}
                        keyboardType={'Numeric'}
                        customWidth={true}
                        bgcolor={Colors.background}
                        
                    />
                    </View>
                    <View style={styles.spacewide}>
                    <Textinputname
                        placeholder={'Message'}
                        value={message}
                        onChangeText={setmessage}
                        multiline={true}
                        height={responsiveHeight(15)}
                        keyboardType={'deafult'}
                        customWidth={true}
                        bgcolor={Colors.background}
                    />
                    </View>
                    <View style={styles.spacewide}>
                    <CommonBtn height={5} title={'Submit'} onpress={HandleSubmit} />
                        </View>
                </View>
            </View>

        </View>
    )
}

export default ContactUs