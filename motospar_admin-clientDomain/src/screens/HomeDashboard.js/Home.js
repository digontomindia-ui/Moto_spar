import React, {useContext, useEffect, useState} from "react";
import Dashboard from "../../components/Atoms/Dashboard";
import Sidebar from "../../components/Atoms/Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/Css/Homedashboard.css";
import Header from "../../components/HOC/Header";
import {Offcanvas} from "react-bootstrap"; // Import Offcanvas and Button
import {VendorContext} from "../../context/VendorContext";

const Home = () => {
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
    const {AllOrders, orders, getStatistics, statisticsData} = useContext(VendorContext);
    useEffect(() => {
        getStatistics();
        AllOrders();
    }, []);
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
                <Offcanvas.Body>
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content Area */}
            <div className="flex-grow-1 p-3">
                {/* Header with button to toggle sidebar */}
                <Header title={"Dashboard"} toggleSidebar={toggleSidebar} />
                <Dashboard statisticsData={statisticsData} orders={orders} />
            </div>
        </div>
    );
};

export default Home;
