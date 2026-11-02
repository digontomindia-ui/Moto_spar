import React from "react";
import { Button, Spinner } from "react-bootstrap";
import { FaSyncAlt } from "react-icons/fa";
import RecentOrders from "./RecentOrders";
import SalesGraph from "./SalesGraph";
import SummaryCards from "./SummaryCard";

const formatUpdatedTime = (date) => {
    if (!date) return "Waiting for the first refresh";
    return `Updated ${new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
    }).format(date)}`;
};

const Dashboard = ({ statisticsData, orders, isRefreshing, lastUpdated, onRefresh }) => (
    <div className="dashboard-content">
        <section className="dashboard-intro">
            <div>
                <span className="dashboard-eyebrow">Operations overview</span>
                <h2>Today at MotoSpar</h2>
                <p>Monitor revenue, orders and the work that needs the admin team’s attention.</p>
            </div>
            <div className="dashboard-refresh-wrap">
                <span>{formatUpdatedTime(lastUpdated)}</span>
                <Button variant="outline-secondary" onClick={onRefresh} disabled={isRefreshing}>
                    {isRefreshing ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                        <FaSyncAlt className="me-2" aria-hidden="true" />
                    )}
                    Refresh
                </Button>
            </div>
        </section>

        <SummaryCards data={statisticsData} loading={isRefreshing && !statisticsData} />
        <SalesGraph data={statisticsData} loading={isRefreshing && !statisticsData} />
        <RecentOrders data={orders} loading={isRefreshing && !orders?.length} />
    </div>
);

export default Dashboard;
