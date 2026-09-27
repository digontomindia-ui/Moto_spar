import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import {Card, Row, Col} from "react-bootstrap";

// [
//     {name: "Helmet", value: 65, color: "#FF7300"},
//     {name: "Tyre", value: 15, color: "#0088FE"},
//     {name: "Seat Cover", value: 10, color: "#FFBB28"},
//     {name: "Other", value: 5, color: "#FF8042"},
// ];
const SalesGraph = ({data}) => {
    const transformedData = Object.entries(data?.revenue_and_profit?.last_7_days_data || {}).map(([item]) => ({
        value: item?.daily_revenue, // Y-axis value (revenue)
        name: item?.day, // X-axis label (date)
    }));
    const pieChartData = Object.entries(data?.category_distribution || {}).map(([key, item]) => ({
        value: parseFloat(item?.category_revenue) || 0, // Y-axis value (revenue)
        name: item?.variant__product__sub_category__name, // X-axis label (sub-category name)
    }));

    // Define an array of colors for the pie chart
    const colors = ["#Ff0000", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
    return (
        <Row className="g-4">
            {/* Revenue Bar Chart */}
            <Col xs={12} lg={8}>
                <Card className="shadow-sm mb-4 rounded custom-card">
                    <Card.Body>
                        <h5 className="mb-4">Revenue</h5>
                        <div style={{width: "100%", height: "300px"}}>
                            {data?.revenue_and_profit?.last_7_days_data > 0 ? (
                                <ResponsiveContainer>
                                    <BarChart data={transformedData}>
                                        <CartesianGrid strokeDasharray="2 2" />
                                        <XAxis dataKey="day" />
                                        <YAxis tickFormatter={(day) => `₹${day.toLocaleString()}`} />
                                        <Tooltip formatter={(daily_revenue) => `₹${daily_revenue.toLocaleString()}`} />
                                        <Bar
                                            dataKey="daily_revenue"
                                            fill="#FF7300"
                                            barSize={10}
                                            radius={[5, 5, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <h4>No data</h4>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            {/* Revenue by Product Pie Chart */}
            <Col xs={12} lg={4}>
                <Card className="shadow-sm mb-4 rounded custom-card">
                    <Card.Body>
                        <h5 className="mb-4">Revenue by Product</h5>
                        <div style={{width: "100%", height: "300px"}}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="80%"
                                        fill="#FF7300"
                                        label={({percent}) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                        ))}
                                    </Pie>
                                    <Legend verticalAlign="bottom" align="center" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default SalesGraph;
