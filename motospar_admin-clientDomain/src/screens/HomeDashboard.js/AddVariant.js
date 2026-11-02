import React, { useContext, useState } from "react";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import {
  Button,
  Offcanvas,
  Col,
  Row,
  Form,
  Card,
  Alert,
} from "react-bootstrap";
import { VendorContext } from "../../context/VendorContext";
import ProductImageUpload from "../../components/Atoms/ProductImageUpload";
import "../../assets/Css/ProductForm.css";
import "../../assets/Css/ProductEdit.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";

const AddVariant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const variant = location.state?.variant;
  const {
    specificProduct,
    AddVariant,
    EditVariant,
    deleteProductImage,
    uploadVariantImages,
    getSpecificProduct,
    loadingactivity,
  } = useContext(VendorContext);

  const product = location.state?.product || specificProduct;

  const [name] = useState(product?.name);
  const [existingImages, setExistingImages] = useState(variant?.images || []);
  const [imageFiles, setImageFiles] = useState([]);
  const [retryUploadInfo, setRetryUploadInfo] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [price, setprice] = useState(
    variant ? variant?.final_listing_price_on_motospar ?? "" : "",
  );
  const [weight, setweight] = useState(variant ? variant?.weight ?? "" : "");
  const [discount, setdiscount] = useState(variant ? variant?.discount ?? "" : "");
  const [discountPrice] = useState(variant ? variant?.discounted_price ?? "" : "");
  const [sku, setsku] = useState(variant ? variant?.sku : "");
  const [color, setcolor] = useState(variant ? variant?.color : "");
  const [size, setsize] = useState(variant ? variant?.size : "");
  const [dimensions, setdimensions] = useState(
    variant ? variant?.dimensions : "",
  );
  const [material, setmaterial] = useState(variant ? variant?.material : "");
  const [features, setfeatures] = useState(variant ? variant?.features : "");
  const [stock_status, setstock_status] = useState(
    variant ? variant?.in_stock : true,
  );
  const [categoryName] = useState(
    product?.category?.name,
  );
  const [subCategoryName] = useState(
    product?.sub_category?.name,
  );

  const [deliveryCharge] = useState(
    product ? product?.delivery_charge ?? "" : "",
  );
  const [deliveryTime] = useState(
    product ? product?.delivery_time ?? "" : "",
  );
  const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile
  const [formError, setFormError] = useState("");
  const [cGst] = useState(variant ? variant?.cgst : "0");
  const [sGst] = useState(variant ? variant?.sgst : "0");
  const [priceExcludingGst] = useState(
    variant ? variant?.price_excluding_gst : "0",
  );
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  // const handleData = (data) => {
  //     setProductDetails(data);
  // };

  const handleDeleteExistingImage = async (imgObj) => {
    if (!imgObj?.id) {
      setExistingImages((prev) => prev.filter((img) => img !== imgObj));
      return;
    }
    if (!window.confirm("Delete this saved image? This action cannot be undone.")) return;

    const res = await deleteProductImage(imgObj.id);
    if (res?.success) {
      setExistingImages((prev) => prev.filter((img) => img.id !== imgObj.id));
    }
  };

  const validateVariant = () => {
    if (!product?.id) return "The parent product is missing. Return to the product list and reopen it.";
    if (!sku.trim()) return "SKU is required.";
    if (price === "" || !Number.isFinite(Number(price)) || Number(price) < 0) {
      return "Enter a valid non-negative price.";
    }
    if (
      discount !== "" &&
      (!Number.isFinite(Number(discount)) || Number(discount) < 0 || Number(discount) > 100)
    ) {
      return "Discount must be between 0 and 100 percent.";
    }
    return "";
  };

  const returnToProduct = async () => {
    if (product?.id) await getSpecificProduct(product.id);
    navigate("/editSpecificProductpage");
  };

  const handleUpdate = async () => {
    if (isSubmitting || loadingactivity) return;
    const validationMessage = validateVariant();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    try {
      const updatedData = {
        id: variant?.id,
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
        imageFiles,
      };

      const res = await EditVariant(updatedData);
      if (res?.partialSuccess) {
        setRetryUploadInfo({
          variantId: res.variantId || variant?.id,
          failedFiles: res.failedFiles || [],
          message: res.message,
        });
      } else if (res?.success) {
        setRetryUploadInfo(null);
        setImageFiles([]);
        await returnToProduct();
      } else {
        setFormError(res?.message || "The variant could not be updated. Review the values and try again.");
      }
    } catch (error) {
      console.error("Error in handleUpdate:", error);
      setFormError(error?.message || "The variant could not be updated.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (isSubmitting || loadingactivity) return;
    const validationMessage = validateVariant();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    try {
      const res = await AddVariant(
        product?.id,
        sku,
        price,
        Number(discount),
        color,
        size,
        weight,
        dimensions,
        material,
        features,
        stock_status,
        imageFiles,
      );
      if (res?.partialSuccess) {
        setRetryUploadInfo({
          variantId: res.variantId,
          failedFiles: res.failedFiles || [],
          message: res.message,
        });
      } else if (res?.success) {
        setRetryUploadInfo(null);
        setImageFiles([]);
        await returnToProduct();
      } else {
        setFormError(res?.message || "The variant could not be saved. Review the values and try again.");
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      setFormError(error?.message || "The variant could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryUpload = async () => {
    if (!retryUploadInfo?.variantId || !retryUploadInfo?.failedFiles?.length) return;
    setIsRetrying(true);
    const upRes = await uploadVariantImages(retryUploadInfo.variantId, retryUploadInfo.failedFiles);
    setIsRetrying(false);
    if (upRes?.success) {
      setRetryUploadInfo(null);
      setImageFiles([]);
      toast.success("Images uploaded successfully!");
    } else {
      toast.error(`Retry upload failed: ${upRes?.message || 'Error uploading'}`);
    }
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
        <div className="product-edit-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 m-4">
          <div>
            <Button variant="link" className="p-0 mb-2 text-decoration-none" onClick={returnToProduct}>
              <FaArrowLeft className="me-2" />
              Back to product
            </Button>
            <h4 className="mb-1">{variant ? "Edit product variant" : "Add product variant"}</h4>
            <div className="text-muted small">{product?.name || "No parent product selected"}</div>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={returnToProduct} disabled={isSubmitting}>
              Cancel
            </Button>
            {variant ? (
              <Button
                className="savebtn"
                onClick={handleUpdate}
                disabled={isSubmitting || loadingactivity}
              >
                {isSubmitting || loadingactivity ? "Updating..." : "Update"}
              </Button>
            ) : (
              <Button
                className="savebtn"
                onClick={handleSave}
                disabled={isSubmitting || loadingactivity}
              >
                {isSubmitting || loadingactivity ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>

        {formError ? (
          <Alert variant="danger" className="mx-4" dismissible onClose={() => setFormError("")}>
            {formError}
          </Alert>
        ) : null}

        {/* Product Form and Image Upload */}
        <Row className="g-4 m-0">
          <Col>
            <Card className="shadow-sm rounded custom-card m-4 ">
              <h5 className="subHeading">Variant details</h5>
              <hr className="divider"></hr>
              <Card.Body>
                <Form>
                  <Form.Group controlId="productName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Name"
                      value={name || ""}
                      readOnly
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
                          value={categoryName || ""}
                          readOnly
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
                          value={subCategoryName || ""}
                          readOnly
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
                            value={deliveryCharge}
                            readOnly
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
                            value={deliveryTime}
                            readOnly
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
                          <option value="true">Available</option>
                          <option value="false">Unavailable</option>
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
                            value={cGst}
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
                            value={sGst}
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
                            value={priceExcludingGst}
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
                          min="0"
                          step="0.01"
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
                          min="0"
                          max="100"
                          step="0.01"
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
                          value={discountPrice}
                          readOnly
                        />
                        <Form.Text className="text-muted">
                          Calculated automatically from MRP and discount.
                        </Form.Text>
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
                  {retryUploadInfo && (
                    <Alert variant="warning" className="mt-3">
                      <div>{retryUploadInfo.message}</div>
                      <Button
                        className="mt-2"
                        variant="warning"
                        size="sm"
                        disabled={isRetrying}
                        onClick={handleRetryUpload}
                      >
                        {isRetrying ? "Retrying upload..." : "Retry image upload"}
                      </Button>
                    </Alert>
                  )}
                </Form>
              </Card.Body>
            </Card>
            <Card className="shadow-sm rounded custom-card m-4">
              <Card.Body>
                <ProductImageUpload
                  files={imageFiles}
                  onChangeFiles={setImageFiles}
                  existingImages={variant ? existingImages : []}
                  onDeleteExistingImage={variant ? handleDeleteExistingImage : undefined}
                  maxFiles={10}
                  maxSizeMB={10}
                  title={variant ? "Variant Images" : "New Variant Images"}
                  isUploading={isSubmitting || loadingactivity || isRetrying}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AddVariant;
