import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, Button, Col, Offcanvas, Row } from "react-bootstrap";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/Atoms/ProductForm";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import { VendorContext } from "../../context/VendorContext";
import "../../assets/Css/ProductManagement.css";

const initialProductDetails = {
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
    delivery_charge: 0,
    delivery_time: 0,
    driver_fees: 0,
    mechanic_fees: 0,
    imageFiles: [],
};

const validateProduct = (product) => {
    const errors = [];
    if (!product.name?.trim()) errors.push("Enter a product name.");
    if (!product.categoryId) errors.push("Choose a product category.");
    if (!product.subCategoryId) errors.push("Choose a product sub-category.");
    if (!product.sku?.trim()) errors.push("Enter a unique SKU for the first variant.");
    if (product.price === null || product.price === "" || Number(product.price) <= 0) {
        errors.push("Enter an MRP greater than zero.");
    }
    const discount = Number(product.discount || 0);
    if (discount < 0 || discount > 100) errors.push("Discount must be between 0 and 100 percent.");
    if (Number(product.delivery_time || 0) < 0) errors.push("Delivery time cannot be negative.");
    return errors;
};

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
        AddProduct: createProduct,
        loadingactivity,
        toggleProductStatus,
        uploadVariantImages,
    } = useContext(VendorContext);
    const categoryRequestRef = useRef(ProductCategory);
    categoryRequestRef.current = ProductCategory;

    const [showSidebar, setShowSidebar] = useState(false);
    const [retryUploadInfo, setRetryUploadInfo] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productDetails, setProductDetails] = useState(initialProductDetails);
    const [validationErrors, setValidationErrors] = useState([]);
    const [createdProduct, setCreatedProduct] = useState(null);

    useEffect(() => {
        categoryRequestRef.current();
    }, []);

    const handleData = useCallback((data) => {
        setProductDetails(data);
        setValidationErrors([]);
    }, []);

    const handleSave = async () => {
        if (isSubmitting || loadingactivity || createdProduct) return;
        const errors = validateProduct(productDetails);
        if (errors.length) {
            setValidationErrors(errors);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setIsSubmitting(true);
        setValidationErrors([]);
        try {
            const result = await createProduct(productDetails);
            if (result?.partialSuccess) {
                setCreatedProduct(result.product || { id: null });
                setRetryUploadInfo({
                    variantId: result.variantId,
                    failedFiles: result.failedFiles || [],
                    message: result.message,
                });
            } else if (result?.success) {
                setCreatedProduct(result.product || { id: null });
                setRetryUploadInfo(null);
            } else {
                setValidationErrors([result?.message || "The product could not be created. Review the form and try again."]);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetryUpload = async () => {
        if (!retryUploadInfo?.variantId || !retryUploadInfo?.failedFiles?.length || isRetrying) return;
        setIsRetrying(true);
        const result = await uploadVariantImages(retryUploadInfo.variantId, retryUploadInfo.failedFiles);
        setIsRetrying(false);
        if (result?.success) {
            setRetryUploadInfo(null);
        } else {
            setRetryUploadInfo((current) => ({
                ...current,
                message: result?.message || "The images still could not be uploaded. You can retry again.",
            }));
        }
    };

    return (
        <div className="d-flex product-management-shell">
            <div className="d-none d-md-block"><Sidebar /></div>
            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="bg-dark text-white">
                <Offcanvas.Header closeButton closeVariant="white"><Offcanvas.Title>Menu</Offcanvas.Title></Offcanvas.Header>
                <Offcanvas.Body className="p-0"><Sidebar /></Offcanvas.Body>
            </Offcanvas>

            <main className="product-management-main">
                <Header title="Product Management" toggleSidebar={() => setShowSidebar((visible) => !visible)} />
                <div className="product-management-page">
                    <section className="product-management-heading">
                        <div>
                            <button type="button" className="product-back-link" onClick={() => navigate("/productList")}>
                                <FaArrowLeft aria-hidden="true" /> Back to products
                            </button>
                            <h2>Add product</h2>
                            <p>Create the product and its first sellable variant. Required fields are marked in the form.</p>
                        </div>
                        {!createdProduct ? (
                            <div className="product-management-actions">
                                <Button variant="outline-secondary" onClick={() => navigate("/productList")} disabled={isSubmitting}>Cancel</Button>
                                <Button className="savebtn" onClick={handleSave} disabled={isSubmitting || loadingactivity}>
                                    {isSubmitting || loadingactivity ? "Creating product…" : "Create product"}
                                </Button>
                            </div>
                        ) : null}
                    </section>

                    {validationErrors.length ? (
                        <Alert variant="danger" className="product-management-alert">
                            <strong>Check the following before saving:</strong>
                            <ul className="mb-0 mt-2">{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul>
                        </Alert>
                    ) : null}

                    {createdProduct ? (
                        <Alert variant={retryUploadInfo ? "warning" : "success"} className="product-management-alert">
                            <div className="product-success-row">
                                <div>
                                    <strong><FaCheckCircle className="me-2" />Product created</strong>
                                    <p className="mb-0 mt-1">
                                        {retryUploadInfo?.message || "The product and its first variant were saved successfully."}
                                    </p>
                                </div>
                                <div className="d-flex flex-wrap gap-2">
                                    {retryUploadInfo ? (
                                        <Button variant="warning" onClick={handleRetryUpload} disabled={isRetrying}>
                                            {isRetrying ? "Retrying…" : "Retry image upload"}
                                        </Button>
                                    ) : null}
                                    <Button variant="outline-secondary" onClick={() => navigate("/productList")}>View products</Button>
                                </div>
                            </div>
                        </Alert>
                    ) : (
                        <Row className="g-4 m-0">
                            <Col>
                                <ProductForm
                                    ProductCategory={productCategory || []}
                                    subcategoryApi={ProductSubCategory}
                                    subCategoryData={productSubCategory || []}
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
                    )}
                </div>
            </main>
        </div>
    );
};

export default AddProduct;
