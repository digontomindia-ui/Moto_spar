import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Badge,
    Button,
    Card,
    Modal,
    Offcanvas,
    Spinner,
    Table,
} from "react-bootstrap";
import { AiFillEdit } from "react-icons/ai";
import { FaArrowLeft, FaImages, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../components/HOC/Header";
import ProductForm from "../../components/Atoms/ProductForm";
import Sidebar from "../../components/Atoms/Sidebar";
import { VendorContext } from "../../context/VendorContext";
import { FALLBACK_IMAGE, resolveImageUrl } from "../../utils/imageUtils";
import { buildProductUpdatePayload } from "../../utils/productPayload";
import "../../assets/Css/ProductEdit.css";

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);

const EditSpecificProduct = () => {
    const navigate = useNavigate();
    const {
        specificProduct,
        ProductCategory,
        productCategory,
        ProductSubCategory,
        productSubCategory,
        getSpecificProduct,
        EditProduct,
        toggleProductStatus,
    } = useContext(VendorContext);

    const categoryRequestRef = useRef(ProductCategory);
    const initialPayloadRef = useRef(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveMessage, setSaveMessage] = useState("");
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [productDetails, setProductDetails] = useState({});

    useEffect(() => {
        categoryRequestRef.current();
    }, []);

    useEffect(() => {
        initialPayloadRef.current = null;
        setIsDirty(false);
        setSaveError("");
        setSaveMessage("");
    }, [specificProduct?.id]);

    useEffect(() => {
        const preventAccidentalExit = (event) => {
            if (!isDirty) return;
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", preventAccidentalExit);
        return () => window.removeEventListener("beforeunload", preventAccidentalExit);
    }, [isDirty]);

    const variants = useMemo(
        () => (Array.isArray(specificProduct?.variants) ? specificProduct.variants : []),
        [specificProduct?.variants]
    );

    const handleUpdatedData = useCallback((data) => {
        const serializedPayload = JSON.stringify(buildProductUpdatePayload(data));
        setProductDetails(data);

        if (initialPayloadRef.current === null) {
            initialPayloadRef.current = serializedPayload;
            setIsDirty(false);
            return;
        }

        setIsDirty(serializedPayload !== initialPayloadRef.current);
    }, []);

    const confirmNavigation = (destination, state) => {
        if (isDirty && !window.confirm("You have unsaved product changes. Leave without saving them?")) {
            return;
        }
        navigate(destination, state ? { state } : undefined);
    };

    const handleSave = async () => {
        if (!specificProduct?.id || isSaving || !isDirty) return;

        setIsSaving(true);
        setSaveError("");
        setSaveMessage("");

        const result = await EditProduct(specificProduct.id, productDetails);
        if (result?.success) {
            const refreshResult = await getSpecificProduct(specificProduct.id);
            initialPayloadRef.current = JSON.stringify(buildProductUpdatePayload(productDetails));
            setIsDirty(false);
            setSaveMessage(
                refreshResult?.success
                    ? "Product details were saved and refreshed."
                    : "Product details were saved. Refresh the page to reload the latest values."
            );
        } else {
            setSaveError(result?.details || result?.message || "Unable to save product changes.");
        }

        setIsSaving(false);
    };

    const handleStatusChange = async () => {
        if (!specificProduct?.id || isChangingStatus) return;

        setIsChangingStatus(true);
        setSaveError("");
        setSaveMessage("");
        const wasActive = specificProduct?.is_active;
        const result = await toggleProductStatus(specificProduct.id);

        if (result?.success) {
            setSaveMessage(
                result?.message || `Product ${wasActive ? "deactivated" : "activated"} successfully.`
            );
            setShowStatusModal(false);
        } else {
            setSaveError(result?.message || "Unable to change product status.");
        }

        setIsChangingStatus(false);
    };

    const openVariant = (variant) => {
        confirmNavigation("/addvariant", { variant, product: specificProduct });
    };

    const addVariant = () => {
        confirmNavigation("/addvariant", { product: specificProduct });
    };

    const toggleSidebar = () => setShowSidebar((visible) => !visible);

    return (
        <div className="d-flex admin-product-shell">
            <div className="d-none d-md-block admin-product-sidebar">
                <Sidebar />
            </div>

            <Offcanvas
                show={showSidebar}
                onHide={toggleSidebar}
                className="bg-dark text-white"
                style={{ width: "280px" }}
            >
                <Offcanvas.Header closeButton closeVariant="white">
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>

            <main className="admin-product-main">
                <Header title="Product Management" toggleSidebar={toggleSidebar} />

                <div className="product-edit-page">
                    <Button
                        variant="link"
                        className="product-back-link"
                        onClick={() => confirmNavigation("/productList")}
                    >
                        <FaArrowLeft aria-hidden="true" />
                        Back to products
                    </Button>

                    {!specificProduct?.id ? (
                        <Alert variant="warning" className="mt-3">
                            <Alert.Heading className="h5">No product selected</Alert.Heading>
                            <p className="mb-3">
                                Open a product from the product list before trying to edit its details or variants.
                            </p>
                            <Button variant="warning" onClick={() => navigate("/productList")}>
                                Open product list
                            </Button>
                        </Alert>
                    ) : (
                        <>
                            <section className="product-edit-hero">
                                <div>
                                    <div className="product-edit-eyebrow">Product {specificProduct?.code}</div>
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <h1>{specificProduct?.name || "Untitled product"}</h1>
                                        <Badge bg={specificProduct?.is_active ? "success" : "secondary"} pill>
                                            {specificProduct?.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                        {isDirty ? (
                                            <Badge bg="warning" text="dark" pill>
                                                Unsaved changes
                                            </Badge>
                                        ) : null}
                                    </div>
                                    <p>
                                        Update product information here. Stock, pricing and images are managed per
                                        variant below.
                                    </p>
                                </div>

                                <div className="product-edit-actions">
                                    <Button
                                        variant={specificProduct?.is_active ? "outline-danger" : "outline-success"}
                                        onClick={() => setShowStatusModal(true)}
                                        disabled={isSaving || isChangingStatus}
                                    >
                                        {specificProduct?.is_active ? "Deactivate" : "Activate"}
                                    </Button>
                                    <Button
                                        className="savebtn"
                                        onClick={handleSave}
                                        disabled={isSaving || !isDirty}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save changes"
                                        )}
                                    </Button>
                                </div>
                            </section>

                            {saveError ? (
                                <Alert variant="danger" dismissible onClose={() => setSaveError("")}>
                                    <Alert.Heading className="h6">Product could not be updated</Alert.Heading>
                                    <div>{saveError}</div>
                                </Alert>
                            ) : null}

                            {saveMessage ? (
                                <Alert variant="success" dismissible onClose={() => setSaveMessage("")}>
                                    {saveMessage}
                                </Alert>
                            ) : null}

                            <ProductForm
                                title="Product details"
                                productDetails={specificProduct}
                                ProductCategory={productCategory}
                                subcategoryApi={ProductSubCategory}
                                subCategoryData={productSubCategory}
                                specificProductData={specificProduct}
                                isEdit
                                updatedData={handleUpdatedData}
                                showImgField={false}
                            />

                            <Card className="variant-management-card">
                                <Card.Header className="variant-card-header">
                                    <div>
                                        <h2>Variants</h2>
                                        <p>
                                            Manage SKU, pricing, availability and images separately for each variant.
                                        </p>
                                    </div>
                                    <Button className="savebtn" onClick={addVariant}>
                                        <FaPlus className="me-2" aria-hidden="true" />
                                        Add variant
                                    </Button>
                                </Card.Header>

                                <Card.Body className="p-0">
                                    {variants.length === 0 ? (
                                        <div className="variant-empty-state">
                                            <FaImages aria-hidden="true" />
                                            <h3>No variants yet</h3>
                                            <p>Add the first variant to configure pricing, stock and product images.</p>
                                            <Button className="savebtn" onClick={addVariant}>
                                                Add first variant
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table hover className="variant-table align-middle mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Variant</th>
                                                        <th>SKU</th>
                                                        <th>Price</th>
                                                        <th>Stock</th>
                                                        <th>Images</th>
                                                        <th className="text-end">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {variants.map((variant) => (
                                                        <tr key={variant?.id}>
                                                            <td>
                                                                <div className="variant-identity">
                                                                    <img
                                                                        src={resolveImageUrl(variant?.images?.[0])}
                                                                        alt=""
                                                                        onError={(event) => {
                                                                            event.currentTarget.onerror = null;
                                                                            event.currentTarget.src = FALLBACK_IMAGE;
                                                                        }}
                                                                    />
                                                                    <div>
                                                                        <strong>{variant?.color || "Default variant"}</strong>
                                                                        <span>{variant?.size || "No size specified"}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="variant-sku">{variant?.sku || "Not set"}</span>
                                                            </td>
                                                            <td>
                                                                <strong>{formatCurrency(variant?.discounted_price)}</strong>
                                                                {Number(variant?.discount) > 0 ? (
                                                                    <span className="variant-discount">
                                                                        {variant.discount}% discount
                                                                    </span>
                                                                ) : null}
                                                            </td>
                                                            <td>
                                                                <Badge bg={variant?.in_stock ? "success" : "secondary"}>
                                                                    {variant?.in_stock ? "Available" : "Unavailable"}
                                                                </Badge>
                                                                <span className="variant-quantity">
                                                                    {variant?.quantity_in_stock ?? 0} units
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="variant-image-count">
                                                                    <FaImages aria-hidden="true" />
                                                                    {variant?.images?.length || 0}
                                                                </span>
                                                            </td>
                                                            <td className="text-end">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => openVariant(variant)}
                                                                >
                                                                    <AiFillEdit className="me-2" aria-hidden="true" />
                                                                    Edit & manage images
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </>
                    )}
                </div>
            </main>

            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {specificProduct?.is_active ? "Deactivate product?" : "Activate product?"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {specificProduct?.is_active
                        ? "This also deactivates the product's variants and images, removing it from active listings."
                        : "This also activates the product's variants and images, making them available to active listings."}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowStatusModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant={specificProduct?.is_active ? "danger" : "success"}
                        onClick={handleStatusChange}
                        disabled={isChangingStatus}
                    >
                        {isChangingStatus ? "Updating..." : specificProduct?.is_active ? "Deactivate" : "Activate"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EditSpecificProduct;
