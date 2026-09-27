import { View, Text, FlatList, TouchableOpacity, Image, TextInput, Modal, TouchableHighlight } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from '../../../assets/Css/HomeCss';
import Header from '../../../components/HOC/Header';
import { HomeContext } from '../../../context/HomeContext';
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions';
import Colors from '../../../constants/Colors';
import Ion from 'react-native-vector-icons/Ionicons'
import Loading from '../../../components/HOC/Loading';
import { SERVER_URL } from '../../../constants/SERVER_URL';
import FilterModal from '../../../components/Atoms/FilterModal';
import StarRating from '../../../components/Atoms/StarRating';
import Toast from 'react-native-toast-message';
import CommonBtn from '../../../components/HOC/CommonBtn';
const Accessories = ({ route }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [Incart, setIncart] = useState(false);
  const [brandModal, setbrandModal] = useState(false);
  const [modelModal, setmodelModal] = useState(false);
  const [yearModal, setyearModal] = useState(false);
  const [brand, setbrand] = useState('');
  const [model, setmodel] = useState('');
  const [year, setyear] = useState(Number);
  const searchInputRef = useRef(null); // Create a ref for the search bar
  const { params } = useRoute();

  useEffect(() => {
    // Focus the search bar if the focusSearch parameter is true
    if (params?.focusSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [params]);

  const id = route.params.id
  const sub_catId = route.params.sub_catId
  const navigation = useNavigation();
  const { AllProduct, carProducts,
    Products,
    HasNext,
    AddToCart,
    GetCartItem,
    ProductSuggestions,
    loadingactivity,
    cartProduct,
    setspecificProduct } = useContext(HomeContext);
  const [search, setsearch] = useState('');


  const filteredProducts = (sub_catId ? ProductSuggestions : Products).filter((item) => {
    if (search && !item?.name.toLowerCase().includes(search.toLowerCase())) return false;

    switch (selectedFilter) {
      case 'highRating':
        return true; // Sorting is handled separately
      case 'low Rating':
        return true; // Sorting is handled separately
      case 'alphabetical':
        return true; // Sorting is handled separately
      case 'inStock':
        return item?.variants.some((variant) => variant.in_stock);
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (selectedFilter) {
      case 'highRating':
        return b.average_rating - a.average_rating;
      case 'low Rating':
        return a.average_rating - b.average_rating;
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });


  useEffect(() => {
    AllProduct(0, id, '', sub_catId ? sub_catId : "");
  }, []);
  const HandleAddCart = async (id, price) => {

    await AddToCart(id, 1, price);
    await GetCartItem();

    Toast.show({
      type: 'success',
      text1: 'Item Added to Cart Succesfully',
      position: 'bottom'
    });

  }
  // Clearing filter
  const clear = async () => {
    await AllProduct(0, id, '', sub_catId ? sub_catId : "");
    setbrand('');
    setmodel('');
    setyear('')
    setbrandModal(false);
    setmodelModal(false)
    setyearModal(false)
  }
  //Brnad Filter
  const BrandHandle = () => {
    AllProduct(0, id, '', sub_catId ? sub_catId : "", brand ? brand : null, model ? model : '', year ? year : null,);
    setbrandModal(false)
    setmodelModal(false)
    setyearModal(false)
  }

  const ProductCard = ({ item, index }) => {
    const isInCart = Array.isArray(cartProduct) && cartProduct?.some(
      (cartItem) => {
        return cartItem?.variant_details?.id === item?.variants[0]?.id;
      }
    );
    return (
      <View style={{ ...styles.productCard, width: '48.5%' }}>
        <TouchableOpacity onPress={() => { setspecificProduct(item); navigation.navigate('ProductScreen') }}>
          <Image source={item?.variants[0]?.images[0] ? { uri: `https://api.motospar.com${item?.variants[0]?.images[0]?.image}` } : require('../../../assets/images/Logo.png')} style={styles.productImage} />
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
            <StarRating rating={Number(item?.average_rating)} iconsize={1.5} israting={true} />
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>₹{item?.variants[0].discounted_price}</Text>
              <Text style={styles.txtpricecut}>₹{item?.variants[0].price}</Text>
              <Text style={styles.discount}>-{Number(item?.variants[0].discount)}%</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity activeOpacity={0.6} style={styles.ProductButton} onPress={() => {
                if (isInCart) {
                  navigation.navigate('Cart');
                } else {
                  HandleAddCart(item?.variants[0]?.id, item?.variants[0]?.discounted_price);
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
  return (
    <View style={styles.container}>
      <Header screenName={'Accesories'} homeHeader={true} backIcon={true} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveWidth(4), marginHorizontal: 10, gap: 10 }}>
        <TouchableOpacity activeOpacity={0.6} style={{ ...styles.dropdown, backgroundColor: brand ? Colors.btnColors.primary : 'white' }} onPress={() => setbrandModal(true)}>
          <Text style={{ ...styles.txt12, fontWeight: '600', color: brand ? 'white' : Colors.textColors.primary }}>{brand ? brand : 'Brand'}</Text>
          <Ion name='chevron-down' size={12} color={brand ? 'white' : Colors.textColors.primary} />
        </TouchableOpacity >
        <TouchableOpacity activeOpacity={0.6} style={{ ...styles.dropdown, backgroundColor: model ? Colors.btnColors.primary : 'white' }} onPress={() => setmodelModal(true)}>
          <Text style={{ ...styles.txt12, fontWeight: '600', color: model ? 'white' : Colors.textColors.primary }}>{model ? model : 'Model'}</Text>
          <Ion name='chevron-down' size={12} color={model ? 'white' : Colors.textColors.primary} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.6} style={{ ...styles.dropdown, backgroundColor: year ? Colors.btnColors.primary : 'white' }} onPress={() => setyearModal(true)}>
          <Text style={{ ...styles.txt12, fontWeight: '600', color: year ? 'white' : Colors.textColors.primary }}>{year ? year : 'Year'}</Text>
          <Ion name='chevron-down' size={12} color={year ? 'white' : Colors.textColors.primary} />
        </TouchableOpacity>
      </View>
      <View style={{ padding: 10, flex: 1 }}>
        {
          filteredProducts <= 0 ?
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.txtheading}>No product found!</Text>
            </View> :
            <View style={{ ...styles.topBar, backgroundColor: Colors.background }}>
              <View style={{ ...styles.inputContainer, height: '70%', width: '80%', borderColor: Colors.textColors.primary, borderWidth: 0.5 }}>
                <TextInput
                  ref={searchInputRef}
                  value={search}
                  onChangeText={(text) => { setsearch(text); }}
                  placeholder="Searching..."
                  placeholderTextColor="grey"
                  autoCapitalize="none"
                  keyboardType="text"
                  returnKeyType="next"
                  underlineColorAndroid="#f000"
                  blurOnSubmit={false}
                  style={{ color: "black", fontSize: 14, width: "100%", padding: 8 }}
                />
              </View>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setIsModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                {
                  selectedFilter ?
                    <>
                      <Text style={{ ...styles.txt14bold, color: Colors.btnColors.primary }}>{'Filter'}</Text>
                      <Ion name='filter' size={responsiveFontSize(2)} color={Colors.btnColors.primary} />
                    </>
                    :
                    <>
                      <Text style={styles.txt14bold}>{'Filter'}</Text>
                      <Ion name='filter-outline' size={responsiveFontSize(2)} color={Colors.textColors.primary} />
                    </>
                }
              </TouchableOpacity>

            </View>
        }
        {
          filteredProducts === 0 ?
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.cardHeader}>No product found!</Text>
            </View>
            :
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredProducts}
              renderItem={(item, index) => ProductCard(item, index)}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2} // Set number of columns to 3
              contentContainerStyle={styles.listContainer}
            />
        }
        <FilterModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSelectFilter={setSelectedFilter}
        />
        {/* brandd Modal */}
        <Modal

          transparent={true}
          visible={brandModal}
          animationType="slide"
          onRequestClose={() => setbrandModal(false)}
        >
          <View style={styles.modalContainer}>

            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20 }}>

                <Text style={styles.modalTitle}>Filter by Brands</Text>
                <TouchableOpacity onPress={() => setbrandModal(false)}>
                  <Ion name='close-outline' size={responsiveFontSize(4)} color={Colors.textColors.primary} />
                </TouchableOpacity>
              </View>

              <FlatList
                showsVerticalScrollIndicator={false}
                data={filteredProducts}
                renderItem={({ item, index }) => {
                  const isSelected = brand === item?.brand; // Check if current item is selected

                  return (
                    <TouchableHighlight
                      activeOpacity={0.8}
                      underlayColor="transparent"
                      onPress={() => setbrand(item?.brand)} // Set selected index on press
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                        {/* Selection Box (Checkbox) */}
                        <TouchableOpacity
                          onPress={() => setbrand(item?.brand)}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            borderWidth: 2,
                            borderColor: isSelected ? Colors.btnColors.primary : "gray",
                            backgroundColor: isSelected ? Colors.btnColors.primary : "transparent",
                            marginRight: 10,
                          }}
                        />

                        {/* Item Text */}
                        <Text style={styles.txt14bold}>{item?.brand}</Text>
                      </View>
                    </TouchableHighlight>
                  );
                }}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ padding: 10 }}
              />
              <View style={{ width: '48%', flexDirection: 'row', alignItems: 'center', marginTop: responsiveWidth(4), gap: 15 }}>

                <TouchableOpacity style={{ ...styles.ProductButton, marginTop: 0, backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }} onPress={() => clear()}>
                  <Text style={styles.txt14bold}>Clear</Text>
                </TouchableOpacity>

                <CommonBtn title={'Done'} height={4} onpress={() => BrandHandle()} />

              </View>
            </View>
          </View>
        </Modal>

        {/* Model Modal */}
        <Modal
          transparent={true}
          visible={modelModal}
          animationType="slide"
          onRequestClose={() => setmodelModal(false)}
        >
          <View style={styles.modalContainer}>

            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20 }}>

                <Text style={styles.modalTitle}>Filter by Models</Text>
                <TouchableOpacity onPress={() => setmodelModal(false)}>
                  <Ion name='close-outline' size={responsiveFontSize(4)} color={Colors.textColors.primary} />
                </TouchableOpacity>
              </View>

              <FlatList
                showsVerticalScrollIndicator={false}
                data={filteredProducts}
                renderItem={({ item, index }) => {
                  const isSelected = model === item?.model; // Check if current item is selected

                  return (
                    <TouchableHighlight
                      activeOpacity={0.8}
                      underlayColor="transparent"
                      onPress={() => setmodel(item?.model)} // Set selected index on press
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                        {/* Selection Box (Checkbox) */}
                        <TouchableOpacity
                          onPress={() => setmodel(item?.model)}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            borderWidth: 2,
                            borderColor: isSelected ? Colors.btnColors.primary : "gray",
                            backgroundColor: isSelected ? Colors.btnColors.primary : "transparent",
                            marginRight: 10,
                          }}
                        />

                        {/* Item Text */}
                        <Text style={styles.txt14bold}>{item?.model}</Text>
                      </View>
                    </TouchableHighlight>
                  );
                }}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ padding: 10 }}
              />
              <View style={{ width: '48%', flexDirection: 'row', alignItems: 'center', marginTop: responsiveWidth(4), gap: 15 }}>

                <TouchableOpacity style={{ ...styles.ProductButton, marginTop: 0, backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }} onPress={() => clear()}>
                  <Text style={styles.txt14bold}>Clear</Text>
                </TouchableOpacity>

                <CommonBtn title={'Done'} height={4} onpress={() => BrandHandle()} />

              </View>
            </View>
          </View>
        </Modal>

        {/* Year Modal */}
        <Modal
          transparent={true}
          visible={yearModal}
          animationType="slide"
          onRequestClose={() => setyearModal(false)}
        >
          <View style={styles.modalContainer}>

            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20 }}>

                <Text style={styles.modalTitle}>Filter by Year</Text>
                <TouchableOpacity onPress={() => setyearModal(false)}>
                  <Ion name='close-outline' size={responsiveFontSize(4)} color={Colors.textColors.primary} />
                </TouchableOpacity>
              </View>

              <FlatList
                showsVerticalScrollIndicator={false}
                data={filteredProducts}
                renderItem={({ item, index }) => {
                  const isSelected = year === item?.year; // Check if current item is selected

                  return (
                    <TouchableHighlight
                      activeOpacity={0.8}
                      underlayColor="transparent"
                      onPress={() => setyear(item?.year)} // Set selected index on press
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                        {/* Selection Box (Checkbox) */}
                        <TouchableOpacity
                          onPress={() => setyear(item?.year)}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            borderWidth: 2,
                            borderColor: isSelected ? Colors.btnColors.primary : "gray",
                            backgroundColor: isSelected ? Colors.btnColors.primary : "transparent",
                            marginRight: 10,
                          }}
                        />

                        {/* Item Text */}
                        <Text style={styles.txt14bold}>{item?.year}</Text>
                      </View>
                    </TouchableHighlight>
                  );
                }}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ padding: 10 }}
              />
              <View style={{ width: '48%', flexDirection: 'row', alignItems: 'center', marginTop: responsiveWidth(4), gap: 15 }}>

                <TouchableOpacity style={{ ...styles.ProductButton, marginTop: 0, backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }} onPress={() => clear()}>
                  <Text style={styles.txt14bold}>Clear</Text>
                </TouchableOpacity>

                <CommonBtn title={'Done'} height={4} onpress={() => BrandHandle()} />

              </View>
            </View>
          </View>
        </Modal>

      </View>
      {loadingactivity ? <Loading /> : null}
    </View>
  )
}

export default Accessories;