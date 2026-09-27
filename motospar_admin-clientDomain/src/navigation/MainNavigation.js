import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "../context/AuthContext";
import { useSelector } from "react-redux";

import { VendorProvider } from "../context/VendorContext";

import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";
import ForgotPassword from "../screens/Auth/ForgotPassword";
import ResetPassword from "../screens/Auth/ResetPassword";
import Home from "../screens/HomeDashboard.js/Home";
import AddProduct from "../screens/HomeDashboard.js/AddProduct";
import AddSubCategory from "../screens/HomeDashboard.js/AddSubCategory";
import Profile from "../screens/Profile/Profile";
import ProductList from "../screens/HomeDashboard.js/ProductList";
import EditSpecificProduct from "../screens/HomeDashboard.js/EditSpecificProduct";
import OrderList from "../screens/HomeDashboard.js/OrderManagement/OrderList";
import Vendorlist from "../screens/HomeDashboard.js/VendorMangement/Vendorlist";
import VendorDetail from "../screens/HomeDashboard.js/VendorMangement/VendorDetail";
import UserList from "../screens/HomeDashboard.js/UserManagement/UserList";
import UserDetail from "../screens/HomeDashboard.js/UserManagement/UserDetail";
import OrderDetail from "../screens/HomeDashboard.js/OrderManagement/OrderDetail";
import NearestVendorlist from "../screens/HomeDashboard.js/OrderManagement/NearestVendorList";
import ProductRequestList from "../screens/HomeDashboard.js/RequestManagement/ProductRequestList";
import SpecifcProductList from "../screens/HomeDashboard.js/RequestManagement/SpecificProductRequest";
import AddVariant from "../screens/HomeDashboard.js/AddVariant";
import TransectionList from "../screens/HomeDashboard.js/Transection/TransectionList";
import Driverlist from "../screens/HomeDashboard.js/DriverManagement/DriverList";
import DriverDetail from "../screens/HomeDashboard.js/DriverManagement/DriverDetail";
import AddProductbyCsv from "../screens/HomeDashboard.js/AddProductbyCsv";
import MechanicList from "../screens/HomeDashboard.js/MechanicMangement/MechanicList";
import MechanicDetail from "../screens/HomeDashboard.js/MechanicMangement/MechanicDetail";
import NearestMechanic from "../screens/HomeDashboard.js/OrderManagement/NearestMechnaic";

const AuthNavigation = () => {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/ForgotPass" element={<ForgotPassword />} />
                <Route path="/ResetPass" element={<ResetPassword />} />
            </Routes>
        </AuthProvider>
    );
};

const HomeNavigation = () => {
    return (
        <VendorProvider>
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/addProduct" element={<AddProduct />} />
                <Route path="/addProductbyCsv" element={<AddProductbyCsv />} />
                <Route path="/addSubCategory" element={<AddSubCategory />} />
                <Route path="/MyProfile" element={<Profile />} />
                <Route path="/productList" element={<ProductList />} />
                <Route path="/editSpecificProductpage" element={<EditSpecificProduct />} />
                <Route path="/orderList" element={<OrderList />} />
                <Route path="/vendorList" element={<Vendorlist />} />
                <Route path="/userList" element={<UserList />} />
                <Route path="/vendorDetail" element={<VendorDetail />} />
                <Route path="/userDetail" element={<UserDetail />} />
                <Route path="/orderDetail" element={<OrderDetail />} />
                <Route path="/nearestVendorList" element={<NearestVendorlist />} />
                <Route path="/productRequestList" element={<ProductRequestList />} />
                <Route path="/specificProductRequest" element={<SpecifcProductList />} />
                <Route path="/addvariant" element={<AddVariant />} />
                <Route path="/transactionList" element={<TransectionList />} />
                <Route path="/driverList" element={<Driverlist />} />
                <Route path="/driverDetail" element={<DriverDetail />} />
                <Route path="/mechanicList" element={<MechanicList />} />
                <Route path="/mechanicDetail" element={<MechanicDetail />} />
                <Route path="/nearestMechanic" element={<NearestMechanic />} />
                {/*<Route path="/addProductRequest" element={<AddProductRequest />} />
                 */}
                <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
        </VendorProvider>
    );
};

const MainNavigation = () => {
    const loggedIn = useSelector((state) => state.loggedIn);
    return <>{loggedIn ? <HomeNavigation /> : <AuthNavigation />}</>;
    // return <AuthNavigation />;
    // return <HomeNavigation />;
};

export default MainNavigation;
