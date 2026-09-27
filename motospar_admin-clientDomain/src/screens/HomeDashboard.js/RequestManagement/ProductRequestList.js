import React, {useContext, useEffect, useState} from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import {Table, Form, InputGroup, Button, Pagination, Badge, Card, Offcanvas} from "react-bootstrap";
import {AiOutlineSearch, AiFillDelete} from "react-icons/ai";
import dayjs from "dayjs";
import "../../../assets/Css/ProductList.css";
import {useNavigate} from "react-router-dom";
import {FaEye, FaArrowLeft, FaArrowRight} from "react-icons/fa";
import {VendorContext} from "../../../context/VendorContext";

const ProductRequestList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const {requestProductList, requestProducts, setCurrentPage, currentPage, hasNext, pageCount} =
        useContext(VendorContext);

    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
    const filteredproducts = requestProducts.filter(
        (item) =>
            item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item?.vendor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    useEffect(() => {
        requestProductList(currentPage);
    }, [currentPage]);

    return (
        <div className="d-flex flex-column flex-md-row">
            <div className="d-none d-md-block">
                <Sidebar /> {/* Sidebar visible on large screens */}
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
                <Header title={"Product Request"} toggleSidebar={toggleSidebar} />
                <div className="m-4">
                    <h4>Pending Product Request</h4>
                </div>
                <Card className="shadow-sm rounded custom-card m-4">
                    <div className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="wrapper mb-2 mb-md-0 w-100 w-md-auto" style={{maxWidth: "400px"}}>
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
                                    style={{
                                        cursor: !hasNext ? "not-allowed" : "pointer",
                                        opacity: !hasNext ? 0.5 : 1,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <Table bordered hover responsive className="align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Vendor Name</th>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Request Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredproducts.map((product, index) => (
                                        <tr key={product?.id}>
                                            <td>{index + 1}</td>
                                            <td>{product?.vendor?.full_name}</td>
                                            <td>{product?.name}</td>
                                            <td>{product?.category?.name}</td>
                                            <td>{dayjs(product?.requested_at).format("YYYY-MM-DD")}</td>
                                            <td className="d-flex">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    title="View"
                                                    onClick={() => {
                                                        navigate("/specificProductRequest", {
                                                            state: {product: product},
                                                        });
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
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProductRequestList;
