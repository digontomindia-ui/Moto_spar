import { StyleSheet } from "react-native";
import { Fonts, FontWeight } from '../../constants/Fonts'
import Colors from '../../constants/Colors'
import AuthButton from "../../components/HOC/AuthButton";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";


export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    subcontainer: {
        margin: 20,
        height: '100%'
    },
    imgConatiner: {      
        margin: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImg:{
        width: 150,
        height: 150,
        borderRadius: 200,
       borderWidth:2, borderColor:Colors.btnColors.primary,margin:5
    },
    editProfileImg:{
        alignSelf:'center', 
        bottom:responsiveWidth(10),
        width:responsiveWidth(5),
        height:responsiveWidth(5),
        borderRadius:responsiveWidth(3),
        marginLeft:responsiveWidth(27),
        backgroundColor:Colors.btnColors.primary,
        alignItems:'center',
        justifyContent:'center',
        padding:responsiveWidth(1),
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
    txtverybigbold: {
        fontSize: Fonts.font18,
        color: Colors.textColors.primary,
        fontWeight: FontWeight.bold
    },
    txtmediumbold: {
        fontSize: Fonts.font14,
        fontWeight: FontWeight.bold,
        color: Colors.textColors.primary
    },
    txtmedium: {
        fontSize: Fonts.font14,
        fontWeight: FontWeight.normal,
        color: Colors.textColors.primary
    },
    infoContainer: {
        margin: 20
    },
    infoAlign: {
        flexDirection: 'row',
        gap: responsiveWidth(2),
        marginVertical: responsiveWidth(2.5)
    },
    divider: {
        height: responsiveHeight(1),
        backgroundColor: Colors.textColors.tertiary
    },
    optionbar: {
        flexDirection: 'row',
        gap: responsiveWidth(2),
        width: '100%',
        height: responsiveHeight(7.5),
        borderBottomWidth: responsiveWidth(0.2),
        borderBottomColor: Colors.textColors.tertiary,
        alignItems: 'center',
        paddingLeft: 20

    },
    saveaddress: {
        width: '100%',
        height: responsiveHeight(6),
        backgroundColor: Colors.textInputColors.secondary,
        padding: responsiveWidth(4),
        marginBottom: responsiveHeight(0.5)

    },

    addContainer: {
        flexDirection: 'row',
        gap: responsiveWidth(4),
        padding: 15,
        width: 'auto',
        height: 'auto',
        borderWidth: responsiveWidth(0.15),
        borderRadius: responsiveWidth(2),
        borderBlockColor: Colors.textColors.primary,
        marginBottom: responsiveHeight(1)
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
    picker:{
        height: 50, width: '100%',
        backgroundColor:Colors.textInputColors.secondary
    },
    alignment:{
        marginVertical: responsiveHeight(1.3),
        marginHorizontal:responsiveWidth(4)
    },
    btnAlignment: {
        marginVertical: responsiveHeight(0.5),
        flexDirection: 'row',
        gap: responsiveWidth(5)
    },
    addBtn: {
        fontSize: Fonts.font12,
        color: Colors.btnColors.primary
    },
    btn: {
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        width: '95%',
        height: responsiveHeight(5.5),
        borderWidth: responsiveWidth(0.5),
        borderColor: Colors.btnColors.primary,
        borderRadius: responsiveWidth(6),
        margin: responsiveHeight(1),
        position: 'absolute',
        bottom: 0
    },


    addtypeView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    radioButton: {
        borderWidth: 2,
        borderColor: Colors.textInputColors.secondary,
        backgroundColor: Colors.textInputColors.secondary,
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 20,
        marginHorizontal: 10,
        height: responsiveHeight(4)
    },
    selectedButton: {
        borderColor: Colors.btnColors.primary
    },
    radioText: {
        color: Colors.textColors.primary,
        fontSize: Fonts.font12,
        // textAlign: 'center',
    },
    formContainer:{
        justifyContent:'center',
        padding:15,
         width:'auto',
         height:'auto',
         borderWidth:responsiveWidth(0.15),
         borderRadius:responsiveWidth(2),
         borderBlockColor:Colors.textColors.secondary,
         marginBottom:responsiveHeight(3)
     },

})