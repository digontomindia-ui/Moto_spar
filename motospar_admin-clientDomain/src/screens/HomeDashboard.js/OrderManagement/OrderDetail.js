import React, { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Alert, Badge, Button, Card, Form, Offcanvas } from "react-bootstrap";
import { FaArrowLeft, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaSave, FaTruck, FaUserCog, FaWarehouse } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../../components/Atoms/DeleteModal";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { VendorContext } from "../../../context/VendorContext";
import { getOrderStatus, ORDER_STATUS_OPTIONS } from "../../../utils/orderStatus";
import "../../../assets/Css/OrderManagement.css";

const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

const TIMELINE = ["ADMIN_REVIEW", "ASSIGNED_TO_VENDOR", "VENDOR_ACCEPTED", "WORK_COMPLETED", "DELIVERED"];
const TIMELINE_ALIASES = { PENDING: 0, DRIVER_FOR_PICK: 2, DRIVER_FOR_DROP: 3 };

const getInitialForm = (item, order) => ({
    orderStatus: item?.order_status || "ADMIN_REVIEW",
    vendorPaymentStatus: Boolean(item?.vendor_payment_status),
    customerPaymentStatus: item?.payment_status || order?.payment_status || "PENDING",
    driverUrl: item?.driver_for_me_url || order?.driver_for_me_url || "",
});

const addressText = (address) => {
    if (!address) return "No shipping address available";
    return [address.street_address, address.city, address.state, address.postal_code, address.country]
        .filter(Boolean)
        .join(", ");
};

const OrderDetail = () => {
    const { updateProductStatus, loadingactivity } = useContext(VendorContext);
    const navigate = useNavigate();
    const location = useLocation();
    const orderDetail = location.state?.orderDetail;
    const initialItem = location.state?.itemdetail;
    const items = useMemo(() => orderDetail?.order_items || [], [orderDetail]);

    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(initialItem?.id || items[0]?.id || "");
    const selectedItem = useMemo(
        () => items.find((item) => item.id === selectedItemId) || initialItem || items[0],
        [items, selectedItemId, initialItem]
    );
    const [form, setForm] = useState(() => getInitialForm(selectedItem, orderDetail));
    const [savedForm, setSavedForm] = useState(() => getInitialForm(selectedItem, orderDetail));
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        const next = getInitialForm(selectedItem, orderDetail);
        setForm(next);
        setSavedForm(next);
        setSaveError("");
        setShowConfirmation(false);
    }, [selectedItem, orderDetail]);

    const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
    const status = getOrderStatus(form.orderStatus);
    const directTimelineIndex = TIMELINE.indexOf(form.orderStatus);
    const currentTimelineIndex = directTimelineIndex >= 0 ? directTimelineIndex : (TIMELINE_ALIASES[form.orderStatus] ?? -1);

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setSaveError("");
    };

    const saveChanges = async () => {
        if (!selectedItem?.id || loadingactivity) return;
        const result = await updateProductStatus(
            selectedItem.id,
            form.orderStatus,
            form.driverUrl.trim(),
            form.vendorPaymentStatus,
            form.customerPaymentStatus
        );
        if (result?.success) {
            setSavedForm(form);
            setShowConfirmation(false);
        } else {
            setSaveError(result?.message || "The order item could not be updated.");
            setShowConfirmation(false);
        }
    };

    if (!orderDetail || !selectedItem) {
        return (
            <div className="order-missing-state">
                <FaUserCog />
                <h2>Order details are unavailable</h2>
                <p>Open an order from the order list so the correct item context is available.</p>
                <Button className="savebtn" onClick={() => navigate("/orderList")}>Back to orders</Button>
            </div>
        );
    }

    const customer = orderDetail.customer_details || {};
    const isCashOnDelivery = orderDetail.payment_method === "CASH_ON_DELIVERY";
    const confirmIsRisky = form.orderStatus === "CANCELLED" || form.orderStatus === "DELIVERED";

    return (
        <div className="d-flex order-management-shell">
            <div className="d-none d-md-block"><Sidebar /></div>
            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="bg-dark text-white">
                <Offcanvas.Header closeButton closeVariant="white"><Offcanvas.Title>Menu</Offcanvas.Title></Offcanvas.Header>
                <Offcanvas.Body className="p-0"><Sidebar /></Offcanvas.Body>
            </Offcanvas>

            <main className="order-management-main">
                <Header title="Order Management" toggleSidebar={() => setShowSidebar((visible) => !visible)} />
                <div className="order-management-page">
                    <section className="order-detail-heading">
                        <div>
                            <button type="button" className="order-back-link" onClick={() => navigate("/orderList")}><FaArrowLeft />Back to orders</button>
                            <div className="order-title-row"><h2>#{orderDetail.order_code}</h2><Badge bg={status.tone} pill>{status.label}</Badge></div>
                            <p>Placed {dayjs(orderDetail.created_at).format("DD MMM YYYY [at] h:mm A")} · {items.length} {items.length === 1 ? "item" : "items"}</p>
                        </div>
                        <div className="order-assignment-actions">
                            <Button variant="outline-primary" onClick={() => navigate("/nearestVendorList", { state: { itemId: selectedItem.id, itemName: selectedItem?.product?.name } })}><FaWarehouse />{selectedItem.assigned_vendor_details ? "Change vendor" : "Assign vendor"}</Button>
                            {Number(orderDetail.driver_fees || 0) > 0 ? <Button variant="outline-primary" onClick={() => navigate("/driverList", { state: { orderId: orderDetail.id, Assign: true } })} disabled={Boolean(orderDetail.driver_details_data)}><FaTruck />{orderDetail.driver_details_data ? "Driver assigned" : "Assign driver"}</Button> : null}
                            {Number(selectedItem.mechanic_fees_for_customer || 0) > 0 ? <Button variant="outline-primary" onClick={() => navigate("/nearestMechanic", { state: { item: selectedItem, Assign: true } })} disabled={Boolean(selectedItem.mechanic)}><FaUserCog />{selectedItem.mechanic ? "Mechanic assigned" : "Assign mechanic"}</Button> : null}
                        </div>
                    </section>

                    {saveError ? <Alert variant="danger" className="order-alert">{saveError}</Alert> : null}

                    <Card className="order-timeline-card">
                        <Card.Body>
                            <div className={`order-status-timeline ${form.orderStatus === "CANCELLED" ? "cancelled" : ""}`}>
                                {form.orderStatus === "CANCELLED" ? (
                                    <div className="order-timeline-cancelled"><span /><strong>Order item cancelled</strong></div>
                                ) : TIMELINE.map((value, index) => {
                                    const timelineStatus = getOrderStatus(value);
                                    const active = currentTimelineIndex >= index || form.orderStatus === value;
                                    return <div key={value} className={active ? "active" : ""}><span>{index + 1}</span><strong>{timelineStatus.label}</strong></div>;
                                })}
                            </div>
                        </Card.Body>
                    </Card>

                    <div className="order-detail-grid">
                        <div className="order-detail-side">
                            <Card className="order-detail-card">
                                <Card.Body>
                                    <span className="order-eyebrow">Customer</span>
                                    <h3>{customer.full_name || "Unknown customer"}</h3>
                                    <div className="order-contact-list">
                                        <span><FaPhoneAlt />{customer.phone_number || "No phone number"}</span>
                                        <span><FaEnvelope />{customer.email || "No email address"}</span>
                                        <span><FaMapMarkerAlt />{addressText(orderDetail.shipping_address_details)}</span>
                                    </div>
                                </Card.Body>
                            </Card>

                            <Card className="order-detail-card">
                                <Card.Body>
                                    <span className="order-eyebrow">Order summary</span>
                                    <div className="order-summary-list">
                                        <div><span>Items</span><strong>{items.length}</strong></div>
                                        <div><span>Delivery charge</span><strong>{currency.format(Number(orderDetail.delivery_charge) || 0)}</strong></div>
                                        <div><span>Driver fee</span><strong>{currency.format(Number(orderDetail.driver_fees) || 0)}</strong></div>
                                        <div className="total"><span>Order total</span><strong>{currency.format(Number(orderDetail.total_price) || 0)}</strong></div>
                                    </div>
                                    <div className="order-reference-list">
                                        <span>Payment method <strong>{isCashOnDelivery ? "Cash on delivery" : "Online payment"}</strong></span>
                                        {orderDetail.payment_id ? <span>Payment ID <strong>{orderDetail.payment_id}</strong></span> : null}
                                        {orderDetail.driver_otp ? <span>Driver OTP <strong>{orderDetail.driver_otp}</strong></span> : null}
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>

                        <div className="order-detail-content">
                            <Card className="order-detail-card">
                                <Card.Header className="order-item-picker">
                                    <div><span className="order-eyebrow">Fulfilment item</span><h3>{selectedItem?.product?.name || "Order item"}</h3></div>
                                    {items.length > 1 ? (
                                        <Form.Select value={selectedItemId} onChange={(event) => setSelectedItemId(event.target.value)} aria-label="Select order item">
                                            {items.map((item, index) => <option key={item.id} value={item.id}>{index + 1}. {item?.product?.name || item.id}</option>)}
                                        </Form.Select>
                                    ) : null}
                                </Card.Header>
                                <Card.Body>
                                    <div className="order-item-facts">
                                        <div><span>Quantity</span><strong>{selectedItem.quantity || 0}</strong></div>
                                        <div><span>Unit price</span><strong>{currency.format(Number(selectedItem.price) || 0)}</strong></div>
                                        <div><span>Vendor</span><strong>{selectedItem?.assigned_vendor_details?.full_name || "Not assigned"}</strong></div>
                                        <div><span>Mechanic</span><strong>{selectedItem.mechanic ? "Assigned" : "Not required / unassigned"}</strong></div>
                                    </div>

                                    <hr />
                                    <div className="order-control-heading"><div><h3>Update fulfilment</h3><p>Changes remain local until you review and save them.</p></div>{isDirty ? <Badge bg="warning" text="dark">Unsaved changes</Badge> : <Badge bg="success">Saved</Badge>}</div>

                                    <div className="order-control-grid">
                                        <Form.Group controlId="order-item-status">
                                            <Form.Label>Order item status</Form.Label>
                                            <Form.Select value={form.orderStatus} onChange={(event) => updateField("orderStatus", event.target.value)}>
                                                {ORDER_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group controlId="vendor-payment-status">
                                            <Form.Label>Vendor payment</Form.Label>
                                            <Form.Select value={String(form.vendorPaymentStatus)} onChange={(event) => updateField("vendorPaymentStatus", event.target.value === "true")}>
                                                <option value="false">Pending</option>
                                                <option value="true">Paid</option>
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group controlId="customer-payment-status">
                                            <Form.Label>{isCashOnDelivery ? "Customer payment" : "Item payment"}</Form.Label>
                                            <Form.Select value={form.customerPaymentStatus} onChange={(event) => updateField("customerPaymentStatus", event.target.value)}>
                                                <option value="PENDING">Pending</option>
                                                <option value="SUCCESS">Successful</option>
                                                <option value="FAILED">Failed</option>
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group className="order-driver-url" controlId="driver-for-me-url">
                                            <Form.Label>Driver tracking URL</Form.Label>
                                            <Form.Control type="url" value={form.driverUrl} onChange={(event) => updateField("driverUrl", event.target.value)} placeholder="https://…" />
                                            <Form.Text>Optional. Add only the current customer-safe tracking link.</Form.Text>
                                        </Form.Group>
                                    </div>

                                    <div className="order-save-row">
                                        {isDirty ? <Button variant="outline-secondary" onClick={() => setForm(savedForm)} disabled={loadingactivity}>Discard changes</Button> : null}
                                        <Button className="savebtn" onClick={() => setShowConfirmation(true)} disabled={!isDirty || loadingactivity}><FaSave />Review and save</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <DeleteConfirmationModal
                show={showConfirmation}
                onCancel={() => !loadingactivity && setShowConfirmation(false)}
                onDeleteConfirm={saveChanges}
                title={confirmIsRisky ? `Confirm ${status.label.toLowerCase()} status` : "Save order changes?"}
                message={confirmIsRisky ? `This will mark “${selectedItem?.product?.name}” as ${status.label.toLowerCase()}. Confirm that the operational work and payment details are correct.` : `Save the new fulfilment and payment values for “${selectedItem?.product?.name}”?`}
                confirmLabel={loadingactivity ? "Saving…" : "Save changes"}
                confirmVariant={confirmIsRisky ? "danger" : "primary"}
                isLoading={loadingactivity}
            />
        </div>
    );
};

export default OrderDetail;
