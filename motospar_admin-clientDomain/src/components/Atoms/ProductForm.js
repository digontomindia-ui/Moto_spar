import React, { useContext, useEffect, useState } from "react";
import { Form, Row, Col, Container, Card } from "react-bootstrap";
import "../../assets/Css/ProductForm.css";
import { VendorContext } from "../../context/VendorContext";
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
    setShowToast,
    toggleProductStatusAPI,
    updatedData,
    showImgField
}) => {
    // const { setimages, images, toggleProductStatus } = useContext(VendorContext);
    const [images, setimages] = useState([])
    const [imageUrl, setimageUrl] = useState('');
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
    const [stock_status, setstock_status] = useState(
        specificProductData?.variants && specificProductData.variants.length > 0
            ? specificProductData?.variants[0]?.in_stock
            : ""
    );
   
    const [gst, setgst] = useState(specificProductData ? specificProductData?.gst_rate?.toString() : 0);
    const [status, setstatus] = useState("");
    const [categoryName, setcategoryName] = useState("");
    const [subCategoryName, setsubCategoryName] = useState(
        specificProductData?.category ? specificProductData?.sub_category?.name : ""
    );
    const [isChecked, setIsChecked] = useState(false);
    const [isGst, setisGst] = useState(true


    )

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
    const handleProducts = (selectedId) => {

        specificProductApi(selectedId);
    };
    useEffect(() => {
        if (specificProductData?.variants && specificProductData.variants.length > 0) {
            setstatus(specificProductData?.is_active === false ? "false" : "true");
        }
    }, [specificProductData]); // Re-run this effect whenever specificProductData changes

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
                images,
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
        images,
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
        gst
    ]);
    const handleStatus = () => {
        toggleProductStatusAPI(specificProductData?.id);
        // setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 5000); //
    };
    const addImage = () => {
        if (imageUrl !== "") {
            setimages([...images, imageUrl]);
            setimageUrl("");
        }
    };

    const removeImage = (index) => {
        setimages(images.filter((_, i) => i !== index));
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
                                                const selectedCategory = ProductCategory.find(
                                                    (data) => data.id === selectedId
                                                );
                                                setcategoryName(selectedCategory?.name || ""); // Update categoryName
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
                                                const selectedCategory = subCategoryData.find(
                                                    (data) => data.id === selectedId
                                                );
                                                setsubCategoryName(selectedCategory?.name || ""); // Update categoryName
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
                             <Col md={isGst ? 4 : 6}>
                                <Form.Group controlId="stockStatus">
                                    <Form.Label className="pt-3">Stock Status</Form.Label>
                                    <Form.Select
                                        value={stock_status} // Bind the value to the state
                                        onChange={(e) => setstock_status(e.target.value)} // Update the state on change
                                    >
                                        <option value="true">true</option>
                                        <option value="false">false</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                           
                            <Col md={isGst ? 4 : 6}>
                                <Form.Group controlId="model">
                                    <Form.Label className="pt-3">Status</Form.Label>
                                    {/* <Form.Select
                                            value={status} // Bind the value to the state
                                            onChange={(e) => {}} // Update the state on change
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">InActive</option>
                                        </Form.Select> */}
                                    <Form.Select
                                        value={status} // Controlled value
                                        onChange={(e) => {
                                            const selectedStatus = e.target.value; // Get the selected value
                                            setstatus(selectedStatus); // Update status state
                                            handleStatus(selectedStatus); // Pass the selected status to your handler
                                        }}
                                    >
                                        {/* Placeholder option */}
                                        <option value="" disabled hidden>
                                            {status || "Select Status"}
                                        </option>
                                        {/* Actual options */}
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
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
                        {
                            showImgField == false ?
                                null :
                                <>
                                    <Form.Label className="pt-3">Add Images URL (Add one at a time)</Form.Label>

                                    <Row className="mb-3">
                                        <Col md={imageUrl.length > 0 ? 10 : 12}>

                                            <Form.Control

                                                type="text"
                                                placeholder="Enter image URL"
                                                value={imageUrl}
                                                onChange={(e) => setimageUrl(e.target.value)}
                                            ></Form.Control>
                                        </Col>
                                        {
                                            imageUrl.length > 0 &&
                                            <Col md={2}>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={addImage}
                                                >
                                                    Add
                                                </button>
                                            </Col>
                                        }

                                    </Row>
                                    {images.length > 0 && (
                                        <ul className="list-group mb-3">
                                            {images.map((url, index) => (
                                                <li
                                                    key={index}
                                                    className="list-group-item d-flex justify-content-between align-items-center"
                                                >
                                                    <div>
                                                        <img
                                                            src={url}
                                                            alt="preview"
                                                            style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: "10px" }}
                                                        />
                                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                                            {url}
                                                        </a>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        Remove
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                        }
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProductForm;
