import React, { useCallback, useContext, useState } from "react";
import { Alert, Button, Card, Form, Offcanvas } from "react-bootstrap";
import { AiOutlineDownload, AiOutlineUpload } from "react-icons/ai";
import { FaArrowLeft, FaCheckCircle, FaFileCsv, FaTimes } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import { SERVER_URL } from "../../constants/SERVER_URL";
import { VendorContext } from "../../context/VendorContext";
import "../../assets/Css/ProductManagement.css";

const MAX_CSV_SIZE = 10 * 1024 * 1024;

const getSelectionKey = (item) =>
    `${item.category_name.toLowerCase()}::${item.sub_category_name.toLowerCase()}`;

const AddProductbyCsv = () => {
    const navigate = useNavigate();
    const { UploadCsv, PreviewBulkUpload, loadingactivity } = useContext(VendorContext);
    const [showSidebar, setShowSidebar] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [fileSummary, setFileSummary] = useState(null);
    const [fileError, setFileError] = useState("");
    const [taxonomyPreview, setTaxonomyPreview] = useState(null);
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [uploadResult, setUploadResult] = useState(null);

    const resetFile = () => {
        setCsvFile(null);
        setFileSummary(null);
        setFileError("");
        setTaxonomyPreview(null);
        setSelectedSubcategories([]);
        setUploadResult(null);
    };

    const onDropCSV = useCallback((acceptedFiles, rejectedFiles) => {
        setFileError("");
        const rejection = rejectedFiles?.[0];
        if (rejection) {
            const isTooLarge = rejection.errors.some((error) => error.code === "file-too-large");
            setFileError(isTooLarge ? "CSV files must be 10 MB or smaller." : "Choose a valid .csv file.");
            return;
        }

        const file = acceptedFiles[0];
        if (!file) return;
        setCsvFile(file);
        setTaxonomyPreview(null);
        setSelectedSubcategories([]);
        setUploadResult(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = String(event.target?.result || "");
            const nonEmptyRows = text.split(/\r?\n/).filter((row) => row.trim());
            const headers = (nonEmptyRows[0] || "").split(",").map((header) => header.trim()).filter(Boolean);
            setFileSummary({ rowCount: Math.max(0, nonEmptyRows.length - 1), headers });
        };
        reader.onerror = () => setFileError("This file could not be read. Choose it again.");
        reader.readAsText(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onDropCSV,
        accept: { "text/csv": [".csv"] },
        maxFiles: 1,
        maxSize: MAX_CSV_SIZE,
        multiple: false,
    });

    const handleValidate = async () => {
        if (!csvFile || loadingactivity) return;
        setUploadResult(null);
        setTaxonomyPreview(null);
        setSelectedSubcategories([]);
        const result = await PreviewBulkUpload(csvFile);
        if (result?.status === true) setTaxonomyPreview(result.data || {});
    };

    const uploadProducts = async (subcategories = []) => {
        if (!csvFile || loadingactivity) return;
        const result = await UploadCsv(csvFile, subcategories);
        if (result) {
            setUploadResult(result);
            if (result.status === true) {
                setTaxonomyPreview(null);
                setSelectedSubcategories([]);
            }
        }
    };

    const toggleSubcategorySelection = (item) => {
        const key = getSelectionKey(item);
        setSelectedSubcategories((current) => (
            current.some((entry) => getSelectionKey(entry) === key)
                ? current.filter((entry) => getSelectionKey(entry) !== key)
                : [...current, { category_name: item.category_name, sub_category_name: item.sub_category_name }]
        ));
    };

    const handleDownload = async (uri) => {
        window.open(`${await SERVER_URL()}/api/${uri}/`, "_blank", "noopener,noreferrer");
    };

    const validationErrors = taxonomyPreview?.validation_errors || [];
    const missingCategories = taxonomyPreview?.missing_categories || [];
    const missingSubcategories = taxonomyPreview?.missing_subcategories || [];
    const isReady = taxonomyPreview && !validationErrors.length && !missingCategories.length && !missingSubcategories.length;

    return (
        <div className="d-flex product-management-shell">
            <div className="d-none d-md-block"><Sidebar /></div>
            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="bg-dark text-white">
                <Offcanvas.Header closeButton closeVariant="white"><Offcanvas.Title>Menu</Offcanvas.Title></Offcanvas.Header>
                <Offcanvas.Body className="p-0"><Sidebar /></Offcanvas.Body>
            </Offcanvas>

            <main className="product-management-main">
                <Header title="Product Management" toggleSidebar={() => setShowSidebar((visible) => !visible)} />
                <div className="product-management-page csv-import-page">
                    <section className="product-management-heading">
                        <div>
                            <button type="button" className="product-back-link" onClick={() => navigate("/productList")}>
                                <FaArrowLeft aria-hidden="true" /> Back to products
                            </button>
                            <h2>Import products from CSV</h2>
                            <p>Validate the file first. No products are created until you confirm the final upload.</p>
                        </div>
                        <Button variant="outline-secondary" onClick={() => handleDownload("admin/bulk-upload/template")}>
                            <AiOutlineDownload className="me-2" />Download template
                        </Button>
                    </section>

                    <div className="csv-step-grid">
                        <Card className="product-management-card">
                            <Card.Body>
                                <span className="csv-step-label">Step 1</span>
                                <h3>Choose CSV file</h3>
                                <p className="text-muted">Use the current template and keep the column headings unchanged.</p>
                                <div {...getRootProps()} className={`csv-upload-area ${isDragActive ? "active" : ""}`}>
                                    <input {...getInputProps()} />
                                    <AiOutlineUpload aria-hidden="true" />
                                    <strong>{isDragActive ? "Drop the CSV here" : "Drag and drop, or click to browse"}</strong>
                                    <span>One .csv file, maximum 10 MB</span>
                                </div>
                                {fileError ? <Alert variant="danger" className="mt-3 mb-0">{fileError}</Alert> : null}

                                {csvFile ? (
                                    <div className="csv-file-summary">
                                        <FaFileCsv aria-hidden="true" />
                                        <div>
                                            <strong>{csvFile.name}</strong>
                                            <span>{(csvFile.size / 1024).toFixed(1)} KB · {fileSummary?.rowCount ?? "…"} data row(s)</span>
                                        </div>
                                        <Button variant="light" size="sm" aria-label="Remove selected CSV" onClick={resetFile}><FaTimes /></Button>
                                    </div>
                                ) : null}
                                {fileSummary?.headers?.length ? (
                                    <div className="csv-header-summary"><strong>Detected columns:</strong> {fileSummary.headers.join(", ")}</div>
                                ) : null}
                            </Card.Body>
                        </Card>

                        <Card className="product-management-card">
                            <Card.Body>
                                <span className="csv-step-label">Step 2</span>
                                <h3>Validate catalogue data</h3>
                                <p className="text-muted">We check row values, categories and sub-categories before anything is saved.</p>
                                <Button className="savebtn" onClick={handleValidate} disabled={!csvFile || loadingactivity}>
                                    {loadingactivity ? "Checking CSV…" : "Validate CSV"}
                                </Button>
                                {!taxonomyPreview ? (
                                    <div className="csv-idle-state">Choose a file, then validate it to continue.</div>
                                ) : null}
                            </Card.Body>
                        </Card>
                    </div>

                    {taxonomyPreview ? (
                        <Card className="product-management-card csv-results-card">
                            <Card.Body>
                                <span className="csv-step-label">Step 3</span>
                                <h3>Review and upload</h3>

                                {validationErrors.length ? (
                                    <Alert variant="danger">
                                        <strong>Fix these rows before uploading.</strong>
                                        <p>No products were uploaded. Correct the CSV, choose it again and revalidate.</p>
                                        <ul className="mb-0">{validationErrors.slice(0, 20).map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</ul>
                                        {validationErrors.length > 20 ? <p className="mt-2 mb-0">And {validationErrors.length - 20} more issue(s).</p> : null}
                                    </Alert>
                                ) : null}

                                {missingCategories.length ? (
                                    <Alert variant="danger">
                                        <strong>Create these categories before importing:</strong>
                                        <ul className="mb-2 mt-2">{missingCategories.map((item) => (
                                            <li key={item.category_name}>{item.category_name} — row(s) {item.rows.join(", ")}</li>
                                        ))}</ul>
                                        <Button variant="outline-danger" size="sm" onClick={() => navigate("/addSubCategory")}>Open categories</Button>
                                    </Alert>
                                ) : null}

                                {!missingCategories.length && missingSubcategories.length ? (
                                    <Alert variant="warning">
                                        <strong>Select the missing sub-categories you approve creating.</strong>
                                        <div className="csv-taxonomy-list">
                                            {missingSubcategories.map((item) => {
                                                const key = getSelectionKey(item);
                                                return (
                                                    <Form.Check
                                                        key={key}
                                                        type="checkbox"
                                                        checked={selectedSubcategories.some((entry) => getSelectionKey(entry) === key)}
                                                        onChange={() => toggleSubcategorySelection(item)}
                                                        label={`${item.sub_category_name} under ${item.category_name} — row(s) ${item.rows.join(", ")}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <Button
                                            variant="warning"
                                            onClick={() => uploadProducts(selectedSubcategories)}
                                            disabled={!selectedSubcategories.length || loadingactivity}
                                        >
                                            {loadingactivity ? "Creating and uploading…" : `Create ${selectedSubcategories.length} selected and upload`}
                                        </Button>
                                    </Alert>
                                ) : null}

                                {isReady ? (
                                    <Alert variant="success" className="mb-0">
                                        <div className="product-success-row">
                                            <div><strong><FaCheckCircle className="me-2" />CSV is ready</strong><p className="mb-0 mt-1">All checked rows and taxonomy values are valid.</p></div>
                                            <Button variant="success" onClick={() => uploadProducts()} disabled={loadingactivity}>
                                                {loadingactivity ? "Uploading products…" : "Upload products"}
                                            </Button>
                                        </div>
                                    </Alert>
                                ) : null}
                            </Card.Body>
                        </Card>
                    ) : null}

                    {uploadResult ? (
                        <Alert variant={uploadResult.status === true ? "success" : "danger"} className="product-management-alert">
                            <strong>{uploadResult.status === true ? "Import completed" : "Import finished with issues"}</strong>
                            <p className="mb-0 mt-1">{uploadResult.message || "Review the upload result and correct any failed rows before retrying."}</p>
                            {uploadResult.status === true ? <Button variant="outline-success" size="sm" className="mt-3" onClick={() => navigate("/productList")}>View products</Button> : null}
                        </Alert>
                    ) : null}
                </div>
            </main>
        </div>
    );
};

export default AddProductbyCsv;
