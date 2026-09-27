
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { postUserLogout } from "../../repository/Repo";
import { getAppToken } from "../../constants/GetAsyncStorageData";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { googleLogout } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
    const [loadingactivity, setloadingactivity] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const userRtoken = useSelector((state) => state.refreshToken);
    const [isOpen, setIsOpen] = useState(false);

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
                const res = await postUserLogout("logout", body);
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

    // Check if any of the Product Management routes is active
    const isProductManagementActive = () => {
        return ["/productList", "/addProduct"].includes(location.pathname);
    };

    return (
        <div
            className="sidebar text-white p-4 d-flex flex-column"
            style={{
                // Default to full width for mobile
                width: "40vh", // Constrain width on larger screens
                backgroundColor: "#262D34",
                height: "100vh", // Adjust height to fit the viewport
            }}
        >
            <div className="brand mb-4">
                <img src={require("../../assets/images/Logo.png")} alt="logo" className="img-fluid" />
                <h3>Motospar</h3>
            </div>
            <ul className="nav flex-column">
                <li className="nav-item mb-3">
                    <a href="/home" className="productlist mb-3 d-flex align-items-center gap-2">
                        <img
                            src={
                                isActive("/home")
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
                    <a
                        href="#productManagement"
                        className="productlist mb-3 d-flex align-items-center gap-2"
                        onClick={toggleSubMenu}
                    >
                        <div>
                            <img
                                src={
                                    isProductManagementActive()
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
                        </ul>
                    )}
                </li>
                <li className="nav-item mb-3">
                    <a href="/allOrders" className="productlist mb-3 d-flex align-items-center gap-2">
                        <img
                            src={
                                isActive("/allOrders" || "/orderDetail")
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
                    <a href="/addProductRequest" className="productlist mb-3 d-flex align-items-center gap-2">
                        <img
                            src={
                                isActive("/addProductRequest")
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
                <li className="nav-item mb-3">
                    <a href="/support" className="productlist mb-3 d-flex align-items-center gap-2">
                        <img
                            src={
                                isActive("/support")
                                    ? require("../../assets/images/support.png")
                                    : require("../../assets/images/support.png")
                            }
                            style={{
                                width: 20,
                                height: 20,
                            }}
                        />
                        Help & Support
                    </a>
                </li>
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
