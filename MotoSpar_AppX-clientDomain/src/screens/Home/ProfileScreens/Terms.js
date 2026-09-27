import { View, Text } from 'react-native'
import React from 'react'
import WebView from 'react-native-webview'
import Header from '../../../components/HOC/Header'


const Terms = () => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
          <Header screenName={'Terms & Policy'} backIcon={true} />
       <WebView source={{ uri: 'https://motospar.com/policy' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowFileAccess={true} 
        // allowFontScaling={false} 
        />
    </View>
  )
}

export default Terms