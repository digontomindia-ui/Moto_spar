import React, { useContext, useEffect, useState } from "react";
import "../../assets/Css/Auth.css";
import { AuthContext } from "../../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader } from "lucide-react";
const Login = () => {
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const { GoogleLogin, Login, loadingactivity } = useContext(AuthContext);
    const [user, setuser] = useState([]);

    const HandleLogin = (e) => {
        e.preventDefault();
        Login(email, password);
        setemail("");
        setpassword("");
    };
    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            GoogleLogin(tokenResponse.access_token, "vendor");
        },
        onError: (error) => {
            console.log("Login Failed:", error);
        },
    });
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
                            type="email"
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

                    <button className="sign-in-btnforgot" onClick={HandleLogin}>
                        {loadingactivity ? <Loader size={20} color='#fff' /> : 'Sign In'}
                    </button>
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
                        <span>---OR---</span>
                    </div>
                    <button className="google-sign-in-btn" onClick={() => login()}>
                        <img src={require("../../assets/images/google.png")} alt="Google Icon" />
                        <span>Sign in with Google</span>
                    </button>

                    <div className="footer">
                        I don't have an account? <a href="/Register">Sign up</a>
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

export default Login;
