# MotoSpar API Documentation

MotoSpar is a Django REST Framework project that provides various APIs for the MotoSpar APP & Web Platform. This is the API Documentation for the project.


## API Documentation

### Authentication

We have implemented JWT Access Token and Refresh Token Based Authentication for this project.

To know more about authentication, please check this [link](https://bit.ly/3zCDnsN).

- This is for the APIs related to Vendor module.
- To access the protected views, include the access token in the header of all requests. Use "Authorization" as the key and "Bearer 2a9b……" as the value.
- All API endpoints except LOGIN, REGISTRATION, and FORGET PASSWORD require an access token.
- LOGIN and REGISTRATION will return an access token and a refresh token after a successful request.
- All the API url has a "api" word in it. If after the "api/" the nect word is "admin" then it is for admin only and if it has "vendor" or "customer" then they are for those roles. If theres nothing among those three then it's for all role.

## Endpoints

### 1. Add Vendor Profile

- **URL**: `/api/vendor/vendors/add/`
- **Method**: `POST`
- **Permissions**: Only authenticated users with the `IsVendor` permission.
- **Request Body**:

    ```json
    {
        "store_name": "string",
        "store_description": "string",
        "store_logo": "file",  // Optional
        "store_address": "string",
        "store_contact_email": "string",  // Optional
        "store_contact_phone": "string",
        "website_url": "string",  // Optional
        "established_date": "yyyy-mm-dd",  // Optional
        "bank_account_number": "string",
        "bank_name": "string",
        "ifsc_code": "string",
        "gst_number": "string"  // Optional for Indian vendors
    }
    ```
- **Responses**:

    - **201 Created**: 

        ```json
        {
            "data": {
                "vendor_profile": { /* VendorProfile data */ },
                "status": "success",
                "code": 201
            },
            "message": "Vendor profile added successfully",
            "status": true
        }
        ```

    - **400 Bad Request**:

        ```json
        {
            "data": {
                "details": "Field errors",
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

### 2. Edit Vendor Profile

- **URL**: `/api/vendor/vendors/<uuid:vendor_profile_id>/edit/`
- **Method**: `PATCH`
- **Permissions**: Only authenticated users with the `IsVendor` permission. User must be the owner of the profile.
- **Request Body**:

    ```json
    {
        "store_name": "string",
        "store_description": "string",
        "store_logo": "file",  // Optional
        "store_address": "string",
        "store_contact_email": "string",  // Optional
        "store_contact_phone": "string",
        "website_url": "string",  // Optional
        "established_date": "yyyy-mm-dd",  // Optional
        "bank_account_number": "string",
        "bank_name": "string",
        "ifsc_code": "string",
        "gst_number": "string"  // Optional for Indian vendors
    }
    ```
- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "vendor_profile": { /* VendorProfile data */ },
                "status": "success",
                "code": 200
            },
            "message": "Vendor profile updated successfully",
            "status": true
        }
        ```

    - **400 Bad Request**:

        ```json
        {
            "data": {
                "details": "Field errors",
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
                "details": "Permission denied",
                "status": "error",
                "code": 403
            },
            "message": "You do not have permission to edit this profile.",
            "status": false
        }
        ```

    - **404 Not Found**:

        ```json
        {
            "data": {
                "details": "Vendor profile not found",
                "status": "error",
                "code": 404
            },
            "message": "Vendor profile not found",
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

### 3. View Vendor Profiles

#### 3.1 View Specific Vendor Profile

- **URL**: `/api/vendor/vendors/<uuid:user_id>/view/`
- **Method**: `GET`
- **Permissions**: Any authenticated user.
- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "vendor": { /* VendorProfile data */ },
                "status": "success",
                "code": 200
            },
            "message": "Vendor profiles fetched successfully",
            "status": true
        }
        ```

    - **404 Not Found**:

        ```json
        {
            "data": {
                "details": "Vendor profile not found",
                "status": "error",
                "code": 404
            },
            "message": "Vendor profile not found",
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

#### 3.2 View All Vendor Profiles (Admin Only)

- **URL**: `/api/admin/vendors/view/`
- **Method**: `POST`
- **Permissions**: Only authenticated users with the `IsAdminUser` permission.
- **Request Body**:

    ```json
    {
        "limit": 10,
        "offset": 0
    }
    ```
- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "vendor_profiles": [ /* Array of VendorProfile data */ ],
                "total_count": 100,  // Total number of vendor profiles
                "page_count": 10,    // Total number of pages
                "current_page": 1,   // Current page number
                "limit": 10,         // Number of items per page
                "offset": 0,         // Current offset
                "has_next": true,    // Whether there is a next page
                "status": "success",
                "code": 200
            },
            "message": "Paginated vendor profiles fetched successfully",
            "status": true
        }
        ```

    - **400 Bad Request**:

        ```json
        {
            "data": {
                "details": "Invalid limit or offset",
                "status": "error",
                "code": 400
            },
            "message": "Invalid limit or offset",
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

### 4. Delete Vendor Profile

- **URL**: `/api/admin/vendors/<uuid:vendor_profile_id>/delete/`
- **Method**: `DELETE`
- **Permissions**: Only authenticated users with the `IsAdminUser` permission.
- **Responses**:

    - **200 OK**:

        ```json
        {
            "data": {
                "status": "success",
                "code": 200
            },
            "message": "Vendor profile deleted successfully",
            "status": true
        }
        ```

    - **404 Not Found**:

        ```json
        {
            "data": {
                "details": "Vendor profile not found",
                "status": "error",
                "code": 404
            },
            "message": "Vendor profile not found",
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

## URL Patterns

- `POST /api/vendor/vendors/add/` - Add Vendor Profile
- `PATCH /api/vendor/vendors/<uuid:vendor_profile_id>/edit/` - Edit Vendor Profile
- `GET /api/vendor/vendors/<uuid:user_id>/view/` - View Specific Vendor Profile
- `POST /api/admin/vendors/view/` - View All Vendor Profiles (Admin Only)
- `DELETE /api/admin/vendors/<uuid:vendor_profile_id>/delete/` - Delete Vendor Profile

---