import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native'
import React, { useContext, useState } from 'react'
import { styles } from '../../../assets/Css/JobCss'
import IO from 'react-native-vector-icons/Ionicons';
import CommonBtn from '../../../components/HOC/CommonBtn';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import { HomeContext } from '../../../context/HomeContext';
import Colors from '../../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { launchCamera } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import OTPModal from '../../../components/Modals/OTPModal';
const JobPictureUpload = () => {
    const navigation = useNavigation()
    const { SpecificAcceptedJob, Validateotp, UploadWorkImg, loadingactivity } = useContext(HomeContext);

    const [selectedImage, setselectedImage] = useState('');
    const [work_picture, setwork_picture] = useState('');
    const [showModal, setshowModal] = useState(false);
    const [Otp, setOtp] = useState('');


    const handleImgupload = () => {
        let options = {
            mediaType: 'photo',
            cameraType: 'back',
            saveToPhotos: true,
        };
        launchCamera(options, (res) => {
            if (res?.didCancel) {
                Toast.show({
                    type: 'error',
                    text1: 'Someting went wrong',
                    position: 'top',
                });
            }
            else if (res?.errorCode) {
                Toast.show({
                    type: 'error',
                    text1: res?.errorMessage,
                    position: 'top',
                });
            }
            else {
                const uri = res?.assets[0];

                setselectedImage(uri);
            }
        });
    }

    // submitting otp 
    const handleVerifyOtp = async () => {


        const res = await Validateotp(SpecificAcceptedJob?.id, Otp);
        
        setshowModal(false)
        if (res) {
            navigation?.navigate('Success', { amount: SpecificAcceptedJob?.mechanic_fees })
        }
    }

    // uploading imge and if it is succesfull then show otp modal
    const handleImgUpload = async () => {
        console.log(selectedImage)
        const res = await UploadWorkImg(selectedImage, SpecificAcceptedJob?.id);
        if (res) {
            setshowModal(true)
        }
    }

    return (
        <View style={[styles.container, { flex: 1 }]}>
            {/* Main content area */}
            <View style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.subcontainer}>
                    <View style={styles.CardTextflex}>
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
                            <Text style={{ ...styles.txt20bold }}>Job ({SpecificAcceptedJob?.order_details?.order_code})</Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>
                    <View style={{
                        ...styles.divider, marginBottom: 0
                    }} />
                </View>


                {/*  Job description card */}
                <View style={[styles.subcontainer, { flex: 1 }]}>
                    <View style={styles.card}>
                        <Text style={styles.txt14}>Job ID ({SpecificAcceptedJob?.order_details?.order_code})</Text>
                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                            <Text style={{ ...styles.txt14bold, color: 'red' }}>Issue:</Text>
                            <Text style={{ ...styles.txt14, color: 'red' }}>{SpecificAcceptedJob?.notes}</Text>

                        </View>
                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>

                            <Text style={styles.txt14bold}>Product:</Text>
                            <Text style={styles.txt14}>{SpecificAcceptedJob?.variant_name}</Text>

                        </View>
                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                            <Text style={styles.txt14bold}>Customer Name:</Text>
                            <Text style={styles.txt14}>{SpecificAcceptedJob?.order_details?.customer_details?.full_name}</Text>

                        </View>
                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                            <Text style={styles.txt14bold}>Mobile Number:</Text>
                            <Text style={styles.txt14}>{SpecificAcceptedJob?.order_details?.customer_details?.phone_number}</Text>

                        </View>
                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                            <Text style={{ ...styles.txt14bold, alignSelf: 'flex-start' }}>Location:</Text>
                            <View >
                                <Text style={styles.txt14} >{SpecificAcceptedJob?.order_details?.shipping_address_details?.street_address}, {SpecificAcceptedJob?.order_details?.shipping_address_details?.city}, {SpecificAcceptedJob?.order_details?.shipping_address_details?.postal_code}, {SpecificAcceptedJob?.order_details?.shipping_address_details?.state}</Text>
                                {/* <TouchableOpacity activeOpacity={0.7} >
                                        <Text style={{ ...styles.txt14, color: Colors.btnColors.primary, textDecorationLine: 'underline' }}>Google Map</Text>
                                    </TouchableOpacity> */}
                            </View>

                        </View>
                        <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start' }}>
                            <Text style={styles.txt14bold}>Estimate Payment:</Text>
                            <Text style={{ ...styles.txt14, color: 'green' }}>₹{SpecificAcceptedJob?.mechanic_fees}</Text>

                        </View>
                    </View>
                    <Text style={{ ...styles.txt18bold, marginVertical: 10 }}>Upload work picture</Text>

                    <TouchableOpacity style={{ ...styles.card, minHeight: 200, alignItems: 'center', justifyContent: 'center' }} onPress={handleImgupload}>

                        {
                            selectedImage || work_picture ?
                                <Image
                                    source={
                                        selectedImage
                                            ? { uri: selectedImage.uri } // Show new image if selected
                                            : { uri: `${serverurl}${work_picture}` }
                                    }
                                    resizeMode="contain"
                                    style={{
                                        width: '100%',
                                        height: 450,
                                    }}
                                />
                                :
                                <IO
                                    name='camera'
                                    size={responsiveFontSize(6)}
                                    color={'black'}
                                />
                        }
                    </TouchableOpacity>
                </View>
            </View>

            {/* Sticked Bottom Text */}
            <View style={{
                padding: 20,
            }}>

                <View style={styles.CardTextflex}>
                    <CommonBtn height={40} title={'Submit'} textColor={'white'} bgcolor={selectedImage ? Colors?.btnColors?.primary : 'grey'} disable={selectedImage ? false : true} onpress={() => handleImgUpload()} />


                </View>
            </View>

            <OTPModal
                visible={showModal}
                onClose={() => setshowModal(false)}
                onVerify={() => handleVerifyOtp()}
                setOtp={setOtp}

            />
        </View>
    )
}


export default JobPictureUpload