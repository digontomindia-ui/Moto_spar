import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Form, Offcanvas, Row, Table } from "react-bootstrap";
import Header from "../../components/HOC/Header";
import Sidebar from "../../components/Atoms/Sidebar";
import "../../assets/Css/ProductForm.css";
import { AiOutlineSearch, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { FaEye } from "react-icons/fa";
import ProductImageUpload from "../../components/Atoms/ProductImageUpload";
import { VendorContext } from "../../context/VendorContext";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import ToastComponent from "../../components/HOC/Toast";
import DeleteConfirmationModal from "../../components/Atoms/DeleteModal";
const AddSubCategory = () => {
    const {
        ProductCategory,
        getAllSubCategory,
        productSubCategory,
        addSubCategory,
        productCategory,
        setCurrentPage,
        currentPage,
        hasNext,
        pageCount,
        editSubCategory,
        toastMessage,
        deleteCommon,
    } = useContext(VendorContext);
    const [showToast, setShowToast] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryId, setcategoryId] = useState(null);
    const [subCategoryName, setsubCategoryName] = useState("");
    const [description, setdescription] = useState("");
    const [image, setimage] = useState("");
    const [categoryName, setcategoryName] = useState("");
    const [isEdit, setisEdit] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [subCategoryId, setsubCategoryId] = useState("");

    useEffect(() => {
        ProductCategory();
    }, []);
    useEffect(() => {
        getAllSubCategory(currentPage);
    }, [currentPage]);
    const handleImageChange = (e) => {
        setimage(e.target.files[0]);
        const file = e.target.files[0];
        if (file) {
            setimage(file); // Store the file object for backend usage
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result); // Set the Base64 string as the preview image
            };
            reader.readAsDataURL(file); // Convert file to Base64 URL
        }
    };
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredSubCategory = productSubCategory.filter((product, index) =>
        product?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            const response = await deleteCommon(`admin/sub-categories/${deleteId}/delete`);
            if (response.success) {
                getAllSubCategory(currentPage); // Refresh table after deletion
            } else {
                console.error("Failed to delete sub-category");
            }
            setShowModal(false);
        }
    };
    console.log("images", image)
    return (
        <div className="d-flex">
            <div className="d-none d-md-block">
                <Sidebar /> {/* Sidebar visible on large screens */}
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
                <Header title={"Product Management"} toggleSidebar={toggleSidebar} />
                <div className="d-flex justify-content-between align-items-center m-4">
                    {isEdit ? <h4>Edit Sub-Category</h4> : <h4>Add Sub-Category</h4>}
                    {isEdit ? (
                        <div>
                            <Button
                                variant="outline-warning"
                                className="me-3"
                                onClick={() => {
                                    setisEdit(false);
                                    setsubCategoryName("");
                                    setimage("");
                                    setdescription("");
                                    setPreviewImage("");
                                    setcategoryName("");
                                }}
                            >
                                Discard
                            </Button>
                            <Button
                                className="savebtn"
                                onClick={async () => {
                                    const updatedData = {
                                        subCategoryId,
                                        subCategoryName,
                                        description,
                                    };

                                    // Only include the image if it has been updated
                                    if (image) {
                                        updatedData.image = image; // Add image only if it's updated
                                    }

                                    await editSubCategory(updatedData); // Wait for the update to complete
                                    console.log("Data sent to API:", updatedData);

                                    getAllSubCategory(currentPage); // Fetch updated data
                                    setShowToast(true);
                                    setTimeout(() => {
                                        setShowToast(false);
                                    }, 5000); //
                                }}
                            >
                                Update
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <Button variant="outline-warning" className="me-3">
                                Save to Draft
                            </Button>
                            <Button
                                className="savebtn"
                                onClick={async() => {
                                  const res = await addSubCategory(categoryId, subCategoryName, description, image);
                                   if(res?.status){
                                     setsubCategoryName("");
                                    setimage("");
                                    setdescription("");
                                    setPreviewImage("");
                                    setcategoryName("");
                                    setShowToast(true);
                                    setTimeout(() => {
                                        setShowToast(false);
                                    }, 5000); //
                                    getAllSubCategory(currentPage);
                                   }
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    )}
                </div>
                <div className="container-fluid">
                    <div className="row d-flex">
                        <div className={`col-12 col-md-3 ${isEdit ? "" : "mb-3"}`}>
                            <div className="m-md-4 m-2">
                                <Card>
                                    <h5 className="subHeading">Image</h5>
                                    <hr className="divider" />
                                    <Card.Img
                                        className="p-2"
                                        src={
                                            previewImage
                                                ? previewImage
                                                : image
                                                    ? image
                                                    : require('../../assets/images/Logo.png')
                                        }
                                        alt="Product Image"
                                        style={{
                                            height: "auto",
                                            objectFit: "cover",
                                            borderRadius: "4px",
                                            marginBottom: "10px",
                                            maxWidth: "100%",
                                        }}
                                    />
                                </Card>
                            </div>
                        </div>
                        <div className="col-12 col-md-9">
                            <Card className="shadow-sm rounded m-2 m-md-4">
                                <h5 className="subHeading p-3">{isEdit ? "Edit Details" : "Add Details"}</h5>
                                <hr className="divider" />
                                <Card.Body>
                                    <Form>
                                        <Row className="mt-3">
                                            <Col xs={12} md={6}>
                                                <Form.Group controlId="productCategory">
                                                    <Form.Label>Product Category</Form.Label>
                                                    <Form.Select
                                                        value={categoryName || ""}
                                                        onChange={(e) => {
                                                            const selectedId = e.target.value;
                                                            setcategoryId(selectedId);
                                                            const selectedCategory = productCategory.find(
                                                                (data) => data.id === selectedId
                                                            );
                                                            setcategoryName(selectedCategory?.name || "");
                                                        }}
                                                    >
                                                        <option value="" hidden>
                                                            {categoryName || "Choose"}
                                                        </option>
                                                        {productCategory.map((data, index) => (
                                                            <option key={data?.id || index} value={data?.id}>
                                                                {data?.name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <Form.Group controlId="formName">
                                                    <Form.Label>Sub-Category</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={subCategoryName}
                                                        onChange={(e) => setsubCategoryName(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Form.Group controlId="formName" className="mt-3">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                type="text"
                                                value={description}
                                                onChange={(e) => setdescription(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="formName" className="mt-3">
                                            <Form.Label>Add Image Url</Form.Label>
                                            <Form.Control

                                                type="text"
                                                placeholder="Enter image URL"
                                                value={image}
                                                onChange={(e) => setimage(e.target.value)}
                                            ></Form.Control>
                                        </Form.Group>
                                        {
                                            image &&
                                            <div

                                                className="list-group-item d-flex justify-content-between align-items-center"
                                            >
                                                <div>
                                                    <img
                                                        src={image}
                                                        alt="preview"
                                                        style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: "10px" }}
                                                    />
                                                    {image}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => setimage('')}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        }
                                    </Form>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                    <div>
                        <Card className="shadow-sm rounded custom-card m-2 m-md-4">
                            <div className="p-2 p-md-4">
                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <h4>Sub-Categories</h4>
                                        <div className="wrapper">
                                            <AiOutlineSearch className="icon" />
                                            <input
                                                style={{ width: 500 }}
                                                className="input"
                                                type="text"
                                                id="search"
                                                placeholder="Search"
                                                value={searchTerm}
                                                onChange={handleSearch}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
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
                                <div style={{ overflowX: "auto" }}>
                                    <Table bordered hover responsive className="align-middle">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Sub-Category Name</th>
                                                <th>Category</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSubCategory.map((product, index) => (
                                                <tr key={product?.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {product?.image && (
                                                            <img
                                                                src={
                                                                    product?.image
                                                                        ? product?.image
                                                                        : require('../../assets/images/Logo.png')
                                                                }
                                                                style={{ height: "5%", width: "5%" }}
                                                            />
                                                        )}
                                                        {"   "} {product?.name}
                                                    </td>
                                                    <td>{product?.category?.name}</td>
                                                    <td className="d-flex">
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            className="me-2"
                                                            title="Edit"
                                                            onClick={() => {
                                                                setisEdit(true);
                                                                setsubCategoryName(product?.name);
                                                                setimage(product?.image || "");
                                                                setdescription(product?.description);
                                                                setsubCategoryId(product?.id);
                                                                setcategoryName(product?.category?.name);
                                                                setPreviewImage("");
                                                                window.scrollTo({ top: 0, behavior: "smooth" });
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
                    </div>
                </div>

                <DeleteConfirmationModal
                    show={showModal}
                    onDeleteConfirm={confirmDelete}
                    onCancel={() => setShowModal(false)}
                    message={"This sub-Category will be deleted immediately. You can’t undo this action."}
                />
            </div>
        </div>
    );
};

export default AddSubCategory;
