import { View, Text, TouchableOpacity, Animated, useWindowDimensions, FlatList } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { styles } from '../../assets/Css/Notification_SupportCss'
import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/Colors';
import { HomeContext } from '../../context/HomeContext';
import { ScrollView } from 'react-native-gesture-handler';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';



const Notification = () => {
    const { width: screenWidth } = useWindowDimensions();
    const navigation = useNavigation()
    const { fetchNotifications, NotificationRead, notifications, notificationLoading } = useContext(HomeContext)
    const [activeTab, setActiveTab] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const tabs = ["All", "Jobs", "Payments"];

    dayjs.extend(relativeTime);

    const getShortTime = (date) => {
        const minutes = dayjs().diff(date, 'minute');
        const hours = dayjs().diff(date, 'hour');
        const days = dayjs().diff(date, 'day');

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    useEffect(() => {
        fetchNotifications()
    }, []);

    useEffect(() => {
        setTimeout(() => {
            NotificationRead()

        }, 1000);

    }, [notifications]);
    const handleTabPress = (index) => {
        setActiveTab(index);
        Animated.spring(translateX, {
            toValue: index * screenWidth / 3.3, // Adjust width based on tab size
            useNativeDriver: false,
        }).start();
    };


    const filteredJobs = notifications.filter(item => item?.notification_type === "MECHANIC_JOB");
    const filteredPayments = notifications.filter(item => item?.notification_type === "PAYMENT");
    const All = () => {

        return (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 500 }}>
                <View >

                    {/* Job Section */}
                    <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start', gap: 10, marginBottom: 20 }}>
                        <Text style={styles.txt18bold}>Job Updates</Text>
                        <View style={{ ...styles.miniCard, backgroundColor: Colors.btnColors.primary, borderWidth: 0 }} />
                    </View>

                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((item) => (
                            <View key={item.id}>
                                <View style={styles.CardTextflex}>
                                    <View style={{ width: '80%' }}>

                                        <Text style={styles.txt14}>{item?.message}</Text>

                                    </View>
                                    <Text style={{ ...styles.txt10, alignSelf: 'flex-start' }}>{getShortTime(item?.created_at)}</Text>
                                </View>
                                <View style={{ ...styles.divider, marginVertical: 8 }} />
                            </View>
                        ))
                    ) : !notificationLoading && (
                        <Text style={{ fontSize: 16, color: '#888', alignSelf: 'center', marginTop: 20 }}>
                            No New Jobs has been Assigned!
                        </Text>
                    )}

                    {/* Payment Section */}
                    <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start', gap: 10, marginBottom: 20, marginTop: 30 }}>
                        <Text style={styles.txt18bold}>Payment Received</Text>
                        <View style={{ ...styles.miniCard, backgroundColor: Colors.btnColors.success, borderWidth: 0 }} />
                    </View>

                    {filteredPayments.length > 0 ? (
                        filteredPayments.map((item) => (
                            <View key={item.id}>
                                <View style={styles.CardTextflex}>
                                    <View style={{ width: '80%' }}>
                                        <Text style={styles.txt14}>{item?.message || "0"} </Text>

                                        {/* <TouchableOpacity activeOpacity={0.7} >
                                            <Text style={{ ...styles.txt14, color: Colors.btnColors.success, textDecorationLine: 'underline' }}>
                                                Check Status
                                            </Text>
                                        </TouchableOpacity> */}
                                    </View>
                                    <Text style={{ ...styles.txt10, alignSelf: 'flex-start' }}>{getShortTime(item?.created_at)}</Text>
                                </View>
                                <View style={{ ...styles.divider, marginVertical: 8 }} />
                            </View>
                        ))
                    ) : !notificationLoading && (
                        <Text style={{ fontSize: 16, color: '#888', alignSelf: 'center', marginTop: 20 }}>
                            No Payments Received Yet!
                        </Text>
                    )}

                </View>
            </ScrollView>
        );
    };

    const Jobs = () => {
        return (
            <FlatList

                showsVerticalScrollIndicator={false}
                data={filteredJobs}
                keyExtractor={(item) => item.id.toString()} // Unique key for each item
                renderItem={({ item }) => (
                    <>
                        <View style={styles.CardTextflex}>
                            <View style={{ width: '80%' }}>

                                <Text style={styles.txt14}>{item?.message}</Text>

                            </View>
                            <Text style={{ ...styles.txt10, alignSelf: 'flex-start' }}>{getShortTime(item?.created_at)}</Text>
                        </View>
                        <View style={{ ...styles.divider, marginVertical: 8 }} />
                    </>
                )}

                ListEmptyComponent={
                    !notificationLoading && (
                        <View style={{ marginTop: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, color: '#888', alignSelf: 'center' }}>
                                No Jobs Updates!
                            </Text>
                        </View>
                    )
                }
            />

        )
    }
    const Payments = () => {
        return (
            <FlatList

                showsVerticalScrollIndicator={false}
                data={filteredPayments}
                keyExtractor={(item) => item.id.toString()} // Unique key for each item
                renderItem={({ item }) => (
                    <>
                        <View style={styles.CardTextflex}>
                            <View style={{ width: '80%' }}>

                                <Text style={styles.txt14}>{item?.message}</Text>

                            </View>
                            <Text style={{ ...styles.txt10, alignSelf: 'flex-start' }}>{getShortTime(item?.created_at)}</Text>
                        </View>
                        <View style={{ ...styles.divider, marginVertical: 8 }} />
                    </>
                )}

                ListEmptyComponent={
                    !notificationLoading && (
                        <View style={{ marginTop: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, color: '#888', alignSelf: 'center' }}>
                                No Payments Received Yet!
                            </Text>
                        </View>
                    )
                }
            />
        )
    }
    return (
        <View style={styles.container}>
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
                        <Text style={{ ...styles.txt20bold }}>Notifications</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.divider} />
                <View style={styles.tabContainer}>
                    {tabs.map((tab, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleTabPress(index)}
                            style={styles.tab}
                        >
                            <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.indicatorWrapper}>
                    <Animated.View
                        style={[
                            styles.indicator,
                            {
                                transform: [{ translateX }],
                            },
                        ]}
                    />
                </View>
                <View style={styles.subcontainer}>
                    {
                        tabs[activeTab] === "All" ?
                            <All />
                            :
                            tabs[activeTab] === "Jobs" ?
                                <Jobs />
                                :
                                <Payments />
                    }
                </View>
            </View>
        </View>
    )
}

export default Notification