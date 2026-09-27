import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Platform, PermissionsAndroid, Linking } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { styles } from '../../assets/Css/JobCss'
import Colors from '../../constants/Colors'
import CommonBtn from '../../components/HOC/CommonBtn'
import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize } from 'react-native-responsive-dimensions'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { HomeContext } from '../../context/HomeContext'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
import Geolocation from 'react-native-geolocation-service';
const Jobs = () => {
    const navigation = useNavigation()
    const [isExpanded, setisExpanded] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [offset, setOffset] = useState(0);
    dayjs.extend(relativeTime);
    const {
        GetJobs,
        mechanic_Jobs,
        setmechanic_Jobs,
        HasNext,
        AcceptJob,
        setSpecificAcceptedJob,
        loadingactivity,
    } = useContext(HomeContext);


    useFocusEffect(
        useCallback(() => {
            setmechanic_Jobs([]); // Clear previous state
            setOffset(0);
            GetJobs(0)
        }, [])
    );



    const loadMoreData = () => {
        if (HasNext && !loadingactivity) {
            const newOffset = offset + 10; // Assuming 10 items per page
            setOffset(newOffset);
            GetJobs(newOffset);
        }
    };
    const HandleAcceptJob = async (jobid) => {
        const res = await AcceptJob(jobid)
        if (res) {
            navigation.navigate('SpecificOngoingJob')
        }
    }
    const filteredJobs = mechanic_Jobs.filter(job => job?.job_status === 'pending');
    const renderOrderItem = ({ item, index }) => {
        const isExpanded = expandedIndex === index;
        return (


            <TouchableOpacity
                activeOpacity={item?.is_accepted ? 0.7 : 1}
                disabled={!item?.is_accepted}
                onPress={() => {
                    if (item?.is_accepted) {
                        setSpecificAcceptedJob(item);
                        navigation.navigate('SpecificOngoingJob');
                    }
                }}
            >
                <View style={styles.card} >
                    {
                        isExpanded ?
                            <>
                                <Text style={styles.txt14}>Job ID ({item?.order_details?.order_code})</Text>
                                <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                                    <Text style={{ ...styles.txt14bold, color: 'red' }}>Issue:</Text>
                                    <Text style={{ ...styles.txt14, color: 'red' }}>{item?.notes}</Text>

                                </View>
                                <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>

                                    <Text style={styles.txt14bold}>Product:</Text>
                                    <Text style={styles.txt14}>{item?.variant_name}</Text>

                                </View>
                                <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                                    <Text style={styles.txt14bold}>Customer Name:</Text>
                                    <Text style={styles.txt14}>{item?.order_details?.customer_details?.full_name}</Text>

                                </View>
                                <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                                    <Text style={styles.txt14bold}>Mobile Number:</Text>
                                    <Text style={styles.txt14}>{item?.order_details?.customer_details?.phone_number}</Text>

                                </View>
                                <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                                    <Text style={{ ...styles.txt14bold, alignSelf: 'flex-start' }}>Location:</Text>
                                    <View style={{width:'100%'}} >
                                        <Text style={{...styles.txt14,width:'70%'}} >{item?.order_details?.shipping_address_details?.street_address}, {item?.order_details?.shipping_address_details?.city}, {item?.order_details?.shipping_address_details?.postal_code}, {item?.order_details?.shipping_address_details?.state}</Text>
                                        {/* <TouchableOpacity activeOpacity={0.7} >
                                        <Text style={{ ...styles.txt14, color: Colors.btnColors.primary, textDecorationLine: 'underline' }}>Google Map</Text>
                                    </TouchableOpacity> */}
                                    </View>

                                </View>
                                <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                                    <Text style={styles.txt14bold}>Estimate Payment:</Text>
                                    <Text style={{ ...styles.txt14, color: 'green' }}>₹{item?.mechanic_fees}</Text>

                                </View>
                                <View style={{ ...styles.divider, marginVertical: 10 }} />
                                {
                                    item?.is_accepted ?
                                        <CommonBtn height={35} bgcolor={'#4CAF50'} title={'On Going...'} textColor={'white'} />
                                        :
                                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                                            <View style={{ width: '50%' }}>
                                                <CommonBtn height={35} bgcolor={'#EA6767'} title={'Decline'} textColor={'white'} />
                                            </View>
                                            <View style={{ width: '50%' }}>
                                                <CommonBtn height={35} bgcolor={'#4CAF50'} title={'Accept'} textColor={'white'} onpress={() => {
                                                    HandleAcceptJob(item.id)
                                                }} />
                                            </View>
                                        </View>
                                }

                                <TouchableOpacity activeOpacity={0.7} onPress={() => setExpandedIndex(null)}>
                                    <Text style={{ ...styles.txt14, textDecorationLine: 'underline', textAlign: 'center' }}>View Less</Text>

                                </TouchableOpacity>
                            </>
                            :
                            <>
                                <View style={{ ...styles.CardTextflex, justifyContent: 'space-between', alignItems: 'flex-start', }}>
                                    <View style={{ width: '60%' }}>
                                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>

                                            <Text style={styles.txt14bold}>Product:</Text>
                                            <Text style={styles.txt14}>{item?.variant_name}</Text>

                                        </View>
                                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>

                                            <Text style={styles.txt14bold}>{item?.notes}</Text>
                                            <Text style={styles.txt14}>({item?.order_details?.order_code})</Text>

                                        </View>
                                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>

                                            <View >
                                                <Text style={styles.txt14} >{item?.order_details?.shipping_address_details?.street_address}, {item?.order_details?.shipping_address_details?.city}, {item?.order_details?.shipping_address_details?.postal_code}, {item?.order_details?.shipping_address_details?.state}</Text>
                                                {/* <TouchableOpacity activeOpacity={0.7} onPress={() => getDirection(item?.order_details?.shipping_address_details?.latitude, item?.order_details?.shipping_address_details?.longitude)}>
                                                <Text style={{ ...styles.txt14, color: Colors.btnColors.primary, textDecorationLine: 'underline' }}>Google Map</Text>
                                            </TouchableOpacity> */}
                                            </View>

                                        </View>
                                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                                            <Text style={styles.txt14bold}>Estimate Payment:</Text>
                                            <Text style={{ ...styles.txt14, color: 'green' }}>₹{item?.mechanic_fees}</Text>

                                        </View>
                                    </View>
                                    <View style={{
                                        alignItems: 'flex-end',
                                        justifyContent: 'space-between',
                                        flex: 1

                                    }}>
                                        <View>
                                            <Text style={styles.txt12}>{dayjs(item?.created_at).fromNow()}</Text>
                                        </View>
                                        {
                                            item?.is_accepted ?
                                                <View style={{ marginTop: 25 }}>

                                                    <IO
                                                        name='chevron-forward-outline'
                                                        size={responsiveFontSize(4)}
                                                        color={'black'}
                                                    />
                                                </View>

                                                :
                                                <View style={{ ...styles.CardTextflex, marginTop: 15, gap: 10 }}>
                                                    <TouchableOpacity activeOpacity={0.7} >
                                                        <IO
                                                            name='close-circle-outline'
                                                            size={responsiveFontSize(4)}
                                                            color={'red'}
                                                        />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity activeOpacity={0.7} onPress={async () => {
                                                        HandleAcceptJob(item.id)
                                                    }}>
                                                        <IO
                                                            name='checkmark-circle-outline'
                                                            size={responsiveFontSize(4)}
                                                            color={'green'}
                                                        />
                                                    </TouchableOpacity>

                                                </View>
                                        }
                                    </View>

                                </View>
                                <TouchableOpacity activeOpacity={0.7} onPress={() => setExpandedIndex(index)}>
                                    <Text style={{ ...styles.txt12, textDecorationLine: 'underline', textAlign: 'center' }}>Know More Details</Text>
                                </TouchableOpacity>
                            </>
                    }
                </View>
            </TouchableOpacity>

        )
    }
    return (
        <View style={styles.container}>
            <View style={styles.subcontainer}>
                <View style={{ ...styles.header, marginTop: 10 }}>
                    <Text style={styles.txt20bold}>New Job Requests</Text>
                </View>
                <View style={styles.divider} />

                <FlatList

                    showsVerticalScrollIndicator={false}
                    data={filteredJobs}
                    keyExtractor={(item) => item.id.toString()} // Unique key for each item
                    renderItem={renderOrderItem}
                    onEndReached={loadMoreData}
                    onEndReachedThreshold={0.5} // Trigger when 50% of the list is visible
                    ListFooterComponent={loadingactivity ? <ActivityIndicator /> : null}
                    ListEmptyComponent={
                        !loadingactivity && (
                            <View style={{ marginTop: 50, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16, color: '#888', alignSelf: 'center' }}>
                                    No New Jobs has been Assigned!
                                </Text>
                            </View>
                        )
                    }
                />

            </View>
        </View>
    )
}

export default Jobs