import React, { createContext, useState, useEffect, useRef } from 'react';
import {
    Alert,
    ToastAndroid,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect, useDispatch } from 'react-redux';
import {
    postGoogle,
    postUser,
    postAuth,
    postFormdatatAuth,
    postCommon,
    postFormdataCommon,
    GetAuth,
    patchFormdatatAuth,
} from '../repository/Repo';
import { useNavigation } from '@react-navigation/native';
import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
const HomeContext = createContext();

const HomeProvider = ({ children }) => {
    GoogleSignin.configure({
        webClientId:
            Platform.OS === 'android'
                ? '818269488302-dtlg2i8ovjm6fshrv8mgo7295hrpqie0.apps.googleusercontent.com'
                : '938179568180-09ded7cdlun4nll6ldpb803j6ncskt2h.apps.googleusercontent.com',
        offlineAccess: true,
    });

    const navigation = useNavigation();
    const dispatch = useDispatch();

    const [loggedIn, setloggedIn] = useState(false);
    const [loadingactivity, setloadingactivity] = useState(false);
    const [HasNext, setHasNext] = useState(false);
    const [mechanic_Jobs, setmechanic_Jobs] = useState([]);
    const [SpecificAcceptedJob, setSpecificAcceptedJob] = useState({});
    const [ValidatedOtp_data, setValidatedOtp_data] = useState(null);
    const [statistics, setstatistics] = useState({})
    const [notificationLoading, setnotificationLoading] = useState(false);
    const [notifications, setnotifications] = useState([]);


    const UpdateDetails = async (id, pincode, experience, vehicleType, idproof, document, address) => {
        setloadingactivity(true);
        console.log(id)
        try {
            const formData = new FormData();

            // Add product details
            formData.append('years_of_experience', experience);
            formData.append('base_postal_code', pincode);
            formData.append('specialization', vehicleType);
            formData.append('uploaded_documents_type', idproof);
            formData.append('base_address', address);
            if (document !== null) {
                formData.append('uploaded_documents', document);
            }

            const res = await patchFormdatatAuth(`mechanic/profile/${id}/edit`, formData);
            console.log('res>>', res);

            if (res?.status === true) {

                AsyncStorage.setItem('@userdetails', JSON.stringify(res?.data?.user));

                dispatch({
                    type: 'SET_USER_DATA',
                    payload: res?.data?.user,
                });
                Toast.show({
                    type: 'success',
                    text1: res?.message,
                    position: 'top',
                });
                setloadingactivity(false);
            } else {
                console.log('errr');
                Toast.show({
                    type: 'error',
                    text1: res?.data?.details,
                    position: 'top',
                });
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    };
    const UpdateProfile = async (first_name, last_name, phone_number, country_code, profile_picture) => {
        console.log("pp", profile_picture)
        setloadingactivity(true);

        try {
            const formData = new FormData();


            formData.append('first_name', first_name);
            formData.append('last_name', last_name);
            formData.append('phone_number', phone_number);
            formData.append('country_code', country_code);
            if (profile_picture !== null) {
                formData.append('profile_picture', profile_picture);
            }

            const res = await patchFormdatatAuth(`profile/update`, formData);
            console.log('UpdateProfiles>>', res);

            if (res?.status === true) {

                AsyncStorage.setItem('@userdetails', JSON.stringify(res?.data?.user));

                dispatch({
                    type: 'SET_USER_DATA',
                    payload: res?.data?.user,
                });
                setloadingactivity(false);
                console.log('succ');
            } else {
                console.log('errr');
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
    };
    const GetJobs = async (offset) => {
        setloadingactivity(true);
        try {
            var body = {
                limit: 10,
                offset: offset,

            };
            const res = await postAuth("mechanic/jobs/view", body);
            console.log("GetJobs>>", res)

            if (res?.data?.status == 'success') {
                setmechanic_Jobs((prevData) => offset === 0 ? res?.data?.jobs : [...prevData, ...res?.data?.jobs]);
                setHasNext(res?.data?.has_next);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const AcceptJob = async (JobId) => {
        setloadingactivity(true);
        try {
            var body = {
            };
            const res = await postAuth(`mechanic/job/${JobId}/accept`, body);
            console.log("AcceptJob>>", res)

            if (res?.data?.status == 'success') {

                Toast.show({
                    type: 'success',
                    text1: res?.message,
                    position: 'top',
                });
                setSpecificAcceptedJob(res?.data?.job)
                setloadingactivity(false);
                return true
            } else {
                Toast.show({
                    type: 'error',
                    text1: res?.message,
                    position: 'top',
                });
                setloadingactivity(false);
                return false
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const DeclineJob = async (JobId, msg) => {
        setloadingactivity(true);
        try {
            var body = {
                decline_reason: msg
            };
            const res = await postAuth(`mechanic/job/${JobId}/decline`, body);
            console.log("AcceptJob>>", res)

            if (res?.data?.status == 'success') {

                Toast.show({
                    type: 'success',
                    text1: res?.message,
                    position: 'top',
                });

                setloadingactivity(false);
                return true
            } else {
                Toast.show({
                    type: 'error',
                    text1: res?.message,
                    position: 'top',
                });
                setloadingactivity(false);
                return false
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const Validateotp = async (JobId, otp) => {
        setloadingactivity(true);
        try {
            var body = {
                otp
            };
            const res = await postAuth(`mechanic/job/${JobId}/complete-with-otp`, body);
            console.log("Validateotp>>", res)

            if (res?.data?.status == 'success') {
                // setValidatedOtp_data(res?.data?.job)
                Toast.show({
                    type: 'success',
                    text1: res?.message,
                    position: 'top',
                });

                setloadingactivity(false);
                return res?.status
            } else {
                Toast.show({
                    type: 'error',
                    text1: res?.message,
                    position: 'top',
                });
                setloadingactivity(false);
                return false
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const JobStart = async (JobId) => {
        setloadingactivity(true);
        try {
            var body = {
            };
            const res = await postAuth(`mechanic/job/${JobId}/start`, body);
            console.log("JobStart>>", res)

            if (res?.data?.status == 'success') {

                Toast.show({
                    type: 'success',
                    text1: res?.message,
                    position: 'top',
                });
                setSpecificAcceptedJob(res?.data?.job)
                setloadingactivity(false);
                return true
            } else {
                Toast.show({
                    type: 'error',
                    text1: res?.message,
                    position: 'top',
                });
                setloadingactivity(false);
                return false
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const GetStatistics = async () => {
        setloadingactivity(true);
        try {

            const res = await GetAuth("mechanic/statistics");
            console.log("GetStatistics>>", res)

            if (res?.status == true) {
                setstatistics(res?.data);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            console.log("GetStatistics>>", e)
            setloadingactivity(false);
        }
    }
    const fetchNotifications = async () => {
        setnotificationLoading(true)
        try {
            const res = await postAuth("mechanic/notifications");
            console.log("fetchNotifications", res)
            if (res?.data?.status == 'success') {
                const notifications = res?.data?.notifications;

                // Set the notifications in state
                setnotifications(notifications);

                // Calculate the unread count
                const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

                // Store the unread count in a state or context (add state if not present)
                dispatch({
                    type: 'SET_NOTIFCATION_COUNT',
                    payload: unreadCount,
                });
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
            const res = await postAuth("mechanic/notifications/mark-all-read");
            if (res?.data?.status == 'success') {
                dispatch({
                    type: 'SET_NOTIFCATION_COUNT',
                    payload: 0,
                });
            }

        } catch (error) {
            console.log(error)
        } finally {

        }
    };
    const ReportSubmit = async (msg, type) => {
        setloadingactivity(true);
        try {
            var body = {
                text_content: msg,
                text_type: type,
            };
            const res = await postAuth('mechanic/report', body);
            console.log(res)
            if (res?.status === true) {
                Toast.show({
                    type: 'success',
                    text1: res?.message,
                    position: 'bottom',
                });
                setloadingactivity(false);
                return 'success';
            } else {
                Toast.show({
                    type: 'error',
                    text1: res?.message,
                    position: 'bottom',
                });
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    };
    const UploadWorkImg = async (img, jobid) => {
        setloadingactivity(true);
        try {

            const formData = new FormData()

            formData.append('image', {
                uri: img.uri,
                type: img.type,
                name: img.fileName,
            })
            const res = await postFormdatatAuth(`mechanic/job/${jobid}/upload-images`, formData);
            console.log(res)
            if (res?.status === true) {
                Toast.show({
                    type: 'success',
                    text1: res?.message,
                    position: 'bottom',
                });
                setloadingactivity(false);
                return res?.status;
            } else {
                Toast.show({
                    type: 'error',
                    text1: res?.message,
                    position: 'bottom',
                });
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    };
    const RazorpayInitiate = async (fee_amount) => {
        setloadingactivity(true);
        try {
            var body = {
                fee_amount
            };

            const res = await postAuth("mechanic/fee-payment/create", body);
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

            const res = await postAuth("mechanic/fee-payment/callback", body);
            console.log("RazorpayCallback>>", res)
            await AsyncStorage.setItem(
                '@userdetails',
                JSON.stringify(res?.data.user),
            );
            if (res?.data?.status == 'success') {
                dispatch({
                    type: 'SET_USER_DATA',
                    payload: res?.data?.user,
                });
                setloadingactivity(false);
                return res?.data
            } else {
                setloadingactivity(false);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const GetUserProfile = async () => {

        try {

            const res = await GetAuth("profile");

            await AsyncStorage.setItem(
                '@userdetails',
                JSON.stringify(res?.data.user),
            );
            if (res?.status == true) {
                dispatch({
                    type: 'SET_USER_DATA',
                    payload: res?.data?.user,
                });

            } else {

            }
        } catch (e) {
            console.log("GetUserProfile>>", e)

        }
    }
    return (
        <HomeContext.Provider
            value={{

                UpdateDetails,
                loadingactivity,
                UpdateProfile,
                GetJobs,
                mechanic_Jobs,
                setmechanic_Jobs,
                HasNext,
                AcceptJob,
                setSpecificAcceptedJob,
                SpecificAcceptedJob,
                Validateotp,
                setValidatedOtp_data,
                ValidatedOtp_data,

                GetStatistics,
                statistics,
                fetchNotifications,
                notifications,
                NotificationRead,
                notificationLoading,
                ReportSubmit,
                DeclineJob,
                UploadWorkImg,
                JobStart,
                RazorpayInitiate,
                RazorpayCallback,
                GetUserProfile
            }}
        >
            {children}
        </HomeContext.Provider>
    );
};
export { HomeProvider, HomeContext };