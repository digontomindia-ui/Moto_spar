import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { postAuth } from '../../repository/Repo';
import Colors from '../../constants/Colors';
import Header from '../../components/HOC/Header';
import { Fonts, FontWeight } from '../../constants/Fonts';
import { HomeContext } from '../../context/HomeContext';
import { responsiveWidth } from 'react-native-responsive-dimensions';

const NotificationsScreen = ({ navigation }) => {
    const { fetchNotifications, NotificationRead, notifications, notificationLoading } = useContext(HomeContext)
    useEffect(() => {
        fetchNotifications()
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            NotificationRead()

        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [notifications]);

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        // Options for formatting date and time
        const options = {
            weekday: 'short', // e.g., "Fri"
            year: 'numeric',  // e.g., "2024"
            month: 'short',   // e.g., "Dec"
            day: 'numeric',   // e.g., "13"
            hour: '2-digit',  // e.g., "03" or "15"
            minute: '2-digit',// e.g., "26"
            hour12: true,     // To use 12-hour clock (use false for 24-hour clock)
        };
        return date.toLocaleString('en-US', options);
    };
    return (
        <>
            <Header screenName={'Notification'} backIcon={true} navigateTo={'Car'} />
            <View style={styles.container}>
                {notifications.length === 0 && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.cardHeader}>No Notifications yet!</Text>
                </View>}
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View
                            style={[

                                item?.status == 'UNREAD' ?
                                    styles.highlightedNotification :
                                    styles.notification

                            ]}
                        >
                            <Text style={styles.cardHeader}>{item?.notification_type == 'ORDER' ? 'Order Updates:' : "Payment Updates"}</Text>
                            <Text style={styles.title}>{item.message}</Text>
                            <View style={styles.timealignment}>
                                <Text style={styles.timestamp}>{formatDateTime(item.last_modified_at)}</Text>
                                {item?.status == 'UNREAD' ? <View style={styles.notificationblink} /> : null}
                            </View>
                        </View>
                    )}
                />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    notification: {
        padding: 12,
        marginBottom: 8,
        backgroundColor: Colors.background,
        borderWidth: responsiveWidth(0.1),
        borderRadius: 6,
    },
    highlightedNotification: {
        padding: 12,
        marginBottom: 8,
        borderRadius: 6,
        backgroundColor: Colors.textInputColors.secondary,
    },
    title: {
        fontSize: 14,
        color: '#333',
    },
    timestamp: {
        fontSize: 12,
        color: '#777',
        marginTop: 4,
    },
    cardHeader: {
        fontSize: Fonts.font16,
        fontWeight: FontWeight.bold,
        color: Colors.textColors.primary
    },
    timealignment: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    notificationblink: {
        width: responsiveWidth(3),
        height: responsiveWidth(3),
        backgroundColor: Colors.btnColors.primary,
        borderRadius: responsiveWidth(1.5)
    }
});

export default NotificationsScreen;
