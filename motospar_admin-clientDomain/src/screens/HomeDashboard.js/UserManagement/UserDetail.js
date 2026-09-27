import React, {useContext, useEffect, useState} from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import {VendorContext} from "../../../context/VendorContext";
import {Card, Button, Image, Col, Form, Row, Offcanvas} from "react-bootstrap";
import {FaPhoneAlt, FaEnvelope, FaGlobe} from "react-icons/fa";
import dayjs from "dayjs";
import {useLocation} from "react-router-dom";
const UserDetail = () => {
    const {toastMessage} = useContext(VendorContext);
    const location = useLocation();
    const userDetail = location.state?.userDetail;
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
    console.log("jhdbfjh", userDetail);

    return (
        <div className="d-flex">
            <div className="d-none d-md-block">
                <Sidebar /> {/* Sidebar visible on large screens */}
            </div>

            {/* Offcanvas Sidebar for small screens */}
            <Offcanvas
                show={showSidebar}
                onHide={toggleSidebar}
                style={{width: "100vh", backgroundColor: "#262D34", color: "white"}} // Custom color for the background
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="text-white">Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>
            <div style={{flex: 1}}>
                <Header title={"Vendor Management"} toggleSidebar={toggleSidebar} />
                <div className="d-flex justify-content-between align-items-center m-4">
                    <h4>{userDetail?.full_name}</h4>
                    <p className="text-muted">
                        Joined the Platform on {dayjs(userDetail?.date_joined).format("MMMM DD, YYYY") || "N/A"}
                    </p>
                </div>
                <div className="d-flex flex-wrap p-4">
                    <div className="mt-4">
                        <Card className="text-center p-3 shadow-sm" style={{Width: "auto", margin: "auto"}}>
                            <div className="d-flex justify-content-center mt-3">
                                <Image
                                    src={
                                        userDetail?.profile_picture
                                            ? userDetail?.profile_picture
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
                                <Card.Title className="mt-2 mb-1">
                                    <h5>{userDetail?.full_name}</h5>
                                </Card.Title>
                                <Card.Text className="text-muted mb-4" style={{fontSize: "0.9rem"}}>
                                    User ID: ADV-896523alrjgakjdsnglakjsdngljSH
                                </Card.Text>

                                <Card.Text className="d-flex align-items-center ">
                                    <FaPhoneAlt className="me-2 " />{" "}
                                    <Card.Text className="text-muted " style={{fontSize: "0.9rem"}}>
                                        {userDetail?.phone_number ? userDetail?.phone_number : "N/A"}
                                    </Card.Text>
                                </Card.Text>
                                <Card.Text className="d-flex align-items-center">
                                    <FaEnvelope className="me-2" />{" "}
                                    <Card.Text className="text-muted " style={{fontSize: "0.9rem"}}>
                                        {userDetail?.email}
                                    </Card.Text>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>
                    <Card className="shadow-sm rounded m-4" style={{flex: 1}}>
                        <h5 className="subHeading p-3">Basic Details</h5>
                        <hr className="divider " />
                        <Card.Body>
                            <Form>
                                <Form.Group controlId="formName">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={userDetail?.address ? userDetail?.address : "N/A"}
                                    />
                                </Form.Group>

                                <Row className="mt-3">
                                    <Col md={4}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>State</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={userDetail?.state ? userDetail?.state : "N/A"}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={userDetail?.city ? userDetail?.city : "N/A"}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Pincode</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={userDetail?.postal_code ? userDetail?.postal_code : "N/A"}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
