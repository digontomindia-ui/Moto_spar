import React from "react";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";
import {Card} from "react-bootstrap";

const SalesGraph = ({data}) => {
    // Transform the input data into the format expected by the LineChart
    const transformedData = Object.entries(data?.daily_revenue_last_7_days || {}).map(([date, revenue]) => ({
        name: date, // X-axis label (date)
        uv: revenue, // Y-axis value (revenue)
    }));

    return (
        <Card className="shadow-sm mb-4 rounded custom-card">
            <Card.Body>
                <h4>Sales Details</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={transformedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="uv" stroke="#FF7300" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </Card.Body>
        </Card>
    );
};

export default SalesGraph;
