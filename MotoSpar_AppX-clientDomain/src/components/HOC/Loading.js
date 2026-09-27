import { StyleSheet, View } from 'react-native'
import React from 'react'
import Spinner from 'react-native-loading-spinner-overlay'
import Colors from '../../constants/Colors'
 
export default function Loading() {
    return (
        <View style={styles.container}>
            <Spinner
                visible={true}
                color={Colors.btnColors.primary}
            />
        </View>
    )
}
 
const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        justifyContent: "center",
        alignItems: "center"
    },
 
})