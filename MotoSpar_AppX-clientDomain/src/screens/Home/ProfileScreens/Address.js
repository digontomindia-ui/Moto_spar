import { View, Text, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { styles } from '../../../assets/Css/ProfileCss';
import Header from '../../../components/HOC/Header';
import Ion from 'react-native-vector-icons/Ionicons';
import { FlatList } from 'react-native-gesture-handler';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import Colors from '../../../constants/Colors';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { HomeContext } from '../../../context/HomeContext';
import CustomAlert from '../../../components/Atoms/CustomAlert';
import Toast from 'react-native-toast-message';

const Address = () => {
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [selectedId, setSelectedId] = useState(null); // Track selected address for deletion
    const { GetShippingAddress, shippingAddress, DeleteCommon } = useContext(HomeContext);

    useEffect(() => {
        if (isFocused) {
            GetShippingAddress();
        }
    }, [isFocused]);

    const OpenAlert = (id) => {
        setSelectedId(id);
        setAlertVisible(true);
    };

    const HandleDelete = async (id) => {
        setAlertVisible(false); // Close the alert
        await DeleteCommon(`customer/shipping-address/${id}/delete`);
        Toast.show({
            type: 'success',
            text1: 'Address deleted successfully!',
            position: 'bottom',
        });
        GetShippingAddress(); // Refresh the list after deletion
    };

    return (
        <View style={styles.container}>
            <Header screenName={'My Addresses'} backIcon={true} navigateTo={'Profile'} />
            <View style={styles.saveaddress}>
                <Text style={styles.txtsmall}>Saved Address</Text>
            </View>
            <View style={styles.subcontainer}>
                {shippingAddress?.length === 0 ? ( // Check if the array is empty
                    <View style={{ marginTop: 50, alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, color: '#888' }}>No Address Found</Text>
                    </View>
                ) : (
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={shippingAddress}
                        renderItem={({ item }) => (
                            <View style={styles.addContainer}>
                                {item?.address_type === 'Home' ? (
                                    <Ion
                                        name="home-outline"
                                        size={responsiveFontSize(2.3)}
                                        color={Colors.textColors.primary}
                                    />
                                ) : (
                                    <Ion
                                        name="business-outline"
                                        size={responsiveFontSize(2.3)}
                                        color={Colors.textColors.primary}
                                    />
                                )}
                                <View style={styles.addtxt}>
                                    <Text style={styles.txtmediumbold}>{item?.address_type}</Text>
                                    <Text style={styles.txtmediumbold}>{item?.name}</Text>
                                    <View style={styles.space}>
                                        <Text style={styles.txtsmall}>
                                            {item?.street_address}, {item?.city}, {item?.state} {item?.postal_code}
                                        </Text>
                                    </View>
                                    <Text style={styles.txtsmall}>Phone Number: {item?.phone_number}</Text>
                                    <View style={styles.btnAlignment}>
                                        <TouchableOpacity activeOpacity={0.6}>
                                            <Text
                                                style={styles.addBtn}
                                                onPress={() => navigation.navigate('EditAddress', { data: item })}
                                            >
                                                Edit
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity activeOpacity={0.6} onPress={() => OpenAlert(item?.id)}>
                                            <Text style={styles.addBtn}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                        keyExtractor={(item) => item.id.toString()} // Corrected key extractor
                    />
                )}
            </View>

            <TouchableOpacity
            activeOpacity={0.6}
                style={styles.btn}
                onPress={() => navigation.navigate('EditAddress')}
            >
                <Text style={{ ...styles.txtmediumbold, color: Colors.btnColors.primary }}>
                    Add New Address
                </Text>
            </TouchableOpacity>

            {/* Render the Custom Alert */}
            {isAlertVisible && (
                <CustomAlert
                    title={'Delete Address'}
                    body={'Are you sure you want to delete this address?'}
                    visible={isAlertVisible}
                    onClose={() => setAlertVisible(false)}
                    onConfirm={() => HandleDelete(selectedId)} // Delay execution
                />
            )}
        </View>
    );
};

export default Address;
