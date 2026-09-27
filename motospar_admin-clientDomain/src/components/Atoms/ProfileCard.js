import React from "react";
import { Card, Button, Image } from "react-bootstrap";
import { FaPhoneAlt, FaEnvelope, FaGlobe } from "react-icons/fa";
const ProfileCard = ({ userData, isEdit, btnvisible, profileimage, previewimg }) => {
    const handleDataSubmit = () => {
        if (isEdit) {
            isEdit(true); // Send the data back to the parent component
        }
    };

    return (
        <Card className="text-center p-3 shadow-sm" style={{ Width: "auto", margin: "auto" }}>
            <div className="d-flex justify-content-center mt-3">
                <Image
                    src={
                        previewimg
                            ? previewimg
                            : userData?.profile_picture
                                ? `https://api.motospar.com${userData?.profile_picture}`
                                : require('../../assets/images/defaultprofile.webp')
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
                    <h5>{userData?.full_name}</h5>
                </Card.Title>
                <Card.Text className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                    Admin ID: ADV-896523alrjgakjdsnglakjsdngljSH
                </Card.Text>

                <Card.Text className="d-flex align-items-center ">
                    <FaPhoneAlt className="me-2 " />{" "}
                    <Card.Text className="text-muted " style={{ fontSize: "0.9rem" }}>
                        {userData?.phone_number ? userData?.phone_number : "N/A"}
                    </Card.Text>
                </Card.Text>
                <Card.Text className="d-flex align-items-center">
                    <FaEnvelope className="me-2" />{" "}
                    <Card.Text className="text-muted " style={{ fontSize: "0.9rem" }}>
                        {userData?.email}
                    </Card.Text>
                </Card.Text>
                <Card.Text className="d-flex align-items-center ">
                    <FaGlobe className="me-2" />{" "}
                    <Card.Text className="text-muted " style={{ fontSize: "0.9rem" }}>
                        N/A
                    </Card.Text>
                </Card.Text>
                {btnvisible ? null : (
                    <Button
                        variant="outline-warning"
                        className="mt-3"
                        style={{ fontWeight: "bold" }}
                        onClick={handleDataSubmit}
                    >
                        Edit Profile
                    </Button>
                )}
            </Card.Body>
        </Card>
    );
};

export default ProfileCard;
