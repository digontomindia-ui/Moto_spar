import { View, Text } from 'react-native'
import React, { createContext, useState } from 'react'
import { DelteAuth, GetAuth, GetCommon, patchAuth, patchFormdatatAuth, postAuth, postFormdatatAuth, postUser } from '../repository/Repo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';

const HomeContext = createContext();
const HomeProvider = ({ children }) => {
    const dispatch = useDispatch();
    const [loadingactivity, setloadingactivity] = useState(false);
    const [notificationLoading, setnotificationLoading] = useState(false);
    const [notifications, setnotifications] = useState([]);
    const [UnreadCount, setUnreadCount] = useState(0)
    const [Products, setProducts] = useState([]);
    const [ProductSuggestions, setProductSuggestions] = useState([]);
    const [carProducts, setcarProducts] = useState([]);
    const [bikeProducts, setbikeProducts] = useState([]);
    const [carSubCategory, setcarSubCategory] = useState([]);
    const [bikeSubCategory, setbikeSubCategory] = useState([]);
    const [HasNext, setHasNext] = useState(false);
    const [specificProduct, setspecificProduct] = useState('');
    const [specificWishlist, setspecificWishlist] = useState(null);
    const [message, setmessage] = useState('')
    const [cartProduct, setcartProduct] = useState({});
    const [shippingAddress, setshippingAddress] = useState([]);
    const [finalPrice, setfinalPrice] = useState(0);
    const [orderAddress, setorderAddress] = useState('');
    const [singleOrderQty, setsingleOrderQty] = useState(1)
    const [orderBillAddress, setorderBillAddress] = useState('');
    const [userOrders, setuserOrders] = useState([]);
    const [userWishlist, setuserWishlist] = useState([]);
    const [userReviews, setuserReviews] = useState([]);
    const [specificOrder, setspecificOrder] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const AllProduct = async (offset, categoryId, type, subCategoryId, brand, model, year) => {
        setloadingactivity(true);
        try {
            var body = {
                limit: 15,
                offset: offset,
                category_id: categoryId ? categoryId : "",
                sub_category_id: subCategoryId ? subCategoryId : "",
                brand: brand ? brand : '',
                model: model ? model : '',
                year: year ? year : ''
            };

            const res = await postAuth("products/search", body);

            if (res?.data?.status == 'success') {
                // dispatch({
                //     type: "SET_USER_DATA",
                //     payload: res?.data?.products,
                // });
                if (type === 'Car') {
                    setcarProducts((prevData) => offset === 0 ? res?.data?.products : [...prevData, ...res?.data?.products])
                } else if (type === 'Bike') {
                    setbikeProducts((prevData) => offset === 0 ? res?.data?.products : [...prevData, ...res?.data?.products])
                }
                else {
                    { subCategoryId ? setProductSuggestions((prevData) => offset === 0 ? res?.data?.products : [...prevData, ...res?.data?.products]) : setProducts((prevData) => offset === 0 ? res?.data?.products : [...prevData, ...res?.data?.products]); }
                }
                // setTotalCount(res?.data?.total_count);
                // setPageCount(res?.data?.page_count);
                setHasNext(res?.data?.has_next);
                // setCurrentPage(res?.data?.current_page);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    };
    const AddToCart = async (variant, quantity, price_at_addition, delivery_charge, mechanic_fees, driver_fees, cart) => {
        setloadingactivity(true);
        try {
            var body = {
                variant,
                quantity,
                price_at_addition,
                delivery_charge,
                ...(mechanic_fees && { mechanic_fees }),
                ...(driver_fees && { driver_fees }),
            };

            const res = await postAuth("customer/cart/add", body);

            if (res?.data?.status == 'success') {

                setmessage(res?.message)
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }

    const EditCart = async (quantity, price_at_addition, cartid, mechanic_fees, driver_fees) => {
        setloadingactivity(true);
        try {
            var body = {
                ...(quantity !== undefined && { quantity }),
                ...(price_at_addition !== undefined && { price_at_addition }),
                ...(mechanic_fees !== undefined && { mechanic_fees }),
                ...(driver_fees !== undefined && { driver_fees }),
            };
            const res = await patchAuth(`customer/cart/${cartid}/edit`, body);

            if (res?.data?.status == 'success') {
                setmessage(res?.message)
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const GetCartItem = async () => {
        setloadingactivity(true);
        try {

            const res = await GetAuth("customer/cart/view",);
            if (res?.data?.status == 'success') {
                setcartProduct(res?.data?.cart_item)
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const DeleteCartItem = async (cartId) => {
        setloadingactivity(true);
        try {
            const res = await DelteAuth(`customer/cart/${cartId}/delete`);

            if (res?.data?.status == 'success') {
                setmessage(res?.message)
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const AddShippingaddress = async (user, name, email, phone_number, street_address, state, city, postal_code, address_type, latitude, longitude, alternate_phone_number,) => {
        setloadingactivity(true);
        try {
            var body = {
                user,
                name,
                email,
                phone_number,
                alternate_phone_number: alternate_phone_number ? alternate_phone_number : "",
                street_address,
                state,
                city,
                postal_code,
                address_type,
                latitude,
                longitude
            };

            const res = await postAuth("customer/shipping-address/add", body);
            if (res?.data?.status == 'success') {
                setmessage(res?.message)
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const GetShippingAddress = async () => {
        // setloadingactivity(true);
        try {
            const res = await GetAuth("customer/shipping-address/view",);
            if (res?.data?.status == 'success') {
                setshippingAddress(res?.data?.shipping_addresses)
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const PlaceOrder = async (shipping_address, payment_method, billing_address) => {
        setloadingactivity(true);
        try {
            var body = {
                shipping_address,
                payment_method,
                billing_address: billing_address ? billing_address : ''
            };

            const res = await postAuth("customer/order/create-from-cart", body);
            if (res && res.data && res.data.status === 'success') {
                setmessage(res.data.message);
                setloadingactivity(false);
                return res.data;
            } else {
                setloadingactivity(false);
            }

        } catch (e) {
            setloadingactivity(false);
        }
    }
    const BuynowOrder = async (shipping_address, payment_method, variantId, qty, delivery_charge, mechanic_fees, driver_fees, billing_address,) => {
        setloadingactivity(true);
        try {
            const order_items = [
                {
                    variant: variantId, // Single variant ID
                    quantity: qty,
                    mechanic_fees     // Corresponding quantity
                }
            ];

            var body = {
                shipping_address,
                payment_method,
                billing_address: billing_address ? billing_address : '',
                order_items,
                delivery_charge,
                driver_fees
            };

            const res = await postAuth("customer/order/create", body);

            if (res && res.data && res.data.status === 'success') {
                setmessage(res.data.message);
                setloadingactivity(false);
                return res.data;
            } else {
                setloadingactivity(false);
            }

        } catch (e) {
            setloadingactivity(false);
        }
    }
    const ToggleWishlist = async (Id) => {
        setloadingactivity(true);
        try {

            const res = await GetAuth(`customer/wishlist/toggle/${Id}`,);

            if (res?.data) {
                setmessage(res?.message)
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const GetOrders = async (offset) => {
        setloadingactivity(true);
        try {
            var body = {
                limit: 10,
                offset: offset,

            };
            const res = await postAuth("customer/orders", body);

            if (res?.data?.status == 'success') {
                setuserOrders((prevData) => offset === 0 ? res?.data?.orders : [...prevData, ...res?.data?.orders]);
                setHasNext(res?.data?.has_next);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const GetWishlist = async (offset) => {
        setloadingactivity(true);
        try {
            var body = {
                limit: 10,
                offset: offset,
            };

            const res = await postAuth("customer/wishlist/items/view", body);

            if (res?.data?.status == 'success') {
                setuserWishlist((prevData) => offset === 0 ? res?.data?.wishlist_items : [...prevData, ...res?.data?.wishlist_items]);
                setHasNext(res?.data?.has_next);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const GetProductDetail = async (Id) => {
        setloadingactivity(true);
        try {

            const res = await GetAuth(`products/${Id}`,);

            if (res?.data?.status == 'success') {
                setspecificProduct(res?.data?.products);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const GetSubCategories = async (Id, type) => {
        setloadingactivity(true);
        try {

            const res = await GetCommon(`sub-categories/${Id}`,);

            if (res?.data?.status == 'success') {
                if (type === 'Car') {
                    setcarSubCategory(res?.data?.subcategories)
                } else if (type === 'Bike') {
                    setbikeSubCategory(res?.data?.subcategories)
                }
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const EditProfile = async (data) => {
        setloadingactivity(true);
        try {
            const formData = new FormData();

            // Add product details
            formData.append("first_name", data?.firstName);
            formData.append("last_name", data?.lastName);
            formData.append("phone_number", data?.mobile);
            formData.append("address", data?.address);
            formData.append("state", data?.state);
            formData.append("postal_code", data?.pincode);
            formData.append("country", data?.country);
            formData.append("bio", data?.bio ? data?.bio : '');
            // formData.append("email", data?.address);
            if (data.profile_picture) {
                formData.append('profile_picture', {
                    uri: data?.profile_picture?.path,
                    name: 'profilePic.jpg',
                    type: data?.profile_picture?.mime,
                });
            }

            const res = await patchFormdatatAuth(`profile/update`, formData);
            console.log(res)
            if (res?.data?.status == "success") {
                AsyncStorage.setItem('@usertoken', res?.data?.access);
                AsyncStorage.setItem('@user_refreshtoken', res?.data?.refresh);
                AsyncStorage.setItem('@userdetails', JSON.stringify(res?.data.user));
                dispatch({
                    type: 'SET_TOKEN',
                    payload: res?.data?.access,
                });
                dispatch({
                    type: 'SET_REFRESHTOKEN',
                    payload: res?.data?.refresh,
                });
                dispatch({
                    type: 'SET_USER_DATA',
                    payload: res?.data?.user,
                });
                dispatch({
                    type: 'SET_LOGGEDIN',
                    payload: true,
                });
                Toast.show({
                    type: 'success',
                    text1: res?.message,
                    position: 'bottom',
                });

                setloadingactivity(false);
            } else {

                Toast.show({
                    type: 'error',
                    text1: res?.data?.details,
                    position: 'bottom',
                });
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const AddReview = async (productId, user, rating, title, body, images) => {
        setloadingactivity(true);
        try {

            const formData = new FormData()
            formData.append('product', productId);
            formData.append('user', user);
            formData.append('rating', parseFloat(rating));
            formData.append('title', title);
            formData.append('body', body);
            if (images && images.length > 0) {
                images?.forEach((item) => {
                    formData.append("images",
                        {
                            uri: item?.path,
                            name: 'reviewImages.jpg',
                            type: item?.mime,
                        }
                    );

                });
            }
            const res = await postFormdatatAuth("customer/reviews/add", formData);

            if (res?.data?.status == 'success') {
                setmessage(res?.message)
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const EditReview = async (data) => {
        setloadingactivity(true);
        try {
            const formData = new FormData();

            formData.append('rating', parseFloat(data?.rating));
            formData.append('title', data?.title);
            formData.append('body', data?.body);

            if (data.images) {
                if (images && images.length > 0) {
                    images?.forEach((item) => {
                        formData.append("images",
                            {
                                uri: item?.path,
                                name: 'reviewImages.jpg',
                                type: item?.mime,
                            }
                        );

                    });
                }
            }

            const res = await patchFormdatatAuth(`reviews/${data?.id}/edit`, formData);

            if (res?.data?.status == "success") {
                setmessage(res?.message)
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const GetReviews = async (productid, offset) => {
        setloadingactivity(true);
        try {
            var body = {
                limit: 10,
                offset: offset,
            };

            const res = await postAuth(`reviews/${productid}/view`, body);

            if (res?.data?.status == 'success') {
                setuserReviews((prevData) => offset === 0 ? res?.data?.reviews : [...prevData, ...res?.data?.reviews]);
                setHasNext(res?.data?.has_next);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const EditShippingAddress = async (
        addId,
        phone_number,
        street_address,
        state,
        city,
        postal_code,
        address_type,
        latitude,
        longitude,
        alternate_phone_number,
    ) => {
        setloadingactivity(true);
        try {
            var body = {
                phone_number,
                alternate_phone_number: alternate_phone_number ? alternate_phone_number : "",
                street_address,
                state,
                city,
                postal_code,
                address_type,
                latitude,
                longitude
            };

            const res = await patchAuth(`customer/shipping-address/${addId}/edit`, body);

            if (res?.data?.status == 'success') {
                setmessage(res?.message)
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const DeleteCommon = async (uri) => {
        setloadingactivity(true);
        try {
            const res = await DelteAuth(uri);

            if (res?.data?.status == 'success') {
                setmessage(res?.message)
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const RazorpayInitiate = async (order_id) => {
        setloadingactivity(true);
        try {
            var body = {
                order_id
            };

            const res = await postAuth("customer/order/payment/razorpay", body);
            if (res?.data?.status == 'success') {
                setloadingactivity(false);
                return res
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const RazorpayCallback = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
        setloadingactivity(true);
        try {
            var body = {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature: razorpay_signature ? razorpay_signature : ''
            };

            const res = await postAuth("customer/order/payment/razorpay/callback", body);

            if (res?.data?.status == 'success') {
                setloadingactivity(false);
                return res?.data
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const fetchNotifications = async () => {
        setnotificationLoading(true)
        try {
            const res = await postAuth("customer/notifications");
            if (res?.data?.status == 'success') {
                const notifications = res?.data?.notifications;

                // Set the notifications in state
                setnotifications(notifications);

                // Calculate the unread count
                const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

                // Store the unread count in a state or context (add state if not present)
                setUnreadCount(unreadCount);

                setnotifications(res?.data?.notifications)
            } else {
                setnotificationLoading(false);
            }

        } catch (error) {
            setnotificationLoading(false);
        } finally {
            setnotificationLoading(false);
        }
    };
    const NotificationRead = async () => {
        try {
            const res = await postAuth("customer/notifications/mark-all-read");
            if (res?.data?.status == 'success') {
            }

        } catch (error) {
            setnotificationLoading(false);
        } finally {
            setnotificationLoading(false);
        }
    };
    const Contact = async (name, email, phone_number, Message) => {
        setloadingactivity(true);
        try {
            var body = {
                name,
                email,
                phone_number,
                message: Message
            };

            const res = await postUser("contact-us", body);

            if (res?.data?.status == 'success') {
                setloadingactivity(false);
                return res?.data?.status
            } else {
                setloadingactivity(false);
                return res?.data?.status
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    return (
        <HomeContext.Provider
            value={{
                AllProduct,
                Products,
                HasNext,
                loadingactivity,
                specificProduct,
                setspecificProduct,
                AddToCart,
                GetCartItem,
                DeleteCartItem,
                EditCart,
                PlaceOrder,
                AddShippingaddress,
                GetShippingAddress,
                shippingAddress,
                cartProduct,
                setfinalPrice,
                finalPrice,
                setorderAddress,
                orderAddress,
                setsingleOrderQty,
                singleOrderQty,
                message,
                ToggleWishlist,
                GetOrders,
                setuserOrders,
                userOrders,
                GetWishlist,
                setuserWishlist,
                userWishlist,
                setspecificWishlist,
                specificWishlist,
                carProducts,
                setcarProducts,
                bikeProducts,
                setbikeProducts,
                GetProductDetail,
                GetSubCategories,
                carSubCategory,
                bikeSubCategory,
                setspecificOrder,
                specificOrder,
                EditProfile,
                AddReview,
                GetReviews,
                userReviews,
                setuserReviews,
                ProductSuggestions,
                EditShippingAddress,
                DeleteCommon,
                setCartCount,
                cartCount,
                BuynowOrder,
                RazorpayInitiate,
                RazorpayCallback,
                fetchNotifications,
                notificationLoading,
                notifications,
                NotificationRead,
                UnreadCount,
                Contact, setloadingactivity
            }}>
            {children}
        </HomeContext.Provider>
    )
}

export { HomeProvider, HomeContext }