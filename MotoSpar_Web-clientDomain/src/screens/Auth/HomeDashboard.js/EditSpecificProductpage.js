import React, { useContext, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import ProductForm from "../../../components/Atoms/ProductForm";
import ProductImageUpload from "../../../components/Atoms/ProductImageUpload";
import { Button, Offcanvas, Row, Col } from "react-bootstrap";
import { VendorContext } from "../../../context/VendorContext";
import ToastComponent from "../../../components/HOC/Toast";

const EditSpecificProductpage = ({ route }) => {
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
    } = useContext(VendorContext);

    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile
    const toggleSidebar = () => setShowSidebar(!showSidebar);

    const [showToast, setShowToast] = useState(false);

    const handleSave = () => {
        EditProduct(variantId, stockQty, vendorPrice);
        setShowToast(true);

        // Automatically hide the toast after 5 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 5000);
    };

    return (
        <div className="d-flex">
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
            <div style={{ flex: 1 }}>
                <Header title={"Product Management"} toggleSidebar={toggleSidebar} />
                <div className="d-flex justify-content-between align-items-center m-4">
                    <h4>{specificProduct?.product?.name}</h4>
                    <div>
                        <Button variant="outline-warning" className="me-3">
                            Save to Draft
                        </Button>
                        <Button className="savebtn" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </div>
                <div className="m-4">
                    <Row>
                        {/* Image Upload Section */}
                        <Col xs={12} lg={4} className="mb-3">
                            <ProductImageUpload />
                        </Col>
                        {/* Product Form Section */}
                        <Col xs={12} lg={8} className="mb-3">
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
                            />
                        </Col>
                    </Row>
                    {/* Toast Notification */}

                </div>
            </div>
        </div>
    );
};

export default EditSpecificProductpage;
