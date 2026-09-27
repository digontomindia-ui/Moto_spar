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

1. **[POST] /api/customer/reviews/add/** - [Add a New Review](#1-post-apicustomerreviewsadd)
2. **[PATCH] /api/reviews/<uuid:review_id>/edit/** - [Edit an Existing Review](#2-patch-apireviewsuuidreview_idedit)
3. **[DELETE] /api/reviews/<uuid:review_id>/delete/** - [Delete a Review](#3-delete-apireviewsuuidreview_iddelete)
4. **[DELETE] /api/reviews/<uuid:review_id>/images/<uuid:image_id>/delete/** - [Delete a Review Image](#4-delete-apireviewsuuidreview_idimagesuuidimage_iddelete)
5. **[POST] /api/reviews/<uuid:product_id>/view/** - [View Reviews for a Product](#5-post-apireviewsuuidproduct_idview)

---

### Endpoints

#### 1. [POST] `/api/customer/reviews/add/`

- **Description:** Allows authenticated customers to add a review for a product they have purchased and received. The review can include a rating, text, and images.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/customer/reviews/add/
    - **Permissions:** IsAuthenticated, IsCustomer
    - **Authentication:** Required
    - **Content-Type:** multipart/form-data
    - **Request Body:**
      - **Fields:**
        - `product` (UUID, required): The ID of the product being reviewed.
        - `rating` (float, required): The rating given to the product, between 0.0 and 5.0.
        - `title` (string, optional): The title of the review.
        - `body` (string, required): The main content of the review.
        - `images` (array, optional): List of image files to be associated with the review.
        - `caption` (string, optional): Caption for the images (if provided).
        
      - **Example Request Body:**
    
        ```json
        {
            "product": "PRODUCT_ID",
            "rating": 4.5,
            "title": "Great product!",
            "body": "I really liked this product. It works well and is of great quality.",
            "images": [
                "image1.jpg",
                "image2.jpg"
            ],
            "caption": "Product in use"
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
                "review": {
                    "id": "REVIEW_ID",
                    "product": {
                        "id": "PRODUCT_ID",
                        "name": "Product Name"
                    },
                    "user_full_name": "John Doe",
                    "rating": 4.5,
                    "title": "Great product!",
                    "body": "I really liked this product. It works well and is of great quality.",
                    "created_at": "2024-11-15T12:34:56Z",
                    "is_active": true,
                    "images": [
                        {
                            "id": "IMAGE_ID_1",
                            "image": "image1.jpg",
                            "caption": "Product in use"
                        }
                    ]
                },
                "status": "success",
                "code": 201
            },
            "message": "Review added successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Invalid Rating:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "rating: Rating must be between 0.0 and 5.0",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid rating",
                "status": false
            }
            ```

        - **Product Not Found or Inactive:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Product not found or inactive",
                    "status": "error",
                    "code": 404
                },
                "message": "Product not found or inactive",
                "status": false
            }
            ```

        - **Already Reviewed:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "You have already reviewed this product",
                    "status": "error",
                    "code": 400
                },
                "message": "You have already reviewed this product",
                "status": false
            }
            ```

        - **Unauthorized (Not Purchased or Delivered):**
            - **Code:** 403 Forbidden
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "You can only review products you have purchased and received.",
                    "status": "error",
                    "code": 403
                },
                "message": "You can only review products you have purchased and received.",
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

#### 2. [PATCH] `/api/reviews/<uuid:review_id>/edit/`

- **Description:** Allows customers to edit an existing review they have submitted. They can update the rating, title, body, and manage associated images (add or remove images).

- **Request:**
    - **Method:** PATCH
    - **URL:** domain.com/api/reviews/<uuid:review_id>/edit/
    - **Permissions:** IsAuthenticated, IsCustomer
    - **Authentication:** Required
    - **Content-Type:** multipart/form-data
    - **Request Body:**
      - **Fields:**
        - `rating` (float, optional): The new rating for the product, between 0.0 and 5.0.
        - `title` (string, optional): The updated title of the review.
        - `body` (string, optional): The updated content of the review.
        - `images` (array, optional): New images to add to the review.
        - `images_to_delete` (array, optional): List of image IDs to be deleted from the review.
        - `caption` (string, optional): Caption for the new images.

      - **Example Request Body:**
    
        ```json
        {
            "rating": 5.0,
            "title": "Updated review title",
            "body": "Updated content of the review.",
            "images": [
                "new_image.jpg"
            ],
            "images_to_delete": ["IMAGE_ID_1"],
            "caption": "Updated product image"
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
                "review": {
                    "id": "REVIEW_ID",
                    "product": {
                        "id": "PRODUCT_ID",
                        "name": "Product Name"
                    },
                    "user_full_name": "John Doe",
                    "rating": 5.0,
                    "title": "Updated review title",
                    "body": "Updated content of the review.",
                    "created_at": "2024-11-15T12:34:56Z",
                    "is_active": true,
                    "images": [
                        {
                            "id": "IMAGE_ID_2",
                            "image": "new_image.jpg",
                            "caption": "Updated product image"
                        }
                    ]
                },
                "status": "success",
                "code": 200
            },
            "message": "Review updated successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Review Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Review not found",
                    "status": "error",
                    "code": 404
                },
                "message": "Review not found",
                "status": false
            }
            ```

        - **Invalid Rating:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "rating: Rating must be between 0.0 and 5.0",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid rating",
                "status": false
            }
            ```

        - **Image Deletion Error:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Image ID IMAGE_ID not found",
                    "status": "error",
                    "code": 400
                },
                "message": "Some images to delete were not found",
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

#### 3. [DELETE] `/api/reviews/<uuid:review_id>/delete/`

- **Description:** Allows a customer to delete their own review or an admin to delete any review. The associated images of the review will also be deleted. This endpoint requires authentication.

- **Request:**
    - **Method:** DELETE
    - **URL:** domain.com/api/reviews/<uuid:review_id>/delete/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:** None

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
            "message": "Review and associated images deleted successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Permission Denied:**
            - **Code:** 403 Forbidden
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "You do not have permission to edit this review.",
                    "status": "error",
                    "code": 403
                },
                "message": "Permission denied.",
                "status": false
            }
            ```

        - **Review Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Review not found",
                    "status": "error",
                    "code": 404
                },
                "message": "Review not found",
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
                "message": "Internal server error.",
                "status": false
            }
            ```

---

#### 4. [DELETE] `/api/reviews/<uuid:review_id>/images/<uuid:image_id>/delete/`

- **Description:** Allows a customer to delete an image associated with their own review, or an admin to delete any review image. This endpoint requires authentication.

- **Request:**
    - **Method:** DELETE
    - **URL:** domain.com/api/reviews/<uuid:review_id>/images/<uuid:image_id>/delete/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required
    - **Content-Type:** application/json
    - **Request Body:** None

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
            "message": "Image deleted successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Permission Denied:**
            - **Code:** 403 Forbidden
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "You do not have permission to delete this image.",
                    "status": "error",
                    "code": 403
                },
                "message": "Permission denied.",
                "status": false
            }
            ```

        - **Image Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Image not found or does not belong to this review.",
                    "status": "error",
                    "code": 404
                },
                "message": "Image not found.",
                "status": false
            }
            ```

        - **Review Not Found:**
            - **Code:** 404 Not Found
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Review not found",
                    "status": "error",
                    "code": 404
                },
                "message": "Review not found",
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
                "message": "Internal server error.",
                "status": false
            }
            ```

---

#### 5. [POST] `/api/reviews/<uuid:product_id>/view/`

- **Description:** Retrieves all reviews for a specific product. If the user is authenticated, it also returns whether the user has already reviewed the product via the `is_reviewed_by_user` flag.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/reviews/<uuid:product_id>/view/
    - **Permissions:** AllowAny
    - **Authentication:** Optional (authentication required for user-specific flag)
    - **Content-Type:** application/json
    - **Request Body:**
      - **Fields:**
        - `limit` (integer, optional): The number of reviews to return per page (default: 10).
        - `offset` (integer, optional): The offset for pagination (default: 0).

      - **Example Request Body:**
    
        ```json
        {
            "limit": 10,
            "offset": 0
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
                "reviews": [
                    {
                        "id": "REVIEW_ID_1",
                        "product": "PRODUCT_ID",
                        "user_full_name": "John Doe",
                        "title": "Great product",
                        "body": "I really loved this product. It works great!",
                        "rating": 4.5,
                        "created_at": "2024-10-30T12:34:56Z",
                        "last_modified_at": "2024-10-30T12:34:56Z",
                        "is_reviewed_by_user": true
                    },
                    {
                        "id": "REVIEW_ID_2",
                        "product": "PRODUCT_ID",
                        "user_full_name": "Jane Doe",
                        "title": "Not bad",
                        "body": "It’s okay, but I think there are better options.",
                        "rating": 3.0,
                        "created_at": "2024-10-29T11:25:47Z",
                        "last_modified_at": "2024-10-29T11:25:47Z",
                        "is_reviewed_by_user": false
                    }
                ],
                "total_count": 2,
                "page_count": 1,
                "current_page": 1,
                "limit": 10,
                "offset": 0,
                "has_next": false,
                "is_reviewed_by_user": true,
                "status": "success",
                "code": 200
            },
            "message": "Reviews retrieved successfully",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Invalid Limit/Offset:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Limit and offset must be non-negative",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid pagination parameters",
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
                "message": "Internal server error.",
                "status": false
            }
            ```

---