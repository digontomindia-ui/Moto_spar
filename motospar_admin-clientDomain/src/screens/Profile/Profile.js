import React, { useContext, useState } from "react";
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
    const [first_name, setfirst_name] = useState(user?.first_name);
    const [last_name, setlast_name] = useState(user?.last_name);
    const [phone_number, setphone_number] = useState(user?.phone_number ? user?.phone_number : "");
    const [email, setemail] = useState(user?.email);
    const [profile_image, setprofile_image] = useState("");
    const [role, setrole] = useState(user?.account_type);
    const [showToast, setShowToast] = useState(false);
    const { EditProfile, toastMessage } = useContext(VendorContext);
    const [isEdit, setisEdit] = useState(false);
    const [previewImage, setpreviewImage] = useState("");
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
    const HandleEditProfile = async () => {
        const updatedData = {
            first_name,
            last_name,
            email,
            phone_number,
        };
        if (profile_image && typeof profile_image !== "string") {
            updatedData.profile_image = profile_image; // Add image only if it's updated
        }

        await EditProfile(updatedData);
        console.log("Data sent to API:", updatedData);

        setShowToast(true);
        // Automatically hide the toast after 5 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 5000); //
        setisEdit(false);
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
    const HandleIsEdit = (data) => {
        setisEdit(data);
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
                className="bg-dark text-white"
                style={{ width: "250px" }}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title></Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Sidebar /> {/* Sidebar content */}
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
                                    onClick={() => setisEdit(false)}
                                >
                                    Discard
                                </Button>
                                <Button className="savebtn align-items-flex-end" onClick={HandleEditProfile}>
                                    Update
                                </Button>
                            </div>
                        ) : (
                            <p className="text-muted">
                                Joined Platform on {dayjs(user?.date_joined).format("MMMM DD, YYYY") || "N/A"}
                            </p>
                        )}
                    </div>
                </div>

                <div className="d-flex flex-wrap p-4">
                    {/* Profile Card */}
                    <ProfileCard
                        userData={user}
                        isEdit={HandleIsEdit}
                        btnvisible={isEdit}
                        profileimage={profile_image}
                        previewimg={previewImage}
                    />

                    {/* Basic Details Form */}
                    <Card className="shadow-sm rounded m-4" style={{ flex: 1 }}>
                        <h5 className="subHeading p-3">Basic Details</h5>
                        <hr className="divider " />
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
                                                onChange={isEdit ? (e) => setfirst_name(e.target.value) : null}
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
                                                onChange={isEdit ? (e) => setlast_name(e.target.value) : null}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mt-3">
                                    <Col md={6}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Email"
                                                value={email}
                                                onChange={isEdit ? (e) => setemail(e.target.value) : null}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Mobile No.</Form.Label>
                                            <Form.Control
                                                type="Number"
                                                placeholder="Mobile No."
                                                value={phone_number}
                                                onChange={isEdit ? (e) => setphone_number(e.target.value) : null}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col md={6}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Profile Image</Form.Label>
                                            <Form.Control
                                                type="file"
                                                // value={name}
                                                onChange={isEdit ? handleImageChange : null}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Role</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Role"
                                                value={role}
                                            // onChange={(e) => setName(e.target.value)}
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

export default Profile;
