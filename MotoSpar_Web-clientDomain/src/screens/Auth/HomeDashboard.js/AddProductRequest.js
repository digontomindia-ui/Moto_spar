import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import ProductImageUpload from "../../../components/Atoms/ProductImageUpload";
import { Form, Button, Row, Col, Container, Card, Offcanvas } from "react-bootstrap";
import { VendorContext } from "../../../context/VendorContext";
import ToastComponent from "../../../components/HOC/Toast";

const AddProductRequest = () => {
    const {
        AddProductRequest,
        ProductCategory,
        productCategory,
        ProductSubCategory,
        productSubCategory,
        AllProduct,
        toastMessage,
    } = useContext(VendorContext);

    const [showSidebar, setShowSidebar] = useState(false);
    const toggleSidebar = () => setShowSidebar(!showSidebar);

    const [name, setname] = useState("");
    const [description, setdescription] = useState("");
    const [brand, setbrand] = useState("");
    const [model, setmodel] = useState("");
    const [year, setyear] = useState("");
    const [price, setprice] = useState(null);
    const [weight, setweight] = useState(null);
    const [discount, setdiscount] = useState(null);
    const [color, setcolor] = useState("");
    const [size, setsize] = useState("");
    const [dimensions, setdimensions] = useState("");
    const [material, setmaterial] = useState("");
    const [features, setfeatures] = useState("");
    const [categoryId, setcategoryId] = useState("");
    const [subCategoryId, setsubCategoryId] = useState("");
    const [showToast, setShowToast] = useState(false);
    useEffect(() => {
        ProductCategory();
    }, []);

    const handleCategoryChange = (selectedId) => {
        ProductSubCategory(selectedId);
        setcategoryId(selectedId);
    };

    const handleSubCategoryChange = (selectedValue) => {
        const data = JSON.parse(selectedValue);
        setsubCategoryId(data?.subcatId);
        AllProduct(0, data?.catId, data?.subcatId);
    };
    console.log(
        name,
        description,
        brand,
        model,
        year,
        price,
        weight,
        discount,
        color,
        size,
        dimensions,
        material,
        features,
        categoryId,
        subCategoryId
    );
    const handleSave = () => {
        AddProductRequest(
            name,
            description,
            brand,
            model,
            year,
            price,
            weight,
            discount,
            color,
            size,
            dimensions,
            material,
            features,
            categoryId,
            subCategoryId
        );
        setShowToast(true);

        // Automatically hide the toast after 5 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 5000);
    };
    return (
        <div className="d-flex">
            {/* Sidebar */}
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

            {/* Main Content */}
            <div style={{ flex: 1 }}>
                <Header title={"Prduct Request"} toggleSidebar={toggleSidebar} />
                <div className="d-flex justify-content-between align-items-center m-4">
                    <h4>Add New Product Request</h4>
                    <div>
                        <Button variant="outline-warning" className="me-3">
                            Save to Draft
                        </Button>
                        <Button className="savebtn" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </div>

                {/* Responsive Layout */}
                <Container fluid>
                    <Row>
                        {/* Image Upload Section */}
                        <Col xs={12} md={4} className="mb-4">
                            <ProductImageUpload />
                        </Col>

                        {/* Product Form Section */}
                        <Col xs={12} md={8}>
                            <Card className="shadow-sm rounded custom-card">
                                <h5 className="subHeading">Add Product Details</h5>
                                <hr className="divider" />
                                <Card.Body>
                                    <Form>
                                        <Form.Group controlId="productName">
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Name"
                                                value={name}
                                                onChange={(e) => setname(e.target.value)}
                                            />
                                        </Form.Group>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group controlId="productCategory">
                                                    <Form.Label className="pt-3">Product Category</Form.Label>
                                                    <Form.Select onChange={(e) => handleCategoryChange(e.target.value)}>
                                                        <option value="">Choose...</option>
                                                        {productCategory.map((data, index) => (
                                                            <option key={index} value={data.id}>
                                                                {data?.name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="productSubCategory">
                                                    <Form.Label className="pt-3">Product Sub Category</Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        onChange={(e) => handleSubCategoryChange(e.target.value)}
                                                    >
                                                        <option value="">Choose...</option>
                                                        {productSubCategory.map((data, index) => (
                                                            <option
                                                                key={index}
                                                                value={JSON.stringify({
                                                                    subcatId: data?.id,
                                                                    catId: data?.category?.id,
                                                                })}
                                                            >
                                                                {data?.name}
                                                            </option>
                                                        ))}
                                                    </Form.Control>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group controlId="price">
                                                    <Form.Label className="pt-3">MRP</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="MRP"
                                                        value={price}
                                                        onChange={(e) => setprice(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="discount">
                                                    <Form.Label className="pt-3">Discount (%)</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Discount"
                                                        value={discount}
                                                        onChange={(e) => setdiscount(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={4}>
                                                <Form.Group controlId="brand">
                                                    <Form.Label className="pt-3">Brand</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Brand"
                                                        value={brand}
                                                        onChange={(e) => setbrand(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group controlId="model">
                                                    <Form.Label className="pt-3">Model</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Model"
                                                        value={model}
                                                        onChange={(e) => setmodel(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group controlId="year">
                                                    <Form.Label className="pt-3">Year</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Year"
                                                        value={year}
                                                        onChange={(e) => setyear(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={4}>
                                                <Form.Group controlId="color">
                                                    <Form.Label className="pt-3">Color</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Color"
                                                        value={color}
                                                        onChange={(e) => setcolor(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group controlId="size">
                                                    <Form.Label className="pt-3">Size</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Size"
                                                        value={size}
                                                        onChange={(e) => setsize(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group controlId="weight">
                                                    <Form.Label className="pt-3">Weight</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Weight"
                                                        value={weight}
                                                        onChange={(e) => setweight(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group controlId="description">
                                            <Form.Label className="pt-3">Product Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Description"
                                                value={description}
                                                onChange={(e) => setdescription(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>

            </div>
        </div>
    );
};

export default AddProductRequest;
