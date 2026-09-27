# MotoSpar API Documentation

MotoSpar Mechanic is a Django REST Framework project that provides various APIs for the MotoSpar Mechanic APP. This is the API Documentation for the project.

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
- All the API url has a "api" word in it. If after the "api/" the nect word is "admin" then it is for admin only and if it has "vendor", "mechanic" or "customer" then they are for those roles. If theres nothing among those three then it's for all role.


### API Index

### API Index

1. **[PATCH] /api/mechanic/profile/<uuid:mechanic_profile_id>/edit/** - [Edit Mechanic Profile](#1-patch-apimechanicprofileuuidmechanicprofileidedit)
2. **[GET] /api/admin/order-item/<uuid:order_item_id>/find-nearest-mechanics/** - [Find Nearest Mechanics](#2-get-apiadminorder-itemuuidorder_item_idfind-nearest-mechanics)
3. **[POST] /api/admin/order-item/<uuid:order_item_id>/assign-mechanic/** - [Assign Mechanic to Order Item](#3-post-apiadminorder-itemuuidorder_item_idassign-mechanic)
4. **[POST] /api/mechanic/job/<uuid:job_id>/accept/** - [Accept Job](#4-post-apimechanicjobuuidjob_idaccept)
5. **[POST] /api/mechanic/job/<uuid:job_id>/validate-otp/** - [Validate OTP for Job](#5-post-apimechanicjobuuidjob_idvalidate-otp)
6. **[POST] /api/mechanic/job/<uuid:job_id>/complete/** - [Complete Job](#6-post-apimechanicjobuuidjob_idcomplete)
7. **[POST] /api/customer/<uuid:order_item_id>/add-mechanic-review/** - [Add Mechanic Review](#7-post-apicustomeruuidorder_item_idadd-mechanic-review)
8. **[POST] /api/mechanic/jobs/view/** - [View Mechanic Jobs](#8-post-apimechanicjobsview)
9. **[GET] /api/mechanic/statistics/** - [View Mechanic Statistics](#9-get-apimechanicstatistics)
10. **[POST] /api/admin/mechanic/users/view/** - [View All Mechanics (Admin)](#10-post-apiadminmechanicusersview)
11. **[GET] /api/admin/mechanic/users/<uuid:user_id>/details/** - [Get Mechanic User Details (Admin)](#11-get-apiadminmechanicusersuuiduser_iddetails)
12. **[POST] /api/mechanic/job/<uuid:job_id>/decline/** - [Decline Job](#12-post-apimechanicjobuuidjob_iddecline)
13. **[POST] /api/mechanic/job/<uuid:job_id>/start/** - [Start Job](#13-post-apimechanicjobuuidjob_idstart)
14. **[POST] /api/mechanic/job/<uuid:job_id>/upload-images/** - [Upload Job Images](#14-post-apimechanicjobuuidjob_idupload-images)
15. **[POST] /api/mechanic/job/<uuid:job_id>/complete-with-otp/** - [Complete Job with OTP](#15-post-apimechanicjobuuidjob_idcomplete-with-otp)
16. **[POST] /api/mechanic/report/** - [Submit Mechanic Report](#16-post-apimechanicreport)
17. **[POST] /api/admin/mechanic-job/<uuid:mechanic_job_id>/update-payment/** - [Update Mechanic Job Payment (Admin)](#17-post-apiadminmechanic-jobuuidmechanic_job_idupdate-payment)
18. **[POST] /api/mechanic/fee-payment/create/** - [Create Fee Payment (Mechanic)](#18-post-apimechanicfee-paymentcreate)
19. **[POST] /api/mechanic/fee-payment/callback/** - [Handle Razorpay Callback (Mechanic)](#19-post-apimechanicfee-paymentcallback)
20. **[POST] /api/mechanic/platform-fees/view/** - [View Platform Fees (Mechanic)](#20-post-apimechanicplatform-feesview)


---

### Endpoints


#### 1. [PATCH] `/api/mechanic/profile/<uuid:mechanic_profile_id>/edit/`

- **Description:** Allows an authenticated mechanic to partially update their profile information. This endpoint enables mechanics to modify fields such as expertise, certifications, contact details, service area, and other profile-related data. Only the owner of the profile can make changes, and updates are performed within a transaction to ensure data integrity.

- **URL**: `/api/mechanic/profile/<uuid:mechanic_profile_id>/edit/`
- **Method**: `PATCH`
- **Permissions**: Requires authentication and the `IsMechanic` permission (user must be a mechanic and the owner of the profile).
- **URL Parameters**:
  - `mechanic_profile_id` (UUID): The unique identifier of the mechanic profile to be edited.

- **Request Body**:

    ```json
    {
        "expertise": "string",                    // Optional: Mechanic's expertise (e.g., "Engine Specialist")
        "years_of_experience": 5,                // Optional: Years of experience
        "certifications": "string",              // Optional: Certifications or qualifications
        "contact_phone": "string",               // Optional: Contact phone number
        "contact_email": "string",               // Optional: Contact email address
        "base_address": "string",                // Optional: Base address of the mechanic
        "base_city": "string",                   // Optional: City of operation
        "base_state": "string",                  // Optional: State of operation
        "base_country": "string",                // Optional: Country of operation
        "base_postal_code": "string",            // Optional: Postal code
        "latitude": 12.3456789,                  // Optional: Latitude for geolocation
        "longitude": 98.7654321,                 // Optional: Longitude for geolocation
        "is_available": true,                    // Optional: Availability status
        "working_hours": "string",               // Optional: Working hours (e.g., "9 AM - 6 PM")
        "bank_account_number": "string",         // Optional: Bank account number for payouts
        "bank_name": "string",                   // Optional: Bank name
        "ifsc_code": "string",                   // Optional: IFSC code for bank
        "specialization": "string",              // Optional: Specialization (e.g., "Car, Bike")
        "service_types": "string",               // Optional: Service types (e.g., "Oil Change, Brake Repair")
        "uploaded_documents": "file",             // Optional: File for certifications or licenses
        "uploaded_documents_type": "string",     // Optional: Type of uploaded document (e.g., "License")
        "referral_code": "string"                // Optional: Referral code
    }
    ```

- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "user": {
                    "id": "uuid",                   // User ID
                    "first_name": "string",         // First name of the user
                    "last_name": "string",          // Last name of the user
                    "email": "string",              // Email of the user
                    "phone_number": "string",       // Phone number of the user
                    "country_code": "string",       // Country code of the user
                    "bio": "string",                // Bio of the user
                    "date_of_birth": "date",        // Date of birth of the user
                    "address": "string",            // Address of the user
                    "postal_code": "string",        // Postal code of the user
                    "state": "string",              // State of the user
                    "country": "string",            // Country of the user
                    "account_type": "string"        // Account type (e.g., "mechanic")
                },
                "status": "success",
                "code": 200
            },
            "message": "Mechanic profile updated successfully",
            "status": true
        }
        ```

    - **400 Bad Request**:

        ```json
        {
            "data": {
                "details": "Validation errors: {...}",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data",
            "status": false
        }
        ```

    - **403 Forbidden**:

        ```json
        {
            "data": {
                "details": "You do not have permission to edit this profile.",
                "status": "error",
                "code": 403
            },
            "message": "Permission denied. You do not own this profile.",
            "status": false
        }
        ```

    - **404 Not Found**:

        ```json
        {
            "data": {
                "details": "Mechanic profile not found.",
                "status": "error",
                "code": 404
            },
            "message": "Mechanic profile not found.",
            "status": false
        }
        ```

    - **405 Method Not Allowed**:

        ```json
        {
            "data": {
                "details": "Method not allowed.",
                "status": "error",
                "code": 405
            },
            "message": "Invalid method",
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
    - **Partial Updates:** The endpoint supports partial updates, allowing only specified fields to be updated while leaving others unchanged.
    - **Ownership Check:** Only the authenticated user associated with the mechanic profile can edit it, enforced by checking `mechanic_profile.user == request.user`.
    - **Transaction Safety:** Updates are performed within a transaction (`transaction.atomic()`) to ensure data consistency.
    - **File Uploads:** The `uploaded_documents` field supports file uploads for certifications or licenses, with `uploaded_documents_type` specifying the document type (e.g., "License").
    - **Verification Status:** Upon successful update, the `is_verified` field is automatically set to `True`, indicating the profile has been verified or updated.
    - **Error Handling:** The endpoint uses utility functions (`handle_error_response`, `handle_validation_errors`, `handle_invalid_method`, `handle_exception`) for consistent error handling, covering cases like profile not found, permission issues, validation errors, invalid methods, and unexpected errors.

---

#### 2. [GET] `/api/admin/order-item/<uuid:order_item_id>/find-nearest-mechanics/`

- **Description:** Retrieves a list of up to five nearest mechanics for a given order item based on the geolocation of the order's shipping address. This endpoint is designed for admin users to find active and available mechanics, calculating their distance from the customer's shipping address using the Haversine formula and returning relevant mechanic profile details.

- **URL**: `/api/admin/order-item/<uuid:order_item_id>/find-nearest-mechanics/`
- **Method**: `GET`
- **Permissions**: Requires authentication and the `IsAdminUser` permission.
- **URL Parameters**:
  - `order_item_id` (UUID): The unique identifier of the order item for which to find nearby mechanics.

- **Request Body**:
  - None (This is a GET request, so no request body is required.)

- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "nearest_mechanics": [
                    {
                        "mechanic_id": "uuid",              // ID of the mechanic (User ID)
                        "mechanic_name": "string",          // Full name of the mechanic
                        "email": "string",                  // Email of the mechanic
                        "contact_phone": "string",          // Contact phone number (from MechanicProfile or User)
                        "contact_email": "string",          // Contact email (from MechanicProfile or User)
                        "expertise": "string",              // Mechanic's expertise (e.g., "Engine Specialist")
                        "years_of_experience": 5,           // Years of experience
                        "specialization": "string",         // Specialization (e.g., "Car, Bike")
                        "service_types": "string",          // Service types (e.g., "Oil Change, Brake Repair")
                        "is_verified": true,                // Verification status of the mechanic
                        "latitude": 12.3456789,            // Latitude of mechanic's base location
                        "longitude": 98.7654321,           // Longitude of mechanic's base location
                        "distance": 10.25,                 // Distance from customer's shipping address (in kilometers, rounded to 2 decimals)
                        "working_hours": "string",          // Working hours (e.g., "9 AM - 6 PM")
                        "base_address": "string",           // Base address of the mechanic
                        "base_city": "string",             // City of operation
                        "base_state": "string",            // State of operation
                        "base_country": "string"           // Country of operation
                    }
                ],
                "status": "success",
                "code": 200
            },
            "message": "Nearest mechanics found successfully",
            "status": true
        }
        ```

    - **400 Bad Request**:

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

    - **404 Not Found**:

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
    - **Geolocation Requirement:** The endpoint requires the order's shipping address to have valid `latitude` and `longitude` values to calculate distances. If these are missing, a 400 Bad Request error is returned.
    - **Distance Calculation:** The Haversine formula is used to calculate the distance between the customer's shipping address and each mechanic's base location, measured in kilometers and rounded to two decimal places.
    - **Filtering:** Only active (`is_active=True`) and available (`is_available=True`) mechanics with valid geolocation data (`latitude` and `longitude` not null) are considered.
    - **Limit:** The endpoint returns up to five nearest mechanics, ordered by distance (closest first).
    - **Data Sources:** Contact information prioritizes `MechanicProfile` fields (`contact_phone`, `contact_email`) but falls back to `User` fields (`phone_number`, `email`) if not provided.
    - **Error Handling:** The endpoint handles cases where the order item is not found (404) or unexpected errors occur (500), with consistent error response formatting.

---

#### 3. [POST] `/api/admin/order-item/<uuid:order_item_id>/assign-mechanic/`

- **Description:** Allows an admin user to assign a mechanic to an order item, creating or updating a related `MechanicJob` instance. The endpoint sets the mechanic, mechanic fees, and generates a 6-digit OTP for the order item, marking it as requiring installation. It also supports an optional scheduled date for the job.

- **URL**: `/api/admin/order-item/<uuid:order_item_id>/assign-mechanic/`
- **Method**: `POST`
- **Permissions**: Requires authentication and the `IsAdminUser` permission.
- **URL Parameters**:
  - `order_item_id` (UUID): The unique identifier of the order item to which the mechanic is assigned.

- **Request Body**:

    ```json
    {
        "mechanic_id": "uuid",               // Required: ID of the mechanic (User ID)
        "mechanic_fees": 100.00,             // Required: Fees for the mechanic (decimal)
        "scheduled_date": "timestamp"        // Optional: Scheduled date and time for the job (ISO 8601 format, e.g., "2025-06-04T13:00:00Z")
    }
    ```

- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "order_item": {
                    "id": "uuid",                   // Order item ID
                    "order": "uuid",                // Associated order ID
                    "variant": "uuid",              // Product variant ID
                    "quantity": 2,                  // Quantity of the item
                    "price": 50.00,                 // Price per unit
                    "item_total_price": 100.00,     // Total price (quantity * price)
                    "order_status": "string",       // Order status (e.g., "PENDING")
                    "payment_status": "string",     // Payment status (e.g., "PENDING")
                    "mechanic": "uuid",             // Assigned mechanic ID
                    "mechanic_fees_for_customer": 100.00, // Mechanic fees for customer
                    "mechanic_fees_for_mechanic": 100.00, // Mechanic fees for mechanic
                    "mechanic_otp": "string",       // Generated 6-digit OTP
                    "installation_required": true,   // Installation requirement status
                    "vendor_selling_price": 50.00,  // Vendor selling price
                    "vendor_payment_status": false,  // Vendor payment status
                    "created_at": "timestamp",      // Creation timestamp
                    "last_modified_at": "timestamp",// Last modified timestamp
                    "is_active": true               // Active status
                },
                "mechanic_job_id": "uuid",          // ID of the created/updated MechanicJob
                "status": "success",
                "code": 200
            },
            "message": "Mechanic assigned successfully",
            "status": true
        }
        ```

    - **400 Bad Request**:

        ```json
        {
            "data": {
                "details": "Missing required fields: mechanic_id, or mechanic_fees",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data",
            "status": false
        }
        ```

        *or*

        ```json
        {
            "data": {
                "details": "Invalid mechanic_fees value",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data",
            "status": false
        }
        ```

    - **404 Not Found**:

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

        *or*

        ```json
        {
            "data": {
                "details": "Mechanic not found or not available.",
                "status": "error",
                "code": 404
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
    - **Required Fields:** The `mechanic_id` and `mechanic_fees` fields are mandatory. Missing or invalid values (e.g., negative `mechanic_fees`) will result in a 400 Bad Request response.
    - **Mechanic Validation:** The endpoint ensures the mechanic exists, is active (`mechanic_profile__is_active=True`), and is available (`mechanic_profile__is_available=True`) before assignment.
    - **OTP Generation:** A 6-digit OTP is generated and stored in `OrderItem.mechanic_otp` for verification purposes during job execution.
    - **Mechanic Job Management:** The endpoint creates a new `MechanicJob` if none exists for the order item or updates an existing one, setting fields like `mechanic`, `mechanic_fees`, `job_status` (to "pending"), `payment_status` (to "pending"), and `scheduled_date` (if provided).
    - **Installation Flag:** The `installation_required` field of the `OrderItem` is set to `True` upon mechanic assignment.
    - **Error Handling:** The endpoint handles errors for missing or invalid data, non-existent order items or mechanics, and unexpected server errors, returning consistent error responses.

---

#### 4. [POST] `/api/mechanic/job/<uuid:job_id>/accept/`

- **Description:** Allows an authenticated mechanic to accept a job offer, updating the `is_accepted` field of the `MechanicJob` to `True`. The endpoint ensures that only the assigned mechanic can accept the job and that the job has not already been accepted.

- **URL**: `/api/mechanic/job/<uuid:job_id>/accept/`
- **Method**: `POST`
- **Permissions**: Requires authentication (the user must be the assigned mechanic for the job).
- **URL Parameters**:
  - `job_id` (UUID): The unique identifier of the mechanic job to be accepted.

- **Request Body**:
  - None (This is a POST request with no required body parameters, as acceptance is confirmed by the authenticated user and job ID.)

- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "job": {
                    "id": "uuid",                    // Mechanic job ID
                    "order_item": "uuid",           // Associated order item ID
                    "mechanic": "uuid",             // Assigned mechanic ID
                    "mechanic_first_name": "string", // Mechanic's first name
                    "mechanic_last_name": "string", // Mechanic's last name
                    "mechanic_email": "string",     // Mechanic's email
                    "order_id": "uuid",             // Associated order ID
                    "variant_name": "string",       // Product variant name
                    "quantity": 2,                  // Order item quantity
                    "order_status": "string",       // Order item status (e.g., "PENDING")
                    "is_accepted": true,            // Job acceptance status
                    "job_status": "string",         // Job status (e.g., "pending")
                    "payment_status": "string",     // Payment status (e.g., "pending")
                    "mechanic_fees": 100.00,        // Mechanic fees
                    "start_date": "timestamp",      // Job start date (null if not started)
                    "completion_date": "timestamp", // Job completion date (null if not completed)
                    "scheduled_date": "timestamp",  // Scheduled date (null if not set)
                    "payment_date": "timestamp",    // Payment date (null if not paid)
                    "notes": "string",              // Additional notes
                    "review": "string",             // Customer review (empty if not provided)
                    "rating": 4.5,                  // Customer rating (null if not provided)
                    "created_at": "timestamp",      // Creation timestamp
                    "last_modified_at": "timestamp",// Last modified timestamp
                    "is_active": true               // Active status
                },
                "status": "success",
                "code": 200
            },
            "message": "Job offer has been accepted successfully!",
            "status": true
        }
        ```

    - **400 Bad Request**:

        ```json
        {
            "data": {
                "details": "Job has already been accepted.",
                "status": "error",
                "code": 400
            },
            "message": "Job has already been accepted.",
            "status": false
        }
        ```

    - **403 Forbidden**:

        ```json
        {
            "data": {
                "details": "You are not authorized to accept this job.",
                "status": "error",
                "code": 403
            },
            "message": "You are not authorized to accept this job.",
            "status": false
        }
        ```

    - **404 Not Found**:

        ```json
        {
            "data": {
                "details": "Mechanic job not found.",
                "status": "error",
                "code": 404
            },
            "message": "Mechanic job not found.",
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
    - **Mechanic Validation:** The endpoint verifies that the authenticated user is the assigned mechanic for the job (`mechanic_job.mechanic == request.user`). Unauthorized users receive a 403 Forbidden response.
    - **Job Acceptance Check:** If the job has already been accepted (`is_accepted=True`), a 400 Bad Request response is returned to prevent duplicate acceptance.
    - **Minimal Update:** The endpoint only updates the `is_accepted` field to `True` and does not modify other fields like `job_status` or `start_date`, which are handled by other endpoints (e.g., OTP validation).
    - **Serialization:** The response includes the updated `MechanicJob` details serialized using `MechanicJobSerializer`, providing comprehensive job information, including related order item and mechanic data.
    - **Error Handling:** The endpoint handles cases where the job is not found (404), the user is not authorized (403), the job is already accepted (400), or unexpected errors occur (500), with consistent error response formatting.

---

#### 5. [POST] `/api/mechanic/job/<uuid:job_id>/validate-otp/`

- **Description:** Allows an authenticated mechanic to validate a job by providing an OTP, which is checked against the `mechanic_otp` stored in the associated `OrderItem`. If the OTP is valid, the `MechanicJob` status is updated to `in_progress`, and the `start_date` is set to the current timestamp. The endpoint ensures that only the assigned mechanic can validate the OTP and that the job is not already in progress or completed.

- **URL**: `/api/mechanic/job/<uuid:job_id>/validate-otp/`
- **Method**: `POST`
- **Permissions**: Requires authentication (the user must be the assigned mechanic for the job).
- **URL Parameters**:
  - `job_id` (UUID): The unique identifier of the mechanic job to validate.

- **Request Body**:

    ```json
    {
        "otp": "string"                     // Required: 6-digit OTP provided by the mechanic
    }
    ```

- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "job": {
                    "id": "uuid",                    // Mechanic job ID
                    "order_item": "uuid",           // Associated order item ID
                    "mechanic": "uuid",             // Assigned mechanic ID
                    "mechanic_first_name": "string", // Mechanic's first name
                    "mechanic_last_name": "string", // Mechanic's last name
                    "mechanic_email": "string",     // Mechanic's email
                    "order_id": "uuid",             // Associated order ID
                    "variant_name": "string",       // Product variant name
                    "quantity": 2,                  // Order item quantity
                    "order_status": "string",       // Order item status (e.g., "PENDING")
                    "is_accepted": true,            // Job acceptance status
                    "job_status": "in_progress",    // Job status (updated to "in_progress")
                    "payment_status": "string",     // Payment status (e.g., "pending")
                    "mechanic_fees": 100.00,        // Mechanic fees
                    "start_date": "timestamp",      // Job start date (set to current timestamp)
                    "completion_date": "timestamp", // Job completion date (null if not completed)
                    "scheduled_date": "timestamp",  // Scheduled date (null if not set)
                    "payment_date": "timestamp",    // Payment date (null if not paid)
                    "notes": "string",              // Additional notes
                    "review": "string",             // Customer review (empty if not provided)
                    "rating": 4.5,                  // Customer rating (null if not provided)
                    "created_at": "timestamp",      // Creation timestamp
                    "last_modified_at": "timestamp",// Last modified timestamp
                    "is_active": true               // Active status
                },
                "status": "success",
                "code": 200
            },
            "message": "OTP validated successfully, job is now in progress!",
            "status": true
        }
        ```

    - **400 Bad Request**:

        ```json
        {
            "data": {
                "details": "OTP is required.",
                "status": "error",
                "code": 400
            },
            "message": "OTP is required.",
            "status": false
        }
        ```

        *or*

        ```json
        {
            "data": {
                "details": "Invalid OTP provided.",
                "status": "error",
                "code": 400
            },
            "message": "Invalid OTP provided.",
            "status": false
        }
        ```

        *or*

        ```json
        {
            "data": {
                "details": "Job is already in_progress.",
                "status": "error",
                "code": 400
            },
            "message": "Job is already in_progress.",
            "status": false
        }
        ```

    - **403 Forbidden**:

        ```json
        {
            "data": {
                "details": "You are not authorized to validate this job.",
                "status": "error",
                "code": 403
            },
            "message": "You are not authorized to validate this job.",
            "status": false
        }
        ```

    - **404 Not Found**:

        ```json
        {
            "data": {
                "details": "Mechanic job not found.",
                "status": "error",
                "code": 404
            },
            "message": "Mechanic job not found.",
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
    - **OTP Validation:** The provided OTP is compared against the `mechanic_otp` field in the associated `OrderItem`. If they do not match, a 400 Bad Request response is returned.
    - **Mechanic Authorization:** The endpoint ensures that only the assigned mechanic (`mechanic_job.mechanic == request.user`) can validate the OTP, returning a 403 Forbidden response for unauthorized users.
    - **Job Status Check:** If the job is already in `in_progress` or `completed` status, a 400 Bad Request response is returned to prevent redundant updates.
    - **Status Update:** Upon successful OTP validation, the `job_status` is set to `in_progress`, and the `start_date` is updated to the current timestamp using `timezone.now()`.
    - **Serialization:** The response includes the updated `MechanicJob` details serialized using `MechanicJobSerializer`, providing comprehensive job information, including related order item and mechanic data.
    - **Error Handling:** The endpoint handles cases where the OTP is missing (400), the job is not found (404), the user is not authorized (403), the OTP is invalid (400), the job status is already `in_progress` or `completed` (400), or unexpected errors occur (500), with consistent error response formatting.

---

#### 6. [POST] `/api/mechanic/job/<uuid:job_id>/complete/`

- **Description:** Allows an authenticated mechanic to mark a job as completed, updating the `job_status` to `completed` and setting the `completion_date` to the current timestamp. The endpoint ensures that only the assigned mechanic can mark the job as completed and that the job is not already completed.

- **URL**: `/api/mechanic/job/<uuid:job_id>/complete/`
- **Method**: `POST`
- **Permissions**: Requires authentication (the user must be the assigned mechanic for the job).
- **URL Parameters**:
  - `job_id` (UUID): The unique identifier of the mechanic job to be marked as completed.

- **Request Body**:
  - None (This is a POST request with no required body parameters, as completion is confirmed by the authenticated user and job ID.)

- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "job": {
                    "id": "uuid",                    // Mechanic job ID
                    "order_item": "uuid",           // Associated order item ID
                    "mechanic": "uuid",             // Assigned mechanic ID
                    "mechanic_first_name": "string", // Mechanic's first name
                    "mechanic_last_name": "string", // Mechanic's last name
                    "mechanic_email": "string",     // Mechanic's email
                    "order_id": "uuid",             // Associated order ID
                    "variant_name": "string",       // Product variant name
                    "quantity": 2,                  // Order item quantity
                    "order_status": "string",       // Order item status (e.g., "PENDING")
                    "is_accepted": true,            // Job acceptance status
                    "job_status": "completed",      // Job status (updated to "completed")
                    "payment_status": "string",     // Payment status (e.g., "pending")
                    "mechanic_fees": 100.00,        // Mechanic fees
                    "start_date": "timestamp",      // Job start date
                    "completion_date": "timestamp", // Job completion date (set to current timestamp)
                    "scheduled_date": "timestamp",  // Scheduled date (null if not set)
                    "payment_date": "timestamp",    // Payment date (null if not paid)
                    "notes": "string",              // Additional notes
                    "review": "string",             // Customer review (empty if not provided)
                    "rating": 4.5,                  // Customer rating (null if not provided)
                    "created_at": "timestamp",      // Creation timestamp
                    "last_modified_at": "timestamp",// Last modified timestamp
                    "is_active": true               // Active status
                },
                "status": "success",
                "code": 200
            },
            "message": "Job has been marked as completed!",
            "status": true
        }
        ```

    - **400 Bad Request**:

        ```json
        {
            "data": {
                "details": "Job is already completed.",
                "status": "error",
                "code": 400
            },
            "message": "Job is already completed.",
            "status": false
        }
        ```

    - **403 Forbidden**:

        ```json
        {
            "data": {
                "details": "You are not authorized to accept this job.",
                "status": "error",
                "code": 403
            },
            "message": "You are not authorized to accept this job.",
            "status": false
        }
        ```

    - **404 Not Found**:

        ```json
        {
            "data": {
                "details": "Mechanic job not found.",
                "status": "error",
                "code": 404
            },
            "message": "Mechanic job not found.",
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
    - **Mechanic Authorization:** The endpoint verifies that the authenticated user is the assigned mechanic for the job (`mechanic_job.mechanic == request.user`). Unauthorized users receive a 403 Forbidden response.
    - **Job Status Check:** If the job is already marked as `completed`, a 400 Bad Request response is returned to prevent redundant updates.
    - **Status Update:** Upon successful execution, the `job_status` is set to `completed`, and the `completion_date` is updated to the current timestamp using `timezone.now()`.
    - **Serialization:** The response includes the updated `MechanicJob` details serialized using `MechanicJobSerializer`, providing comprehensive job information, including related order item and mechanic data.
    - **Error Handling:** The endpoint handles cases where the job is not found (404), the user is not authorized (403), the job is already completed (400), or unexpected errors occur (500), with consistent error response formatting.

---

#### 7. [POST] `/api/customer/<uuid:order_item_id>/add-mechanic-review/`

- **Description:** Allows an authenticated customer to submit a review and/or rating for a completed mechanic job associated with a delivered order item. The endpoint ensures that the customer owns the order, the job is completed, and no prior review exists. Ratings must be between 1.0 and 5.0, and at least one of review or rating is required.

- **URL**: `/api/customer/<uuid:order_item_id>/add-mechanic-review/`
- **Method**: `POST`
- **Permissions**: Requires authentication and the `IsCustomer` permission (the user must be the customer who placed the order).
- **URL Parameters**:
  - `order_item_id` (UUID): The unique identifier of the order item for which the review is being submitted.

- **Request Body**:

    ```json
    {
        "rating": 4.5,                     // Optional: Rating for the mechanic job (between 1.0 and 5.0)
        "review": "string"                 // Optional: Text review for the mechanic job
    }
    ```

- **Responses**:

    - **201 Created**:

        ```json
        {
            "data": {
                "review": "string",             // Submitted review text
                "rating": 4.5,                  // Submitted rating
                "status": "success",
                "code": 201
            },
            "message": "Review and rating added successfully",
            "status": true
        }
        ```

    - **400 Bad Request**:

        ```json
        {
            "data": {
                "details": "Either review or rating must be provided.",
                "status": "error",
                "code": 400
            },
            "message": "Either review or rating must be provided.",
            "status": false
        }
        ```

        *or*

        ```json
        {
            "data": {
                "details": "Rating must be between 1.0 and 5.0.",
                "status": "error",
                "code": 400
            },
            "message": "Rating must be between 1.0 and 5.0.",
            "status": false
        }
        ```

        *or*

        ```json
        {
            "data": {
                "details": "Invalid rating value.",
                "status": "error",
                "code": 400
            },
            "message": "Invalid rating value.",
            "status": false
        }
        ```

        *or*

        ```json
        {
            "data": {
                "details": "This job has already been reviewed.",
                "status": "error",
                "code": 400
            },
            "message": "This job has already been reviewed.",
            "status": false
        }
        ```

        *or*

        ```json
        {
            "data": {
                "details": "Validation errors: field: error message",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data provided",
            "status": false
        }
        ```

    - **403 Forbidden**:

        ```json
        {
            "data": {
                "details": "No completed mechanic job found for this order item.",
                "status": "error",
                "code": 403
            },
            "message": "No completed mechanic job found for this order item.",
            "status": false
        }
        ```

    - **404 Not Found**:

        ```json
        {
            "data": {
                "details": "Order item not found or not delivered.",
                "status": "error",
                "code": 404
            },
            "message": "Order item not found or not delivered.",
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
    - **Input Requirements:** At least one of `review` or `rating` must be provided. If neither is included, a 400 Bad Request response is returned.
    - **Rating Validation:** If a rating is provided, it must be a number between 1.0 and 5.0 (inclusive). Invalid or out-of-range ratings result in a 400 Bad Request response.
    - **Customer Ownership:** The endpoint verifies that the authenticated user is the customer who placed the order (`order__customer == request.user`) and that the order item is delivered (`order_status='DELIVERED'`) and requires installation (`installation_required=True`).
    - **Job Status Check:** The associated `MechanicJob` must exist, be completed (`job_status='completed'`), and active (`is_active=True`). If no such job exists, a 403 Forbidden response is returned.
    - **Duplicate Review Prevention:** If the `MechanicJob` already has a review or rating, a 400 Bad Request response is returned to prevent multiple reviews.
    - **Transaction Safety:** Updates to the `MechanicJob` are performed within a transaction (`transaction.atomic()`) to ensure data consistency.
    - **Serialization:** The response includes only the `review` and `rating` fields from the updated `MechanicJob`, serialized using `MechanicJobSerializer`.
    - **Error Handling:** The endpoint handles cases where the input is missing or invalid (400), the order item is not found or not delivered (404), no completed job exists (403), the job is already reviewed (400), validation errors occur (400), or unexpected errors occur (500), with consistent error response formatting.

---

#### 8. [POST] `/api/mechanic/jobs/view/`

- **Description:** Retrieves a paginated list of mechanic jobs filtered by job status, payment status, mechanic email, order ID, and rating. Admins can view all active jobs, while mechanics can only view their own active jobs. The endpoint supports pagination with `limit` and `offset` parameters and returns only jobs where `is_active=True`.

- **URL**: `/api/mechanic/jobs/view/`
- **Method**: `POST`
- **Permissions**: Requires authentication (user must be either an admin or a mechanic).
- **Request Body**:

    ```json
    {
        "limit": 10,                        // Optional: Number of jobs per page (default: 10)
        "offset": 0,                        // Optional: Offset for pagination (default: 0)
        "job_status": "string",             // Optional: Job status (e.g., "pending", "in_progress", "completed", "cancelled")
        "payment_status": "string",         // Optional: Payment status (e.g., "pending", "success", "failure")
        "mechanic_email": "string",         // Optional: Mechanic's email (partial match, admin only)
        "order_id": "uuid",                 // Optional: Order ID associated with the job
        "rating": 4.0                       // Optional: Minimum rating for the job (e.g., 4.0)
    }
    ```

- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "jobs": [
                    {
                        "id": "uuid",                    // Mechanic job ID
                        "order_item": "uuid",           // Associated order item ID
                        "mechanic": "uuid",             // Assigned mechanic ID
                        "mechanic_first_name": "string", // Mechanic's first name
                        "mechanic_last_name": "string", // Mechanic's last name
                        "mechanic_email": "string",     // Mechanic's email
                        "order_id": "uuid",             // Associated order ID
                        "variant_name": "string",       // Product variant name
                        "quantity": 2,                  // Order item quantity
                        "order_status": "string",       // Order item status (e.g., "PENDING")
                        "is_accepted": true,            // Job acceptance status
                        "job_status": "string",         // Job status (e.g., "pending")
                        "payment_status": "string",     // Payment status (e.g., "pending")
                        "mechanic_fees": 100.00,        // Mechanic fees
                        "start_date": "timestamp",      // Job start date (null if not started)
                        "completion_date": "timestamp", // Job completion date (null if not completed)
                        "scheduled_date": "timestamp",  // Scheduled date (null if not set)
                        "payment_date": "timestamp",    // Payment date (null if not paid)
                        "notes": "string",              // Additional notes
                        "review": "string",             // Customer review (empty if not provided)
                        "rating": 4.5,                  // Customer rating (null if not provided)
                        "created_at": "timestamp",      // Creation timestamp
                        "last_modified_at": "timestamp",// Last modified timestamp
                        "is_active": true               // Active status
                    }
                ],
                "total_count": 50,                  // Total number of jobs matching filters
                "page_count": 5,                    // Total pages based on limit
                "current_page": 1,                  // Current page number
                "limit": 10,                        // Jobs per page
                "offset": 0,                        // Current offset
                "has_next": true,                   // Whether there is a next page
                "status": "success",
                "code": 200
            },
            "message": "Mechanic jobs retrieved successfully",
            "status": true
        }
        ```

    - **400 Bad Request**:

        ```json
        {
            "data": {
                "details": "Limit and offset values must be non-negative.",
                "status": "error",
                "code": 400
            },
            "message": "Limit and offset values must be non-negative.",
            "status": false
        }
        ```

        *or*

        ```json
        {
            "data": {
                "details": "Invalid rating value",
                "status": "error",
                "code": 400
            },
            "message": "Internal server error",
            "status": false
        }
        ```

    - **403 Forbidden**:

        ```json
        {
            "data": {
                "details": "You are not authorized to view mechanic jobs.",
                "status": "error",
                "code": 403
            },
            "message": "You are not authorized to view mechanic jobs.",
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
    - **Access Control:** Admins (`account_type='admin'`) can view all active mechanic jobs, while mechanics (`account_type='mechanic'`) are restricted to their own jobs (`mechanic=request.user`). Other account types receive a 403 Forbidden response.
    - **Filtering:** Optional filters include `job_status`, `payment_status`, `mechanic_email` (admin-only, case-insensitive partial match), `order_id`, and `rating` (minimum value). Jobs are ordered by creation date (newest first).
    - **Pagination:** The `limit` and `offset` parameters control pagination. Negative values are rejected with a 400 Bad Request response. The response includes pagination metadata: `total_count`, `page_count`, `current_page`, `limit`, `offset`, and `has_next`.
    - **Rating Validation:** If provided, the `rating` filter must be a valid float; otherwise, a 400 Bad Request response is returned.
    - **Active Jobs Only:** Only jobs with `is_active=True` are included in the results.
    - **Serialization:** Jobs are serialized using `MechanicJobSerializer`, providing detailed job information, including related order item and mechanic data.
    - **Error Handling:** The endpoint handles invalid pagination parameters (400), invalid rating values (400), unauthorized access (403), and unexpected errors (500), with consistent error response formatting.

---

#### 9. [GET] `/api/mechanic/statistics/`

- **Description:** Retrieves aggregated statistics for the authenticated mechanic, including total jobs, completed jobs, pending jobs, total payments received, total payments pending, total work amount, review count, and average rating. This endpoint is accessible only to authenticated mechanics.

- **URL**: `/api/mechanic/statistics/`
- **Method**: `GET`
- **Permissions**: Requires authentication (user must be a mechanic).

- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "total_jobs": 20,                  // Total number of jobs
                "completed_jobs": 15,              // Total number of completed jobs
                "pending_jobs": 5,                 // Total number of pending jobs
                "total_payment_received": 1500.00,  // Total payment received from completed jobs
                "total_payment_pending": 500.00,    // Total payment pending for jobs
                "total_work_amount": 2000.00,       // Total work amount (sum of all mechanic fees)
                "review_count": 10,                 // Total number of reviews received
                "average_rating": 4.5,              // Average rating based on reviews
                "jobs_last_2_hours": 2,             // Total number of jobs in the last 2 hours
                "jobs_last_12_hours": 8,            // Total number of jobs in the last 12 hours
                "jobs_last_7_days": 15,             // Total number of jobs in the last 7 days
                "jobs_last_1_month": 18,            // Total number of jobs in the last 30 days
                "status": "success",
                "code": 200
            },
            "message": "Mechanic statistics retrieved successfully.",
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
            "message": "An error occurred while retrieving mechanic statistics.",
            "status": false
        }
        ```

- **Additional Notes:**
    - **Access Control:** This endpoint is restricted to authenticated mechanics only. Unauthorized access will result in a 403 Forbidden response.
    - **Statistics Calculation:** The statistics are calculated based on the mechanic's active jobs, including counts of completed and pending jobs, total payments received and pending, and average ratings based on customer reviews.
    - **Error Handling:** The endpoint handles unexpected errors uniformly, returning a 500 Internal Server Error response with error details.

---

#### 10. [POST] `/api/admin/mechanic/users/view/`

- **Description:** Allows an authenticated admin to view and filter a paginated list of mechanic users from the admin panel. Admins can apply filters based on email, phone number, country, state, and postal code. The endpoint supports pagination using `limit` and `offset`.

- **URL:** `/api/admin/mechanic/users/view/`
- **Method:** `POST`
- **Permissions:** Requires authentication and the `IsAdminUser` permission (user must be an admin).

- **Request Body:**
  
    ```json
    {
        "limit": 10,                      // Optional: Number of results to return (default: 10)
        "offset": 0,                      // Optional: Offset from which to start listing (default: 0)
        "email": "john@example.com",      // Optional: Filter by email (partial match)
        "phone_number": "9876543210",     // Optional: Filter by phone number (partial match)
        "country": "India",               // Optional: Filter by country (partial match)
        "state": "West Bengal",           // Optional: Filter by state (partial match)
        "postal_code": "700001"           // Optional: Filter by postal code (partial match)
    }
    ```

- **Responses:**

    - **200 OK:**
  
        ```json
        {
            "data": {
                "users": [
                    {
                        "id": "uuid",
                        "email": "john@example.com",
                        "first_name": "John",
                        "last_name": "Doe",
                        "full_name": "John Doe",
                        "country_code": "+91",
                        "phone_number": "9876543210",
                        "profile_picture": "url",
                        "bio": "Experienced mechanic",
                        "date_of_birth": "1990-01-01",
                        "address": "Some address",
                        "postal_code": "700001",
                        "state": "West Bengal",
                        "country": "India",
                        "city": "Kolkata",
                        "device_token": "abc123",
                        "is_voice_alert": true,
                        "is_push_notification": true,
                        "account_type": "mechanic",
                        "date_joined": "2024-01-01T10:00:00Z",
                        "is_verified": true,
                        "is_active": true,
                        "wishlist_items": null,
                        "cart_items": null,
                        "vendor_profile": null,
                        "mechanic_profile": {
                            // Mechanic profile fields here
                        }
                    }
                    // ... more users
                ],
                "total_count": 35,
                "page_count": 4,
                "current_page": 1,
                "limit": 10,
                "offset": 0,
                "has_next": true,
                "status": "success",
                "code": 200
            },
            "message": "Mechanic users retrieved successfully.",
            "status": true
        }
        ```

    - **400 Bad Request – Invalid Limit/Offset:**

        ```json
        {
            "data": {
                "details": "Limit and offset must be non-negative integers.",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data provided.",
            "status": false
        }
        ```

    - **400 Bad Request – Invalid JSON:**

        ```json
        {
            "data": {
                "details": "Invalid JSON format",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data provided.",
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
    - **Pagination:** Controlled via `limit` and `offset` parameters to efficiently handle large datasets.
    - **Filtering:** Supports partial matching for fields like email, phone number, country, state, and postal code.
    - **Ownership & Security:** Only users with admin privileges (`IsAdminUser`) can access this endpoint.
    - **User Data:** Uses the `UserSerializer`, which includes nested fields like `mechanic_profile`, `vendor_profile`, `wishlist_items`, and `cart_items`, filtered based on the user's `account_type`.
    - **Nested Mechanic Profile:** If the user is a mechanic, their `mechanic_profile` data will be returned inline in the response.

---

#### 11. [GET] `/api/admin/mechanic/users/<uuid:user_id>/details/`

- **Description:** Retrieves detailed information for a specific mechanic user, accessible only by an authenticated admin. This endpoint is used within the admin panel to inspect a mechanic user’s full profile, including nested mechanic profile data.

- **URL:** `/api/admin/mechanic/users/<uuid:user_id>/details/`
- **Method:** `GET`
- **Permissions:** Requires authentication and the `IsAdminUser` permission (user must be an admin).

- **URL Parameters:**
  - `user_id` (UUID): The unique identifier of the mechanic user whose details are to be retrieved.

- **Response:**

    - **200 OK:**

        ```json
        {
            "data": {
                "user": {
                    "id": "uuid",
                    "email": "john@example.com",
                    "first_name": "John",
                    "last_name": "Doe",
                    "full_name": "John Doe",
                    "country_code": "+91",
                    "phone_number": "9876543210",
                    "profile_picture": "https://example.com/media/profile.jpg",
                    "bio": "Certified mechanic with 10+ years of experience",
                    "date_of_birth": "1990-01-01",
                    "address": "123 Street Name",
                    "postal_code": "700001",
                    "state": "West Bengal",
                    "country": "India",
                    "city": "Kolkata",
                    "device_token": "xyz_device_token",
                    "is_voice_alert": true,
                    "is_push_notification": true,
                    "account_type": "mechanic",
                    "date_joined": "2024-01-01T10:00:00Z",
                    "is_verified": true,
                    "is_active": true,
                    "wishlist_items": null,
                    "cart_items": null,
                    "vendor_profile": null,
                    "mechanic_profile": {
                        // All mechanic profile fields (e.g., expertise, certifications, availability, etc.)
                    }
                },
                "status": "success",
                "code": 200
            },
            "message": "Mechanic user details retrieved successfully.",
            "status": true
        }
        ```

    - **404 Not Found:**

        ```json
        {
            "data": {
                "details": "Not found.",
                "status": "error",
                "code": 404
            },
            "message": "Not Found.",
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
    - **User Validation:** The user must have an `account_type` of `"mechanic"`; otherwise, a 404 is returned.
    - **Comprehensive Data:** Includes all top-level user fields along with nested `mechanic_profile` data.
    - **Admin Only:** This endpoint is strictly restricted to admin users (`IsAdminUser`) to ensure secure access to user details.
    - **Nested Fields Logic:** The serializer automatically includes only relevant nested data (`mechanic_profile`) based on `account_type`. `wishlist_items`, `cart_items`, and `vendor_profile` are null for mechanic users.

---

#### 12. [POST] `/api/mechanic/job/<uuid:job_id>/decline/`

- **Description:** Allows an authenticated mechanic to decline a job offer. When declined, the job status is set to `"cancelled"`, the `decline_reason` is recorded, and the mechanic is removed from the associated `OrderItem`.

- **URL:** `/api/mechanic/job/<uuid:job_id>/decline/`
- **Method:** `POST`
- **Permissions:** Requires authentication and the `IsMechanic` permission (user must be a mechanic and assigned to the job).

- **URL Parameters:**
  - `job_id` (UUID): The unique identifier of the mechanic job to be declined.

- **Request Body:**

    ```json
    {
        "decline_reason": "I am currently unavailable due to personal reasons."
    }
    ```

- **Responses:**

    - **200 OK:**

        ```json
        {
            "data": {
                "job": {
                    "id": "uuid",
                    "order_item": "uuid",
                    "mechanic": "uuid",
                    "job_type": "repair",
                    "mechanic_first_name": "John",
                    "mechanic_last_name": "Doe",
                    "mechanic_email": "john@example.com",
                    "order_id": "order-uuid",
                    "variant_name": "Brake Pad",
                    "quantity": 2,
                    "order_status": "assigned",
                    "is_accepted": false,
                    "job_status": "cancelled",
                    "payment_status": "pending",
                    "mechanic_fees": 500,
                    "start_date": null,
                    "completion_date": null,
                    "scheduled_date": "2025-07-15T10:00:00Z",
                    "payment_date": null,
                    "notes": "Customer requested urgent attention",
                    "decline_reason": "I am currently unavailable due to personal reasons.",
                    "review": null,
                    "rating": null,
                    "created_at": "2025-07-10T08:30:00Z",
                    "last_modified_at": "2025-07-11T09:00:00Z",
                    "is_active": true,
                    "order_details": {
                        // Full nested order data
                    },
                    "images": [
                        {
                            "id": "uuid",
                            "image_url": "https://example.com/media/jobs/image1.jpg"
                        }
                        // ...more images
                    ]
                },
                "status": "success",
                "code": 200
            },
            "message": "Job offer has been declined successfully.",
            "status": true
        }
        ```

    - **400 Bad Request – Invalid Decline Reason / Already Cancelled:**

        ```json
        {
            "data": {
                "details": "A valid decline reason is required.",
                "status": "error",
                "code": 400
            },
            "message": "A valid decline reason is required.",
            "status": false
        }
        ```

        OR

        ```json
        {
            "data": {
                "details": "Job has already been cancelled.",
                "status": "error",
                "code": 400
            },
            "message": "Job has already been cancelled.",
            "status": false
        }
        ```

    - **403 Forbidden:**

        ```json
        {
            "data": {
                "details": "You are not authorized to decline this job.",
                "status": "error",
                "code": 403
            },
            "message": "You are not authorized to decline this job.",
            "status": false
        }
        ```

    - **404 Not Found:**

        ```json
        {
            "data": {
                "details": "Mechanic job not found or already deleted.",
                "status": "error",
                "code": 404
            },
            "message": "Mechanic job not found or already deleted.",
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
            "message": "An error occurred while declining the job.",
            "status": false
        }
        ```

- **Additional Notes:**
    - **Mechanic Verification:** The logged-in user must be the assigned mechanic for the job.
    - **Idempotency Check:** If the job has already been cancelled, the system prevents duplicate cancellations.
    - **OrderItem Cleanup:** After decline, the assigned mechanic in the related `OrderItem` is set to `null`.
    - **Decline Reason Required:** The request must contain a valid, non-empty `decline_reason` string.
    - **Serializer:** Uses `MechanicJobSerializer`, which includes:
        - Mechanic identity fields (`first_name`, `last_name`, `email`)
        - Related order info (order ID, product name, quantity)
        - Status fields (job, payment, acceptance)
        - Decline metadata (`decline_reason`)
        - Nested `order_details` using `OrderSerializer`
        - Attached job `images` using `MechanicJobImageSerializer`

---

#### 13. [POST] `/api/mechanic/job/<uuid:job_id>/start/`

- **Description:** Allows the assigned and authenticated mechanic to start a job. Once initiated, the job’s status is updated to `"in_progress"` and the `start_date` is set to the current timestamp.

- **URL:** `/api/mechanic/job/<uuid:job_id>/start/`
- **Method:** `POST`
- **Permissions:** Requires authentication and the `IsMechanic` permission (user must be the assigned mechanic).

- **URL Parameters:**
  - `job_id` (UUID): The unique identifier of the mechanic job to be started.

- **Request Body:**  
  No request body is required for this endpoint.

- **Responses:**

    - **200 OK:**

        ```json
        {
            "data": {
                "job": {
                    "id": "uuid",
                    "order_item": "uuid",
                    "mechanic": "uuid",
                    "job_type": "repair",
                    "mechanic_first_name": "John",
                    "mechanic_last_name": "Doe",
                    "mechanic_email": "john@example.com",
                    "order_id": "order-uuid",
                    "variant_name": "Brake Pad",
                    "quantity": 2,
                    "order_status": "assigned",
                    "is_accepted": true,
                    "job_status": "in_progress",
                    "payment_status": "pending",
                    "mechanic_fees": 500,
                    "start_date": "2025-07-11T10:45:00Z",
                    "completion_date": null,
                    "scheduled_date": "2025-07-15T10:00:00Z",
                    "payment_date": null,
                    "notes": "Customer requested immediate service",
                    "decline_reason": null,
                    "review": null,
                    "rating": null,
                    "created_at": "2025-07-10T09:00:00Z",
                    "last_modified_at": "2025-07-11T10:45:00Z",
                    "is_active": true,
                    "order_details": {
                        // Full nested order data from OrderSerializer
                    },
                    "images": [
                        {
                            "id": "uuid",
                            "image_url": "https://example.com/media/jobs/image1.jpg"
                        }
                        // ...more images
                    ]
                },
                "status": "success",
                "code": 200
            },
            "message": "Job started successfully and is now in progress!",
            "status": true
        }
        ```

    - **400 Bad Request – Already in Progress or Invalid Status:**

        ```json
        {
            "data": {
                "details": "Job is already in progress.",
                "status": "error",
                "code": 400
            },
            "message": "Job is already in progress.",
            "status": false
        }
        ```

        OR

        ```json
        {
            "data": {
                "details": "Job cannot be started. Current status: cancelled.",
                "status": "error",
                "code": 400
            },
            "message": "Job cannot be started. Current status: cancelled.",
            "status": false
        }
        ```

    - **403 Forbidden – Unauthorized Mechanic:**

        ```json
        {
            "data": {
                "details": "Mechanic not found or unauthorized.",
                "status": "error",
                "code": 403
            },
            "message": "Mechanic not found or unauthorized.",
            "status": false
        }
        ```

    - **404 Not Found – Job Doesn’t Exist:**

        ```json
        {
            "data": {
                "details": "Job not found or already deleted.",
                "status": "error",
                "code": 404
            },
            "message": "Job not found or already deleted.",
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
            "message": "An unexpected error occurred while starting the job.",
            "status": false
        }
        ```

- **Additional Notes:**
    - **Status Validation:** Only jobs in `"pending"` state can be started. Jobs already `"in_progress"` or in any other state will be rejected.
    - **Mechanic Restriction:** Only the mechanic assigned to the job can start it.
    - **Start Time:** On successful initiation, `start_date` is recorded using `timezone.now()`.
    - **Serializer Used:** `MechanicJobSerializer` includes:
        - Mechanic user fields (`first_name`, `last_name`, `email`)
        - Job metadata (status, timestamps, fees, notes)
        - Order and variant details (`order_id`, `variant_name`, `order_status`, etc.)
        - Nested `order_details` from `OrderSerializer`
        - Attached images via `MechanicJobImageSerializer`

---

#### 14. [POST] `/api/mechanic/job/<uuid:job_id>/upload-images/`

- **Description:** Allows an authenticated and assigned mechanic to upload a single image related to a specific mechanic job. This endpoint ensures that the job is in a valid state (`pending` or `in_progress`) and associates the uploaded image with the job record. The uploaded image is stored and marked as active.

- **URL:** `/api/mechanic/job/<uuid:job_id>/upload-images/`
- **Method:** `POST`
- **Permissions:** Requires authentication and `IsMechanic` permission. Only the assigned mechanic can upload images for the job.

- **URL Parameters:**
  - `job_id` (UUID): The unique identifier of the mechanic job for which the image is to be uploaded.

- **Request Body (multipart/form-data):**

    | Field         | Type   | Required | Description                                 |
    |---------------|--------|----------|---------------------------------------------|
    | image         | file   | Yes      | The image file to be uploaded               |
    | description   | string | No       | Optional textual description of the image   |

    **Example Multipart Form Request:**
    ```
    Content-Type: multipart/form-data

    image: <file>
    description: "Before repair - damaged parts"
    ```

- **Responses:**

    - **200 OK – Image Uploaded Successfully:**
        ```json
        {
            "data": {
                "job": {
                    "id": "uuid",
                    "order_item": "uuid",
                    "mechanic": "uuid",
                    "job_type": "repair",
                    "mechanic_first_name": "John",
                    "mechanic_last_name": "Doe",
                    "mechanic_email": "john@example.com",
                    "order_id": "order-uuid",
                    "variant_name": "Brake Pad",
                    "quantity": 2,
                    "order_status": "assigned",
                    "is_accepted": true,
                    "job_status": "in_progress",
                    "payment_status": "pending",
                    "mechanic_fees": 500,
                    "start_date": "2025-07-11T10:45:00Z",
                    "completion_date": null,
                    "scheduled_date": "2025-07-15T10:00:00Z",
                    "payment_date": null,
                    "notes": "",
                    "decline_reason": null,
                    "review": null,
                    "rating": null,
                    "created_at": "2025-07-10T09:00:00Z",
                    "last_modified_at": "2025-07-11T10:45:00Z",
                    "is_active": true,
                    "order_details": {
                        // Nested OrderSerializer output
                    },
                    "images": [
                        {
                            "id": "img-uuid",
                            "mechanic_job": "job-uuid",
                            "image": "https://example.com/media/job_images/img1.jpg",
                            "uploaded_at": "2025-07-11T10:50:00Z",
                            "description": "Before repair - damaged parts",
                            "created_at": "2025-07-11T10:50:00Z",
                            "last_modified_at": "2025-07-11T10:50:00Z",
                            "is_active": true
                        }
                    ]
                },
                "status": "success",
                "code": 200
            },
            "message": "Job image uploaded successfully",
            "status": true
        }
        ```

    - **400 Bad Request – Invalid Status or Missing Image:**
        ```json
        {
            "data": {
                "details": "Cannot upload image for a job with status completed.",
                "status": "error",
                "code": 400
            },
            "message": "Cannot upload image for a job with status completed.",
            "status": false
        }
        ```

        OR

        ```json
        {
            "data": {
                "details": "An image is required.",
                "status": "error",
                "code": 400
            },
            "message": "An image is required.",
            "status": false
        }
        ```

    - **403 Forbidden – Unauthorized Mechanic:**
        ```json
        {
            "data": {
                "details": "You are not authorized to upload images for this job.",
                "status": "error",
                "code": 403
            },
            "message": "You are not authorized to upload images for this job.",
            "status": false
        }
        ```

    - **404 Not Found – Job Not Found:**
        ```json
        {
            "data": {
                "details": "Job not found or already deleted.",
                "status": "error",
                "code": 404
            },
            "message": "Job not found or already deleted.",
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
            "message": "An unexpected error occurred while uploading the job image.",
            "status": false
        }
        ```

- **Additional Notes:**
    - **Job Status Restriction:** Image uploads are allowed only if the job status is `"pending"` or `"in_progress"`.
    - **Ownership Enforcement:** Only the mechanic assigned to the job can upload images.
    - **Atomic Operation:** The upload is wrapped in a transaction to ensure data consistency.
    - **Serializer Used:** `MechanicJobImageSerializer`
        - Fields: `id`, `mechanic_job`, `image`, `uploaded_at`, `description`, `created_at`, `last_modified_at`, `is_active`
        - All timestamp and ID fields are read-only.
    - **Returns Updated Job:** Response includes full serialized job details using `MechanicJobSerializer` including the uploaded images.

---

#### 15. [POST] `/api/mechanic/job/<uuid:job_id>/complete-with-otp/`

- **Description:** Allows the assigned and authenticated mechanic to **validate the OTP** provided by the customer and **complete the job**. On success, it updates the job status to `completed`, sets `completion_date` (and `start_date` if unset), and deducts a 10% platform fee from the mechanic's `top_up_balance`.

- **URL:** `/api/mechanic/job/<uuid:job_id>/complete-with-otp/`
- **Method:** `POST`
- **Permissions:** Requires authentication. Only the **assigned mechanic** can complete the job.
  
- **URL Parameters:**
  - `job_id` (UUID): The ID of the mechanic job to be completed.

- **Request Body (application/json):**
    | Field | Type   | Required | Description            |
    |-------|--------|----------|------------------------|
    | otp   | string | Yes      | OTP sent to customer.  |

    **Example:**
    ```json
    {
        "otp": "123456"
    }
    ```

---

- **Responses:**

    - **200 OK – Job Completed Successfully:**
        ```json
        {
            "data": {
                "job": {
                    // Serialized job data using MechanicJobSerializer
                },
                "platform_fee_deducted": 50.0,
                "new_balance": 450.0,
                "status": "success",
                "code": 200
            },
            "message": "OTP validated successfully, job marked as completed!",
            "status": true
        }
        ```

    - **400 Bad Request – Invalid OTP or Invalid Status:**
        ```json
        {
            "data": {
                "details": "Invalid OTP provided.",
                "status": "error",
                "code": 400
            },
            "message": "Invalid OTP provided.",
            "status": false
        }
        ```

        OR

        ```json
        {
            "data": {
                "details": "Job cannot be completed. Current status: cancelled.",
                "status": "error",
                "code": 400
            },
            "message": "Job cannot be completed. Current status: cancelled.",
            "status": false
        }
        ```

        OR

        ```json
        {
            "data": {
                "details": "Insufficient balance. Required: 50.0, Available: 20.0.",
                "status": "error",
                "code": 400
            },
            "message": "Insufficient balance. Required: 50.0, Available: 20.0.",
            "status": false
        }
        ```

    - **403 Forbidden – Unauthorized Mechanic:**
        ```json
        {
            "data": {
                "details": "You are not authorized to complete this job.",
                "status": "error",
                "code": 403
            },
            "message": "You are not authorized to complete this job.",
            "status": false
        }
        ```

    - **404 Not Found – Job or Profile Not Found:**
        ```json
        {
            "data": {
                "details": "Mechanic profile not found.",
                "status": "error",
                "code": 404
            },
            "message": "Mechanic profile not found.",
            "status": false
        }
        ```

    - **500 Internal Server Error:**
        ```json
        {
            "data": {
                "details": "Error details here",
                "status": "error",
                "code": 500
            },
            "message": "An unexpected error occurred while completing the job.",
            "status": false
        }
        ```

---

- **Business Logic:**
    - OTP is validated against `order_item.mechanic_otp`.
    - Job must be in `pending` or `in_progress` state.
    - If start date is not set, it will be updated to now.
    - 10% of `mechanic_fees` is deducted from `MechanicProfile.top_up_balance`.

---

- **Serializers Used:**
    - `MechanicJobSerializer`
    - `MechanicJobImageSerializer`
    - `MechanicProfileSerializer`
    - `MechanicPlatformFeeSerializer` *(for logging, not directly used here)*
    
- **MechanicJobSerializer Sample Fields:**
    ```json
    {
        "id": "job-uuid",
        "order_item": "orderitem-uuid",
        "mechanic": "user-uuid",
        "job_type": "repair",
        "job_status": "completed",
        "mechanic_fees": 500.0,
        "start_date": "2025-07-11T12:30:00Z",
        "completion_date": "2025-07-11T14:45:00Z",
        "images": [...],
        ...
    }
    ```

- **Note:** This endpoint ensures atomicity and data consistency using a transaction block. If any step fails (e.g., invalid OTP, insufficient balance), the job is not updated.

---

#### 16. [POST] `/api/mechanic/report/`

- **Description:** Allows an authenticated **mechanic** to submit textual data to the system, such as reporting issues, app preferences, or other feedback. The report is saved in the `MechanicReportApp` model.

- **URL:** `/api/mechanic/report/`
- **Method:** `POST`
- **Permissions:** Requires authentication. Only users with the `mechanic` role can submit a report.

- **Request Body (application/json):**
    | Field         | Type   | Required | Description                                                                 |
    |---------------|--------|----------|-----------------------------------------------------------------------------|
    | text_type     | string | Yes      | One of: `app_preference`, `report_issue`, `other`                          |
    | text_content  | string | Yes      | The actual content of the feedback or report                               |

    **Example:**
    ```json
    {
        "text_type": "report_issue",
        "text_content": "App crashes when clicking the job details button."
    }
    ```

- **Responses:**

    - **201 Created – Report Submitted Successfully:**
        ```json
        {
            "data": {
                "report": {
                    "id": "abc123",
                    "mechanic": 2,
                    "text_type": "report_issue",
                    "text_content": "App crashes when clicking the job details button.",
                    "created_at": "2025-07-11T13:30:00Z",
                    "last_modified_at": "2025-07-11T13:30:00Z",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Report submitted successfully.",
            "status": true
        }
        ```

    - **400 Bad Request – Missing Fields or Invalid Input:**
        ```json
        {
            "data": {
                "details": "text_type: This field is required.",
                "status": "error",
                "code": 400
            },
            "message": "Validation error occurred.",
            "status": false
        }
        ```

        OR

        ```json
        {
            "data": {
                "details": "Valid text type is required (app_preference, report_issue, or other).",
                "status": "error",
                "code": 400
            },
            "message": "Invalid text type.",
            "status": false
        }
        ```

    - **404 Not Found – Mechanic Profile Not Found:**
        ```json
        {
            "data": {
                "details": "Mechanic profile not found.",
                "status": "error",
                "code": 404
            },
            "message": "Mechanic profile not found.",
            "status": false
        }
        ```

    - **500 Internal Server Error:**
        ```json
        {
            "data": {
                "details": "Exception message here",
                "status": "error",
                "code": 500
            },
            "message": "An error occurred while submitting the report.",
            "status": false
        }
        ```

- **Business Logic:**
    - Only authenticated **mechanic** users are allowed.
    - `text_type` must be a valid choice from `MechanicReportApp.text_type` (`app_preference`, `report_issue`, `other`).
    - `text_content` must be non-empty.
    - Mechanic profile is fetched using the logged-in user.
    - Data is saved within a transaction to ensure atomicity.
  

- **Note:**
    - This endpoint provides structured error and success responses.
    - Validation is strict – missing or incorrect `text_type` or `text_content` will result in informative error responses.
    - Atomic transaction ensures data consistency on create.

---


#### 17. [POST] `/api/admin/mechanic-job/<mechanic_job_id>/update-payment/`

- **Description:** Allows an **admin user** to update the payment status of a mechanic job as successful. It sets the `payment_status` to `"success"` and updates the `payment_date`.

- **URL:** `/api/admin/mechanic-job/<uuid:mechanic_job_id>/update-payment/`
- **Method:** `POST`
- **Permissions:** Requires authentication as an **admin user**.

- **Request Body (application/json):**
    | Field         | Type     | Required | Description                          |
    |---------------|----------|----------|--------------------------------------|
    | payment_date  | string   | Yes      | Date of payment in `YYYY-MM-DD` format |

    **Example:**
    ```json
    {
        "payment_date": "2025-06-20"
    }
    ```

- **Responses:**

    - **200 OK – Payment Updated Successfully:**
        ```json
        {
            "data": {
                "mechanic_job_id": "b51ad7a6-5ae0-4efb-b781-e3cfcb7814a1",
                "payment_status": "success",
                "payment_date": "2025-06-20",
                "status": "success",
                "code": 200
            },
            "message": "Payment status updated successfully",
            "status": true
        }
        ```

    - **400 Bad Request – Missing or Invalid Payment Date:**
        ```json
        {
            "data": {
                "details": "Missing required field: payment_date",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data provided",
            "status": false
        }
        ```

        OR

        ```json
        {
            "data": {
                "details": "Enter a valid date.",
                "status": "error",
                "code": 400
            },
            "message": "Invalid payment date format",
            "status": false
        }
        ```

    - **404 Not Found – Mechanic Job Not Found:**
        ```json
        {
            "data": {
                "details": "Mechanic job not found",
                "status": "error",
                "code": 404
            },
            "message": "Invalid mechanic job ID",
            "status": false
        }
        ```

    - **500 Internal Server Error:**
        ```json
        {
            "data": {
                "details": "Exception message here",
                "status": "error",
                "code": 500
            },
            "message": "Internal server error",
            "status": false
        }
        ```

- **Business Logic:**
    - Admins must send a valid ISO date (`YYYY-MM-DD`) in `payment_date`.
    - The corresponding `MechanicJob` must exist and be active.
    - The `payment_status` field is set to `"success"`.
    - The update is persisted via `MechanicJob.save()`.

- **Notes:**
    - ValidationError from Django's model field validations (e.g., incorrect date) is caught and returned with a detailed message.
    - Uses `JsonResponse` for structured responses instead of `Response`.

---

#### 18. [POST] `/api/mechanic/fee-payment/create/`

- **Description:** Allows a **mechanic** to initiate a platform fee payment via Razorpay. A Razorpay order is created, and a `MechanicPlatformFee` record is stored in the database.

- **URL:** `/api/mechanic/fee-payment/create/`
- **Method:** `POST`
- **Permissions:** Authenticated mechanic

- **Request Body:**
    | Field       | Type    | Required | Description                       |
    |-------------|---------|----------|-----------------------------------|
    | fee_amount  | float   | Yes      | Amount to pay as platform fee     |

    **Example:**
    ```json
    {
        "fee_amount": 100.00
    }
    ```

- **Success Response – 201 Created:**
    ```json
    {
        "data": {
            "platform_fee": {
                "id": "uuid",
                "mechanic": "uuid",
                "fee_amount": "100.00",
                "payment_status": "PENDING",
                "provider_transaction_id": "order_9A33XWu170gUtm",
                ...
            },
            "razorpay_order_id": "order_9A33XWu170gUtm",
            "status": "success",
            "code": 201
        },
        "prefill": {
            "name": "John Doe",
            "email": "john@example.com",
            "contact": "9999999999",
            "amount": 100.0,
            "currency": "INR",
            "razorpay_key": "rzp_test_xxxxxx"
        },
        "message": "Platform fee payment initiated successfully",
        "status": true
    }
    ```

- **Error Responses:**
    - Invalid or missing `fee_amount`
    - Mechanic profile not found
    - Razorpay client error
    - Server error

---

#### 19. [POST] `/api/mechanic/fee-payment/callback/`

- **Description:** Handles Razorpay webhook/callback to confirm payment. Verifies Razorpay signature and updates the `MechanicPlatformFee` record. Also updates `MechanicProfile` top-up balances.

- **URL:** `/api/mechanic/fee-payment/callback/`
- **Method:** `POST`
- **Permissions:** `AllowAny` (used by Razorpay)


- **Success Response – 200 OK:**
    ```json
    {
        "data": {
            "platform_fee": {
                "id": "uuid",
                "fee_amount": "100.00",
                "payment_status": "SUCCESS",
                ...
            },
            "status": "success",
            "code": 200
        },
        "message": "Platform fee payment successful",
        "status": true
    }
    ```

- **Failure Response – Invalid Signature:**
    ```json
    {
        "data": {
            "details": "Payment verification failed.",
            "status": "error",
            "code": 400
        },
        "message": "Payment verification failed",
        "status": false
    }
    ```

- **Failure Response – Payment Error (Failure Metadata):**
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

- **Business Logic:**
    - Create a Razorpay order and record details (`provider_transaction_id`) in `MechanicPlatformFee`.
    - On callback:
        - Verify `razorpay_signature`.
        - If valid, update `payment_status` to `SUCCESS`, update `MechanicProfile.top_up_balance`.
        - If invalid, set `payment_status` to `FAILURE`.

---

#### 20. [POST] `/api/mechanic/platform-fees/view/`

- **Description:** Allows a **mechanic** to view a paginated list of their own platform fee records, filtered by `payment_status` and `is_active`.

- **URL:** `/api/mechanic/platform-fees/view/`
- **Method:** `POST`
- **Permissions:** Authenticated mechanic

- **Request Body:**
    | Field           | Type     | Required | Default | Description                                  |
    |------------------|----------|----------|---------|----------------------------------------------|
    | limit           | integer  | No       | 10      | Number of records to return                  |
    | offset          | integer  | No       | 0       | Number of records to skip                    |
    | payment_status  | string   | No       | None    | Filter by `PENDING`, `SUCCESS`, or `FAILURE` |
    | is_active       | boolean  | No       | True    | Whether to fetch only active records         |

    **Example:**
    ```json
    {
        "limit": 10,
        "offset": 0,
        "payment_status": "PENDING",
        "is_active": true
    }
    ```

- **Success Response – 200 OK:**
    ```json
    {
        "data": {
            "platform_fees": [
                {
                    "id": "uuid",
                    "mechanic": "uuid",
                    "fee_amount": "100.00",
                    "payment_status": "PENDING",
                    "provider_transaction_id": "order_xxxxx",
                    "payment_id": "",
                    "signature_id": "",
                    "is_successful": false,
                    "created_at": "2025-07-10T12:00:00Z",
                    "last_modified_at": "2025-07-10T12:00:00Z",
                    "is_active": true
                }
            ],
            "total_count": 2,
            "page_count": 1,
            "current_page": 1,
            "limit": 10,
            "offset": 0,
            "has_next": false,
            "status": "success",
            "code": 200
        },
        "message": "Platform fees retrieved successfully",
        "status": true
    }
    ```

- **Failure Responses:**
    - Missing mechanic profile
    - Invalid limit or offset
    - Unauthorized user (not a mechanic)
    - Server error

---