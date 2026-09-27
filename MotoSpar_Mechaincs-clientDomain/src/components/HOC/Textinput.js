import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import React, { useState } from 'react';
import Colors from '../../constants/Colors';
import { Fonts, FontWeight } from '../../constants/Fonts';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import Icon from "react-native-vector-icons/FontAwesome5"

export const Textinput = ({ placeholder, value, onChangeText, bgcolor, inputType, margin, border, capital, maxlength, editable, onSubmitEditing }) => {
    const styles = StyleSheet.create({
        txtinputContainer: {
            width: '100%',
            marginVertical: margin ? responsiveHeight(margin) : responsiveHeight(0.5),
            height: responsiveHeight(4.7),
            borderRadius: 20,
            backgroundColor: Colors.background.primary,
            // Shadow for iOS
            borderWidth: 0.5,
            borderColor: Colors.btnColors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            // Elevation for Android 
        },
        txtinput: {
            width: '100%',
            height: 38,
            borderRadius: 4,
            paddingHorizontal: 15,
            fontSize: Fonts.font14,
            fontWeight: FontWeight.medium,
            color: Colors.textColors.primary,
        },
    });

    return (
        <View style={styles.txtinputContainer}>
            <TextInput 
                cursorColor={Colors.btnColors.primary}
                style={styles.txtinput}
                autoCapitalize={capital ? 'sentences' : 'none'}
                placeholder={placeholder}
                placeholderTextColor={Colors.textColors.primary}
                keyboardType={inputType}
                returnKeyType="next"
                returnKeyLabel=''
                underlineColorAndroid="transparent"
                blurOnSubmit={true} // Changed from false to true
                value={value}
                onChangeText={onChangeText}
                maxLength={maxlength ? maxlength : null}
                editable={editable ? editable : true}
                onSubmitEditing={onSubmitEditing || (() => Keyboard.dismiss())} // Added keyboard dismiss
            />
        </View>
    );
};

export const Passwordinput = ({ value, onChangeText, placeholder, margin, onSubmitEditing }) => {
    const [togglepassword, settogglepassword] = useState(true);
    
    const styles = StyleSheet.create({
        passwordinput: {
            width: "100%",
            marginVertical: margin ? responsiveHeight(margin) : responsiveHeight(0.5),
            height: responsiveHeight(5),
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.background.primary,
            borderRadius: 20,
            marginBottom: 10,
            paddingHorizontal: 10,
            justifyContent: 'space-between',
            overflow: 'hidden',
            borderWidth: 0.5,
            borderColor: Colors.btnColors.primary,
        },
    })
    
    return (
        <View style={styles.passwordinput}>
            <TextInput 
                style={{
                    color: Colors.textColors.primary, 
                    fontSize: Fonts.font14,
                    fontWeight: FontWeight.medium,
                    width: '90%'
                }}
                returnKeyLabel='password'
                autoCapitalize="none"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors?.textColors.primary}
                returnKeyType='done'
                secureTextEntry={togglepassword}
                underlineColorAndroid="transparent" // Changed from "#f000" to "transparent"
                blurOnSubmit={true} // Added this property
                onSubmitEditing={onSubmitEditing || (() => Keyboard.dismiss())} // Added keyboard dismiss
            />
            
            <TouchableOpacity style={{ marginRight: 10 }} onPress={() => settogglepassword(!togglepassword)}>
                {togglepassword ?
                    <Icon name='eye' size={16} color={Colors.textColors.primary} />
                    :
                    <Icon name='eye-slash' size={16} color={Colors.textColors.primary} />
                }
            </TouchableOpacity>
        </View>
    )
}