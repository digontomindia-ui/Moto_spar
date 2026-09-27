import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { VendorContext } from "../../../context/VendorContext";
import { Card, Button, Image, Col, Form, Row, Offcanvas } from "react-bootstrap";
import { FaPhoneAlt, FaEnvelope, FaCheckCircle, FaGlobe } from "react-icons/fa";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import ToastComponent from "../../../components/HOC/Toast";

const SpecifcProductList = () => {
    const { updateProductRequest, toastMessage } = useContext(VendorContext);
    const location = useLocation();
    const product = location.state?.product;
    const [ShowToast, setShowToast] = useState(false);
    const [message, setmessage] = useState("");
    const [showSidebar, setShowSidebar] = useState(false);

    const toggleSidebar = () => setShowSidebar(!showSidebar);

    const handleReject = (value) => {
        updateProductRequest(product?.id, value);
        setmessage("Product has been Rejected");
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 5000);
    };

    const handleAccept = (value) => {
        updateProductRequest(product?.id, value);
        setmessage("Product has been Accepted");
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 5000);
    };

    return (
        <div className="d-flex">
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
                <Header title={"Vendor Management"} toggleSidebar={toggleSidebar} />
                <ToastComponent
                    show={ShowToast}
                    type={message === "Product has been Accepted" ? "success" : "error"}
                    message={message}
                    onClose={() => setShowToast(false)}
                />

                <div className="d-flex justify-content-between align-items-center m-4">
                    <h4>{product?.vendor?.full_name}</h4>
                </div>

                <div className="d-flex flex-wrap p-3">
                    <Col lg={4} md={6} sm={12} className="d-flex ">
                        <Card className="text-center p-3 shadow-sm" style={{ width: "auto", margin: "auto" }}>
                            <div className="d-flex justify-content-center mt-3">
                                <Image
                                    src={
                                        product?.vendor_profile?.store_logo
                                            ? `https://api.motospar.com${product?.vendor_profile?.store_logo}`
                                            : require("../../../assets/images/defaultprofile.webp")
                                    }
                                    roundedCircle
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        display: "block",
                                        margin: "auto",
                                        objectFit: "cover",
                                    }}
                                />
                            </div>
                            <Card.Body>
                                <Card.Title
                                    className="mt-2 mb-1"
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifySelf: "center",
                                    }}
                                >
                                    <h5 className="mb-0">{product?.vendor?.full_name}</h5>
                                    {product?.vendor?.is_verified && (
                                        <FaCheckCircle className="ms-2" style={{ color: "green", fontSize: "20px" }} />
                                    )}
                                </Card.Title>
                                <Card.Text className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                                    Vendor ID: {product?.vendor?.id}
                                </Card.Text>

                                <Card.Text className="d-flex align-items-center">
                                    <FaPhoneAlt className="me-2" />
                                    <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                                        {product?.vendor_profile?.store_contact_phone
                                            ? product?.vendor_profile?.store_contact_phone
                                            : "N/A"}
                                    </span>
                                </Card.Text>
                                <Card.Text className="d-flex align-items-center">
                                    <FaEnvelope className="me-2" />
                                    <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                                        {product?.vendor?.email ? product?.vendor?.email : "N/A"}
                                    </span>
                                </Card.Text>
                                <Card.Text className="d-flex align-items-center">
                                    <FaGlobe className="me-2" />
                                    <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                                        {product?.vendor_profile?.website_url
                                            ? product?.vendor_profile?.website_url
                                            : "N/A"}
                                    </span>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Product Details Card */}
                    <Col lg={8}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <h5>Product Details</h5>
                                <hr />
                                <Form>
                                    <Form.Group controlId="formName">
                                        <Form.Label>Product Name</Form.Label>
                                        <Form.Control type="text" value={product?.name || "N/A"} readOnly />
                                    </Form.Group>

                                    <Row className="mt-3">
                                        <Col xs={12} md={6}>
                                            <Form.Group controlId="formCategory">
                                                <Form.Label>Product Category</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={product?.category?.name || "N/A"}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Form.Group controlId="formSubCategory">
                                                <Form.Label>Product Sub-Category</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={product?.sub_category?.name || "N/A"}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mt-3">
                                        <Col xs={12} md={6}>
                                            <Form.Group controlId="formPrice">
                                                <Form.Label>Price</Form.Label>
                                                <Form.Control type="text" value={product?.price || "N/A"} readOnly />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Form.Group controlId="formStatus">
                                                <Form.Label>Status</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={product?.is_active ? "Active" : "Inactive"}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group controlId="formDescription" className="mt-3">
                                        <Form.Label>Product Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={product?.description || "N/A"}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Form>

                                <div className="d-flex align-items-center gap-3 mt-4 justify-content-end">
                                    <Button variant="outline-warning" onClick={() => handleReject("rejected")}>
                                        Reject
                                    </Button>
                                    <Button variant="success" onClick={() => handleAccept("approved")}>
                                        Accept
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </div>
            </div>
        </div>
    );
};

export default SpecifcProductList;
