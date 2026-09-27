# MotoSpar API Documentation

MotoSpar is a Django REST Framework project that provides various APIs for the MotoSpar APP & Web Platform. This is the API Documentation for the project.

## Table of Contents
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Endpoints](#endpoints)



## API Documentation

### Authentication

We have implemented JWT Access Token and Refresh Token Based Authentication for this project.

To know more about authentication, please check this [link](https://bit.ly/3zCDnsN).

- This is for the APIs related to Placing Order and Make Payments.
- To access the protected views, include the access token in the header of all requests. Use "Authorization" as the key and "Bearer 2a9b……" as the value.
- All API endpoints except LOGIN, REGISTRATION, and FORGET PASSWORD require an access token.
- LOGIN and REGISTRATION will return an access token and a refresh token after a successful request.
- All the API url has a "api" word in it. If after the "api/" the nect word is "admin" then it is for admin only and if it has "vendor" or "customer" then they are for those roles. If theres nothing among those three then it's for all role.


### API Index

1. **[POST] /api/customer/order/create/** - [Create Order](#1-post-apicustomerordercreate)
2. **[POST] /api/customer/order/create-from-cart/** - [Create Order from Cart](#2-post-apicustomerordercreate-from-cart)
3. **[POST] /api/customer/order/payment/razorpay/** - [Razorpay Payment](#3-post-apicustomerorderpaymentrazorpay)
4. **[POST] /api/customer/order/payment/razorpay/callback/** - [Razorpay Payment Callback](#4-post-apicustomerorderpaymentrazorpaycallback)
5. **[POST] /api/customer/orders/** - [Get Customer Orders](#5-post-apicustomerorders)
6. **[POST] /api/vendor/orders/** - [Get Vendor Orders](#6-post-apivendororders)
7. **[GET] /api/admin/order-item/<uuid:order_item_id>/find-nearest-vendors/** - [Find Nearest Vendors for Order Item](#7-get-apiadminorder-itemfind-nearest-vendors)
8. **[POST] /api/admin/order-item/assign-vendor/** - [Assign Vendor to Order Item](#8-post-apiadminorder-itemassign-vendor)
9. **[PATCH] /api/order-item/<uuid:order_item_id>/update-status/** - [Update Order Item Status](#9-patch-apiorder-itemupdate-status)

---

### Endpoints

#### 1. [POST] `/api/customer/order/create/`

- **Description:** Creates a new order by a customer, including multiple order items. The total price is calculated based on the items' prices, with the initial order status set based on the payment method. This endpoint requires customer authentication.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/customer/order/create/
    - **Permissions:** IsAuthenticated, IsCustomer
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
      - **Fields:**
        - `shipping_address` (UUID, required): ID of the shipping address for the order.
        - `billing_address` (UUID, required): ID of the billing address for the order.
        - `payment_method` (string, required): Payment method for the order. Options: `"PAYMENT_GATEWAY"`, `"CASH_ON_DELIVERY"`.
        - `order_items` (array, required): List of items in the order.
          - **Each order item:**
            - `variant` (UUID, required): ID of the product variant.
            - `quantity` (integer, required): Quantity of the variant in the order.
        - `delivery_charge` (float, required): Delivery charge for the order.

      - **Example Request Body:**
    
        ```json
        {
            "shipping_address": "SHIPPING_ADDRESS_ID",
            "billing_address": "BILLING_ADDRESS_ID",
            "payment_method": "CASH_ON_DELIVERY",
            "order_items": [
                {
                    "variant": "VARIANT_ID_1",
                    "quantity": 2
                },
                {
                    "variant": "VARIANT_ID_2",
                    "quantity": 1
                }
            ],
            "delivery_charge": 20.00
        }
        ```

- **Responses:**

    - **Success:**
        - **Code:** 201 Created
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "order": {
                    "id": "ORDER_ID",
                    "customer": {
                        "id": "CUSTOMER_ID",
                        "full_name": "John Doe",
                        "email": "johndoe@example.com"
                    },
                    "shipping_address": {
                        "id": "SHIPPING_ADDRESS_ID",
                        "address": "123 Main St"
                    },
                    "billing_address": {
                        "id": "BILLING_ADDRESS_ID",
                        "address": "456 Market St"
                    },
                    "total_price": 150.00,
                    "delivery_charge": 20.00,
                    "payment_method": "CASH_ON_DELIVERY",
                    "payment_status": "PENDING",
                    "order_items": [
                        {
                            "id": "ORDER_ITEM_ID_1",
                            "variant": {
                                "id": "VARIANT_ID_1",
                                "name": "Product Variant Name"
                            },
                            "quantity": 2,
                            "price": 50.00,
                            "order_status": "ADMIN_REVIEW"
                        },
                        {
                            "id": "ORDER_ITEM_ID_2",
                            "variant": {
                                "id": "VARIANT_ID_2",
                                "name": "Product Variant Name"
                            },
                            "quantity": 1,
                            "price": 50.00,
                            "order_status": "ADMIN_REVIEW"
                        }
                    ],
                    "created_at": "2024-10-29T12:34:56Z",
                    "last_modified_at": "2024-10-29T12:34:56Z",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Order created successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Validation Errors:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "order_items: Quantity must be greater than zero",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid data provided",
                "status": false
            }
            ```

        - **Invalid Method:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid request method",
                "status": false
            }
            ```

        - **Server Error:**
            - **Code:** 500 Internal Server Error
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Detailed error message here",
                    "status": "error",
                    "code": 500
                },
                "message": "Internal server error",
                "status": false
            }
            ```

---

#### 2. [POST] `/api/customer/order/create-from-cart/`

- **Description:** Creates a new order based on items in the authenticated customer’s cart. It calculates the total price for all items, removes items from the cart after successful order creation, and sets an initial status based on the selected payment method. This endpoint requires customer authentication.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/customer/order/create-from-cart/
    - **Permissions:** IsAuthenticated, IsCustomer
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
      - **Fields:**
        - `shipping_address` (UUID, required): ID of the shipping address for the order.
        - `billing_address` (UUID, required): ID of the billing address for the order.
        - `payment_method` (string, required): Payment method for the order. Options: `"PAYMENT_GATEWAY"`, `"CASH_ON_DELIVERY"`.
        - `delivery_charge` (float, required): Delivery charge for the order.

      - **Example Request Body:**
        
        ```json
        {
            "shipping_address": "SHIPPING_ADDRESS_ID",
            "billing_address": "BILLING_ADDRESS_ID",
            "payment_method": "CASH_ON_DELIVERY",
            "delivery_charge": 20.00
        }
        ```

- **Responses:**

    - **Success:**
        - **Code:** 201 Created
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "order": {
                    "id": "ORDER_ID",
                    "customer": {
                        "id": "CUSTOMER_ID",
                        "full_name": "John Doe",
                        "email": "johndoe@example.com"
                    },
                    "shipping_address": {
                        "id": "SHIPPING_ADDRESS_ID",
                        "address": "123 Main St"
                    },
                    "billing_address": {
                        "id": "BILLING_ADDRESS_ID",
                        "address": "456 Market St"
                    },
                    "total_price": 150.00,
                    "delivery_charge": 20.00,
                    "payment_method": "CASH_ON_DELIVERY",
                    "payment_status": "PENDING",
                    "order_items": [
                        {
                            "id": "ORDER_ITEM_ID_1",
                            "variant": {
                                "id": "VARIANT_ID_1",
                                "name": "Product Variant Name"
                            },
                            "quantity": 2,
                            "price": 50.00,
                            "order_status": "ADMIN_REVIEW"
                        },
                        {
                            "id": "ORDER_ITEM_ID_2",
                            "variant": {
                                "id": "VARIANT_ID_2",
                                "name": "Product Variant Name"
                            },
                            "quantity": 1,
                            "price": 50.00,
                            "order_status": "ADMIN_REVIEW"
                        }
                    ],
                    "created_at": "2024-10-29T12:34:56Z",
                    "last_modified_at": "2024-10-29T12:34:56Z",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Order created successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Validation Errors:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "shipping_address: This field is required, billing_address: This field is required",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid data provided",
                "status": false
            }
            ```

        - **Invalid Method:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid request method",
                "status": false
            }
            ```

        - **Server Error:**
            - **Code:** 500 Internal Server Error
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Detailed error message here",
                    "status": "error",
                    "code": 500
                },
                "message": "Internal server error",
                "status": false
            }
            ```

---

#### 3. [POST] `/api/customer/order/payment/razorpay/`

- **Description:** Initiates a Razorpay payment process for an existing order. Checks the order’s eligibility for payment, including payment method and status, and creates a Razorpay order if applicable. Returns order and payment details if successful.

- **Request:**
    - **Method:** POST
    - **URL:** `domain.com/api/customer/order/payment/razorpay/`
    - **Permissions:** IsAuthenticated, IsCustomer
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
      - **Fields:**
        - `order_id` (string, required): Unique ID of the order to initiate payment for.
      - **Example Request Body:**
        
        ```json
        {
            "order_id": "123e4567-e89b-12d3-a456-426614174000"
        }
        ```

- **Responses:**

    - **Success:**
        - **Code:** 201 Created
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "order": {
                    "id": "ORDER_ID",
                    "customer": {
                        "id": "CUSTOMER_ID",
                        "full_name": "John Doe",
                        "email": "johndoe@example.com"
                    },
                    "total_price": 150.00,
                    "payment_status": "PENDING"
                },
                "razorpay_order_id": "RAZORPAY_ORDER_ID",
                "status": "success",
                "code": 201
            },
            "prefill": {
                "name": "John Doe",
                "email": "johndoe@example.com",
                "contact": "9999999999",
                "amount": 150.00,
                "currency": "INR",
                "razorpay_key": "RAZORPAY_KEY_ID"
            },
            "message": "Order and payment initiated successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Order Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Order not found or you are not authorized to access this order.",
                    "status": "error",
                    "code": 404
                },
                "message": "Order not found",
                "status": false
            }
            ```

        - **Invalid Payment Method:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Payment method is not PAYMENT_GATEWAY or payment already successful.",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid payment method or payment already successful",
                "status": false
            }
            ```

        - **Server Error:**
            - **Code:** 500 Internal Server Error
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Razorpay error message",
                    "status": "error",
                    "code": 500
                },
                "message": "Razorpay error occurred",
                "status": false
            }
            ```

---

#### 4. [POST] `/api/customer/order/payment/razorpay/callback/`

- **Description:** Verifies Razorpay payment success or failure. Updates order details based on the callback data, and verifies the payment signature. Sets payment status and updates related order items.

- **Request:**
    - **Method:** POST
    - **URL:** `domain.com/api/customer/order/payment/razorpay/callback/`
    - **Permissions:** AllowAny
    - **Content-Type:** application/json
    - **Request Body:**
      - **Fields:**
        - `razorpay_order_id` (string, required): Razorpay’s unique order ID.
        - `razorpay_payment_id` (string, optional): Razorpay’s unique payment ID if successful.
        - `razorpay_signature` (string, optional): Razorpay’s payment verification signature.
      - **Example Request Body:**
        
        ```json
        {
            "razorpay_order_id": "RAZORPAY_ORDER_ID",
            "razorpay_payment_id": "RAZORPAY_PAYMENT_ID",
            "razorpay_signature": "RAZORPAY_SIGNATURE"
        }
        ```

- **Responses:**

    - **Payment Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "order": {
                    "id": "ORDER_ID",
                    "payment_status": "SUCCESS",
                    "is_successful": true,
                    "order_items": [
                        {
                            "id": "ORDER_ITEM_ID",
                            "order_status": "ADMIN_REVIEW"
                        }
                    ]
                },
                "status": "success",
                "code": 200
            },
            "message": "Payment successful",
            "status": true
        }
        ```

    - **Payment Failure:**
        - **Code:** 400 Bad Request
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Payment failed.",
                "status": "error",
                "code": 400
            },
            "message": "Payment failed",
            "status": false
        }
        ```

    - **Order Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Order not found.",
                "status": "error",
                "code": 404
            },
            "message": "Order not found",
            "status": false
        }
        ```

    - **Method Not Allowed:**
        - **Code:** 405 Method Not Allowed
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Method not allowed.",
                "status": "error",
                "code": 405
            },
            "message": "Method not allowed",
            "status": false
        }
        ```

---

#### 5. [POST] `/api/customer/orders/`

- **Description:** Retrieves a paginated list of orders for the authenticated customer. Orders are filtered by the logged-in user and ordered by the most recent.

- **Request:**
    - **Method:** POST
    - **URL:** `domain.com/api/customer/orders/`
    - **Permissions:** Requires authentication. Only accessible to users with the `IsCustomer` role.
    - **Content-Type:** application/json
    - **Request Body:**
      - **Fields:**
        - `limit` (integer, optional): Number of orders to retrieve per page. Default is `10`.
        - `offset` (integer, optional): The starting point for the order retrieval. Default is `0`.
      - **Example Request Body:**
        
        ```json
        {
            "limit": 10,
            "offset": 0
        }
        ```

- **Responses:**

    - **Success Response:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "orders": [
                    {
                        "id": "ORDER_ID",
                        "customer_details": {
                            "id": "CUSTOMER_ID",
                            "full_name": "John Doe",
                            "email": "johndoe@example.com"
                        },
                        "shipping_address_details": {
                            "id": "SHIPPING_ADDRESS_ID",
                            "street_address": "123 Main St",
                            "city": "New York",
                            "state": "NY",
                            "postal_code": "10001"
                        },
                        "billing_address_details": {
                            "id": "BILLING_ADDRESS_ID",
                            "street_address": "123 Main St",
                            "city": "New York",
                            "state": "NY",
                            "postal_code": "10001"
                        },
                        "total_price": 100.0,
                        "payment_method": "CREDIT_CARD",
                        "payment_status": "PAID",
                        "delivery_charge": 5.0,
                        "order_code": "ORDER123",
                        "order_items": [
                            {
                                "id": "ORDER_ITEM_ID",
                                "variant_details": {
                                    "id": "PRODUCT_VARIANT_ID",
                                    "price": 50.0,
                                    "discounted_price": 45.0,
                                    "quantity_in_stock": 20
                                },
                                "quantity": 2,
                                "price": 90.0,
                                "order_status": "DELIVERED",
                                "driver_for_me_url": "https://tracking.example.com/123"
                            }
                        ],
                        "created_at": "2024-11-14T12:00:00Z",
                        "last_modified_at": "2024-11-14T12:30:00Z"
                    }
                ],
                "total_count": 20,
                "page_count": 2,
                "current_page": 1,
                "limit": 10,
                "offset": 0,
                "has_next": true,
                "status": "success",
                "code": 200
            },
            "message": "Orders retrieved successfully.",
            "status": true
        }
        ```

    - **Invalid Pagination Parameters:**
        - **Code:** 400 Bad Request
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Limit and offset must be non-negative.",
                "status": "error",
                "code": 400
            },
            "message": "Invalid pagination parameters.",
            "status": false
        }
        ```

    - **Internal Server Error:**
        - **Code:** 500 Internal Server Error
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "An unexpected error occurred.",
                "status": "error",
                "code": 500
            },
            "message": "An internal server error occurred.",
            "status": false
        }
        ```

    - **Method Not Allowed:**
        - **Code:** 405 Method Not Allowed
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Method not allowed.",
                "status": "error",
                "code": 405
            },
            "message": "Method not allowed.",
            "status": false
        }
        ```

---

#### 6. [POST] `/api/vendor/orders/`

- **Description:** Retrieves a paginated list of orders that contain items assigned to the authenticated vendor. Orders are filtered by the logged-in vendor and ordered by the most recent.

- **Request:**
    - **Method:** POST
    - **URL:** `domain.com/api/vendor/orders/`
    - **Permissions:** Requires authentication. Only accessible to users with the `IsVendor` role.
    - **Content-Type:** application/json
    - **Request Body:**
      - **Fields:**
        - `limit` (integer, optional): Number of orders to retrieve per page. Default is `10`.
        - `offset` (integer, optional): The starting point for the order retrieval. Default is `0`.
      - **Example Request Body:**
        
        ```json
        {
            "limit": 10,
            "offset": 0
        }
        ```

- **Responses:**

    - **Success Response:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "orders": [
                    {
                        "order_id": "ORDER_ID",
                        "order_code": "ORDER123",
                        "shipping_address": "SHIPPING_ADDRESS_ID",
                        "billing_address": "BILLING_ADDRESS_ID",
                        "customer": "CUSTOMER_ID",
                        "status": "PENDING",
                        "order_date": "2024-11-14T12:00:00Z",
                        "order_items": [
                            {
                                "id": "ORDER_ITEM_ID",
                                "variant_details": {
                                    "id": "PRODUCT_VARIANT_ID",
                                    "price": 50.0,
                                    "discounted_price": 45.0,
                                    "quantity_in_stock": 20
                                },
                                "quantity": 2,
                                "price": 90.0,
                                "order_status": "ASSIGNED"
                            }
                        ]
                    }
                ],
                "total_count": 5,
                "page_count": 1,
                "current_page": 1,
                "limit": 10,
                "offset": 0,
                "has_next": false,
                "status": "success",
                "code": 200
            },
            "message": "Orders with assigned vendor items retrieved successfully.",
            "status": true
        }
        ```

    - **Invalid Pagination Parameters:**
        - **Code:** 400 Bad Request
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Limit and offset must be non-negative.",
                "status": "error",
                "code": 400
            },
            "message": "Invalid pagination parameters.",
            "status": false
        }
        ```

    - **Internal Server Error:**
        - **Code:** 500 Internal Server Error
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "An unexpected error occurred.",
                "status": "error",
                "code": 500
            },
            "message": "An internal server error occurred.",
            "status": false
        }
        ```

    - **Method Not Allowed:**
        - **Code:** 405 Method Not Allowed
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Method not allowed.",
                "status": "error",
                "code": 405
            },
            "message": "Method not allowed.",
            "status": false
        }
        ```

---

#### 7. [GET] `/api/admin/order-item/<uuid:order_item_id>/find-nearest-vendors/`

- **Description:** Finds the nearest 5 vendors for an order item who have the required variant in stock and can fulfill the requested quantity. Annotates vendors with distance and includes stock details and pricing information.

- **Request:**
    - **Method:** GET
    - **URL:** `domain.com/api/admin/order-item/<uuid:order_item_id>/find-nearest-vendors/`
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Content-Type:** Not Applicable
    - **Path Parameters:**
        - **Fields:**
            - `order_item_id` (UUID, required): The unique identifier of the order item.

- **Responses:**

    - **Nearest Vendors Found:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "nearest_vendors": [
                    {
                        "vendor_id": "VENDOR_ID",
                        "vendor_name": "Vendor Name",
                        "stock_quantity": 50,
                        "store_name": "Store Name",
                        "store_contact_email": "store@example.com",
                        "store_contact_phone": "+1234567890",
                        "latitude": 12.971598,
                        "longitude": 77.594566,
                        "distance": 2.5,
                        "price": "1000",
                        "discount": "10%",
                        "discounted_price": "900.0",
                        "selling_price": "850.0",
                        "vendor_asking_price": "870.0",
                        "vendor_selling_price": "720.0"
                    }
                ],
                "status": "success",
                "code": 200
            },
            "message": "Nearest vendors found successfully",
            "status": true
        }
        ```

    - **Missing Geolocation Data:**
        - **Code:** 400 Bad Request
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Shipping address does not have geolocation data",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data",
            "status": false
        }
        ```

    - **Order Item Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Order item not found.",
                "status": "error",
                "code": 404
            },
            "message": "Invalid data",
            "status": false
        }
        ```

    - **Server Error:**
        - **Code:** 500 Internal Server Error
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "An unexpected error occurred.",
                "status": "error",
                "code": 500
            },
            "message": "Internal server error",
            "status": false
        }
        ```

    - **Method Not Allowed:**
        - **Code:** 405 Method Not Allowed
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Method not allowed.",
                "status": "error",
                "code": 405
            },
            "message": "Method not allowed",
            "status": false
        }
        ```

---

#### 8. [POST] `/api/admin/order-item/assign-vendor/`

- **Description:** Assigns a vendor to an order item by an admin, updating the vendor selling price and order status to "ASSIGNED_TO_VENDOR". This API ensures that all required fields are provided and valid, and returns the updated order item details.

- **Request:**
    - **Method:** POST
    - **URL:** `domain.com/api/admin/order-item/assign-vendor/`
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Content-Type:** application/json
    - **Request Body:**
      - **Fields:**
        - `order_item_id` (integer, required): The ID of the order item to be assigned to a vendor.
        - `vendor_id` (integer, required): The ID of the vendor to be assigned to the order item.
        - `vendor_selling_price` (decimal, required): The price at which the vendor is selling the item.
      - **Example Request Body:**

        ```json
        {
            "order_item_id": 1,
            "vendor_id": 2,
            "vendor_selling_price": 150.00
        }
        ```

- **Responses:**

    - **Vendor Assigned Successfully:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**

        ```json
        {
            "data": {
                "order_item": {
                    "id": 1,
                    "order": 1,
                    "variant": 1,
                    "variant_details": {
                        "id": 1,
                        "product": 1,
                        "price": 100.00
                    },
                    "quantity": 1,
                    "price": 100.00,
                    "order_status": "ASSIGNED_TO_VENDOR",
                    "payment_status": "SUCCESS",
                    "vendor_payment_status": "PAID",
                    "driver_for_me_url": "https://tracking.example.com/123",
                    "assigned_vendor": 2,
                    "assigned_vendor_details": {
                        "id": 2,
                        "full_name": "Vendor Name"
                    },
                    "created_at": "2024-11-15T10:00:00Z",
                    "last_modified_at": "2024-11-15T10:05:00Z",
                    "is_active": true
                },
                "status": "success",
                "code": 200
            },
            "message": "Vendor assigned successfully",
            "status": true
        }
        ```

    - **Missing Required Fields:**
        - **Code:** 400 Bad Request
        - **Content-Type:** application/json
        - **Example Response:**

        ```json
        {
            "data": {
                "details": "Missing required fields",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data",
            "status": false
        }
        ```

    - **Order Item Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**

        ```json
        {
            "data": {
                "details": "Order item not found",
                "status": "error",
                "code": 404
            },
            "message": "Order item not found",
            "status": false
        }
        ```

    - **Vendor Not Found or Inactive:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**

        ```json
        {
            "data": {
                "details": "Vendor not found or inactive",
                "status": "error",
                "code": 404
            },
            "message": "Vendor not found",
            "status": false
        }
        ```

    - **Internal Server Error:**
        - **Code:** 500 Internal Server Error
        - **Content-Type:** application/json
        - **Example Response:**

        ```json
        {
            "data": {
                "details": "An error occurred while processing the request",
                "status": "error",
                "code": 500
            },
            "message": "Internal server error",
            "status": false
        }
        ```

---

#### 9. [PATCH] `/api/order-item/<uuid:order_item_id>/update-status/`

- **Description:** Updates the status of an order item. Admins can update all relevant fields (order status, payment status, vendor payment status), while vendors can only update the order status. Vendors also have specific rules for updating to 'DELIVERED' status, including stock and sold quantity management.

- **Request:**
    - **Method:** PATCH
    - **URL:** `domain.com/api/order-item/<uuid:order_item_id>/update-status/`
    - **Permissions:** IsAuthenticated
    - **Content-Type:** application/json
    - **Request Body:**
        - **Fields:**
            - `order_status` (string, optional): The status of the order item (e.g., 'DELIVERED', 'VENDOR_ACCEPTED', 'CANCELLED'). Only vendors can update this field with specific statuses.
            - `payment_status` (string, optional): The payment status of the order item (e.g., 'PENDING', 'SUCCESS', 'FAILED').
            - `vendor_payment_status` (string, optional): The payment status for the vendor (e.g., 'PENDING', 'PAID').
            - `driver_for_me_url` (string, optional): URL for the driver tracking (e.g., 'https://tracking.example.com/123').
        - **Example Request Body:**
        
        ```json
        {
            "order_status": "DELIVERED",
            "payment_status": "SUCCESS",
            "vendor_payment_status": "PAID",
            "driver_for_me_url": "https://tracking.example.com/123"
        }
        ```

- **Responses:**

    - **Order Item Status Updated Successfully (Admin):**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
        
        ```json
        {
            "data": {
                "order_item": {
                    "id": 1,
                    "order": 1,
                    "variant": 1,
                    "variant_details": {
                        "id": 1,
                        "product": 1,
                        "price": 100.00
                    },
                    "quantity": 1,
                    "price": 100.00,
                    "order_status": "ASSIGNED_TO_VENDOR",
                    "payment_status": "SUCCESS",
                    "vendor_payment_status": "PAID",
                    "driver_for_me_url": "https://tracking.example.com/123",
                    "assigned_vendor": 2,
                    "assigned_vendor_details": {
                        "id": 2,
                        "full_name": "Vendor Name"
                    },
                    "created_at": "2024-11-15T10:00:00Z",
                    "last_modified_at": "2024-11-15T10:05:00Z",
                    "is_active": true
                },
                "status": "success",
                "code": 200
            },
            "message": "Order item status updated successfully",
            "status": true
        }
        ```

    - **Order Item Status Updated Successfully (Vendor - 'DELIVERED' Status):**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
        
        ```json
        {
            "data": {
                "order_item": {
                    "id": 1,
                    "order": 1,
                    "variant": 1,
                    "variant_details": {
                        "id": 1,
                        "product": 1,
                        "price": 100.00
                    },
                    "quantity": 1,
                    "price": 100.00,
                    "order_status": "DELIVERED",
                    "payment_status": "SUCCESS",
                    "vendor_payment_status": "PAID",
                    "assigned_vendor": 2,
                    "assigned_vendor_details": {
                        "id": 2,
                        "full_name": "Vendor Name"
                    },
                    "created_at": "2024-11-15T10:00:00Z",
                    "last_modified_at": "2024-11-15T10:05:00Z",
                    "is_active": true
                },
                "status": "success",
                "code": 200
            },
            "message": "Order item status updated to DELIVERED successfully",
            "status": true
        }
        ```

    - **Insufficient Stock for Variant:**
        - **Code:** 400 Bad Request
        - **Content-Type:** application/json
        - **Example Response:**
        
        ```json
        {
            "data": {
                "details": "Insufficient stock for this variant.",
                "status": "error",
                "code": 400
            },
            "message": "Insufficient stock for the vendor.",
            "status": false
        }
        ```

    - **Vendor Does Not Have Permission to Update Order Item:**
        - **Code:** 403 Forbidden
        - **Content-Type:** application/json
        - **Example Response:**
        
        ```json
        {
            "data": {
                "details": "You do not have permission to update this order item.",
                "status": "error",
                "code": 403
            },
            "message": "Permission Denied",
            "status": false
        }
        ```

    - **Invalid Status Update for Vendor:**
        - **Code:** 403 Forbidden
        - **Content-Type:** application/json
        - **Example Response:**
        
        ```json
        {
            "data": {
                "details": "Invalid status update for vendors.",
                "status": "error",
                "code": 403
            },
            "message": "Invalid status update",
            "status": false
        }
        ```

    - **Order Item Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
        
        ```json
        {
            "data": {
                "details": "Order item not found",
                "status": "error",
                "code": 404
            },
            "message": "Order item not found",
            "status": false
        }
        ```

    - **Permission Denied:**
        - **Code:** 403 Forbidden
        - **Content-Type:** application/json
        - **Example Response:**
        
        ```json
        {
            "data": {
                "details": "You do not have the required permissions.",
                "status": "error",
                "code": 403
            },
            "message": "Permission Denied",
            "status": false
        }
        ```

    - **Internal Server Error:**
        - **Code:** 500 Internal Server Error
        - **Content-Type:** application/json
        - **Example Response:**
        
        ```json
        {
            "data": {
                "details": "An error occurred while processing the request.",
                "status": "error",
                "code": 500
            },
            "message": "Internal server error",
            "status": false
        }
        ```

---