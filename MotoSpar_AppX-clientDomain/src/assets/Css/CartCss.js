import { StyleSheet } from "react-native";
import { Fonts, FontWeight } from '../../constants/Fonts'
import Colors from '../../constants/Colors'
import AuthButton from "../../components/HOC/AuthButton";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";


export const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: Colors.background,
        height: '100%'
    },
    subcontainer: {
        margin: 20,
        height: '80%',
    },
    productcontainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 'auto',
        height: 'auto',
        borderWidth: responsiveWidth(0.15),
        borderRadius: responsiveWidth(2),
        borderBlockColor: Colors.textColors.secondary,padding:10,
        marginBottom: 20
    },
    ordercontainer: {
        justifyContent: 'center',
        padding: 15,
        width: 'auto',
        height: 'auto',
        borderWidth: responsiveWidth(0.15),
        borderRadius: responsiveWidth(2),
        borderBlockColor: Colors.textColors.secondary,
        marginBottom: responsiveHeight(5),
    },
    txtpricecut: {
        fontSize: Fonts.font12,
        color: Colors.textColors.primary,
        fontWeight: FontWeight.normal,
        textDecorationLine: 'line-through',
    },
    txtsmallbold: {
        fontSize: Fonts.font12,
        color: Colors.textColors.primary,
        fontWeight: FontWeight.extrabold,
    },
    txtsmall: {
        fontSize: Fonts.font12,
        color: Colors.textColors.primary,

    },
    txtverysmall: {
        fontSize: Fonts.font10,
        color: Colors.textColors.primary
    },
    txtverysmallbold: {
        fontSize: Fonts.font12,
        color: Colors.textColors.primary,
        fontWeight: FontWeight.bold
    },
    txtmediumbold: {
        fontSize: Fonts.font14,
        fontWeight: FontWeight.bold,
        color: Colors.textColors.primary,
    },
    txtmedium: {
        fontSize: Fonts.font14,
        fontWeight: FontWeight.normal,
        color: Colors.textColors.primary
    },
    txtnormalbold: {
        fontSize: Fonts.font16,
        fontWeight: FontWeight.bold,
        color: Colors.textColors.primary
    },
    txtlargebold: {
        fontSize: Fonts.font18,
        fontWeight: FontWeight.bold,
        color: Colors.textColors.primary
    },
    discountPrice: {
        fontSize: Fonts.font16,
        fontWeight: FontWeight.bold,
        color: 'red'
    },

    Productcard: {
        borderWidth: responsiveWidth(0.1),
        borderRadius: responsiveWidth(5),
        borderBlockColor: Colors.textColors.secondary,
        margin: 5,
        padding: 10,
        width: responsiveWidth(80),

    },
    imgCard: {
        width: responsiveWidth(30),
        height: responsiveHeight(14),
        resizeMode: 'contain',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        alignSelf: 'center'
    },
    productImg: {
        width: responsiveWidth(30),
        height: responsiveHeight(13),

    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    capsule: {
        flexDirection: 'row',
        backgroundColor: Colors.textInputColors.primary,
        borderRadius: 20,
        width: 'auto',
        paddingHorizontal: 20,
        paddingVertical: 5,
        alignItems: 'center',
        justifyContent: 'space-around',
        margin: 3
    },
    detail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin:5
    },
    divider: {
        width: 'auto',
        backgroundColor: Colors.textColors.secondary,
        borderWidth: responsiveWidth(0.05),
        marginVertical: 15,
    },
    Proceedbtn: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        margin: 10
    },
    addBtn: {
        fontSize: Fonts.font12,
        color: Colors.btnColors.primary
    },
    addContainer: {
        flexDirection: 'row',
        gap: responsiveWidth(4),
        padding: 15,
        width: 'auto',
        height: 'auto',
        borderWidth: responsiveWidth(0.1),
        borderRadius: responsiveWidth(2),
        borderBlockColor: Colors.textColors.secondary,
        marginVertical: responsiveHeight(2.5)
    },
    addtxt: {
        width: responsiveWidth(70)
    },
    space: {
        marginVertical: responsiveHeight(0.5)
    },
    spacewide: {
        marginVertical: responsiveHeight(1.3),

    },
    btnAlignment: {
        marginVertical: responsiveHeight(0.5),
        flexDirection: 'row',
        gap: responsiveWidth(5)
    },
    orderestimateCard: {
        marginVertical: 5,
        width: '100%', 
        // height:'80%',    
        backgroundColor: Colors.textInputColors.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: responsiveWidth(3),
        padding:5,
        borderRadius:10,
    },
    orderImg: {
        width: '22%',
        height: responsiveHeight(8)
    },
    radioButton: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.textColors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioButtonSelected: {
        borderColor: Colors.btnColors.primary,
    },
    radioButtonInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: Colors.btnColors.primary,
    },
    bottomView: {
        width: '100%',
        backgroundColor: Colors.textInputColors.secondary,
        height: responsiveHeight(7),
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    infoScreenView: {
        flex: 1,
        justifyContent: 'center', alignItems: 'center',
    },
    btn: {
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        width: '100%',
        height: responsiveHeight(5),
        borderWidth: responsiveWidth(0.5),
        borderColor: Colors.btnColors.primary,
        borderRadius: responsiveWidth(6),
        margin:10

    },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        alignItems: 'center'
    },
    txtverysmall: {
        fontSize: Fonts.font10,
        color: Colors.textColors.primary,
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
})