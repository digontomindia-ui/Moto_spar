import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import Dashboard from "../../components/Atoms/Dashboard";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import { VendorContext } from "../../context/VendorContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/Css/Homedashboard.css";

const Home = () => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const { AllOrders, orders, getStatistics, statisticsData } = useContext(VendorContext);
    const ordersRequestRef = useRef(AllOrders);
    const statisticsRequestRef = useRef(getStatistics);

    ordersRequestRef.current = AllOrders;
    statisticsRequestRef.current = getStatistics;

    const loadDashboard = useCallback(async () => {
        setIsRefreshing(true);
        await Promise.all([statisticsRequestRef.current(), ordersRequestRef.current(1)]);
        setLastUpdated(new Date());
        setIsRefreshing(false);
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const toggleSidebar = () => setShowSidebar((visible) => !visible);

    return (
        <div className="d-flex admin-dashboard-shell">
            <div className="d-none d-md-block">
                <Sidebar />
            </div>

            <Offcanvas show={showSidebar} onHide={toggleSidebar} className="bg-dark text-white">
                <Offcanvas.Header closeButton closeVariant="white">
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>

            <main className="admin-dashboard-main">
                <Header title="Dashboard" toggleSidebar={toggleSidebar} />
                <Dashboard
                    statisticsData={statisticsData}
                    orders={orders}
                    isRefreshing={isRefreshing}
                    lastUpdated={lastUpdated}
                    onRefresh={loadDashboard}
                />
            </main>
        </div>
    );
};

export default Home;
