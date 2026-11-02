import React, { useContext, useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, Image, Offcanvas, Spinner } from "react-bootstrap";
import { FaArrowLeft, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaUser } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { VendorContext } from "../../../context/VendorContext";
import "../../../assets/Css/PeopleManagement.css";

const formatDate = (value) => value
    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value))
    : "Not recorded";

const DetailField = ({ label, value }) => <div className="people-detail-field"><span>{label}</span><strong>{value || "Not recorded"}</strong></div>;

const UserDetail = () => {
    const { getSpecificUser, loadingactivity } = useContext(VendorContext);
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const userId = params.userId || location.state?.userDetail?.id;
    const requestRef = useRef(getSpecificUser);
    requestRef.current = getSpecificUser;
    const [showSidebar, setShowSidebar] = useState(false);
    const [user, setUser] = useState(location.state?.userDetail || null);
    const [pageError, setPageError] = useState("");

    useEffect(() => {
        if (!userId) return;
        let active = true;
        requestRef.current(userId).then((result) => {
            if (!active) return;
            if (result?.success) {
                setUser(result.data);
                setPageError("");
            } else setPageError(result?.message || "Customer details could not be loaded.");
        });
        return () => { active = false; };
    }, [userId]);

    if (!userId) {
        return <div className="people-missing-state"><FaUser /><h2>Customer reference is missing</h2><p>Open a customer from the customer directory.</p><Button className="savebtn" onClick={() => navigate("/userList")}>Back to customers</Button></div>;
    }

    return (
        <div className="d-flex people-management-shell">
            <div className="d-none d-md-block"><Sidebar /></div>
            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="bg-dark text-white"><Offcanvas.Header closeButton closeVariant="white"><Offcanvas.Title>Menu</Offcanvas.Title></Offcanvas.Header><Offcanvas.Body className="p-0"><Sidebar /></Offcanvas.Body></Offcanvas>
            <main className="people-management-main">
                <Header title="User Management" toggleSidebar={() => setShowSidebar((visible) => !visible)} />
                <div className="people-management-page">
                    <section className="people-page-heading"><div><button type="button" className="people-back-link" onClick={() => navigate("/userList")}><FaArrowLeft />Back to customers</button><h2>{user?.full_name || "Customer profile"}</h2><p>Joined the platform on {formatDate(user?.date_joined)}.</p></div></section>
                    {pageError ? <Alert variant="danger">{pageError}</Alert> : null}
                    {loadingactivity && !user ? <div className="people-empty-state"><Spinner animation="border" /><strong>Loading customer profile</strong></div> : user ? (
                        <div className="people-detail-layout">
                            <Card className="people-profile-card">
                                <Card.Body>
                                    <Image src={user.profile_picture || require("../../../assets/images/defaultprofile.webp")} roundedCircle className="people-profile-image" />
                                    <h3>{user.full_name || [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unnamed customer"}</h3>
                                    <Badge bg={user.is_active ? "success" : "secondary"}>{user.is_active ? "Active account" : "Inactive account"}</Badge>
                                    <span className="people-profile-id">Customer ID · {user.id}</span>
                                    <div className="people-contact-list"><div><FaEnvelope /><span>{user.email || "No email"}</span></div><div><FaPhoneAlt /><span>{user.phone_number || "No phone number"}</span></div><div><FaMapMarkerAlt /><span>{[user.city, user.state, user.country].filter(Boolean).join(", ") || "Location not set"}</span></div></div>
                                </Card.Body>
                            </Card>
                            <div className="people-detail-content">
                                <Card className="people-detail-card"><Card.Header><div><strong>Identity and account</strong><span>Customer registration and verification details</span></div></Card.Header><Card.Body className="people-detail-grid"><DetailField label="First name" value={user.first_name} /><DetailField label="Last name" value={user.last_name} /><DetailField label="Account type" value={user.account_type} /><DetailField label="Identity verification" value={user.is_verified ? "Verified" : "Not verified"} /><DetailField label="Date of birth" value={formatDate(user.date_of_birth)} /><DetailField label="Joined" value={formatDate(user.date_joined)} /></Card.Body></Card>
                                <Card className="people-detail-card"><Card.Header><div><strong>Address</strong><span>Contact and delivery location on the customer account</span></div></Card.Header><Card.Body className="people-detail-grid"><DetailField label="Address" value={user.address} /><DetailField label="City" value={user.city} /><DetailField label="State" value={user.state} /><DetailField label="Postal code" value={user.postal_code} /><DetailField label="Country" value={user.country} /><DetailField label="Country code" value={user.country_code} /></Card.Body></Card>
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
};

export default UserDetail;
