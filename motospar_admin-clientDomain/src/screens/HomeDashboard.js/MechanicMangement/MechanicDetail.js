import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { VendorContext } from "../../../context/VendorContext";
import { Card, Table, Button, Image, Col, Form, Row, Offcanvas, Badge, Modal } from "react-bootstrap";
import { FaEye, FaArrowLeft, FaArrowRight, FaPhoneAlt, FaEnvelope, FaGlobe } from "react-icons/fa";
import { AiOutlineSearch, AiFillEdit, AiFillDelete } from "react-icons/ai";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import { FaStar } from 'react-icons/fa';
import MechanicJobDetailModal from "../../../components/Atoms/MechanicJobDetailModal";
import ToastComponent from "../../../components/HOC/Toast";
const MechanicDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const MechanicId = location.state?.MechanicId;
    const [searchTerm, setSearchTerm] = useState("");
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile
    const [jobStatus, setjobStatus] = useState('');
    const [payment_status, setpayment_status] = useState('');
    const [ismodalVisible, setismodalVisible] = useState(false);
    const [jobdetail, setjobdetail] = useState({});
    const [paymentDate, setPaymentDate] = useState('');
    const [dateError, setDateError] = useState(false);
    const [ToastType, setToastType] = useState('');
    const [showToast, setShowToast] = useState(false);

    const {
        GetJobs,
        mechanicJobs,
        getSpecificMechanic,
        mechanicDetail,
        JobPayemntStatusUpdate,
        toastMessage,
        setCurrentPage,
        currentPage,
        hasNext,
        pageCount,
    } = useContext(VendorContext);

    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar

    const handleSearch = (event) => setSearchTerm(event.target.value);

    const filtermechanicJobs = mechanicJobs.filter((item) =>
        item?.variant_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNextPage = () => {
        if (hasNext) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };


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

        const res = await JobPayemntStatusUpdate(jobdetail?.id, paymentDate)
        if (res) {
            setToastType('success')
            setShowToast(true);

            // Automatically hide the toast after 5 seconds
            setTimeout(() => {
                GetJobs(currentPage, mechanicDetail?.email)
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

    useEffect(() => {
        const fetchVendorDetails = async () => {
            try {
                const res = await getSpecificMechanic(MechanicId);
                if (mechanicDetail?.email) {
                    await GetJobs(currentPage, res?.email);
                }
            } catch (error) {
                console.error("Error fetching vendor details or products:", error);
            }
        };

        fetchVendorDetails();
    }, []);

    useEffect(() => {
        GetJobs(currentPage, mechanicDetail?.email, jobStatus, payment_status)
    }, [jobStatus, payment_status])

    return (
        <div className="d-flex flex-column flex-md-row">
            {/* Sidebar */}
            <div className="d-none d-md-block">
                <Sidebar />
            </div>

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

            {/* Main Content */}
            <div style={{ flex: 1 }}>
                <Header title={"Mechanics Management"} toggleSidebar={toggleSidebar} />

                {/* Vendor Details */}
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center m-4">
                    <h4 className="text-center text-lg-start">{mechanicDetail?.full_name_name}</h4>
                    <p className="text-muted text-center text-lg-end">
                        Joined the Platform on {dayjs(mechanicDetail?.date_joined).format("MMMM DD, YYYY") || "N/A"}
                    </p>
                </div>

                <Row className="g-4 p-4">
                    {/* Vendor Details Card */}
                    <Col lg={4} md={6} sm={12} className="d-flex ">
                        <Card className="text-center p-3 shadow-sm" style={{ width: "auto", margin: "auto" }}>
                            <div className="d-flex justify-content-center mt-3">
                                <Image
                                    src={
                                        mechanicDetail?.profile_picture
                                            ? mechanicDetail?.profile_picture
                                            : require("../../../assets/images/defaultprofile.webp")
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
                                <Card.Title
                                    className="mt-2 mb-1"
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifySelf: "center",
                                    }}
                                >
                                    <h5 className="mb-0">
                                        {mechanicDetail?.first_name} {mechanicDetail?.last_name}
                                    </h5>
                                    {/* {vendorDetail?.is_verified && (
                                        <FaCheckCircle className="ms-2" style={{color: "green", fontSize: "20px"}} />
                                    )} */}
                                </Card.Title>
                                <Card.Text className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                                    Mechanic ID: {MechanicId}
                                </Card.Text>

                                <Card.Text className="d-flex align-items-center">
                                    <FaPhoneAlt className="me-2" />
                                    <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                                        {mechanicDetail?.phone_number ? mechanicDetail?.phone_number : "N/A"}
                                    </span>
                                </Card.Text>
                                <Card.Text className="d-flex align-items-center">
                                    <FaEnvelope className="me-2" />
                                    <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                                        {mechanicDetail?.email}
                                    </span>
                                </Card.Text>

                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Vendor Shop Details */}
                    <Col lg={8}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <h5>Mechanic Details</h5>
                                <hr />
                                <Form>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group controlId="storeName">
                                                <Form.Label>Mechanic Name</Form.Label>
                                                <Form.Control type="text" value={mechanicDetail?.full_name} readOnly />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="address">
                                                <Form.Label>Address</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={mechanicDetail?.mechanic_profile?.base_address}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mt-3">
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Service Area/Pincodee</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Role"
                                                    value={mechanicDetail?.mechanic_profile?.base_postal_code}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="formName">
                                                <Form.Label>Specializations (Vehicle type)</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Email"
                                                    value={mechanicDetail?.mechanic_profile?.specialization}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Row className="mt-3">
                                            <Col md={6}>
                                                <Form.Group controlId="formName">
                                                    <Form.Label>Total Depositeď Amount (Till Date)</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Role"
                                                        value={`₹${mechanicDetail?.mechanic_profile?.total_top_up}`}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="formName">
                                                    <Form.Label>Current Deposit balance</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Email"
                                                        value={`₹${mechanicDetail?.mechanic_profile?.top_up_balance}`}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row className="mt-3">
                                            <Col md={6}>
                                                <Form.Group controlId="storeName">
                                                    <Form.Label>Document name</Form.Label>
                                                    <Form.Control type="text" value={mechanicDetail?.mechanic_profile?.uploaded_documents_type} readOnly />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="document">
                                                    <Form.Label>Document link</Form.Label>
                                                    {mechanicDetail?.mechanic_profile?.uploaded_documents ? (
                                                        <Form.Control as="a"
                                                            href={`https://api.motospar.com${mechanicDetail.mechanic_profile.uploaded_documents}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ display: 'inline-block', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                                                        >
                                                            {mechanicDetail?.mechanic_profile?.uploaded_documents.split('/').pop()}
                                                        </Form.Control>
                                                    ) : (
                                                        <Form.Control type="text" value="N/A" readOnly />
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                    </Row>
                                </Form>
                            </Card.Body>


                        </Card>
                    </Col>
                </Row>
                <div className="m-4">
                    <h4>Job History and Status</h4>
                </div>


                {/* Vendor Products */}
                <Card className="shadow-sm m-4">


                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3" >
                            <div className="d-flex flex-column flex-md-row align-items-center gap-3 " style={{ width: '70%' }}>

                                <div className="wrapper d-flex align-items-center gap-2 w-100">
                                    <AiOutlineSearch className="icon" />
                                    <input
                                        className="input w-100"
                                        type="text"
                                        id="search"
                                        placeholder="Search"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </div>
                                <div className="w-100">
                                    <Form.Group controlId="stockStatus">

                                        <Form.Select
                                            value={jobStatus} // Bind the value to the state
                                            onChange={(e) => setjobStatus(e.target.value)} // Update the state on change
                                        >
                                            <option value="" disabled >Job Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="">All</option>

                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="w-100">
                                    <Form.Group controlId="stockStatus">

                                        <Form.Select
                                            value={payment_status} // Bind the value to the state
                                            onChange={(e) => setpayment_status(e.target.value)} // Update the state on change
                                        >
                                            <option value="" disabled >Payment Status</option>
                                            <option value="pending">Pending</option>

                                            <option value="success">Success</option>
                                            <option value="failure">Failed</option>
                                            <option value="">All</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">

                                <span className="m-1">
                                    Page {currentPage} of {pageCount}
                                </span>
                                <FaArrowLeft
                                    className="m-1"
                                    onClick={handlePreviousPage}
                                    style={{
                                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                        opacity: currentPage === 1 ? 0.5 : 1,
                                    }}
                                />
                                <FaArrowRight
                                    className="m-1"
                                    onClick={handleNextPage}
                                    style={{ cursor: !hasNext ? "not-allowed" : "pointer", opacity: !hasNext ? 0.5 : 1 }}
                                />
                            </div>
                        </div>

                        <Table bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Order Code</th>
                                    <th>Product Name</th>
                                    <th>Issue</th>
                                    <th>Job Status</th>
                                    <th>Payment Status</th>
                                    <th>Mechanic Fee</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            {
                                mechanicJobs?.length == 0 ?
                                    <div className="m-4 align-items-center justify-content-center" style={{ alignSelf: 'center' }}>
                                        <h4>No Jobs found</h4>
                                    </div>


                                    :
                                    <tbody>
                                        {filtermechanicJobs.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{item?.order_details?.order_code}</td>
                                                <td>{item?.variant_name || 'N/A'}</td>
                                                <td>{item?.notes == "" ? '--' : item?.notes}</td>
                                                <td>
                                                    {item?.job_status === "pending" ? (
                                                        <Badge pill bg="warning">
                                                            Pending
                                                        </Badge>
                                                    ) : item?.job_status === "in_progress" ? (
                                                        <Badge pill bg="warning">
                                                            In Progress
                                                        </Badge>
                                                    ) : item?.job_status === "completed" ? (
                                                        <Badge pill bg="success">
                                                            Completed
                                                        </Badge>
                                                    ) : item?.job_status === "cancelled" ? (
                                                        <Badge pill bg="danger">
                                                            Cancelled
                                                        </Badge>
                                                    ) : (
                                                        "N/A"
                                                    )}</td>
                                                <td>
                                                    {item?.payment_status === "pending" ? (
                                                        <Badge pill bg="warning">
                                                            Pending
                                                        </Badge>
                                                    ) : item?.payment_status === "success" ? (
                                                        <Badge pill bg="success">
                                                            Success
                                                        </Badge>
                                                    ) : item?.payment_status === "failure" ? (
                                                        <Badge pill bg="danger">
                                                            Failed
                                                        </Badge>
                                                    ) : (
                                                        "N/A"
                                                    )}</td>
                                                <td>₹ {item?.mechanic_fees}</td>
                                                <td>
                                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => {
                                                        setismodalVisible(true);
                                                        setjobdetail(item)
                                                    }}>
                                                        <FaEye />
                                                    </Button>

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                            }


                        </Table>
                    </Card.Body>

                </Card>

            </div>
            <Modal show={ismodalVisible} onHide={() => setismodalVisible(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Job ID ({jobdetail?.order_details?.order_code})</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        showToast ?
                            ToastType == 'success' ?
                                <div class="alert alert-success" role="alert">
                                    {toastMessage}
                                </div> :
                                <div class="alert alert-danger" role="alert">
                                    {toastMessage}
                                </div> :
                            null



                    }
                    <Row className="mb-3">
                        <Col xs={6} style={{ color: 'red' }}><strong>Issue:</strong></Col>
                        <Col xs={6} style={{ color: 'red' }}>{jobdetail?.notes == "" ? '-' : jobdetail?.notes}</Col>

                    </Row>

                    <Row className="mb-2">
                        <Col xs={6}><strong>Customer Name:</strong></Col>
                        <Col xs={6}>{jobdetail?.order_details?.customer_details?.full_name}</Col>
                    </Row>
                    <Row className="mb-2">
                        <Col xs={6}><strong>Mobile Number:</strong></Col>
                        <Col xs={6}>{jobdetail?.order_details?.customer_details?.phone_number}</Col>
                    </Row>
                    <Row className="mb-2">
                        <Col xs={6}><strong>Location:</strong></Col>
                        <Col xs={6}>
                            {`${jobdetail?.order_details?.shipping_address_details?.street_address}, ${jobdetail?.order_details?.shipping_address_details?.city}, ${jobdetail?.order_details?.shipping_address_details?.postal_code}, ${jobdetail?.order_details?.shipping_address_details?.state}`}
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col xs={6}><strong>Mechanic Fee:</strong></Col>
                        <Col xs={6} style={{ color: 'green' }}>₹{jobdetail?.mechanic_fees}</Col>
                    </Row>

                    <hr />

                    <Row className="mb-2 align-items-center">
                        <Col xs={6}><strong>Customer Rating:</strong></Col>
                        <Col xs={6}>{renderStars(jobdetail?.rating)}</Col>
                    </Row>

                    <Row className="mb-2">
                        <Col xs={12}><strong>Customer Review:</strong></Col>
                    </Row>
                    <Row className="mb-3">
                        <Col xs={12}>
                            <div className="p-2 border rounded bg-light text-muted">
                                {jobdetail?.review !== '' ? jobdetail?.review : 'No review has been uploaded'}
                            </div>
                        </Col>
                    </Row>

                    {/* Additional Fields */}
                    <Row className="mb-2">
                        <Col xs={6}><strong>Job Status:</strong></Col>
                        <Col xs={6}> {jobdetail?.job_status === "pending" ? (
                            <Badge pill bg="warning">
                                Pending
                            </Badge>
                        ) : jobdetail?.job_status === "in_progress" ? (
                            <Badge pill bg="warning">
                                In Progress
                            </Badge>
                        ) : jobdetail?.job_status === "completed" ? (
                            <Badge pill bg="success">
                                Completed
                            </Badge>
                        ) : jobdetail?.job_status === "cancelled" ? (
                            <Badge pill bg="danger">
                                Cancelled
                            </Badge>
                        ) : (
                            "N/A"
                        )}</Col>
                    </Row>
                    <Row className="mb-2">
                        <Col xs={6}><strong> Mechanic Payment Status:</strong></Col>
                        <Col xs={6}>   {jobdetail?.payment_status === "pending" ? (
                            <Badge pill bg="warning">
                                Pending
                            </Badge>
                        ) : jobdetail?.payment_status === "success" ? (
                            <Badge pill bg="success">
                                Success
                            </Badge>
                        ) : jobdetail?.payment_status === "failure" ? (
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
                    <Button variant="secondary" onClick={() => setismodalVisible(false)}>Close</Button>
                    {/* Add a Save button if needed */}
                    <Button variant="primary" onClick={handleSave}>Save</Button>
                </Modal.Footer>

            </Modal>

        </div>

    );
};

export default MechanicDetail;
