import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../../components/Atoms/Sidebar";
import Header from "../../../components/HOC/Header";
import { Table, Button, Badge, Card, Offcanvas } from "react-bootstrap";
import { AiOutlineSearch, AiFillEdit, AiFillDelete } from "react-icons/ai";
import dayjs from "dayjs";
import "../../../assets/Css/ProductList.css";
import { useNavigate } from "react-router-dom";
import { FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { VendorContext } from "../../../context/VendorContext";

const OrderList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility on mobile

  const toggleSidebar = () => setShowSidebar(!showSidebar); // Function to toggle sidebar
  const {
    AllOrders,
    orders,
    setspecificProduct,
    setCurrentPage,
    currentPage,
    hasNext,
    pageCount,
  } = useContext(VendorContext);
  const filteredOrders = orders.filter((order) =>
    order?.order_items?.some(
      (item) =>
        item?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order?.order_code?.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );
  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };
  useEffect(() => {
    AllOrders(currentPage);
  }, [currentPage]);

  return (
    <div className="d-flex flex-column flex-md-row">
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
        <div className="m-4">
          <h4>All Orders</h4>
        </div>
        <Card className="shadow-sm rounded custom-card m-4">
          <div className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
              <div
                className="wrapper w-100 w-md-auto mb-2 mb-md-0"
                style={{ maxWidth: "300px" }}
              >
                <AiOutlineSearch className="icon" />
                <input
                  className="input w-100"
                  type="text"
                  id="search"
                  placeholder="Search by product name or Delivery code"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="m-1">
                  Page {currentPage} of {pageCount}
                </span>
                <FaArrowLeft
                  className="m-1"
                  onClick={handlePreviousPage}
                  style={{
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    opacity: currentPage === 1 ? 0.5 : 1,
                  }}
                />
                <FaArrowRight
                  className="m-1"
                  onClick={handleNextPage}
                  style={{
                    cursor: !hasNext ? "not-allowed" : "pointer",
                    opacity: !hasNext ? 0.5 : 1,
                  }}
                />
              </div>
            </div>

            {/* Responsive Table with Horizontal Scroll */}
            <div className="table-responsive">
              <Table bordered responsive="sm" className="align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Order Date</th>
                    <th>Customer</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Order Code</th>
                    <th>Order Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => {
                    const totalItems = order?.order_items?.length || 0; // Total items in this order
                    const isNewUser =
                      index === 0 || // First order always starts a new user group
                      filteredOrders[index - 1]?.customer_details?.id !==
                        order?.customer_details?.id;

                    return order?.order_items?.map((item, itemIndex) => (
                      <tr
                        key={`${order?.id}-${item?.id}`}
                        className={
                          isNewUser ? "bg-dark text-white" : "bg-light"
                        }
                      >
                        {/* Render Order ID, Date, and Customer Name only for the first item */}
                        {itemIndex === 0 && (
                          <>
                            <td
                              rowSpan={totalItems}
                              className={isNewUser ? "border-top" : ""}
                            >
                              {index + 1}
                            </td>{" "}
                            {/* Order Index */}
                            <td
                              rowSpan={totalItems}
                              className={isNewUser ? "border-top" : ""}
                            >
                              {dayjs(order?.created_at).format("YYYY-MM-DD")}
                            </td>{" "}
                            {/* Order Date */}
                            <td
                              rowSpan={totalItems}
                              className={isNewUser ? "border-top" : ""}
                            >
                              {order?.customer_details?.full_name || "N/A"}
                            </td>{" "}
                            {/* Customer Name */}
                          </>
                        )}
                        {/* Product Details */}
                        <td>{item?.product?.name || "N/A"}</td>{" "}
                        {/* Product Name */}
                        {itemIndex === 0 && (
                          <td
                            rowSpan={totalItems}
                            className={isNewUser ? "border-top" : ""}
                          >
                            ₹{order?.total_price || "N/A"}
                          </td>
                        )}
                        <td>{order?.order_code || "N/A"}</td> {/* Item Price */}
                        <td>
                          {item?.order_status === "ADMIN_REVIEW" ? (
                            <Badge pill bg="warning">
                              In Review
                            </Badge>
                          ) : item?.order_status === "PENDING" ? (
                            <Badge pill bg="warning">
                              Pending
                            </Badge>
                          ) : item?.order_status === "ASSIGNED_TO_VENDOR" ? (
                            <Badge pill bg="info">
                              Request Sent
                            </Badge>
                          ) : item?.order_status === "DRIVER_FOR_DROP" ? (
                            <Badge pill bg="info">
                              Driver Assigned for Drop
                            </Badge>
                          ) : item?.order_status === "DRIVER_FOR_PICK" ? (
                            <Badge pill bg="info">
                              Driver Assigned for Pick
                            </Badge>
                          ) : item?.order_status === "WORK_COMPLETED" ? (
                            <Badge pill bg="success">
                              Work Completed
                            </Badge>
                          ) : item?.order_status === "VENDOR_ACCEPTED" ? (
                            <Badge pill bg="success">
                              Vendor Accepted
                            </Badge>
                          ) : item?.order_status === "DELIVERED" ? (
                            <Badge pill bg="success">
                              Delivered
                            </Badge>
                          ) : item?.order_status === "CANCELLED" ? (
                            <Badge pill bg="danger">
                              Cancelled
                            </Badge>
                          ) : (
                            "N/A"
                          )}
                        </td>{" "}
                        {/* Order Status */}
                        {/* Render Actions only for the first item */}
                        <td>
                          {/* <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2"
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                    </Button> */}
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-2"
                            title="Edit"
                            onClick={() => {
                              navigate("/orderDetail", {
                                state: { orderDetail: order, itemdetail: item },
                              });
                            }}
                          >
                            <AiFillEdit />
                          </Button>
                          {/* <Button variant="outline-danger" size="sm" title="Delete">
                                                        <AiFillDelete />
                                                    </Button> */}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderList;
