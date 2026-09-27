import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { Table, Button, Badge, Card, Offcanvas } from "react-bootstrap";
import { AiOutlineSearch, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { VendorContext } from "../../../context/VendorContext";
import DeleteConfirmationModal from "../../../components/Atoms/DeleteModal";
import ToastComponent from "../../../components/HOC/Toast";
import "../../../assets/Css/ProductList.css"; // Ensure your custom CSS is included

const Driverlist = () => {
    const location = useLocation();
    const Assign = location?.state?.Assign;
    const orderId = location?.state?.orderId;
    const [searchTerm, setSearchTerm] = useState("");
    const [ShowToast, setShowToast] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    const toggleSidebar = () => setShowSidebar(!showSidebar);
    const handleSearch = (event) => setSearchTerm(event.target.value);

    const {
        AllDrivers,
        assignDriver,
        drivers,
        toastMessage,
        setCurrentPage,
        currentPage,
        hasNext,
        pageCount,
        deleteDriver,
    } = useContext(VendorContext);

    const filterDriver = drivers?.filter(
        (driver) =>
            driver?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver?.postal_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        AllDrivers(currentPage);
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

    const handleAssignDriver = (driverId) => {
        assignDriver(orderId, driverId);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 5000);
    };

    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await deleteDriver(deleteId);
            AllDrivers(currentPage); // Refresh table after deletion
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
                <Header title={"Driver Management"} toggleSidebar={toggleSidebar} />
                <div className="d-flex justify-content-between align-items-center m-4">
                    <h4>All Drivers</h4>
                    <div>
                        <Button className="savebtn" onClick={() => navigate("/driverDetail")}>
                            Add New Driver
                        </Button>
                    </div>
                </div>

                <Card className="shadow-sm rounded custom-card m-4">
                    <div className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="wrapper mb-2 mb-md-0 w-100 w-md-auto" style={{ maxWidth: "400px" }}>
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

                        <div className="table-responsive">
                            <Table bordered responsive="sm" className="align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email Id</th>
                                        <th>Area Code</th>
                                        <th>Phone Number</th>
                                        <th>Availability</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filterDriver.map((driver, index) => (
                                        <tr key={driver?.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {driver?.first_name} {driver?.last_name}
                                            </td>
                                            <td>{driver?.email}</td>
                                            <td>{driver?.postal_code}</td>
                                            <td>{driver?.phone_number}</td>
                                            <td>
                                                {driver?.is_available ? (
                                                    <Badge pill bg="success">
                                                        Available
                                                    </Badge>
                                                ) : (
                                                    <Badge pill bg="danger">
                                                        Not Available
                                                    </Badge>
                                                )}
                                            </td>
                                            {Assign ? (
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        className="savebtn"
                                                        title="Assign"
                                                        onClick={() => handleAssignDriver(driver?.id)}
                                                    >
                                                        Assign
                                                    </Button>
                                                </td>
                                            ) : (
                                                <td className="d-flex">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2"
                                                        title="View"
                                                        onClick={() =>
                                                            navigate("/driverDetail", {
                                                                state: { Driver: driver, view: true },
                                                            })
                                                        }
                                                    >
                                                        <FaEye />
                                                    </Button>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        className="me-2"
                                                        title="Edit"
                                                        onClick={() =>
                                                            navigate("/driverDetail", {
                                                                state: { Driver: driver, isEdit: true },
                                                            })
                                                        }
                                                    >
                                                        <AiFillEdit />
                                                    </Button>

                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        title="Delete"
                                                        onClick={() => handleDeleteClick(driver?.id)}
                                                    >
                                                        <AiFillDelete />
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </Card>

                <DeleteConfirmationModal
                    show={showModal}
                    onDeleteConfirm={confirmDelete}
                    onCancel={() => setShowModal(false)}
                    message={"This Driver will be deleted immediately. You can’t undo this action."}
                />


            </div>
        </div>
    );
};

export default Driverlist;
