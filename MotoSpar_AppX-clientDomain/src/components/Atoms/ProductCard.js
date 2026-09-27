import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { styles } from '../../assets/Css/HomeCss';
import Ion from 'react-native-vector-icons/Ionicons'
import Colors from '../../constants/Colors';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
const navigation=useNavigation();
const ProductCard = ( item, index ) => {
  return(
    <View style={styles.productCard}>
       <TouchableOpacity activeOpacity={0.6} onPress={()=>navigation.navigate('ProductScreen')}>
      <Image source={require('../../assets/images/cartopCatg/cat1.jpeg')} style={styles.productImage} />
      <View style={styles.capsule}>
        { item?.variants[0]?.in_stock?
          <Text style={{fontSize:10,color:'black'}} >In stock</Text>
          :
          <Text style={{fontSize:10,color:'red'}} >Out of stock</Text>
        }
      </View>
     <View >
     <Text style={styles.Label} numberOfLines={2}>{item?.name}</Text>
      <Text style={styles.productSku} numberOfLines={1}>{`SKU#: ${item?.variants[0]?.sku}`}</Text>
      <Text style={styles.productPrice} >{item?.variants[0]?.price} </Text>
     <View style={{flexDirection:'row', justifyContent:'space-between'}}>
     <TouchableOpacity style={styles.ProductButton}>
        <Text style={styles.addToCartText}>Add to cart</Text>
        <View style={{width:responsiveWidth(4),height:responsiveWidth(4),borderRadius:responsiveWidth(2),backgroundColor:Colors.btnColors.primary,justifyContent:'center',alignItems:'center'}}>
        <Ion name='cart-outline' size={12}  color={Colors.background}/>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.ProductButton}>
          <Ion name='heart-outline' size={12}  color={Colors.background}/>
      </TouchableOpacity>
     </View>
     </View>
   </TouchableOpacity>
    </View>
  );
}

export default ProductCard