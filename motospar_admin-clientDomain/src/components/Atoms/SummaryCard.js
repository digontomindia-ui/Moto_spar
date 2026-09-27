import React from "react";
import {Card, Row, Col} from "react-bootstrap";
import "../../assets/Css/Homedashboard.css";
const SummaryCards = ({data}) => {
    const formatNumber = (num) => {
        // Ensure the input is valid
        if (num == null || isNaN(num)) {
            return "0"; // Fallback to "0" if the input is invalid
        }

        // Format the number
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m"; // Millions
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k"; // Thousands
        } else {
            return num.toLocaleString(); // Numbers less than 1000 with locale formatting
        }
    };

    return (
        <Row className="g-3 mb-4">
            <Col xs={12} md={6} lg={3}>
                <Card className="shadow-sm rounded custom-card">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5>Total Revenue</h5>
                                <h2>₹{formatNumber(data?.revenue_and_profit?.total_revenue)}</h2>
                            </div>
                            <img
                                src={require("../../assets/images/sales.png")}
                                alt="Total Revenue"
                                className="summary-icon"
                            />
                        </div>
                        <p
                            className={
                                data?.revenue_and_profit?.revenue_change_percentage > 0
                                    ? "text-success"
                                    : data?.revenue_and_profit?.revenue_change_percentage < 0
                                    ? "text-error"
                                    : "text-neutral"
                            }
                        >
                            {data?.revenue_and_profit?.revenue_change_percentage}%
                            {data?.revenue_and_profit?.revenue_change_percentage > 0
                                ? " Up from yesterday"
                                : data?.revenue_and_profit?.revenue_change_percentage < 0
                                ? " Down from yesterday"
                                : " No change from yesterday"}
                        </p>
                    </Card.Body>
                </Card>
            </Col>
            <Col xs={12} md={6} lg={3}>
                <Card className="shadow-sm rounded custom-card">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5>Orders</h5>
                                <h2>{formatNumber(data?.order_statistics?.total_orders)}</h2>
                            </div>
                            <img
                                src={require("../../assets/images/orders.png")}
                                alt="Orders"
                                className="summary-icon"
                            />
                        </div>
                        <p
                            className={
                                data?.order_statistics?.order_change_percentage > 0
                                    ? "text-success"
                                    : data?.order_statistics?.order_change_percentage < 0
                                    ? "text-error"
                                    : "text-neutral"
                            }
                        >
                            {data?.order_statistics?.order_change_percentage}%
                            {data?.order_statistics?.order_change_percentage > 0
                                ? " Up from yesterday"
                                : data?.order_statistics?.order_change_percentage < 0
                                ? " Down from yesterday"
                                : " No change from yesterday"}
                        </p>
                    </Card.Body>
                </Card>
            </Col>
            <Col xs={12} md={6} lg={3}>
                <Card className="shadow-sm rounded custom-card">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5>Buyers</h5>
                                <h2>{formatNumber(data?.user_statistics?.active_customers)}</h2>
                            </div>
                            <img src={require("../../assets/images/buyer.png")} alt="Buyers" className="summary-icon" />
                        </div>
                        <p
                            className={
                                data?.revenue_and_profit?.revenue_change_percentage > 0
                                    ? "text-success"
                                    : data?.revenue_and_profit?.revenue_change_percentage < 0
                                    ? "text-error"
                                    : "text-neutral"
                            }
                        >
                            {data?.revenue_and_profit?.revenue_change_percentage}%
                            {data?.revenue_and_profit?.revenue_change_percentage > 0
                                ? " Up from yesterday"
                                : data?.revenue_and_profit?.revenue_change_percentage < 0
                                ? " Down from yesterday"
                                : " No change from yesterday"}
                        </p>
                    </Card.Body>
                </Card>
            </Col>
            <Col xs={12} md={6} lg={3}>
                <Card className="shadow-sm rounded custom-card">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5>Vendors</h5>
                                <h2>{formatNumber(data?.user_statistics?.active_vendors)}</h2>
                            </div>
                            <img
                                src={require("../../assets/images/vendor.png")}
                                alt="Vendors"
                                className="summary-icon"
                            />
                        </div>
                        <p className="text-success">8.5% Up from yesterday</p>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default SummaryCards;
