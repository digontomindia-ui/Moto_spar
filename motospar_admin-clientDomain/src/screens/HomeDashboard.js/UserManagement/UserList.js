import React, {useContext, useEffect, useState} from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import {Table, Button, Card, Offcanvas} from "react-bootstrap";
import {AiOutlineSearch, AiFillDelete} from "react-icons/ai";
import dayjs from "dayjs";
import "../../../assets/Css/ProductList.css";
import {useNavigate} from "react-router-dom";
import {FaEye, FaArrowLeft, FaArrowRight} from "react-icons/fa";
import {VendorContext} from "../../../context/VendorContext";

const UserList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };
    const {AllUsers, users, setuserDetail, setCurrentPage, currentPage, hasNext, pageCount} = useContext(VendorContext);
    const filteruser = users.filter((user) => user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile
    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
    const navigate = useNavigate();

    useEffect(() => {
        AllUsers(currentPage);
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
                style={{width: "100vh", backgroundColor: "#262D34", color: "white"}} // Custom color for the background
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="text-white">Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>
            <div style={{flex: 1}}>
                <Header title={"User Management"} toggleSidebar={toggleSidebar} />
                <div className="m-4">
                    <h4>All User's</h4>
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
                                    placeholder="Search"
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
                                    style={{cursor: !hasNext ? "not-allowed" : "pointer", opacity: !hasNext ? 0.5 : 1}}
                                />
                            </div>
                        </div>

                        <Table bordered hover responsive className="align-middle">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email Id</th>
                                    <th>Phone Number</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteruser.map((user, index) => (
                                    <tr key={user?.id}>
                                        <td>{index + 1}</td>
                                        <td>{user?.full_name}</td>
                                        <td>{user?.email}</td>
                                        <td>{user?.phone_number ? user?.phone_number : "N/A"}</td>
                                        <td>{user?.is_active ? "Active" : "Inactive"}</td>
                                        <td className="d-flex justify-content-between">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                title="View"
                                                onClick={() => {
                                                    navigate("/userDetail", {state: {userDetail: user}});
                                                }}
                                            >
                                                <FaEye />
                                            </Button>

                                            <Button variant="outline-danger" size="sm" title="Delete">
                                                <AiFillDelete />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default UserList;
