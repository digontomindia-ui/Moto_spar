import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import OTPInput from "react-otp-input";
import { Loader } from "lucide-react";

const ForgotPassword = () => {
    const [email, setemail] = useState("");
    const [otp, setotp] = useState('');
    const [showOtpField, setshowOtpField] = useState(false)
    const { ForgotPswds, OtpVerification, loadingactivity } = useContext(AuthContext);
    const navigate = useNavigate();
    const HandleForgot = async (e) => {
        e.preventDefault();
        const response = await ForgotPswds(email);
        console.log("Resppp", response)
        if (response) {

            setshowOtpField(true)
        }

    };
    const VerifyOtp = async (e) => {
        e.preventDefault();
        const response = await OtpVerification(email, otp);
        if (response) {
            navigate('/ResetPass', { state: { email: email } });
        }

    };
    return (
        <div className="sign-in-container">
            {/* Left side form */}
            <div className="outer-container">
                <div className="form-container">
                    <div className="logo">
                        <img src={require("../../assets/images/Logo.png")} alt="Logo" />
                    </div>
                    <div className="titleForgot">Forgot Password?</div>
                    <div className="subtitle">
                        Don’t worry, happens to all of us. Enter your email below to recover your password
                    </div>
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
                        showOtpField ?
                            <button className="sign-in-btnforgot" onClick={VerifyOtp}>
                                {loadingactivity ? <Loader size={20} color='#fff' /> : 'Submit'}
                            </button> :
                            <button className="sign-in-btnforgot" onClick={HandleForgot}>
                                {loadingactivity ? <Loader size={20} color='#fff' /> : 'Send Otp'}
                            </button>
                    }
                    <div className="footer">
                        Go back? <a href="/">Sign in</a>
                    </div>
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

export default ForgotPassword;
