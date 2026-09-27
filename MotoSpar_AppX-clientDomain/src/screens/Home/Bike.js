import { View, Text, ImageBackground, ScrollView, StyleSheet, TextInput, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import Colors from '../../constants/Colors'
import Header from '../../components/HOC/Header'
import { styles } from '../../assets/Css/HomeCss'
import { SelectList } from 'react-native-dropdown-select-list'
import { HomeContext } from '../../context/HomeContext'
import Loading from '../../components/HOC/Loading'

import Ion from 'react-native-vector-icons/Ionicons'

import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import StarRating from '../../components/Atoms/StarRating'
import Toast from 'react-native-toast-message'


const Bike = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { fetchNotifications, AddToCart, GetSubCategories, bikeSubCategory, AllProduct, setbikeProducts, bikeProducts, HasNext, loadingactivity, specificProduct, setspecificProduct, GetCartItem, cartProduct, setCartCount } = useContext(HomeContext);
  const [search, setsearch] = useState('');
  const [offset, setoffset] = useState(1);
  const [shuffledCategories, setShuffledCategories] = useState([]);
  const HandleAddCart = async (id, price, delivery_charge, driver_fees, mechanic_fees) => {

    await AddToCart(id, 1, price, delivery_charge, mechanic_fees, driver_fees);
    await GetCartItem()
    Toast.show({
      type: 'success',
      text1: 'Item Added to Cart Succesfully',
      position: 'bottom'
    });

  }
  const limitedProduct = bikeProducts.slice(0, 10);
  const limitedsubCategory = bikeSubCategory.slice(0, 6); // Take the first 6 ite
  const shuffleArray = (array) => {
    return array
      .map((item) => ({ item, sort: Math.random() })) // Attach a random sort key
      .sort((a, b) => a.sort - b.sort) // Sort by the random key
      .map(({ item }) => item); // Remove the sort key
  };

  const renderTopcategories = (item, index) => {
    return (
      <TouchableOpacity activeOpacity={0.6} key={index} onPress={() => navigation.navigate('CarProducts', { id: '4d615408-98be-41d3-810c-a67a4e54af22', sub_catId: item?.id })}>
        <View style={{ marginVertical: 20, marginRight: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={item?.image ? { uri: `https://api.motospar.com/media/${item?.image}` }
            : require('../../assets/images/Logo.png')} style={styles.TopCatgImg} resizeMode="contain" />
          <Text style={styles.Label}>{item?.name}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  const rendercategories = (item, index) => {
    return (
      <TouchableOpacity activeOpacity={0.6} key={index} onPress={() => navigation.navigate('CarProducts', { id: '4d615408-98be-41d3-810c-a67a4e54af22', sub_catId: item?.id })}>
        <View style={{ marginVertical: 20, marginRight: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={item?.image ? { uri: `https://api.motospar.com/media/${item?.image}` }
            : require('../../assets/images/Logo.png')} style={styles.TopCatgImg} resizeMode="contain" />
          <Text style={styles.Label}>{item?.name}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const ProductCard = ({ item, index }) => {
    const isInCart = Array.isArray(cartProduct) && cartProduct?.some(
      (cartItem) => {
        return cartItem?.variant_details?.id === item?.variants[0]?.id;
      }
    );
    return (
      <View style={{ ...styles.productCard, marginBottom: responsiveWidth(5) }}>
        <TouchableOpacity activeOpacity={0.6} onPress={() => { setspecificProduct(item); navigation.navigate('ProductScreen') }}>
          <Image source={item?.variants[0]?.images[0] ? { uri: `https://api.motospar.com${item?.variants[0]?.images[0]?.image}` } : require('../../assets/images/Logo.png')} style={styles.productImage} />
          <View style={styles.capsule}>
            {item?.variants[0]?.in_stock ?
              <Text style={{ fontSize: 10, color: 'black' }} >In stock</Text>
              :
              <Text style={{ fontSize: 10, color: 'red' }} >Out of stock</Text>
            }
          </View>
          <View >
            <Text style={styles.Label} numberOfLines={1}>{item?.name}</Text>
            <Text style={styles.productSku} numberOfLines={1}>{`SKU#: ${item?.variants[0]?.sku}`}</Text>
            <StarRating rating={Number(item?.average_rating)} iconsize={1.5} />
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>₹{item?.variants[0].discounted_price}</Text>
              <Text style={styles.txtpricecut}>₹{item?.variants[0].price}</Text>

            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity activeOpacity={0.6} style={styles.ProductButton} onPress={() => {
                if (isInCart) {
                  navigation.navigate('Cart');
                } else {
                  HandleAddCart(item?.variants[0]?.id, item?.variants[0]?.discounted_price, item?.delivery_charge, item?.driver_fees, item?.mechanic_fees);
                }
              }}>
                <Text style={styles.addToCartText}>{isInCart ? 'Go to Cart' : 'Add to Cart'}</Text>
                <View style={{ width: responsiveWidth(4), height: responsiveWidth(4), borderRadius: responsiveWidth(2), backgroundColor: Colors.btnColors.primary, justifyContent: 'center', alignItems: 'center' }}>
                  <Ion name='cart-outline' size={12} color={Colors.background} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
  useEffect(() => {
    // Shuffle carSubCategory when the component mounts
    setShuffledCategories(shuffleArray(bikeSubCategory));
  }, [bikeSubCategory]);

  useEffect(() => {
    setbikeProducts([]); // Clear the wishlist
    setoffset(1); // Reset offset
    AllProduct(offset, '4d615408-98be-41d3-810c-a67a4e54af22', 'Bike'); // Fetch initial data
    GetSubCategories('4d615408-98be-41d3-810c-a67a4e54af22', 'Bike');
    fetchNotifications()
  }, [])

  const loadMoreData = () => {
    if (HasNext && !loadingactivity) {
      setoffset((prevOffset) => prevOffset + limit);
    }
  };
  return (
    <View style={{ backgroundColor: Colors.background, flex: 1, height: '100%' }}>
      <Header homeHeader={true} />
      <ScrollView>
        <ImageBackground
          source={require('../../assets/images/homeBanner.jpg')}
          style={styles.banner}
          resizeMode='cover'
        >
          <View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }} />
          <Text style={styles.txtBold}>FIND PARTS FOR YOUR BIKE</Text>
          <Text style={styles.txtNorm}>Over hundreds of brands and tens of thousands of parts</Text>
          <View style={{ ...styles.inputContainer, margin: 5 }}>
            <TextInput
              onFocus={() => navigation.navigate('CarProducts', { focusSearch: true })}
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
            {search.length > 0 ? <TouchableOpacity onPress={() => setsearch('')} style={styles.searchBtn}>
              <Text style={styles.txtNorm}>Search</Text>
            </TouchableOpacity> : null}
          </View>

        </ImageBackground>
        <View style={styles.productContainer}>
          {/* Top Categorie */}
          <Text style={styles.txtheading}>Top Categories</Text>
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {limitedsubCategory.map((item, index) =>
                renderTopcategories(item, index)
              )}
            </ScrollView>
          </View>
          {/* Shop By Category */}
          <Text style={styles.txtheading}>Shop By Category</Text>
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {shuffledCategories.map((item, index) => rendercategories(item, index))}
            </ScrollView>
          </View>
          {/* Accessories */}
          <TouchableOpacity activeOpacity={0.6} style={styles.accesoriesBtn} onPress={() => navigation.navigate('CarProducts', { id: '4d615408-98be-41d3-810c-a67a4e54af22' })}>
            <Text style={styles.txtheading}>Accessories</Text>
            <Ion name='chevron-forward-outline' size={responsiveFontSize(2.5)} color={Colors.textColors.primary} />
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={limitedProduct}
          renderItem={({ item, index }) => <ProductCard item={item} index={index} />}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{
            paddingHorizontal: 10, // Padding for left and right of the FlatList
          }}
          showsHorizontalScrollIndicator={false}
        />
      </ScrollView>
      {loadingactivity ? <Loading /> : null}
    </View>
  )
}



export default Bike