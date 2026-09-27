import React from 'react';
import { Modal, View, Text, TouchableHighlight, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const FilterModal = ({ isVisible, onClose, onSelectFilter }) => {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Products</Text>
          <TouchableHighlight onPress={() => { onSelectFilter('highRating'); onClose(); }} activeOpacity={0.8} underlayColor="transparent">
            <Text style={onSelectFilter === 'highRating'?styles.choosed:styles.filterOption}>High Rating</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => { onSelectFilter('lowRating'); onClose(); }} activeOpacity={0.8} underlayColor="transparent">
            <Text style={styles.filterOption}>Low Rating</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => { onSelectFilter('alphabetical'); onClose(); }} activeOpacity={0.8} underlayColor="transparent">
            <Text style={styles.filterOption}>Product Name (A-Z)</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => { onSelectFilter('inStock'); onClose(); }} activeOpacity={0.8} underlayColor="transparent">
            <Text style={styles.filterOption}>In Stock</Text>
          </TouchableHighlight>
          <TouchableOpacity   onPress={onClose} activeOpacity={0.8} underlayColor="transparent">
            <Text style={styles.modalClose}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterOption: {
    fontSize: 16,
    marginVertical: 10,
  },
  modalClose: {
    fontSize: 14,
    color: 'red',
    marginTop: 20,
  },
  choosed:{
    fontSize: 16,
    marginVertical: 10,
    color:Colors.textInputColors?.primary
  }
});

export default FilterModal;
