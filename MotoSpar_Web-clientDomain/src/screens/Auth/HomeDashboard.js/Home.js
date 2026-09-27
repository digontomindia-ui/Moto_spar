import React, {useContext, useEffect, useState} from "react";
import Dashboard from "../../../components/Atoms/Dashboard";
import Sidebar from "../../../components/Atoms/Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../assets/Css/Homedashboard.css";
import Header from "../../../components/HOC/Header";
import {Offcanvas} from "react-bootstrap";
import {VendorContext} from "../../../context/VendorContext";

const Home = () => {
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile
    const {VendorAnalytics, AllOrders, orders, analyticsData} = useContext(VendorContext);

    useEffect(() => {
        VendorAnalytics();
        AllOrders();
    }, []);

    const toggleSidebar = () => setShowSidebar(!showSidebar);

    return (
        <div className="d-flex flex-column flex-md-row">
            {/* Sidebar for larger screens */}
            <div className="d-none d-md-block">
                <Sidebar />
            </div>

            {/* Offcanvas sidebar for mobile */}
            <Offcanvas
                show={showSidebar}
                onHide={toggleSidebar}
                style={{width: "100vh", backgroundColor: "#262D34", color: "white"}} // Custom color for the background
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="text-white">Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <div style={{height: "100vh"}}>
                    <Sidebar />
                </div>
            </Offcanvas>

            {/* Main content */}
            <div className="flex-grow-1 p-3">
                <Header title={"Dashboard"} toggleSidebar={toggleSidebar} />
                <Dashboard data={analyticsData} order={orders} />
            </div>
        </div>
    );
};

export default Home;
