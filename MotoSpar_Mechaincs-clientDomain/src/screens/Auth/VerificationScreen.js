import { View, Text, SafeAreaView, Image } from 'react-native'
import React from 'react'
import { styles } from '../../assets/Css/AuthCss'
import Colors from '../../constants/Colors'
import IO from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
const VerificationScreen = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            {/* <View style={{
                alignSelf: 'flex-end',
                margin: 30
            }}>
                <IO name="close" size={30} color={'black'} onPress={() => navigation.goBack()} />
            </View> */}
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text style={{ ...styles.txt22bold, marginBottom: 10, color: Colors.btnColors.primary }}>Your Profile is Under Verification!</Text>
                <Text style={{ ...styles.txt18bold, color: Colors.btnColors.primary }}> Please wait while we verify your profile.</Text>
                <Image source={require('../../assets/images/motosparImg.png')} style={{ width: 300, height: 300, marginVertical: 20 }} />
                <Text style={{ ...styles.txt22bold, marginBottom: 10, color: Colors.btnColors.primary }}>Thank You</Text>
            </View>
        </View>
    )
}

export default VerificationScreen