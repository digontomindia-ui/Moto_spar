import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const CustomAlert = ({ title, body, visible, onClose, onConfirm }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{body}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity activeOpacity={0.6} onPress={onClose} style={styles.button}>
              <Text style={styles.noButtonText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.6} onPress={onConfirm} style={styles.button}>
              <Text style={styles.yesButtonText}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.textColors.primary
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.textColors.primary
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 5,
  },
  noButtonText: {
    color: 'orange',
    fontSize: 16,
    fontWeight: 'bold',
  },
  yesButtonText: {
    color: 'orange',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomAlert;
