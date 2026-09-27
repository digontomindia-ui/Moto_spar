import React, { useContext } from "react";
import { Card, Button, Image } from "react-bootstrap";
import { FaPhoneAlt, FaEnvelope, FaGlobe } from "react-icons/fa";
import { VendorContext } from "../../context/VendorContext";
const ProfileCard = ({ userData, isEdit, btnvisible, profileimage, previewimg, vendorProfile }) => {
    const { vendorProfileImg } = useContext(VendorContext);
    const handleDataSubmit = () => {
        if (isEdit) {
            isEdit(true); // Send the data back to the parent component
        }
    };

    return (
        <Card className="text-center p-3 shadow-sm" style={{ Width: "auto" }}>
            <div className="d-flex justify-content-center mt-3">
                <Image
                    src={
                        previewimg
                            ? previewimg
                            : vendorProfile?.store_logo
                                ? `https://api.motospar.com${vendorProfile?.store_logo}`
                                : null
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
                    Vendor ID: {userData?.id}
                </Card.Text>

                <Card.Text className="d-flex align-items-center ">
                    <FaPhoneAlt className="me-2 " />{" "}
                    <Card.Text className="text-muted " style={{ fontSize: "0.9rem" }}>
                        {vendorProfile?.store_contact_phone || "N/A"}
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
