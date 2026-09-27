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

1. **[POST] /api/admin/users/view/** - [View All Admin Users](#1-post-apiadminusersview)
2. **[GET] /api/admin/users/<uuid:user_id>/details/** - [Get User Details](#2-get-apiadminusersuuiduseriddetails)
3. **[POST] /api/admin/orders/view/** - [View Orders](#3-post-apiadminordersview)
4. **[POST] /api/admin/products/view/** - [View Products](#4-post-apiadminproductsview)
5. **[POST] /api/admin/vendors/stock/<uuid:product_id>/in-stock/** - [Update Product Stock for Vendor](#5-post-apiadminvendorsstockuuidproductidinstock)
6. **[POST] /api/admin/users/<uuid:user_id>/orders/** - [View User Orders](#6-post-apiadminusersuuiduseridorders)
7. **[POST] /api/admin/vendors/<uuid:user_id>/order-items/** - [View Vendor Order Items](#7-post-apiadminvendorsuuiduseridorder-items)
8. **[GET] /api/admin/statistics/** - [Admin Panel Statistics](#8-get-apiadminstatistics)
9. **[GET] /api/vendor/statistics/** - [Vendor Statistics](#9-get-apivendorstatistics)
10. **[POST] /api/admin/vendors/unverified/** - [View Unverified Vendor Users](#2-post-apiadminvendorsunverified)
11. **[POST] /api/admin/vendors/<uuid:user_id>/verify/** - [Update Vendor Verification Status](#3-post-apiadminvendorsuuiduseridverify)


---

### Endpoints


#### 1. [POST] `/api/admin/users/view/`

- **Description:** Retrieves a list of users with filtering and pagination for admin use. This endpoint allows administrators to view user data based on specific filters such as email, phone number, country, state, postal code, and account type, while supporting pagination using `limit` and `offset`.

- **URL**: `/api/admin/users/view/`
- **Method**: `POST`
- **Permissions**: Only authenticated users with the `IsAdminUser` permission.
- **Request Body**:

    ```json
    {
        "limit": 10,                        // Optional: Number of items to display per page (default: 10)
        "offset": 0,                        // Optional: Offset from where to start displaying users (default: 0)
        "email": "string",                   // Optional: Email address (partial match)
        "phone_number": "string",            // Optional: Phone number (partial match)
        "country": "string",                 // Optional: Country (partial match)
        "state": "string",                   // Optional: State (partial match)
        "postal_code": "string",             // Optional: Postal code (partial match)
        "account_type": "customer"           // Optional: Account type (e.g., "customer", "vendor")
    }
    ```

- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "users": [                            // List of user data
                    {
                        "id": "uuid",                   // User ID
                        "full_name": "string",           // Full name of the user
                        "first_name": "string",          // First name of the user
                        "last_name": "string",           // Last name of the user
                        "email": "string",               // Email of the user
                        "phone_number": "string",        // Phone number of the user
                        "country": "string",             // Country of the user
                        "state": "string",               // State of the user
                        "postal_code": "string",         // Postal code of the user
                        "account_type": "string",        // Account type (customer, vendor)
                        "is_active": true,               // Whether the user account is active
                        "is_verified": true,             // Whether the user is verified
                        "date_joined": "timestamp"       // Date when the user joined
                    }
                ],
                "total_count": 100,                   // Total number of users matching filters
                "page_count": 10,                     // Total pages available based on pagination
                "current_page": 1,                    // Current page number
                "limit": 10,                          // Number of items per page
                "offset": 0,                          // Current offset
                "has_next": true                      // Whether there is a next page
            },
            "message": "Users retrieved successfully.",
            "status": true
        }
        ```

    - **400 Bad Request**:

        ```json
        {
            "data": {
                "details": "LIMIT and OFFSET values must be non-negative.",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data",
            "status": false
        }
        ```

    - **500 Internal Server Error**:

        ```json
        {
            "data": {
                "details": "Error details",
                "status": "error",
                "code": 500
            },
            "message": "Internal server error",
            "status": false
        }
        ```

- **Additional Notes:**
    - **Filters:** Filters such as `email`, `phone_number`, `country`, `state`, `postal_code`, and `account_type` are optional. If provided, they are used for searching users. Each field uses partial matching where applicable.
    - **Pagination:** The `limit` and `offset` parameters are used for pagination. `limit` specifies the number of items per page, while `offset` indicates where to start fetching users. Negative values for `limit` or `offset` are rejected.
    - **Error Handling:** Invalid data or server errors will return appropriate error messages.

---

#### 2. [GET] `/api/admin/users/<uuid:user_id>/details/`

- **Description:** Retrieves detailed information about a specific user based on `user_id`. This endpoint provides different data based on the `account_type` of the user (customer, vendor, etc.).

- **URL**: `/api/admin/users/<uuid:user_id>/details/`
- **Method**: `GET`
- **Permissions**: Only authenticated users with the `IsAdminUser` permission.
- **Request Params**:

    - `user_id`: UUID of the user whose details are to be fetched.

- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "user": {                             // User details object
                    "id": "uuid",                     // User ID
                    "full_name": "string",             // Full name of the user
                    "first_name": "string",            // First name of the user
                    "last_name": "string",             // Last name of the user
                    "email": "string",                 // Email of the user
                    "phone_number": "string",          // Phone number of the user
                    "country": "string",               // Country of the user
                    "state": "string",                 // State of the user
                    "postal_code": "string",           // Postal code of the user
                    "account_type": "string",          // Account type (e.g., "customer", "vendor")
                    "bio": "string",                   // Bio of the user (if available)
                    "profile_picture": "url",          // Profile picture URL (if available)
                    "is_verified": true,               // Whether the user is verified
                    "is_active": true,                 // Whether the user is active
                    "date_joined": "timestamp"         // Date when the user joined
                },
                "status": "success",
                "code": 200
            },
            "message": "User details retrieved successfully.",
            "status": true
        }
        ```

    - **404 Not Found**:

        ```json
        {
            "data": {
                "details": "User not found.",
                "status": "error",
                "code": 404
            },
            "message": "User not found.",
            "status": false
        }
        ```

    - **500 Internal Server Error**:

        ```json
        {
            "data": {
                "details": "Error details",
                "status": "error",
                "code": 500
            },
            "message": "Internal server error",
            "status": false
        }
        ```

- **Additional Notes:**
    - **Account Type Specific Data:** The detailed data returned for the user may vary depending on their `account_type`. For example, vendors may have additional fields like `vendor_profile`.
    - **Error Handling:** If the user with the specified `user_id` does not exist, a `404 Not Found` response is returned.
    - **Profile Picture and Bio:** These are optional fields that may be available for users with additional profile information.

---

#### 3. [POST] `/api/admin/orders/view/`

- **Description:** Retrieves a list of orders with pagination and filtering options. This endpoint allows admin users to filter orders by customer name, order code, payment method, payment status, phone number, and address fields.

- **URL**: `/api/admin/orders/view/`
- **Method**: `POST`
- **Permissions**: Only authenticated users with the `IsAdminUser` permission.
- **Request Body**:

    ```json
    {
        "limit": 10,                         // Optional: The number of orders to retrieve per page (default: 10)
        "offset": 0,                         // Optional: The starting point of the data (default: 0)
        "customer_name": "string",            // Optional: Search by customer name (first or last)
        "order_code": "string",               // Optional: Search by order code
        "payment_method": "string",           // Optional: Filter by payment method
        "payment_status": "string",           // Optional: Filter by payment status
        "phone_number": "string",             // Optional: Filter by phone number
        "address": "string"                   // Optional: Filter by address fields (street, city, state, postal code, country)
    }
    ```
- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "orders": [                              // List of orders
                    {
                        "id": 1,
                        "order_code": "ORD12345",
                        "payment_status": "Paid",
                        "payment_method": "Credit Card",
                        "customer": {                          // Customer details
                            "id": 1,
                            "first_name": "John",
                            "last_name": "Doe",
                            "email": "john.doe@example.com"
                        },
                        "shipping_address": {                  // Shipping address details
                            "street_address": "123 Main St",
                            "city": "New York",
                            "state": "NY",
                            "postal_code": "10001",
                            "country": "USA",
                            "phone_number": "123-456-7890"
                        },
                        "billing_address": {                   // Billing address details
                            "street_address": "123 Main St",
                            "city": "New York",
                            "state": "NY",
                            "postal_code": "10001",
                            "country": "USA",
                            "phone_number": "123-456-7890"
                        },
                        "total_amount": 100.0,
                        "created_at": "2024-01-01T12:00:00Z"
                    }
                ],
                "total_count": 100,                        // Total number of orders
                "page_count": 10,                          // Total number of pages
                "current_page": 1,                         // Current page
                "has_next": true,                          // Whether there is a next page
                "limit": 10,                               // Number of items per page
                "offset": 0                                // Current offset
            },
            "message": "Orders retrieved successfully.",
            "status": true
        }
        ```

    - **400 Bad Request**:

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

    - **500 Internal Server Error**:

        ```json
        {
            "data": {
                "details": "Error details",
                "status": "error",
                "code": 500
            },
            "message": "An internal server error occurred.",
            "status": false
        }
        ```

---

#### 4. [POST] `/api/admin/products/view/`

- **Description:** Retrieves a list of products with pagination. The products are ordered by their active status (active products first) and creation date. Admin users can use this endpoint to view all products.

- **URL**: `/api/admin/products/view/`
- **Method**: `POST`
- **Permissions**: Only authenticated users with the `IsAdminUser` permission.
- **Request Body**:

    ```json
    {
        "limit": 10,                         // Optional: The number of products to retrieve per page (default: 10)
        "offset": 0                          // Optional: The starting point of the data (default: 0)
    }
    ```
- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "products": [                              // List of products
                    {
                        "id": 1,
                        "name": "Product A",
                        "description": "Description of Product A",
                        "price": 20.0,
                        "is_active": true,
                        "is_gst_applicable": true,
                        "gst_rate": 18,
                        "created_at": "2024-01-01T12:00:00Z"
                    }
                ],
                "total_count": 100,                        // Total number of products
                "page_count": 10,                          // Total number of pages
                "current_page": 1,                         // Current page
                "has_next": true,                          // Whether there is a next page
                "limit": 10,                               // Number of items per page
                "offset": 0                                // Current offset
            },
            "message": "Products retrieved successfully.",
            "status": true
        }
        ```

    - **500 Internal Server Error**:

        ```json
        {
            "data": {
                "details": "Error details",
                "status": "error",
                "code": 500
            },
            "message": "An internal server error occurred.",
            "status": false
        }
        ```

---

#### 5. [POST] `/api/admin/vendors/stock/<uuid:product_id>/in-stock/`

- **Description:** Retrieves a list of vendors who have a specific product in stock. This endpoint allows admin users to check which vendors carry a particular product and manage inventory.

- **URL**: `/api/admin/vendors/stock/<uuid:product_id>/in-stock/`
- **Method**: `POST`
- **Permissions**: Only authenticated users with the `IsAdminUser` permission.
- **Request Body**:

    ```json
    {
        "limit": 10,                         // Optional: The number of vendors to retrieve per page (default: 10)
        "offset": 0                          // Optional: The starting point of the data (default: 0)
    }
    ```
- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "variants": [                            // List of vendor stocks
                    {
                        "vendor": {                         // Vendor details
                            "id": 1,
                            "name": "Vendor A",
                            "location": "New York"
                        },
                        "product": {                        // Product details
                            "id": 1,
                            "name": "Product A",
                            "price": 20.0
                        },
                        "stock_quantity": 50,
                        "created_at": "2024-01-01T12:00:00Z"
                    }
                ],
                "total_items": 100,                        // Total number of vendors with this product
                "page_count": 10,                          // Total number of pages
                "current_page": 1,                         // Current page
                "has_next": true,                          // Whether there is a next page
                "limit": 10,                               // Number of items per page
                "offset": 0                                // Current offset
            },
            "message": "Vendors with product in stock retrieved successfully.",
            "status": true
        }
        ```

    - **404 Not Found**:

        ```json
        {
            "data": {
                "details": "Product not found.",
                "status": "error",
                "code": 404
            },
            "message": "Product not found.",
            "status": false
        }
        ```

    - **500 Internal Server Error**:

        ```json
        {
            "data": {
                "details": "Error details",
                "status": "error",
                "code": 500
            },
            "message": "An internal server error occurred.",
            "status": false
        }
        ```

--- 

#### 6. [POST] `/api/admin/users/<uuid:user_id>/orders/`

- **Description:** Retrieves all the orders made by a specific user. The endpoint allows admin users to fetch orders for a particular customer, with support for pagination and calculating total items purchased and total purchase amount.

- **URL**: `/api/admin/users/<uuid:user_id>/orders/`
- **Method**: `POST`
- **Permissions**: Only authenticated users with the `IsAdminUser` permission.
- **Request Body**:

    ```json
    {
        "limit": 10,                         // Optional: The number of orders to retrieve per page (default: 10)
        "offset": 0                          // Optional: The starting point of the data (default: 0)
    }
    ```
- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "orders": [                              // List of orders made by the user
                    {
                        "id": 1,
                        "order_code": "ORD12345",
                        "payment_status": "SUCCESS",
                        "total_amount": 100.0,
                        "created_at": "2024-01-01T12:00:00Z",
                        "order_items": [                      // List of items in the order
                            {
                                "product_name": "Product A",
                                "quantity": 2,
                                "item_total_price": 40.0
                            }
                        ]
                    }
                ],
                "total_orders_count": 10,                   // Total number of orders made by the user
                "total_purchase_amount": 1000.0,            // Total purchase amount for the user
                "total_items_purchased": 25,                // Total number of items purchased
                "page_count": 1,                            // Total number of pages
                "current_page": 1,                          // Current page
                "has_next": false,                          // Whether there is a next page
                "limit": 10,                                // Number of items per page
                "offset": 0                                 // Current offset
            },
            "message": "Orders retrieved successfully.",
            "status": true
        }
        ```

    - **400 Bad Request**:

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

    - **500 Internal Server Error**:

        ```json
        {
            "data": {
                "details": "Error details",
                "status": "error",
                "code": 500
            },
            "message": "An internal server error occurred.",
            "status": false
        }
        ```

---

#### 7. [POST] `/api/admin/vendors/<uuid:user_id>/order-items/`

- **Description:** Retrieves all the order items sold by a specific vendor. The endpoint allows admin users to view all the items sold by a vendor, with support for pagination and calculating the total item price, vendor selling price, and total items sold.

- **URL**: `/api/admin/vendors/<uuid:user_id>/order-items/`
- **Method**: `POST`
- **Permissions**: Only authenticated users with the `IsAdminUser` permission.
- **Request Body**:

    ```json
    {
        "limit": 10,                         // Optional: The number of order items to retrieve per page (default: 10)
        "offset": 0                          // Optional: The starting point of the data (default: 0)
    }
    ```
- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "order_items": [                             // List of order items sold by the vendor
                    {
                        "order_id": 1,
                        "product_name": "Product A",
                        "quantity": 2,
                        "vendor_selling_price": 30.0,
                        "item_total_price": 60.0,
                        "order_status": "DELIVERED",
                        "payment_status": "SUCCESS",
                        "created_at": "2024-01-01T12:00:00Z"
                    }
                ],
                "total_order_items_count": 50,                  // Total number of order items sold by the vendor
                "total_item_total_price": 3000.0,                // Total item price for the vendor
                "total_vendor_selling_price": 2500.0,            // Total vendor selling price for the vendor
                "total_items_sold": 100,                         // Total number of items sold by the vendor
                "page_count": 1,                                 // Total number of pages
                "current_page": 1,                               // Current page
                "has_next": false,                               // Whether there is a next page
                "limit": 10,                                     // Number of items per page
                "offset": 0                                      // Current offset
            },
            "message": "Order items retrieved successfully.",
            "status": true
        }
        ```

    - **400 Bad Request**:

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

    - **500 Internal Server Error**:

        ```json
        {
            "data": {
                "details": "Error details",
                "status": "error",
                "code": 500
            },
            "message": "An internal server error occurred.",
            "status": false
        }
        ```

--- 

#### 8. [GET] `/api/admin/statistics/`

- **Description:** Retrieves various statistics for the admin panel, such as user counts, order statistics, revenue and profit data, and category-wise revenue distribution. This data is meant to be displayed in the home page top section of the admin panel.

- **URL**: `/api/admin/statistics/`
- **Method**: `GET`
- **Permissions**: Only authenticated users with the `IsAdminUser` permission.
- **Response**:

    - **200 OK**:

        ```json
        {
            "data": {
                "user_statistics": {
                    "total_users": 1000,                    // Total number of users
                    "active_users": 800,                    // Total number of active users
                    "active_customers": 600,                // Total number of active customers
                    "active_vendors": 200,                  // Total number of active vendors
                },
                "order_statistics": {
                    "total_orders": 1500,                   // Total number of orders
                    "today_orders": 50,                     // Number of orders today
                    "order_change_percentage": 10.0         // Percentage change in orders from yesterday
                },
                "revenue_and_profit": {
                    "last_7_days_data": [
                        {"day": "2024-11-08", "daily_revenue": 2000.0, "daily_profit": 500.0},
                        {"day": "2024-11-09", "daily_revenue": 2500.0, "daily_profit": 800.0}
                    ],
                    "daily_revenue_formatted": {
                        "2024-11-08": 2000.0,
                        "2024-11-09": 2500.0
                    },
                    "total_revenue": 50000.0,             // Total revenue for all-time
                    "total_profit": 15000.0,              // Total profit for all-time
                    "current_day_revenue": 5000.0,        // Revenue for the current day
                    "revenue_change_percentage": 20.0     // Percentage change in revenue from the previous day
                },
                "category_distribution": [
                    {"category": "Electronics", "sub_category": "Mobiles", "category_revenue": 12000.0, "revenue_percentage": 40.0},
                    {"category": "Fashion", "sub_category": "Men's Clothing", "category_revenue": 8000.0, "revenue_percentage": 26.67}
                ],
                "status": "success",
                "code": 200
            },
            "message": "data retrieved successfully.",
            "status": true
        }
        ```

    - **500 Internal Server Error**:

        ```json
        {
            "data": {
                "details": "Error details",
                "status": "error",
                "code": 500
            },
            "message": "An internal server error occurred.",
            "status": false
        }
        ```

---

#### 9. [GET] `/api/vendor/statistics/`

- **Description:** Retrieves various statistics for a specific vendor, including total revenue, daily revenue, order counts, and percentage changes in revenue. This data is meant to be displayed in the home page top section of the vendor panel.

- **URL**: `/api/vendor/statistics/`
- **Method**: `GET`
- **Permissions**: Only authenticated users with the `IsVendor` permission.
- **Response**:

    - **200 OK**:

        ```json
        {
            "data": {
                "total_revenue": 10000.0,                 // Total revenue for the vendor
                "total_revenue_today": 500.0,             // Total revenue for the current day
                "previous_day_total_revenue": 400.0,      // Total revenue from the previous day
                "percentage_change": 25.0,                 // Percentage change in revenue compared to previous day
                "total_order_count": 150,                  // Total number of orders
                "delivered_count": 120,                    // Number of delivered items
                "vendor_accepted_count": 130,              // Number of vendor accepted items
                "daily_revenue_last_7_days": {
                    "2024-11-08": 1000.0,
                    "2024-11-09": 1200.0
                },
                "status": "success",
                "code": 200
            },
            "message": "data retrieved successfully.",
            "status": true
        }
        ```

    - **500 Internal Server Error**:

        ```json
        {
            "data": {
                "details": "Error details",
                "status": "error",
                "code": 500
            },
            "message": "An internal server error occurred.",
            "status": false
        }
        ```

--- 

#### 10. [POST] /api/admin/vendors/unverified/

- **Description:** Retrieves a list of unverified vendor users for admin use. This endpoint allows administrators to view vendor users who have not yet been verified, while supporting pagination using `limit` and `offset`.

- **URL:** /api/admin/vendors/unverified/

- **Method:** POST

- **Permissions:** Only authenticated users with the `IsAdminUser ` permission.

- **Request Body:**

    ```json
    {
        "limit": 10,                        // Optional: Number of items to display per page (default: 10)
        "offset": 0                         // Optional: Offset from where to start displaying users (default: 0)
    }
    ```

- **Responses:**

    - **200 OK:**

        ```json
        {
            "data": {
                "users": [                            // List of unverified vendor user data
                    {
                        "id": "uuid",                   // User ID
                        "full_name": "string",           // Full name of the user
                        "first_name": "string",          // First name of the user
                        "last_name": "string",           // Last name of the user
                        "email": "string",               // Email of the user
                        "phone_number": "string",        // Phone number of the user
                        "country": "string",             // Country of the user
                        "state": "string",               // State of the user
                        "postal_code": "string",         // Postal code of the user
                        "account_type": "string",        // Account type (vendor)
                        "is_active": true,               // Whether the user account is active
                        "is_verified": false,            // Whether the user is verified
                        "date_joined": "timestamp"       // Date when the user joined
                    }
                ],
                "total_count": 100,                   // Total number of unverified vendors
                "page_count": 10,                     // Total pages available based on pagination
                "current_page": 1,                    // Current page number
                "limit": 10,                          // Number of items per page
                "offset": 0,                          // Current offset
                "has_next": true                      // Whether there is a next page
            },
            "message": "Unverified vendors retrieved successfully.",
            "status": true
        }
        ```

    - **400 Bad Request:**

        ```json
        {
            "data": {
                "details": "LIMIT and OFFSET values must be non-negative.",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data",
            "status": false
        }
        ```

    - **500 Internal Server Error:**

        ```json
        {
            "data": {
                "details": "Error details",
                "status": "error",
                "code": 500
            },
            "message": "Internal server error",
            "status": false
        }
        ```

- **Additional Notes:**
    - **Pagination:** The `limit` and `offset` parameters are used for pagination. `limit` specifies the number of items per page, while `offset` indicates where to start fetching users. Negative values for `limit` or `offset` are rejected.
    - **Error Handling:** Invalid data or server errors will return appropriate error messages.

---

#### 11. [POST] /api/admin/vendors/<uuid:user_id>/verify/

- **Description:** Updates the `is_verified` status for a vendor user identified by their user ID. This endpoint allows administrators to verify vendor users who have not yet been verified.

- **URL:** /api/admin/vendors/<uuid:user_id>/verify/

- **Method:** POST

- **Permissions:** Only authenticated users with the `IsAdminUser ` permission.

- **Request Body:**

    ```json
    {
        // No request body is required for this endpoint.
    }
    ```

- **Responses:**

    - **200 OK:**

        ```json
        {
            "data": {
                "status": "success",
                "code": 200
            },
            "message": "User  verification status updated successfully.",
            "status": true
        }
        ```

    - **400 Bad Request:**

        ```json
        {
            "data": {
                "status": "error",
                "code": 400
            },
            "message": "User  is either not a vendor or already verified.",
            "status": false
        }
        ```

    - **404 Not Found:**

        ```json
        {
            "data": {
                "status": "error",
                "code": 404
            },
            "message": "User  not found.",
            "status": false
        }
        ```

    - **500 Internal Server Error:**

        ```json
        {
            "data": {
                "details": "Error details",
                "status": "error",
                "code": 500
            },
            "message": "Internal server error",
            "status": false
        }
        ```

- **Additional Notes:**
    - **User  ID:** The `user_id` in the URL must be a valid UUID corresponding to the user whose verification status is to be updated.
    - **Verification Logic:** The endpoint checks if the user is a vendor and if their `is_verified` status is `False` before updating it. If the user does not meet these criteria, an appropriate error message is returned.
    - **Error Handling:** Invalid user IDs or server errors will return appropriate error messages.