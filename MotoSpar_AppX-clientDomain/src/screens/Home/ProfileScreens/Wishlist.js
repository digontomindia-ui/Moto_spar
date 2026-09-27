import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import Header from '../../../components/HOC/Header'
import { styles } from '../../../assets/Css/OrderCss'
import { HomeContext } from '../../../context/HomeContext'
import Loading from '../../../components/HOC/Loading'
import Ion from 'react-native-vector-icons/Ionicons'
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions'
import Colors from '../../../constants/Colors'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import CommonBtn from '../../../components/HOC/CommonBtn'

const Wishlist = () => {
    const navigation = useNavigation();
    const [search, setsearch] = useState('');
    const {
        GetProductDetail,
        GetWishlist,
        userWishlist,
        AddToCart,
        GetCartItem,
        HasNext,
        loadingactivity,
        setuserWishlist,
        cartProduct,
        ToggleWishlist
    } = useContext(HomeContext);
    const [offset, setoffset] = useState(0);

    // Reset wishlist and fetch fresh data when the screen is focused
    useFocusEffect(
        useCallback(() => {
            setuserWishlist([]); // Clear the wishlist

            GetWishlist(0); // Fetch initial data
        }, [])
    );
    const filteredProducts = userWishlist.filter((item) =>
        item?.product?.name.toLowerCase().includes(search.toLowerCase())
    );
    const loadMoreData = () => {
        if (HasNext && !loadingactivity) {
            setoffset((prevOffset) => {
                const newOffset = prevOffset + 10;
                GetWishlist(newOffset);
                return newOffset;
            });
        }
    };
    const handleToggleWIshlist = (id) => {
        ToggleWishlist(id)
        setuserWishlist([]); // Clear the wishlist
        setoffset(1); // Reset offset
        GetWishlist(0);
        Toast.show({
            type: 'success',
            text1: 'Item has been removed from Wishlist !',
            position: 'bottom'
        });
    }
    const HandleAddCart = async (id, price) => {

        await AddToCart(id, 1, price);
        await GetCartItem();

        Toast.show({
            type: 'success',
            text1: 'Item Added to Cart Succesfully',
            position: 'bottom'
        });

    }
    const ProductCard = ({ item }) => {
        const isInCart = Array.isArray(cartProduct) && cartProduct?.some(
            (cartItem) => {
                return cartItem?.variant_details?.id === item?.variant_details?.id;
            }
        );
        return (
            <View style={{ ...styles.productCard, width: '48%' }}>
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={async () => {
                        await GetProductDetail(item?.variant_details?.product);
                        navigation.navigate('ProductScreen');
                    }}
                >
                    <Image source={item?.variant_details?.images[0]?.image ? { uri: `https://api.motospar.com${item?.variant_details?.images[0]?.image}` } : require('../../../assets/images/Logo.png')} style={styles.productImage} />
                    <View style={styles.capsule}>
                        {item?.variant_details?.in_stock ? (
                            <Text style={{ fontSize: 10, color: 'black' }}>In stock</Text>
                        ) : (
                            <Text style={{ fontSize: 10, color: 'red' }}>Out of stock</Text>
                        )}
                    </View>
                    <View>
                        <Text style={styles.txtmediumbold} numberOfLines={2}>{item?.product?.name}</Text>
                        <Text style={styles.productSku} numberOfLines={1}>{`SKU#: ${item?.variant_details?.sku}`}</Text>
                        <Text style={styles.productPrice}>{item?.variant_details?.discounted_price}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 5 }}>
                            <TouchableOpacity activeOpacity={0.6} style={styles.ProductButton} onPress={() => {
                                if (isInCart) {
                                    navigation.navigate('Cart');
                                } else {
                                    HandleAddCart(item?.variant_details?.id, item?.variant_details?.discounted_price);
                                }
                            }}>
                                <Text style={styles.txtsmallbold}>{isInCart ? 'Go to Cart' : 'Add to Cart'}</Text>
                                <View style={{ width: responsiveWidth(4), height: responsiveWidth(4), borderRadius: responsiveWidth(2), backgroundColor: Colors.btnColors.primary, justifyContent: 'center', alignItems: 'center' }}>
                                    <Ion name='cart-outline' size={12} color={Colors.background} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => handleToggleWIshlist(item?.variant_details?.id)}>
                                <Ion name="heart" size={responsiveFontSize(2.5)} color='red' />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        userWishlist.length == 0 ?
            <View style={styles.container}>
                <Header screenName={'Wishlist'} backIcon={true} navigateTo={'Profile'} />
                <View style={styles.infoScreenView}>
                    <Text style={styles.txtverybigbold}>Your Wishlist is empty !</Text>
                    <View style={{ width: responsiveWidth(50), marginVertical: responsiveWidth(2) }}>
                        <CommonBtn onpress={() => navigation.navigate('Car')} title={'Add Now'} height={4} />
                    </View>
                </View>
            </View>
            :
            <View style={styles.container}>
                <Header screenName={'WishList'} backIcon={true} navigateTo={'Profile'} />
                <View style={{ flex: 1, padding: 10 }}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={search}
                            onChangeText={(text) => { setsearch(text); }}
                            placeholder="Search here"
                            placeholderTextColor="grey"
                            autoCapitalize="none"
                            keyboardType="text"
                            returnKeyType="next"
                            underlineColorAndroid="#f000"
                            blurOnSubmit={false}
                            style={{ color: "black", fontSize: 14, width: "80%", padding: 8 }}
                        />

                    </View>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={filteredProducts}
                        renderItem={({ item }) => <ProductCard item={item} />}
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={2}
                        onEndReached={loadMoreData}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={loadingactivity ? <Loading /> : null}
                    />

                </View>
            </View>

    );
};

export default Wishlist;

{/* */ }
