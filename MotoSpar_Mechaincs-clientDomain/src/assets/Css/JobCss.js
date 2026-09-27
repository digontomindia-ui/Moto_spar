import { StyleSheet } from "react-native";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import Colors from "../../constants/Colors";
import { Fonts, FontWeight } from "../../constants/Fonts";

export const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
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
    txt22bold: {
        fontSize: Fonts.font22,
        color: Colors.textColors.primary,
        fontWeight: FontWeight.bold
    },
    divider: {
        height: 0.5,
        width: '100%',
        backgroundColor: Colors.btnColors.pending,
        marginVertical: 20,
    },
    seprator: { height: 50, width: 0.5, backgroundColor: Colors.btnColors.pending, marginVertical: 5 },
    header: {

        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'space-between',
    },
    card: {

        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.btnColors.primary,
        borderRadius: 15,
        marginBottom: 10
    },
    CardTextflex: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
        justifyContent: 'space-between'
    },
    ProfileImg: {
        width: responsiveWidth(17),
        height: responsiveWidth(17),
        borderRadius: responsiveWidth(8.5),
        resizeMode: 'cover',
        borderWidth: 2,
        borderColor: Colors.btnColors.primary

    },
    miniCard: {
        borderWidth: 1,
        borderColor: Colors.textColors.primary,
        padding: 5,
        borderRadius: 20,
        backgroundColor: '#8C8B8B1A'
    },
    banner: {
        width: '100%',
        height: 210,
        backgroundColor: Colors.background.secondary,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textArea: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#555555',
        borderRadius: 7,
        padding: 12,
        fontSize: 16,
        color: Colors.textColors.primary,
        height: 150,
        textAlignVertical: 'top',
        marginTop: 10,
    },
})