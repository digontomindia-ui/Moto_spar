import React, { useContext, useState } from "react";
import { Button, Card, Col, Form, Offcanvas } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import { FaPhoneAlt, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaMoneyBillWave, FaFileInvoice } from "react-icons/fa";
import dayjs from "dayjs";
import ToastComponent from "../../components/HOC/Toast";
import { VendorContext } from "../../context/VendorContext";

const OrderDetail = () => {
    const { updateProductStatus, toastMessage, settoastMessage } = useContext(VendorContext);
    const location = useLocation();
    const orderDetail = location.state?.orderDetail;
    const itemdetail = location.state?.itemdetail;

    const [ShowToast, setShowToast] = useState(false);
    const [currentStatus, setcurrentStatus] = useState(itemdetail?.order_status);
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile
    console.log("id", itemdetail?.id);
    const handleUpdateStatus = (value) => {
        setcurrentStatus(value);
        updateProductStatus(itemdetail?.id, value);
        {
            value === "CANCELLED" && settoastMessage("Order has been Cancelled !");
        }
        setShowToast(true);

        setTimeout(() => {
            setShowToast(false);
        }, 5000); //
    };
    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
    return (
        <div className="d-flex">
            <div className="d-none d-md-block">
                <Sidebar /> {/* Sidebar visible on large screens */}
            </div>

            {/* Offcanvas Sidebar for small screens */}
            <Offcanvas
                show={showSidebar}
                onHide={toggleSidebar}
                className="bg-dark text-white"
                style={{ width: "250px" }}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Sidebar /> {/* Sidebar content */}
                </Offcanvas.Body>
            </Offcanvas>
            <div style={{ flex: 1 }}>
                <Header title={"Order Management"} toggleSidebar={toggleSidebar} />
                <div style={{ flex: 1, height: "auto" }}>
                    <Card className="shadow-sm rounded m-5">
                        <h5 className="subHeading">Order Action</h5>
                        <hr className="divider " />
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between ">
                                <div>
                                    <Card.Text className="text mb-1" style={{ fontSize: "1rem" }}>
                                        #{orderDetail?.order_code}
                                    </Card.Text>
                                    <Card.Text className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
                                        {dayjs(orderDetail?.order_date).format("MMMM D, YYYY [at] h:mm A")}
                                    </Card.Text>
                                </div>
                                <div className="d-flex align-items-center">
                                    <FaFileInvoice className="me-2" />{" "}
                                    <a href="#" className="nav-link text-muted fs-8">
                                        Invoice
                                    </a>
                                </div>
                            </div>
                            <Col md={6}>
                                <Form.Group controlId="stockStatus">
                                    <Form.Label className="pt-3">Current Status</Form.Label>
                                    <Form.Select
                                        value={currentStatus} // Bind the value to the state
                                        onChange={(e) => {
                                            handleUpdateStatus(e.target.value);
                                            console.log(e.target.value);
                                        }}
                                    >
                                        <option value="VENDOR_ACCEPTED">VENDOR_ACCEPTED</option>
                                        <option value="DELIVERED">DELIVERED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <div className="d-flex align-items-center justify-content-between mt-3">
                                <div>
                                    <Card.Text className="text mb-1" style={{ fontSize: "1rem" }}>
                                        Shipped with India Post
                                    </Card.Text>
                                </div>
                                <div className="d-flex align-items-center">
                                    <a href="#" className="nav-link text-warning fs-8 color-oange">
                                        See all updates
                                    </a>
                                </div>
                            </div>
                            <div className="d-flex align-items-center mt-3">
                                <Button variant="outline-warning" className="me-3">
                                    Refund
                                </Button>
                                <Button
                                    variant="outline-warning"
                                    className="me-3"
                                    onChange={(e) => {
                                        handleUpdateStatus("CANCELLED");
                                    }}
                                >
                                    Cancel Order
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

        </div>
    );
};

export default OrderDetail;
