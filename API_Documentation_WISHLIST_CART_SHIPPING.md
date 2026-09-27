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

1. **[GET] /api/customer/wishlist/toggle/<uuid:variant_id>/** - [Toggle Wishlist Item](#1-get-apicustomerwishlisttoggleuuidvariant_id)
2. **[POST] /api/customer/wishlist/items/view/** - [View Wishlist Items](#2-post-apicustomerwishlistitemsview)
3. **[POST] /api/customer/cart/add/** - [Add Item to Cart](#3-post-apicustomercartadd)
4. **[PATCH] /api/customer/cart/<uuid:cart_item_id>/edit/** - [Edit Cart Item](#4-patch-apicustomercartuuidcart_item_idedit)
5. **[GET] /api/customer/cart/view/** - [View Cart](#5-get-apicustomercartview)
6. **[DELETE] /api/customer/cart/<uuid:cart_item_id>/delete/** - [Delete Cart Item](#6-delete-apicustomercartuuidcart_item_iddelete)
7. **[POST] /api/customer/shipping-address/add/** - [Add Shipping Address](#7-post-apicustomershipping-addressadd)
8. **[PATCH] /api/customer/shipping-address/<uuid:address_id>/edit/** - [Edit Shipping Address](#8-patch-apicustomershipping-addressuuidaddress_idedit)
9. **[GET] /api/customer/shipping-address/view/** - [View Shipping Address](#9-get-apicustomershipping-addressview)
10. **[DELETE] /api/customer/shipping-address/<uuid:address_id>/delete/** - [Delete Shipping Address](#10-delete-apicustomershipping-addressuuidaddress_iddelete)
11. **[POST] /api/customer/billing-address/add/** - [Add Billing Address](#11-post-apicustomerbilling-addressadd)
12. **[PATCH] /api/customer/billing-address/<uuid:address_id>/edit/** - [Edit Billing Address](#12-patch-apicustomerbilling-addressuuidaddress_idedit)
13. **[GET] /api/customer/billing-address/view/** - [View Billing Address](#13-get-apicustomerbilling-addressview)
14. **[DELETE] /api/customer/billing-address/<uuid:address_id>/delete/** - [Delete Billing Address](#14-delete-apicustomerbilling-addressuuidaddress_iddelete)

---


### Endpoints


#### 1. [GET] `/api/customer/wishlist/toggle/<uuid:variant_id>/`

- **Description:** Toggles a product variant in the customer's wishlist. If the variant is already in the wishlist, it will be removed; otherwise, it will be added. This endpoint requires the user to be authenticated as a customer.

- **Request:**
    - **Method:** GET
    - **URL:** domain.com/api/customer/wishlist/toggle/<uuid:variant_id>/
    - **Permissions:** IsAuthenticated, IsCustomer
    - **Authentication:** Required
    - **Content-Type:** application/json

- **Responses:**

    - **Success (Added to Wishlist):**
        - **Code:** 201 Created
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "wishlist_item": {
                    "id": "uuid",
                    "wishlist_id": "uuid",
                    "product": {
                        "id": "uuid",
                        "name": "string",
                        "description": "string",
                        "price": "decimal",
                        "category": "string",
                        "brand": "string"
                    },
                    "variant": {
                        "id": "uuid",
                        "price": "decimal",
                        "discount": "decimal",
                        "in_stock": "boolean",
                        "sku": "string",
                        "color": "string",
                        "size": "string"
                    },
                    "created_at": "datetime",
                    "last_modified_at": "datetime",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Wishlist item added successfully",
            "status": true
        }
        ```

    - **Success (Removed from Wishlist):**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "status": "success",
                "code": 200
            },
            "message": "Wishlist item removed successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Variant Not Found:**
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

        - **Wishlist Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Wishlist not found.",
                    "status": "error",
                    "code": 404
                },
                "message": "Wishlist not found.",
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
    - **Soft Deletion:** The wishlist items are soft-deleted by setting `is_active` to `False`, ensuring that items are not permanently removed from the database.
    - **Unique Constraint:** Each product variant can only be added once to the same wishlist, as enforced by the database constraint.
    - **Permissions:** Only customers with authenticated accounts can access this endpoint.

---

#### 2. [POST] `/api/customer/wishlist/items/view/`

- **Description:** Retrieves paginated wishlist items for the logged-in customer. This endpoint requires the user to be authenticated and have the "customer" account type.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/customer/wishlist/items/view/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
        - **limit:** (integer, optional) The number of items to return (default is 10).
        - **offset:** (integer, optional) The starting point for the items (default is 0).

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
        {
            "data": {
                "wishlist_items": [
                    {
                        "id": "uuid",
                        "wishlist_id": "uuid",
                        "product": {
                            "id": "uuid",
                            "name": "string",
                            "description": "string",
                            "price": "decimal",
                            "category": "string",
                            "brand": "string"
                        },
                        "variant": {
                            "id": "uuid",
                            "price": "decimal",
                            "discount": "decimal",
                            "in_stock": "boolean",
                            "sku": "string",
                            "color": "string",
                            "size": "string"
                        },
                        "created_at": "datetime",
                        "last_modified_at": "datetime",
                        "is_active": true
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
            "message": "Paginated wishlist items fetched successfully",
            "status": true
        }
        ```

    - **Wishlist Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "status": "error",
                "code": 404
            },
            "message": "Wishlist not found.",
            "status": false
        }
        ```

    - **Invalid Request Parameters:**
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
            "message": "Internal Server Error",
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
    - **Pagination:** Limit and offset are used to manage pagination, and the response includes details like total count, page count, and whether there's a next page.
    - **Permissions:** Only authenticated users can access this endpoint.
    - **Wishlist Handling:** The wishlist items are fetched based on the logged-in user's associated wishlist.
    - **No Next Page:** The `has_next` field indicates if there are more items to fetch beyond the current `limit`.
    
---

#### 3. [POST] `/api/customer/cart/add/`

- **Description:** Adds a product to the customer's cart or updates the quantity if the product already exists in the cart. This endpoint requires the user to be authenticated and have the "customer" account type.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/customer/cart/add/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
        - **cart:** (string, required): The UUID of the cart (automatically injected).
        - **variant:** (string, required) The UUID of the product variant.
        - **quantity:** (integer, required) The quantity of the product to add.
        - **price_at_addition:** (decimal, required) The price of the product at the time of addition.

- **Responses:**

    - **Success:**
        - **Code:** 201 Created
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "cart_item": {
                    "id": "uuid",
                    "cart_id": "uuid",
                    "product": {
                        "id": "uuid",
                        "name": "string",
                        "description": "string",
                        "price": "decimal",
                        "category": "string",
                        "brand": "string"
                    },
                    "variant_details": {
                        "id": "uuid",
                        "price": "decimal",
                        "discount": "decimal",
                        "in_stock": "boolean",
                        "sku": "string",
                        "color": "string",
                        "size": "string"
                    },
                    "quantity": 1,
                    "price_at_addition": "decimal",
                    "created_at": "datetime",
                    "last_modified_at": "datetime",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Cart item added successfully",
            "status": true
        }
        ```

    - **Invalid Data:**
        - **Code:** 400 Bad Request
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "details": "Variant: This field is required.",
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
    - **Soft Delete:** The `Cart` and `CartItem` models utilize a soft delete mechanism via the `is_active` field.
    - **Permissions:** Only authenticated users can access this endpoint. It checks for user roles using the `IsAuthenticated` and `IsCustomer` permissions.

---

#### 4. [PATCH] `/api/customer/cart/<uuid:cart_item_id>/edit/`

- **Description:** Edits the quantity or price of an existing cart item for the logged-in customer. This endpoint requires the user to be authenticated and have the "customer" account type.

- **Request:**
    - **Method:** PATCH
    - **URL:** domain.com/api/customer/cart/<uuid:cart_item_id>/edit/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
        - **quantity:** (integer, optional) The new quantity for the cart item (must be greater than zero).
        - **price_at_addition:** (decimal, optional) The price at which the item was added to the cart (if you want to update it).

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "cart_item": {
                    "id": "uuid",
                    "cart_id": "uuid",
                    "product": {
                        "id": "uuid",
                        "name": "string",
                        "description": "string",
                        "price": "decimal",
                        "category": "string",
                        "brand": "string"
                    },
                    "variant_details": {
                        "id": "uuid",
                        "price": "decimal",
                        "discount": "decimal",
                        "in_stock": "boolean",
                        "sku": "string",
                        "color": "string",
                        "size": "string"
                    },
                    "quantity": 1,
                    "price_at_addition": "decimal",
                    "created_at": "datetime",
                    "last_modified_at": "datetime",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Cart item added successfully",
            "status": true
        }
        ```

    - **Cart Item Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "details": "Cart item not found.",
                "status": "error",
                "code": 404
            },
            "message": "Cart item not found.",
            "status": false
        }
        ```

    - **Invalid Request Parameters:**
        - **Code:** 400 Bad Request
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "details": "Quantity must be greater than zero.",
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
    - **Partial Updates:** This endpoint allows for partial updates, meaning only the fields that need to be changed need to be included in the request body.
    - **Permissions:** Only authenticated users can access this endpoint, and the cart item must be active.

---

#### 5. [GET] `/api/customer/cart/view/`

- **Description:** Retrieves all active cart items for the authenticated customer. This endpoint requires the user to be authenticated and have the "customer" account type.

- **Request:**
    - **Method:** GET
    - **URL:** domain.com/api/customer/cart/view/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required
    - **Content-Type:** application/json

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "cart_items": [
                    {
                        "id": "uuid",
                        "cart": "uuid",
                        "product": "uuid",
                        "variant": "uuid",
                        "variant_details": {
                            "id": "uuid",
                            "price": "decimal",
                            "discount": "decimal",
                            "in_stock": "boolean",
                            "sku": "string",
                            "color": "string",
                            "size": "string"
                        },
                        "quantity": 2,
                        "price_at_addition": 99.99,
                        "created_at": "datetime",
                        "last_modified_at": "datetime",
                        "is_active": true
                    },
                    {
                        "id": "uuid",
                        "cart": "uuid",
                        "product": "uuid",
                        "variant": "uuid",
                        "variant_details": {
                            "id": "uuid",
                            "price": "decimal",
                            "discount": "decimal",
                            "in_stock": "boolean",
                            "sku": "string",
                            "color": "string",
                            "size": "string"
                        },
                        "quantity": 1,
                        "price_at_addition": 49.99,
                        "created_at": "datetime",
                        "last_modified_at": "datetime",
                        "is_active": true
                    }
                ],
                "status": "success",
                "code": 200
            },
            "message": "Cart items fetched successfully",
            "status": true
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
    - This endpoint retrieves only active cart items that belong to the authenticated user.
    - The response includes detailed information about each cart item, including its ID, associated cart ID, product ID, quantity, price at addition, and timestamps for creation and modification.

---

#### 6. [DELETE] `/api/customer/cart/<uuid:cart_item_id>/delete/`

- **Description:** Soft deletes a specific cart item for the authenticated customer by marking it as inactive. This endpoint requires the user to be authenticated.

- **Request:**
    - **Method:** DELETE
    - **URL:** domain.com/api/customer/cart/<uuid:cart_item_id>/delete/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required
    - **Content-Type:** application/json

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
            "message": "Cart item deleted successfully",
            "status": true
        }
        ```

    - **Cart Item Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "details": "Cart item not found.",
                "status": "error",
                "code": 404
            },
            "message": "Cart item not found.",
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
    - This endpoint performs a soft delete on the specified cart item by setting its `is_active` flag to `False`.
    - The cart item is identified by the `cart_item_id` in the URL.
    - If the specified cart item does not exist or has already been deleted, a 404 response is returned.

---

#### 7. [POST] `/api/customer/shipping-address/add/`

- **Description:** Adds a new shipping address for the authenticated customer. This endpoint requires the user to be authenticated and have the "customer" account type.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/customer/shipping-address/add/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
    ```json
    {
        "street_address": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "postal_code": "90210",
        "country": "USA",
        "phone_number": "123-456-7890",
        "alternate_phone_number": "098-765-4321",
        "latitude": "34.052235",
        "longitude": "-118.243683",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "address_type": "Home"
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
                "shipping_address": {
                    "id": "uuid",
                    "user": "user_id",
                    "name": "John Doe",
                    "email": "john.doe@example.com",
                    "address_type": "Home",
                    "street_address": "123 Main St",
                    "city": "Anytown",
                    "state": "CA",
                    "postal_code": "90210",
                    "country": "USA",
                    "phone_number": "123-456-7890",
                    "alternate_phone_number": "098-765-4321",
                    "latitude": "34.052235",
                    "longitude": "-118.243683",
                    "created_at": "2024-10-21T12:00:00Z",
                    "last_modified_at": "2024-10-21T12:00:00Z",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Shipping address added successfully",
            "status": true
        }
        ```

    - **Invalid Data:**
        - **Code:** 400 Bad Request
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "details": "street_address: This field is required.",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data provided.",
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
    - The shipping address will be associated with the authenticated user.
    - Ensure that all required fields are provided in the request body.
    - Latitude and Longitude fields are optional but should be provided if available for geolocation purposes.
---

#### 8. [PATCH] `/api/customer/shipping-address/<uuid:address_id>/edit/`

- **Description:** Edits an existing shipping address for the authenticated customer. This endpoint requires the user to be authenticated.

- **Request:**
    - **Method:** PATCH
    - **URL:** domain.com/api/customer/shipping-address/<uuid:address_id>/edit/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:**
    ```json
    {
        "street_address": "456 Elm St",
        "city": "Newtown",
        "state": "CA",
        "postal_code": "90211",
        "country": "USA",
        "phone_number": "321-654-0987",
        "alternate_phone_number": "098-765-4321",
        "latitude": "34.052235",
        "longitude": "-118.243683"
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
                "shipping_address": {
                    "id": "uuid",
                    "user": "user_id",
                    "name": "John Doe",
                    "email": "john.doe@example.com",
                    "address_type": "Home",
                    "street_address": "123 Main St",
                    "city": "Anytown",
                    "state": "CA",
                    "postal_code": "90210",
                    "country": "USA",
                    "phone_number": "123-456-7890",
                    "alternate_phone_number": "098-765-4321",
                    "latitude": "34.052235",
                    "longitude": "-118.243683",
                    "created_at": "2024-10-21T12:00:00Z",
                    "last_modified_at": "2024-10-21T12:00:00Z",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Shipping address added successfully",
            "status": true
        }
        ```

    - **Address Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "details": "Shipping address not found.",
                "status": "error",
                "code": 404
            },
            "message": "Shipping address not found.",
            "status": false
        }
        ```

    - **Invalid Data:**
        - **Code:** 400 Bad Request
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "details": "street_address: This field is required.",
                "status": "error",
                "code": 400
            },
            "message": "Invalid data provided.",
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
    - Only the fields that need to be updated should be included in the request body, as this uses a PATCH method.
    - The shipping address will be identified by the `address_id` provided in the URL.

---

#### 9. [GET] `/api/customer/shipping-address/view/`

- **Description:** Retrieves all active shipping addresses for the authenticated customer.

- **Request:**
    - **Method:** GET
    - **URL:** domain.com/api/customer/shipping-address/view/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "shipping_addresses": [
                    {
                        "id": "uuid_1",
                        "user": "user_id_1",
                        "name": "John Doe",
                        "email": "johndoe@example.com",
                        "address_type": "Home",
                        "street_address": "123 Main St",
                        "city": "Springfield",
                        "state": "IL",
                        "postal_code": "62701",
                        "country": "USA",
                        "phone_number": "123-456-7890",
                        "alternate_phone_number": "098-765-4321",
                        "latitude": "39.7817",
                        "longitude": "-89.6501",
                        "created_at": "2024-10-21T12:00:00Z",
                        "last_modified_at": "2024-10-21T12:00:00Z",
                        "is_active": true
                    },
                    {
                        "id": "uuid_2",
                        "user": "user_id_2",
                        "name": "Jane Smith",
                        "email": "janesmith@example.com",
                        "address_type": "Office",
                        "street_address": "456 Elm St",
                        "city": "Newtown",
                        "state": "CA",
                        "postal_code": "90211",
                        "country": "USA",
                        "phone_number": "321-654-0987",
                        "alternate_phone_number": null,
                        "latitude": "34.052235",
                        "longitude": "-118.243683",
                        "created_at": "2024-10-20T12:00:00Z",
                        "last_modified_at": "2024-10-20T12:00:00Z",
                        "is_active": true
                    }
                ],
                "status": "success",
                "code": 200
            },
            "message": "Shipping addresses fetched successfully",
            "status": true
        }
        ```

    - **No Addresses Found:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "shipping_addresses": [],
                "status": "success",
                "code": 200
            },
            "message": "Shipping addresses fetched successfully",
            "status": true
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
    - The response includes all active shipping addresses for the authenticated user.
    - If no addresses are found, an empty list will be returned with a success status.

---

#### 10. [DELETE] `/api/customer/shipping-address/<uuid:address_id>/delete/`

- **Description:** Deletes the specified active shipping address for the authenticated customer.

- **Request:**
    - **Method:** DELETE
    - **URL:** domain.com/api/customer/shipping-address/<address_id>/delete/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required

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
            "message": "Shipping address deleted successfully",
            "status": true
        }
        ```

    - **Shipping Address Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "details": "Shipping address not found.",
                "status": "error",
                "code": 404
            },
            "message": "Shipping address not found.",
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
    - The `address_id` parameter in the URL must be a valid UUID of an active shipping address for deletion to succeed.
    - If the shipping address does not exist or has been previously deleted, a 404 error will be returned.

---

#### 11. [POST] `/api/customer/billing-address/add/`

- **Description:** Adds a new billing address for the authenticated customer.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/customer/billing-address/add/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required
    - **Body:**
    ```json
    {
        "user": "<user_id>",
        "name": "<name>",
        "email": "<email>",
        "address_type": "<address_type>",
        "street_address": "<street_address>",
        "city": "<city>",
        "state": "<state>",
        "postal_code": "<postal_code>",
        "country": "<country>",
        "phone_number": "<phone_number>",
        "alternate_phone_number": "<alternate_phone_number>"
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
                "billing_address": {
                    "id": "<billing_address_id>",
                    "user": "<user_id>",
                    "name": "<name>",
                    "email": "<email>",
                    "address_type": "<address_type>",
                    "street_address": "<street_address>",
                    "city": "<city>",
                    "state": "<state>",
                    "postal_code": "<postal_code>",
                    "country": "<country>",
                    "phone_number": "<phone_number>",
                    "alternate_phone_number": "<alternate_phone_number>",
                    "created_at": "2024-01-01T00:00:00Z",
                    "last_modified_at": "2024-01-01T00:00:00Z",
                    "is_active": true
                },
                "status": "success",
                "code": 201
            },
            "message": "Billing address added successfully",
            "status": true
        }
        ```

    - **Invalid Data:**
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
            "message": "Invalid data provided.",
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
    - The `user` field must be a valid user ID of the authenticated customer.
    - All address fields are required for the billing address to be created successfully.
    - The `address_type` field can be either 'Home' or 'Office'.

---

#### 12. [PATCH] `/api/customer/billing-address/<uuid:address_id>/edit/`

- **Description:** Edits an existing billing address for the authenticated customer.

- **Request:**
    - **Method:** PATCH
    - **URL:** domain.com/api/customer/billing-address/<address_id>/edit/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required
    - **Path Parameters:**
        - **address_id**: UUID of the billing address to be edited.
    - **Body:**
    ```json
    {
        "name": "<name>",
        "email": "<email>",
        "address_type": "<address_type>",
        "street_address": "<street_address>",
        "city": "<city>",
        "state": "<state>",
        "postal_code": "<postal_code>",
        "country": "<country>",
        "phone_number": "<phone_number>",
        "alternate_phone_number": "<alternate_phone_number>"
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
                "billing_address": {
                    "id": "<billing_address_id>",
                    "user": "<user_id>",
                    "name": "<name>",
                    "email": "<email>",
                    "address_type": "<address_type>",
                    "street_address": "<street_address>",
                    "city": "<city>",
                    "state": "<state>",
                    "postal_code": "<postal_code>",
                    "country": "<country>",
                    "phone_number": "<phone_number>",
                    "alternate_phone_number": "<alternate_phone_number>",
                    "created_at": "2024-01-01T00:00:00Z",
                    "last_modified_at": "2024-01-01T00:00:00Z",
                    "is_active": true
                },
                "status": "success",
                "code": 200
            },
            "message": "Billing address updated successfully",
            "status": true
        }
        ```

    - **Billing Address Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "details": "Billing address not found.",
                "status": "error",
                "code": 404
            },
            "message": "Billing address not found.",
            "status": false
        }
        ```

    - **Invalid Data:**
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
            "message": "Invalid data provided.",
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
    - The `address_id` must correspond to a valid, active billing address.
    - The body fields are optional; only the fields you wish to update should be included.

---

#### 13. [GET] `/api/customer/billing-address/view/`

- **Description:** Retrieves all billing addresses for the authenticated customer.

- **Request:**
    - **Method:** GET
    - **URL:** domain.com/api/customer/billing-address/view/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "billing_addresses": [
                    {
                        "id": "<billing_address_id>",
                        "user": "<user_id>",
                        "name": "<name>",
                        "email": "<email>",
                        "address_type": "<address_type>",
                        "street_address": "<street_address>",
                        "city": "<city>",
                        "state": "<state>",
                        "postal_code": "<postal_code>",
                        "country": "<country>",
                        "phone_number": "<phone_number>",
                        "alternate_phone_number": "<alternate_phone_number>",
                        "created_at": "2024-01-01T00:00:00Z",
                        "last_modified_at": "2024-01-01T00:00:00Z",
                        "is_active": true
                    }
                ],
                "status": "success",
                "code": 200
            },
            "message": "Billing addresses fetched successfully",
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

---

#### 14. [DELETE] `/api/customer/billing-address/<uuid:address_id>/delete/`

- **Description:** Deletes a billing address for the authenticated customer.

- **Request:**
    - **Method:** DELETE
    - **URL:** domain.com/api/customer/billing-address/<address_id>/delete/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required
    - **Path Parameters:**
        - **address_id**: UUID of the billing address to be deleted.

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
            "message": "Billing address deleted successfully",
            "status": true
        }
        ```

    - **Billing Address Not Found:**
        - **Code:** 404 Not Found
        - **Content-Type:** application/json
        - **Example Response:**
        ```json
        {
            "data": {
                "details": "Billing address not found.",
                "status": "error",
                "code": 404
            },
            "message": "Billing address not found.",
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
    - The `address_id` must correspond to a valid, active billing address.

---