import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import ProductForm from "../../components/Atoms/ProductForm";
import {
  Button,
  Offcanvas,
  Col,
  Row,
  Form,
  Card,
  Carousel,
} from "react-bootstrap";
import { VendorContext } from "../../context/VendorContext";
import ToastComponent from "../../components/HOC/Toast";
import ProductImageUpload from "../../components/Atoms/ProductImageUpload";
import "../../assets/Css/ProductForm.css";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
const AddVariant = () => {
  const location = useLocation();
  const variant = location.state?.variant;
  const navigate = useNavigate();
  const { specificProduct, AddVariant, EditVariant, toastMessage } =
    useContext(VendorContext);

  const [showToast, setShowToast] = useState(false);
  const [name, setname] = useState(specificProduct?.name);
  const [images, setimages] = useState(
    variant?.images?.map((img) => img.image) || [],
  );
  console.log(">>>", variant);
  const [imageUrl, setimageUrl] = useState("");
  const [brand, setbrand] = useState(specificProduct?.brand);
  const [model, setmodel] = useState(specificProduct?.model);
  const [year, setyear] = useState(specificProduct?.year);
  const [price, setprice] = useState(
    variant ? variant?.final_listing_price_on_motospar : null,
  );
  const [weight, setweight] = useState(variant ? variant?.weight : null);
  const [discount, setdiscount] = useState(variant ? variant?.discount : null);
    const [discount_price, setdiscount_price] = useState(variant ? variant?.discounted_price : null);
  const [sku, setsku] = useState(variant ? variant?.sku : "");
  const [color, setcolor] = useState(variant ? variant?.color : "");
  const [size, setsize] = useState(variant ? variant?.size : "");
  const [dimensions, setdimensions] = useState(
    variant ? variant?.dimensions : "",
  );
  const [material, setmaterial] = useState(variant ? variant?.material : "");
  const [features, setfeatures] = useState(variant ? variant?.features : "");
  const [stock_status, setstock_status] = useState(
    variant ? variant?.in_stock : false,
  );
  const [categoryName, setcategoryName] = useState(
    specificProduct?.category?.name,
  );
  const [subCategoryName, setsubCategoryName] = useState(
    specificProduct?.sub_category?.name,
  );

  const [delivery_charge, setdelivery_charge] = useState(
    specificProduct ? specificProduct?.delivery_charge : null,
  );
  const [delivery_time, setdelivery_time] = useState(
    specificProduct ? specificProduct?.delivery_time : null,
  );
  const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile
  const [c_gst, setc_gst] = useState(variant ? variant?.cgst : "0");
  const [s_gst, sets_gst] = useState(variant ? variant?.sgst : "0");
  const [price_excluding_gst, setprice_excluding_gst] = useState(
    variant ? variant?.price_excluding_gst : "0",
  );
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  // const handleData = (data) => {
  //     setProductDetails(data);
  // };

  const handleUpdate = async () => {
    try {
      const updatedData = {
        id: variant?.id, // Assign id to a key
        sku,
        price,
        discount: discount ? discount : '',
        color,
        size,
        weight,
        dimensions,
        material,
        features,
        stock_status,
      };

      // Conditionally add images if valid and not a string
      if (images) {
        updatedData.images = images;
      }

      console.log("Data sent to API:", updatedData);

      // Call API to update the variant
      await EditVariant(updatedData);

      setShowToast(true);

      // Automatically hide the toast after 5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } catch (error) {
      console.error("Error in handleUpdate:", error);
    }
  };
  const addImage = () => {
    if (imageUrl !== "") {
      setimages([...images, imageUrl]);
      setimageUrl("");
    }
  };
  console.log("page ka data", images);

  const removeImage = (index) => {
    setimages(images.filter((_, i) => i !== index));
  };
  const handleSave = () => {
    AddVariant(
      specificProduct?.id,
      sku,
      price,
      Number(discount),
      color,
      size,
      weight,
      dimensions,
      material,
      features,
      images,
    );
    setShowToast(true);

    // Automatically hide the toast after 5 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

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
          {variant ? (
            <h4 className="mb-3 mb-md-0">Edit Product Variant</h4>
          ) : (
            <h4 className="mb-3 mb-md-0">Add Product Variant</h4>
          )}
          <div className="d-flex gap-2">
            <Button variant="outline-warning">Save to Draft</Button>
            {variant ? (
              <Button className="savebtn" onClick={handleUpdate}>
                Update
              </Button>
            ) : (
              <Button className="savebtn" onClick={handleSave}>
                Save
              </Button>
            )}
          </div>
        </div>

        {/* Product Form and Image Upload */}
        <Row className="g-4 m-0">
          {/* <Col xs={12} md={4} className="mb-4">
                        <Card>
                            <h5 className="subHeading">Images</h5>
                            <hr className="divider" />
                            <Carousel>
                                {variant?.images && variant?.images.length > 0 ? (
                                    variant?.images.map((img, index) => (
                                        <Carousel.Item key={index} style={{ position: "relative" }}>
                                            <img
                                                className="d-block w-100"
                                                src={`https://api.motospar.com${img.image}`}
                                                alt={`Product Image ${index + 1}`}
                                                style={{
                                                    height: "300px",
                                                    objectFit: "cover",
                                                    borderRadius: "4px",
                                                }}
                                            />
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                }}
                                            ></div>
                                        </Carousel.Item>
                                    ))
                                ) : (
                                    <Carousel.Item>
                                        <img
                                            className="d-block w-100"
                                            src="https://via.placeholder.com/200x200?text=No+Image"
                                            alt="No Image Available"
                                            style={{
                                                height: "300px",
                                                objectFit: "cover",
                                                borderRadius: "4px",
                                            }}
                                        />
                                    </Carousel.Item>
                                )}
                            </Carousel>
                        </Card>
                        <Col xs={12}>
                            <ProductImageUpload />
                        </Col>
                    </Col> */}

          <Col>
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
                    ></Form.Control>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="productCategory">
                        <Form.Label className="pt-3">
                          Product Category
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Name"
                          value={categoryName}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="SubCategory">
                        <Form.Label className="pt-3">
                          Product Sub Category
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Name"
                          value={subCategoryName}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                    <Row>
                      <Col md={6}>
                        <Form.Group controlId="Delivery Charge">
                          <Form.Label className="pt-3">
                            Delivery Charge
                          </Form.Label>
                          <Form.Control
                            type="Number"
                            placeholder="Delivery Charge"
                            value={delivery_charge}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="Delivery Time">
                          <Form.Label className="pt-3">
                            Delivery Time (No. of days)
                          </Form.Label>
                          <Form.Control
                            type="Number"
                            placeholder="Delivery Time"
                            value={delivery_time}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Col md={6}>
                      <Form.Group controlId="sku">
                        <Form.Label className="pt-3">
                          Stock Keeping Unit (SKU)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="SKU"
                          value={sku}
                          onChange={(e) => setsku(e.target.value)}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
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
                  </Row>
                  {variant && (
                    <Row>
                      <Col md={4}>
                        <Form.Group controlId="mrp">
                          <Form.Label className="pt-3">CGST</Form.Label>

                          <Form.Control
                            type="Number"
                            placeholder="CGST"
                            disabled                          
                            value={c_gst}
                            onChange={(e) => setc_gst(e.target.value)}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="mrp">
                          <Form.Label className="pt-3">SGST</Form.Label>

                          <Form.Control
                            type="Number"
                            placeholder="SGST"
                            disabled
                            value={s_gst}
                            onChange={(e) => sets_gst(e.target.value)}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="mrp">
                          <Form.Label className="pt-3">
                            Price excluding gst
                          </Form.Label>

                          <Form.Control
                            type="Number"
                            placeholder="Price excluding gst"
                            disabled
                            value={price_excluding_gst}
                            onChange={(e) =>
                              setprice_excluding_gst(e.target.value)
                            }
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                  <Row>
                    <Col md={variant ? 4 : 6}>
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

                    <Col md={variant ? 4: 6}>
                      <Form.Group controlId="discuntedPrice">
                        <Form.Label className="pt-3">
                          Discount in percentage %
                        </Form.Label>
                        <Form.Control
                          type="Number"
                          placeholder="Discount in percentage %"
                          value={discount}
                          onChange={(e) => setdiscount(e.target.value)} // Directly handle the change
                        />
                      </Form.Group>
                    </Col>
                    {variant && (
                          <Col md={4}>
                      <Form.Group controlId="discuntedPrice">
                        <Form.Label className="pt-3">
                          Discount Price
                        </Form.Label>
                        <Form.Control
                          type="Number"
                          placeholder="Discount Price"
                          value={discount_price}
                          onChange={(e) => setdiscount_price(e.target.value)} // Directly handle the change
                        />
                      </Form.Group>
                    </Col>
                    )}
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
                        <Form.Label className="pt-3">Item Weight</Form.Label>
                        <Form.Control
                          type="Number"
                          placeholder="Item Weight"
                          value={weight}
                          onChange={(e) => setweight(e.target.value)}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
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
                  <Form.Label className="pt-3">
                    Add Images URL (Add one at a time)
                  </Form.Label>
                  <Row className="mb-3">
                    <Col md={imageUrl.length > 0 ? 10 : 12}>
                      <Form.Control
                        type="text"
                        placeholder="Enter image URL"
                        value={imageUrl}
                        onChange={(e) => setimageUrl(e.target.value)}
                      ></Form.Control>
                    </Col>
                    {imageUrl.length > 0 && (
                      <Col>
                        <button
                          style={{ alignSelf: "center" }}
                          type="button"
                          className="btn btn-primary"
                          onClick={addImage}
                        >
                          Add
                        </button>
                      </Col>
                    )}
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
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                marginRight: "10px",
                              }}
                            />
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
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
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AddVariant;
