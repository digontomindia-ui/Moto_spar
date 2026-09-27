import React, {useEffect, useState} from "react";
import {Form, Button, Row, Col, Container, Card} from "react-bootstrap";
import "../../assets/Css/ProductForm.css";
const ProductForm = ({
    ProductCategory,
    subcategoryApi,
    subCategoryData,
    productApi,
    productData,
    specificProductApi,
    specificProductData,
    productDetails,
    setvariantId,
    setvendorPrice,
    setstockQty,
    variantId,
    vendorPrice,
    stockQty,
}) => {
    useEffect(() => {
        setvariantId(productDetails ? productDetails?.id : specificProductData?.products?.variants[0]?.id);
        setvendorPrice(productDetails?.price);
        setstockQty(productDetails?.stock_quantity);
    }, [specificProductData, productDetails]);
    console.log(">>>hsgdch", vendorPrice, stockQty, variantId);
    const handleCategoryChange = (selectedId) => {
        console.log("Selected Category id:", selectedId);
        subcategoryApi(selectedId); //passing the category id to fetch sub category
    };
    const handleSubCategoryChange = (selectedvalue) => {
        const data = JSON.parse(selectedvalue);
        console.log("Selected SubCategory id:", data.subcatId, ">>catid", data.catId);
        productApi(0, data?.catId, data?.subcatId); //  passing the sub category and category id to fetch that products
    };
    const handleProducts = (selectedId) => {
        console.log("Selected product id:", selectedId);
        specificProductApi(selectedId);
    };

    return (
        <Container>
            <Card className="shadow-sm rounded custom-card m-4 ">
                <h5 className="subHeading">Add Product details</h5>
                <hr className="divider"></hr>
                <Card.Body>
                    <Form>
                        <Form.Group controlId="productName">
                            <Form.Label>Name</Form.Label>
                            {productDetails ? (
                                <Form.Control type="text" value={productDetails?.product?.name} />
                            ) : (
                                <Form.Control as="select" onChange={(e) => handleProducts(e.target.value)}>
                                    <option value="">Choose...</option>
                                    {productData.map((data, index) => (
                                        <option key={index} value={data.id}>
                                            {data?.name}
                                        </option>
                                    ))}
                                </Form.Control>
                            )}
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="productCategory">
                                    <Form.Label className="pt-3">Product Category</Form.Label>
                                    {productDetails ? (
                                        <Form.Control type="text" value={productDetails?.product?.category?.name} />
                                    ) : (
                                        <Form.Control
                                            as="select"
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                        >
                                            <option value="">Choose...</option>
                                            {ProductCategory.map((data, index) => (
                                                <option key={index} value={data.id}>
                                                    {data?.name}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="SubCategory">
                                    <Form.Label className="pt-3">Product Sub Category</Form.Label>
                                    {productDetails ? (
                                        <Form.Control type="text" value={productDetails?.product?.sub_category?.name} />
                                    ) : (
                                        <Form.Control
                                            as="select"
                                            onChange={(e) => handleSubCategoryChange(e.target.value)}
                                        >
                                            <option value="">Choose...</option>
                                            {subCategoryData.map((data, index) => (
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
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="sku">
                                    <Form.Label className="pt-3">Stock Qty.</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="SKU"
                                        value={stockQty}
                                        onChange={(e) => setstockQty(e.target.value)}
                                    ></Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="mrp">
                                    <Form.Label className="pt-3">MRP</Form.Label>

                                    <Form.Control
                                        type="text"
                                        placeholder="MRP"
                                        value={
                                            productDetails
                                                ? productDetails?.variant?.price
                                                : specificProductData?.products?.variants[0]?.price
                                        }
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group controlId="discuntedPrice">
                                    <Form.Label className="pt-3">Discounted Price</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Price"
                                        value={vendorPrice} // Improved logic
                                        onChange={(e) => setvendorPrice(e.target.value)} // Directly handle the change
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group controlId="make">
                                    <Form.Label className="pt-3">Make</Form.Label>
                                    <Form.Control as="select">
                                        <option>
                                            {productDetails
                                                ? productDetails?.product?.brand
                                                : specificProductData?.products?.brand}
                                        </option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="model">
                                    <Form.Label className="pt-3">Model</Form.Label>
                                    <Form.Control as="select">
                                        <option>
                                            {productDetails
                                                ? productDetails?.product?.model
                                                : specificProductData?.products?.model}
                                        </option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="year">
                                    <Form.Label className="pt-3">Year</Form.Label>
                                    <Form.Control as="select">
                                        <option>
                                            {productDetails
                                                ? productDetails?.product?.year
                                                : specificProductData?.products?.year}
                                        </option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group controlId="notes">
                            <Form.Label className="pt-3">Notes</Form.Label>
                            <Form.Control as="textarea" rows={3} />
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProductForm;
