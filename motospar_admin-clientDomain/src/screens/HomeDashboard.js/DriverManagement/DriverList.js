import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Badge, Button, Card, Form, Offcanvas, Spinner, Table } from "react-bootstrap";
import { FaArrowLeft, FaArrowRight, FaEye, FaPlus, FaSearch, FaTruck } from "react-icons/fa";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../../components/Atoms/DeleteModal";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { VendorContext } from "../../../context/VendorContext";
import "../../../assets/Css/PeopleManagement.css";

const getDriverName = (driver) =>
    [driver?.first_name, driver?.last_name].filter(Boolean).join(" ") || "Unnamed driver";

const Driverlist = () => {
    const {
        AllDrivers,
        assignDriver,
        currentPage,
        deleteDriver,
        drivers,
        hasNext,
        loadingactivity,
        pageCount,
        setCurrentPage,
        totalCount,
    } = useContext(VendorContext);
    const location = useLocation();
    const navigate = useNavigate();
    const assignmentMode = Boolean(location.state?.Assign);
    const orderId = location.state?.orderId;
    const requestRef = useRef(AllDrivers);
    requestRef.current = AllDrivers;

    const [showSidebar, setShowSidebar] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [pageError, setPageError] = useState("");

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, setCurrentPage]);

    useEffect(() => {
        let active = true;
        const loadDrivers = async () => {
            const result = await requestRef.current(currentPage || 1, { search: debouncedSearch });
            if (active) setPageError(result?.success ? "" : result?.message || "Drivers could not be loaded.");
        };
        loadDrivers();
        return () => {
            active = false;
        };
    }, [currentPage, debouncedSearch]);

    const visibleDrivers = useMemo(
        () => (assignmentMode ? (drivers || []).filter((driver) => driver?.is_available) : drivers || []),
        [assignmentMode, drivers]
    );

    const confirmAssignment = async () => {
        if (!selectedDriver || loadingactivity) return;
        const result = await assignDriver(orderId, selectedDriver.id);
        if (result?.success) navigate(-1);
        else {
            setPageError(result?.message || "The driver could not be assigned.");
            setSelectedDriver(null);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget || loadingactivity) return;
        const result = await deleteDriver(deleteTarget.id);
        if (result?.success) {
            setDeleteTarget(null);
            const nextPage = visibleDrivers.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
            if (nextPage !== currentPage) setCurrentPage(nextPage);
            else await requestRef.current(currentPage, { search: debouncedSearch });
        } else {
            setPageError(result?.message || "The driver could not be deleted.");
            setDeleteTarget(null);
        }
    };

    if (assignmentMode && !orderId) {
        return (
            <div className="people-missing-state">
                <FaTruck />
                <h2>Order reference is missing</h2>
                <p>Start driver assignment from the order details page.</p>
                <Button className="savebtn" onClick={() => navigate("/orderList")}>Back to orders</Button>
            </div>
        );
    }

    return (
        <div className="d-flex people-management-shell">
            <div className="d-none d-md-block"><Sidebar /></div>
            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="bg-dark text-white">
                <Offcanvas.Header closeButton closeVariant="white"><Offcanvas.Title>Menu</Offcanvas.Title></Offcanvas.Header>
                <Offcanvas.Body className="p-0"><Sidebar /></Offcanvas.Body>
            </Offcanvas>

            <main className="people-management-main">
                <Header title={assignmentMode ? "Order Management" : "Driver Management"} toggleSidebar={() => setShowSidebar((visible) => !visible)} />
                <div className="people-management-page">
                    <section className="people-page-heading">
                        <div>
                            {assignmentMode ? <button type="button" className="people-back-link" onClick={() => navigate(-1)}><FaArrowLeft />Back to order</button> : <span className="people-eyebrow">Operations team</span>}
                            <h2>{assignmentMode ? "Assign a driver" : "Drivers"}</h2>
                            <p>{assignmentMode ? "Choose an available driver for this delivery. An OTP is generated after assignment." : "Manage availability, licences, delivery activity and driver records."}</p>
                        </div>
                        {!assignmentMode ? <Button className="savebtn" onClick={() => navigate("/driverDetail")}><FaPlus />Add driver</Button> : null}
                    </section>

                    {pageError ? <Alert variant="danger" dismissible onClose={() => setPageError("")}>{pageError}</Alert> : null}

                    <Card className="people-list-card">
                        <Card.Header className="people-list-toolbar">
                            <div>
                                <strong>{assignmentMode ? "Available drivers" : "Driver directory"}</strong>
                                <span>{assignmentMode ? "Unavailable drivers are hidden from assignment" : `${totalCount || 0} active driver records`}</span>
                            </div>
                            <div className="people-search">
                                <FaSearch />
                                <Form.Control
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search name, phone, licence or area"
                                    aria-label="Search drivers"
                                />
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loadingactivity && !(drivers || []).length ? (
                                <div className="people-empty-state"><Spinner animation="border" /><strong>Loading drivers</strong></div>
                            ) : visibleDrivers.length ? (
                                <div className="table-responsive">
                                    <Table hover className="people-list-table align-middle mb-0">
                                        <thead><tr><th>Driver</th><th>Contact</th><th>Licence</th><th>Area</th><th>Activity</th><th>Availability</th><th className="text-end">Actions</th></tr></thead>
                                        <tbody>{visibleDrivers.map((driver) => (
                                            <tr key={driver.id}>
                                                <td><strong>{getDriverName(driver)}</strong><span className="people-cell-note">{driver.employment_status || "Employment not set"}</span></td>
                                                <td><strong>{driver.phone_number || "No phone"}</strong><span className="people-cell-note">{driver.email || "No email"}</span></td>
                                                <td><strong>{driver.license_number || "Not recorded"}</strong><span className="people-cell-note">{driver.license_type || "Type not set"} · {driver.license_status || "Status not set"}</span></td>
                                                <td><strong>{driver.postal_code || "No postal code"}</strong><span className="people-cell-note">{[driver.city, driver.state].filter(Boolean).join(", ") || "Location not set"}</span></td>
                                                <td><strong>{Number(driver.total_deliveries || 0).toLocaleString("en-IN")} deliveries</strong><span className="people-cell-note">Rating {driver.rating || "—"}</span></td>
                                                <td><Badge bg={driver.is_available ? "success" : "secondary"}>{driver.is_available ? "Available" : "Unavailable"}</Badge></td>
                                                <td>
                                                    {assignmentMode ? (
                                                        <div className="people-row-actions"><Button className="savebtn" size="sm" onClick={() => setSelectedDriver(driver)}>Assign driver</Button></div>
                                                    ) : (
                                                        <div className="people-row-actions">
                                                            <Button variant="outline-secondary" size="sm" onClick={() => navigate("/driverDetail", { state: { Driver: driver, view: true } })}><FaEye />View</Button>
                                                            <Button variant="outline-success" size="sm" onClick={() => navigate("/driverDetail", { state: { Driver: driver, isEdit: true } })}><FiEdit2 />Edit</Button>
                                                            <Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(driver)}><FiTrash2 /><span className="visually-hidden">Delete {getDriverName(driver)}</span></Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}</tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="people-empty-state"><FaTruck /><strong>{searchTerm ? "No matching drivers" : assignmentMode ? "No available drivers" : "No drivers found"}</strong><span>{searchTerm ? "Try a different name, phone, licence or area." : assignmentMode ? "Update driver availability before assigning this delivery." : "Add the first driver to begin managing deliveries."}</span></div>
                            )}
                        </Card.Body>
                        <Card.Footer className="people-pagination">
                            <span>Page {currentPage || 1} of {Math.max(pageCount || 1, 1)}</span>
                            <Button variant="light" disabled={loadingactivity || currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} aria-label="Previous page"><FaArrowLeft /></Button>
                            <Button variant="light" disabled={loadingactivity || !hasNext} onClick={() => setCurrentPage((page) => page + 1)} aria-label="Next page"><FaArrowRight /></Button>
                        </Card.Footer>
                    </Card>
                </div>
            </main>

            <DeleteConfirmationModal
                show={Boolean(selectedDriver)}
                onCancel={() => !loadingactivity && setSelectedDriver(null)}
                onDeleteConfirm={confirmAssignment}
                title="Assign this driver?"
                message={`Assign ${getDriverName(selectedDriver)} to this order? The customer delivery OTP will be generated immediately.`}
                confirmLabel={loadingactivity ? "Assigning…" : "Confirm assignment"}
                confirmVariant="primary"
                isLoading={loadingactivity}
            />
            <DeleteConfirmationModal
                show={Boolean(deleteTarget)}
                onCancel={() => !loadingactivity && setDeleteTarget(null)}
                onDeleteConfirm={confirmDelete}
                title="Delete this driver?"
                message={`${getDriverName(deleteTarget)} will be removed from the active driver directory. This action cannot be undone.`}
                isLoading={loadingactivity}
            />
        </div>
    );
};

export default Driverlist;
