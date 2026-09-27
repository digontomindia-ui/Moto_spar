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

### Endpoints


#### 1. [POST] /api/admin/categories/add/

- **Description:** Adds a new category to the system. The category name is automatically converted to lowercase before being saved. This endpoint requires authentication and admin permissions.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/admin/categories/add/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Content-Type:** multipart/form-data
    - **Request Body:**
      - **Fields:**
        - `name` (string, required): The name of the category.
        - `description` (string, optional): A description of the category.
        - `image` (file, optional): An image file associated with the category.

      - **Example Request Body:**
        
        ```plaintext
        --boundary
        Content-Disposition: form-data; name="name"

        Electronics
        --boundary
        Content-Disposition: form-data; name="description"

        Devices and gadgets
        --boundary
        Content-Disposition: form-data; name="image"; filename="image.jpg"
        Content-Type: image/jpeg

        [binary image data]
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
                "category": {
                    "id": "CATEGORY_ID",
                    "name": "electronics",
                    "description": "Devices and gadgets",
                    "image": "path/to/image.jpg",
                    "created_at": "2024-09-05T12:34:56Z",
                    "last_modified_at": "2024-09-05T12:34:56Z",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Category added successfully",
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
                    "details": "name: This field is required, image: Invalid file type",
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
    - **Name Case Handling:** The `name` field is converted to lowercase before saving to ensure case insensitivity.
    - **Soft Delete:** Categories are not permanently deleted; instead, the `is_active` field is set to `False` to implement a soft delete.
    - **File Uploads:** The `image` field accepts file uploads, which are saved to the `category_images` directory. Ensure the request uses `multipart/form-data` encoding for file uploads.

---

#### 2. [PATCH] /api/admin/categories/<uuid:category_id>/edit/

- **Description:** Updates an existing category identified by `category_id`. Allows partial updates of category fields. This endpoint requires authentication and admin permissions.

- **Request:**
    - **Method:** PATCH
    - **URL:** domain.com/api/admin/categories/<uuid:category_id>/edit/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Content-Type:** multipart/form-data (for image updates) or application/json
    - **URL Parameters:**
        - `category_id` (uuid, required): The UUID of the category to be updated.
    - **Request Body:**
      - **Fields:**
        - `name` (string, optional): The name of the category.
        - `description` (string, optional): A description of the category.
        - `image` (file, optional): An image file associated with the category. If not included, the existing image remains unchanged.

      - **Example Request Body:**
        
        ```plaintext
        --boundary
        Content-Disposition: form-data; name="name"

        Home Appliances
        --boundary
        Content-Disposition: form-data; name="description"

        Updated description for home appliances
        --boundary
        Content-Disposition: form-data; name="image"; filename="new_image.jpg"
        Content-Type: image/jpeg

        [binary image data]
        --boundary--
        ```

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "category": {
                    "id": "CATEGORY_ID",
                    "name": "home appliances",
                    "description": "Updated description for home appliances",
                    "image": "path/to/new_image.jpg",
                    "created_at": "2024-09-05T12:34:56Z",
                    "last_modified_at": "2024-09-05T12:34:56Z",
                    "is_active": true
                },
                "status": "success",
                "code": 200
            },
            "message": "Category updated successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Category Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Category not found.",
                    "status": "error",
                    "code": 404
                },
                "message": "Category not found.",
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
                    "details": "name: This field is required, image: Invalid file type",
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
    - **Name Case Handling:** The `name` field is converted to lowercase before saving to ensure consistency.
    - **Image Updates:** The `image` field can be updated using `multipart/form-data` encoding if an image is provided.
    - **Soft Delete:** Categories are not permanently deleted; instead, the `is_active` field is set to `False` to implement a soft delete.

---

#### 3. [GET] /api/categories/

- **Description:** Retrieves a list of all active categories with selected fields. This endpoint is open to all users (no authentication required).

- **Request:**
    - **Method:** GET
    - **URL:** domain.com/api/categories/
    - **Permissions:** AllowAny
    - **Authentication:** Not Required

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "categories": [
                    {
                        "id": "CATEGORY_ID_1",
                        "name": "Electronics",
                        "description": "Various electronic items",
                        "image": "path/to/image1.jpg"
                    },
                    {
                        "id": "CATEGORY_ID_2",
                        "name": "Books",
                        "description": "Wide range of books",
                        "image": "path/to/image2.jpg"
                    }
                ],
                "status": "success",
                "code": 200
            },
            "message": "Categories fetched successfully",
            "status": true
        }
        ```

    - **Error Handling:**

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

---

#### 4. [POST] /api/categories/

- **Description:** Retrieves paginated categories based on limit and offset. This endpoint is open to all users (no authentication required).

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/categories/
    - **Permissions:** AllowAny
    - **Authentication:** Not Required
    - **Content-Type:** application/json
    - **Request Body:**
      - **Fields:**
        - `limit` (integer, optional): The number of categories to return per page. Default is 10.
        - `offset` (integer, optional): The starting point from where to retrieve categories. Default is 0.

      - **Example Request Body:**
        
        ```json
        {
            "limit": 5,
            "offset": 10
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
                "categories": [
                    {
                        "id": "CATEGORY_ID_11",
                        "name": "Home Appliances",
                        "description": "Appliances for home use",
                        "image": "path/to/image11.jpg"
                    },
                    {
                        "id": "CATEGORY_ID_12",
                        "name": "Toys",
                        "description": "Fun toys for kids",
                        "image": "path/to/image12.jpg"
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
            "message": "Paginated categories fetched successfully",
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

---

#### 5. [DELETE] /api/admin/categories/<uuid:category_id>/delete/

- **Description:** Soft deletes a category by its ID. This endpoint is restricted to authenticated admin users.

- **Request:**
    - **Method:** DELETE
    - **URL:** domain.com/api/admin/categories/<uuid:category_id>/delete/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required

- **Path Parameters:**
    - `category_id` (UUID): The unique identifier of the category to be deleted.

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
            "message": "Category deleted successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Category Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Category not found.",
                    "status": "error",
                    "code": 404
                },
                "message": "Category not found",
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
    - **Soft Delete:** The category is marked as inactive (soft deleted) rather than being permanently removed from the database.

---

#### 6. [POST] /api/admin/sub-categories/add/

- **Description:** Adds a new subcategory. This endpoint is restricted to authenticated admin users.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/admin/sub-categories/add/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Body:**
        ```json
        {
            "category_id": "uuid-of-category",
            "name": "subcategory-name",
            "description": "Detailed description of the subcategory",
            "image": "base64-encoded-image-or-file-url"  // Optional
        }
        ```

- **Request Fields:**
    - `category_id` (UUID, required): The unique identifier of the parent category.
    - `name` (string, required): The name of the subcategory. It will be saved in lowercase.
    - `description` (string, optional): A description of the subcategory.
    - `image` (file, optional): An image file related to the subcategory.

- **Responses:**

    - **Success:**
        - **Code:** 201 Created
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "subcategory": {
                    "id": "uuid-of-subcategory",
                    "category": {
                        "id": "uuid-of-category",
                        "name": "category-name",
                        "description": "category-description"
                    },
                    "category_id": "uuid-of-category",
                    "name": "subcategory-name",
                    "description": "Detailed description of the subcategory",
                    "image": "url-to-image",  // If image provided
                    "created_at": "2024-01-01T00:00:00Z",
                    "last_modified_at": "2024-01-01T00:00:00Z",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "SubCategory added successfully",
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
                    "details": "name: This field is required, category_id: Invalid UUID format",
                    "status": "error",
                    "code": 400
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
                    "details": "Detailed error message here",
                    "status": "error",
                    "code": 500
                },
                "message": "An unexpected error occurred. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **Image Handling:** If an image file is included, it should be uploaded as a multipart/FORM-DATA.

---

#### 7. [PATCH] /api/admin/sub-categories/<uuid:sub_category_id>/edit/

- **Description:** Updates an existing subcategory. This endpoint is restricted to authenticated admin users.

- **Request:**
    - **Method:** PATCH
    - **URL:** domain.com/api/admin/sub-categories/<uuid:sub_category_id>/edit/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **URL Parameters:**
        - `sub_category_id` (UUID, required): The unique identifier of the subcategory to be updated.
    - **Body:**
        ```json
        {
            "name": "new-subcategory-name",              // Optional
            "description": "Updated description",       // Optional
            "image": "new-base64-encoded-image-or-file-url"  // Optional
        }
        ```

- **Request Fields:**
    - `name` (string, optional): The new name of the subcategory. It will be saved in lowercase.
    - `description` (string, optional): An updated description of the subcategory.
    - `image` (file, optional): An updated image file related to the subcategory.

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "subcategory": {
                    "id": "uuid-of-subcategory",
                    "category": {
                        "id": "uuid-of-category",
                        "name": "category-name",
                        "description": "category-description"
                    },
                    "category_id": "uuid-of-category",
                    "name": "new-subcategory-name",
                    "description": "Updated description",
                    "image": "url-to-image",  // If image provided
                    "created_at": "2024-01-01T00:00:00Z",
                    "last_modified_at": "2024-01-01T00:00:00Z",
                    "is_active": true
                },
                "status": "success",
                "code": 200
            },
            "message": "SubCategory updated successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Subcategory Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "SubCategory not found",
                    "status": "error",
                    "code": 404
                },
                "message": "SubCategory not found",
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
                    "details": "name: This field is required",
                    "status": "error",
                    "code": 400
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
                    "details": "Detailed error message here",
                    "status": "error",
                    "code": 500
                },
                "message": "An unexpected error occurred. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **Partial Updates:** The PATCH method allows for partial updates, so only the fields included in the request body will be updated.
    - **Image Handling:** If an image file is included, it should be uploaded as a multipart/FORM-DATA.

---

#### 8. [GET] /api/sub-categories/

- **Description:** Retrieves all active subcategories. This endpoint is open to all users.

- **Request:**
    - **Method:** GET
    - **URL:** domain.com/api/sub-categories/
    - **Permissions:** AllowAny
    - **Authentication:** Not Required
    - **Query Parameters:**
        - `category_id` (UUID, optional): If provided, filters the subcategories by the specified category.
    
- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "subcategories": [
                    {
                        "id": "uuid-of-subcategory",
                        "name": "subcategory-name",
                        "description": "subcategory-description",
                        "image": "url-to-image",  // If image exists
                        "category": "uuid-of-category"
                    },
                    // Additional subcategories
                ],
                "status": "success",
                "code": 200
            },
            "message": "SubCategories fetched successfully",
            "status": true
        }
        ```

    - **Error Handling:**

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

---

#### 9. [POST] /api/sub-categories/

- **Description:** Retrieves paginated subcategories. This endpoint is open to all users.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/sub-categories/
    - **Permissions:** AllowAny
    - **Authentication:** Not Required
    - **Content-Type:** application/json
    - **Body:**
        ```json
        {
            "limit": 10,      // Optional, default is 10
            "offset": 0       // Optional, default is 0
        }
        ```

- **Request Fields:**
    - `limit` (integer, optional): Number of items per page. Defaults to 10 if not provided.
    - `offset` (integer, optional): Offset for pagination. Defaults to 0 if not provided.

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "subcategories": [
                    {
                        "id": "uuid-of-subcategory",
                        "name": "subcategory-name",
                        "description": "subcategory-description",
                        "image": "url-to-image",  // If image exists
                        "category": "uuid-of-category"
                    },
                    // Additional subcategories within the limit
                ],
                "total_count": 100,    // Total number of subcategories
                "page_count": 10,      // Total number of pages
                "current_page": 1,     // Current page number
                "limit": 10,           // Number of items per page
                "offset": 0,           // Offset for the current page
                "has_next": true,      // Indicates if there is a next page
                "status": "success",
                "code": 200
            },
            "message": "Paginated subcategories fetched successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Invalid Limit/Offset:**
            - **Code:** 500 Internal Server Error
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Limit and offset must be non-negative integers",
                    "status": "error",
                    "code": 500
                },
                "message": "Internal server error",
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
    - **Pagination:** The POST method supports pagination with `limit` and `offset` parameters.
    - **Sorting:** By default, subcategories are sorted by creation date in descending order.

---

#### 10. [DELETE] /api/admin/sub-categories/<uuid:sub_category_id>/delete/

- **Description:** Soft deletes the specified active subcategory. This endpoint requires admin privileges.

- **Request:**
    - **Method:** DELETE
    - **URL:** domain.com/api/admin/sub-categories/<uuid:sub_category_id>/delete/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Path Parameters:**
        - `sub_category_id` (UUID): The ID of the subcategory to be deleted.

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
            "message": "SubCategory deleted successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Subcategory Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "SubCategory not found.",
                    "status": "error",
                    "code": 404
                },
                "message": "SubCategory not found.",
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
    - **Soft Delete:** The `delete` method sets the `is_active` field to `False` instead of physically deleting the record from the database.
    - **Permissions:** Only authenticated users with admin privileges can access this endpoint.

---

#### 11. [POST] /api/admin/products/add/

- **Description:** Adds a new product with its associated variant and images. This endpoint requires admin privileges. The request should be a JSON object containing the product fields, a nested `variant` object, and a list of image URLs.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/admin/products/add/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
        ```json
        {
            "name": "string",
            "category_id": "uuid",
            "sub_category_id": "uuid",
            "job_type": "string",
            "description": "string",
            "brand": "string",
            "model": "string",
            "year": 2024,
            "is_gst_applicable": true,
            "gst_rate": 18.0,
            "delivery_charge": 50.0,
            "delivery_time": "string",
            "driver_fees": 10.0,
            "mechanic_fees": 20.0,
            "variant": {
                "listing_price_for_vendor": 100.0,
                "cost_to_vendor": 80.0,
                "motospar_commission_from_vendor": 10.0,
                "markup_in_prices": 5.0,
                "final_listing_price_on_motospar": 115.0,
                "final_profit_per_part": 15.0,
                "discount": 5.0,
                "in_stock": true,
                "sold_quantity": 0,
                "sku": "string",
                "color": "string",
                "size": "string",
                "weight": 1.5,
                "dimensions": "string",
                "material": "string",
                "features": "string",
                "price_excluding_gst": 100.0,
                "cgst": 9.0,
                "sgst": 9.0
            },
            "images": [
                "url_string_1",
                "url_string_2"
            ]
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
                "product": {
                    "id": "uuid",
                    "name": "string",
                    "category": { ... },
                    "sub_category": { ... },
                    "job_type": "string",
                    "code": "string",
                    "description": "string",
                    "rating": "decimal",
                    "average_rating": "decimal",
                    "brand": "string",
                    "model": "string",
                    "year": 2024,
                    "is_gst_applicable": true,
                    "gst_rate": 18.0,
                    "delivery_charge": 50.0,
                    "delivery_time": "string",
                    "driver_fees": 10.0,
                    "mechanic_fees": 20.0,
                    "variants": [ ... ],
                    "created_by": "string",
                    "created_at": "datetime",
                    "last_modified_at": "datetime",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Product added successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Variant Data Required/Invalid Data Type:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Variant data must be a valid JSON object.",
                "status": false
            }
            ```

        - **SKU Already Exists:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "SKU already exists for another product variant.",
                "status": false
            }
            ```

        - **Invalid Variant Data:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "field: error message",
                    "status": "error",
                    "code": 400
                },
                "message": "There were errors with your request.",
                "status": false
            }
            ```

        - **Invalid Product Data:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "field: error message",
                    "status": "error",
                    "code": 400
                },
                "message": "There were errors with your request.",
                "status": false
            }
            ```

        - **Invalid Image Data:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": ["field: error message"],
                    "product": { ... },
                    "status": "error",
                    "code": 400
                },
                "message": "Product added but some invalid image data found",
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
    - **Transaction Handling:** The view uses `transaction.atomic()` to ensure all operations (product creation, variant addition, and image uploads) are completed successfully or none are applied.
    - **Image Upload:** The `images` field accepts a list of image URLs rather than multipart file uploads. Validation errors with image processing will not roll back the product/variant creation, but errors will be returned in the response with a 400 status.
    - **Permissions:** Only authenticated users with admin privileges can access this endpoint.

---

#### 11. [POST] /api/admin/variant/<uuid:product_id>/add/

- **Description:** Adds a new variant and associated images to an existing product specified by `product_id`. This endpoint requires admin privileges.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/admin/variant/<uuid:product_id>/add/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Content-Type:** multipart/form-data
    - **Request Body:**
        - **Variant Data (JSON):** 
          ```json
          {
              "price": "decimal",
              "discount": "decimal",
              "in_stock": "boolean",
              "sold_quantity": "integer",
              "sku": "string",
              "color": "string",
              "size": "string",
              "weight": "decimal",
              "dimensions": "string",
              "material": "string",
              "features": "string"
          }
          ```
        - **Images (Files):** 
          - Multiple image files can be uploaded with the key `images`.

- **Responses:**

    - **Success:**
        - **Code:** 201 Created
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "variant": {
                    "id": "uuid",
                    "price": "decimal",
                    "discount": "decimal",
                    "in_stock": "boolean",
                    "sold_quantity": "integer",
                    "sku": "string",
                    "color": "string",
                    "size": "string",
                    "weight": "decimal",
                    "dimensions": "string",
                    "material": "string",
                    "features": "string",
                    "product": "uuid",
                    "price_excluding_gst": 100.0,
                    "cgst": 9.0,
                    "sgst": 9.0
                },
                "status": "success",
                "code": 201
            },
            "message": "Variant and images added successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Product Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 404
                },
                "message": "Product not found.",
                "status": false
            }
            ```

        - **Variant Data Required:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Variant data is required.",
                "status": false
            }
            ```

        - **Invalid Variant Data:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "field: error message",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid variant data",
                "status": false
            }
            ```

        - **Invalid Image Data:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": ["image_field_error"],
                    "status": "error",
                    "code": 400
                },
                "message": "Variant added but some invalid image data found",
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
    - **Transaction Handling:** The view uses `transaction.atomic()` to ensure all operations (variant addition and image uploads) are completed successfully or none are applied.
    - **Image Upload:** If there are validation errors with image files, the variant will still be saved, but the response will include details of the errors encountered.
    - **Permissions:** Only authenticated users with admin privileges can access this endpoint.

---

#### 12. [PATCH] /api/admin/products/<uuid:product_id>/edit/

- **Description:** Updates the details of an existing product specified by `product_id`. This endpoint allows admins to modify product details only. To make changes to variants and images, use the designated API for variants and images.

- **Request:**
    - **Method:** PATCH
    - **URL:** domain.com/api/admin/products/<uuid:product_id>/edit/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
        - **Product Data (JSON):** 
          ```json
          {
              "name": "string",
              "category": "uuid",
              "sub_category": "uuid",
              "code": "string",
              "description": "string",
              "rating": "decimal",
              "brand": "string",
              "model": "string"
          }
          ```
        - **Note:** Only the fields included in the request body will be updated.

- **Responses:**

    - **Success:**
        - **Code:** 201 Created
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "product": {
                    "id": "uuid",
                    "name": "string",
                    "category": { ... },
                    "sub_category": { ... },
                    "code": "string",
                    "description": "string",
                    "rating": "decimal",
                    "average_rating": "decimal",
                    "brand": "string",
                    "model": "string",
                    "created_by": "string",
                    "created_at": "datetime",
                    "last_modified_at": "datetime",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Product updated successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Product Not Found or Inactive:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 404
                },
                "message": "Product not found or inactive.",
                "status": false
            }
            ```

        - **Invalid Product Data:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "field: error message",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid product data",
                "status": false
            }
            ```

        - **Method Not Allowed:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid method",
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
    - **Transaction Handling:** The view uses `transaction.atomic()` to ensure that updates are applied successfully or not at all.
    - **Permissions:** Only authenticated users with admin privileges can access this endpoint.

---

#### 13. [PATCH] /api/admin/variant/<uuid:variant_id>/edit/

- **Description:** Updates the details of an existing product variant specified by `variant_id` and allows admins to add new images for the variant. For deleting existing images, use the "delete_product_image" function.

- **Request:**
    - **Method:** PATCH
    - **URL:** domain.com/api/admin/variant/<uuid:variant_id>/edit/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Content-Type:** multipart/form-data
    - **Request Body:**
        - **Variant Data (JSON):**
          ```json
          {
              "name": "string",
              "price": "decimal",
              "stock": "integer",
              "sku": "string",
              "description": "string"
          }
          ```
        - **Images (File Uploads):**
          - Attach image files in the `images` field as part of a multi-part form data.

- **Responses:**

    - **Success:**
        - **Code:** 201 Created
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "variant": {
                    "id": "uuid",
                    "name": "string",
                    "price": "decimal",
                    "stock": "integer",
                    "sku": "string",
                    "description": "string",
                    "price_excluding_gst": 100.0,
                    "cgst": 9.0,
                    "sgst": 9.0,
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Variant and images updated successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Invalid Variant Data:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "field: error message",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid variant data",
                "status": false
            }
            ```

        - **Invalid Image Data:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": ["field: error message"],
                    "status": "error",
                    "code": 400
                },
                "message": "Variant updated but some invalid image data found",
                "status": false
            }
            ```

        - **Method Not Allowed:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid method",
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
    - **Transaction Handling:** The view uses `transaction.atomic()` to ensure that updates are applied successfully or not at all.
    - **Permissions:** Only authenticated users with admin privileges can access this endpoint.
    - **Image Handling:** Any image upload errors are logged, but the variant update will proceed.

---

#### 14. [POST] /api/products/

- **Description:** Retrieves a paginated list of all active products. Allows users to specify the `limit` and `offset` for pagination.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/products/
    - **Permissions:** AllowAny
    - **Authentication:** Not Required
    - **Content-Type:** application/json
    - **Request Body:**
      ```json
      {
          "limit": 10,
          "offset": 0
      }
      ```
      - **limit:** The maximum number of products to return (default is 10).
      - **offset:** The starting point for the product list (default is 0).

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "products": [
                    {
                        "id": "uuid",
                        "name": "string",
                        "price": "decimal",
                        "stock": "integer",
                        "sku": "string",
                        "description": "string",
                        "is_gst_applicable": true,
                        "gst_rate": 18,
                        "created_at": "datetime",
                        "is_active": true
                    },
                    ...
                ],
                "total_count": 100,
                "page_count": 10,
                "current_page": 1,
                "limit": 10,
                "offset": 0,
                "has_next": true,
                "status": "success",
                "code": 200
            },
            "message": "Products retrieved successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Invalid Limit/Offset:**
            - **Code:** 500 Internal Server Error
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Limit and offset must be non-negative.",
                    "status": "error",
                    "code": 500
                },
                "message": "An internal server error occurred",
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
    - **Pagination Calculation:** The API calculates the `page_count` and `current_page` based on the `limit` and `offset` parameters.
    - **Next Page:** The `has_next` key indicates whether there are more products available beyond the current `offset`.
    - **Error Handling:** The view includes detailed error messages for invalid `limit` and `offset` values and general server errors.

---

#### 15. [DELETE] /api/admin/products/<uuid:product_id>/delete/

- **Description:** Deletes an active product based on the provided `product_id`. Only accessible to authenticated admins.

- **Request:**
    - **Method:** DELETE
    - **URL:** domain.com/api/admin/products/<uuid:product_id>/delete/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **URL Parameters:**
        - **product_id:** UUID of the product to be deleted.

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
            "message": "Product deleted successfully",
            "status": true
        }
        ```

    - **Product Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
          
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
    - **Product Deletion:** The product is deleted permanently from the database. If the product does not exist, a 404 error is returned.
    - **Error Handling:** Includes specific messages for product not found and general server errors.

---

#### 16. [DELETE] /api/admin/product-images/<uuid:product_image_id>/delete/

- **Description:** Soft deletes a product image by setting `is_active` to `False`. Only accessible to authenticated admins.

- **Request:**
    - **Method:** DELETE
    - **URL:** domain.com/api/admin/product-images/<uuid:product_image_id>/delete/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **URL Parameters:**
        - **product_image_id:** UUID of the product image to be deleted.

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
            "message": "Product image deleted successfully",
            "status": true
        }
        ```

    - **Product Image Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Product image not found.",
                "status": "error",
                "code": 404
            },
            "message": "Product image not found.",
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
    - **Soft Deletion:** The product image is not permanently removed but rather marked as inactive by setting `is_active` to `False`.
    - **Error Handling:** Includes specific messages for product image not found and general server errors.

---

#### 17. [POST] /api/products/search/

- **Description:** Searches for products based on name, category, subcategory, and rating. Filters only active products and returns paginated results.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/products/search/
    - **Permissions:** AllowAny
    - **Authentication:** Not Required
    - **Request Body:** 
        ```json
        {
            "name": "string",              // Optional: Name of the product (case-insensitive)
            "category": "string",          // Optional: Category name of the product (case-insensitive)
            "sub_category": "string",      // Optional: Subcategory name of the product (case-insensitive)
            "rating": "number",            // Optional: Minimum rating of the product (numeric value)
            "limit": "number",             // Optional: Number of products to return per page (default is 10)
            "offset": "number"             // Optional: Number of products to skip (default is 0)
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
                "products": [                    // Array of product objects
                    {
                        "id": "uuid",              // Product ID
                        "name": "string",          // Product name
                        "category": "string",      // Product category name
                        "sub_category": "string",  // Product subcategory name
                        "rating": "number",        // Product rating
                        "in_stock": "boolean",     // Product stock availability
                        "is_gst_applicable": true,
                        "gst_rate": 18
                        // Other product fields...
                    }
                ],
                "total_count": 100,              // Total number of products matching the search criteria
                "page_count": 10,                // Total number of pages based on the limit
                "current_page": 1,               // Current page number
                "limit": 10,                     // Number of products per page
                "offset": 0,                     // Number of products skipped
                "has_next": true,                // Boolean indicating if there is a next page
                "status": "success",
                "code": 200
            },
            "message": "Paginated products retrieved successfully",
            "status": true
        }
        ```

    - **Invalid Rating Value:**
        - **Code:** 400 Bad Request
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Invalid rating value",
                "status": "error",
                "code": 400
            },
            "message": "An error occurred",
            "status": false
        }
        ```

    - **Invalid Limit/Offset:**
        - **Code:** 500 Internal Server Error
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Limit and offset must be non-negative",
                "status": "error",
                "code": 500
            },
            "message": "An error occurred",
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
    - **Filtering:** Supports filtering by product name, category, subcategory, and rating. Ratings are numeric values, and invalid values will result in a 400 Bad Request response.
    - **Pagination:** Results are paginated with configurable `limit` and `offset` parameters.
    - **Error Handling:** Includes specific messages for invalid rating values, limit/offset issues, and general server errors.

---

#### 18. [GET] /api/admin/variant/<uuid:variant_id>/toggle-stock/

- **Description:** Toggles the `in_stock` field of a product variant. Marks the variant as in stock if it is currently out of stock, and vice versa.

- **Request:**
    - **Method:** GET
    - **URL:** domain.com/api/admin/variant/<uuid:variant_id>/toggle-stock/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required (Admin users only)
    - **URL Parameters:**
        - `variant_id` (uuid): ID of the product variant to be toggled.

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "products": {                    // Product variant details
                    "id": "uuid",                // Variant ID
                    "name": "string",            // Variant name
                    "in_stock": true/false,      // Indicates if the variant is in stock
                    // Other variant fields...
                },
                "status": "success",
                "code": 200
            },
            "message": "Item has been marked as in stock!",  // Or "Item has been marked as out of stock!"
            "status": true
        }
        ```

    - **Variant Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "Product variant not found.",
                "status": "error",
                "code": 404
            },
            "message": "Product variant not found.",
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
    - **Toggle Logic:** The `in_stock` field of the variant is toggled between `true` and `false`.
    - **Error Handling:** Includes specific messages for cases where the product variant is not found and general server errors.

---

#### 19. [GET] /api/products/<uuid:product_id>/

- **Description:** Retrieves detailed information about a specific product. Only returns products that are active (`is_active=True`).

- **Request:**
    - **Method:** GET
    - **URL:** domain.com/api/products/<uuid:product_id>/
    - **Permissions:** AllowAny
    - **Authentication:** Not required
    - **URL Parameters:**
        - `product_id` (uuid): ID of the product to retrieve.

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "products": {
                    "id": "uuid",                  // Product ID
                    "name": "string",              // Product name
                    "description": "string",       // Product description
                    "price": "decimal",            // Product price
                    "category": "string",          // Product category
                    "sub_category": "string",      // Product sub-category
                    "rating": "float",             // Product rating
                    "in_stock": true/false,        // Whether the product is in stock
                    "is_gst_applicable": true,
                    "gst_rate": 18,
                    "created_at": "date-time",     // Product creation timestamp
                    "updated_at": "date-time"      // Product last updated timestamp
                    // Other product fields...
                },
                "status": "success",
                "code": 200
            },
            "message": "Product details fetched successfully",
            "status": true
        }
        ```

    - **Product Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
          
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
    - **Error Handling:** Includes specific messages for cases where the product is not found and general server errors.
    - **Data Integrity:** Only returns products that are marked as active (`is_active=True`).

---

### 20. [GET] /api/admin/products/<uuid:product_id>/toggle-active/

- **Description:** Toggles the `is_active` field of a product. Also toggles the `is_active` field for associated `ProductVariant` and `ProductImage` objects.

- **Request:**
    - **Method:** GET
    - **URL:** domain.com/api/admin/products/<uuid:product_id>/toggle-active/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **URL Parameters:**
        - `product_id` (uuid): ID of the product to toggle.

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "products": {
                    "id": "uuid",                  // Product ID
                    "name": "string",              // Product name
                    "description": "string",       // Product description
                    "price": "decimal",            // Product price
                    "category": "string",          // Product category
                    "sub_category": "string",      // Product sub-category
                    "rating": "float",             // Product rating
                    "in_stock": true/false,        // Whether the product is in stock
                    "is_active": true/false,       // Whether the product is active
                    "created_at": "date-time",     // Product creation timestamp
                    "updated_at": "date-time"      // Product last updated timestamp
                    // Other product fields...
                },
                "status": "success",
                "code": 200
            },
            "message": "Product and its images have been activated!" / "Product and its images have been deactivated!",
            "status": true
        }
        ```

    - **Product Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
          
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
    - **Error Handling:** Includes specific messages for cases where the product is not found and general server errors.
    - **Data Integrity:** Toggles the status of both the product and its associated variants and images.

---

### 21. [POST] /api/admin/products/view/

- **Description:** Retrieves a paginated list of products for the admin panel. Includes both active and inactive products.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/admin/products/view/
    - **Permissions:** IsAuthenticated, IsAdminUser
    - **Authentication:** Required
    - **Request Body:**
        - `limit` (integer): Number of products to return per page. Defaults to 10.
        - `offset` (integer): Offset for pagination. Defaults to 0.

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "products": [
                    {
                        "id": "uuid",                  // Product ID
                        "name": "string",              // Product name
                        "description": "string",       // Product description
                        "price": "decimal",            // Product price
                        "category": "string",          // Product category
                        "sub_category": "string",      // Product sub-category
                        "rating": "float",             // Product rating
                        "in_stock": true/false,        // Whether the product is in stock
                        "is_active": true/false,       // Whether the product is active
                        "created_at": "date-time",     // Product creation timestamp
                        "updated_at": "date-time"      // Product last updated timestamp
                        // Other product fields...
                    }
                    // More products...
                ],
                "total_count": 100,              // Total number of products
                "page_count": 10,                // Total number of pages
                "current_page": 1,               // Current page number
                "limit": 10,                     // Number of products per page
                "offset": 0,                     // Current offset
                "has_next": true,                // Indicates if there is a next page
                "status": "success",
                "code": 200
            },
            "message": "Products fetched successfully",
            "status": true
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
    - **Error Handling:** Includes specific messages for general server errors.
    - **Data Integrity:** Returns both active and inactive products, ordered by their `is_active` status.

---