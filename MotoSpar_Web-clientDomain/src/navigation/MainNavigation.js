import React from "react";
import {Routes, Route, Navigate} from "react-router-dom";
import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";
import ForgotPassword from "../screens/Auth/ForgotPassword";
import ResetPassword from "../screens/Auth/ResetPassword";
import {AuthProvider} from "../context/AuthContext";
import {useSelector} from "react-redux";
import Home from "../screens/Auth/HomeDashboard.js/Home";
import ProductList from "../screens/Auth/HomeDashboard.js/ProductList";
import AddProduct from "../screens/Auth/HomeDashboard.js/AddProduct";
import AddProductRequest from "../screens/Auth/HomeDashboard.js/AddProductRequest";
import {VendorProvider} from "../context/VendorContext";
import EditSpecificProductpage from "../screens/Auth/HomeDashboard.js/EditSpecificProductpage";
import Profile from "../screens/Profile/Profile";
import OrderList from "../screens/Order Managment/OrderList";
import OrderDetail from "../screens/Order Managment/OrderDetail";
import Validation from "../screens/Auth/Validation";
import Support from "../screens/Support";

const AuthNavigation = () => {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/ForgotPass" element={<ForgotPassword />} />
                <Route path="/ResetPass" element={<ResetPassword />} />
                <Route path="/validation" element={<Validation />} />
            </Routes>
        </AuthProvider>
    );
};

const HomeNavigation = () => {
    return (
        <VendorProvider>
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/productList" element={<ProductList />} />
                <Route path="/addProduct" element={<AddProduct />} />
                <Route path="/addProductRequest" element={<AddProductRequest />} />
                <Route path="/editSpecificProductpage" element={<EditSpecificProductpage />} />
                <Route path="/allOrders" element={<OrderList />} />
                <Route path="/orderDetail" element={<OrderDetail />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/support" element={<Support />} />
                <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
        </VendorProvider>
    );
};

const MainNavigation = () => {
    const loggedIn = useSelector((state) => state.loggedIn);
    return <>{loggedIn ? <HomeNavigation /> : <AuthNavigation />}</>;
    // return <AuthNavigation />;
};

export default MainNavigation;
