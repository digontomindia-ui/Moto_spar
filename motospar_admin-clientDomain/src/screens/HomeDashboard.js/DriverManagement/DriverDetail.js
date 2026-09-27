import React, { useContext, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import ProfileCard from "../../../components/Atoms/ProfileCard";
import { useSelector } from "react-redux";
import { Button, Card, Col, Form, Image, Offcanvas, Row } from "react-bootstrap";
import dayjs from "dayjs";
import { VendorContext } from "../../../context/VendorContext";
import ToastComponent from "../../../components/HOC/Toast";
import { useLocation } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt } from "react-icons/fa";

const DriverDetail = () => {
    const location = useLocation();
    const driver = location.state?.Driver;
    const edit = location.state?.isEdit;
    const view = location.state?.view;
    const [first_name, setfirst_name] = useState(driver ? driver?.first_name : "");
    const [last_name, setlast_name] = useState(driver ? driver?.last_name : "");
    const [phone_number, setphone_number] = useState(driver ? driver?.phone_number : null);
    const [email, setemail] = useState(driver ? driver?.email : "");
    const [profile_image, setprofile_image] = useState("");
    const [license_number, setlicense_number] = useState(driver ? driver?.license_number : null);
    const [license_type, setlicense_type] = useState(driver ? driver?.license_type : "");
    const [license_expiry_date, setlicense_expiry_date] = useState(driver ? driver?.license_expiry_date : null);
    const [license_status, setlicense_status] = useState(driver ? driver?.license_status : "");
    const [is_available, setis_available] = useState(driver ? driver?.is_available : "");
    const [employment_status, setemployment_status] = useState(driver ? driver?.employment_status : "");
    const [address_line_1, setaddress_line_1] = useState(driver ? driver?.address_line_1 : "");
    const [address_line_2, setaddress_line_2] = useState(driver ? driver?.address_line_2 : "");
    const [city, setcity] = useState(driver ? driver?.city : "");
    const [state, setstate] = useState(driver ? driver?.state : "");
    const [country, setcountry] = useState(driver ? driver?.country : "");
    const [total_deliveries, settotal_deliveries] = useState(driver ? driver?.total_deliveries : 0);
    const [postal_code, setpostal_code] = useState(driver ? driver?.postal_code : null);
    const [rating, setrating] = useState(driver ? driver?.rating : 1);
    const [emergency_contact_phone, setemergency_contact_phone] = useState(
        driver ? driver?.emergency_contact_phone : null
    );
    const [showToast, setShowToast] = useState(false);
    const [toastType, settoastType] = useState("");
    const { addDriver, EditDriver, toastMessage, settoastMessage } = useContext(VendorContext);
    const [isEdit, setisEdit] = useState(false);
    const [previewImage, setpreviewImage] = useState("");
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
    const HandleEditProfile = async () => {
        const updatedData = {
            Id: driver?.id,
            first_name,
            last_name,
            email,
            phone_number,
            license_number,
            license_type,
            license_status,
            license_expiry_date,
            is_available,
            employment_status,
            address_line_1,
            address_line_2,
            city,
            state,
            postal_code,
            country,
            total_deliveries,
            rating,
            emergency_contact_phone,
        };
        if (profile_image && typeof profile_image !== "string") {
            updatedData.profile_image = profile_image; // Add image only if it's updated
        }

        await EditDriver(updatedData);
        console.log("Data sent to API:", updatedData);

        setShowToast(true);
        settoastType("success");
        // Automatically hide the toast after 5 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 5000); //
        setisEdit(false);
    };
    const HandleSubmit = () => {
        // Check if any required fields are empty
        if (
            !first_name ||
            !last_name ||
            !email ||
            !phone_number ||
            !profile_image ||
            !license_number ||
            !license_type ||
            !license_status ||
            !license_expiry_date ||
            !is_available ||
            !employment_status ||
            !address_line_1 ||
            !city ||
            !state ||
            !postal_code
        ) {
            // If any field is empty, show "All fields are required" toast
            settoastMessage("All Fields are Required");
            settoastType("error");
            setShowToast(true);

            // Automatically hide the toast after 5 seconds
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
        } else {
            // If all fields are filled, initiate addDriver and show success toast
            addDriver(
                first_name,
                last_name,
                email,
                phone_number,
                profile_image,
                license_number,
                license_type,
                license_status,
                license_expiry_date,
                is_available,
                employment_status,
                address_line_1,
                address_line_2,
                city,
                state,
                postal_code,
                country,
                total_deliveries,
                rating,
                emergency_contact_phone
            );

            setShowToast(true);
            settoastType("success");
            // Automatically hide the toast after 5 seconds
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
        }
    };

    const handleImageChange = (e) => {
        setprofile_image(e.target.files[0]);
        const file = e.target.files[0];
        if (file) {
            setprofile_image(file); // Store the file object for backend usage
            const reader = new FileReader();
            reader.onloadend = () => {
                setpreviewImage(reader.result); // Set the Base64 string as the preview image
            };
            reader.readAsDataURL(file); // Convert file to Base64 URL
        }
    };
    // const HandleIsEdit = (data) => {
    //     setisEdit(data);
    // };

    return (
        <div className="d-flex flex-column flex-md-row">
            {/* Sidebar for large screens */}
            <div className="d-none d-md-block">
                <Sidebar />
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

            {/* Main Content Area */}
            <div style={{ flex: 1 }}>
                <Header title="Driver Management" toggleSidebar={toggleSidebar} />

                {/* Page Title and Action Buttons */}
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center m-4">
                    <div className="col-12 col-md-6">
                        <h4 className="text-center text-md-start">
                            {edit ? "Edit Driver Profile" : "Add Driver Profile"}
                        </h4>
                    </div>
                    <div className="col-12 col-md-6 text-center text-md-end">
                        <Button
                            variant="outline-warning"
                            className="m-3"
                            style={{ fontWeight: "bold" }}
                            onClick={() => setisEdit(false)}
                        >
                            Discard
                        </Button>
                        {edit ? (
                            <Button className="savebtn" onClick={HandleEditProfile}>
                                Update
                            </Button>
                        ) : (
                            <Button className="savebtn" onClick={HandleSubmit}>
                                Add
                            </Button>
                        )}
                    </div>
                </div>

                {/* Profile and Details Section */}
                <div className="row g-3 p-4">
                    {/* Profile Section */}
                    <div className="col-12 col-md-4">
                        {view ? (
                            <Card className="text-center p-3 shadow-sm">
                                <div className="d-flex justify-content-center mt-3">
                                    <Image
                                        src={
                                            driver?.profile_picture
                                                ? `https://api.motospar.com${driver?.profile_picture}`
                                                : require("../../../assets/images/defaultprofile.webp")
                                        }
                                        roundedCircle
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            objectFit: "cover",
                                        }}
                                    />
                                </div>
                                <Card.Body>
                                    <Card.Title className="mt-2 mb-1">
                                        <h5>
                                            {driver?.first_name} {driver?.last_name}
                                        </h5>
                                    </Card.Title>

                                    <Card.Text className="d-flex align-items-center justify-content-center">
                                        <FaPhoneAlt className="me-2" />
                                        <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                                            {driver?.phone_number || "N/A"}
                                        </span>
                                    </Card.Text>
                                    <Card.Text className="d-flex align-items-center justify-content-center">
                                        <FaEnvelope className="me-2" />
                                        <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                                            {driver?.email}
                                        </span>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        ) : (
                            <Card className="shadow-sm " style={{ width: "70%" }}>
                                <h5 className="subHeading">Profile Image</h5>
                                <hr className="divider" />
                                <Card.Img
                                    className="p-3"
                                    src={
                                        previewImage
                                            ? previewImage
                                            : driver?.profile_picture
                                                ? `https://api.motospar.com${driver?.profile_picture}`
                                                : "https://via.placeholder.com/200x200?text=No+Image"
                                    }
                                    alt="Profile Image"
                                    style={{
                                        width: "100%",
                                        height: "200px",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                    }}
                                />
                            </Card>
                        )}
                    </div>

                    {/* Basic Details Form Section */}
                    <div className="col-12 col-md-8">
                        <Card className="shadow-sm rounded ">
                            <h5 className="subHeading">Basic Details</h5>
                            <hr className="divider" />
                            <Card.Body>
                                <Form>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>First Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="First Name"
                                                    value={first_name}
                                                    onChange={(e) => setfirst_name(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Last Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Last Name"
                                                    value={last_name}
                                                    onChange={(e) => setlast_name(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mt-3">
                                        <Col md={4}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Email"
                                                    value={email}
                                                    onChange={(e) => setemail(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Mobile No.</Form.Label>
                                                <Form.Control
                                                    type="Number"
                                                    placeholder="Mobile No."
                                                    value={phone_number}
                                                    onChange={(e) => setphone_number(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Emergency Mobile No.</Form.Label>
                                                <Form.Control
                                                    type="Number"
                                                    placeholder=" Emergency Mobile No."
                                                    value={emergency_contact_phone}
                                                    onChange={(e) => setemergency_contact_phone(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        <Col md={4}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>License Number</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="License Number"
                                                    value={license_number}
                                                    onChange={(e) => setlicense_number(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="stockStatus">
                                                <Form.Label>License Type</Form.Label>
                                                <Form.Select
                                                    value={license_type} // Bind the value to the state
                                                    onChange={(e) => setlicense_type(e.target.value)} // Update the state on change
                                                >
                                                    <option value="true">Bike</option>
                                                    <option value="false">Car</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>License Expiry Date</Form.Label>
                                                <Form.Control
                                                    type="Date"
                                                    placeholder="License Expiry Dat"
                                                    value={license_expiry_date}
                                                    onChange={(e) => setlicense_expiry_date(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        <Col md={4}>
                                            <Form.Group controlId="stockStatus">
                                                <Form.Label>License Status</Form.Label>
                                                <Form.Select
                                                    value={license_status} // Bind the value to the state
                                                    onChange={(e) => setlicense_status(e.target.value)} // Update the state on change
                                                >
                                                    <option value="valid">Valid</option>
                                                    <option value="expired">Expired</option>
                                                    <option value="suspended">Suspended</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="stockStatus">
                                                <Form.Label>Employment Status</Form.Label>
                                                <Form.Select
                                                    value={employment_status} // Bind the value to the state
                                                    onChange={(e) => setemployment_status(e.target.value)} // Update the state on change
                                                >
                                                    <option value="full_time">Full Time</option>
                                                    <option value="part_time">Part time</option>
                                                    <option value="contractor">Contractor</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="stockStatus">
                                                <Form.Label>Driver Availablity</Form.Label>
                                                <Form.Select
                                                    value={is_available} // Bind the value to the state
                                                    onChange={(e) => setis_available(e.target.value)} // Update the state on change
                                                >
                                                    <option value="true">Available</option>
                                                    <option value="false">Not Available</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Address Line 1</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Address"
                                                    value={address_line_1}
                                                    onChange={(e) => setaddress_line_1(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Address Line 2</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Address"
                                                    value={address_line_2}
                                                    onChange={(e) => setaddress_line_2(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>City</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="City"
                                                    value={city}
                                                    onChange={(e) => setcity(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Pin Code</Form.Label>
                                                <Form.Control
                                                    type="Number"
                                                    placeholder="Pin Code"
                                                    value={postal_code}
                                                    onChange={(e) => setpostal_code(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>State</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="State"
                                                    value={state}
                                                    onChange={(e) => setstate(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Country</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Country"
                                                    value={country}
                                                    onChange={(e) => setcountry(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        <Col md={4}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Total Deliveries</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="Total Deliveries"
                                                    value={total_deliveries}
                                                    onChange={(e) => settotal_deliveries(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Rating</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="Rating"
                                                    value={rating}
                                                    onChange={(e) => setrating(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Profile Image</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    // value={preview}
                                                    onChange={(e) => handleImageChange(e)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                {/* Toast Notification */}

            </div>
        </div>
    );
};

export default DriverDetail;
