import React, { useContext, useEffect, useState } from "react";
import "../../assets/Css/Auth.css";
import { AuthContext } from "../../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import OTPInput from "react-otp-input";
import { Loader } from "lucide-react";
import { toast } from "react-toastify";
const Login = () => {
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const { Login, loadingactivity, GetOtp } = useContext(AuthContext);
    const [otp, setotp] = useState('');
    const [showOtpField, setshowOtpField] = useState(false)
    const [user, setuser] = useState([]);


    const HandlegetOtp = async (e) => {

        e.preventDefault();
        const response = await GetOtp(email, password);
        console.log("jhsdg", response)
        if (response == true) {
            setshowOtpField(true)
        }
    };
    const HandleLogin = (e) => {

        e.preventDefault();

        Login(email, otp);
        setemail("");
        setotp("");
    };


    return (
        <div className="sign-in-container">
            {/* Left side form */}
            <div className="outer-container">
                <div className="form-container">
                    <div className="logo">
                        <img src={require("../../assets/images/Logo.png")} alt="Logo" />
                    </div>
                    <div className="subtitle">Welcome back!</div>
                    <div className="title">Sign In</div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="text"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setemail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <div className="password-group">
                            <label htmlFor="password">Password</label>
                        </div>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setpassword(e.target.value)}
                        />
                    </div>
                    <div className="forgotpass-a">
                        <a href="/Forgotpass">Forgot Password?</a>
                    </div>
                    {
                        showOtpField &&
                        <div className="input-group">

                            <label htmlFor="email">Enter OTP</label>
                            <OTPInput
                                value={otp}
                                onChange={setotp}
                                numInputs={6}
                                inputStyle={{
                                    width: '100%',
                                    height: 50,
                                    margin: 10,
                                    borderRadius: 10,
                                    borderWidth: 0.5,

                                }}

                                renderInput={(props) => <input {...props} />}
                            />
                        </div>
                    }
                    {
                        !showOtpField ?
                            <button className="sign-in-btnforgot" onClick={HandlegetOtp}>
                                {loadingactivity ? <Loader size={20} color='#fff' /> : 'Send Otp'}
                            </button>
                            :
                            <button className="sign-in-btnforgot" onClick={HandleLogin}>
                                {loadingactivity ? <Loader size={20} color='#fff' /> : 'Sign In'}
                            </button>
                    }

                </div>
                <div className="img">
                    <img
                        src={require("../../assets/images/bottomimg.png")}
                        className="illustration"
                        alt="Illustration"
                    />
                </div>
            </div>

            {/* Right side illustration */}
            <div className="illustration-container"></div>
        </div>
    );
};

export default Login;
