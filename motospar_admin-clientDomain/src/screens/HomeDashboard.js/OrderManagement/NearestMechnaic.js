import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Form, Modal, Offcanvas, Spinner, Table } from "react-bootstrap";
import { FaArrowLeft, FaMapMarkerAlt, FaSearch, FaTools } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { VendorContext } from "../../../context/VendorContext";
import "../../../assets/Css/OrderManagement.css";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

const NearestMechanic = () => {
    const { assignMechanic, getNearestMechanic, NearestMechanic, loadingactivity } = useContext(VendorContext);
    const navigate = useNavigate();
    const location = useLocation();
    const item = location.state?.item;
    const requestRef = useRef(getNearestMechanic);
    requestRef.current = getNearestMechanic;

    const [showSidebar, setShowSidebar] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMechanic, setSelectedMechanic] = useState(null);
    const [notes, setNotes] = useState("");
    const [assignmentError, setAssignmentError] = useState("");

    useEffect(() => {
        if (item?.id) requestRef.current(item.id);
    }, [item?.id]);

    const mechanics = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return NearestMechanic || [];
        return (NearestMechanic || []).filter((mechanic) =>
            [mechanic.mechanic_name, mechanic.contact_email, mechanic.contact_phone, mechanic.specialization]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))
        );
    }, [NearestMechanic, searchTerm]);

    const confirmAssignment = async () => {
        if (!selectedMechanic || !notes.trim() || loadingactivity) return;
        const result = await assignMechanic(item.id, selectedMechanic.mechanic_id, item.mechanic_fees_for_mechanic, notes.trim());
        if (result?.success) navigate(-1);
        else {
            setAssignmentError(result?.message || "The mechanic could not be assigned.");
            setSelectedMechanic(null);
        }
    };

    const closeModal = () => {
        if (loadingactivity) return;
        setSelectedMechanic(null);
        setNotes("");
    };

    if (!item?.id) {
        return <div className="order-missing-state"><FaTools /><h2>Order item is missing</h2><p>Start mechanic assignment from an order item.</p><Button className="savebtn" onClick={() => navigate("/orderList")}>Back to orders</Button></div>;
    }

    return (
        <div className="d-flex order-management-shell">
            <div className="d-none d-md-block"><Sidebar /></div>
            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="bg-dark text-white"><Offcanvas.Header closeButton closeVariant="white"><Offcanvas.Title>Menu</Offcanvas.Title></Offcanvas.Header><Offcanvas.Body className="p-0"><Sidebar /></Offcanvas.Body></Offcanvas>
            <main className="order-management-main">
                <Header title="Order Management" toggleSidebar={() => setShowSidebar((visible) => !visible)} />
                <div className="order-management-page">
                    <section className="order-page-heading"><div><button type="button" className="order-back-link" onClick={() => navigate(-1)}><FaArrowLeft />Back to order</button><h2>Assign mechanic</h2><p>Select a nearby specialist for {item?.product?.name || "this item"}. Customer fee: {currency.format(Number(item.mechanic_fees_for_customer) || 0)}.</p></div></section>
                    {assignmentError ? <Alert variant="danger">{assignmentError}</Alert> : null}
                    <Card className="order-list-card assignment-card">
                        <Card.Header className="order-list-toolbar"><div><strong>Eligible nearby mechanics</strong><span>Confirm specialization, distance and work instructions</span></div><div className="assignment-search"><FaSearch /><Form.Control type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search mechanics" /></div></Card.Header>
                        <Card.Body className="p-0">
                            {loadingactivity && !(NearestMechanic || []).length ? <div className="order-empty-state"><Spinner animation="border" /><strong>Finding nearby mechanics</strong></div> : mechanics.length ? (
                                <div className="table-responsive"><Table hover className="order-list-table align-middle mb-0"><thead><tr><th>Mechanic</th><th>Contact</th><th>Specialization</th><th>Distance</th><th className="text-end">Action</th></tr></thead><tbody>{mechanics.map((mechanic) => (
                                    <tr key={mechanic.mechanic_id}><td><strong>{mechanic.mechanic_name || "Unnamed mechanic"}</strong></td><td><strong>{mechanic.contact_email || "No email"}</strong><span className="order-cell-note">{mechanic.contact_phone || "No phone"}</span></td><td>{mechanic.specialization || "General service"}</td><td><span className="assignment-distance"><FaMapMarkerAlt />{mechanic.distance ?? "Unknown"}{Number.isFinite(Number(mechanic.distance)) ? " km" : ""}</span></td><td><div className="order-row-actions"><Button className="savebtn" size="sm" onClick={() => setSelectedMechanic(mechanic)}>Assign mechanic</Button></div></td></tr>
                                ))}</tbody></Table></div>
                            ) : <div className="order-empty-state"><FaTools /><strong>{searchTerm ? "No matching mechanics" : "No eligible mechanics found"}</strong><span>{searchTerm ? "Try another name or specialization." : "Check mechanic locations and availability before retrying."}</span></div>}
                        </Card.Body>
                    </Card>
                </div>
            </main>

            <Modal show={Boolean(selectedMechanic)} onHide={closeModal} centered backdrop={loadingactivity ? "static" : true}>
                <Modal.Header closeButton><Modal.Title>Confirm mechanic assignment</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p className="mb-3">Assign <strong>{selectedMechanic?.mechanic_name}</strong> to <strong>{item?.product?.name}</strong>.</p>
                    <Form.Group controlId="mechanic-work-notes"><Form.Label>Work instructions <span className="text-danger">*</span></Form.Label><Form.Control as="textarea" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Describe the installation or repair work clearly" maxLength={1000} /><Form.Text>{notes.length}/1000 characters</Form.Text></Form.Group>
                </Modal.Body>
                <Modal.Footer><Button variant="outline-secondary" onClick={closeModal} disabled={loadingactivity}>Cancel</Button><Button variant="primary" onClick={confirmAssignment} disabled={!notes.trim() || loadingactivity}>{loadingactivity ? "Assigning…" : "Confirm assignment"}</Button></Modal.Footer>
            </Modal>
        </div>
    );
};

export default NearestMechanic;
