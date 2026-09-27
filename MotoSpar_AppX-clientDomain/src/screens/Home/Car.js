import { View, Text, ImageBackground, ScrollView, StyleSheet, TextInput, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import Colors from '../../constants/Colors'
import Header from '../../components/HOC/Header'
import { styles } from '../../assets/Css/HomeCss'
import { SelectList } from 'react-native-dropdown-select-list'
import { HomeContext } from '../../context/HomeContext'
import Loading from '../../components/HOC/Loading'

import Ion from 'react-native-vector-icons/Ionicons'
import { responsiveFontSize } from 'react-native-responsive-dimensions'
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import StarRating from '../../components/Atoms/StarRating'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'


const Car = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { fetchNotifications, GetSubCategories, carSubCategory, AllProduct, setcarProducts, AddToCart, carProducts, HasNext, loadingactivity, specificProduct,
    GetCartItem, cartProduct, setCartCount, setspecificProduct } = useContext(HomeContext);
  const [search, setsearch] = useState('');
  const [offset, setoffset] = useState(1)
  const [shuffledCategories, setShuffledCategories] = useState([]);
  const data = [
    { key: '1', value: 'Mobiles', disabled: true },
    { key: '2', value: 'Appliances' },
    { key: '3', value: 'Cameras' },
    { key: '4', value: 'Computers', disabled: true },
    { key: '5', value: 'Vegetables' },
    { key: '6', value: 'Diary Products' },
    { key: '7', value: 'Drinks' },
  ]
  const limitedProduct = carProducts.slice(0, 10);
  const limitedsubCategory = carSubCategory.slice(0, 6); // Take the first 6 items


  // Function to shuffle an array
  const shuffleArray = (array) => {
    return array
      .map((item) => ({ item, sort: Math.random() })) // Attach a random sort key
      .sort((a, b) => a.sort - b.sort) // Sort by the random key
      .map(({ item }) => item); // Remove the sort key
  };

  const HandleAddCart = async (id, price, delivery_charge, driver_fees, mechanic_fees) => {

    await AddToCart(id, 1, price, delivery_charge, mechanic_fees, driver_fees);
    await GetCartItem()
    Toast.show({
      type: 'success',
      text1: 'Item Added to Cart Succesfully',
      position: 'bottom'
    });

  }

  const renderTopcategories = (item, index) => {
    return (
      <TouchableOpacity activeOpacity={0.6} key={index} onPress={() => navigation.navigate('CarProducts', { id: '20181eff-3ffe-4aeb-8e02-afb147e68e25', sub_catId: item?.id })}>
        <View style={{ marginVertical: 20, marginRight: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={item?.image ? { uri: `https://api.motospar.com/media/${item?.image}` }
            : require('../../assets/images/Logo.png')} style={styles.TopCatgImg} resizeMode="cover" />
          <Text style={styles.Label}>{item?.name}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  const renderShopcategories = (item, index) => {
    return (
      <TouchableOpacity activeOpacity={0.6} key={item?.id} onPress={() => navigation.navigate('CarProducts', { id: '20181eff-3ffe-4aeb-8e02-afb147e68e25', sub_catId: item?.id })}>
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

          <Text style={styles.Label} numberOfLines={1}>{item?.name}</Text>
          <Text style={styles.productSku} numberOfLines={1}>{`SKU#: ${item?.variants[0]?.sku}`}</Text>
          <StarRating rating={Number(item?.average_rating)} iconsize={1.5} />
          <View>
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
    setcarProducts([]); // Clear the wishlist
    setoffset(1); // Reset offset
    AllProduct(offset, '20181eff-3ffe-4aeb-8e02-afb147e68e25', 'Car');// Fetch initial data
    GetSubCategories('20181eff-3ffe-4aeb-8e02-afb147e68e25', 'Car')
    GetCartItem();
    fetchNotifications()
  }, [])

  useEffect(() => {
    // Shuffle carSubCategory when the component mounts
    setShuffledCategories(shuffleArray(carSubCategory));
  }, [carSubCategory]);

  useEffect(() => {
    const totalQuantity = Array.isArray(cartProduct) && cartProduct.length > 0
      ? cartProduct.reduce((acc, item) => acc + item.quantity, 0)
      : 0;
    setCartCount(totalQuantity);
  }, [cartProduct])

  const loadMoreData = () => {
    if (HasNext && !loadingactivity) {
      setoffset((prevOffset) => prevOffset + limit);
    }
  };
  return (
    <View style={styles.container}>
      <Header homeHeader={true} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require('../../assets/images/homeBanner.jpg')}
          style={styles.banner}
          resizeMode='cover'
        >
          <View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }} />
          <Text style={styles.txtBold}>FIND PARTS FOR YOUR CAR</Text>
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
            {search.length > 0 ? <TouchableOpacity activeOpacity={0.6} onPress={() => setsearch('')} style={styles.searchBtn}>
              <Text style={styles.txtNorm}>Search</Text>
            </TouchableOpacity> : null}
          </View>

        </ImageBackground>
        {/* <View style={{flexDirection:'row'}}>
       <View >
            <SelectList
              setSelected={(val) => setSelected(val)}
              data={data}
              save="value"
              placeholder='Select Brand'
              
              boxStyles={styles.dropdown}
            />
          </View>
          <View >
            <SelectList
              setSelected={(val) => setSelected(val)}
              data={data}
              save="value"
              placeholder='Select Brand'
              
              boxStyles={styles.dropdown}
            />
          </View>
          <View >
            <SelectList
              setSelected={(val) => setSelected(val)}
              data={data}
              save="value"
              placeholder='Select Brand'
              
              boxStyles={styles.dropdown}
            />
          </View>
       </View> */}
        <View style={styles.productContainer}>
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
          <Text style={styles.txtheading}>Shop By Category</Text>
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {shuffledCategories.map((item, index) => renderShopcategories(item, index))}
            </ScrollView>
          </View>

          <TouchableOpacity activeOpacity={0.6} style={styles.accesoriesBtn} onPress={() => navigation.navigate('CarProducts', { id: '20181eff-3ffe-4aeb-8e02-afb147e68e25' })}>
            <Text style={styles.txtheading}>Accessories</Text>
            <Ion name='chevron-forward-outline' size={responsiveFontSize(2.5)} color={Colors.textColors.primary} />
          </TouchableOpacity>
        </View>
        <View>
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
        </View>
      </ScrollView>
      {loadingactivity ? <Loading /> : null}
    </View>
  )
}

export default Car