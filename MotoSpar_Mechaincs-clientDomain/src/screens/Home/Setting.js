import { View, Text, TouchableOpacity, Linking } from 'react-native'
import React, { useState } from 'react'
import { styles } from '../../assets/Css/HomeCss'
import { responsiveFontSize } from 'react-native-responsive-dimensions'
import IO from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import PrefrenceandIssueModal from '../../components/Modals/PrefrenceandIssueModal';
const Setting = () => {
    const navigation = useNavigation();
    const [feedModalTitle, setFeedModalTitle] = useState('');
    const [isFeedModalVisible, setIsFeedModalVisible] = useState(false);
    return (
        <View style={styles.container}>
            <View style={styles.subcontainer}>

                {/* header */}
                <View style={{ ...styles.CardTextflex, justifyContent: 'space-between', marginTop: 10 }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.goBack()}
                    >
                        <IO
                            name='arrow-back-outline'
                            size={responsiveFontSize(3)}
                            color={'black'}
                        />
                    </TouchableOpacity>
                    <View style={styles.header}>
                        <Text style={{ ...styles.txt20bold, }}>Settings</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.divider} />

                <TouchableOpacity style={{ marginTop: 10 }} activeOpacity={0.7} onPress={() => navigation.navigate('EditProfile')}>
                    <Text style={styles.txt16}>Account Setting</Text>
                </TouchableOpacity>
                <View style={{ ...styles.divider, marginVertical: 10, backgroundColor: 'gray' }}></View>
                <TouchableOpacity style={{ marginTop: 10 }} activeOpacity={0.7} onPress={() => {
                    setFeedModalTitle('Add your Preferences');
                    setIsFeedModalVisible(true)
                }
                }>
                    <Text style={styles.txt16}>App Preferences</Text>
                </TouchableOpacity>
                <View style={{ ...styles.divider, marginVertical: 10, backgroundColor: 'gray' }}></View>
                <TouchableOpacity style={{ marginTop: 10 }} activeOpacity={0.7} onPress={() => Linking.openURL('https://motospar.com/policy')}>
                    <Text style={styles.txt16}>Privacy & Security</Text>
                </TouchableOpacity>
                <View style={{ ...styles.divider, marginVertical: 10, backgroundColor: 'gray' }}></View>
                <TouchableOpacity style={{ marginTop: 10 }} activeOpacity={0.7} onPress={() => {
                    setFeedModalTitle('Report an Issue');
                    setIsFeedModalVisible(true)
                }
                }>
                    <Text style={{ ...styles.txt16, color: 'red' }}>Report an Issue</Text>
                </TouchableOpacity>
                <View style={{ ...styles.divider, marginVertical: 10, backgroundColor: 'gray' }}></View>
            </View>
            <PrefrenceandIssueModal
                visible={isFeedModalVisible}
                setVisible={setIsFeedModalVisible}
                title={feedModalTitle}
            />
        </View>
    )
}

export default Setting