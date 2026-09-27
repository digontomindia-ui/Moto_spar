import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import Header from '../../../components/HOC/Header';
import { styles } from '../../../assets/Css/OrderCss';
import { HomeContext } from '../../../context/HomeContext';
import Ion from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import Colors from '../../../constants/Colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const AllOrders = () => {
    const navigation = useNavigation();
    const [search, setSearch] = useState('');
    const {
        GetOrders,
        setuserOrders,
        userOrders,
        setspecificOrder,
        HasNext,
        loadingactivity,
    } = useContext(HomeContext);
    const [offset, setOffset] = useState(0);

    // Fetch orders when screen is focused
    useFocusEffect(
        useCallback(() => {
            setuserOrders([]); // Clear previous orders
            setOffset(0); // Reset offset
            GetOrders(0); // Fetch initial data
        }, [])
    );

    // Search and filter logic
    const filterOrders = userOrders.filter((item) =>
        item?.order_items?.some((order) =>
            order?.product?.name?.toLowerCase().includes(search.toLowerCase())
        )
    );

    // Load more data for pagination
    const loadMoreData = () => {
        if (HasNext && !loadingactivity) {
            const newOffset = offset + 10; // Assuming 10 items per page
            setOffset(newOffset);
            GetOrders(newOffset);
        }
    };

    // Render each order item
    const renderOrderItem = ({ item }) => (
        <TouchableOpacity activeOpacity={0.6}
            style={styles.card}
            key={item?.id}
            onPress={() => {
                setspecificOrder(item);
                navigation.navigate('OrderDetail');
            }}
        >
            <View>
                <Text style={styles.txtmediumbold}>Order #{item.order_code}</Text>
                <FlatList
                    horizontal
                    data={item.order_items}
                    renderItem={({ item }) => (
                        <Image
                            source={
                                item?.variant_details?.images?.[0]
                                    ? {
                                        uri: `https://api.motospar.com${item.variant_details.images[0]?.image}`,
                                    }
                                    : require('../../../assets/images/Logo.png')
                            }
                            style={styles.orderImg}
                            resizeMode="contain"
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                />
                <Text style={styles.txtsmallbold}>
                    Placed on {new Date(item.created_at).toDateString()}
                </Text>
                <Text style={styles.txtsmallbold}>Total: ₹{item.total_price}</Text>
            </View>
            <Ion
                name="chevron-forward-outline"
                size={responsiveFontSize(2.5)}
                color={Colors.textColors.primary}
            />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header screenName="Orders" backIcon={true} navigateTo="Profile" />
            <View style={styles.subcontainer}>

                <View style={styles.inputContainer}>
                    <TextInput
                        value={search}
                        onChangeText={(text) => setSearch(text)}
                        placeholder="Search order"
                        placeholderTextColor="grey"
                        autoCapitalize="none"
                        keyboardType="default"
                        returnKeyType="search"
                        underlineColorAndroid="#f000"
                        blurOnSubmit={false}
                        style={{
                            color: 'black',
                            fontSize: 14,
                            width: '80%',
                            padding: 8,
                        }}
                    />
                </View>

                <View style={{ flex: 1, height: '100%', marginBottom: 100 }}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={filterOrders}
                        keyExtractor={(item) => item.id.toString()} // Unique key for each item
                        renderItem={renderOrderItem}
                        onEndReached={loadMoreData}
                        onEndReachedThreshold={0.5} // Trigger when 50% of the list is visible
                        ListFooterComponent={loadingactivity ? <ActivityIndicator /> : null}
                        ListEmptyComponent={
                            !loadingactivity && (
                                <View style={{ marginTop: 50, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 16, color: '#888' }}>
                                        No Orders Found
                                    </Text>
                                </View>
                            )
                        }
                    />
                </View>

            </View>
        </View>
    );
};

export default AllOrders;
