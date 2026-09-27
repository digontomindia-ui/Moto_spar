import React, { createContext, useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { postGoogle, postUser, postUserLogout } from "../repository/Repo";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    // GoogleSignin.configure({
    //     webClientId: "818269488302-svso0iqe2cfb53d87s99q2b4h4betkj1.apps.googleusercontent.com",
    //     offlineAccess: true,
    // });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loggedIn, setloggedIn] = useState(false);
    const [loadingactivity, setloadingactivity] = useState(false);
    const [user, setuser] = useState("");
    const [userToken, setuserToken] = useState("");
    // const showAlert = (navigateto,msg) => {
    //  return(
    //   alert(
    //     'Success',
    //     msg,
    //     [
    //       {
    //         text: "Cancel",
    //         style: "cancel"
    //       },
    //       { text: "OK", onPress: () => navigation.navigate(navigateto) }
    //     ]
    //   )
    //  );
    // };
    const isLoggedIn = async () => {
        try {
            let value = localStorage.getItem("usertoken");
            let users = await JSON.parse(localStorage.getItem("userdetails"));
            let refreshToken = localStorage.getItem("user_refreshtoken");
            if (users) {

                dispatch({
                    type: "SET_TOKEN",
                    payload: value,
                });
                dispatch({
                    type: "SET_REFRESHTOKEN",
                    payload: refreshToken,
                });
                dispatch({
                    type: "SET_USER_DATA",
                    payload: users,
                });
                dispatch({
                    type: "SET_LOGGEDIN",
                    payload: true,
                });
                setloggedIn(true);
            }
        } catch (e) {
            console.log(e);
            setloggedIn(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, [loggedIn]);

    const Login = async (email, pswd) => {
        setloadingactivity(true);

        if (!email || !pswd) {
            setloadingactivity(false);
            toast.error("Please enter both email and password.");
            return;
        }

        try {
            const body = {
                email: email,
                password: pswd,
            };

            const res = await postUser("login-via-email/", body);

            if (res?.data) {
                // Store tokens and user details securely
                localStorage.setItem("usertoken", res?.data?.access);
                localStorage.setItem("user_refreshtoken", res?.data?.refresh);
                localStorage.setItem("userdetails", JSON.stringify(res?.data.user));

                // Dispatch actions to update app state
                dispatch({ type: "SET_TOKEN", payload: res?.data?.access });
                dispatch({ type: "SET_REFRESHTOKEN", payload: res?.data?.refresh });
                dispatch({ type: "SET_USER_DATA", payload: res?.data?.user });

                // Check if token exists and set logged-in state
                if (res?.data?.access) {
                    dispatch({ type: "SET_LOGGEDIN", payload: true });
                } else {
                    dispatch({ type: "SET_LOGGEDIN", payload: false });
                    navigate("/validation");
                }
                toast.success(res?.message);
                setloggedIn(true);
                setloadingactivity(false);
            } else {
                if (res?.message?.message === "Your account is not verified. Please verify your account to log in") {
                    navigate("/validation");
                } else {
                    toast.error(res?.message?.message || "Login failed. Please try again.");
                }
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("An error occurred. Please try again later.");
        } finally {
            setloadingactivity(false);
        }
    };

    const GoogleLogin = async (token, account_type) => {
        setloadingactivity(true);
        try {
            var body = {
                access_token: token,
                account_type: account_type,
            };

            const res = await postUser("google/login/callback/", body);
            console.log(">>res", res);
            if (res?.data) {
                localStorage.setItem("usertoken", res?.data?.access);
                localStorage.setItem("user_refreshtoken", res?.data?.refresh);
                localStorage.setItem("userdetails", JSON.stringify(res?.data.user));

                dispatch({
                    type: "SET_TOKEN",
                    payload: res?.data?.access,
                });
                dispatch({
                    type: "SET_REFRESHTOKEN",
                    payload: res?.data?.refresh,
                });
                dispatch({
                    type: "SET_USER_DATA",
                    payload: res?.data?.user,
                });
                if (res?.data?.access) {
                    dispatch({ type: "SET_LOGGEDIN", payload: true });
                } else {
                    dispatch({ type: "SET_LOGGEDIN", payload: false });
                    navigate("/validation");
                }
                setloggedIn(true);
                setloadingactivity(false);
                navigate("/validation");
                toast.success(res?.message);
                // alert("Success", res?.message);
                // navigation.navigate('Home')
            } else {
                setloadingactivity(false);
                if (res?.message?.message === "Your account is not verified. Please wait for admin verification.") {
                    navigate("/validation");
                } else {
                    toast.error(res?.message?.message || "Login failed. Please try again.");
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Something went wrong during login.");
        } finally {
            setloadingactivity(false);
        }
    };

    const Register = async (f_name, l_name, email, pswd, conPswd, c_code, phone) => {
        setloadingactivity(true);
        if (f_name === "" || l_name === "" || email === "" || pswd === "" || conPswd === "") {
            setloadingactivity(false);
            toast.error("Validation Error", "All feilds are required.");
        } else if (pswd != conPswd) {
            setloadingactivity(false);
            toast.error("Validation Error", "Password and confirm password do not match.");
        } else {
            try {
                var body = {
                    first_name: f_name,
                    last_name: l_name,
                    email: email,
                    password: pswd,
                    confirm_password: conPswd,
                };
                const res = await postUser("vendor/register/", body);
                console.log(">>Body", body, ">>respone", res);
                if (res?.data) {
                    localStorage.setItem("usertoken", res?.data?.access);
                    localStorage.setItem("user_refreshtoken", res?.data?.refresh);
                    localStorage.setItem("userdetails", JSON.stringify(res?.data.user));
                    setloadingactivity(false);
                    dispatch({
                        type: "SET_LOGGEDIN",
                        payload: false,
                    });
                    dispatch({
                        type: "SET_REFRESHTOKEN",
                        payload: res?.data?.refresh,
                    });
                    dispatch({
                        type: "SET_TOKEN",
                        payload: res?.data?.access,
                    });
                    setloggedIn(false);
                    navigate("/validation");
                    toast.success(res?.message || 'Successfully Register');
                } else {
                    setloadingactivity(false);
                    toast.error(res?.message?.data?.details);
                }
            } catch (e) {
                setloadingactivity(false);
                console.log("errorr... in Sign Up..authcontext", e);
            }
        }
    };
    const ForgotPswds = async (email) => {
        setloadingactivity(true);
        if (email === "") {
            setloadingactivity(false);
            toast.error("Validation Error", "Email is required.");
        } else {
            try {
                var body = {
                    email: email,
                };
                const res = await postUser("request-password-reset/", body);

                if (res?.status === true) {
                    // setForEmail(email);
                    setloadingactivity(false);

                    toast.success(res?.message);

                    return true;
                } else {
                    setloadingactivity(false);
                    toast.error(res?.message);
                    return false
                    // showAlert('Resetpass',res?.message)
                }
            } catch (e) {
                setloadingactivity(false);
                console.log("errorr... in ForgotPswds..authcontext", e);
            }
        }
    };
    const OtpVerification = async (email, otp) => {
        setloadingactivity(true);
        if (otp === " ") {
            setloadingactivity(false);
            toast.error("Otp is required.");
        }
        else if (email === " ") {
            setloadingactivity(false);
            toast.error("Email is required.");
        }
        else {
            try {
                var body = {
                    email: email,
                    otp
                };
                const res = await postUser("password-reset/verify-otp/", body);

                if (res?.status === true) {
                    // setForEmail(email);
                    setloadingactivity(false);
                    toast.success(res?.message);

                    return true;
                } else {
                    setloadingactivity(false);
                    toast.error(res?.message);
                    return false

                }
            } catch (e) {
                setloadingactivity(false);
                toast.error('Something went wrong');
                console.log("errorr... in OtpVerification..authcontext", e);
            }
        }
    };

    const ForgotResetPswd = async (email, password, confirm_password) => {
        setloadingactivity(true);
        if (password === "" || confirm_password === "") {
            setloadingactivity(false);
            toast.error("Password and confirm password are required.");
        }
        else if (password !== confirm_password) {
            setloadingactivity(false);
            toast.error("Password and confirm password should be same.");
        }
        else {
            try {
                var body = {
                    email,
                    new_password: password,
                    confirm_password
                };
                const res = await postUser("reset-password/", body);
                console.log(">>Body", body, ">>respone", res);
                if (res?.status === true) {
                    setloadingactivity(false);
                    toast.success(res?.message);
                } else {
                    setloadingactivity(false);
                    toast.error(res?.message);
                }
            } catch (e) {
                setloadingactivity(false);
                toast.error('Something went wrong!');
                console.log("errorr... in Sign Up..authcontext", e);
            }
        }
    };
    return (
        <AuthContext.Provider
            value={{
                Login,
                Register,
                ForgotPswds,
                OtpVerification,
                ForgotResetPswd,
                GoogleLogin,
                loadingactivity,
                loggedIn,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
export { AuthProvider, AuthContext };
