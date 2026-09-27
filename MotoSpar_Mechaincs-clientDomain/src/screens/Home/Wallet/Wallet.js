import { View, Text, TouchableOpacity, Image, Share, Alert, FlatList, ImageBackground } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions'
import { useNavigation } from '@react-navigation/native'
import { styles } from '../../../assets/Css/WalletCss';
import Colors from '../../../constants/Colors';
import { HomeContext } from '../../../context/HomeContext';
import Loading from '../../../components/HOC/Loading';
import { useSelector } from 'react-redux';
import { RefreshControl } from 'react-native';

const Wallet = () => {
    const user = useSelector(state => state.userData);
    const navigation = useNavigation()
    const [offset, setOffset] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const { GetStatistics, statistics, loadingactivity, GetJobs, mechanic_Jobs, setmechanic_Jobs, HasNext, AcceptJob, setSpecificAcceptedJob, GetUserProfile } = useContext(HomeContext);
    useEffect(() => {
        setmechanic_Jobs([]); // Clear previous state
        setOffset(0);
        GetJobs(0)
        GetStatistics()
        GetUserProfile()
    }, [])
    const handleRefresh = async () => {
        setRefreshing(true);
        setmechanic_Jobs([]); // Clear previous
        setOffset(0);

        await Promise.all([
            GetJobs(0),
            GetStatistics(),
            GetUserProfile()
        ]);

        setRefreshing(false);
    };

    return (
        <View style={[styles.container, { flex: 1 }]}>
            {/* Main content area */}
            <View style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.subcontainer}>
                    <View style={{ ...styles.header, marginTop: 10 }}>
                        <Text style={styles.txt20bold}>Wallet</Text>
                    </View>
                    <View style={styles.divider} />
                </View>

                {/* Banner */}

                <View style={{ ...styles.banner, backgroundColor: '#4CAF5017', borderColor: '#4CAF50', }}>

                    <Text style={{ ...styles.txt18bold, }}>Total Earning</Text>
                    <Text style={{ ...styles.txt22bold, }}>₹ {statistics?.total_work_amount}</Text>

                    <View style={{ ...styles.CardTextflex, gap: 30, marginVertical: 20, }}>

                        <View style={{ alignItems: 'center' }}>


                            <Text style={{ ...styles.txt16bold, }}>Deposit Balance</Text>
                            <Text style={{ ...styles.txt20bold, }}>₹ {user?.mechanic_profile?.top_up_balance}</Text>

                        </View>

                        <TouchableOpacity style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: Colors?.btnColors?.success,
                            borderRadius: 10,
                            height: 30,
                            paddingHorizontal: 10,
                            flexDirection: 'row',
                            gap: 5,
                            backgroundColor: Colors?.btnColors?.success
                        }} onPress={() => navigation.navigate('TopupPayment')}>
                            <IO
                                name='wallet-outline'
                                size={responsiveFontSize(2.5)}
                                color={'white'}
                            />
                            <Text style={{ ...styles.txt14bold, color: Colors?.background?.primary }}>Add Deposit</Text>
                        </TouchableOpacity>

                    </View>
                </View>
                <View style={{
                    ...styles.card,
                    width: '95%',

                    alignSelf: 'center',
                    backgroundColor: '#FF670017',
                    borderColor: Colors?.btnColors.primary,
                    marginTop: 20,
                    padding: 20,

                }}>
                    <View style={styles.CardTextflex}>


                        <Text style={{ ...styles.txt16bold, }}>Total Payment Pending</Text>
                        <Text style={{ ...styles.txt20bold, }}>₹ {statistics?.total_payment_pending}</Text>

                    </View>
                    <View style={styles.CardTextflex}>


                        <Text style={{ ...styles.txt16bold, }}>Total Payment Recieved</Text>
                        <Text style={{ ...styles.txt20bold, }}>₹ {statistics?.total_payment_received}</Text>

                    </View>
                </View>



                <View style={styles.subcontainer}>
                    <View style={styles.CardTextflex}>
                        <Text style={{ ...styles.txt18bold, marginVertical: 20 }}>Payment History</Text>
                        {
                            mechanic_Jobs && mechanic_Jobs?.length > 0 ?
                                <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Transaction')}>
                                    <Text style={{ ...styles.txt14, marginVertical: 20 }}>View All</Text>
                                </TouchableOpacity> :
                                null
                        }
                    </View>

                    {/* Transaction card */}
                    <FlatList

                        showsVerticalScrollIndicator={false}
                        data={mechanic_Jobs}
                        keyExtractor={(item) => item.id.toString()} // Unique key for each item
                        renderItem={({ item }) => (
                            <View style={{ ...styles.card, borderColor: Colors.background.secondary, marginBottom: 10 }}>
                                <View style={styles.CardTextflex}>
                                    <View>
                                        <View style={styles.CardTextflex}>
                                            <View
                                                style={{
                                                    marginHorizontal: 10,
                                                    width: responsiveWidth(10),
                                                    height: responsiveWidth(10),
                                                    borderRadius: responsiveWidth(5),
                                                    backgroundColor: Colors?.btnColors?.primary,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Text
                                                    style={{ ...styles.txt22bold, color: 'white' }}
                                                >
                                                    {item?.order_details?.customer_details?.full_name.slice(0, 1)}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={styles.txt10}>Recieved from</Text>
                                                <Text style={styles.txt16}>{item?.order_details?.customer_details?.full_name}</Text>
                                            </View>
                                        </View>

                                    </View>
                                    <View>

                                        <Text style={{ ...styles.txt16bold, textAlign: 'right' }}>₹{item?.mechanic_fees}</Text>

                                    </View>

                                </View>
                            </View>
                        )}


                        ListEmptyComponent={
                            !loadingactivity && (
                                <View style={{ marginTop: 50, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 16, color: '#888', alignSelf: 'center' }}>
                                        No payemnts yet!
                                    </Text>
                                </View>
                            )
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[Colors.btnColors.primary]} // customize spinner color
                            />
                        }
                    />

                </View>
                {
                    loadingactivity ? <Loading /> : null
                }
            </View>


        </View>
    )
}

export default Wallet