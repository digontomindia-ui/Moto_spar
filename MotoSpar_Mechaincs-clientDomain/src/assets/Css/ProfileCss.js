import { StyleSheet } from "react-native";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import Colors from "../../constants/Colors";
import { Fonts, FontWeight } from "../../constants/Fonts";

export const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
        height: '75%'
        // alignItems: 'center', // Only if you want center alignment
    },
    subcontainer: {
        margin: responsiveWidth(4),
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
    txt14bold: {
        fontSize: Fonts.font14,
        fontWeight: FontWeight.bold,
        color: Colors.textColors.primary
    },
    txt14: {
        fontSize: Fonts.font14,
        color: Colors.textColors.primary
    },
    divider: {
        height: 0.5,
        width: '100%',
        backgroundColor: Colors.btnColors.pending,
        marginVertical: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'space-between',
    },
    ProfileImgView: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: responsiveWidth(6),
        marginBottom: responsiveWidth(5),
        alignSelf: 'center'
    },
    ProfileImg: {
        width: responsiveWidth(25),
        height: responsiveWidth(25),
        borderRadius: responsiveWidth(12.5),
        resizeMode: 'cover'
    },
    CardTextflex: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'space-between'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    image: {
        width: '90%',
        height: '90%',
        marginBottom: 16,
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
})