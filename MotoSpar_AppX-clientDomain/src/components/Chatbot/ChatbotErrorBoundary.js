import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

// A remote workflow controls some of the chat payload. Keep a malformed
// payload from unmounting the entire React Native application.
class ChatbotErrorBoundary extends React.Component {
  state = {hasError: false, retryKey: 0};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  retry = () => {
    this.setState(current => ({hasError: false, retryKey: current.retryKey + 1}));
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.notice}>
          <Text style={styles.text}>Chat temporarily unavailable.</Text>
          <TouchableOpacity accessibilityRole="button" onPress={this.retry} style={styles.button}>
            <Text style={styles.buttonText}>Restart chat</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>;
  }
}

const styles = StyleSheet.create({
  notice: {
    alignItems: 'center',
    backgroundColor: '#16212E',
    borderRadius: 18,
    bottom: 28,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'absolute',
    right: 20,
    zIndex: 1000,
  },
  text: {color: '#fff', fontSize: 12, marginBottom: 6},
  button: {backgroundColor: '#F95F19', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6},
  buttonText: {color: '#fff', fontSize: 12, fontWeight: '700'},
});

export default ChatbotErrorBoundary;
