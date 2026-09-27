import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { Table, Form, InputGroup, Button, Pagination, Badge, Card, Offcanvas } from "react-bootstrap";
import { AiOutlineSearch, AiFillEdit, AiFillDelete } from "react-icons/ai";
import dayjs from "dayjs";
import "../../../assets/Css/ProductList.css";
import { useNavigate } from "react-router-dom";
import { FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { VendorContext } from "../../../context/VendorContext";
import "../../../assets/Css/transaction.Css";
const TransectionList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [TransactionType, setTransactionType] = useState('customer')
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };
    const { AllOrders, orders, setuserDetail, setCurrentPage, currentPage, hasNext, pageCount } =
        useContext(VendorContext);

    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar

    useEffect(() => {
        AllOrders(currentPage);
    }, [currentPage]);

    const handleNextPage = () => {
        if (hasNext) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    const navigate = useNavigate();

    return (
        <div className="d-flex flex-column flex-md-row">
            <div className="d-none d-md-block">
                <Sidebar /> {/* Sidebar visible on large screens */}
            </div>

            {/* Offcanvas Sidebar for small screens */}
            <Offcanvas
                show={showSidebar}
                onHide={toggleSidebar}
                style={{ width: "100vh", backgroundColor: "#262D34", color: "white" }} // Custom color for the background
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="text-white">Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>

            <div style={{ flex: 1 }}>
                <Header title={"Transaction Management"} toggleSidebar={toggleSidebar} />
                <div className="m-4">
                    <h4>All Transaction's</h4>
                </div>
                <Card className="shadow-sm rounded custom-card m-4">
                    <div className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="wrapper mb-2 mb-md-0 w-100 w-md-auto" style={{ maxWidth: "700px" }}>
                                <AiOutlineSearch className="icon" />
                                <input
                                    className="input w-100"
                                    type="text"
                                    id="search"
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <span className="m-1">
                                    Page {currentPage} of {pageCount}
                                </span>
                                <FaArrowLeft
                                    className="m-1"
                                    onClick={handlePreviousPage}
                                    style={{
                                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                        opacity: currentPage === 1 ? 0.5 : 1,
                                    }}
                                />
                                <FaArrowRight
                                    className="m-1"
                                    onClick={handleNextPage}
                                    style={{
                                        cursor: !hasNext ? "not-allowed" : "pointer",
                                        opacity: !hasNext ? 0.5 : 1,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Add the table in a responsive wrapper */}
                        <div className="table-responsive">
                            <Table bordered responsive className="align-middle">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Payment ID</th>
                                        <th>Name</th>
                                        <th>Phone Number</th>
                                        <th>Amount</th>
                                        <th>Payment Mode</th>
                                        <th>Payment Status</th>
                                        <th>Date</th>
                                        <th>Transaction ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(
                                        (user, index) =>
                                            user?.payment_method === "PAYMENT_GATEWAY" && (
                                                <tr key={index}>
                                                    <td>{user?.order_code}</td>
                                                    <td>{user?.payment_id ? user?.payment_id : "N/A"}</td>
                                                    <td>{user?.customer_details?.full_name}</td>
                                                    <td>
                                                        {user?.customer_details?.phone_number
                                                            ? user?.customer_details?.phone_number
                                                            : "N/A"}
                                                    </td>
                                                    <td>₹{user?.total_price}</td>
                                                    <td>{user?.payment_method}</td>
                                                    <td>{user?.payment_status === "SUCCESS" ? "SUCCESS" : "FAILED"}</td>
                                                    <td>{dayjs(user?.created_at).format("YYYY-MM-DD")}</td>
                                                    <td>{user?.provider_order_id ? user?.provider_order_id : "N/A"}</td>
                                                </tr>
                                            )
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

export default TransectionList;
