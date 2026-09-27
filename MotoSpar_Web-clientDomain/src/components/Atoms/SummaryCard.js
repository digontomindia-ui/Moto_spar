import React from "react";
import {Card, Row, Col} from "react-bootstrap";

const SummaryCards = ({data}) => {
    return (
        <Row className="gy-3 mb-4">
            <Col xs={12} sm={6} lg={3}>
                <Card className="shadow-sm rounded">
                    <Card.Body className="d-flex align-items-center justify-content-between">
                        <div>
                            <h6>Total Sales</h6>
                            <h4>{data?.total_revenue}</h4>
                        </div>
                        <img
                            src={require("../../assets/images/sales.png")}
                            style={{width: 50, height: 50}}
                            alt="Total Sales"
                        />
                    </Card.Body>
                </Card>
            </Col>

            <Col xs={12} sm={6} lg={3}>
                <Card className="shadow-sm rounded">
                    <Card.Body className="d-flex align-items-center justify-content-between">
                        <div>
                            <h6>Total Orders</h6>
                            <h4>{data?.total_order_count}</h4>
                        </div>
                        <img
                            src={require("../../assets/images/orders.png")}
                            style={{width: 50, height: 50}}
                            alt="Total Orders"
                        />
                    </Card.Body>
                </Card>
            </Col>

            <Col xs={12} sm={6} lg={3}>
                <Card className="shadow-sm rounded">
                    <Card.Body className="d-flex align-items-center justify-content-between">
                        <div>
                            <h6>Order Completed</h6>
                            <h4>{data?.delivered_count}</h4>
                        </div>
                        <img
                            src={require("../../assets/images/ship.png")}
                            style={{width: 50, height: 50}}
                            alt="Order Completed"
                        />
                    </Card.Body>
                </Card>
            </Col>

            <Col xs={12} sm={6} lg={3}>
                <Card className="shadow-sm rounded">
                    <Card.Body className="d-flex align-items-center justify-content-between">
                        <div>
                            <h6>Pending</h6>
                            <h4>{data?.vendor_accepted_count}</h4>
                        </div>
                        <img
                            src={require("../../assets/images/pending.png")}
                            style={{width: 50, height: 50}}
                            alt="Pending"
                        />
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default SummaryCards;
