import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Header from '../../components/HOC/Header'
import { styles } from '../../assets/Css/ProductScreenCss'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import Ion from 'react-native-vector-icons/Ionicons'
import Fa from 'react-native-vector-icons/FontAwesome5'
import Colors from '../../constants/Colors'
import { useNavigation } from '@react-navigation/native'
import { HomeContext } from '../../context/HomeContext'
import StarRating from '../../components/Atoms/StarRating'
import Toast from 'react-native-toast-message'
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions'


const SCREEN_WIDTH = Dimensions.get('window').width;
const SpecificProductScreen = ({ route }) => {
  const navigation = useNavigation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [variantIndex, setvariantIndex] = useState(0);
  const [wishlist, setWishlist] = useState({});

  const [offset, setoffset] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [Ismechnaic_fees, setIsmechnaic_fees] = useState(false);
  const [Isdriver_fees, setIsdriver_fees] = useState(false)

  const { GetReviews,
    ProductSuggestions,
    userReviews,
    setuserReviews,
    ToggleWishlist,
    specificProduct,
    GetCartItem,
    cartProduct,
    specificWishlist,
    AddToCart,
    AllProduct,
    setCartCount,
    setspecificProduct,
    EditCart,
    Products,
    message } = useContext(HomeContext);

  const toggleDropdown = () => {
    setIsExpanded(!isExpanded);
  };
  const togglewishlist = () => {
    setwishlistBtn(!wishlistBtn);
  };

  const isInCart = Array.isArray(cartProduct) && cartProduct?.some(
    (cartItem) => {
      return cartItem?.variant_details?.id === specificProduct?.variants[variantIndex]?.id;
    }
  );
  const [wishlistBtn, setwishlistBtn] = useState(specificProduct ? specificProduct?.variants[variantIndex]?.wishlist : false)
  const limitedProduct = ProductSuggestions.slice(0, 10);
  useEffect(() => {
    AllProduct(0, specificProduct?.category?.id, '', specificProduct?.sub_category?.id);

  }, []);
  useEffect(() => {
    setuserReviews([]);
    GetReviews(specificProduct?.id, offset)
  }, [offset])

  // for handling the state of is mechnaic and is driver
  useEffect(() => {
    if (Array.isArray(cartProduct)) {
      const hasMechanicFees = cartProduct.some((cartItem) => {
        return cartItem?.variant_details?.id === specificProduct?.variants[variantIndex]?.id;
      });

      if (hasMechanicFees) {
        const cartItem = cartProduct.find((item) =>
          item?.variant_details?.id === specificProduct?.variants[variantIndex]?.id
        );

        if (cartItem) {
          setIsmechnaic_fees(cartItem?.mechanic_fees > 0 ? true : false);
          setIsdriver_fees(cartItem?.driver_fees > 0 ? true : false)
        }
      }
    }
  }, [cartProduct, specificProduct, variantIndex]);

  // handling to add cart in item
  const HandleAddCart = async () => {

    await AddToCart(specificProduct?.variants[variantIndex]?.id, 1, specificProduct?.variants[variantIndex].discounted_price, specificProduct?.delivery_charge, specificProduct?.mechanic_fees, specificProduct?.driver_fees);
    await GetCartItem()
    Toast.show({
      type: 'success',
      text1: 'Item Added to Cart Succesfully',
      position: 'bottom'
    });

  }
  // handling buy now 
  const HandleBuynow = async () => {
    // Calculate total mechanic and driver fees if applicable
    const mechanicFees = Ismechnaic_fees ? Number(specificProduct?.mechanic_fees) || 0 : 0;
    const driverFees = Isdriver_fees ? Number(specificProduct?.driver_fees) || 0 : 0;

    // Prepare data to pass to CartAddress screen
    const dataToPass = {
      buynow: true,
      item: specificProduct,
      itemVariant: specificProduct?.variants[variantIndex],
      mechanicFeesSelected: Ismechnaic_fees,
      driverFeesSelected: Isdriver_fees,
      totalMechanicFees: mechanicFees,
      totalDriverFees: driverFees,
      delivery_charge: specificProduct?.delivery_charge,
      totalPrice:
        (Number(specificProduct?.variants[variantIndex]?.discounted_price) || 0) +
        mechanicFees +
        (Number(specificProduct?.delivery_charge) || 0) +
        driverFees,
    };

    // Navigate to CartAddress with the prepared data
    navigation.navigate('CartAddress', dataToPass);
  };
  // adding and removing of the wishlist product
  const handleToggleWIshlist = async (id) => {
    await ToggleWishlist(id)
    setWishlist((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle state for the specific variant
    }));
    togglewishlist()
    Toast.show({
      type: 'success',
      text1: wishlistBtn === true ? "Item has been removed from Wishlist !" : 'Item added to wishlist !',
      position: 'bottom'
    });
  }

  // scrolling behaviour for product image
  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveSlide(index);
  };
  // rendring product image
  const renderImage = ({ item }) => (
    <View style={styles.carouselImageContainer}>
      <Image
        source={item?.image
          ? { uri: `https://api.motospar.com${item.image}` }
          : require('../../assets/images/image.png')}
        style={styles.specificproductImage}
        resizeMode="contain"
      />
    </View>
  );
  useEffect(() => {
    // Sum up the quantity of all items in the cart
    const totalQuantity = Array.isArray(cartProduct) && cartProduct.length > 0
      ? cartProduct.reduce((acc, item) => acc + item.quantity, 0)
      : 0;
    setCartCount(totalQuantity);
  }, [HandleAddCart]);

  // for adding and removing the installtion by user
  const handleMechanic = async () => {
    if (isInCart) {
      const matchedCartItem = Array.isArray(cartProduct)
        ? cartProduct.find(cartItem => cartItem?.variant_details?.id === specificProduct?.variants[variantIndex]?.id)
        : null;

      const cartItemId = matchedCartItem ? matchedCartItem.id : null;

      if (cartItemId) {
        const newMechanicFee = Ismechnaic_fees ? 0 : specificProduct?.mechanic_fees;

        try {
          await EditCart(undefined, undefined, cartItemId, newMechanicFee, undefined);
          await GetCartItem();
          setIsmechnaic_fees(!Ismechnaic_fees);

          // Display success toast
          Toast.show({
            type: 'success',
            text1: Ismechnaic_fees
              ? 'Installation Removed Successfully!'
              : 'Installation Added Successfully!',
            position: 'bottom',
          });
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: error,
            position: 'bottom',
          });
        }
      }
    }
    else {
      setIsmechnaic_fees(!Ismechnaic_fees);
    }
  };

  // for adding and removing the driver by user
  const handleDriver = async () => {
    if (isInCart) {
      const matchedCartItem = Array.isArray(cartProduct)
        ? cartProduct.find(cartItem => cartItem?.variant_details?.id === specificProduct?.variants[variantIndex]?.id)
        : null;

      const cartItemId = matchedCartItem ? matchedCartItem.id : null;

      if (cartItemId) {
        const newDriverFee = Isdriver_fees ? 0 : specificProduct?.driver_fees;

        try {
          await EditCart(undefined, undefined, cartItemId, undefined, newDriverFee);
          await GetCartItem();
          setIsdriver_fees(!Isdriver_fees)

          // Display success toast
          Toast.show({
            type: 'success',
            text1: Isdriver_fees
              ? 'Driver Fee Removed Successfully!'
              : 'Driver Fee Added Successfully!',
            position: 'bottom',
          });
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: error,
            position: 'bottom',
          });
        }
      }

    }
    else {
      setIsdriver_fees(!Isdriver_fees)
    }
  };

  return (
    <View style={styles.container}>
      <Header homeHeader={true} screenName={'MotoSpar'} backIcon={true} />
      <ScrollView style={{ margin: 15 }} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Text style={styles.txtnormalbold}>{specificWishlist ? specificWishlist?.product?.name : specificProduct?.name}</Text>
          <StarRating rating={Number(specificProduct?.average_rating)} iconsize={1.5} israting={true} />
        </View>
        <Text style={styles.txtsmall}>{specificProduct?.description}</Text>
        <View style={styles.imgContainer}>
          {
            specificProduct?.variants[variantIndex]?.images?.length > 0 ? (
              <>
                <FlatList
                  data={specificProduct?.variants[variantIndex]?.images}
                  renderItem={renderImage}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  keyExtractor={(item, index) => index.toString()}
                />
                <View style={styles.pagination}>
                  {specificProduct?.variants[variantIndex]?.images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        activeSlide === index ? styles.activeDot : styles.inactiveDot,
                      ]}
                    />
                  ))}
                </View>
              </>

            ) : (
              <Image
                source={require('../../assets/images/Logo.png')}
                style={styles.specificproductImage}
                resizeMode="contain"
              />
            )
          }


        </View>
        {specificProduct?.variants[variantIndex].discount ?
          <View style={styles.priceWishlistContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.txtverybigbold}>₹{specificProduct?.variants[variantIndex].discounted_price}</Text>
              <Text style={styles.txtpricecut}>₹{specificProduct?.variants[variantIndex].price}</Text>
              <Text style={styles.discount}>-{Number(specificProduct?.variants[variantIndex].discount)}%</Text>
            </View>
            <TouchableOpacity activeOpacity={0.6} style={styles.icon} onPress={() => { handleToggleWIshlist(specificProduct?.variants[variantIndex]?.id) }} >
              {wishlistBtn === true ? <Ion
                name="heart"
                size={30}
                color='red'
              /> : <Ion
                name="heart-outline"
                size={30}
                color={Colors.textColors.primary}
              />}
            </TouchableOpacity>
          </View>
          : <View style={styles.priceWishlistContainer}>
            <Text style={styles.txtverybigbold}>₹{specificProduct?.variants[variantIndex].price}</Text>
            <TouchableOpacity activeOpacity={0.6} style={styles.icon} onPress={() => { handleToggleWIshlist(specificProduct?.variants[variantIndex]?.id) }} >
              {wishlistBtn === true ? <Ion
                name="heart"
                size={30}
                color='red'
              /> : <Ion
                name="heart-outline"
                size={30}
                color={Colors.textColors.primary}
              />}
            </TouchableOpacity>
          </View>
        }

        <Text style={{ ...styles.txtmedium, color: Colors?.headerColors?.primary, }}>Choose Size</Text>
        <View style={styles.sizeContainer}>
          {specificProduct?.variants?.map((item, index) => (
            <TouchableOpacity
              activeOpacity={0.6}
              key={item?.id} // Key should be unique for list items
              style={[
                styles.sizebtn,
                variantIndex === index && styles.selectedSizeBtn // Add border style if selected
              ]}
              onPress={() => setvariantIndex(index)} // Update the selected variant index
            >
              <Text style={styles?.txtmedium}>{item?.size}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.divider}></View>

        <View style={styles.top}>
          <TouchableOpacity activeOpacity={0.6} style={styles.cartbtn} onPress={() => {
            if (isInCart) {
              navigation.navigate('Cart'); // Navigate to the cart
            } else {
              HandleAddCart();
            }
          }}>
            <Text style={styles.btntxt}>{isInCart ? 'Go to Cart' : 'Add to Cart'}</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} style={styles.buybtn} onPress={() => HandleBuynow()}>
            <Text style={styles.btntxt} >Buy Now</Text>
          </TouchableOpacity>
        </View>

        {specificProduct?.mechanic_fees == 0 || null ?
          null
          :
          <View style={{ ...styles.top, margin: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Image source={require('../../assets/images/mechanic.png')}
                style={{
                  width: responsiveWidth(6),
                  height: responsiveWidth(6),
                  margin: responsiveWidth(2)
                }} />
              <View>
                <Text style={styles.txtsmallbold}>Added Mechanic for installation{'\n'}₹{specificProduct?.mechanic_fees || 0}</Text>
                <Text style={styles.txtverysmall}>(A Mechanic will come to your {'\n'}doorstep for installation of the product)</Text>
              </View>
            </View>
            {/* <TouchableOpacity
              style={[styles.checkbox, Ismechnaic_fees && styles.checked]}
              onPress={() => handleMechanic()}
            >
              {Ismechnaic_fees && <Text style={styles.tick}>✔</Text>}
            </TouchableOpacity> */}
          </View>
        }
        {
          specificProduct?.driver_fees == 0 || null ?
            null
            :
            <View style={{ ...styles.top, margin: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10, }}>
                <Image source={require('../../assets/images/person.png')}
                  style={{
                    width: responsiveWidth(6),
                    height: responsiveWidth(6),
                    margin: responsiveWidth(2)
                  }} />
                <View>
                  <Text style={styles.txtsmallbold}>Added vehicle pickup service{'\n'}₹{specificProduct?.driver_fees || 0}</Text>
                  <Text style={styles.txtverysmall} >(A driver will come to your {'\n'}doorstep and pickup the vehicle to the workshop)</Text>
                </View>
              </View>
              {/* <TouchableOpacity
                style={[styles.checkbox, Isdriver_fees && styles.checked]}
                onPress={() => handleDriver()}
              >
                {Isdriver_fees && <Text style={styles.tick}>✔</Text>}
              </TouchableOpacity> */}
            </View>
        }
        <View style={styles.deliveryContainer}>
          <Image source={require('../../assets/images/delivery.png')}
            style={{
              width: 24,
              height: 24,
              resizeMode: 'contain'
            }} />
          <Text style={styles.txtsmallbold}>Delivery Charge : ₹{specificProduct?.delivery_charge || 0}</Text>

        </View >

        <View style={styles.divider} />

        <View style={{ marginVertical: 5 }}>
          <TouchableOpacity activeOpacity={0.6} style={styles.detail} onPress={toggleDropdown}>
            <Text style={styles.detailheaderText}>Product Details</Text>
            <Ion
              name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={24}
              color="black"
            />
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.content}>
              {specificProduct?.brand &&
                <View style={styles.detail}>
                  <View style={styles.detailLeft}>
                    <Text style={styles.txtsmallbold}>Brand</Text>
                  </View>
                  <Text style={styles.txtsmall}>{specificProduct?.brand}</Text>
                </View>}
              {specificProduct?.model &&
                <View style={styles.detail}>
                  <View style={styles.detailLeft}>
                    <Text style={styles.txtsmallbold}>Model</Text>
                  </View>

                  <Text style={styles.txtsmall}>{specificProduct?.model}</Text>
                </View>
              }

              {specificProduct?.variants[variantIndex]?.dimensions &&
                <View style={styles.detail}>
                  <View style={styles.detailLeft}>
                    <Text style={styles.txtsmallbold}>Dimension</Text>
                  </View>
                  <Text style={styles.txtsmall}>{specificProduct?.variants[variantIndex]?.dimensions}</Text>
                </View>
              }
              {specificProduct?.variants[variantIndex]?.weight &&
                <View style={styles.detail}>
                  <View style={styles.detailLeft}>
                    <Text style={styles.txtsmallbold}>Weight</Text>
                  </View>
                  <Text style={styles.txtsmall}>{specificProduct?.variants[variantIndex]?.weight}</Text>
                </View>
              }
              {specificProduct?.variants[variantIndex]?.material &&
                <View style={styles.detail}>
                  <View style={styles.detailLeft}>
                    <Text style={styles.txtsmallbold}>Material</Text>
                  </View>
                  <Text style={styles.txtsmall}>{specificProduct?.variants[variantIndex]?.material}</Text>
                </View>
              }
            </View>

          )}
          <View style={{ marginVertical: 5 }}>
            <Text style={styles.detailheaderText}>Specifications:</Text>
            <Text style={styles.txtsmall}>• Color : {specificProduct?.variants[variantIndex]?.color}</Text>
            <Text style={styles.txtsmall}>• Features :{specificProduct?.variants[variantIndex]?.features} </Text>
          </View>
        </View>

        {/* related products */}
        <View style={{ marginVertical: 5, gap: 5 }}>
          <Text style={styles.detailheaderText}>You Might also like</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={limitedProduct}
            renderItem={({ item, index }) => (
              <View style={styles.productCard}>
                <TouchableOpacity activeOpacity={0.6} onPress={() => { setspecificProduct(item); navigation.navigate('ProductScreen') }}>
                  <View style={styles.imageframe}>
                    <Image source={item?.variants[0]?.images[0] ? { uri: `https://api.motospar.com${item?.variants[0]?.images[0]?.image}` } : require('../../assets/images/Logo.png')} style={{ width: responsiveWidth(30), height: responsiveWidth(25) }}
                      resizeMode='contain'
                    />
                  </View>
                  <Text style={{ ...styles.txtsmallbold, width: 120 }} numberOfLines={1}>{item?.name}</Text>
                  <StarRating rating={Number(item?.average_rating)} iconsize={1.5} />
                  <View style={styles.priceContainer}>
                    <Text style={styles.detailheaderText}>₹{item?.variants[variantIndex]?.discounted_price}</Text>
                    <Text style={styles.txtpricecut} dec>₹{item?.variants[variantIndex]?.price}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}

            contentContainerStyle={styles.listContainer}
          />
        </View>


        <View style={{ marginVertical: 5 }}>
          <Text style={styles.detailheaderText}>Ratings & Review</Text>
          {
            userReviews.length > 0 ?
              userReviews.map((item, index) => (
                <View style={styles.RatingCard} key={index}>
                  <Text style={styles.txtnormalbold}>{item?.user_full_name}</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        activeOpacity={0.6}
                        key={star}
                      >
                        <Text
                          style={[
                            styles.star,
                            { color: star <= item?.rating ? "#FFD700" : "#C0C0C0" }, // Change color based on rating
                          ]}
                        >
                          ★
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.txtsmallbold}>{item?.title}</Text>
                  <Text style={styles.txtsmall}>{item?.body}</Text>
                  {item?.images.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginTop: 10 }}

                    >
                      {item?.images.map((image, index) => (

                        <Image
                          key={index}
                          source={{ uri: image?.image }}
                          style={styles.reviewImg}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  )}
                </View>

              ))
              :
              <Text style={styles.txtnormalbold}>No Rating has been added</Text>
          }
        </View>

      </ScrollView>
    </View>
  )
}

export default SpecificProductScreen