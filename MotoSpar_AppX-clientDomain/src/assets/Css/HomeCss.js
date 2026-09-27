import {StyleSheet} from 'react-native';
import {Fonts, FontWeight} from '../../constants/Fonts';
import Colors from '../../constants/Colors';
import AuthButton from '../../components/HOC/AuthButton';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    height: '100%',
  },
  banner: {
    width: '100%',
    height: 167,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtBold: {
    fontSize: Fonts.font18,
    fontWeight: FontWeight.extrabold,
    color: Colors.background,
  },
  txtheading: {
    fontSize: Fonts.font16,
    fontWeight: FontWeight.bold,
    color: Colors.btnColors.primary,
  },
  txtNorm: {
    fontSize: Fonts.font10,
    fontWeight: FontWeight.normal,
    color: Colors.background,
  },
  txt14: {
    fontSize: Fonts.font14,
    fontWeight: FontWeight.normal,
    color: Colors.textColors.primary,
  },
  txt12: {
    fontSize: Fonts.font12,
    fontWeight: FontWeight.normal,
    color: Colors.textColors.primary,
  },
  txt14bold: {
    fontSize: Fonts.font14,
    fontWeight: FontWeight.bold,
    color: Colors.textColors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // margin: 5,
    color: 'black',
    backgroundColor: Colors.background,
    //    justifyContent:'space-evenly',
    borderRadius: 8,
    borderColor: 'black',
    fontSize: 10,
    width: '60%',
    height: '20%',
  },
  searchBtn: {
    width: '20%',
    height: '80%',
    backgroundColor: Colors.btnColors.primary,
    position: 'static',
    right: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  dropdown: {
    width: '31%',
    borderColor: 'black',
    justifyContent:'center',
    alignItems:'center',
    borderWidth:0.5,
    height: 30,
    borderRadius:15,
    flexDirection:'row',
    justifyContent:'space-around'
  },
  productContainer: {
    margin: 15,
  },
  TopCatgImg: {
    width: 140,
    height: 90,
    borderRadius: 10,
    marginVertical: 5,
  },
  Label: {
    fontSize: Fonts.font12,
    fontWeight: FontWeight.bold,
    color: Colors.textColors.primary,
  },
  flatListContainer: {
    //   flex:1
  },
  productCard: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 7,
    borderWidth: 0.2,
    borderColor: '#000',
    padding: 10,
    shadowRadius: 7,
    elevation: 0.5,
    width: responsiveWidth(46), // Fixed width
    marginRight: 10, // Spacing between cards
    height: '95%', // Fixed height for all cards
    justifyContent: 'space-between', // Align content properly
  },
  contentContainerStyle: {
    flexDirection: 'row',
    // justifyContent: 'space-between', // Ensures spacing between cards
    paddingHorizontal: 5,
  },

  productImage: {
    width: responsiveWidth(30),
    height: responsiveHeight(13),
    marginBottom: 5,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  productSku: {
    fontSize: 10,
    color: Colors.textColors.primary,
  },
  productPrice: {
    fontSize: Fonts.font12,
    fontWeight: FontWeight.bold,
    color: Colors.textColors.primary,
    marginVertical: 5,
  },
  ProductButton: {
    backgroundColor: Colors.textInputColors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  capsule: {
    backgroundColor: Colors.textInputColors.primary,
    borderRadius: 20,
    width: 'auto',
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    position: 'static',
    alignSelf: 'flex-end',
    margin: 3,
  },
  addToCartText: {
    color: Colors.textColors.primary,
    fontSize: Fonts.font10,
    fontWeight: FontWeight.bold,
  },
  accesoriesBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: responsiveHeight(7),
    backgroundColor: Colors.textInputColors.secondary,
    marginBottom: responsiveWidth(1),
   
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  txtpricecut: {
    fontSize: Fonts.font10,
    color: Colors.textColors.primary,
    fontWeight: FontWeight.normal,
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: Fonts.font10,
    color: 'red',
    fontWeight: FontWeight.normal,
  },

  //Modal CSS
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding:10,
    paddingVertical:30,
    // alignItems: 'center',
    height:'auto',
    position:'absolute',
    bottom:0
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterOption: {
    fontSize: 16,
    marginVertical: 10,
  },
  modalClose: {
    fontSize: 14,
    color: 'red',
    marginTop: 20,
  },
  choosed:{
    fontSize: 16,
    marginVertical: 10,
    color:Colors.textInputColors?.primary
  }
});
