import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Platform, PermissionsAndroid, Linking } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { styles } from '../../../assets/Css/JobCss'
import CommonBtn from '../../../components/HOC/CommonBtn'
import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize } from 'react-native-responsive-dimensions'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { HomeContext } from '../../../context/HomeContext'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';

const OngoingJobList = () => {
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
        setSpecificAcceptedJob,
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
    const filteredJobs = mechanic_Jobs.filter(job => job?.job_status === 'in_progress');

    const renderOrderItem = ({ item, index }) => {
        const isExpanded = expandedIndex === index;
        return (

            item?.job_status === 'in_progress' &&
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

                    <>
                        <Text style={styles.txt14}>Job ID ({index + 1})</Text>
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
                            <View >
                                <Text style={styles.txt14} >{item?.order_details?.shipping_address_details?.street_address}, {item?.order_details?.shipping_address_details?.city}, {item?.order_details?.shipping_address_details?.postal_code}, {item?.order_details?.shipping_address_details?.state}</Text>
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

                        <CommonBtn height={35} bgcolor={'#4CAF50'} title={'On Going...'} textColor={'white'} />

                    </>

                </View>
            </TouchableOpacity>

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
                        <Text style={{ ...styles.txt20bold }}>OnGoing Jobs</Text>
                    </View>
                    <View style={{ width: 40 }} />
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
                                    No Jobs is in progress!
                                </Text>
                            </View>
                        )
                    }
                />

            </View>
        </View>
    )
}



export default OngoingJobList