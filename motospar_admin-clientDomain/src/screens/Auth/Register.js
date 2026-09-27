import React, {useContext, useState} from "react";
import "../../assets/Css/Auth.css";
import {AuthContext} from "../../context/AuthContext";
const Register = () => {
    const [email, setemail] = useState("");
    const [fName, setfName] = useState("");
    const [lName, setlName] = useState("");
    const [cCode, setcCode] = useState("+91");
    const [phone, setphone] = useState(null);
    const [password, setpassword] = useState("");
    const [cPassword, setcPassword] = useState("");
    const {Register, loadingactivity} = useContext(AuthContext);
    console.log(fName, lName, email, password, cPassword, cCode, phone);
    const HandleSignup = (e) => {
        e.preventDefault();
        Register(fName, lName, email, password, cPassword);
    };
    return (
        <div className="sign-in-container">
            {/* Left side form */}
            <div className="outer-container">
                <div className="form-containerRegister">
                    <div className="logo">
                        <img src={require("../../assets/images/Logo.png")} alt="Logo" />
                    </div>
                    <div className="title">Sign Up</div>
                    <div className="nameGroup">
                        <div className="input-groupName">
                            <label htmlFor="default">First Name</label>
                            <input
                                type="text"
                                id="fname"
                                placeholder="Enter your name"
                                value={fName}
                                onChange={(e) => setfName(e.target.value)}
                            />
                        </div>
                        <div className="input-groupName">
                            <label htmlFor="default">Last Name</label>
                            <input
                                type="text"
                                id="lname"
                                placeholder="Enter your name"
                                value={lName}
                                onChange={(e) => setlName(e.target.value)}
                            />
                        </div>
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

                    <button className="sign-in-btnforgot" onClick={HandleSignup}>
                        Sign Up
                    </button>
                    <div className="footer">
                        Already have an account? <a href="/">Sign in</a>
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

export default Register;
