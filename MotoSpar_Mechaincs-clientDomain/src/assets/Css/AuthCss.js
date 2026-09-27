import { StyleSheet } from "react-native";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import Colors from "../../constants/Colors";
import { Fonts, FontWeight } from "../../constants/Fonts";

export const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: Colors.background.secondary,
        alignItems: 'center',

    },
    subcontainer: {
        margin: responsiveWidth(4)
    },
    text: {
        fontSize: Fonts.font20,
        fontWeight: FontWeight.bold,
        fontFamily: 'DM Sans',
        color: Colors.textColors.primary,
    },
    txt16bold: {
        fontSize: Fonts.font16,
        fontWeight: FontWeight.bold,
        color: Colors.textColors.primary
    },
    txt16: {
        fontSize: Fonts.font16,
        fontWeight: FontWeight.medium,
        color: Colors.textColors.primary
    },
    txt12bold: {
        fontSize: Fonts.font12,
        color: Colors.textColors.primary,
        fontWeight: FontWeight.bold,
    },
    txt12: {
        fontSize: Fonts.font12,
        color: Colors.textColors.primary,

    },
    txt10: {
        fontSize: Fonts.font10,
        color: Colors.textColors.primary,

    },
    txt18bold: {
        fontSize: Fonts.font18,
        color: Colors.textColors.primary,
        fontWeight: FontWeight.bold
    },
    txt20bold: {
        fontSize: Fonts.font20,
        color: Colors.textColors.primary,
        fontWeight: FontWeight.bold
    },
    txt22bold: {
        fontSize: Fonts.font22,
        color: Colors.textColors.primary,
        fontWeight: FontWeight.bold
    },
    txt14bold: {
        fontSize: Fonts.font14,
        fontWeight: FontWeight.bold,
        color: Colors.textColors.primary
    },
    txt14: {
        fontSize: Fonts.font14,
        color: Colors.textColors.primary
    },
    line: {
        alignSelf: 'center',
        height: 1,
        marginTop: responsiveWidth(9),
        width: '80%'
    },
    option: {
        marginTop: responsiveWidth(9)
    },
    overlayContainer: {
        position: 'absolute',
        top: '13%',
        width: '100%',
        height: '100%',
        alignItems: 'center',


    },
    card: {
        width: '90%',
        backgroundColor: Colors.background.primary,
        padding: 20,
        borderRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        marginBottom: 20, // Space between card and social buttons
    },

    btnLogo: {
        width: responsiveWidth(6),
        height: responsiveWidth(6)
    },
    btn: {
        width: responsiveWidth(40),
        height: responsiveWidth(13),
        borderRadius: responsiveWidth(10),
        backgroundColor: Colors.textinputColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10,
        shadowColor: Colors.textColors.primary,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    btnView: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    txtinputContainer: {
        width: '100%',
        marginVertical: responsiveHeight(1),
        height: responsiveHeight(5),
        borderRadius: 20,
        backgroundColor: Colors.background.primary,
        // Shadow for iOS
        borderWidth: 0.5,
        borderColor: Colors.btnColors.primary,
        justifyContent: 'center',
        paddingHorizontal: 5
        // Elevation for Android
    },
    txtinput: {
        width: '90%',
        height: 38,
        borderRadius: 4,
        // paddingHorizontal: 10,
        fontSize: Fonts.font14,
        fontWeight: FontWeight.medium,
        color: Colors.textColors.primary,
        justifyContent: 'center'

    },
    userInfo: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        height: '10%',

    },
    ProfileImg: {
        width: responsiveWidth(13),
        height: responsiveWidth(13),
        borderRadius: responsiveWidth(6.5),
        resizeMode: 'cover'
    },
    drawerContent: {
        height: '100%',
        margin: 10,
        marginVertical: 20,


    },
    CardTextflex: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 2,

    },


    NotificationCounter: {

        backgroundColor: 'red',
        borderRadius: responsiveWidth(2.5),
        height: responsiveWidth(5),
        width: responsiveWidth(5),
        justifyContent: 'center',
        alignItems: 'center',
    },




})