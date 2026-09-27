import { Dimensions, StyleSheet } from "react-native";
import { Fonts, FontWeight } from '../../constants/Fonts'
import Colors from '../../constants/Colors'
import AuthButton from "../../components/HOC/AuthButton";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";

const SCREEN_WIDTH = Dimensions.get('window').width;
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    alignItems: 'center'
  },
  txtnormalbold: {
    fontSize: Fonts.font16,
    fontWeight: FontWeight.bold,
    color: Colors.textColors.primary
  },
  txtsmallbold: {
    fontSize: Fonts.font12,
    color: Colors.textColors.primary,
    fontWeight: FontWeight.bold,
  },
  txtsmall: {
    fontSize: Fonts.font12,
    color: Colors.textColors.primary,

  },
  txtverysmall: {
    fontSize: Fonts.font10,
    color: Colors.textColors.primary,

  },
  // specificproductImage: {
  //   width: responsiveWidth(70),
  //   height: responsiveHeight(30),
  //   alignSelf: 'center',
  //   margin: 20
  // },
  imgContainer: {
    position: 'relative',
    height: responsiveHeight(40),

  },
  carouselImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',


  },
  specificproductImage: {
    width: responsiveWidth(80),
    height: responsiveHeight(35),
    marginHorizontal: 20

  },

  priceContainer: {
    flexDirection: 'row', gap: 10,
    alignItems: 'center',

  },
  txtverybigbold: {
    fontSize: Fonts.font18,
    color: Colors.textColors.primary,
    fontWeight: FontWeight.bold
  },
  txtpricecut: {
    fontSize: Fonts.font12,
    color: Colors.textColors.primary,
    fontWeight: FontWeight.normal,
    textDecorationLine: 'line-through',

  },
  discount: {
    fontSize: Fonts.font12,
    color: 'red',
    fontWeight: FontWeight.normal,
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: responsiveFontSize(0.3)
  },
  txtmedium: {
    fontSize: Fonts.font12,
    fontWeight: FontWeight.medium,

  },
  sizebtn: {

    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    borderRadius: 60,
    padding: 5,
    backgroundColor: '#F7F0F0',
    margin: 5
  },
  selectedSizeBtn: {
    borderWidth: 1, // Thin border
    borderColor: "black", // Black border color
  },
  divider: {
    width: '100%',
    borderColor: Colors.textColors.secondary,
    borderWidth: responsiveWidth(0.05),
    marginVertical: 10
  },

  cartbtn: {
    width: responsiveWidth(45),
    height: responsiveHeight(5),
    borderRadius: responsiveWidth(5),
    backgroundColor: Colors.btnColors.tertiary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buybtn: {
    width: responsiveWidth(45),
    height: responsiveHeight(5),
    borderRadius: responsiveWidth(5),
    backgroundColor: Colors.btnColors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btntxt: {
    fontSize: Fonts.font14,
    fontWeight: FontWeight.bold,
    color: Colors.background
  },
  detail: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    // alignItems: 'center',

    marginBottom: 5,
  },
  detailheaderText: {
    fontSize: Fonts.font14,
    fontWeight: FontWeight.bold,
    color: Colors.textColors.primary
  },
  detailLeft: {
    //     paddingRight:responsiveWidth(10),
    //    marginRight:responsiveWidth(10),
    //    backgroundColor:'red'

  },
  productCard: {

    width: '100%',
    flex: 1,
    margin: responsiveWidth(1),
    borderWidth: responsiveWidth(0.2),
    borderRadius: responsiveWidth(4),
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',


  },

  productImage: {
    width: responsiveWidth(30),
    height: responsiveHeight(10),
    marginBottom: 5,
    resizeMode: 'contain',
    alignSelf: 'center',
    overflow: 'hidden'
  },
  imageframe: {

    borderColor: Colors.textColors.primary,
    width: responsiveWidth(26),
    height: responsiveHeight(12),
    justifyContent: 'center',
    marginBottom: 10
  },
  RatingCard: {
    justifyContent: 'center',
    padding: 10,
    width: 'auto',
    height: 'auto',
    borderWidth: responsiveWidth(0.2),
    borderRadius: responsiveWidth(3),
    borderBlockColor: Colors.textColors.primary,
    marginVertical: responsiveHeight(2)
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: responsiveWidth(1),
  },
  star: {
    fontSize: Fonts.font18,
    marginHorizontal: 3,
  },
  reviewImg: {
    width: responsiveWidth(20),
    height: responsiveWidth(20),
    borderRadius: 10,
    marginRight: 10,
    borderWidth: responsiveWidth(0.2),
    borderColor: 'black'
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: responsiveWidth(2),
    height: responsiveWidth(2),
    borderRadius: responsiveWidth(1),
    marginHorizontal: 5,
    marginVertical: 10
  },
  activeDot: {
    backgroundColor: Colors.btnColors.primary,
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
  priceWishlistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'gray',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checked: {
    borderColor: 'green',
    backgroundColor: '#DFFFD6',
  },
  tick: {
    color: 'green',
    fontSize: 15,
    fontWeight: 'bold',
  },
  deliveryContainer: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 10,
    alignItems: 'center',
  }
})