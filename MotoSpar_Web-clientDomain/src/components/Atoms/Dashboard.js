import React, {useContext, useEffect} from "react";
import SummaryCards from "./SummaryCard";
import SalesGraph from "./SalesGraph";
import RecentOrders from "./RecentOrders";

const Dashboard = ({data, order}) => {
    return (
        <div style={{flex: 1}}>
            <div className="dashboard-content p-4" style={{flex: 1}}>
                <SummaryCards data={data} />
                <SalesGraph data={data} />
                <RecentOrders data={order} />
            </div>
        </div>
    );
};

export default Dashboard;
