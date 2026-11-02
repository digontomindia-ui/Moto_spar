import React from "react";
import { Button } from "react-bootstrap";
import { FaBars, FaRegBell } from "react-icons/fa";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { resolveImageUrl } from "../../utils/imageUtils";
import "../../assets/Css/AdminShell.css";

const getDisplayName = (user) => {
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
    return fullName || user?.name || user?.email || "Administrator";
};

const Header = ({ title, toggleSidebar }) => {
    const user = useSelector((state) => state.userData);
    const displayName = getDisplayName(user);
    const profileImage = user?.profile_picture
        ? resolveImageUrl(user.profile_picture)
        : require("../../assets/images/defaultprofile.webp");

    return (
        <header className="admin-header">
            <div className="admin-header-title-wrap">
                <Button
                    variant="light"
                    className="admin-mobile-menu d-md-none"
                    onClick={toggleSidebar}
                    aria-label="Open navigation menu"
                >
                    <FaBars aria-hidden="true" />
                </Button>
                <div>
                    <span className="admin-header-eyebrow">MotoSpar operations</span>
                    <h1>{title}</h1>
                </div>
            </div>

            <div className="admin-header-actions">
                <button type="button" className="admin-notification-button" aria-label="Notifications">
                    <FaRegBell aria-hidden="true" />
                    <span className="admin-notification-dot" aria-hidden="true" />
                </button>

                <NavLink to="/MyProfile" className="admin-profile-link" aria-label="Open profile">
                    <img src={profileImage} alt="" className="admin-profile-image" />
                    <span className="admin-profile-copy">
                        <strong>{displayName}</strong>
                        <small>Administrator</small>
                    </span>
                </NavLink>
            </div>
        </header>
    );
};

export default Header;
