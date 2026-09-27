import { Toast } from 'bootstrap';
import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import ToastComponent from '../HOC/Toast';


const MechanicJobDetailModal = ({ show, handleClose, job, index, submitApi, toastMessage }) => {
    const [paymentDate, setPaymentDate] = useState('');
    const [dateError, setDateError] = useState(false);
    const [ToastType, setToastType] = useState('');
    const [showToast, setShowToast] = useState(false);

    const renderStars = (rating = 0) => {
        return [...Array(5)].map((_, i) => (
            <FaStar key={i} color={i < rating ? '#ffc107' : '#e4e5e9'} size={16} />
        ));
    };
    const handleSave = async () => {
        if (!paymentDate) {
            setDateError(true);
            return;
        }

        setDateError(false);
        console.log("Selected Date:", paymentDate);
        const res = await submitApi(job?.id, paymentDate)
        if (res) {
            setToastType('success')
            setShowToast(true);

            // Automatically hide the toast after 5 seconds
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
        }
        else {
            setToastType('error')
            setShowToast(true);

            // Automatically hide the toast after 5 seconds
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Job ID ({job?.order_details?.order_code})</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-3">
                    <Col xs={6} style={{ color: 'red' }}><strong>Issue:</strong></Col>
                    <Col xs={6} style={{ color: 'red' }}>{job?.notes == "" ? '-' : job?.notes}</Col>

                </Row>

                <Row className="mb-2">
                    <Col xs={6}><strong>Customer Name:</strong></Col>
                    <Col xs={6}>{job?.order_details?.customer_details?.full_name}</Col>
                </Row>
                <Row className="mb-2">
                    <Col xs={6}><strong>Mobile Number:</strong></Col>
                    <Col xs={6}>{job?.order_details?.customer_details?.phone_number}</Col>
                </Row>
                <Row className="mb-2">
                    <Col xs={6}><strong>Location:</strong></Col>
                    <Col xs={6}>
                        {`${job?.order_details?.shipping_address_details?.street_address}, ${job?.order_details?.shipping_address_details?.city}, ${job?.order_details?.shipping_address_details?.postal_code}, ${job?.order_details?.shipping_address_details?.state}`}
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col xs={6}><strong>Mechanic Fee:</strong></Col>
                    <Col xs={6} style={{ color: 'green' }}>₹{job?.mechanic_fees}</Col>
                </Row>

                <hr />

                <Row className="mb-2 align-items-center">
                    <Col xs={6}><strong>Customer Rating:</strong></Col>
                    <Col xs={6}>{renderStars(job?.rating)}</Col>
                </Row>

                <Row className="mb-2">
                    <Col xs={12}><strong>Customer Review:</strong></Col>
                </Row>
                <Row className="mb-3">
                    <Col xs={12}>
                        <div className="p-2 border rounded bg-light text-muted">
                            {job?.review !== '' ? job?.review : 'No review has been uploaded'}
                        </div>
                    </Col>
                </Row>

                {/* Additional Fields */}
                <Row className="mb-2">
                    <Col xs={6}><strong>Job Status:</strong></Col>
                    <Col xs={6}> {job?.job_status === "pending" ? (
                        <Badge pill bg="warning">
                            Pending
                        </Badge>
                    ) : job?.job_status === "in_progress" ? (
                        <Badge pill bg="warning">
                            In Progress
                        </Badge>
                    ) : job?.job_status === "completed" ? (
                        <Badge pill bg="success">
                            Completed
                        </Badge>
                    ) : job?.job_status === "cancelled" ? (
                        <Badge pill bg="danger">
                            Cancelled
                        </Badge>
                    ) : (
                        "N/A"
                    )}</Col>
                </Row>
                <Row className="mb-2">
                    <Col xs={6}><strong> Mechanic Payment Status:</strong></Col>
                    <Col xs={6}>   {job?.payment_status === "pending" ? (
                        <Badge pill bg="warning">
                            Pending
                        </Badge>
                    ) : job?.payment_status === "success" ? (
                        <Badge pill bg="success">
                            Success
                        </Badge>
                    ) : job?.payment_status === "failure" ? (
                        <Badge pill bg="danger">
                            Failed
                        </Badge>
                    ) : (
                        "N/A"
                    )}</Col>
                </Row>
                <Row className="mb-3">
                    <Col xs={6}><strong>Payment Date:</strong></Col>
                    <Col xs={6}>
                        <Form.Control type="date" className="rounded-20" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                        {dateError && <span style={{ color: 'red', fontSize: '0.85rem' }}>Please select a valid date.</span>}

                    </Col>

                </Row>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                {/* Add a Save button if needed */}
                <Button variant="primary" onClick={handleSave}>Save</Button>
            </Modal.Footer>
            <ToastComponent
                show={showToast}
                type={ToastType}
                message={toastMessage}
                onClose={() => setShowToast(false)}
            />
        </Modal>
    );
};

export default MechanicJobDetailModal;
