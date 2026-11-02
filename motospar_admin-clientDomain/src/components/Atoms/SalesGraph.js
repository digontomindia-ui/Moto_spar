import React from "react";
import { Card, Col, Row, Spinner } from "react-bootstrap";
import { FaChartBar } from "react-icons/fa";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const chartColors = ["#f97316", "#2563eb", "#0d9488", "#7c3aed", "#eab308", "#dc2626"];
const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const EmptyChart = ({ copy }) => (
    <div className="dashboard-empty-chart">
        <FaChartBar aria-hidden="true" />
        <strong>No revenue data yet</strong>
        <span>{copy}</span>
    </div>
);

const SalesGraph = ({ data, loading }) => {
    const revenueData = (data?.revenue_and_profit?.last_7_days_data || []).map((item) => ({
        name: item?.day
            ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
                  new Date(`${item.day}T00:00:00`)
              )
            : "—",
        revenue: Number(item?.daily_revenue) || 0,
    }));

    const categoryData = (data?.category_distribution || [])
        .map((item) => ({
            value: Number(item?.category_revenue) || 0,
            name:
                item?.variant__product__sub_category__name ||
                item?.variant__product__category__name ||
                "Uncategorised",
        }))
        .filter((item) => item.value > 0);

    return (
        <Row className="g-3 dashboard-chart-row">
            <Col xs={12} xl={8}>
                <Card className="dashboard-panel h-100">
                    <Card.Header>
                        <div>
                            <h3>Revenue trend</h3>
                            <p>Successful payments over the last seven days</p>
                        </div>
                        <span className="dashboard-period">Last 7 days</span>
                    </Card.Header>
                    <Card.Body>
                        {loading ? (
                            <div className="dashboard-panel-loading">
                                <Spinner animation="border" />
                            </div>
                        ) : revenueData.length ? (
                            <div className="dashboard-chart-canvas">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData} margin={{ top: 12, right: 8, left: 2, bottom: 0 }}>
                                        <CartesianGrid stroke="#e8edf3" strokeDasharray="4 4" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#667085" }} />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            width={72}
                                            tick={{ fill: "#667085" }}
                                            tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "rgba(249, 115, 22, 0.06)" }}
                                            formatter={(value) => [currency.format(Number(value) || 0), "Revenue"]}
                                        />
                                        <Bar dataKey="revenue" fill="#f97316" radius={[7, 7, 0, 0]} maxBarSize={38} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <EmptyChart copy="Completed, paid orders will appear here automatically." />
                        )}
                    </Card.Body>
                </Card>
            </Col>

            <Col xs={12} xl={4}>
                <Card className="dashboard-panel h-100">
                    <Card.Header>
                        <div>
                            <h3>Revenue mix</h3>
                            <p>Revenue grouped by product category</p>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        {loading ? (
                            <div className="dashboard-panel-loading">
                                <Spinner animation="border" />
                            </div>
                        ) : categoryData.length ? (
                            <div className="dashboard-chart-canvas revenue-mix-chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="43%"
                                            innerRadius={58}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            stroke="none"
                                        >
                                            {categoryData.map((item, index) => (
                                                <Cell key={`${item.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => currency.format(Number(value) || 0)} />
                                        <Legend
                                            verticalAlign="bottom"
                                            iconType="circle"
                                            formatter={(value) => <span className="dashboard-legend-label">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <EmptyChart copy="Category performance will appear after successful sales." />
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default SalesGraph;
