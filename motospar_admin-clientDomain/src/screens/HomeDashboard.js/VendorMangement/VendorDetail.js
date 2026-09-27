import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { VendorContext } from "../../../context/VendorContext";
import { Card, Table, Button, Image, Col, Form, Row, Offcanvas } from "react-bootstrap";
import { FaEye, FaArrowLeft, FaArrowRight, FaPhoneAlt, FaEnvelope, FaGlobe } from "react-icons/fa";
import { AiOutlineSearch, AiFillEdit, AiFillDelete } from "react-icons/ai";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
const VendorDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const vendorId = location.state?.vendorId;
    const [searchTerm, setSearchTerm] = useState("");
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

    const {
        VendorProducts,
        getSpecificVendor,
        vendorDetail,
        vendoritem,
        toastMessage,
        setCurrentPage,
        currentPage,
        hasNext,
        pageCount,
    } = useContext(VendorContext);

    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar

    const handleSearch = (event) => setSearchTerm(event.target.value);

    const filterVendorproduct = vendoritem.filter((item) =>
        item?.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    useEffect(() => {
        const fetchVendorDetails = async () => {
            try {
                await getSpecificVendor(vendorId);
                if (vendorDetail?.user) {
                    await VendorProducts(currentPage, vendorDetail?.user);
                }
            } catch (error) {
                console.error("Error fetching vendor details or products:", error);
            }
        };

        fetchVendorDetails();
    }, [vendorId, vendorDetail, currentPage]);

    return (
        <div className="d-flex flex-column flex-md-row">
            {/* Sidebar */}
            <div className="d-none d-md-block">
                <Sidebar />
            </div>

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

            {/* Main Content */}
            <div style={{ flex: 1 }}>
                <Header title={"Vendor Management"} toggleSidebar={toggleSidebar} />

                {/* Vendor Details */}
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center m-4">
                    <h4 className="text-center text-lg-start">{vendorDetail?.store_name}</h4>
                    <p className="text-muted text-center text-lg-end">
                        Joined the Platform on {dayjs(vendorDetail?.created_at).format("MMMM DD, YYYY") || "N/A"}
                    </p>
                </div>

                <Row className="g-4 p-4">
                    {/* Vendor Details Card */}
                    <Col lg={4} md={6} sm={12} className="d-flex ">
                        <Card className="text-center p-3 shadow-sm" style={{ width: "auto", margin: "auto" }}>
                            <div className="d-flex justify-content-center mt-3">
                                <Image
                                    src={
                                        vendorDetail?.store_logo
                                            ? `https://api.motospar.com${vendorDetail?.store_logo}`
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
                                    <h5 className="mb-0">
                                        {vendorDetail?.first_name} {vendorDetail?.last_name}
                                    </h5>
                                    {vendorDetail?.is_verified && (
                                        <FaCheckCircle className="ms-2" style={{ color: "green", fontSize: "20px" }} />
                                    )}
                                </Card.Title>
                                <Card.Text className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                                    Vendor ID: {vendorId}
                                </Card.Text>

                                <Card.Text className="d-flex align-items-center">
                                    <FaPhoneAlt className="me-2" />
                                    <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                                        {vendorDetail?.store_contact_phone ? vendorDetail?.store_contact_phone : "N/A"}
                                    </span>
                                </Card.Text>
                                <Card.Text className="d-flex align-items-center">
                                    <FaEnvelope className="me-2" />
                                    <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                                        {vendorDetail?.email}
                                    </span>
                                </Card.Text>
                                <Card.Text className="d-flex align-items-center">
                                    <FaGlobe className="me-2" />
                                    <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                                        {vendorDetail?.website_url ? vendorDetail?.website_url : "N/A"}
                                    </span>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Vendor Shop Details */}
                    <Col lg={8}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <h5>Shop Details</h5>
                                <hr />
                                <Form>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group controlId="storeName">
                                                <Form.Label>Shop Name</Form.Label>
                                                <Form.Control type="text" value={vendorDetail?.store_name} readOnly />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="address">
                                                <Form.Label>Address</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={vendorDetail?.store_address}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>State</Form.Label>
                                                <Form.Control type="text" value={vendorDetail?.store_state} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>City</Form.Label>
                                                <Form.Control type="text" value={vendorDetail?.store_city} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Pin Code</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Pin Code"
                                                    value={vendorDetail?.store_postal_code}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>GST Number</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="GST Number"
                                                    value={vendorDetail?.gst_number}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card.Body>
                            <hr className="divider " />
                            <h5 className="subHeading p-3">Vendor Bank Details</h5>
                            <hr className="divider " />
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Bank Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter Bank Name"
                                                value={vendorDetail?.bank_name}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>IFSC Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter IFSC Code"
                                                value={vendorDetail?.ifsc_code}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group controlId="formName" className="mt-3">
                                    <Form.Label>Account Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Bank Account Number"
                                        value={vendorDetail?.bank_account_number}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Vendor Products */}
                <Card className="shadow-sm m-4">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                                <h4 className="mb-3 mb-md-0">Vendor Products</h4>
                                <div className="wrapper d-flex align-items-center gap-2 w-100">
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
                                    style={{ cursor: !hasNext ? "not-allowed" : "pointer", opacity: !hasNext ? 0.5 : 1 }}
                                />
                            </div>
                        </div>

                        <Table bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Stock Quantity</th>
                                    <th>SKU</th>
                                    <th>Vendor Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            {
                                filterVendorproduct.length > 0 ?
                                    <tbody>
                                        {filterVendorproduct.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{index + 1}</td>
                                                <td>{item?.product?.name}</td>
                                                <td>{item?.product?.category?.name}</td>
                                                <td>{item?.stock_quantity}</td>
                                                <td>{item?.variant?.sku}</td>
                                                <td>{item?.price}</td>
                                                <td>
                                                    <Button variant="outline-primary" size="sm" className="me-2">
                                                        <FaEye />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm">
                                                        <AiFillDelete />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    :
                                    <h4 style={{
                                        margin: 20
                                    }}>No Vendor Products added!</h4>
                            }
                        </Table>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default VendorDetail;
