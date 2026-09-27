import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { styles } from '../../assets/Css/JobCss'
import Colors from '../../constants/Colors'
import CommonBtn from '../../components/HOC/CommonBtn'
import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize } from 'react-native-responsive-dimensions'
import { useNavigation } from '@react-navigation/native'
import { SERVER_URL } from '../../constants/SERVER_URL'
import { useSelector } from 'react-redux'
import StarRating from '../../components/HOC/StarRating'
import { HomeContext } from '../../context/HomeContext'
import Loading from '../../components/HOC/Loading'
const JobHistory = () => {
    const user = useSelector(state => state.userData);
    const navigation = useNavigation()
    const [serverurl, setserverurl] = useState('');
    const { GetStatistics, statistics, loadingactivity, } = useContext(HomeContext);


    //  for fetching the serverurl from the component
    useEffect(() => {
        const fetchServerUrl = async () => {
            try {
                const url = await SERVER_URL(); // Assuming SERVER_URL returns a string
                setserverurl(url);
            } catch (error) {
                console.error('Error fetching server URL:', error);
            }
        };
        fetchServerUrl();
        GetStatistics() //for fetching all counts of data
    }, [])
    return (
        <View style={styles.container}>
            <View style={styles.subcontainer}>

                {/* header */}
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
                        <Text style={{ ...styles.txt20bold, }}> Job History</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.divider} />

                <View style={{
                    ...styles.card,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <View style={{ ...styles.CardTextflex, width: '50%', gap: 20 }}>
                        <Image style={styles.ProfileImg} source={user?.profile_picture ? { uri: `${serverurl}${user?.profile_picture}` } : require('../../assets/images/profile.png')} />

                        <View>
                            <Text style={{ ...styles.txt16bold }}>{user?.full_name}</Text>
                            <StarRating rating={statistics?.average_rating} iconsize={2} />
                        </View>
                    </View>
                    <View style={styles.miniCard}>
                        <Text style={styles.txt12}>Public Profile</Text>
                    </View>

                </View>

                <Text style={{
                    ...styles.txt18bold,
                    marginVertical: 20
                }}>Job Summary & Performance</Text>

                <View style={{
                    ...styles.card,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#4CAF5017',
                    borderColor: '#4CAF50',
                    marginBottom: 20,
                    padding: 20
                }}>
                    <View>
                        <Text style={{ ...styles.txt14bold, marginBottom: 10 }}>Total Completed Job: <Text style={styles.txt14}>{statistics ? statistics?.completed_jobs : 'N/A'}</Text></Text>
                        <Text style={styles.txt14bold}>Total Earning: <Text style={{ ...styles.txt14, color: 'green' }}>{statistics ? `₹ ${statistics?.total_payment_received}` : 'N/A'}</Text></Text>
                        <Text style={styles.txt14bold}>Total Payment Pending: <Text style={{ ...styles.txt14, color: 'green' }}>{statistics ? `₹ ${statistics?.total_payment_pending}` : 'N/A'}</Text></Text>
                    </View>
                    <TouchableOpacity style={{
                        ...styles.miniCard, borderWidth: 0,
                        backgroundColor: '#FEFEF1',
                        paddingHorizontal: 10
                    }} onPress={() => navigation.navigate('CompletedJob')}>
                        <Text style={{ ...styles.txt12, color: Colors.btnColors.primary }}>View Details</Text>
                    </TouchableOpacity>
                </View>
                <View style={{
                    ...styles.card,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#E6BC3D17',
                    borderColor: '#E6BC3D',
                    marginBottom: 20,
                    padding: 20
                }}>
                    <View>
                        <Text style={{ ...styles.txt14bold, marginBottom: 10 }}>Overall Rating: <Text style={styles.txt14}>({statistics ? statistics?.average_rating : 'N/A'}/5)</Text></Text>
                        <Text style={styles.txt14bold}>Reviews Count: <Text style={{ ...styles.txt14, color: 'green' }}>({statistics ? statistics?.review_count : 'N/A'} Reviews) </Text></Text>
                    </View>

                </View>
                <View style={{
                    ...styles.card,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FF670017',
                    borderColor: '#FF6700B8',
                    marginBottom: 20,
                    padding: 20
                }}>
                    <View>
                        <Text style={{ ...styles.txt14bold }}>Ongoing Job: <Text style={styles.txt14}>{statistics ? statistics?.pending_jobs : 'N/A'}</Text></Text>

                    </View>
                    <TouchableOpacity style={{
                        ...styles.miniCard, borderWidth: 0,
                        backgroundColor: '#FEFEF1',
                        paddingHorizontal: 10
                    }} onPress={() => navigation.navigate('OngoingJobList')}>
                        <Text style={{ ...styles.txt12, color: Colors.btnColors.primary }}>View Work</Text>
                    </TouchableOpacity>
                </View>
                {loadingactivity ? <Loading /> : null}
            </View>
        </View>
    )
}

export default JobHistory