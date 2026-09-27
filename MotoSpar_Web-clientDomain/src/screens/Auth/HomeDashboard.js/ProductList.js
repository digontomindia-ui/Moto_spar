import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { Table, Button, Badge, Card, Offcanvas } from "react-bootstrap";
import { AiOutlineSearch, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "../../../assets/Css/ProductList.css";
import { VendorContext } from "../../../context/VendorContext";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProductList = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.userData);
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setproducts] = useState([]);
    const { VendorStock, Products, setspecificProduct, setCurrentPage, currentPage, hasNext, pageCount } =
        useContext(VendorContext);
    useEffect(() => {
        VendorStock(currentPage, user?.id);
    }, [currentPage]);
    const [showSidebar, setShowSidebar] = useState(false);

    const toggleSidebar = () => setShowSidebar(!showSidebar);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredProducts = Products.filter((product) =>
        product?.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
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

    return (
        <div className="d-flex flex-column flex-md-row">
            {/* Sidebar */}
            <div className="d-none d-md-block">
                <Sidebar />
            </div>
            <Offcanvas
                show={showSidebar}
                onHide={toggleSidebar}
                className="bg-dark text-white"
                style={{ width: "250px" }}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content */}
            <div className="flex-grow-1">
                <Header title={"Product Management"} toggleSidebar={toggleSidebar} />
                <div className="d-flex flex-md-row justify-content-between align-items-center m-3">
                    <h4 className="mb-3 mb-md-0">All Products</h4>

                </div>
                <Card className="shadow-sm rounded custom-card m-3">
                    <div className="p-3">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                            <div className="wrapper mb-2 mb-md-0">
                                <AiOutlineSearch className="icon" />
                                <input
                                    className="input"
                                    type="text"
                                    id="search"
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="me-2">
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
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Qty.</th>
                                        <th>Price</th>
                                        <th>Stock Status</th>
                                        <th>Date Added</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product, index) => (
                                        <tr key={product?.id}>
                                            <td>{index + 1}</td>
                                            <td>{product?.product?.name}</td>
                                            <td>{product?.product?.category?.name}</td>
                                            <td>{product?.stock_quantity}</td>
                                            <td>₹{product?.price}</td>
                                            <td>
                                                <Badge pill bg={product?.in_stock ? "success" : "danger"}>
                                                    {product?.in_stock ? "In Stock" : "Out of Stock"}
                                                </Badge>
                                            </td>
                                            <td>{dayjs(product?.created_at).format("YYYY-MM-DD")}</td>
                                            <td>
                                                <Badge pill bg={product?.is_active ? "primary" : "secondary"}>
                                                    {product?.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </td>
                                            <td className="d-flex ">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2 mb-2"
                                                    title="View"
                                                >
                                                    <FaEye />
                                                </Button>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    className="me-2 mb-2"
                                                    title="Edit"
                                                    onClick={() => {
                                                        setspecificProduct(product);
                                                        navigate("/editSpecificProductpage");
                                                    }}
                                                >
                                                    <AiFillEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    title="Delete"
                                                    className="mb-2"
                                                >
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

export default ProductList;
