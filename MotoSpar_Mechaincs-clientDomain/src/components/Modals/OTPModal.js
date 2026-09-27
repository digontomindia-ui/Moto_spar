// OTPModal.js
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import OTPInput, { OtpInput } from 'react-native-otp-entry';
import Colors from '../../constants/Colors';

const OTPModal = ({ visible, onClose, onVerify, setOtp }) => {



    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Enter OTP Provided by the customer</Text>

                    <OtpInput
                        numberOfDigits={6}
                        style={styles.otpInput}
                        focusColor={Colors.btnColors.primary}
                        autoFocus={true}
                        hideStick={true}
                        blurOnFilled={true}
                        disabled={false}
                        type="numeric"
                        secureTextEntry={false}
                        focusStickBlinkingDuration={500}
                        onFocus={() => console.log('Focused')}
                        onBlur={() => console.log('Blurred')}
                        onTextChange={text => setOtp(text)}
                        onFilled={text => console.log(`OTP is ${text}`)}
                        textInputProps={{
                            accessibilityLabel: 'One-Time Password',
                        }}
                        theme={{
                            pinCodeTextStyle: { color: Colors.textColors.primary },
                        }}
                    />


                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.verifyBtn} onPress={onVerify}>
                            <Text style={styles.btnText}>Verify</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default OTPModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#00000080',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 30,
        width: '90%',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: Colors.textColors.primary
    },
    otpInput: {
        marginBottom: 20,
        width: '100%',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#ccc',
        padding: 12,
        marginRight: 10,
        borderRadius: 5,
        alignItems: 'center'
    },
    verifyBtn: {
        flex: 1,
        backgroundColor: Colors.btnColors.primary,
        padding: 12,
        borderRadius: 5,
        alignItems: 'center'
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold'
    }
});
