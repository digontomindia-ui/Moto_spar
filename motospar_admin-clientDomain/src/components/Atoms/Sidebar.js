import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { postAuth } from "../../repository/Repo";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { googleLogout } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { getAppToken } from "../../constants/GetAsyncStorageData";


const Sidebar = () => {
    const [loadingactivity, setloadingactivity] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location
    const userRtoken = useSelector((state) => state.refreshToken);

    const toggleSubMenu = () => {
        setIsOpen(!isOpen);
    };

    const HandleLogout = async () => {
        setloadingactivity(true);
        if ((await getAppToken()) === "") {
            setloadingactivity(false);
            return alert("Validation Error", "Something went wrong");
        } else {
            try {
                var body = {
                    refresh_token: userRtoken,
                };
                const res = await postAuth("logout", body);
                console.log(">>res..Logout.", res);

                if (res?.data) {
                    googleLogout();
                    localStorage.removeItem("usertoken");
                    localStorage.removeItem("userdetails");
                    dispatch({
                        type: "SET_LOGGEDIN",
                        payload: false,
                    });
                    dispatch({
                        type: "REMOVE_USER_DATA",
                    });
                    dispatch({
                        type: "SET_TOKEN",
                        payload: null,
                    });

                    setloadingactivity(false);
                    // alert("Success", res?.message);
                    navigate("/login");
                } else {
                    setloadingactivity(false);
                    alert("Error", res?.message);
                }
            } catch (e) {
                setloadingactivity(false);
                console.log("errorr... in Logout..authcontext", e);
            }
        }
    };
    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar text-white p-4" style={{ width: "280px", backgroundColor: "#262D34", height: "200vh" }}>
            <div className="brand mb-4">
                <img src={require("../../assets/images/Logo.png")} alt="logo" className="img-fluid" />
                <h3>Motospar</h3>
            </div>
            <ul className="nav flex-column">
                <li className="nav-item mb-3">
                    <a href="/Home" className="productlist mb-3 d-flex align-items-center gap-2">
                        <img
                            src={
                                isActive("/Home")
                                    ? require("../../assets/images/dashboard_focus.png")
                                    : require("../../assets/images/dashboard.png")
                            }
                            style={{
                                width: 20,
                                height: 20,
                            }}
                        />
                        Dashboard
                    </a>
                </li>
                <li className="nav-item mb-3">
                    <a href="#" className="productlist mb-3 d-flex align-items-center gap-2" onClick={toggleSubMenu}>
                        <div>
                            <img
                                src={
                                    isOpen
                                        ? require("../../assets/images/productMangement_focus.png")
                                        : require("../../assets/images/productManagement.png")
                                }
                                style={{
                                    width: 20,
                                    height: 20,
                                }}
                            />
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            Products Management {isOpen ? <FaAngleUp /> : <FaAngleDown />}
                        </div>
                    </a>
                    {isOpen && (
                        <ul className="nav flex-column ms-3">
                            <li className="nav-item mb-3">
                                <a
                                    href="/productList"
                                    className="nav-link text-white"
                                    style={{
                                        filter: isActive("/productList")
                                            ? "invert(47%) sepia(99%) saturate(3727%) hue-rotate(220deg) brightness(91%) contrast(105%)"
                                            : "none",
                                    }}
                                >
                                    Product List
                                </a>
                            </li>
                            <li className="nav-item mb-3">
                                <a
                                    href="/addSubCategory"
                                    className="nav-link text-white"
                                    style={{
                                        filter: isActive("/addSubCategory")
                                            ? "invert(47%) sepia(99%) saturate(3727%) hue-rotate(220deg) brightness(91%) contrast(105%)"
                                            : "none",
                                    }}
                                >
                                    Add Sub Category
                                </a>
                            </li>
                            <li className="nav-item mb-3">
                                <a
                                    href="/addProduct"
                                    className="nav-link text-white"
                                    style={{
                                        filter: isActive("/addProduct")
                                            ? "invert(47%) sepia(99%) saturate(3727%) hue-rotate(220deg) brightness(91%) contrast(105%)"
                                            : "none",
                                    }}
                                >
                                    Add New Product
                                </a>
                            </li>
                            <li className="nav-item mb-3">
                                <a
                                    href="/addProductbyCsv"
                                    className="nav-link text-white"
                                    style={{
                                        filter: isActive("/addProductbyCsv")
                                            ? "invert(47%) sepia(99%) saturate(3727%) hue-rotate(220deg) brightness(91%) contrast(105%)"
                                            : "none",
                                    }}
                                >
                                    Add New Product by csv
                                </a>
                            </li>
                        </ul>
                    )}
                </li>
                <li className="nav-item mb-3">
                    <a href="/orderList" className="productlist mb-3 d-flex align-items-center gap-2">
                        <img
                            src={
                                isActive("/orderList")
                                    ? require("../../assets/images/order_focus.png")
                                    : require("../../assets/images/order.png")
                            }
                            style={{
                                width: 20,
                                height: 20,
                            }}
                        />
                        Order Management
                    </a>
                </li>
                <li className="nav-item mb-3">
                    <a href="/userList" className="productlist mb-3 d-flex align-items-center gap-2">
                        <img
                            src={
                                isActive("/userList")
                                    ? require("../../assets/images/user_focus.png")
                                    : require("../../assets/images/user.png")
                            }
                            style={{
                                width: 20,
                                height: 20,
                            }}
                        />
                        User Management
                    </a>
                </li>
                <li className="nav-item mb-3">
                    <a href="/vendorList" className="productlist mb-3 d-flex align-items-center gap-2">
                        <img
                            src={
                                isActive("/vendorList")
                                    ? require("../../assets/images/user_focus.png")
                                    : require("../../assets/images/user.png")
                            }
                            style={{
                                width: 20,
                                height: 20,
                            }}
                        />
                        Vendor Management
                    </a>
                </li>
                <li className="nav-item mb-3">
                    <a href="/mechanicList" className="productlist mb-3 d-flex align-items-center gap-2">
                        <img
                            src={
                                isActive("/mechanicList")
                                    ? require("../../assets/images/user_focus.png")
                                    : require("../../assets/images/user.png")
                            }
                            style={{
                                width: 20,
                                height: 20,
                            }}
                        />
                        Mechanic Management
                    </a>
                </li>
                <li className="nav-item mb-3">
                    <a href="/driverList" className="productlist mb-3 d-flex align-items-center gap-2">
                        <img
                            src={
                                isActive("/driverList")
                                    ? require("../../assets/images/user_focus.png")
                                    : require("../../assets/images/user.png")
                            }
                            style={{
                                width: 20,
                                height: 20,
                            }}
                        />
                        Driver Management
                    </a>
                </li>
                <li className="nav-item mb-3">
                    <a href="/transactionList" className="productlist mb-3 d-flex align-items-center gap-2">
                        <img
                            src={
                                isActive("/transactionList")
                                    ? require("../../assets/images/transaction_focus.png")
                                    : require("../../assets/images/transaction.png")
                            }
                            style={{
                                width: 20,
                                height: 20,
                            }}
                        />
                        Transaction List
                    </a>
                </li>
                <li className="nav-item mb-3">
                    <a href="/productRequestList" className="productlist mb-3 d-flex align-items-center gap-2">
                        <img
                            src={
                                isActive("/productRequestList")
                                    ? require("../../assets/images/request_focus.png")
                                    : require("../../assets/images/request.png")
                            }
                            style={{
                                width: 20,
                                height: 20,
                            }}
                        />
                        Product Request
                    </a>
                </li>
               
                {/* Additional menu items */}
                <li className="nav-item mb-3">
                    <a
                        href="#"
                        className="productlist mb-3 d-flex align-items-center gap-2"
                        style={{ color: "red" }}
                        onClick={HandleLogout}
                    >
                        Log Out
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
