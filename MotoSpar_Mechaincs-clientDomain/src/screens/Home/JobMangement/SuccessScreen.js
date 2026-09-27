import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import React from 'react'
import IO from 'react-native-vector-icons/Ionicons'
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions'
import LottieView from 'lottie-react-native'
import { useNavigation } from '@react-navigation/native'
const SuccessScreen = ({ route }) => {
    const navigation = useNavigation()
    const amount = route?.params?.amount
    return (

        <View style={styles.container}>
            <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('Bottomtabs', { screen: 'Job' })} style={styles.btn}>
                <IO name="close-outline" size={responsiveFontSize(5)} color={'black'} />
            </TouchableOpacity>
            <View style={styles.content}>
                <Text style={styles.txt}>
                    Job Completed !
                </Text>
                <Text style={styles.txt}>
                    ₹{amount || 0} added to you wallet.
                </Text>
                <LottieView source={require('../../../assets/images/success.json')} autoPlay style={{ width: responsiveWidth(100), height: responsiveWidth(100) }} />
            </View>

        </View>

    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    btn: {
        alignSelf: 'flex-end'
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',

    },
    txt: {
        fontSize: 26,
        fontWeight: '800',
        color: 'green',

    }
})

export default SuccessScreen