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

- This is for the APIs related to Product listing, view, search etc.
- To access the protected views, include the access token in the header of all requests. Use "Authorization" as the key and "Bearer 2a9b……" as the value.
- All API endpoints except LOGIN, REGISTRATION, and FORGET PASSWORD require an access token.
- LOGIN and REGISTRATION will return an access token and a refresh token after a successful request.
- All the API url has a "api" word in it. If after the "api/" the nect word is "admin" then it is for admin only and if it has "vendor" or "customer" then they are for those roles. If theres nothing among those three then it's for all role.


### API Index

1. **[POST] /api/admin/driver/add/** - [Add a New Driver](#1-post-apicomadmindriveradd)
2. **[PATCH] /api/admin/driver/<uuid:driver_id>/edit/** - [Edit an Existing Driver](#2-patch-apicomadmindriveruuiddriver_idedit)
3. **[POST] /api/admin/driver/view/** - [View Paginated Drivers](#3-post-apicomadmindriverview)
4. **[DELETE] /api/admin/driver/<uuid:driver_id>/delete/** - [Delete a Driver](#4-delete-apicomadmindriveruuiddriver_iddelete)
5. **[POST] /api/admin/order/assign-driver/** - [Assign a Driver to an Order](#5-post-apicomadminorderassigndriver)
6. **[POST] /api/customer/order/view-driver/** - [View Driver Details for an Order](#6-post-apicustomerorderview-driver)

---


### Endpoints


#### 1. [POST] `/api/admin/driver/add/`

- **Description:** Adds a new driver to the system. The driver's license expiry date is validated to ensure it is not in the past. The rating is also validated to be between 1 and 5. This endpoint requires authentication and admin permissions.

- **Request:**
    - **Method:** POST
    - **URL:** `api/admin/driver/add/`
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Content-Type:** multipart/form-data
    - **Request Body:**
      - **Fields:**
        - `first_name` (string, required): The first name of the driver.
        - `last_name` (string, required): The last name of the driver.
        - `email` (string, optional): The email address of the driver.
        - `phone_number` (string, required): The phone number of the driver.
        - `date_of_birth` (date, optional): The driver's date of birth.
        - `profile_picture` (file, optional): A profile picture for the driver.
        - `license_number` (string, required): The driver's license number.
        - `license_type` (string, optional): The type of license the driver holds.
        - `license_expiry_date` (date, required): The expiry date of the driver's license (cannot be in the past).
        - `license_status` (string, required): The current status of the driver's license. Valid choices are `valid`, `expired`, and `suspended`.
        - `is_available` (boolean, optional): The availability status of the driver (default is `true`).
        - `employment_status` (string, required): The employment status of the driver. Valid choices are `full_time`, `part_time`, and `contractor`.
        - `address_line_1` (string, required): The first line of the driver's address.
        - `address_line_2` (string, optional): The second line of the driver's address.
        - `city` (string, required): The city where the driver resides.
        - `state` (string, required): The state where the driver resides.
        - `postal_code` (string, required): The postal code of the driver's address.
        - `country` (string, required): The country where the driver resides.
        - `total_deliveries` (integer, optional): The total number of deliveries completed by the driver (default is 0).
        - `rating` (decimal, optional): The rating of the driver out of 5 (default is 5.0).
        - `emergency_contact_name` (string, optional): The name of the driver's emergency contact.
        - `emergency_contact_phone` (string, optional): The phone number of the driver's emergency contact.

      - **Example Request Body:**
        
        ```plaintext
        --boundary
        Content-Disposition: form-data; name="first_name"

        John
        --boundary
        Content-Disposition: form-data; name="last_name"

        Doe
        --boundary
        Content-Disposition: form-data; name="phone_number"

        1234567890
        --boundary
        Content-Disposition: form-data; name="license_number"

        A12345678
        --boundary
        Content-Disposition: form-data; name="license_expiry_date"

        2025-12-31
        --boundary
        Content-Disposition: form-data; name="license_status"

        valid
        --boundary
        Content-Disposition: form-data; name="employment_status"

        full_time
        --boundary
        Content-Disposition: form-data; name="address_line_1"

        123 Main Street
        --boundary
        Content-Disposition: form-data; name="city"

        Metropolis
        --boundary
        Content-Disposition: form-data; name="state"

        NY
        --boundary
        Content-Disposition: form-data; name="postal_code"

        12345
        --boundary
        Content-Disposition: form-data; name="country"

        USA
        --boundary--
        ```

- **Responses:**

    - **Success:**
        - **Code:** 201 Created
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "driver": {
                    "id": "DRIVER_ID",
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": null,
                    "phone_number": "1234567890",
                    "date_of_birth": null,
                    "profile_picture": null,
                    "license_number": "A12345678",
                    "license_type": null,
                    "license_expiry_date": "2025-12-31",
                    "license_status": "valid",
                    "is_available": true,
                    "employment_status": "full_time",
                    "address_line_1": "123 Main Street",
                    "address_line_2": null,
                    "city": "Metropolis",
                    "state": "NY",
                    "postal_code": "12345",
                    "country": "USA",
                    "total_deliveries": 0,
                    "rating": "5.00",
                    "emergency_contact_name": null,
                    "emergency_contact_phone": null,
                    "created_at": "2024-09-05T12:34:56Z",
                    "last_modified_at": "2024-09-05T12:34:56Z",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Driver added successfully",
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
                    "details": "first_name: This field is required, license_number: This field is required",
                    "status": "error",
                    "code": 400
                },
                "message": "There were errors with your request.",
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
                "message": "Invalid request method.",
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
                "message": "An unexpected error occurred. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **Field Validation:** The `license_expiry_date` must not be in the past, and the `rating` must be between 1 and 5.
    - **Soft Delete:** Drivers are not permanently deleted; instead, the `is_active` field is used to manage their status.
    - **File Uploads:** The `profile_picture` field accepts file uploads. Ensure the request uses `multipart/form-data` encoding for file uploads.
    - **Default Values:** Fields like `total_deliveries` and `rating` have default values of 0 and 5.0, respectively.

---


#### 2. [PATCH] `/api/admin/driver/<uuid:driver_id>/edit/`

- **Description:** Updates an existing driver identified by `driver_id`. Allows partial updates of driver fields. This endpoint requires authentication and admin permissions.

- **Request:**
    - **Method:** PATCH
    - **URL:** domain.com/api/admin/driver/<uuid:driver_id>/edit/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Content-Type:** multipart/form-data (for profile picture updates) or application/json
    - **URL Parameters:**
        - `driver_id` (uuid, required): The UUID of the driver to be updated.
    - **Request Body:**
      - **Fields:**
        - `first_name` (string, optional): The first name of the driver.
        - `last_name` (string, optional): The last name of the driver.
        - `email` (email, optional): The email address of the driver.
        - `phone_number` (string, optional): The phone number of the driver.
        - `date_of_birth` (date, optional): The date of birth of the driver.
        - `profile_picture` (file, optional): A profile picture for the driver. If not included, the existing picture remains unchanged.
        - `license_number` (string, optional): The license number of the driver.
        - `license_type` (string, optional): The type of the license.
        - `license_expiry_date` (date, optional): The expiry date of the driver's license.
        - `license_status` (string, optional): The status of the license (`valid`, `expired`, `suspended`).
        - `is_available` (boolean, optional): Whether the driver is available.
        - `employment_status` (string, optional): The employment status of the driver (`full_time`, `part_time`, `contractor`).
        - `address_line_1` (string, optional): The primary address of the driver.
        - `address_line_2` (string, optional): The secondary address of the driver.
        - `city` (string, optional): The city of the driver.
        - `state` (string, optional): The state of the driver.
        - `postal_code` (string, optional): The postal code of the driver.
        - `country` (string, optional): The country of the driver.
        - `rating` (decimal, optional): The rating of the driver (between 1.0 and 5.0).
        - `emergency_contact_name` (string, optional): The name of the emergency contact.
        - `emergency_contact_phone` (string, optional): The phone number of the emergency contact.

      - **Example Request Body:**
        
        ```json
        {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "phone_number": "1234567890",
            "city": "New York",
            "state": "NY",
            "license_status": "valid"
        }
        ```

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "driver": {
                    "id": "DRIVER_ID",
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john.doe@example.com",
                    "phone_number": "1234567890",
                    "date_of_birth": "1990-01-01",
                    "profile_picture": "path/to/profile_picture.jpg",
                    "license_number": "A1234567",
                    "license_type": "Class B",
                    "license_expiry_date": "2025-12-31",
                    "license_status": "valid",
                    "is_available": true,
                    "employment_status": "full_time",
                    "address_line_1": "123 Main Street",
                    "address_line_2": null,
                    "city": "New York",
                    "state": "NY",
                    "postal_code": "10001",
                    "country": "USA",
                    "total_deliveries": 120,
                    "rating": 4.85,
                    "emergency_contact_name": "Jane Doe",
                    "emergency_contact_phone": "0987654321",
                    "created_at": "2024-01-01T12:34:56Z",
                    "last_modified_at": "2024-12-30T12:34:56Z",
                    "is_active": true
                },
                "status": "success",
                "code": 200
            },
            "message": "Driver updated successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Driver Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Driver not found.",
                    "status": "error",
                    "code": 404
                },
                "message": "Driver not found.",
                "status": false
            }
            ```

        - **Validation Errors:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "license_expiry_date: The license expiry date cannot be in the past, rating: The rating must be between 1 and 5",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid data",
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
                "message": "Invalid request method.",
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
                "message": "An unexpected error occurred. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **Validation Rules:** 
      - `license_expiry_date` cannot be in the past.
      - `rating` must be between 1.0 and 5.0.
    - **Soft Delete:** Drivers are not permanently deleted; instead, the `is_active` field is used to indicate active status.
    - **Partial Updates:** Only fields provided in the request body are updated, others remain unchanged.
    - **Image Updates:** The `profile_picture` field can be updated using `multipart/form-data` encoding if an image is provided.

---


#### 3. [POST] `/api/admin/driver/view/`

- **Description:** Retrieves paginated drivers based on `limit` and `offset`, with optional search functionality. This endpoint requires authentication and admin permissions.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/admin/driver/view/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
      - **Fields:**
        - `limit` (integer, optional): The number of drivers to return per page. Default is 10.
        - `offset` (integer, optional): The starting point from where to retrieve drivers. Default is 0.
        - `search` (string, optional): Search query to filter drivers by fields such as `first_name`, `last_name`, `email`, `phone_number`, etc.

      - **Example Request Body:**
        
        ```json
        {
            "limit": 5,
            "offset": 10,
            "search": "John"
        }
        ```

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "drivers": [
                    {
                        "id": "DRIVER_ID_11",
                        "first_name": "John",
                        "last_name": "Doe",
                        "email": "john.doe@example.com",
                        "phone_number": "1234567890",
                        "date_of_birth": "1990-01-01",
                        "profile_picture": "path/to/profile_picture11.jpg",
                        "license_number": "LICENSE12345",
                        "license_type": "Car",
                        "license_expiry_date": "2025-01-01",
                        "license_status": "valid",
                        "is_available": true,
                        "employment_status": "full_time",
                        "address_line_1": "123 Main St",
                        "address_line_2": "Apt 4B",
                        "city": "New York",
                        "state": "NY",
                        "postal_code": "10001",
                        "country": "USA",
                        "total_deliveries": 50,
                        "rating": 4.5,
                        "emergency_contact_name": "Jane Doe",
                        "emergency_contact_phone": "9876543210"
                    },
                    {
                        "id": "DRIVER_ID_12",
                        "first_name": "Jane",
                        "last_name": "Smith",
                        "email": "jane.smith@example.com",
                        "phone_number": "0987654321",
                        ...
                    }
                ],
                "total_count": 25,
                "page_count": 5,
                "current_page": 2,
                "limit": 5,
                "offset": 10,
                "has_next": true,
                "status": "success",
                "code": 200
            },
            "message": "Paginated drivers fetched successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Invalid Limit or Offset:**
            - **Code:** 500 Internal Server Error
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Limit and offset must be non-negative integers.",
                    "status": "error",
                    "code": 500
                },
                "message": "Internal server error",
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
                "message": "Invalid request method.",
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
                "message": "An unexpected error occurred. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **Pagination Calculation:**
        - **Page Count:** The total number of pages based on the `limit`.
        - **Current Page:** The page number based on `offset` and `limit`.
        - **Has Next:** Indicates if there are more pages available after the current page.
    - **Search Functionality:** The `search` field performs a case-insensitive partial match on driver fields, including `first_name`, `last_name`, `email`, `phone_number`, and others.
    - **Ordering:** Drivers are sorted by `created_at` in descending order.

---

#### 4. [DELETE] `/api/admin/driver/<uuid:driver_id>/delete/`

- **Description:** Soft deletes a driver by their ID. This endpoint is restricted to authenticated admin users.

- **Request:**
    - **Method:** DELETE
    - **URL:** domain.com/api/admin/driver/<uuid:driver_id>/delete/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required

- **Path Parameters:**
    - `driver_id` (UUID): The unique identifier of the driver to be deleted.

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "status": "success",
                "code": 200
            },
            "message": "Driver deleted successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Driver Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Driver not found.",
                    "status": "error",
                    "code": 404
                },
                "message": "Driver not found",
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
                "message": "Invalid request method.",
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
                "message": "An unexpected error occurred. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **Soft Delete:** The driver is marked as inactive (soft deleted) rather than being permanently removed from the database.
---

#### 5. [POST] `/api/admin/order/assign-driver/`

- **Description:** This endpoint assigns a driver to an active order and generates an OTP for the assigned driver. It is accessible only to authenticated admin users.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/admin/order/assign-driver/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
      - **Fields:**
        - `order_id` (string, required): The ID of the order to which the driver is to be assigned.
        - `driver_id` (string, required): The ID of the driver to be assigned to the order.

      - **Example Request Body:**
        
        ```json
        {
            "order_id": "ORDER_ID_123",
            "driver_id": "DRIVER_ID_456"
        }
        ```

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "order": {
                    "id": "ORDER_ID_123",
                    "customer": "USER_ID_789",
                    "shipping_address": "ADDRESS_ID_101",
                    "billing_address": "ADDRESS_ID_102",
                    "total_price": 100.50,
                    "payment_method": "credit_card",
                    "payment_status": "paid",
                    "delivery_charge": 5.00,
                    "driver_fees": 20.00,
                    "driver_otp": "123456",
                    "driver_details": "DRIVER_ID_456",
                    "driver_details_data": {
                        "id": "DRIVER_ID_456",
                        "first_name": "John",
                        "last_name": "Doe",
                        "phone_number": "1234567890",
                        "email": "john.doe@example.com"
                    },
                    "order_code": "ORDER_CODE_123",
                    "order_items": [
                        {
                            "id": "ITEM_ID_1",
                            "name": "Item 1",
                            "quantity": 2,
                            "price": 50.25
                        }
                    ],
                    "created_at": "2024-12-30T00:00:00Z",
                    "last_modified_at": "2024-12-30T01:00:00Z",
                    "is_active": true
                },
                "status": "success",
                "code": 200
            },
            "message": "Driver assigned and OTP generated successfully",
            "status": true
        }
        ```

    - **Error Handling:**

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

        - **Order Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Order not found or inactive",
                    "status": "error",
                    "code": 404
                },
                "message": "Order not found",
                "status": false
            }
            ```

        - **Driver Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Driver not found",
                    "status": "error",
                    "code": 404
                },
                "message": "Driver not found",
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
                "message": "Internal server error",
                "status": false
            }
            ```

- **Additional Notes:**
    - **Order Status:** The order must be active (`is_active=True`) to assign a driver.
    - **OTP Generation:** An OTP is generated using a helper function (`generate_otp`) and assigned to the order for the driver.
    - **Response Fields:**
        - `order_details`: Includes the full order details, with nested fields like `driver_details` and `order_items`.
        - `driver_details_data`: A serialized representation of the assigned driver's details.
    - **Authentication:** Only users with `IsAdminUser` permission can access this API endpoint.
    - **Error Responses:** The endpoint provides detailed error messages when the order, driver, or required fields are not found.

---

#### 6. [POST] `/api/customer/order/view-driver/`

- **Description:** This endpoint allows customers to view the details of the driver assigned to their order by providing the `order_id` and the `driver_otp` they received. It is only accessible to authenticated customers who have made the respective order.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/customer/order/view-driver/
    - **Permissions:** IsAuthenticated, IsCustomer
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
      - **Fields:**
        - `order_id` (string, required): The ID of the order to view the assigned driver's details.
        - `driver_otp` (string, required): The OTP assigned to the driver for the order.

      - **Example Request Body:**
        
        ```json
        {
            "order_id": "ORDER_ID_123",
            "driver_otp": "123456"
        }
        ```

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "driver": {
                    "id": "DRIVER_ID_456",
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john.doe@example.com",
                    "phone_number": "1234567890",
                    "date_of_birth": "1990-01-01",
                    "profile_picture": "path/to/profile_picture.jpg",
                    "license_number": "LICENSE12345",
                    "license_type": "Car",
                    "license_expiry_date": "2025-01-01",
                    "license_status": "valid",
                    "is_available": true,
                    "employment_status": "full_time",
                    "address_line_1": "123 Main St",
                    "address_line_2": "Apt 4B",
                    "city": "New York",
                    "state": "NY",
                    "postal_code": "10001",
                    "country": "USA",
                    "total_deliveries": 50,
                    "rating": 4.5,
                    "emergency_contact_name": "Jane Doe",
                    "emergency_contact_phone": "9876543210"
                },
                "status": "success",
                "code": 200
            },
            "message": "Driver details fetched successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Missing Required Fields:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Both 'order_id' and 'driver_otp' are required",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid data",
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
                    "details": "Order not found or inactive",
                    "status": "error",
                    "code": 404
                },
                "message": "Order not found",
                "status": false
            }
            ```

        - **Unauthorized Access:**
            - **Code:** 403 Forbidden
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "You are not authorized to view this order's driver details",
                    "status": "error",
                    "code": 403
                },
                "message": "Unauthorized",
                "status": false
            }
            ```

        - **Invalid OTP:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Invalid driver OTP",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid OTP",
                "status": false
            }
            ```

        - **No Driver Assigned:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "No driver assigned to this order",
                    "status": "error",
                    "code": 404
                },
                "message": "Driver not found",
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
                "message": "An unexpected error occurred. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **Authorization:** The customer must be the user who placed the order to access the driver's details.
    - **OTP Verification:** The provided OTP must match the OTP assigned to the driver for the order.
    - **Error Messages:** The API provides specific error messages to guide the customer in case of incorrect input or unauthorized access.
    - **Driver Details:** If the order has an assigned driver, the full driver details (including personal and professional information) are returned in the response.
    - **Security:** The endpoint ensures that only authenticated customers can access the driver's details by verifying the user's identity.

---