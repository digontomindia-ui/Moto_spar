import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import { Table, Button, Badge, Card, Offcanvas } from "react-bootstrap";
import { AiOutlineSearch, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../components/Atoms/DeleteModal";
import { VendorContext } from "../../context/VendorContext";

const ProductList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const { AllProduct, Products, setspecificProduct, setCurrentPage, currentPage, hasNext, pageCount, deleteCommon } =
        useContext(VendorContext);

    const [showSidebar, setShowSidebar] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
    useEffect(() => {
        AllProduct(currentPage);
    }, [currentPage]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredProducts = Products.filter((product) =>
        product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNextPage = () => {
        if (hasNext) setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            const response = await deleteCommon(`admin/products/${deleteId}/delete`);
            if (response.success) AllProduct(currentPage);
            setShowModal(false);
        }
    };

    return (
        <div className="d-flex flex-column flex-md-row">
            {/* Sidebar for larger screens */}
            <div className="d-none d-md-block">
                <Sidebar />
            </div>

            {/* Offcanvas Sidebar for mobile */}
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

            {/* Main content */}
            <div className="flex-grow-1">
                <Header title="Product Management" toggleSidebar={() => setShowSidebar(!showSidebar)} />
                <div className="d-flex flex-wrap justify-content-between align-items-center px-3 py-2">
                    <h4 className="mb-2 mb-md-0">All Products</h4>
                    <Button className="savebtn" onClick={() => navigate("/addProduct")}>
                        Add Product
                    </Button>
                </div>

                <Card className="shadow-sm rounded custom-card mx-3 my-2">
                    <div className="p-3">
                        {/* Search and Pagination */}
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
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
                            <div className="d-flex align-items-center flex-wrap gap-2">
                                <span>
                                    Page {currentPage} of {pageCount}
                                </span>
                                <FaArrowLeft
                                    onClick={handlePreviousPage}
                                    style={{
                                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                        opacity: currentPage === 1 ? 0.5 : 1,
                                    }}
                                />
                                <FaArrowRight
                                    onClick={handleNextPage}
                                    style={{
                                        cursor: !hasNext ? "not-allowed" : "pointer",
                                        opacity: !hasNext ? 0.5 : 1,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Responsive Table */}
                        <div className="table-responsive">
                            <Table bordered hover responsive="sm" className="align-middle table-sm">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Order Date</th>
                                        <th>Qty</th>
                                        <th>GST rate</th>
                                        <th>Price</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product, index) => (
                                        <tr key={product?.id}>
                                            <td>{product?.code}</td>
                                            <td className="text-truncate" style={{ maxWidth: "200px" }}>
                                                {product?.name}
                                            </td>
                                            <td>{product?.category?.name}</td>
                                            <td>{dayjs(product?.created_at).format("YYYY-MM-DD")}</td>
                                            <td>{product?.variants[0]?.quantity_in_stock}</td>
                                            <td>{product?.gst_rate}%</td>
                                            <td>₹{product?.variants[0]?.final_listing_price_on_motospar}</td>
                                            <td className="d-flex  gap-2">
                                                <Button variant="outline-primary" size="sm" title="View">
                                                    <FaEye />
                                                </Button>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
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
                                                    onClick={() => handleDeleteClick(product?.id)}
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

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    show={showModal}
                    onDeleteConfirm={confirmDelete}
                    onCancel={() => setShowModal(false)}
                    message="This product will be deleted immediately. You can’t undo this action."
                />
            </div>
        </div>
    );
};

export default ProductList;
