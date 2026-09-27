import React, { useContext, useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import ProductForm from "../../components/Atoms/ProductForm";
import { Button, Offcanvas, Col, Row, Card } from "react-bootstrap";
import { VendorContext } from "../../context/VendorContext";
import ToastComponent from "../../components/HOC/Toast";
import ProductImageUpload from "../../components/Atoms/ProductImageUpload";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { AiOutlineUpload, AiOutlineDownload } from "react-icons/ai";
import { SERVER_URL } from "../../constants/SERVER_URL";
const AddProductbyCsv = () => {
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
        UploadCsv,
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

    const handleData = (data) => {
        setProductDetails(data);
    };

    const handleSave = () => {
        UploadCsv(csvFile);
        // AddProduct(productDetails);
        setShowToast(true);

        // Automatically hide the toast after 5 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 5000);
    };
    const [csvFile, setCsvFile] = useState(null);
    const [csvContent, setCsvContent] = useState([]);

    const onDropCSV = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        // UploadCsv(file)
        setShowToast(true);

        // Automatically hide the toast after 5 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 5000);
        setCsvFile(file);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const rows = text.trim().split("\n");
            const headers = rows[0].split(",");

            const parsedData = rows.slice(1).map(row => {
                const values = row.split(",");
                const obj = {};
                headers.forEach((h, i) => {
                    obj[h.trim()] = values[i]?.trim() ?? "";
                });
                return obj;
            });

            setCsvContent(parsedData);
            console.log("Parsed CSV:", parsedData);
        };
        reader.readAsText(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onDropCSV,
        accept: { "text/csv": [".csv"] },
        multiple: false,
    });
    const handleDownload = async (uri) => {
        window.open(`${await SERVER_URL()}/api/${uri}/`, "_blank")
    }
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
                    <h4 className="mb-3 mb-md-0">Add Product by csv file</h4>
                    <div className="d-flex gap-2">
                        <Button variant="outline-warning">Save to Draft</Button>
                        <Button className="savebtn" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </div>

                {/* Product Form and Image Upload */}
                <Row className="g-4 m-0">
                    <Col xs={12} md={12}>
                        <Card className="mx-auto shadow-sm body mt-4" style={{ maxWidth: "700px", width: "100%" }}>
                            <h5 className="p-3 text-center">Upload CSV File</h5>
                            <hr className="divider" />
                            <Card.Body className="p-3">
                                <div
                                    {...getRootProps()}
                                    className={`csv-upload-area border border-dashed rounded text-center p-4 ${isDragActive ? "active-dropzone" : ""
                                        }`}
                                    style={{ minHeight: "150px" }}
                                >
                                    <input {...getInputProps()} />
                                    <AiOutlineUpload size={30} className="mb-2" />
                                    <p className="mb-1 fs-6">
                                        {isDragActive ? "Drop the CSV here..." : "Drag and drop or browse your CSV file"}
                                    </p>
                                    <small className="text-muted">Only .csv files supported</small>
                                </div>


                            </Card.Body>
                        </Card>


                    </Col>
                    {/* <Col xs={12} md={4} className="m-5">
                        <Button
                            variant="outline-secondary"
                            className="mt-3 d-flex align-items-center w-100 mb-4"
                            onClick={() => handleDownload('admin/bulk-upload/template')}
                        >
                            <AiOutlineDownload size={20} className="m-2" /> Download .csv Template
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="mt-3 d-flex align-items-center w-100 mb-4"
                            onClick={() => handleDownload('admin/dummy-csv')}
                        >
                            <AiOutlineDownload size={20} className="m-2" /> Download Dummy .csv
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="mt-3 d-flex align-items-center w-100 mb-4"
                            onClick={() => handleDownload('admin/category-subcategory-mapping')}
                        >
                            <AiOutlineDownload size={20} className="m-2" /> Download Sub-category .csv file
                        </Button>
                    </Col> */}
                </Row>
                {csvFile && (
                    <Card className="mx-auto shadow-sm body mt-4" style={{ maxWidth: "700px", width: "100%" }}>
                        <Card.Body>
                            <div className="mt-3">
                                <p><strong>File:</strong> {csvFile.name}</p>
                                <p><strong>Preview (first 5 rows):</strong></p>
                                <pre style={{ maxHeight: '150px', overflowY: 'auto', background: '#f9f9f9', padding: '8px' }}>
                                    {csvContent.slice(0, 5).map((row, i) => (
                                        <div key={i}>{JSON.stringify(row)}</div>
                                    ))}
                                </pre>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Toast Notification */}

            </div>
        </div>
    );
};

export default AddProductbyCsv;
