import React, { useState } from "react";
import { Alert, Button, Card, Form, Offcanvas, Spinner, Table } from "react-bootstrap";
import { FaArrowLeft, FaArrowRight, FaSearch, FaUsers } from "react-icons/fa";
import Sidebar from "./Sidebar";
import Header from "../HOC/Header";
import "../../assets/Css/PeopleManagement.css";

const PeopleDirectoryPage = ({
    columns,
    currentPage,
    description,
    emptyCopy,
    emptyTitle,
    error,
    eyebrow,
    hasNext,
    headerTitle,
    items,
    loading,
    onDismissError,
    onSearch,
    pageCount,
    renderRow,
    searchPlaceholder,
    searchTerm,
    setCurrentPage,
    title,
    totalCount,
}) => {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <div className="d-flex people-management-shell">
            <div className="d-none d-md-block"><Sidebar /></div>
            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="bg-dark text-white">
                <Offcanvas.Header closeButton closeVariant="white"><Offcanvas.Title>Menu</Offcanvas.Title></Offcanvas.Header>
                <Offcanvas.Body className="p-0"><Sidebar /></Offcanvas.Body>
            </Offcanvas>
            <main className="people-management-main">
                <Header title={headerTitle} toggleSidebar={() => setShowSidebar((visible) => !visible)} />
                <div className="people-management-page">
                    <section className="people-page-heading"><div><span className="people-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div></section>
                    {error ? <Alert variant="danger" dismissible onClose={onDismissError}>{error}</Alert> : null}
                    <Card className="people-list-card">
                        <Card.Header className="people-list-toolbar">
                            <div><strong>{title} directory</strong><span>{totalCount || 0} active records</span></div>
                            <div className="people-search"><FaSearch /><Form.Control type="search" value={searchTerm} onChange={(event) => onSearch(event.target.value)} placeholder={searchPlaceholder} aria-label={`Search ${title.toLowerCase()}`} /></div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading && !items.length ? <div className="people-empty-state"><Spinner animation="border" /><strong>Loading {title.toLowerCase()}</strong></div> : items.length ? (
                                <div className="table-responsive"><Table hover className="people-list-table align-middle mb-0"><thead><tr>{columns.map((column) => <th key={column.label} className={column.align === "end" ? "text-end" : undefined}>{column.label}</th>)}</tr></thead><tbody>{items.map(renderRow)}</tbody></Table></div>
                            ) : <div className="people-empty-state"><FaUsers /><strong>{emptyTitle}</strong><span>{emptyCopy}</span></div>}
                        </Card.Body>
                        <Card.Footer className="people-pagination"><span>Page {currentPage || 1} of {Math.max(pageCount || 1, 1)}</span><Button variant="light" disabled={loading || currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} aria-label="Previous page"><FaArrowLeft /></Button><Button variant="light" disabled={loading || !hasNext} onClick={() => setCurrentPage((page) => page + 1)} aria-label="Next page"><FaArrowRight /></Button></Card.Footer>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default PeopleDirectoryPage;
