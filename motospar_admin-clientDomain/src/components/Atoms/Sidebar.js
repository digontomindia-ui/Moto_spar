import React, { useEffect, useState } from "react";
import { googleLogout } from "@react-oauth/google";
import {
    FaBoxOpen,
    FaChevronDown,
    FaClipboardList,
    FaReceipt,
    FaSignOutAlt,
    FaStore,
    FaTachometerAlt,
    FaTools,
    FaTruck,
    FaUserFriends,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getAppToken } from "../../constants/GetAsyncStorageData";
import { postAuth } from "../../repository/Repo";
import "../../assets/Css/AdminShell.css";

const productRoutes = [
    "/productList",
    "/addSubCategory",
    "/addProduct",
    "/addProductbyCsv",
    "/editSpecificProductpage",
    "/addvariant",
];

const productLinks = [
    { to: "/productList", label: "Products" },
    { to: "/addProduct", label: "Add product" },
    { to: "/addProductbyCsv", label: "CSV import" },
    { to: "/addSubCategory", label: "Categories" },
];

const workspaceLinks = [
    { to: "/orderList", label: "Orders", icon: FaClipboardList },
    { to: "/userList", label: "Customers", icon: FaUserFriends },
    { to: "/vendorList", label: "Vendors", icon: FaStore },
    { to: "/mechanicList", label: "Mechanics", icon: FaTools },
    { to: "/driverList", label: "Drivers", icon: FaTruck },
    { to: "/transactionList", label: "Transactions", icon: FaReceipt },
    { to: "/productRequestList", label: "Product requests", icon: FaBoxOpen },
];

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const refreshToken = useSelector((state) => state.refreshToken);
    const isProductRoute = productRoutes.some((route) => location.pathname.startsWith(route));
    const [isProductMenuOpen, setIsProductMenuOpen] = useState(isProductRoute);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        if (isProductRoute) setIsProductMenuOpen(true);
    }, [isProductRoute]);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            const token = await getAppToken();
            if (token) {
                await postAuth("logout", { refresh_token: refreshToken });
            }
        } catch (error) {
            // A failed server logout must not leave a user trapped in the admin UI.
            console.error("Server logout failed; clearing the local session.", error);
        } finally {
            googleLogout();
            localStorage.removeItem("usertoken");
            localStorage.removeItem("userdetails");
            dispatch({ type: "SET_LOGGEDIN", payload: false });
            dispatch({ type: "REMOVE_USER_DATA" });
            dispatch({ type: "SET_TOKEN", payload: null });
            setIsLoggingOut(false);
            navigate("/login", { replace: true });
        }
    };

    return (
        <aside className="admin-sidebar" aria-label="Admin navigation">
            <div className="admin-sidebar-brand">
                <img src={require("../../assets/images/Logo.png")} alt="MotoSpar" />
                <div>
                    <strong>MotoSpar</strong>
                    <span>Admin console</span>
                </div>
            </div>

            <nav className="admin-sidebar-nav">
                <span className="admin-nav-section-label">Workspace</span>

                <NavLink to="/home" className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>
                    <FaTachometerAlt aria-hidden="true" />
                    <span>Dashboard</span>
                </NavLink>

                <button
                    type="button"
                    className={`admin-nav-link admin-nav-button ${isProductRoute ? "active" : ""}`}
                    onClick={() => setIsProductMenuOpen((open) => !open)}
                    aria-expanded={isProductMenuOpen}
                    aria-controls="product-navigation"
                >
                    <FaBoxOpen aria-hidden="true" />
                    <span>Product management</span>
                    <FaChevronDown
                        className={`admin-nav-chevron ${isProductMenuOpen ? "open" : ""}`}
                        aria-hidden="true"
                    />
                </button>

                {isProductMenuOpen ? (
                    <div className="admin-subnav" id="product-navigation">
                        {productLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `admin-subnav-link ${isActive ? "active" : ""}`}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                ) : null}

                {workspaceLinks.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
                    >
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="admin-sidebar-footer">
                <button
                    type="button"
                    className="admin-logout-button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    <FaSignOutAlt aria-hidden="true" />
                    <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                </button>
                <small>Production workspace</small>
            </div>
        </aside>
    );
};

export default Sidebar;
