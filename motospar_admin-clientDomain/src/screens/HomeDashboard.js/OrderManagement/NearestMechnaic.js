import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { Table, Form, InputGroup, Button, Pagination, Badge, Card, Offcanvas, Modal } from "react-bootstrap";
import { AiOutlineSearch, AiFillEdit, AiFillDelete } from "react-icons/ai";
import dayjs from "dayjs";
import "../../../assets/Css/ProductList.css";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { VendorContext } from "../../../context/VendorContext";
import ToastComponent from "../../../components/HOC/Toast";
const NearestMechanic = () => {
    const { assignMechanic, getNearestMechanic, NearestMechanic, toastMessage } = useContext(VendorContext);
    const navigate = useNavigate();
    const location = useLocation();
    const item = location.state?.item;
    const [ShowToast, setShowToast] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile
    const [showModal, setShowModal] = useState(false);
    const [notes, setnotes] = useState('');
    const [selectedMechanicId, setSelectedMechanicId] = useState(null);
    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
    useEffect(() => {
        getNearestMechanic(item?.id);
    }, []);

    const handleAssignVendor = (MechanicId) => {
        assignMechanic(item?.id, MechanicId, item?.mechanic_fees_for_mechanic, notes);
        setShowToast(true);

        setTimeout(() => {
            setShowToast(false);
        }, 5000); //
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
                style={{ width: "100vh", backgroundColor: "#262D34", color: "white" }} // Custom color for the background
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="text-white">Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>
            <div style={{ flex: 1 }}>
                <Header title={"Assign Mechanic"} toggleSidebar={toggleSidebar} />

                <div className="m-4">
                    <h4>List Of Mechanics for ({item?.product?.name})</h4>
                </div>
                <Card className="shadow-sm rounded custom-card m-4">
                    <div className="p-4">
                        {NearestMechanic?.length > 0 ? (
                            <Table bordered hover responsive className="align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email Id</th>
                                        <th>Phone Number</th>
                                        <th>Vehicle Specialist</th>
                                        <th>Distance</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {NearestMechanic.map((mechanic, index) => (
                                        <tr key={mechanic?.vendor_id}>
                                            <td>{index + 1}</td>
                                            <td>{mechanic?.mechanic_name}</td>
                                            <td>{mechanic?.contact_email}</td>
                                            <td>{mechanic?.contact_phone}</td>
                                            <td>{mechanic?.specialization}</td>
                                            <td>{mechanic?.distance}</td>

                                            <td className="d-flex">
                                                <Button
                                                    size="sm"
                                                    className="savebtn"
                                                    title="Assign"
                                                    onClick={() => {
                                                        setSelectedMechanicId(mechanic?.mechanic_id);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    Assign
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: "10vh" }}>
                                <h4>No Mechanic's Found</h4>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Assign Mechanic</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>What work need to be done?</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter notes for mechanic..."
                            value={notes}
                            onChange={(e) => setnotes(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            handleAssignVendor(selectedMechanicId);
                            setShowModal(false);
                            setnotes('');
                        }}
                    >
                        Assign
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default NearestMechanic;
