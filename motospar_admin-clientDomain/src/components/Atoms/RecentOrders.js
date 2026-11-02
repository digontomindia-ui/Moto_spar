import React from "react";
import dayjs from "dayjs";
import { Badge, Button, Card, Spinner, Table } from "react-bootstrap";
import { FaArrowRight, FaClipboardCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

const pendingStatuses = new Set(["ADMIN_REVIEW", "PENDING"]);

const statusPresentation = {
    ADMIN_REVIEW: { label: "Admin review", background: "warning", text: "dark" },
    PENDING: { label: "Pending", background: "secondary" },
};

const RecentOrders = ({ data, loading }) => {
    const navigate = useNavigate();
    const pendingItems = (Array.isArray(data) ? data : [])
        .flatMap((order) =>
            (order?.order_items || [])
                .filter((item) => pendingStatuses.has(item?.order_status))
                .map((item) => ({ order, item }))
        )
        .slice(0, 8);

    const openOrder = (order, item) => {
        navigate("/orderDetail", { state: { orderDetail: order, itemdetail: item } });
    };

    return (
        <Card className="dashboard-panel dashboard-orders-panel">
            <Card.Header>
                <div>
                    <h3>Orders requiring attention</h3>
                    <p>Pending orders and items waiting for admin review</p>
                </div>
                <Button variant="link" onClick={() => navigate("/orderList")}>
                    View all orders <FaArrowRight className="ms-2" aria-hidden="true" />
                </Button>
            </Card.Header>

            <Card.Body className="p-0">
                {loading ? (
                    <div className="dashboard-panel-loading">
                        <Spinner animation="border" />
                    </div>
                ) : pendingItems.length ? (
                    <div className="table-responsive">
                        <Table hover className="dashboard-orders-table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th className="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingItems.map(({ order, item }) => {
                                    const status = statusPresentation[item?.order_status] || {
                                        label: item?.order_status || "Unknown",
                                        background: "light",
                                        text: "dark",
                                    };

                                    return (
                                        <tr key={`${order?.id}-${item?.id}`}>
                                            <td>
                                                <strong>{order?.order_code || "No reference"}</strong>
                                            </td>
                                            <td>{dayjs(order?.created_at).format("DD MMM YYYY")}</td>
                                            <td>{order?.customer_details?.full_name || "Not available"}</td>
                                            <td>{item?.product?.name || "Product unavailable"}</td>
                                            <td>{currency.format(Number(item?.item_total_price ?? order?.total_price) || 0)}</td>
                                            <td>
                                                <Badge bg={status.background} text={status.text} pill>
                                                    {status.label}
                                                </Badge>
                                            </td>
                                            <td className="text-end">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => openOrder(order, item)}
                                                >
                                                    Review
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <div className="dashboard-orders-empty">
                        <FaClipboardCheck aria-hidden="true" />
                        <strong>No orders need attention</strong>
                        <span>New pending orders will appear here automatically.</span>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default RecentOrders;
