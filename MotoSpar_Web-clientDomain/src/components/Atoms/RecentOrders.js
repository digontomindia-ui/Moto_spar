import React from "react";
import {Table, Card, Badge, Button} from "react-bootstrap";
import {FaEye, FaEdit, FaTrash} from "react-icons/fa";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";
import "../../assets/Css/recentorder.Css";
const RecentOrders = ({data}) => {
    const navigate = useNavigate();

    const filterOrder = (data || []).filter((order) =>
        order?.order_items?.some((item) => item?.order_status === "ADMIN_REVIEW" || item?.order_status === "PENDING")
    );

    return (
        <Card className="shadow-sm rounded mb-4">
            <Card.Body>
                <h5 className="mb-4">Pending Orders</h5>
                {/* Add a wrapper for horizontal scrolling */}
                <div className="table-responsive">
                    <Table bordered hover responsive className="align-middle">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Delivery</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filterOrder.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        No pending orders
                                    </td>
                                </tr>
                            ) : (
                                filterOrder.map((order, index) =>
                                    order?.order_items?.map((item, itemIndex) => (
                                        <tr key={item?.id}>
                                            {itemIndex === 0 && (
                                                <>
                                                    <td rowSpan={order?.order_items?.length}>{index + 1}</td>
                                                    <td rowSpan={order?.order_items?.length}>
                                                        {dayjs(order?.created_at).format("YYYY-MM-DD")}
                                                    </td>
                                                    <td rowSpan={order?.order_items?.length}>
                                                        {order?.customer_details?.full_name || "N/A"}
                                                    </td>
                                                </>
                                            )}
                                            <td>{item?.product?.name || "N/A"}</td>
                                            {itemIndex === 0 && (
                                                <td rowSpan={order?.order_items?.length}>
                                                    {order?.total_price || "N/A"}
                                                </td>
                                            )}
                                            <td>{order?.order_code || "N/A"}</td>
                                            <td>
                                                <Badge
                                                    pill
                                                    bg={
                                                        item?.order_status === "PENDING"
                                                            ? "warning"
                                                            : item?.order_status === "ADMIN_REVIEW"
                                                            ? "info"
                                                            : "success"
                                                    }
                                                >
                                                    {item?.order_status || "N/A"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    title="View"
                                                >
                                                    <FaEye />
                                                </Button>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    className="me-2"
                                                    title="Edit"
                                                    onClick={() =>
                                                        navigate("/orderDetail", {
                                                            state: {orderDetail: order, itemdetail: item},
                                                        })
                                                    }
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button variant="outline-danger" size="sm" title="Delete">
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    );
};

export default RecentOrders;
