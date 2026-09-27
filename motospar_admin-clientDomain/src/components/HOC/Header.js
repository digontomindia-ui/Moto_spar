import React from "react";
import { Container, Navbar, Button } from "react-bootstrap";
import { FaBell, FaBars } from "react-icons/fa";
import { useSelector } from "react-redux";

const Header = ({ title, toggleSidebar }) => {
    const user = useSelector((state) => state.userData);

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
                    <a href="/MyProfile">
                        <img
                            src={user?.profile_picture ? `https://api.motospar.com${user?.profile_picture}` : require('../../assets/images/defaultprofile.webp')}
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
