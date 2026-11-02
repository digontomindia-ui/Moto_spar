import React, { useEffect, useState } from "react";
import { Form, Row, Col, Container, Card } from "react-bootstrap";
import "../../assets/Css/ProductForm.css";
import ProductImageUpload from "./ProductImageUpload";
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
    onDataSubmit,
    isEdit,
    updatedData,
    showImgField,
    title
}) => {
    const [imageFiles, setImageFiles] = useState([]);
    const [name, setname] = useState(specificProductData ? specificProductData?.name : "");
    const [description, setdescription] = useState(specificProductData ? specificProductData?.description : "");
    const [brand, setbrand] = useState(specificProductData ? specificProductData?.brand : "");
    const [model, setmodel] = useState(specificProductData ? specificProductData?.model : "");
    const [year, setyear] = useState(specificProductData ? specificProductData?.year : "");
    const [price, setprice] = useState(
        specificProductData?.variants && specificProductData.variants.length > 0
            ? specificProductData?.variants[0]?.price
            : null
    );
    const [weight, setweight] = useState(null);
    const [discount, setdiscount] = useState(
        specificProductData?.variants && specificProductData.variants.length > 0
            ? specificProductData?.variants[0]?.discount
            : null
    );
    const [sku, setsku] = useState(
        specificProductData?.variants && specificProductData.variants.length > 0
            ? specificProductData?.variants[0]?.sku
            : ""
    );
    const [color, setcolor] = useState("");
    const [size, setsize] = useState("");
    const [dimensions, setdimensions] = useState("");
    const [material, setmaterial] = useState("");
    const [features, setfeatures] = useState("");
    const [categoryId, setcategoryId] = useState(specificProductData ? specificProductData?.category?.id : null);
    const [subCategoryId, setsubCategoryId] = useState(
        specificProductData ? specificProductData?.sub_category?.id : null
    );
    const [delivery_charge, setdelivery_charge] = useState(
        specificProductData ? specificProductData?.delivery_charge : 0
    );

    const [delivery_time, setdelivery_time] = useState(specificProductData ? specificProductData?.delivery_time : 0);
    const [driver_fees, setdriver_fees] = useState(specificProductData ? specificProductData?.driver_fees : 0);
    const [mechanic_fees, setmechanic_fees] = useState(specificProductData ? specificProductData?.mechanic_fees : 0);
    const [gst, setgst] = useState(specificProductData ? specificProductData?.gst_rate?.toString() : "18");
    const [isChecked, setIsChecked] = useState(false);
    const [isGst, setisGst] = useState(specificProductData?.is_gst_applicable ?? true);

    const handleCheckboxChange = (e) => {
        setIsChecked(e.target.checked);
    };
 const handleGstCheckboxChange = (e) => {
        setisGst(e.target.checked);
    };
    const handleCategoryChange = (selectedId) => {

        setcategoryId(selectedId);
        subcategoryApi(selectedId); //passing the category id to fetch sub category
    };
    const handleSubCategoryChange = (selectedvalue) => {
        const data = JSON.parse(selectedvalue);
        setsubCategoryId(data.subcatId);
        productApi(0, data?.catId, data?.subcatId); //  passing the sub category and category id to fetch that products
    };
    useEffect(() => {
        if (onDataSubmit) {
            const productDetails = {
                name,
                description,
                brand,
                model,
                year,
                price,
                weight,
                discount,
                sku,
                color,
                size,
                dimensions,
                material,
                features,
                categoryId,
                subCategoryId,
                delivery_charge,
                delivery_time,
                driver_fees,
                mechanic_fees,
                imageFiles,
                gst_rate:Number(gst),
                is_gst_applicable: isGst,
            };

            onDataSubmit(productDetails);
        }
    }, [
        name,
        description,
        brand,
        model,
        year,
        price,
        weight,
        discount,
        sku,
        color,
        size,
        dimensions,
        material,
        features,
        categoryId,
        subCategoryId,
        delivery_charge,
        delivery_time,
        driver_fees,
        mechanic_fees,
        imageFiles,
        gst,
        isGst,
        onDataSubmit,
    ]);


    useEffect(() => {
        if (isEdit && specificProductData) {
            updatedData({
                name,
                description,
                brand,
                model,
                year,
                categoryId,
                subCategoryId,
                delivery_charge,
                delivery_time,
                driver_fees,
                mechanic_fees,
                gst_rate:Number(gst),
                is_gst_applicable: isGst,
            });
        }
    }, [
        isEdit,
        specificProductData,
        updatedData,
        name,
        description,
        brand,
        model,
        year,
        categoryId,
        subCategoryId,
        delivery_charge,
        delivery_time,
        driver_fees,
        mechanic_fees,
        gst,
        isGst
    ]);
    return (
        <Container>
            <Card className="shadow-sm rounded custom-card product-form-card">
                <h5 className="subHeading">{title || (isEdit ? "Product information" : "Add product details")}</h5>
                <hr className="divider"></hr>
                <Card.Body>
                    <Form>
                        <Form.Group controlId="productName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setname(e.target.value)}
                            ></Form.Control>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                {productDetails ? (
                                    <Form.Group controlId="productCategory" className="mt-3">
                                        <Form.Label>Product Category</Form.Label>
                                        <Form.Select
                                            value={categoryId || ""} // Use categoryId for the controlled value
                                            onChange={(e) => {
                                                const selectedId = e.target.value; // Get the selected category ID
                                                setcategoryId(selectedId);
                                                handleCategoryChange(selectedId); // Update categoryId
                                            }}
                                        >
                                            <option value="" hidden>
                                                {specificProductData?.category?.name || "Select a category"}
                                            </option>
                                            {ProductCategory.map((data) => (
                                                <option key={data.id} value={data.id}>
                                                    {data.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                ) : (
                                    <Form.Group controlId="productCategory">
                                        <Form.Label className="pt-3">Product Category</Form.Label>
                                        <Form.Select
                                            onChange={(e) => handleCategoryChange(e.target.value)} // Update categoryId on change
                                        >
                                            {" "}
                                            <option value="">Choose...</option>
                                            {ProductCategory.map((data, index) => (
                                                <option key={index} value={data.id}>
                                                    {data?.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                )}
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="SubCategory">
                                    <Form.Label className="pt-3">Product Sub Category</Form.Label>
                                    {productDetails ? (
                                        <Form.Select
                                            value={subCategoryId || ""} // Use categoryId for the controlled value
                                            onChange={(e) => {
                                                const selectedId = e.target.value; // Get the selected category ID
                                                setsubCategoryId(selectedId); // Update categoryId
                                            }}
                                        >
                                            <option value="" hidden>
                                                {specificProductData?.sub_category?.name || "Select a category"}
                                            </option>
                                            {subCategoryData.map((data) => (
                                                <option key={data.id} value={data.id}>
                                                    {data.name}
                                                </option>
                                            ))}
                                        </Form.Select>
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
                            {isEdit ? null : (
                                <>
                                    <Col md={4}>
                                        <Form.Group controlId="sku">
                                            <Form.Label className="pt-3">Stock Keeping Unit (SKU)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="SKU"
                                                value={sku}
                                                onChange={(e) => setsku(e.target.value)}
                                            ></Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="mrp">
                                            <Form.Label className="pt-3">MRP</Form.Label>

                                            <Form.Control
                                                type="Number"
                                                placeholder="MRP"
                                                value={price}
                                                onChange={(e) => setprice(e.target.value)}
                                            ></Form.Control>
                                        </Form.Group>
                                    </Col>

                                    <Col md={4}>
                                        <Form.Group controlId="discuntedPrice">
                                            <Form.Label className="pt-3">Discount in percentage %</Form.Label>
                                            <Form.Control
                                                type="number" // Correct type for number input
                                                placeholder="Discount Price"
                                                value={discount}
                                                onChange={(e) => setdiscount(parseFloat(e.target.value) || null)} // Ensure value is treated as a number
                                            />
                                        </Form.Group>
                                    </Col>
                                </>
                            )}
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="Delivery Charge">
                                    <Form.Label className="pt-3">Delivery Charge</Form.Label>
                                    <Form.Control
                                        type="Number"
                                        placeholder="Delivery Charge"
                                        value={delivery_charge}
                                        onChange={(e) => setdelivery_charge(e.target.value)}
                                    ></Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="Delivery Time">
                                    <Form.Label className="pt-3">Delivery Time (No. of days)</Form.Label>
                                    <Form.Control
                                        type="Number"
                                        placeholder="Delivery Time"
                                        value={delivery_time}
                                        onChange={(e) => setdelivery_time(e.target.value)}
                                    ></Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        {isEdit ? (
                            <Row>
                                <Col md={6}>
                                    <Form.Group controlId="Mechanic Fee">
                                        <Form.Label className="pt-3">Mechanic Fee</Form.Label>
                                        <Form.Control
                                            type="Number"
                                            placeholder="Mechanic Fee"
                                            value={mechanic_fees}
                                            onChange={(e) => setmechanic_fees(parseFloat(e.target.value) || 0)}
                                        ></Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="Driver Fee">
                                        <Form.Label className="pt-3">Driver Fee</Form.Label>
                                        <Form.Control
                                            type="Number"
                                            placeholder="Driver Fee"
                                            value={driver_fees}
                                            onChange={(e) => setdriver_fees(e.target.value || 0)}
                                        ></Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                        ) : (
                            <>
                                <Row>
                                     <Col md={6}>
                                    <Form>
                                        <Form.Check
                                            className="mt-3"
                                            type="checkbox"
                                            id="custom-checkbox"
                                            label="Add GST to this Product"
                                            checked={isGst}
                                            onChange={handleGstCheckboxChange}
                                        />
                                    </Form>
                                      </Col>
                                   <Col md={6}>
                                    <Form>
                                        <Form.Check
                                            className="mt-3"
                                            type="checkbox"
                                            id="custom-checkbox"
                                            label="Add Mechanic and driver fee"
                                            checked={isChecked}
                                            onChange={handleCheckboxChange}
                                        />
                                    </Form>
                                      </Col>
                                      
                                </Row>
                                {isChecked ? (
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group controlId="Mechanic Fee">
                                                <Form.Label className="pt-3">Mechanic Fee</Form.Label>
                                                <Form.Control
                                                    type="Number"
                                                    placeholder="Mechanic Fee"
                                                    value={mechanic_fees}
                                                    onChange={(e) =>
                                                        setmechanic_fees(parseFloat(e.target.value) || 0)
                                                    }
                                                ></Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="Driver Fee">
                                                <Form.Label className="pt-3">Driver Fee</Form.Label>
                                                <Form.Control
                                                    type="Number"
                                                    placeholder="Driver Fee"
                                                    value={driver_fees}
                                                    onChange={(e) => setdriver_fees(e.target.value || 0)}
                                                ></Form.Control>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                ) : null}
                            </>
                        )}

                        <Row>
                            {isGst &&(
                                 <Col md={4}>
                                <Form.Group controlId="GST">
                                    <Form.Label className="pt-3">GST</Form.Label>
                                    <Form.Select
                                        value={gst} // Bind the value to the state
                                        onChange={(e) => setgst(e.target.value)} // Update the state on change
                                    >
                                        <option value="5">5%</option>
                                        <option value="18">18%</option>
                                        <option value="28">28%</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            )}
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group controlId="make">
                                    <Form.Label className="pt-3">Brand</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Brand"
                                        value={brand}
                                        onChange={(e) => setbrand(e.target.value)} // Directly handle the change
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
                                        onChange={(e) => setmodel(e.target.value)} // Directly handle the change
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="year">
                                    <Form.Label className="pt-3">Year</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Year"
                                        value={year} // Improved logic
                                        onChange={(e) => setyear(e.target.value)} // Directly handle the change
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {isEdit ? null : (
                            <Row>
                                <Col md={4}>
                                    <Form.Group controlId="color">
                                        <Form.Label className="pt-3">Color</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Color"
                                            value={color}
                                            onChange={(e) => setcolor(e.target.value)}
                                        ></Form.Control>
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
                                        ></Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="Item_Weight">
                                        <Form.Label className="pt-3">Item Weights (In kg)</Form.Label>
                                        <Form.Control
                                            type="Number"
                                            placeholder="Item Weight"
                                            value={weight}
                                            onChange={(e) => setweight(e.target.value)}
                                        ></Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                        {isEdit ? null : (
                            <Row>
                                <Col md={4}>
                                    <Form.Group controlId="dimensions">
                                        <Form.Label className="pt-3">Dimensions</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Dimensions"
                                            value={dimensions}
                                            onChange={(e) => setdimensions(e.target.value)}
                                        ></Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="Material">
                                        <Form.Label className="pt-3">Material</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Material"
                                            value={material}
                                            onChange={(e) => setmaterial(e.target.value)}
                                        ></Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="features">
                                        <Form.Label className="pt-3">Features</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Features"
                                            value={features}
                                            onChange={(e) => setfeatures(e.target.value)}
                                        ></Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                        <Form.Group controlId="notes">
                            <Form.Label className="pt-3">Product Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                type="text"
                                value={description}
                                onChange={(e) => setdescription(e.target.value)} // Directly handle the change
                            />
                        </Form.Group>
                        {showImgField !== false && (
                            <div className="mt-4">
                                <ProductImageUpload
                                    files={imageFiles}
                                    onChangeFiles={setImageFiles}
                                    maxFiles={10}
                                    maxSizeMB={10}
                                    title="Initial Variant Images"
                                    subtitle="Add photos for this product's initial variant (JPEG, PNG, WEBP, GIF up to 10 MB)."
                                />
                            </div>
                        )}
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProductForm;
