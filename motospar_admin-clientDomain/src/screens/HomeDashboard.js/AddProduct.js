import React, { useCallback, useContext, useEffect, useState } from "react";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import ProductForm from "../../components/Atoms/ProductForm";
import { Button, Offcanvas, Col, Row } from "react-bootstrap";
import { VendorContext } from "../../context/VendorContext";
import ToastComponent from "../../components/HOC/Toast";
import ProductImageUpload from "../../components/Atoms/ProductImageUpload";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
    const navigate = useNavigate();
    const {
        AllProduct,
        ProductCategory,
        Products,
        productCategory,
        ProductSubCategory,
        productSubCategory,
        getSpecificProduct,
        specificProduct,
        setvariantId,
        variantId,
        setvendorPrice,
        vendorPrice,
        setstockQty,
        stockQty,
        AddProduct,
        toastMessage,
        toggleProductStatus,
    } = useContext(VendorContext);

    const [showToast, setShowToast] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

    const toggleSidebar = () => setShowSidebar(!showSidebar);

    useEffect(() => {
        ProductCategory();
    }, []);

    const [productDetails, setProductDetails] = useState({
        name: "",
        description: "",
        brand: "",
        model: "",
        year: "",
        price: null,
        weight: null,
        discount: null,
        sku: "",
        color: "",
        size: "",
        dimensions: "",
        material: "",
        features: "",
        categoryId: "",
        subCategoryId: "",
        delivery_charge: null,
        delivery_time: null,
        driver_fees: null,
        mechanic_fees: null,
    });

    const handleData = useCallback((data) => {
        setProductDetails(data);
    }, []);

    const handleSave = () => {
        AddProduct(productDetails);
        setShowToast(true);

        // Automatically hide the toast after 5 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 5000);
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
                style={{ width: "100vh", backgroundColor: "#262D34", color: "white" }} // Custom color for the background
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="text-white">Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content */}
            <div className="flex-grow-1">
                <Header title={"Product Management"} toggleSidebar={toggleSidebar} />

                {/* Page Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center m-4">
                    <h4 className="mb-3 mb-md-0">Add Product</h4>
                    <div className="d-flex gap-2">
                        <Button variant="outline-warning">Save to Draft</Button>
                        <Button className="savebtn" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </div>
                {/* Product Form and Image Upload */}
                <Row className="g-4 m-0">
                    {/* <Col xs={12} md={4}>
                        <ProductImageUpload />
                        <Button
                            variant="outline-secondary"
                            className="mt-3 d-flex align-items-center w-100"
                            onClick={() => navigate("/addSubCategory")}
                        >
                            Add Sub-Category &gt;
                        </Button>
                    </Col> */}
                    <Col >
                        <ProductForm
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
                            toggleProductStatusAPI={toggleProductStatus}
                            stockQty={stockQty}
                            onDataSubmit={handleData}
                            isEdit={false}
                        />
                    </Col>
                </Row>

                {/* Toast Notification */}

            </div>
        </div>
    );
};

export default AddProduct;
