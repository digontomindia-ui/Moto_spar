import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Platform, PermissionsAndroid, Linking } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { styles } from '../../../assets/Css/JobCss'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { HomeContext } from '../../../context/HomeContext'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
import Geolocation from 'react-native-geolocation-service';
import StarRating from '../../../components/HOC/StarRating'
import Colors from '../../../constants/Colors'
import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize } from 'react-native-responsive-dimensions'
const CompletedJob = () => {
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
        loadingactivity,
    } = useContext(HomeContext);


    useFocusEffect(
        useCallback(() => {
            setmechanic_Jobs([]); // Clear previous orders
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


    const renderStars = (rating = 0) => {
        return [...Array(5)].map((_, i) => (
            <FaStar key={i} color={i < rating ? '#ffc107' : '#e4e5e9'} size={16} />
        ));
    };
    const renderOrderItem = ({ item, index }) => {
        const isExpanded = expandedIndex === index;
        return (

            item?.job_status == 'completed' &&
            <View style={styles.card} >
                {
                    isExpanded ?
                        <>
                            <Text style={styles.txt14}>Job ID ({index + 1})</Text>
                            <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                                <Text style={{ ...styles.txt14bold, color: 'red' }}>Issue:</Text>
                                <Text style={{ ...styles.txt14, color: 'red' }}>{item?.notes}</Text>

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
                                <View >
                                    <Text style={styles.txt14} >{item?.order_details?.shipping_address_details?.street_address}, {item?.order_details?.shipping_address_details?.city}, {item?.order_details?.shipping_address_details?.postal_code}, {item?.order_details?.shipping_address_details?.state}</Text>
                                    {/* <TouchableOpacity activeOpacity={0.7} >
                                        <Text style={{ ...styles.txt14, color: Colors.btnColors.primary, textDecorationLine: 'underline' }}>Google Map</Text>
                                    </TouchableOpacity> */}
                                </View>

                            </View>
                            <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                                <Text style={styles.txt14bold}>Paid:</Text>
                                <Text style={{ ...styles.txt14, color: 'green' }}>₹{item?.mechanic_fees}</Text>

                            </View>
                            <View style={{ ...styles.divider, marginVertical: 10 }} />
                            <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start', gap: 10, }}>
                                <Text style={styles.txt14bold}>Customer rating:</Text>
                                <StarRating rating={item?.rating} iconsize={2} />

                            </View>
                            <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start', gap: 10, marginTop: 5 }}>
                                <Text style={styles.txt14bold}>Customer review:</Text>
                            </View>

                            {
                                item?.review !== '' ?
                                    <View style={{ ...styles.card, borderColor: Colors.background.secondary, width: '95%', alignSelf: 'center', marginTop: 5 }}>
                                        <Text style={{ ...styles.txt14bold, color: 'grey', margin: 5 }}>{item?.review}</Text>
                                    </View>
                                    :
                                    <View style={{ ...styles.card, borderColor: Colors.background.secondary, width: '95%', alignSelf: 'center', marginTop: 5 }}>
                                        <Text style={{ ...styles.txt14bold, color: 'grey', margin: 5 }}>No review has been upload</Text>
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
                                        <Text style={styles.txt14bold}>{item?.notes}</Text>
                                        <Text style={styles.txt14}>({index + 1})</Text>

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

                                </View>

                            </View>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => setExpandedIndex(index)}>
                                <Text style={{ ...styles.txt12, textDecorationLine: 'underline', textAlign: 'center' }}>Know More Details</Text>
                            </TouchableOpacity>
                        </>
                }
            </View >

        )
    }
    return (
        <View style={styles.container}>
            <View style={styles.subcontainer}>
                <View style={styles.CardTextflex}>
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
                        <Text style={{ ...styles.txt20bold }}>Completed Jobs</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.divider} />

                <FlatList

                    showsVerticalScrollIndicator={false}
                    data={mechanic_Jobs}
                    keyExtractor={(item) => item.id.toString()} // Unique key for each item
                    renderItem={renderOrderItem}
                    onEndReached={loadMoreData}
                    onEndReachedThreshold={0.5} // Trigger when 50% of the list is visible
                    ListFooterComponent={loadingactivity ? <ActivityIndicator /> : null}
                    ListEmptyComponent={
                        !loadingactivity && (
                            <View style={{ marginTop: 50, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16, color: '#888', alignSelf: 'center' }}>
                                    No Jobs has been Completed yet!
                                </Text>
                            </View>
                        )
                    }
                />

            </View>
        </View>
    )
}

export default CompletedJob