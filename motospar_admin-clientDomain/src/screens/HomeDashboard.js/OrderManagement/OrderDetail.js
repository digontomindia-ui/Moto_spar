import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { VendorContext } from "../../../context/VendorContext";
import {
  Card,
  Button,
  Image,
  Col,
  Form,
  Row,
  Offcanvas,
} from "react-bootstrap";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaFileInvoice,
} from "react-icons/fa";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import ToastComponent from "../../../components/HOC/Toast";
const OrderDetail = () => {
  const { updateProductStatus, toastMessage } = useContext(VendorContext);
  const navigate = useNavigate();
  const location = useLocation();
  const orderDetail = location.state?.orderDetail;
  const itemdetail = location.state?.itemdetail;

  const [ShowToast, setShowToast] = useState(false);
  const [currentStatus, setcurrentStatus] = useState(itemdetail?.order_status);
  const [vendor_payment_status, setvendor_payment_status] = useState(
    itemdetail?.vendor_payment_status == true ? "True" : "False",
  );
  const [customer_payment_status, setcustomer_payment_status] = useState(
    orderDetail?.payment_status,
  );
  const [driver_for_me_url, setdriver_for_me_url] = useState(
    itemdetail?.driver_for_me_url ? itemdetail?.driver_for_me_url : "",
  );
  const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

  const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
  const handleUpdateStatus = (value) => {
    setcurrentStatus(value);
    updateProductStatus(
      itemdetail?.id,
      value,
      driver_for_me_url,
      vendor_payment_status,
    );
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 5000); //
  };
  const handleUpdateVendorPaymentStatus = (value) => {
    setvendor_payment_status(value);
    updateProductStatus(
      itemdetail?.id,
      currentStatus,
      driver_for_me_url,
      value,
    );
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 5000); //
  };
   const handleUpdateCustomerPaymentStatus = (value) => {
    setcustomer_payment_status(value);
    updateProductStatus(
      itemdetail?.id,
      currentStatus,
      driver_for_me_url,
      vendor_payment_status,
      value,
    );
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 5000); //
  };
  console.log("orderDetail", itemdetail);
  return (
    <div className="d-flex">
      <div className="d-none d-md-block">
        <Sidebar /> {/* Sidebar visible on large screens */}
      </div>

      {/* Offcanvas Sidebar for small screens */}
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
      <div style={{ flex: 1 }}>
        <Header title={"Order Management"} toggleSidebar={toggleSidebar} />

        <div className="row align-items-center m-4">
          {/* Product Name and Order Code */}
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <h4>
              {itemdetail?.product?.name} ({orderDetail?.order_code})
            </h4>
          </div>

          {/* Buttons */}
          <div className="col-12 col-md-6 text-md-end text-center">
            {itemdetail?.order_status === "ASSIGNED_TO_VENDOR" ? null : (
              <Button
                className="savebtn mb-0 mb-md-0"
                onClick={() => {
                  navigate("/nearestVendorList", {
                    state: {
                      itemId: itemdetail?.id,
                      itemName: itemdetail?.product?.name,
                    },
                  });
                }}
              >
                Assign Vendor
              </Button>
            )}
            {orderDetail?.driver_fees ==
            "0.00" ? null : orderDetail?.driver_otp == "" ? (
              <Button
                className="savebtn ms-2 ms-md-3"
                onClick={() => {
                  navigate("/driverList", {
                    state: {
                      orderId: orderDetail?.id,
                      Assign: true,
                    },
                  });
                }}
              >
                Assign Driver
              </Button>
            ) : (
              <Button
                className="savebtn ms-2 ms-md-3"
                onClick={() => {
                  navigate("/driverList", {
                    state: {
                      orderId: orderDetail?.id,
                      Assign: true,
                    },
                  });
                }}
                disabled
                style={{
                  backgroundColor: "gray",
                  borderColor: "gray",
                  color: "white",
                }}
              >
                Assign Driver
              </Button>
            )}
            {itemdetail?.mechanic_fees_for_customer == "0.00" ||
            itemdetail?.mechanic !== null ? null : (
              <Button
                className="savebtn ms-2 ms-md-3"
                onClick={() => {
                  navigate("/nearestMechanic", {
                    state: {
                      item: itemdetail,
                      Assign: true,
                    },
                  });
                }}
              >
                Assign Mechanic
              </Button>
            )}
          </div>
        </div>
        <div className="d-flex flex-wrap p-4">
          <div className="mt-0">
            <Card
              className=" shadow-sm"
              style={{ Width: "auto", margin: "auto" }}
            >
              <h5 className="subHeading">Customer Details</h5>
              <hr className="divider " />
              <div className="d-flex justify-content-center mt-3  ">
                <Image
                  src={
                    orderDetail?.customer_details?.profile_picture
                      ? orderDetail?.customer_details?.profile_picture
                      : require("../../../assets/images/defaultprofile.webp")
                  }
                  roundedCircle
                  style={{
                    width: "100px",
                    height: "100px",
                    display: "block",
                    margin: "auto",
                    objectFit: "cover",
                  }}
                />
              </div>
              <Card.Body className="text-center">
                <Card.Title className=" mb-1">
                  <h5>{orderDetail?.customer_details?.full_name}</h5>
                </Card.Title>
                <Card.Text
                  className="text-muted mb-4"
                  style={{ fontSize: "0.9rem" }}
                >
                  User ID: {orderDetail?.customer_details?.id}
                </Card.Text>

                <Card.Text className="d-flex align-items-center ">
                  <FaPhoneAlt className="me-2 " />{" "}
                  <Card.Text
                    className="text-muted "
                    style={{ fontSize: "0.9rem" }}
                  >
                    {orderDetail?.customer_details?.phone_number
                      ? orderDetail?.customer_details?.phone_number
                      : "N/A"}
                  </Card.Text>
                </Card.Text>
                <Card.Text className="d-flex align-items-center">
                  <FaEnvelope className="me-2" />{" "}
                  <Card.Text
                    className="text-muted "
                    style={{ fontSize: "0.9rem" }}
                  >
                    {orderDetail?.customer_details?.email
                      ? orderDetail?.customer_details?.email
                      : "N/A"}
                  </Card.Text>
                </Card.Text>
                <Card.Text className="d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2" />{" "}
                  <Card.Text
                    className="text-muted "
                    style={{ fontSize: "0.9rem" }}
                  >
                    {orderDetail?.shipping_address_details
                      ? `${orderDetail?.shipping_address_details?.street_address}, ${orderDetail?.shipping_address_details?.city}, ${orderDetail?.shipping_address_details?.state}, ${orderDetail?.shipping_address_details?.postal_code}`
                      : "N/A"}
                  </Card.Text>
                </Card.Text>
              </Card.Body>
              <hr className="divider " />
              <h5 className="m-3">Payment Details</h5>
              <Card.Body>
                <Card.Text className="d-flex align-items-center ">
                  <FaMoneyBillWave className="me-2" />{" "}
                  <Card.Text
                    className="text-muted "
                    style={{ fontSize: "0.9rem" }}
                  >
                    {orderDetail?.payment_method == "CASH_ON_DELIVERY"
                      ? "Cash On Delivery"
                      : "Online Payment"}
                  </Card.Text>
                </Card.Text>
              </Card.Body>
              <hr className="divider " />
              <h5 className="m-3">Order Summary</h5>
              <Card.Body>
                <Card.Text className="d-flex align-items-center justify-content-between ">
                  <div>
                    <Card.Text
                      className="text-muted "
                      style={{ fontSize: "0.9rem" }}
                    >
                      Delivery Charge
                    </Card.Text>
                    <Card.Text
                      className="text-muted "
                      style={{ fontSize: "0.9rem" }}
                    >
                      Total of ({orderDetail?.order_items.length}{" "}
                      {orderDetail?.order_items.length > 1 ? "items" : "item"})
                    </Card.Text>
                  </div>
                  <div>
                    <Card.Text
                      className="text-muted "
                      style={{ fontSize: "0.9rem" }}
                    >
                      {itemdetail?.product?.delivery_charge}
                    </Card.Text>
                    <Card.Text
                      className="text-muted "
                      style={{ fontSize: "0.9rem" }}
                    >
                      {orderDetail?.total_price}
                    </Card.Text>
                  </div>
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
          <div style={{ flex: 1, height: "auto" }}>
            <Card className="shadow-sm rounded ms-5">
              <h5 className="subHeading">Order Action</h5>
              <hr className="divider " />
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between ">
                  <div>
                    <Card.Text
                      className="text mb-1"
                      style={{ fontSize: "1rem" }}
                    >
                      #{orderDetail?.order_code}
                    </Card.Text>
                    <Card.Text
                      className="text-muted mb-1"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {dayjs(orderDetail?.created_at).format(
                        "MMMM D, YYYY [at] h:mm A",
                      )}
                    </Card.Text>
                  </div>
                  {/* <div className="d-flex align-items-center">
                    <FaFileInvoice className="me-2" />{" "}
                    <a href="#" className="nav-link text-muted fs-8">
                      Invoice
                    </a>
                  </div> */}
                </div>
                <Row className="align-items-center mt-3">
                  <Col md={orderDetail?.payment_method == "CASH_ON_DELIVERY" ? 4 : 6}>
                    <Form.Group controlId="stockStatus">
                      <Form.Label className="pt-3">Current Status</Form.Label>
                      <Form.Select
                        value={currentStatus} // Bind the value to the state
                        onChange={(e) => {
                          handleUpdateStatus(e.target.value);
                        }}
                      >
                        <option value="ADMIN_REVIEW">ADMIN_REVIEW</option>
                        <option value="PENDING">PENDING</option>
                        <option value="ASSIGNED_TO_VENDOR">
                          ASSIGNED_TO_VENDOR
                        </option>
                         <option value="DRIVER_FOR_PICK">
                          DRIVER ASSIGNED FOR PICKUP
                        </option>
                        <option value="VENDOR_ACCEPTED">VENDOR_ACCEPTED</option>
                         <option value="WORK_COMPLETED">
                          WORK COMPLETED
                        </option>
                         <option value="DRIVER_FOR_DROP">
                          DRIVER ASSIGNED FOR DROP
                        </option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={orderDetail?.payment_method == "CASH_ON_DELIVERY" ? 4 : 6}>
                    <Form.Group controlId="stockStatus">
                      <Form.Label className="pt-3">
                        Vendor Payment Status
                      </Form.Label>
                      <Form.Select
                        value={vendor_payment_status} // Bind the value to the state
                        onChange={(e) => {
                          handleUpdateVendorPaymentStatus(e.target.value);
                        }}
                      >
                        <option value="False">PENDING</option>
                        <option value="True">PAID</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  {orderDetail?.payment_method == "CASH_ON_DELIVERY" && (
                    <Col md={4}>
                      <Form.Group controlId="stockStatus">
                        <Form.Label className="pt-3">
                          Customer Payment Status
                        </Form.Label>
                        <Form.Select
                          value={customer_payment_status} // Bind the value to the state
                          onChange={(e) => {
                            handleUpdateCustomerPaymentStatus(e.target.value);
                          }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SUCCESS">SUCCESS</option>
                          <option value="FAILED">FAILED</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  )}
                </Row>
               
                 <div>
                  <Row className="align-items-center">
                    <Col md={8}>
                      <Form.Group controlId="url">
                        <Form.Label className="pt-3">
                          Driver For Me URL
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Driver For Me URL"
                          value={driver_for_me_url}
                          onChange={(e) => setdriver_for_me_url(e.target.value)}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Button
                        variant="outline-success"
                        style={{ marginTop: 50 }}
                        onClick={async() => {

                        await  updateProductStatus(
                            itemdetail?.id,
                            currentStatus,
                            driver_for_me_url,
                            vendor_payment_status,
                            customer_payment_status,
                          );
                          setShowToast(true);

                          setTimeout(() => {
                            setShowToast(false);
                          }, 5000);
                        }}
                      >
                        Update
                      </Button>
                    </Col>
                  </Row>
                </div>
              
                {/* <div className="d-flex align-items-center mt-3">
                  <Button variant="outline-warning" className="me-3">
                    Refund
                  </Button>
                  <Button variant="outline-warning" className="me-3">
                    Cancel Order
                  </Button>
                </div> */}
                <div>
                  {orderDetail?.driver_otp == "" ? null : (
                    <Card.Text
                      className="text mt-2"
                      style={{ fontSize: "1rem" }}
                    >
                      OTP for Driver : {orderDetail?.driver_otp}
                    </Card.Text>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
          {/* <Card className="shadow-sm rounded m-4" style={{flex: 1}}>
                        <h5 className="subHeading p-3">Basic Details</h5>
                        <hr className="divider " />
                        <Card.Body>
                            <Form>
                                <Form.Group controlId="formName">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={userDetail?.address ? userDetail?.address : "N/A"}
                                    />
                                </Form.Group>

                                <Row className="mt-3">
                                    <Col md={4}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>State</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={userDetail?.state ? userDetail?.state : "N/A"}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={userDetail?.city ? userDetail?.city : "N/A"}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Pincode</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={userDetail?.postal_code ? userDetail?.postal_code : "N/A"}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card> */}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
