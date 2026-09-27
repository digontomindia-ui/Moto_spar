import React, {useContext, useEffect, useState} from "react";
import {VendorContext} from "../../context/VendorContext";
import {Badge, Button, Card, Offcanvas, Table} from "react-bootstrap";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import {AiOutlineSearch, AiFillEdit, AiFillDelete} from "react-icons/ai";
import {FaEye, FaArrowLeft, FaArrowRight} from "react-icons/fa";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";

const OrderList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };
    const [showSidebar, setShowSidebar] = useState(false);

    const toggleSidebar = () => setShowSidebar(!showSidebar);
    const {AllOrders, orders, setCurrentPage, currentPage, hasNext, pageCount} = useContext(VendorContext);

    const filteredOrders = orders.filter((order) =>
        order?.order_items?.some(
            (item) =>
                item?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order?.order_code?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleNextPage = () => {
        if (hasNext) setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
    };

    useEffect(() => {
        AllOrders(currentPage);
    }, [currentPage]);

    return (
        <div className="d-flex flex-column flex-md-row">
            {/* Sidebar */}
            <div className="d-none d-md-block">
                <Sidebar />
            </div>

            {/* Offcanvas Sidebar */}
            <Offcanvas
                show={showSidebar}
                onHide={toggleSidebar}
                className="bg-dark text-white"
                style={{width: "250px"}}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title></Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>

            <div className="flex-grow-1">
                <Header title="Order Management" toggleSidebar={toggleSidebar} />
                <div className="m-3">
                    <h4>All Orders</h4>
                </div>

                <Card className="shadow-sm rounded custom-card m-3">
                    <div className="p-3">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2">
                            <div className="wrapper mb-2 mb-md-0 w-50">
                                <AiOutlineSearch className="icon" />
                                <input
                                    className="input"
                                    type="text"
                                    id="search"
                                    placeholder="Search by name or delivery code"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span>
                                    Page {currentPage} of {pageCount}
                                </span>
                                <FaArrowLeft
                                    className="cursor-pointer"
                                    onClick={handlePreviousPage}
                                    style={{
                                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                        opacity: currentPage === 1 ? 0.5 : 1,
                                    }}
                                />
                                <FaArrowRight
                                    className="cursor-pointer"
                                    onClick={handleNextPage}
                                    style={{
                                        cursor: !hasNext ? "not-allowed" : "pointer",
                                        opacity: !hasNext ? 0.5 : 1,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <Table className="align-middle">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Qty.</th>
                                        <th>Order Status</th>
                                        <th>Order Date</th>
                                        <th>Total Price</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) =>
                                        order?.order_items?.map((item) => (
                                            <tr key={item.id}>
                                                <td className="text-truncate">{order?.order_code}</td>
                                                <td className="text-truncate">{item?.product?.name}</td>
                                                <td>{item?.product?.category?.name}</td>
                                                <td>{item?.quantity}</td>
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
                                                </td>
                                                <td>{dayjs(order?.order_date).format("YYYY-MM-DD")}</td>
                                                <td>{item?.price}</td>
                                                <td className="d-flex ">
                                                    <Button variant="outline-primary" size="sm" className="me-2">
                                                        <FaEye />
                                                    </Button>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() =>
                                                            navigate("/orderDetail", {
                                                                state: {orderDetail: order, itemdetail: item},
                                                            })
                                                        }
                                                    >
                                                        <AiFillEdit />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm">
                                                        <AiFillDelete />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default OrderList;
