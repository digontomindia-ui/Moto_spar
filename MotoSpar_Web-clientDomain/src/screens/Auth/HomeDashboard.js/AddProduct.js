import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import ProductForm from "../../../components/Atoms/ProductForm";
import { Button, Offcanvas } from "react-bootstrap";
import { VendorContext } from "../../../context/VendorContext";
import ToastComponent from "../../../components/HOC/Toast";

const AddProduct = () => {
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
    } = useContext(VendorContext);
    useEffect(() => {
        ProductCategory();
    }, []);
    const [showToast, setShowToast] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

    const toggleSidebar = () => setShowSidebar(!showSidebar);
    const handleSave = () => {
        AddProduct(variantId, stockQty, vendorPrice);
        setShowToast(true);

        // Automatically hide the toast after 5 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 5000); //
    };
    return (
        <div className="d-flex flex-column flex-md-row">
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
            <div className="flex-grow-1">
                <Header title={"Product Management"} toggleSidebar={toggleSidebar} />
                <div className="d-flex justify-content-between align-items-center m-4">
                    <h4>Add Product</h4>
                    <div>
                        <Button variant="outline-warning" className="me-3">
                            Save to Draft
                        </Button>
                        <Button className="savebtn" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </div>
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
                    stockQty={stockQty}
                />

            </div>
        </div>
    );
};

export default AddProduct;
