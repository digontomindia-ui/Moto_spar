import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import Header from '../../../components/HOC/Header'
import { styles } from '../../../assets/Css/OrderCss';
import OrderStatus from '../../../components/HOC/OrderStatus';
import { Textinputname } from '../../../components/HOC/Textinput';
import Colors from '../../../constants/Colors';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CommonBtn from '../../../components/HOC/CommonBtn';
import { Picker } from '@react-native-picker/picker';
import Ion from 'react-native-vector-icons/Ionicons'
import ImageCropPicker from 'react-native-image-crop-picker';
import { HomeContext } from '../../../context/HomeContext';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
const StatusScreen = ({ route }) => {
    const navigation = useNavigation();
    const item = route.params.item;
    const user = useSelector(state => state.userData);
    const { DeleteCommon, AddReview, message, userReviews, setuserReviews, GetReviews } = useContext(HomeContext)
    const [rating, setRating] = useState(0); // State to store the selected rating
    const [isEditable, setIsEditable] = useState(true);
    const [title, settitle] = useState('');
    const [body, setbody] = useState('');
    const [reviewImages, setreviewImages] = useState([]);
    const [reviewId, setreviewId] = useState('')
    const [offset, setoffset] = useState(0);
    const maxLength_title = 40;
    const calculateDeliveryDate = (deliveryDays) => {
        // Get the current date
        const currentDate = new Date(item?.created_at);

        // Add the number of delivery days to the current date
        currentDate.setDate(currentDate.getDate() + deliveryDays);

        // Format the date into a readable string (e.g., "Dec 5, 2024")
        const deliveryDate = currentDate.toLocaleDateString('en-US', {
            //   year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

        return deliveryDate;
    };
    // handling the picking of images
    const handlePickImage = async () => {
        try {
            const response = await ImageCropPicker.openPicker({
                multiple: true, // Allow multiple image selection
                includeBase64: true, // Include Base64 if required for your backend
                mediaType: 'photo', // Ensure only photos are selected
            });

            if (response && response.length > 0) {
                setreviewImages(response); // Store the selected images in a state
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Something went wrong',
                text2: error || 'Please try again.',
                position: 'bottom',
            });

        }
    }
    // handle rating of star
    const handleStarPress = (value) => {
        if (isEditable) {
            setRating(value); // Update rating only if editing is allowed
        }
    };


    const handleSubmit = async () => {
        await AddReview(item?.variant_details?.product, user?.id, rating, title, body, reviewImages);
        navigation.navigate('SuccessScreen', { status: 'success', review: true })

    }
    const handleDelete = async () => {

        await DeleteCommon(`reviews/${reviewId}/delete`);
        setRating(0);
        settitle('');
        setbody('');
        setreviewImages([]);
        Toast.show({
            type: 'success',
            text1: 'Review Deleted Successfully',
            position: 'bottom'
        });

    }
    const deliveryDate = calculateDeliveryDate(item?.product?.delivery_time);
    const deliveryUpdate = item?.last_modified_at
        ? new Date(item?.last_modified_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
        : 'Unknown';
    useEffect(() => {
        setuserReviews([]);
        GetReviews(item?.product?.id, offset)
    }, [offset]);
    useEffect(() => {
        // Check if the user has reviewed the product
        if (userReviews && Array.isArray(userReviews)) {
            const userReview = userReviews.find(review => review.is_reviewed_by_user === true);

            if (userReview) {
                setRating(userReview.rating || 0);
                settitle(userReview.title || '');
                setbody(userReview.body || '');
                setreviewImages(userReview?.images || []);
                setreviewId(userReview?.id)
                // Assuming the review is not editable once posted
                // You can update reviewImages if the API includes them in the response
                // Example: setReviewImages(userReview.images || []);
            }
        }
    }, [userReviews]);
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Header screenName={'Order Detail'} backIcon={true} navigateTo={'AllOrders'} />
            <View style={styles.topBar}>
                <Text style={styles.txtverybigbold}>
                    {item?.order_status === 'DELIVERED'
                        ? `Delivered on ${deliveryUpdate}`
                        : item?.order_status === 'CANCELLED' ?
                            'Order Cancelled' : `Deliver by ${deliveryDate}`}
                </Text>
            </View>
            <View style={styles.subcontainer}>
                <View style={styles.ordercontainer}>

                    <View style={styles.Productcard} >
                        <View style={styles.imgCard}>
                            <Image
                                source={item?.variant_details?.images[0]
                                    ? { uri: `https://api.motospar.com${item?.variant_details?.images[0]?.image}` }
                                    : require('../../../assets/images/Logo.png')}
                                style={styles.productImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={{ width: '55%' }}>
                            <Text style={styles.txtsmallbold} numberOfLines={1}>{item?.product?.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveFontSize(1) }}>
                                <Text style={styles.txtsmall}>Size: {item?.variant_details?.size}</Text>
                                <Text style={styles.txtsmallbold}>Qty: {item?.quantity}</Text>
                            </View>
                            <View style={{ marginVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Text style={styles.txtnormalbold}>₹{item?.price * item?.quantity}</Text>
                                <Text style={styles.txtpricecut}>₹{item?.variant_details?.price * item?.quantity}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {/* <View style={styles.smallCapsule}>
                                    <Text style={styles.txtsmallbold}>Qty: {item?.quantity}</Text>
                                </View> */}
                            </View>
                        </View>
                    </View>
                    <View style={styles.space}>
                        <Text style={styles.txtmediumbold}>Order Status</Text>
                    </View>
                    <OrderStatus orderStatus={item?.order_status} deliveryDays={item?.product?.delivery_time} ordercreated={item?.created_at} deliveryUpdated={item?.last_modified_at} />
                </View>
                {
                    item?.order_status === 'DELIVERED' ?
                        <View style={styles.ordercontainer}>
                            <View style={styles.space}>
                                <Text style={styles.txtmediumbold}>Rate/Review your experience</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                                <View>
                                    <View style={styles.starsContainer}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <TouchableOpacity
                                                key={star}
                                                onPress={() => handleStarPress(star)}
                                                activeOpacity={0.7}
                                            >
                                                <Text
                                                    style={[
                                                        styles.star,
                                                        { color: star <= rating ? "#FFD700" : "#C0C0C0" }, // Change color based on rating
                                                    ]}
                                                >
                                                    ★
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <Text style={styles.selectedRating}>
                                        {rating > 0 ? `You rated this ${rating} out of 5  ${rating == 1 ? '· Very Bad' : rating == 2 ? '· Bad' : rating == 3 ? '· Good' : rating == 4 ? '· Very Good' : '· Excellent'}` : "No rated yet"}
                                    </Text>

                                </View>
                                <TouchableOpacity activeOpacity={0.6} onPress={handlePickImage}>
                                    <Ion name="images-outline" size={responsiveFontSize(5)} />
                                </TouchableOpacity>
                            </View>
                            {reviewImages.length > 0 && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={{ marginTop: 10 }}
                                    contentContainerStyle={{ paddingHorizontal: 10 }}
                                >
                                    {reviewImages.map((image, index) => (
                                        <Image
                                            key={index}
                                            source={
                                                userReviews.length > 0
                                                    ? { uri: image?.image }
                                                    : { uri: image?.path }
                                            }
                                            style={{
                                                width: responsiveWidth(20),
                                                height: responsiveWidth(20),
                                                borderRadius: 10,
                                                marginRight: 10,
                                            }}
                                            resizeMode="cover"
                                        />
                                    ))}
                                </ScrollView>
                            )}
                            <View>

                                <Textinputname placeholder={'How was the Product'}
                                    customWidth={true}
                                    bgcolor={Colors.textInputColors.secondary}
                                    maxlength={maxLength_title}
                                    value={title}
                                    onChangeText={settitle}

                                />

                                <Text style={{ ...styles.txtverysmall, textAlign: 'right' }} >
                                    {title.length}/{maxLength_title}
                                </Text>

                            </View>
                            <Textinputname placeholder={'How was your experience'}
                                customWidth={true}
                                bgcolor={Colors.textInputColors.secondary}
                                height={responsiveHeight(15)}
                                value={body}
                                onChangeText={setbody}
                                multiline={true}

                            />
                            <View style={styles.spacewide}>
                                {
                                    userReviews.length > 0 ?
                                        <CommonBtn title={'Delete Review'} height={responsiveHeight(0.5)} onpress={() => handleDelete()} bgcolor={'red'} />
                                        :
                                        <CommonBtn title={'Submit'} height={responsiveHeight(0.5)} onpress={() => handleSubmit()} />
                                }
                            </View>
                        </View> :
                        null
                }
            </View>

        </ScrollView>

    )
}

export default StatusScreen