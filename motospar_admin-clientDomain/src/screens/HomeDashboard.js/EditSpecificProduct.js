import React, { useCallback, useContext, useEffect, useState } from "react";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import ProductForm from "../../components/Atoms/ProductForm";
import ProductImageUpload from "../../components/Atoms/ProductImageUpload";
import { Table, Button, Card, Carousel, Offcanvas, Row, Col } from "react-bootstrap"; // Import Row and Col
import { VendorContext } from "../../context/VendorContext";
import ToastComponent from "../../components/HOC/Toast";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaEye } from "react-icons/fa";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
const EditSpecificProduct = ({ route }) => {
    const navigate = useNavigate();
    const {
        specificProduct,
        AllProduct,
        ProductCategory,
        Products,
        productCategory,
        ProductSubCategory,
        productSubCategory,
        getSpecificProduct,
        setvariantId,
        variantId,
        setvendorPrice,
        vendorPrice,
        setstockQty,
        stockQty,
        AddProduct,
        EditProduct,
        toastMessage,
        deleteCommon,
        toggleProductStatus,
    } = useContext(VendorContext);

    useEffect(() => {
        ProductCategory();
    }, []);

    const [showToast, setShowToast] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile
    const [productDetails, setProductDetails] = useState({
        name: "",
        description: "",
        brand: "",
        model: "",
        year: "",
        categoryId: "",
        subCategoryId: "",
        delivery_charge: null,
        delivery_time: 0,
    });
    const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
    const handleUpdatedData = useCallback((data) => {
        setProductDetails(data);
    }, []);

    const handleSave = () => {
        EditProduct(specificProduct?.id, productDetails); // Pass the entire productDetails object
        setShowToast(true);

        // Automatically hide the toast after 5 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 5000);
    };

    const handleDelete = async (id) => {
        try {
            await deleteCommon(`admin/product-images/${id}/delete`);
            setShowToast(true);

            // Update the specificProduct state to remove the deleted image
            const updatedImages = specificProduct.variants[0].images.filter((img) => img.id !== id);
            specificProduct.variants[0].images = updatedImages;

            // Optionally refetch product data to stay consistent with the backend
            // await fetchProductData();

            setTimeout(() => {
                setShowToast(false);
            }, 5000);
        } catch (error) {
            console.error("Error deleting the image:", error);
        }
    };

    return (
        <div className="d-flex flex-column flex-md-row">
            <div className="d-none d-md-block">
                <Sidebar /> {/* Sidebar visible on large screens */}
            </div>

            {/* Offcanvas Sidebar for small screens */}
            <Offcanvas
                show={showSidebar}
                onHide={toggleSidebar}
                className="bg-dark text-white"
                style={{ width: "250px" }}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title></Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Sidebar /> {/* Sidebar content */}
                </Offcanvas.Body>
            </Offcanvas>

            <div style={{ flex: 1 }}>
                <Header title={"Product Management"} toggleSidebar={toggleSidebar} />
                <div className="d-flex justify-content-between align-items-center m-4">
                    <h4>
                        {specificProduct?.name} ({specificProduct?.code})
                    </h4>
                    <div>
                        <div className="d-flex gap-3">
                            <Button variant="outline-warning">Save to Draft</Button>
                            <Button className="savebtn " onClick={handleSave}>
                                Save
                            </Button>
                        </div>
                        <div>
                            <Button className="savebtn mt-2 ms-5" onClick={() => navigate("/addVariant")}>
                                Add new Variant
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Responsive Card Layout */}
                <Row className="m-4">
                    {/* <Col xs={12} md={4} className="mb-4">
                        <Card>
                            <h5 className="subHeading">Images</h5>
                            <hr className="divider" />
                            <Carousel>
                                {specificProduct?.variants[0]?.images &&
                                specificProduct?.variants[0]?.images.length > 0 ? (
                                    specificProduct.variants[0].images.map((img, index) => (
                                        <Carousel.Item key={index} style={{position: "relative"}}>
                                            <img
                                                className="d-block w-100"
                                                src={`https://api.motospar.com${img.image}`}
                                                alt={`Product Image ${index + 1}`}
                                                style={{
                                                    height: "300px",
                                                    objectFit: "cover",
                                                    borderRadius: "4px",
                                                }}
                                            />
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                }}
                                            >
                                                <FaTrashAlt
                                                    size={24}
                                                    color="red"
                                                    style={{cursor: "pointer"}}
                                                    onClick={() => handleDelete(img.id)}
                                                    title="Delete Image"
                                                />
                                            </div>
                                        </Carousel.Item>
                                    ))
                                ) : (
                                    <Carousel.Item>
                                        <img
                                            className="d-block w-100"
                                            src="https://via.placeholder.com/200x200?text=No+Image"
                                            alt="No Image Available"
                                            style={{
                                                height: "300px",
                                                objectFit: "cover",
                                                borderRadius: "4px",
                                            }}
                                        />
                                    </Carousel.Item>
                                )}
                            </Carousel>
                        </Card>
                        <Col xs={12}>
                            <ProductImageUpload />
                        </Col>
                    </Col> */}

                    <Col xs={12} md={12} className="mb-4">
                        <ProductForm
                            productDetails={specificProduct}
                            ProductCategory={productCategory}
                            subcategoryApi={ProductSubCategory}
                            subCategoryData={productSubCategory}
                            productApi={AllProduct}
                            productData={Products}
                            specificProductApi={getSpecificProduct}
                            specificProductData={specificProduct}
                            setvariantId={setvariantId}
                            setvendorPrice={setvendorPrice}
                            setstockQty={setstockQty}
                            variantId={variantId}
                            vendorPrice={vendorPrice}
                            stockQty={stockQty}
                            isEdit={true}
                            setShowToast={setShowToast}
                            toggleProductStatusAPI={toggleProductStatus}
                            updatedData={handleUpdatedData}
                            showImgField={false}
                        />
                    </Col>
                </Row>
                <Card className="shadow-sm rounded custom-card m-4">
                    <div className="p-4">
                        {/* <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="wrapper">
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
                                    style={{cursor: !hasNext ? "not-allowed" : "pointer", opacity: !hasNext ? 0.5 : 1}}
                                />
                            </div>
                        </div> */}

                        <Table bordered hover responsive className="align-middle">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Variant Color</th>
                                    <th>Variant SKU</th>
                                    <th>Variant Discounted Price</th>
                                    <th>Variant Qty</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {specificProduct?.variants?.map((item, index) => (
                                    <tr key={item?.id}>
                                        <td>{index + 1}</td>
                                        <td style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            {item?.images?.length > 0 && item.images[0]?.image && (
                                                <img
                                                    src={item?.images[0]?.image}
                                                    alt="Product Image"
                                                    style={{
                                                        height: "30px",
                                                        width: "40px",
                                                        objectFit: "cover",
                                                        borderRadius: "4px",
                                                    }}
                                                />
                                            )}
                                            <span>{item?.color}</span>
                                        </td>
                                        <td>{item?.sku}</td>
                                        <td>{item?.discounted_price}</td>
                                        <td>{item?.quantity_in_stock}</td>

                                        <td className="d-flex">
                                            <Button variant="outline-primary" size="sm" className="me-2" title="View">
                                                <FaEye />
                                            </Button>
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                className="me-2"
                                                title="Edit"
                                                onClick={() => {
                                                    navigate("/addvariant", { state: { variant: item } });
                                                }}
                                            >
                                                <AiFillEdit />
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

export default EditSpecificProduct;
