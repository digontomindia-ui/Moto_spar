import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { Table, Button, Card, Offcanvas, Badge, Spinner } from "react-bootstrap";
import { AiOutlineSearch, AiFillDelete } from "react-icons/ai";
import { FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { VendorContext } from "../../../context/VendorContext";
import DeleteConfirmationModal from "../../../components/Atoms/DeleteModal";
import ToastComponent from "../../../components/HOC/Toast";
import { useNavigate } from "react-router-dom";

const MechanicList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile
    const [loadingid, setloadingid] = useState('')

    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const {
        AllMechanics,
        MechanicVerfication,
        mechanics,
        setCurrentPage,
        currentPage,
        hasNext,
        pageCount,
        deleteCommon,
        toastMessage,
        loadingactivity
    } = useContext(VendorContext);

    const filterMechanic = mechanics.filter(
        (mechanics) =>
            mechanics?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mechanics?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mechanics?.mechanic_profile?.base_postal_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        AllMechanics(currentPage);
    }, [currentPage]);

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

    const handleViewClick = (Id) => {
        navigate("/mechanicDetail", { state: { MechanicId: Id } });
    };

    const handleVerfication = async (mechanicUserId) => {
        setloadingid(mechanicUserId)
        await MechanicVerfication(mechanicUserId);
        await AllMechanics(currentPage);
        setShowToast(true);

        setTimeout(() => {
            setShowToast(false);
        }, 5000);
    };

    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            const response = await deleteCommon(`admin/vendors/${deleteId}/delete`);
            if (response.success) {
                AllMechanics(currentPage); // Refresh table after deletion
            } else {
                console.error("Failed to delete vendor");
            }
            setShowModal(false);
        }
    };

    return (
        <div className="d-flex flex-column flex-md-row">
            {/* Sidebar visible on large screens */}
            <div className="d-none d-md-block">
                <Sidebar />
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
                <Header title={"Mechanics Management"} toggleSidebar={toggleSidebar} />
                <div className="m-4">
                    <h4>All Mechanics</h4>
                </div>
                <Card className="shadow-sm rounded custom-card m-4">
                    <div className="p-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                            <div className="wrapper flex-grow-1 mb-3 mb-md-0">
                                <AiOutlineSearch className="icon" />
                                <input
                                    className="input w-100"
                                    type="text"
                                    id="search"
                                    placeholder="Search by name or Area code"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>

                            <div className="d-flex align-items-center">
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

                        <Table bordered hover responsive className="align-middle">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email Id</th>
                                    <th>Area Code</th>
                                    <th>Phone Number</th>
                                    <th>Verification</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterMechanic.map((mechanic, index) => (
                                    <tr key={mechanic?.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {mechanic?.first_name} {mechanic?.last_name}
                                        </td>
                                        <td>{mechanic?.email}</td>
                                        <td>{mechanic?.mechanic_profile?.base_postal_code || "N/A"}</td>
                                        <td>{mechanic?.phone_number || "N/A"}</td>
                                        <td>
                                            {mechanic?.is_verified ? (
                                                <Badge pill bg="success">
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    title="Success"
                                                    onClick={() => handleVerfication(mechanic?.id)}
                                                >
                                                    {loadingactivity && loadingid === mechanic?.id ? <Spinner key={mechanic?.id} /> : "Verify Now"}
                                                </Button>
                                            )}
                                        </td>
                                        <td className="d-flex">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                title="View"
                                                onClick={() => handleViewClick(mechanic?.id)}
                                            >
                                                <FaEye />
                                            </Button>

                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                title="Delete"
                                                onClick={() => handleDeleteClick(mechanic?.id)}
                                            >
                                                <AiFillDelete />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card>

                {/* Toast for notifications */}


                {/* Delete confirmation modal */}
                <DeleteConfirmationModal
                    show={showModal}
                    onDeleteConfirm={confirmDelete}
                    onCancel={() => setShowModal(false)}
                    message={"This Vendor will be deleted immediately. You can’t undo this action."}
                />
            </div>
        </div>
    );
};

export default MechanicList;
