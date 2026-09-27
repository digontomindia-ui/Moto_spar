import React from "react";
import SummaryCards from "./SummaryCard";
import SalesGraph from "./SalesGraph";
import RecentOrders from "./RecentOrders";

const Dashboard = ({statisticsData, orders}) => {
    return (
        <div style={{flex: 1}}>
            <div className="dashboard-content p-4" style={{flex: 1}}>
                <SummaryCards data={statisticsData} />
                <SalesGraph data={statisticsData} />
                <RecentOrders data={orders} />
            </div>
        </div>
    );
};

export default Dashboard;
