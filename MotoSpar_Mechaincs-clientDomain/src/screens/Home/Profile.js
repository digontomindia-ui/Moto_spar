import { View, Text, Image, TouchableOpacity, Modal } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { styles } from '../../assets/Css/ProfileCss'
import { SERVER_URL } from '../../constants/SERVER_URL'
import { useSelector } from 'react-redux'
import CommonBtn from '../../components/HOC/CommonBtn'
import Colors from '../../constants/Colors'
import { ScrollView } from 'react-native-gesture-handler'
import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize } from 'react-native-responsive-dimensions'
import StarRating from '../../components/HOC/StarRating'
import { useNavigation } from '@react-navigation/native'
import { pick, types } from '@react-native-documents/picker'
import { HomeContext } from '../../context/HomeContext'
import Loading from '../../components/HOC/Loading'
const Profile = () => {
    const navigation = useNavigation()
    const user = useSelector(state => state.userData);
    const {
        GetStatistics, statistics,
        UpdateProfile,
        loadingactivity,
    } = useContext(HomeContext);
    const [profile_picture, setProfilePicture] = useState(user?.profile_picture); // Original Image from API
    const [selectedImage, setSelectedImage] = useState(null); // New Image picked by user
    const [serverurl, setserverurl] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    useEffect(() => {
        const fetchServerUrl = async () => {
            try {
                const url = await SERVER_URL(); // Assuming SERVER_URL returns a string
                setserverurl(url);
            } catch (error) {
                console.error('Error fetching server URL:', error);
            }
        };
        GetStatistics()
        fetchServerUrl();
    }, [])
    const handlePick = async () => {
        try {
            const result = await pick({
                type: [types.images],
                allowMultiSelection: false,
            });

            const file = result[0];
            setSelectedImage(result[0])
            // for only updating the profile picture 
            await UpdateProfile(user?.first_name, user?.last_name, user?.phone_number, user?.country_code, file)
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
    return (
        <View style={styles.container}>
            <View style={styles.subcontainer}>
                <View style={{ ...styles.header, marginTop: 10 }}>
                    <Text style={styles.txt20bold}>Profile</Text>
                </View>
                <View style={styles.divider} />
                <ScrollView>
                    <View style={styles.ProfileImgView}>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => handlePick()}>
                            <Image
                                source={
                                    selectedImage
                                        ? { uri: selectedImage.uri } // Show new image if selected
                                        : profile_picture
                                            ? { uri: `${serverurl}${profile_picture}` } // Show existing image from API
                                            : require('../../assets/images/profile.png') // Default image
                                }
                                resizeMode="cover"
                                style={styles.ProfileImg}
                            />
                        </TouchableOpacity>
                        <View>
                            <CommonBtn width={25} height={30} title={'Edit Profile'} bgcolor={Colors.background.secondary} onpress={() => navigation.navigate('EditProfile')} />

                        </View>

                    </View>
                    <View style={{ ...styles.divider, marginVertical: 5 }} />
                    <View style={{ ...styles.CardTextflex, paddingHorizontal: 20, gap: 20, marginTop: 20 }}>
                        <View>
                            <Text style={styles.txt16bold}>Name</Text>
                        </View>
                        <View style={{ width: '60%', alignItems: 'flex-end' }}>
                            <Text style={styles.txt16}>{user?.full_name}</Text>
                        </View>
                    </View>
                    <View style={{ ...styles.CardTextflex, paddingHorizontal: 20, gap: 20 }}>
                        <View>
                            <Text style={styles.txt16bold}>Email</Text>
                        </View>
                        <View style={{ width: '60%', alignItems: 'flex-end' }}>
                            <Text style={styles.txt16}>{user?.email}</Text>
                        </View>
                    </View>
                    <View style={{ ...styles.CardTextflex, paddingHorizontal: 20, gap: 20 }}>
                        <View>
                            <Text style={styles.txt16bold}>Mobile No.</Text>
                        </View>
                        <View style={{ width: '60%', alignItems: 'flex-end' }}>
                            <Text style={styles.txt16}>{user?.phone_number}</Text>
                        </View>
                    </View>
                    <View style={{ ...styles.CardTextflex, paddingHorizontal: 20, gap: 20 }}>
                        <View>
                            <Text style={styles.txt16bold}>Experience</Text>
                        </View>
                        <View style={{ width: '60%', alignItems: 'flex-end' }}>
                            <Text style={styles.txt16}>
                                {user?.mechanic_profile?.years_of_experience != null
                                    ? `${user.mechanic_profile.years_of_experience} ${user.mechanic_profile.years_of_experience === 1 ? 'year' : 'years'
                                    }`
                                    : 'N/A'}
                            </Text>
                        </View>
                    </View>
                    <View style={{ ...styles.CardTextflex, paddingHorizontal: 20, gap: 20 }}>
                        <View>
                            <Text style={styles.txt16bold}>Address</Text>
                        </View>
                        <View style={{ width: '60%', alignItems: 'flex-end' }}>
                            <Text style={styles.txt16}>{user?.mechanic_profile?.base_address || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={{ ...styles.CardTextflex, marginVertical: 10, paddingHorizontal: 20, gap: 20 }}>
                        <View>
                            <Text style={{ ...styles.txt16bold, }}>Specializations</Text>
                        </View>
                        <View style={{ width: '50%', alignItems: 'flex-end' }}>
                            <Text style={styles.txt16}>{user?.mechanic_profile?.specialization || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />
                    <View style={{ paddingHorizontal: 20, }}>
                        <Text style={{ ...styles.txt16bold, }}>ID Proof :</Text>
                    </View>
                    <View style={{ ...styles.CardTextflex, marginVertical: 10, paddingHorizontal: 20, gap: 20 }}>
                        <View>
                            <Text style={{ ...styles.txt16, }}>ID Type</Text>
                        </View>
                        <View style={{ width: '50%', alignItems: 'flex-end' }}>
                            <Text style={styles.txt16}>{user?.mechanic_profile?.uploaded_documents_type || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={{ ...styles.CardTextflex, marginVertical: 0, paddingHorizontal: 20, gap: 20 }}>
                        <View>
                            <Text style={{ ...styles.txt16, }}>Document</Text>
                        </View>
                        <TouchableOpacity style={{ width: '60%', alignItems: 'flex-end', }} onPress={() => {
                            user?.mechanic_profile?.uploaded_documents ?
                                setModalVisible(true) :
                                ''
                        }} >
                            <Text style={{ ...styles.txt16, color: Colors.btnColors.primary, textDecorationLine: 'underline' }} numberOfLines={1}>{`[${user?.mechanic_profile?.uploaded_documents ? user?.mechanic_profile?.uploaded_documents?.split("/").pop() : 'N/A'}]` || 'N/A'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />
                    <View style={{ ...styles.CardTextflex, marginVertical: 0, paddingHorizontal: 20, gap: 20 }}>
                        <View>
                            <Text style={{ ...styles.txt16, }}>Customer Rating :</Text>
                        </View>
                        <View style={{ width: '50%', alignItems: 'flex-end' }}>
                            <StarRating rating={statistics?.average_rating} iconsize={2.5} />
                        </View>
                    </View>
                    {/* Modal for document preview */}
                    <Modal
                        visible={modalVisible}
                        transparent={true}
                        onRequestClose={() => setModalVisible(false)}
                    >

                        <View style={styles.modalOverlay}>

                            {/* <View style={styles.modalContent}> */}
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{
                                alignSelf: 'flex-end',
                                margin: 10
                            }}>
                                <IO
                                    name='close-outline'
                                    size={responsiveFontSize(4)}
                                    color={'white'}
                                />
                            </TouchableOpacity>
                            {user?.mechanic_profile?.uploaded_documents && (
                                <Image
                                    source={{ uri: `${serverurl}${user?.mechanic_profile?.uploaded_documents}` }}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            )}

                            {/* </View> */}
                        </View>
                    </Modal>
                </ScrollView>
                {loadingactivity ? <Loading /> : null}
            </View>

        </View>
    )
}

export default Profile