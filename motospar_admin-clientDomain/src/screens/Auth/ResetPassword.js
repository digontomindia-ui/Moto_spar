import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import { Loader } from "lucide-react";

const ResetPassword = () => {
    const location = useLocation();
    const email = location.state?.email;
    const [token, settoken] = useState("");
    const [password, setpassword] = useState("");
    const [cPassword, setcPassword] = useState("");
    const { ForgotResetPswd, loadingactivity } = useContext(AuthContext);

    const HandleResetpass = async (e) => {
        e.preventDefault();
        const response = await ForgotResetPswd(email, password, cPassword);
        if (response) {
            setpassword(' ');
            setcPassword(' ')
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
                        Don’t worry, happens to all of us. Enter your Token and new password below to recover your
                        password
                    </div>

                    <div className="input-group">
                        <div className="password-group">
                            <label htmlFor="password">New Password</label>
                        </div>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your new password"
                            value={password}
                            onChange={(e) => setpassword(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <div className="password-group">
                            <label htmlFor="password">Confirm Password</label>
                        </div>
                        <input
                            type="password"
                            id="cpassword"
                            placeholder="Enter your password"
                            value={cPassword}
                            onChange={(e) => setcPassword(e.target.value)}
                        />
                    </div>

                    <button className="sign-in-btnforgot" onClick={HandleResetpass}>
                        {loadingactivity ? <Loader size={20} color='#fff' /> : 'Submit'}
                    </button>
                    <div className="footer">
                        Go back? <a href="/login">Login</a>
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

export default ResetPassword;
