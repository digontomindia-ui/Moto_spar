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
        margin: responsiveWidth(3),
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
        borderRadius: 15
    },
    CardTextflex: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
        justifyContent: 'space-between'
    },

    miniCard: {
        borderWidth: 1,
        borderColor: Colors.textColors.primary,
        padding: 5,
        borderRadius: 20,
        backgroundColor: '#8C8B8B1A'
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 10,

    },
    tabText: {
        fontSize: 18,
        color: "#C0C0C0",
        fontWeight: "400",
        width: '90%',
        textAlign: "center",

    },
    activeTabText: {
        color: "#5A635E",
        fontWeight: "bold",
    },
    indicatorWrapper: {
        height: 2,
        backgroundColor: "#E0E0E0",
        width: "95%",
        position: "relative",
        alignSelf: 'center',
        marginBottom: 10
    },
    indicator: {
        height: 2,
        width: "35%", // Adjust this based on the number of tabs
        backgroundColor: Colors.btnColors.primary,
        position: "absolute",

    },

    SearchContainer: {
        width: '100%',
        height: responsiveWidth(9),
        borderRadius: responsiveWidth(3),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderColor: Colors.btnColors.primary,
        borderWidth: 1,
        marginBottom: responsiveWidth(6),
        alignSelf: 'center',
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1 },
    faqContainer: { backgroundColor: "#FCFCFC", padding: 20, borderRadius: 8, marginBottom: 8 },


})