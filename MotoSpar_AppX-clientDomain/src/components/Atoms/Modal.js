// BottomModal.js

import React, { useContext, useState } from 'react';
import { Modal, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { HomeContext } from '../../context/HomeContext';
import { styles } from '../../assets/Css/CartCss';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Colors from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import IO from 'react-native-vector-icons/Ionicons'
const Model = ({ visible, onClose, data, onDataSubmit }) => {
  const navigation =useNavigation()
  const { GetShippingAddress, shippingAddress, loadingactivity } = useContext(HomeContext);

  const handleDataSubmit = (index) => {
    if (onDataSubmit) {
      onDataSubmit(index); // Send the data back to the parent component
    }
    onClose(); // Close the modal after submitting data
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={style.modalBackground}>
        <View style={style.bottomModalContainer}>
        <View style={style.topAlign}>
        <Text style={styles.txtnormalbold}>Select Address</Text>
       <TouchableOpacity onPress={()=>onClose()}>
       <IO name="close-outline" size={responsiveFontSize(5)} color={'black'}/>
       </TouchableOpacity>
        </View>
          <FlatList
            data={shippingAddress}
            renderItem={({ item, index }) => (
              <TouchableOpacity activeOpacity={0.6} style={style.addcard} onPress={() => handleDataSubmit(index)}>
                <Text style={styles.txtmediumbold}>
                  {item?.name}
                </Text>
                <Text style={styles.txtsmall}>{item?.street_address}, {item?.city}, {item?.state}{' '}{item?.postal_code}</Text>
                <Text style={styles.txtsmall}>Phone Number: {item?.phone_number}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={style.Proceedbtn}>
          <TouchableOpacity activeOpacity={0.6} style={styles.btn} onPress={() => {navigation.navigate('EditAddress');onClose()}}>
            <Text style={{ ...styles.txtmediumbold, color: Colors.btnColors.primary }}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const style = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomModalContainer: {
    width: '100%',
    height: '60%',
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    // alignItems: 'center',
  },
  txtMediumBold: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  addcard: {

    marginVertical: responsiveHeight(1.5),
    width: '100%',
    height: 'auto',
    backgroundColor: Colors.textInputColors.secondary,
    padding: responsiveWidth(2)

  },
  Proceedbtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 10
  },
  topAlign:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  }
});

export default Model;
