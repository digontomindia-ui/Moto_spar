import { View, Text, TouchableOpacity, Image, Share, Alert } from 'react-native'
import React, { useState } from 'react'
import { styles } from '../../assets/Css/JobCss'
import Colors from '../../constants/Colors'
import CommonBtn from '../../components/HOC/CommonBtn'
import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize } from 'react-native-responsive-dimensions'
import { useNavigation } from '@react-navigation/native'
import Clipboard from '@react-native-clipboard/clipboard'
import Toast from 'react-native-toast-message'

const Refer = () => {
    const [isExpanded, setisExpanded] = useState(false)
    const navigation = useNavigation()
    const shareText = async (text) => {
        try {
            const result = await Share.share({
                message: text,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type:', result.activityType);
                } else {
                    console.log('Shared successfully');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Sharing error:', error.message);
        }
    };

    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        Toast.show({
            type: 'success',
            text1: `Copied to Clipboard ${text}`,
            position: 'top'

        })

    };
    return (
        <View style={[styles.container, { flex: 1 }]}>
            {/* Main content area */}
            <View style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.subcontainer}>
                    <View style={{ ...styles.CardTextflex, marginTop: 10 }}>
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
                            <Text style={{ ...styles.txt20bold }}>Refer Friends</Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>
                    <View style={styles.divider} />
                </View>

                {/* Banner */}
                <View style={styles.banner}>
                    <Image
                        source={require('../../assets/images/Refer_bannner.png')}
                        style={{
                            width: '100%',
                            height: 200,
                            resizeMode: 'contain'
                        }}
                    />
                </View>

                {/* Invite stats */}
                <View style={[styles.subcontainer, { flex: 1 }]}>
                    <Text style={{ ...styles.txt18bold, marginVertical: 20 }}>Your Invites</Text>
                    <View style={{
                        ...styles.card,
                        borderColor: Colors.background.secondary,
                    }}>
                        <View style={{
                            ...styles.CardTextflex,
                            justifyContent: 'space-around',
                        }}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.txt16}>₹ 0</Text>
                                <Text style={{ ...styles.txt16, color: '#8C8B8B' }}>Earned</Text>
                            </View>
                            <View style={styles.seprator} />
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.txt16}>₹ 0</Text>
                                <Text style={{ ...styles.txt16, color: '#8C8B8B' }}>Pending</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text style={{
                                ...styles.txt16,
                                color: '#8C8B8B',
                                textAlign: 'center'
                            }}>See All</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Sticked Bottom Text */}
            <View style={{
                padding: 20,
            }}>
                <View style={{ ...styles.card, borderColor: Colors.background.secondary, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                    <Text style={{
                        ...styles.txt16,
                        color: '#8C8B8B',
                        textAlign: 'center'
                    }}>Your referral code</Text>
                    <TouchableOpacity style={styles.CardTextflex} activeOpacity={0.7} onPress={() => copyToClipboard('ABC567')}>
                        <Text style={{ ...styles.txt16bold, color: '#8C8B8B', marginRight: 5 }}>ABC567</Text>
                        <IO
                            name='copy-outline'
                            size={responsiveFontSize(2)}
                            color={'black'}
                        />
                    </TouchableOpacity>
                </View>
                <CommonBtn height={40} title={'Share Code'} textColor={'white'} onpress={() => shareText('This is my refer code :ABC567')} />
            </View>
        </View>
    )
}

export default Refer
