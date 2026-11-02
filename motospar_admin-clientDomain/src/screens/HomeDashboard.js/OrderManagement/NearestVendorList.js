import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Form, Offcanvas, Spinner, Table } from "react-bootstrap";
import { FaArrowLeft, FaMapMarkerAlt, FaSearch, FaStore } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../../components/Atoms/DeleteModal";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { VendorContext } from "../../../context/VendorContext";
import "../../../assets/Css/OrderManagement.css";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

const NearestVendorlist = () => {
    const { assignVendor, getNearestVendor, NearestVendor, loadingactivity } = useContext(VendorContext);
    const navigate = useNavigate();
    const location = useLocation();
    const itemId = location.state?.itemId;
    const itemName = location.state?.itemName;
    const requestRef = useRef(getNearestVendor);
    requestRef.current = getNearestVendor;

    const [showSidebar, setShowSidebar] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [assignmentError, setAssignmentError] = useState("");

    useEffect(() => {
        if (itemId) requestRef.current(itemId);
    }, [itemId]);

    const vendors = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return NearestVendor || [];
        return (NearestVendor || []).filter((vendor) =>
            [vendor.vendor_name, vendor.store_contact_email, vendor.store_contact_phone]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))
        );
    }, [NearestVendor, searchTerm]);

    const confirmAssignment = async () => {
        if (!selectedVendor || loadingactivity) return;
        const result = await assignVendor(itemId, selectedVendor.vendor_id, selectedVendor.vendor_selling_price);
        if (result?.success) navigate(-1);
        else {
            setAssignmentError(result?.message || "The vendor could not be assigned.");
            setSelectedVendor(null);
        }
    };

    if (!itemId) {
        return <div className="order-missing-state"><FaStore /><h2>Order item is missing</h2><p>Start vendor assignment from an order item.</p><Button className="savebtn" onClick={() => navigate("/orderList")}>Back to orders</Button></div>;
    }

    return (
        <div className="d-flex order-management-shell">
            <div className="d-none d-md-block"><Sidebar /></div>
            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="bg-dark text-white"><Offcanvas.Header closeButton closeVariant="white"><Offcanvas.Title>Menu</Offcanvas.Title></Offcanvas.Header><Offcanvas.Body className="p-0"><Sidebar /></Offcanvas.Body></Offcanvas>
            <main className="order-management-main">
                <Header title="Order Management" toggleSidebar={() => setShowSidebar((visible) => !visible)} />
                <div className="order-management-page">
                    <section className="order-page-heading">
                        <div><button type="button" className="order-back-link" onClick={() => navigate(-1)}><FaArrowLeft />Back to order</button><h2>Assign vendor</h2><p>Select a nearby vendor with confirmed stock and selling price for {itemName || "this item"}.</p></div>
                    </section>
                    {assignmentError ? <Alert variant="danger">{assignmentError}</Alert> : null}
                    <Card className="order-list-card assignment-card">
                        <Card.Header className="order-list-toolbar"><div><strong>Eligible nearby vendors</strong><span>Review price and distance before assigning</span></div><div className="assignment-search"><FaSearch /><Form.Control type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search vendors" /></div></Card.Header>
                        <Card.Body className="p-0">
                            {loadingactivity && !(NearestVendor || []).length ? <div className="order-empty-state"><Spinner animation="border" /><strong>Finding nearby vendors</strong></div> : vendors.length ? (
                                <div className="table-responsive"><Table hover className="order-list-table align-middle mb-0"><thead><tr><th>Vendor</th><th>Contact</th><th>Selling price</th><th>Distance</th><th className="text-end">Action</th></tr></thead><tbody>{vendors.map((vendor) => (
                                    <tr key={vendor.vendor_id}><td><strong>{vendor.vendor_name || "Unnamed vendor"}</strong></td><td><strong>{vendor.store_contact_email || "No email"}</strong><span className="order-cell-note">{vendor.store_contact_phone || "No phone"}</span></td><td><strong>{currency.format(Number(vendor.vendor_selling_price) || 0)}</strong></td><td><span className="assignment-distance"><FaMapMarkerAlt />{vendor.distance ?? "Unknown"}{Number.isFinite(Number(vendor.distance)) ? " km" : ""}</span></td><td><div className="order-row-actions"><Button className="savebtn" size="sm" onClick={() => setSelectedVendor(vendor)}>Assign vendor</Button></div></td></tr>
                                ))}</tbody></Table></div>
                            ) : <div className="order-empty-state"><FaStore /><strong>{searchTerm ? "No matching vendors" : "No eligible vendors found"}</strong><span>{searchTerm ? "Try another vendor name or contact." : "Check stock, vendor locations and account availability before retrying."}</span></div>}
                        </Card.Body>
                    </Card>
                </div>
            </main>
            <DeleteConfirmationModal show={Boolean(selectedVendor)} onCancel={() => !loadingactivity && setSelectedVendor(null)} onDeleteConfirm={confirmAssignment} title="Assign this vendor?" message={`Assign ${selectedVendor?.vendor_name || "this vendor"} to ${itemName || "the order item"} at ${currency.format(Number(selectedVendor?.vendor_selling_price) || 0)}?`} confirmLabel={loadingactivity ? "Assigning…" : "Confirm assignment"} confirmVariant="primary" isLoading={loadingactivity} />
        </div>
    );
};

export default NearestVendorlist;
