import React from "react";
import {Container, Card, Button} from "react-bootstrap";
import "../../assets/Css/Auth.css";

const Validation = () => {
    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="text-center shadow-lg p-4" style={{maxWidth: "500px"}}>
                <Card.Body>
                    <div className="justify-self-center mb-4">
                        <img
                            src={require("../../assets/images/Logo.png")}
                            alt="Logo"
                            style={{maxWidth: "100px", height: "auto"}}
                        />
                    </div>
                    <Card.Title className="text-success fw-bold fs-4">Registration Submitted!</Card.Title>
                    <Card.Text className="mt-3 fs-5 text-muted">
                        Your registration request has been submitted. Please wait for admin verification.
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Validation;
