// components/RecentOrders.js
import React from "react";
import {Table, Card, Badge, Button} from "react-bootstrap";
import {FaEdit, FaEye, FaTrash} from "react-icons/fa"; // Icons for Actions
import {AiOutlineSearch, AiFillEdit, AiFillDelete} from "react-icons/ai";
import dayjs from "dayjs";
import "../../assets/Css/ProductList.css";
import {useNavigate} from "react-router-dom";
const RecentOrders = ({data}) => {
    const navigate = useNavigate();
    const filterOrder = (data || [])?.filter((order) => {
        // Check if any item in order_items has the desired status
        return order.order_items?.some(
            (item) => item.order_status === "ADMIN_REVIEW" || item.order_status === "PENDING"
        );
    });
    console.log("pending", data);
    return (
        <Card className="shadow-sm rounded custom-card">
            <Card.Body>
                <h4>Pending Orders</h4>
                <Table bordered responsive className="align-middle">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Order Date</th>
                            <th>Customer</th>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Delivery No.</th>
                            <th>Order Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterOrder.map((order, index) => {
                            const totalItems = order?.order_items?.length || 0; // Total items in this order
                            const isNewUser =
                                index === 0 || // First order always starts a new user group
                                filterOrder[index - 1]?.customer_details?.id !== order?.customer_details?.id;

                            return order?.order_items?.map((item, itemIndex) => (
                                <tr
                                    key={`${order?.id}-${item?.id}`}
                                    className={isNewUser ? "bg-dark text-white" : "bg-light"}
                                >
                                    {/* Render Order ID, Date, and Customer Name only for the first item */}
                                    {itemIndex === 0 && (
                                        <>
                                            <td rowSpan={totalItems} className={isNewUser ? "border-top" : ""}>
                                                {index + 1}
                                            </td>{" "}
                                            {/* Order Index */}
                                            <td rowSpan={totalItems} className={isNewUser ? "border-top" : ""}>
                                                {dayjs(order?.created_at).format("YYYY-MM-DD")}
                                            </td>{" "}
                                            {/* Order Date */}
                                            <td rowSpan={totalItems} className={isNewUser ? "border-top" : ""}>
                                                {order?.customer_details?.full_name || "N/A"}
                                            </td>{" "}
                                            {/* Customer Name */}
                                        </>
                                    )}
                                    {/* Product Details */}
                                    <td>{item?.product?.name || "N/A"}</td> {/* Product Name */}
                                    {itemIndex === 0 && (
                                        <td rowSpan={totalItems} className={isNewUser ? "border-top" : ""}>
                                            {order?.total_price || "N/A"}
                                        </td>
                                    )}
                                    <td>{order?.order_code || "N/A"}</td> {/* Item Price */}
                                    <td>
                                        {item?.order_status === "ADMIN_REVIEW" ? (
                                            <Badge pill bg="warning">
                                                In Review
                                            </Badge>
                                        ) : item?.order_status === "PENDING" ? (
                                            <Badge pill bg="warning">
                                                Pending
                                            </Badge>
                                        ) : item?.order_status === "ASSIGNED_TO_VENDOR" ? (
                                            <Badge pill bg="info">
                                                Request Sent
                                            </Badge>
                                        ) : item?.order_status === "VENDOR_ACCEPTED" ? (
                                            <Badge pill bg="success">
                                                Request Accepted
                                            </Badge>
                                        ) : item?.order_status === "DELIVERED" ? (
                                            <Badge pill bg="success">
                                                Delivered
                                            </Badge>
                                        ) : item?.order_status === "CANCELLED" ? (
                                            <Badge pill bg="danger">
                                                Cancelled
                                            </Badge>
                                        ) : (
                                            "N/A"
                                        )}
                                    </td>{" "}
                                    {/* Order Status */}
                                    {/* Render Actions only for the first item */}
                                    <td>
                                        <Button variant="outline-primary" size="sm" className="me-2" title="View">
                                            <FaEye />
                                        </Button>
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            className="me-2"
                                            title="Edit"
                                            onClick={() => {
                                                navigate("/orderDetail", {
                                                    state: {orderDetail: order, itemdetail: item},
                                                });
                                            }}
                                        >
                                            <AiFillEdit />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" title="Delete">
                                            <AiFillDelete />
                                        </Button>
                                    </td>
                                </tr>
                            ));
                        })}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default RecentOrders;
