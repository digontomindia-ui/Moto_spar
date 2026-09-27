import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native'
import React, { useContext, useState } from 'react'
import Header from '../../components/HOC/Header'
import { styles } from '../../assets/Css/AuthCss'
import { Textinput, Textinputname } from '../../components/HOC/Textinput'
import Passwordinput from '../../components/HOC/Passwordinput'
import AuthButton from '../../components/HOC/AuthButton'
import Googlebtn from '../../components/HOC/Googlebtn'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../../context/AuthContext'
import Loading from '../../components/HOC/Loading'


const Register = () => {
    const navigation = useNavigation();
    const { Register, loadingactivity } = useContext(AuthContext);
    const [firstname, setfirstname] = useState('');
    const [lastname, setlastname] = useState('')
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [cnfpassword, setcnfpassword] = useState('');

    const HandleSignup = () => {
        Register(
            firstname, lastname, email, password, cnfpassword
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <Header />
           
            <View style={{height:'92%'}} >
           
                <View style={styles.container}>
                    <Text style={styles.text1}>Let's get started!</Text>
                    <Text style={styles.text2register}>Sign up</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{width:"50%"}}>
                            <Text style={styles.inputHeadtext}>First Name</Text>
                            <Textinputname
                                placeholder={'Enter Name'}
                                value={firstname}
                                onChangeText={setfirstname}
                            />
                        </View>
                        <View  style={{width:"50%"}}>
                            <Text style={styles.inputHeadtext}>Last Name</Text>
                            <Textinputname
                                placeholder={'Enter Name'}
                                value={lastname}
                                onChangeText={setlastname}
                            />
                        </View>
                    </View>
                    <Text style={styles.inputHeadtext}>Email</Text>
                    <Textinput
                        placeholder={'Enter Email'}
                        value={email}
                        onChangeText={setemail}
                    />
                    <Text style={styles.inputHeadtext}>Password</Text>
                    <Passwordinput
                        value={password}
                        onChangeText={setpassword}
                    />
                    <Text style={styles.inputHeadtext}>Confirm Password</Text>
                    <Passwordinput
                        value={cnfpassword}
                        onChangeText={setcnfpassword}
                    />
                    <View style={{ alignItems: 'center' }}>
                        {loadingactivity ? <Loading /> : <AuthButton title={'SIGN UP'} onpress={HandleSignup} />}

                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                            <Text style={styles.acctxt}>Already have an account?</Text>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.accbtn}> Sign in</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                </View>
                
                <ImageBackground
                    source={require('../../assets/images/bottomimg.png')}
                    style={styles.bottomImg}
                />
            
            </View>
            
        </View>
    )
}



export default Register