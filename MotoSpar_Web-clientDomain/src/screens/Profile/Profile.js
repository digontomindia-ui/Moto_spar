import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import ProfileCard from "../../components/Atoms/ProfileCard";
import { useSelector } from "react-redux";
import { Button, Card, Col, Form, Offcanvas, Row } from "react-bootstrap";
import dayjs from "dayjs";
import { VendorContext } from "../../context/VendorContext";
import ToastComponent from "../../components/HOC/Toast";

const Profile = () => {
    const user = useSelector((state) => state.userData);
    const vendor_shopDetail = useSelector((state) => state.vendor_shopDetail);
    const { EditProfile, toastMessage, getvendorDetail, vendorProfile } = useContext(VendorContext);

    // State for user details
    const [first_name, setFirstName] = useState(user?.first_name);
    const [last_name, setLastName] = useState(user?.last_name);
    const [phone_number, setPhoneNumber] = useState(vendorProfile?.store_contact_phone || "N/A");
    const [email, setEmail] = useState(user?.email);
    const [shop_image, setShopImage] = useState("");
    const [shopName, setShopName] = useState(vendorProfile?.store_name);
    const [gstNumber, setGstNumber] = useState(vendorProfile?.gst_number || "");
    const [address, setAddress] = useState(vendorProfile?.store_address || "");
    const [state, setState] = useState(vendorProfile?.store_state || "");
    const [city, setCity] = useState(vendorProfile?.store_city || "");
    const [pincode, setPincode] = useState(vendorProfile?.store_postal_code || "");
    const [bankName, setBankName] = useState(vendorProfile?.bank_name || "");
    const [accountNumber, setAccountNumber] = useState(vendorProfile?.bank_account_number || "");
    const [ifsc, setIfsc] = useState(vendorProfile?.ifsc_code || "");
    const [lat, setLat] = useState(null);
    const [long, setLong] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [previewImage, setpreviewImage] = useState("");
    const [showSidebar, setShowSidebar] = useState(false);

    // Function to toggle the sidebar for smaller screens
    const toggleSidebar = () => setShowSidebar(!showSidebar);

    // Function to handle profile updates
    const handleEditProfile = () => {
        const updatedData = {
            id: user?.vendor_profile?.id, // Correctly define the key and value
            shopName,
            address,
            email,
            phone_number,
            lat,
            long,
            accountNumber,
            bankName,
            ifsc,
            gstNumber,
            pincode,
            state,
            city,
        };

        // Add shop_image only if it exists and is not already a string
        if (shop_image && typeof shop_image !== "string") {
            updatedData.shop_image = shop_image;
        }

        // Call the EditProfile function with the updated data
        EditProfile(updatedData);

        // Show a toast notification for success
        setShowToast(true);

        // Automatically hide the toast after 5 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 5000);

        // Exit edit mode
        setIsEdit(false);
    };

    // handling image field
    const handleImageChange = (e) => {
        setShopImage(e.target.files[0]);
        const file = e.target.files[0];
        if (file) {
            setShopImage(file); // Store the file object for backend usage
            const reader = new FileReader();
            reader.onloadend = () => {
                setpreviewImage(reader.result); // Set the Base64 string as the preview image
            };
            reader.readAsDataURL(file); // Convert file to Base64 URL
        }
    };
    // Function to enable/disable edit mode
    const handleIsEdit = (data) => {
        setIsEdit(data);
    };

    // Get user's current location (latitude and longitude)
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(

                (position) => {
                    console.log('loca', position.coords.latitude, position.coords.longitude)
                    setLat(position.coords.latitude);
                    setLong(position.coords.longitude);
                },
                (error) => {
                    console.error("Error getting location:", error);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };
    useEffect(() => {
        if (vendorProfile) {
            setPhoneNumber(vendorProfile?.store_contact_phone || "N/A");
            setShopName(vendorProfile?.store_name || "");
            setGstNumber(vendorProfile?.gst_number || "");
            setAddress(vendorProfile?.store_address || "");
            setState(vendorProfile?.store_state || "");
            setCity(vendorProfile?.store_city || "");
            setPincode(vendorProfile?.store_postal_code || "");
            setBankName(vendorProfile?.bank_name || "");
            setAccountNumber(vendorProfile?.bank_account_number || "");
            setIfsc(vendorProfile?.ifsc_code || "");
        }
    }, [vendorProfile]);
    useEffect(() => {
        getLocation();
    }, []);
    useEffect(() => {
        getvendorDetail(user?.id); // Check that user.id is valid
    }, [user?.id]);
    return (
        <div className="d-flex">
            {/* Sidebar for larger screens */}
            <div className="d-none d-md-block">
                <Sidebar />
            </div>
            {/* Offcanvas Sidebar for smaller screens */}
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
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>
            <div style={{ flex: 1 }}>
                <Header title="Profile" toggleSidebar={toggleSidebar} />
                <div className="d-flex justify-content-between align-items-center m-4">
                    <h4>{isEdit ? "Edit Profile" : "My Profile"}</h4>
                    <div>
                        {isEdit ? (
                            <div>
                                <Button
                                    variant="outline-warning"
                                    className="m-3"
                                    style={{ fontWeight: "bold" }}
                                    onClick={() => setIsEdit(false)}
                                >
                                    Discard
                                </Button>
                                <Button className="savebtn align-items-flex-end" onClick={handleEditProfile}>
                                    Update
                                </Button>
                            </div>
                        ) : (
                            <p className="text-muted">
                                Joined the Platform on {dayjs(user?.date_joined).format("MMMM DD, YYYY") || "N/A"}
                            </p>
                        )}
                    </div>
                </div>
                {/* Responsive Layout */}
                <div className="p-4">
                    <Row className="g-4">
                        {/* Profile Card */}
                        <Col xs={12} lg={4}>
                            <ProfileCard
                                userData={user}
                                vendorProfile={vendorProfile}
                                isEdit={handleIsEdit}
                                btnvisible={isEdit}
                                profileimage={shop_image}
                                previewimg={previewImage}
                            />
                        </Col>
                        {/* Basic Details Form */}
                        <Col xs={12} lg={8}>
                            <Card className="shadow-sm rounded">
                                <h5 className="subHeading p-3">Basic Details</h5>
                                <hr className="divider" />
                                <Card.Body>
                                    <Form>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Shop Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Shop Name"
                                                value={shopName}
                                                onChange={isEdit ? (e) => setShopName(e.target.value) : null}
                                            />
                                        </Form.Group>
                                        <Row className="mt-3">
                                            <Col md={6}>
                                                <Form.Group controlId="formEmail">
                                                    <Form.Label> Shop Email</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Email"
                                                        value={email}
                                                        onChange={isEdit ? (e) => setEmail(e.target.value) : null}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="formPhoneNumber">
                                                    <Form.Label>Shop Mobile No.</Form.Label>
                                                    <Form.Control
                                                        type="Number"
                                                        placeholder="Mobile No."
                                                        value={phone_number}
                                                        onChange={isEdit ? (e) => setPhoneNumber(e.target.value) : null}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Form.Group controlId="formAddress" className="mt-3">
                                            <Form.Label> Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Address"
                                                value={address}
                                                onChange={isEdit ? (e) => setAddress(e.target.value) : null}
                                            />
                                        </Form.Group>
                                        <Row className="mt-3">
                                            <Col md={4}>
                                                <Form.Group controlId="formState">
                                                    <Form.Label>State</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="State"
                                                        value={state}
                                                        onChange={isEdit ? (e) => setState(e.target.value) : null}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group controlId="formCity">
                                                    <Form.Label>City</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="City"
                                                        value={city}
                                                        onChange={isEdit ? (e) => setCity(e.target.value) : null}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group controlId="formPincode">
                                                    <Form.Label>Pin Code</Form.Label>
                                                    <Form.Control
                                                        type="Number"
                                                        placeholder="Pin Code"
                                                        value={pincode}
                                                        onChange={isEdit ? (e) => setPincode(e.target.value) : null}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row className="mt-3">
                                            <Col md={6}>
                                                <Form.Group controlId="formShopImage">
                                                    <Form.Label>Store Logo</Form.Label>
                                                    <Form.Control
                                                        type="file"
                                                        onChange={isEdit ? handleImageChange : null}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="formGstNumber">
                                                    <Form.Label>GST Number</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="GST Number"
                                                        value={gstNumber}
                                                        onChange={isEdit ? (e) => setGstNumber(e.target.value) : null}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    {/* Bank Details */}
                    <Row>
                        <Col xs={12} className="mt-4">
                            <Card className="shadow-sm rounded">
                                <h5 className="subHeading p-3">Bank Details</h5>
                                <hr className="divider" />
                                <Card.Body>
                                    <Form>
                                        <Form.Group controlId="formBankName">
                                            <Form.Label>Bank Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Bank Name"
                                                value={bankName}
                                                onChange={isEdit ? (e) => setBankName(e.target.value) : null}
                                            />
                                        </Form.Group>
                                        <Row className="mt-3">
                                            <Col md={6}>
                                                <Form.Group controlId="formAccountNumber">
                                                    <Form.Label>Account Number</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Account Number"
                                                        value={accountNumber}
                                                        onChange={
                                                            isEdit ? (e) => setAccountNumber(e.target.value) : null
                                                        }
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="formIfsc">
                                                    <Form.Label>IFSC Code</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="IFSC Code"
                                                        value={ifsc}
                                                        onChange={isEdit ? (e) => setIfsc(e.target.value) : null}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>

            </div>
        </div>
    );
};

export default Profile;
