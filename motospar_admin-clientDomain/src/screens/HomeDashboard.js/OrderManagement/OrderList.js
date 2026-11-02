import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Badge, Button, Card, Form, Offcanvas, Spinner, Table } from "react-bootstrap";
import { FaArrowLeft, FaArrowRight, FaClipboardList, FaFilter, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { VendorContext } from "../../../context/VendorContext";
import { getOrderStatuses, ORDER_STATUS_OPTIONS } from "../../../utils/orderStatus";
import "../../../assets/Css/OrderManagement.css";

const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

const initialFilters = {
    order_code: "",
    customer_name: "",
    payment_method: "",
    payment_status: "",
};

const paymentTone = (status) => {
    if (status === "SUCCESS") return "success";
    if (status === "FAILED") return "danger";
    return "warning";
};

const OrderList = () => {
    const navigate = useNavigate();
    const { AllOrders, orders, setCurrentPage, currentPage, hasNext, pageCount, loadingactivity } = useContext(VendorContext);
    const requestRef = useRef(AllOrders);
    requestRef.current = AllOrders;

    const [showSidebar, setShowSidebar] = useState(false);
    const [filters, setFilters] = useState(initialFilters);
    const [activeFilters, setActiveFilters] = useState(initialFilters);
    const [statusFilter, setStatusFilter] = useState("");
    const [requestVersion, setRequestVersion] = useState(0);

    useEffect(() => {
        requestRef.current(currentPage, activeFilters);
    }, [currentPage, activeFilters, requestVersion]);

    const visibleOrders = useMemo(() => {
        if (!statusFilter) return orders || [];
        return (orders || []).filter((order) =>
            (order?.order_items || []).some((item) => item?.order_status === statusFilter)
        );
    }, [orders, statusFilter]);

    const applyFilters = (event) => {
        event.preventDefault();
        setActiveFilters(filters);
        if (currentPage !== 1) setCurrentPage(1);
        else setRequestVersion((version) => version + 1);
    };

    const clearFilters = () => {
        setFilters(initialFilters);
        setActiveFilters(initialFilters);
        setStatusFilter("");
        if (currentPage !== 1) setCurrentPage(1);
        else setRequestVersion((version) => version + 1);
    };

    const hasFilters = Object.values(activeFilters).some(Boolean) || Boolean(statusFilter);

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
                    <section className="order-page-heading">
                        <div>
                            <span className="order-eyebrow">Operations</span>
                            <h2>Orders</h2>
                            <p>Search orders, review payment state and continue fulfilment for each line item.</p>
                        </div>
                    </section>

                    <Card className="order-filter-card">
                        <Card.Body>
                            <Form onSubmit={applyFilters} className="order-filter-grid">
                                <Form.Group controlId="order-code-filter">
                                    <Form.Label>Order code</Form.Label>
                                    <Form.Control value={filters.order_code} onChange={(event) => setFilters((current) => ({ ...current, order_code: event.target.value }))} placeholder="e.g. 0505267N3VXE" />
                                </Form.Group>
                                <Form.Group controlId="customer-filter">
                                    <Form.Label>Customer</Form.Label>
                                    <Form.Control value={filters.customer_name} onChange={(event) => setFilters((current) => ({ ...current, customer_name: event.target.value }))} placeholder="Customer name" />
                                </Form.Group>
                                <Form.Group controlId="payment-method-filter">
                                    <Form.Label>Payment method</Form.Label>
                                    <Form.Select value={filters.payment_method} onChange={(event) => setFilters((current) => ({ ...current, payment_method: event.target.value }))}>
                                        <option value="">All methods</option>
                                        <option value="CASH_ON_DELIVERY">Cash on delivery</option>
                                        <option value="ONLINE">Online payment</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group controlId="payment-status-filter">
                                    <Form.Label>Payment status</Form.Label>
                                    <Form.Select value={filters.payment_status} onChange={(event) => setFilters((current) => ({ ...current, payment_status: event.target.value }))}>
                                        <option value="">All payments</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="SUCCESS">Successful</option>
                                        <option value="FAILED">Failed</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group controlId="fulfilment-status-filter">
                                    <Form.Label>Fulfilment status</Form.Label>
                                    <Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                                        <option value="">All statuses on this page</option>
                                        {ORDER_STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <div className="order-filter-actions">
                                    {hasFilters ? <Button variant="light" type="button" onClick={clearFilters}><FaTimes /> Clear</Button> : null}
                                    <Button className="savebtn" type="submit" disabled={loadingactivity}><FaFilter /> {loadingactivity ? "Loading…" : "Apply filters"}</Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className="order-list-card">
                        <Card.Header className="order-list-toolbar">
                            <div><strong>Order queue</strong><span>{statusFilter ? "Fulfilment status filter applies to the current page." : "Newest orders first"}</span></div>
                            <div className="order-pagination">
                                <span>Page <strong>{currentPage || 1}</strong> of <strong>{pageCount || 1}</strong></span>
                                <Button variant="light" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1 || loadingactivity}><FaArrowLeft /></Button>
                                <Button variant="light" aria-label="Next page" onClick={() => setCurrentPage((page) => page + 1)} disabled={!hasNext || loadingactivity}><FaArrowRight /></Button>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loadingactivity && !(orders || []).length ? (
                                <div className="order-empty-state"><Spinner animation="border" /><strong>Loading orders</strong></div>
                            ) : visibleOrders.length ? (
                                <div className="table-responsive">
                                    <Table hover className="order-list-table align-middle mb-0">
                                        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Fulfilment</th><th className="text-end">Action</th></tr></thead>
                                        <tbody>
                                            {visibleOrders.map((order) => {
                                                const items = order?.order_items || [];
                                                const names = items.map((item) => item?.product?.name).filter(Boolean);
                                                const statuses = getOrderStatuses(items);
                                                return (
                                                    <tr key={order.id}>
                                                        <td><button type="button" className="order-code-button" onClick={() => navigate("/orderDetail", { state: { orderDetail: order, itemdetail: items[0] } })}><strong>#{order.order_code || "No code"}</strong><span>{dayjs(order.created_at).format("DD MMM YYYY, h:mm A")}</span></button></td>
                                                        <td><strong className="order-customer-name">{order?.customer_details?.full_name || "Unknown customer"}</strong><span className="order-cell-note">{order?.customer_details?.phone_number || order?.customer_details?.email || "No contact"}</span></td>
                                                        <td><strong>{items.length} {items.length === 1 ? "item" : "items"}</strong><span className="order-cell-note">{names.slice(0, 2).join(", ") || "No product details"}{names.length > 2 ? ` +${names.length - 2} more` : ""}</span></td>
                                                        <td><strong>{currency.format(Number(order.total_price) || 0)}</strong></td>
                                                        <td><Badge bg={paymentTone(order.payment_status)} pill>{order.payment_status || "PENDING"}</Badge><span className="order-cell-note">{order.payment_method === "CASH_ON_DELIVERY" ? "Cash on delivery" : "Online"}</span></td>
                                                        <td><div className="order-status-stack">{statuses.slice(0, 2).map((status) => <Badge key={status.value} bg={status.tone} pill>{status.label}</Badge>)}{statuses.length > 2 ? <span>+{statuses.length - 2} more</span> : null}</div></td>
                                                        <td><div className="order-row-actions"><Button variant="outline-primary" size="sm" onClick={() => navigate("/orderDetail", { state: { orderDetail: order, itemdetail: items[0] } })}>Manage</Button></div></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="order-empty-state"><FaClipboardList /><strong>{hasFilters ? "No matching orders" : "No orders yet"}</strong><span>{hasFilters ? "Clear or adjust the filters and try again." : "New orders will appear here."}</span>{hasFilters ? <Button variant="outline-secondary" size="sm" className="mt-3" onClick={clearFilters}>Clear filters</Button> : null}</div>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default OrderList;
