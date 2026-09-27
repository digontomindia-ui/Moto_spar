import React, {useState} from "react";
import Sidebar from "../components/Atoms/Sidebar";
import {Card, Offcanvas, Button} from "react-bootstrap";
import Header from "../components/HOC/Header";
import {FaEnvelope, FaPhoneAlt, FaGlobe} from "react-icons/fa";

const Support = () => {
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

    const toggleSidebar = () => setShowSidebar(!showSidebar);

    return (
        <div className="d-flex flex-column flex-md-row">
            {/* Sidebar for larger screens */}
            <div className="d-none d-md-block">
                <Sidebar />
            </div>

            {/* Sidebar for mobile */}
            <Offcanvas
                show={showSidebar}
                onHide={toggleSidebar}
                className="bg-dark text-white"
                style={{width: "250px"}}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main content */}
            <div className="flex-grow-1">
                <Header title={"Help and Support"} toggleSidebar={toggleSidebar} />

                {/* Card container */}
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: "80vh"}}>
                    <Card className="shadow-lg" style={{width: "100%", maxWidth: "500px"}}>
                        <Card.Body className="text-center ">
                            {/* Brand section */}
                            <div className="brand mb-4 align-items-center justify-content-center">
                                <img
                                    src={require("../assets/images/Logo.png")}
                                    alt="logo"
                                    className="img-fluid mb-2"
                                    style={{maxHeight: "80px"}}
                                />
                                <h1>Motospar</h1>
                            </div>

                            {/* Phone contact */}
                            <Card.Text className="d-flex align-items-center justify-content-center mb-3">
                                <FaPhoneAlt className="me-2" />
                                <span className="text-muted" style={{fontSize: "1rem"}}>
                                    +91 79082 54954
                                </span>
                            </Card.Text>

                            {/* Email contact */}
                            <Card.Text className="d-flex align-items-center justify-content-center mb-3">
                                <FaEnvelope className="me-2" />
                                <span className="text-muted" style={{fontSize: "1rem"}}>
                                    support@motospar.com
                                </span>
                            </Card.Text>

                            {/* Website link */}
                            <Card.Text className="d-flex align-items-center justify-content-center mb-3">
                                <FaGlobe className="me-2" />
                                <a
                                    href="https://motospar.com/policy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none text-primary"
                                    style={{fontSize: "1rem"}}
                                >
                                    Visit our website for more information
                                </a>
                            </Card.Text>

                            {/* CTA Button */}
                            <Button
                                href="https://motospar.com/policy"
                                target="_blank"
                                className="mt-4"
                                variant="primary"
                            >
                                Contact Us Now
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Support;
