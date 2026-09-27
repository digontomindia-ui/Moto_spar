import React, { createContext, useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { postGoogle, postUser, postUserLogout } from "../repository/Repo";
import { useNavigate } from "react-router-dom";

import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
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

  const GetOtp = async (email, password) => {
    setloadingactivity(true);

    if (!email || !password) {
      setloadingactivity(false);
      toast.error("Please enter both Email and Password");
      return false; // ✅ safer return
    }

    try {
      const body = { email, password };
      const res = await postUser("admin-login-with-otp/", body);
      console.log(">>res..GetOtp.", res);

      setloadingactivity(false);

      if (res?.status === true) {
        toast.success(res?.message);
        return true; // ✅ ensure boolean return
      } else {
        toast.error(res?.message || "Something went wrong");
        return false;
      }
    } catch (e) {
      setloadingactivity(false);
      console.log("error in Login..authcontext", e);
      toast.error("Server error, please try again later");
      return false; // ✅ always return
    }
  };
  const Login = async (email, otp) => {
    setloadingactivity(true);
    if (email === "" || otp === "") {
      setloadingactivity(false);
      return alert("Validation Error", "Please enter your OTP");
    } else {
      try {
        var body = {
          email: email,
          otp: otp,
        };

        const res = await postUser("verify-admin-otp/", body);
        console.log(">>res..SignIn.", res);

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
          dispatch({
            type: "SET_LOGGEDIN",
            payload: true,
          });
          setloggedIn(true);
          setloadingactivity(false);
          toast.success(res?.message);

          // alert("Success", res?.message);
          // navigation.navigate('Home')
        } else {
          setloadingactivity(false);
          toast.error(res?.message);
        }
      } catch (e) {
        setloadingactivity(false);
        console.log("errorr... in Login..authcontext", e);
      }
    }
  };

  // const GoogleLogin = async (token, account_type) => {
  //     setloadingactivity(true);
  //     try {
  //         var body = {
  //             access_token: token,
  //             account_type: account_type,
  //         };

  //         const res = await postUser("google/login/callback/", body);
  //         console.log(">>res", res);
  //         if (res?.data) {
  //             localStorage.setItem("usertoken", res?.data?.access);
  //             localStorage.setItem("user_refreshtoken", res?.data?.refresh);
  //             localStorage.setItem("userdetails", JSON.stringify(res?.data.user));

  //             dispatch({
  //                 type: "SET_TOKEN",
  //                 payload: res?.data?.access,
  //             });
  //             dispatch({
  //                 type: "SET_REFRESHTOKEN",
  //                 payload: res?.data?.refresh,
  //             });
  //             dispatch({
  //                 type: "SET_USER_DATA",
  //                 payload: res?.data?.user,
  //             });
  //             dispatch({
  //                 type: "SET_LOGGEDIN",
  //                 payload: true,
  //             });
  //             setloggedIn(true);
  //             setloadingactivity(false);
  //             // alert("Success", res?.message);
  //             // navigation.navigate('Home')
  //         } else {
  //             setloadingactivity(false);
  //             alert("Error", res?.message);
  //         }
  //     } catch (error) {
  //         if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //             setloadingactivity(false);
  //             alert("Error", "user cancelled the login flow");
  //         } else if (error.code === statusCodes.IN_PROGRESS) {
  //             setloadingactivity(false);
  //             alert("In Progress", "sign in already in progress");
  //         } else if (error.response) {
  //             setloadingactivity(false);
  //             console.log(error.response.data);
  //             const errorData = error.response.data;
  //             alert("error", errorData["non_field_errors"][0] + "Kindly Login through Email and Password");
  //             await GoogleSignin.signOut();
  //         }
  //         // else {
  //         //   setloadingactivity(false)
  //         //   Alert.alert('Error', "Something went wrong!");
  //         //   console.log("Erroorr...", error)
  //         // }
  //     }
  // };

  // const Register = async (f_name, l_name, email, pswd, conPswd, c_code, phone) => {
  //     setloadingactivity(true);
  //     if (f_name === "" || l_name === "" || email === "" || pswd === "" || conPswd === "") {
  //         setloadingactivity(false);
  //         return alert("Validation Error", "All feilds are required.");
  //     } else if (pswd != conPswd) {
  //         setloadingactivity(false);
  //         return alert("Validation Error", "Password and confirm password do not match.");
  //     } else {
  //         try {
  //             var body = {
  //                 first_name: f_name,
  //                 last_name: l_name,
  //                 email: email,
  //                 password: pswd,
  //                 confirm_password: conPswd,
  //             };
  //             const res = await postUser("admin/register/", body);

  //             if (res?.data) {
  //                 localStorage.setItem("usertoken", res?.data?.access);
  //                 localStorage.setItem("user_refreshtoken", res?.data?.refresh);
  //                 localStorage.setItem("userdetails", JSON.stringify(res?.data.user));
  //                 setloadingactivity(false);
  //                 dispatch({
  //                     type: "SET_LOGGEDIN",
  //                     payload: true,
  //                 });
  //                 dispatch({
  //                     type: "SET_REFRESHTOKEN",
  //                     payload: res?.data?.refresh,
  //                 });
  //                 dispatch({
  //                     type: "SET_TOKEN",
  //                     payload: res?.data?.access,
  //                 });
  //                 dispatch({
  //                     type: "SET_USER_DATA",
  //                     payload: res?.data?.user,
  //                 });
  //                 setloggedIn(true);
  //                 // alert("Success", res?.message);
  //                 //navigation.navigate('Home')
  //             } else {
  //                 setloadingactivity(false);
  //                 // alert("Success", res?.message);
  //             }
  //         } catch (e) {
  //             setloadingactivity(false);
  //             console.log("errorr... in Sign Up..authcontext", e);
  //         }
  //     }
  // };
   const ForgotPswds = async (email) => {
    console.log("hhhh")
        setloadingactivity(true);
        if (email === "") {
            setloadingactivity(false);
            toast.error( "Email is required.");
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
    } else if (email === " ") {
      setloadingactivity(false);
      toast.error("Email is required.");
    } else {
      try {
        var body = {
          email: email,
          otp,
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
          return false;
        }
      } catch (e) {
        setloadingactivity(false);
        toast.error("Something went wrong");
        console.log("errorr... in OtpVerification..authcontext", e);
      }
    }
  };

  const ForgotResetPswd = async (email, password, confirm_password) => {
    setloadingactivity(true);
    if (password === "" || confirm_password === "") {
      setloadingactivity(false);
      toast.error("Password and confirm password are required.");
    } else if (password !== confirm_password) {
      setloadingactivity(false);
      toast.error("Password and confirm password should be same.");
    } else {
      try {
        var body = {
          email,
          new_password: password,
          confirm_password,
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
        toast.error("Something went wrong!");
        console.log("errorr... in Sign Up..authcontext", e);
      }
    }
  };
  return (
    <AuthContext.Provider
      value={{
        Login,
        OtpVerification,
        ForgotPswds,
        ForgotResetPswd,
        GetOtp,
        loadingactivity,
        loggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export { AuthProvider, AuthContext };
