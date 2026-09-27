import React, { useContext, useEffect } from "react";
import { Container, Navbar, Button } from "react-bootstrap";
import { FaBell, FaBars } from "react-icons/fa";
import { useSelector } from "react-redux";
import { VendorContext } from "../../context/VendorContext";

const Header = ({ title, toggleSidebar }) => {
    const user = useSelector((state) => state.userData);
    const { getvendorDetail, vendorProfile } = useContext(VendorContext);
    useEffect(() => {
        getvendorDetail(user?.id);
    }, [user?.id]);
    return (
        <Navbar bg="white" className="shadow-sm custom-header" style={{ marginBottom: 20 }}>
            <Container fluid className="d-flex align-items-center">
                {/* Sidebar Toggle Button for Small Screens */}
                <Button variant="outline-primary" className="d-md-none me-2" onClick={toggleSidebar}>
                    <FaBars size={20} />
                </Button>

                {/* Header Title */}
                <div className="header-title flex-grow-1">{title}</div>

                {/* Notification and Profile Section */}
                <div className="header-icons d-flex align-items-center gap-3">
                    <FaBell className="notification-icon" size={20} />
                    <a href="/Profile">
                        <img
                            src={
                                vendorProfile?.store_logo
                                    ? `https://api.motospar.com${vendorProfile?.store_logo}`
                                    : require("../../assets/images/profileIcon.png")
                            }
                            alt="Profile"
                            className="profile-image"
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                objectFit: "cover",
                            }}
                        />
                    </a>
                </div>
            </Container>
        </Navbar>
    );
};

export default Header;
