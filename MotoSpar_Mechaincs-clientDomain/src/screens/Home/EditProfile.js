import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native'
import React, { useContext, useState } from 'react'
import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import { styles } from '../../assets/Css/ProfileCss';
import Colors from '../../constants/Colors';
import { Textinput } from '../../components/HOC/Textinput';
import { Dropdown } from 'react-native-element-dropdown';
import { pick, types } from '@react-native-documents/picker';
import CommonBtn from '../../components/HOC/CommonBtn';
import { HomeContext } from '../../context/HomeContext';
const EditProfile = () => {
    const navigation = useNavigation();
    const { UpdateDetails,
        UpdateProfile,
        loadingactivity,
    } = useContext(HomeContext);
    const user = useSelector(state => state.userData);
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 350;
    const [firstname, setfirstname] = useState(user?.first_name || '');
    const [lastname, setlastname] = useState(user?.last_name || '');
    const [email, setemail] = useState(user?.email || '');
    const [phone_number, setphone_number] = useState(user?.phone_number || '');
    const [address, setaddress] = useState(user?.mechanic_profile?.base_address || '')
    const [pincode, setPincode] = useState(user?.mechanic_profile?.base_postal_code || '');
    const [experience, setExperience] = useState(user?.mechanic_profile?.years_of_experience.toString() || '');
    const [vehicleType, setVehicleType] = useState(user?.mechanic_profile?.specialization || '');
    const [idProof, setIdProof] = useState(user?.mechanic_profile?.uploaded_documents_type || '');
    const [documentPreview, setdocumentPreview] = useState(user?.mechanic_profile?.uploaded_documents?.split("/").pop() || '')
    const [document, setdocument] = useState('');

    // dropdown options
    const VehicleData = [
        { label: 'Two-Wheeler', data: 'Two-Wheeler' },
        { label: 'Three-Wheeler', data: 'Three-Wheeler' },
        { label: 'Four-Wheeler', data: 'Four-Wheeler' },
        { label: 'Heavy Vehicles', data: 'Heavy Vehicles' },
    ];

    const IDData = [
        { label: 'Adhar card', data: 'Adhar card' },
        { label: 'PAN Card', data: 'PAN Card' },
        { label: 'Driving License', data: 'Driving License' },
        { label: 'Voter Id', data: 'Voter Id' },
    ];

    // uploading img or pdf 
    const handlePick = async () => {
        try {
            const result = await pick({
                type: [types.images, types.pdf],
                allowMultiSelection: false,
            });

            const file = result[0];
            setdocument(result[0])
            console.log('File Picked', file);
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Error picking file',
                text2: err?.message || 'Unknown error',
                position: 'bottom',
            });
        }
    };

    // submitting data for both personal and proffesional DetailS
    const handleSubmit = () => {

        UpdateDetails(user?.mechanic_profile?.id, pincode, experience, vehicleType, idProof, document ? document : null, address);
        UpdateProfile(firstname, lastname, phone_number, '91', null)

    }
    return (
        <View style={styles.container}>
            <View style={styles.subcontainer}>
                <View style={{ ...styles.CardTextflex, marginTop: 10 }}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.goBack()}
                    >
                        <IO
                            name='arrow-back-outline'
                            size={responsiveFontSize(3)}
                            color={'black'}
                        />
                    </TouchableOpacity>
                    <View style={styles.header}>
                        <Text style={{ ...styles.txt20bold, }}> Edit Profile</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.divider} />
                <ScrollView>
                    <View style={{ backgroundColor: Colors.background.secondary, padding: 20, flex: 1, borderRadius: 15 }}>
                        <Text style={styles.txt16bold}>Personal Information :</Text>
                        <View
                            style={{
                                flexDirection: isSmallScreen ? 'column' : 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                gap: 10,
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <Textinput placeholder={'Enter First Name'} inputType={'default'} margin={1} value={firstname} onChangeText={setfirstname} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Textinput placeholder={'Enter Last Name'} inputType={'default'} margin={1} value={lastname} onChangeText={setlastname} />
                            </View>

                        </View>
                        <Textinput placeholder={'Enter your Email'} inputType={'Email-address'} margin={1} value={email} editable={false} />
                        <Textinput placeholder={'Enter Phone number'} inputType={'numeric'} margin={1} value={phone_number} onChangeText={setphone_number} />
                        <Text style={{ ...styles.txt16bold, marginTop: 10 }}>Professional Information :</Text>
                        <Textinput placeholder={'Enter current Address'} inputType={'default'} margin={1} value={address} onChangeText={setaddress} />
                        <Textinput placeholder={'Enter Service Area / Pincode'} inputType={'numeric'} margin={1} value={pincode} onChangeText={setPincode} />
                        <Textinput placeholder={'Enter your Experience'} inputType={'numeric'} margin={1} value={experience} onChangeText={setExperience} />
                        <View style={styles.txtinputContainer}>
                            <Dropdown
                                style={{
                                    height: responsiveHeight(5),
                                    width: '100%',
                                    color: Colors.textColors.primary
                                }}
                                placeholderStyle={{ ...styles.txt14, color: Colors.textColors.primary, marginHorizontal: 10 }}
                                selectedTextStyle={{ ...styles.txt14, color: Colors.textColors.primary, marginHorizontal: 10 }}
                                containerStyle={{
                                    flex: 1,
                                    backgroundColor: Colors.background.primary,
                                }}
                                iconStyle={styles.iconStyle}
                                itemTextStyle={{ color: Colors.textColors.primary }}
                                labelField="label"
                                valueField="data"
                                data={VehicleData}
                                maxHeight={250}
                                placeholder="Select Specialisation Vehicle"
                                value={vehicleType}
                                onChange={item => setVehicleType(item.data)}
                            />
                        </View>


                        <View style={styles.txtinputContainer}>
                            <Dropdown
                                style={{
                                    height: responsiveHeight(5),
                                    width: '100%',
                                    color: Colors.textColors.primary
                                }}
                                placeholderStyle={{ ...styles.txt14, color: Colors.textColors.primary, marginHorizontal: 10 }}
                                selectedTextStyle={{ ...styles.txt14, color: Colors.textColors.primary, marginHorizontal: 10 }}
                                containerStyle={{
                                    flex: 1,
                                    backgroundColor: Colors.background.primary,
                                }}
                                iconStyle={styles.iconStyle}
                                itemTextStyle={{ color: Colors.textColors.primary }}
                                labelField="label"
                                valueField="data"
                                data={IDData}
                                maxHeight={250}
                                placeholder="Select ID"
                                value={idProof}
                                onChange={item => setIdProof(item.data)}
                            />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={{ ...styles.txtinputContainer, height: responsiveHeight(8) }}
                            onPress={handlePick}
                        >
                            {documentPreview ? (
                                document ?
                                    <Text style={{ ...styles.txt12, textAlign: 'center', marginTop: 4, color: 'green' }}>
                                        {document?.name}
                                    </Text> :
                                    <Text style={{ ...styles.txt12, textAlign: 'center', marginTop: 4, color: 'green' }}>
                                        {documentPreview}
                                    </Text>
                            ) : <>
                                <Text style={{ ...styles.txt14, textAlign: 'center' }}>Upload Document</Text>
                                <Text style={{ ...styles.txt12, textAlign: 'center' }}>PNG, PDF, JPG</Text>
                            </>}

                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <CommonBtn title={'Update'} height={40} textColor={'white'} onpress={() => handleSubmit()} />
            </View>
        </View>



    )
}

export default EditProfile