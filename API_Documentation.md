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

- To access the protected views, include the access token in the header of all requests. Use "Authorization" as the key and "Bearer 2a9b……" as the value.
- All API endpoints except LOGIN, REGISTRATION, and FORGET PASSWORD require an access token.
- LOGIN and REGISTRATION will return an access token and a refresh token after a successful request.
- All the API url has a "api" word in it. If after the "api/" the nect word is "admin" then it is for admin only and if it has "vendor" or "customer" then they are for those roles. If theres nothing among those three then it's for all role.

### Endpoints


#### 1. [POST] `/api/admin/register/`

- **Description:** Registers a new admin user with the provided information. This endpoint allows admins to register by submitting their details and returns relevant data, including JWT tokens upon successful registration.

- **Request:**
    - **Method:** `POST`
    - **URL:** `domain.com/api/admin/register/`
    - **Permissions:** `AllowAny` (Open to all users)
    - **Note:** As images can't be sent in JSON body, use `FORM-DATA` for file uploads.

- **Fields:**
    - `email` (string, required): User's email address (unique).
    - `first_name` (string, required): User's first name.
    - `last_name` (string, required): User's last name.
    - `country_code` (string, required): User's country code.
    - `phone_number` (string, required): User's phone number (unique).
    - `password` (string, required): User's password.
    - `confirm_password` (string, required): User's password confirmation.
    - `profile_picture` (file, optional): Image file for user's profile picture.
    - `bio` (string, optional): User's biography.
    - `date_of_birth` (string, optional): User's date of birth (YYYY-MM-DD format).
    - `address` (string, optional): User's address.
    - `postal_code` (string, optional): User's postal code.
    - `state` (string, optional): User's state.
    - `country` (string, optional): User's country.
    - `account_type` (string, optional): User's account type (choices: 'admin', 'customer', 'vendor').
    - `two_factor_enabled` (boolean, optional): Enable two-factor authentication.
    
- **Request Body:**
    - **Content-Type:** `multipart/form-data`
    - **Fields:**
        - `first_name` (string, required): The first name of the user.
        - `last_name` (string, required): The last name of the user.
        - `email` (string, required): The email of the user.
        - `country_code` (string, required): The country code of the phone number.
        - `phone_number` (string, required): The phone number of the user.
        - `password` (string, required): The password of the user.
        - `confirm_password` (string, required): The password confirmation of the user.
        - `profile_picture` (file, optional): The profile picture of the user.
        - `bio` (string, optional): The biography of the user.

- **Response:**
    - **Success:**
        - **Code:** 201 Created
        - **Example Response:**
            ```json
            {
                "data": {
                    "refresh": "some-refresh-token",
                    "access": "some-access-token",
                    "user": {
                        "email": "admin@example.com",
                        "first_name": "John",
                        "last_name": "Doe",
                        "country_code": "1",
                        "phone_number": "1234567890",
                        "account_type": "admin",
                        "status": "success",
                        "code": 201
                    }
                },
                "message": "Registration successful.",
                "status": true
            }
            ```

    - **Error:**
        - **Code:** 400 Bad Request (Email Exists)
        - **Example Response:**
            ```json
            {
                "data": {
                    "email": "admin@example.com",
                    "status": "error",
                    "code": 400
                },
                "message": "This email is already registered. Please log in.",
                "status": false
            }
            ```
        - **Code:** 400 Bad Request (Phone Number Exists)
        - **Example Response:**
            ```json
            {
                "data": {
                    "phone_number": "1234567890",
                    "country_code": "1",
                    "user": {
                        "email": "admin@example.com",
                        "first_name": "John",
                        "last_name": "Doe",
                        "account_type": "admin"
                    },
                    "status": "error",
                    "code": 400
                },
                "message": "This phone number is already registered.",
                "status": false
            }
            ```
        - **Code:** 400 Bad Request (Validation Error)
        - **Example Response:**
            ```json
            {
                "data": {
                    "details": "email: This field is required., phone_number: This field is required.",
                    "status": "error",
                    "code": 400
                },
                "message": "Validation error. Please check the input.",
                "status": false
            }
            ```
        - **Code:** 500 Internal Server Error
        - **Example Response:**
            ```json
            {
                "data": {
                    "details": "An error occurred while processing your request.",
                    "status": "error",
                    "code": 500
                },
                "message": "Something went wrong. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **Email Validation:** The email provided must be unique. If the email exists and is verified, an error message is shown.
    - **Phone Number Validation:** The combination of `phone_number` and `country_code` must be unique. If already registered, an error is returned.
    - **Two-Factor Authentication:** Optionally enable two-factor authentication for added security.
    - **JWT Tokens:** Upon successful registration, JWT access and refresh tokens are provided to authenticate the user.
    - **Transaction Atomicity:** The registration process uses `transaction.atomic` to ensure that all steps succeed or fail together.

---

#### 2. [POST] `/api/vendor/register/`

- **Description:** Registers a new vendor user with the provided information. This endpoint allows vendors to register by submitting their details and returns relevant data, including JWT tokens upon successful registration.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/vendor/register/
    - **Permissions:** AllowAny (Open to all users)
    - **Note:** As images can't be sent in JSON body, use FORM-DATA for file uploads.

- **Fields:**
    - email (string, required): User's email address (unique).
    - first_name (string, required): User's first name.
    - last_name (string, required): User's last name.
    - country_code (string, required): User's country code.
    - phone_number (string, required): User's phone number (unique).
    - password (string, required): User's password.
    - confirm_password (string, required): User's password confirmation.
    - profile_picture (file, optional): Image file for user's profile picture.
    - bio (string, optional): User's biography.
    - date_of_birth (string, optional): User's date of birth (YYYY-MM-DD format).
    - address (string, optional): User's address.
    - postal_code (string, optional): User's postal code.
    - state (string, optional): User's state.
    - country (string, optional): User's country.
    - account_type (string, optional): User's account type (choices: 'admin', 'customer', 'vendor').
    - two_factor_enabled (boolean, optional): Enable two-factor authentication.

- **Request Body:**
    - **Content-Type:** multipart/form-data
    - **Fields:**
        - first_name (string, required): The first name of the user.
        - last_name (string, required): The last name of the user.
        - email (string, required): The email of the user.
        - country_code (string, required): The country code of the phone number.
        - phone_number (string, required): The phone number of the user.
        - password (string, required): The password of the user.
        - confirm_password (string, required): The password confirmation of the user.
        - profile_picture (file, optional): The profile picture of the user.
        - bio (string, optional): The biography of the user.

**Response:**

- **Success:**
    - **Code:** 201 Created
    - **Example Response:**
    ```json
    {
        "data": {
            "refresh": "some-refresh-token",
            "access": "some-access-token",
            "user": {
                "email": "vendor@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "country_code": "1",
                "phone_number": "1234567890",
                "account_type": "vendor",
                "status": "success",
                "code": 201
            }
        },
        "message": "Registration successful.",
        "status": true
    }
    ```

- **Error:**
    - **Code:** 400 Bad Request (Email Exists)
    - **Example Response:**
    ```json
    {
        "data": {
            "email": "vendor@example.com",
            "status": "error",
            "code": 400
        },
        "message": "This email is already registered. Please log in.",
        "status": false
    }
    ```

    - **Code:** 400 Bad Request (Phone Number Exists)
    - **Example Response:**
    ```json
    {
        "data": {
            "phone_number": "1234567890",
            "country_code": "1",
            "user": {
                "email": "vendor@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "account_type": "vendor"
            },
            "status": "error",
            "code": 400
        },
        "message": "This phone number is already registered.",
        "status": false
    }
    ```

    - **Code:** 400 Bad Request (Validation Error)
    - **Example Response:**
    ```json
    {
        "data": {
            "details": "email: This field is required., phone_number: This field is required.",
            "status": "error",
            "code": 400
        },
        "message": "Validation error. Please check the input.",
        "status": false
    }
    ```

    - **Code:** 500 Internal Server Error
    - **Example Response:**
    ```json
    {
        "data": {
            "details": "An error occurred while processing your request.",
            "status": "error",
            "code": 500
        },
        "message": "Something went wrong. Please try again later.",
        "status": false
    }
    ```

- **Additional Notes:**
    - **Email Validation:** The email provided must be unique. If the email exists and is verified, an error message is shown.
    - **Phone Number Validation:** The combination of phone_number and country_code must be unique. If already registered, an error is returned.
    - **Two-Factor Authentication:** Optionally enable two-factor authentication for added security.
    - **JWT Tokens:** Upon successful registration, JWT access and refresh tokens are provided to authenticate the user.
    - **Transaction Atomicity:** The registration process uses transaction.atomic to ensure that all steps succeed or fail together.

---

#### 3. [POST] `/api/customer/register/`

- **Description:** Registers a new customer user with the provided information. This endpoint allows customers to register by submitting their details and returns relevant data, including JWT tokens upon successful registration.

- **Request:**
    - **Method:** POST
    - **URL:** `domain.com/api/customer/register/`
    - **Permissions:** AllowAny (Open to all users)
    - **Note:** As images can't be sent in JSON body, use FORM-DATA for file uploads.

- **Fields:**
    - email (string, required): User's email address (unique).
    - first_name (string, required): User's first name.
    - last_name (string, required): User's last name.
    - country_code (string, required): User's country code.
    - phone_number (string, required): User's phone number (unique).
    - password (string, required): User's password.
    - confirm_password (string, required): User's password confirmation.
    - profile_picture (file, optional): Image file for user's profile picture.
    - bio (string, optional): User's biography.
    - date_of_birth (string, optional): User's date of birth (YYYY-MM-DD format).
    - address (string, optional): User's address.
    - postal_code (string, optional): User's postal code.
    - state (string, optional): User's state.
    - country (string, optional): User's country.
    - account_type (string, optional): User's account type (choices: 'admin', 'customer', 'vendor').
    - two_factor_enabled (boolean, optional): Enable two-factor authentication.

- **Request Body:**
    - **Content-Type:** multipart/form-data
    - **Fields:**
        - first_name (string, required): The first name of the user.
        - last_name (string, required): The last name of the user.
        - email (string, required): The email of the user.
        - country_code (string, required): The country code of the phone number.
        - phone_number (string, required): The phone number of the user.
        - password (string, required): The password of the user.
        - confirm_password (string, required): The password confirmation of the user.
        - profile_picture (file, optional): The profile picture of the user.
        - bio (string, optional): The biography of the user.

- **Response:**
- **Success:**
    - **Code:** 201 Created
    - **Example Response:**
        ```json
        {
            "data": {
                "refresh": "some-refresh-token",
                "access": "some-access-token",
                "user": {
                    "email": "customer@example.com",
                    "first_name": "Jane",
                    "last_name": "Doe",
                    "country_code": "1",
                    "phone_number": "0987654321",
                    "account_type": "customer",
                    "status": "success",
                    "code": 201
                }
            },
            "message": "Registration successful.",
            "status": true
        }
        ```

- **Error:**
    - **Code:** 400 Bad Request (Email Exists)
    - **Example Response:**
        ```json
        {
            "data": {
                "email": "customer@example.com",
                "status": "error",
                "code": 400
            },
            "message": "This email is already registered. Please log in.",
            "status": false
        }
        ```

    - **Code:** 400 Bad Request (Phone Number Exists)
    - **Example Response:**
        ```json
        {
            "data": {
                "phone_number": "0987654321",
                "country_code": "1",
                "user": {
                    "email": "customer@example.com",
                    "first_name": "Jane",
                    "last_name": "Doe",
                    "account_type": "customer"
                },
                "status": "error",
                "code": 400
            },
            "message": "This phone number is already registered.",
            "status": false
        }
        ```

    - **Code:** 400 Bad Request (Validation Error)
    - **Example Response:**
        ```json
        {
            "data": {
                "details": "email: This field is required., phone_number: This field is required.",
                "status": "error",
                "code": 400
            },
            "message": "Validation error. Please check the input.",
            "status": false
        }
        ```

  - **Code:** 500 Internal Server Error
    - **Example Response:**
    ```json
    {
        "data": {
            "details": "An error occurred while processing your request.",
            "status": "error",
            "code": 500
        },
        "message": "Something went wrong. Please try again later.",
        "status": false
    }
    ```

- **Additional Notes:**
    - **Email Validation:** The email provided must be unique. If the email exists and is verified, an error message is shown.
    - **Phone Number Validation:** The combination of phone_number and country_code must be unique. If already registered, an error is returned.
    - **Two-Factor Authentication:** Optionally enable two-factor authentication for added security.
    - **JWT Tokens:** Upon successful registration, JWT access and refresh tokens are provided to authenticate the user.
    - **Transaction Atomicity:** The registration process uses transaction.atomic to ensure that all steps succeed or fail together.

---

#### 4. [GET] [PUT] [PATCH] [DELETE] `/api/two-factor-auth/`

- **Description:** Manages the multi-factor authentication (MFA) settings for a user. This endpoint allows users to view their current MFA settings, create or update MFA configurations, and delete existing MFA records.

- **Request:**
    - **Method:** GET, PUT, PATCH, DELETE
    - **URL:** `domain.com/api/two-factor-auth/`
    - **Permissions:** IsAuthenticated (Requires user to be logged in)

- **Fields:**
- **GET Request:**
  - **method_choices (array of strings):** Available MFA methods based on the user's details (e.g., 'SMS', 'Email', 'App-based').

- **PUT Request:**
  - **method (string, required):** The MFA method to be set ('SMS', 'Email', 'App-based').
  - **verification_code (string, optional):** The verification code if the method is 'App-based'.

- **PATCH Request:**
  - **method (string, required):** The MFA method to be updated ('SMS', 'Email', 'App-based').
  - **verification_code (string, optional):** The verification code if the method is 'App-based'.

- **DELETE Request:**
  - No additional fields required.

-**Request Body:**
    - **Content-Type:** application/json
    - **Fields:**
    - **PUT/PATCH Request:**
        - **method (string, required):** The MFA method to be set or updated.
        - **verification_code (string, optional):** The verification code if applicable.

-**Response:**
    - **Success:**
    - **GET Request:**
        - **Code:** 200 OK
        - **Example Response:**
        ```json
        {
            "data": {
                "has_data": true,
                "method": "Email",
                "method_choices": ["SMS", "Email", "App-based"],
                "status": "success",
                "code": 200
            },
            "message": "User has two factor auth enabled!",
            "status": true
        }
        ```
    
  - **PUT Request:**
    - **Code:** 201 Created
    - **Example Response:**
      ```json
      {
          "data": {
              "has_data": true,
              "user_details": {
                  "id": "uuid",
                  "user": "user_id",
                  "method": "App-based",
                  "verification_code": "123456",
                  "expiration_time": null,
                  "created_at": "timestamp",
                  "last_modified_at": "timestamp",
                  "is_active": true
              },
              "status": "success",
              "code": 201
          },
          "message": "User data created successfully.",
          "status": true
      }
      ```
  
  - **PATCH Request:**
    - **Code:** 200 OK
    - **Example Response:**
      ```json
      {
          "data": {
              "has_data": true,
              "user_details": {
                  "id": "uuid",
                  "user": "user_id",
                  "method": "SMS",
                  "verification_code": null,
                  "expiration_time": null,
                  "created_at": "timestamp",
                  "last_modified_at": "timestamp",
                  "is_active": true
              },
              "status": "success",
              "code": 200
          },
          "message": "User data updated successfully.",
          "status": true
      }
      ```

  - **DELETE Request:**
    - **Code:** 200 OK
    - **Example Response:**
      ```json
      {
          "data": {
              "status": "success",
              "code": 200
          },
          "message": "User data deleted successfully.",
          "status": true
      }
      ```

- **Error:**
  - **PUT Request - User Already Has Data:**
    - **Code:** 400 Bad Request
    - **Example Response:**
      ```json
      {
          "data": {
              "status": "error",
              "code": 400
          },
          "message": "User already has data. Use PATCH method for updates.",
          "status": false
      }
      ```

  - **PUT/PATCH Request - Invalid Method or Code:**
    - **Code:** 400 Bad Request
    - **Example Response:**
      ```json
      {
          "data": {
              "status": "error",
              "code": 400
          },
          "message": "Invalid method choice or verification code.",
          "status": false
      }
      ```

  - **PATCH Request - No Data:**
    - **Code:** 400 Bad Request
    - **Example Response:**
      ```json
      {
          "data": {
              "status": "error",
              "code": 400
          },
          "message": "User does not have data. Use PUT method to create a new one.",
          "status": false
      }
      ```

  - **DELETE Request - No Data to Delete:**
    - **Code:** 404 Not Found
    - **Example Response:**
      ```json
      {
          "data": {
              "status": "error",
              "code": 404
          },
          "message": "User does not have data to delete.",
          "status": false
      }
      ```

  - **Server Errors:**
    - **Code:** 500 Internal Server Error
    - **Example Response:**
      ```json
      {
          "data": {
              "details": "An error occurred while processing your request.",
              "status": "error",
              "code": 500
          },
          "message": "Something went wrong. Please try again later.",
          "status": false
      }
      ```

- **Additional Notes:**
    - **Method Choices:** The available MFA methods include 'SMS', 'Email', and 'App-based'. The choices presented may vary based on user details (e.g., the absence of a phone number excludes 'SMS').
    - **Verification Code:** For 'App-based' method, a 6-digit verification code is expected. It must be validated and correctly formatted.
    - **Status Handling:** The `is_active` field determines if MFA is currently active for the user.
    - **Exceptions Handling:** The view handles various exceptions to ensure graceful error reporting and user feedback.
    - **Atomic Operations:** Operations are handled with proper exception management to ensure consistency and reliability.

---

#### 5. [POST] `/api/login-via-email/`

- **Description:** Logs in a user via email and password. If the user has two-factor authentication enabled, the method of verification is determined, and an appropriate response is provided. If the user does not have two-factor authentication, JWT tokens are issued.

- **Request:**
    - **Method:** `POST`
    - **URL:** `domain.com/api/login-via-email/`
    - **Permissions:** `AllowAny` (No authentication required for this endpoint)

- **Fields:**
    - `email` (string, required): The email address of the user trying to log in.
    - `password` (string, required): The password associated with the user's email.

- **Request Body:**
    - **Content-Type:** `application/json`
    - **Example Request:**
      ```json
      {
          "email": "user@example.com",
          "password": "userpassword"
      }
      ```

- **Response:**
    - **Success:**
        - **Code:** 200 OK
        - **Example Response (No Two-Factor Authentication):**
          ```json
          {
              "data": {
                  "refresh": "some-refresh-token",
                  "access": "some-access-token",
                  "user": {
                      "id": "uuid",
                      "full_name": "John Doe",
                      "first_name": "John",
                      "last_name": "Doe",
                      "email": "user@example.com",
                      "country_code": "91",
                      "phone_number": "1234567890",
                      "profile_picture": "profile_pic_url",
                      "bio": "User bio",
                      "date_of_birth": "1990-01-01",
                      "address": "User address",
                      "postal_code": "123456",
                      "state": "User state",
                      "country": "User country",
                      "account_type": "customer",
                      "two_factor_enabled": true,
                      "wishlist_items": "wishlist_data",
                      "cart_items": "cart_data",
                      "is_verified": true,
                      "is_active": true
                  },
                  "status": "success",
                  "code": 200
              },
              "message": "Login successful!",
              "status": true
          }
          ```
        - **Example Response (With Two-Factor Authentication):**
          ```json
          {
              "data": {
                  "has_data": true,
                  "method": "SMS",  // or "Email" or "App-based"
                  "status": "success",
                  "code": 200
              },
              "message": "Enter your verification code.",
              "status": true
          }
          ```

    - **Error:**
        - **Code:** 400 Bad Request (Email or Password Missing)
        - **Example Response:**
          ```json
          {
              "data": {
                  "status": "error",
                  "code": 400
              },
              "message": "Email and password are required",
              "status": false
          }
          ```

        - **Code:** 401 Unauthorized (Invalid Credentials)
        - **Example Response:**
          ```json
          {
              "data": {
                  "status": "error",
                  "code": 401
              },
              "message": "Invalid email or password",
              "status": false
          }
          ```

        - **Code:** 405 Method Not Allowed
        - **Example Response:**
          ```json
          {
              "data": {
                  "status": "error",
                  "code": 405
              },
              "message": "Method not allowed",
              "status": false
          }
          ```

        - **Code:** 500 Internal Server Error
        - **Example Response:**
          ```json
          {
              "data": {
                  "details": "An error occurred while processing your request.",
                  "status": "error",
                  "code": 500
              },
              "message": "Something went wrong. Please try again later.",
              "status": false
          }
          ```

- **Additional Notes:**
    - **Two-Factor Authentication:** If the user has two-factor authentication enabled, the method of verification will determine the response. The methods include SMS, Email, or App-based.
    - **JWT Tokens:** If the user does not have two-factor authentication enabled, JWT tokens are issued for authenticated access.
    - **Error Handling:** The view provides uniform error handling for various exceptions, including missing fields and incorrect credentials.

---

#### 6. [POST] /api/verify-two-factor-auth/

- **Description:** Verifies the user's two-factor authentication (2FA) via email by checking the provided verification code. If successful, it logs the user in and returns authentication tokens.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/verify-two-factor-auth/
    - **Permissions:** AllowAny (No authentication required for this endpoint)

- **Fields:**
    - email (string, required): The email address of the user for 2FA verification.
    - verification_code (string, required): The verification code sent to the user.

- **Request Body:**
    - **Content-Type:** application/json
    - **Example Request:**
      
    ```json
    {
        "email": "user@example.com",
        "verification_code": "123456"
    }
    ```

- **Response:**
    - **Success:**
        - **Code:** 200 OK
        - **Example Response:**
          
        ```json
        {
            "data": {
                "refresh": "refresh-token",
                "access": "access-token",
                "user": {
                    "id": "user-id",
                    "full_name": "John Doe",
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "user@example.com",
                    "country_code": "91",
                    "phone_number": "1234567890",
                    "profile_picture": null,
                    "bio": "",
                    "date_of_birth": null,
                    "address": "",
                    "postal_code": "",
                    "state": "",
                    "country": "",
                    "account_type": "customer",
                    "two_factor_enabled": true,
                    "wishlist_items": [],
                    "cart_items": [],
                    "is_verified": true,
                    "is_active": true
                },
                "status": "success",
                "code": 200
            },
            "message": "Login successful!",
            "status": true
        }
        ```

    - **Error:**
        - **Code:** 400 Bad Request (Email or Verification Code Missing)
        - **Example Response:**
          
        ```json
        {
            "data": {
                "status": "error",
                "code": 400
            },
            "message": "Email and verification code are required",
            "status": false
        }
        ```

        - **Code:** 404 Not Found (User or 2FA Instance Not Found)
        - **Example Response:**
          
        ```json
        {
            "data": {
                "status": "error",
                "code": 404
            },
            "message": "MultiFactorAuthentication instance not found",
            "status": false
        }
        ```

        - **Code:** 401 Unauthorized (Invalid or Expired Verification Code)
        - **Example Response:**
          
        ```json
        {
            "data": {
                "status": "error",
                "code": 401
            },
            "message": "Invalid verification code or code has expired. Resend Code",
            "status": false
        }
        ```

        - **Code:** 500 Internal Server Error
        - **Example Response:**
          
        ```json
        {
            "data": {
                "details": "An error occurred while processing your request.",
                "status": "error",
                "code": 500
            },
            "message": "Something went wrong. Please try again later.",
            "status": false
        }
        ```

- **Additional Notes:**
    - **Two-Factor Authentication Verification:** The verification code must match and be valid within the expiration time for the login to succeed.
    - **Token Issuance:** On successful verification, new refresh and access tokens are issued for the authenticated user.
    - **Exception Handling:** Any uncaught exceptions are handled uniformly, providing a 500 Internal Server Error response with a relevant error message.

---

#### 7. [POST] /api/resend-two-factor-auth-otp/

- **Description:** Resends a two-factor authentication (2FA) OTP to the user's phone or email if the existing token has expired or is not available.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/resend-two-factor-auth-otp/
    - **Permissions:** AllowAny (No authentication required)

- **Request Body:**
    - **Content-Type:** application/json
    - **Fields:**
        - `email` (string, required): The email address of the user for whom the 2FA OTP needs to be resent.
    - **Example Request:**
      
    ```json
    {
        "email": "user@example.com"
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
                "status": "success",
                "code": 200
            },
            "message": "A new OTP has been sent to your email.",
            "status": true
        }
        ```

    - **Error:**
        - **Code:** 400 Bad Request (Email Required)
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Email is required.",
                "status": false
            }
            ```

        - **Code:** 404 Not Found (User Not Found)
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 404
                },
                "message": "User with this email does not exist.",
                "status": false
            }
            ```

        - **Code:** 404 Not Found (2FA Instance Not Found)
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 404
                },
                "message": "MultiFactorAuthentication instance not found.",
                "status": false
            }
            ```

        - **Code:** 500 Internal Server Error
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "An error occurred while processing your request.",
                    "status": "error",
                    "code": 500
                },
                "message": "Something went wrong. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **OTP Resending:** The OTP is generated and sent to the user via SMS or email based on the configured method in the `TwoFactorAuth` instance. The OTP is valid for 10 minutes.
    - **Error Handling:** Proper error messages and status codes are returned for various failure scenarios, including missing email, non-existent user, and unavailable 2FA instance.
    - **Method Checking:** The endpoint only processes POST requests. Any other request methods will result in a 400 Bad Request response.

---

#### 8. [POST] /api/send-otp/login-via-number/

- **Description:** Sends a One-Time Password (OTP) to the user's phone number for sign-in. This endpoint can be used for both initial OTP requests and resending OTPs.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/send-otp/login-via-number/
    - **Permissions:** AllowAny (No authentication required)

- **Request Body:**
    - **Content-Type:** application/json
    - **Fields:**
        - `country_code` (string, required): The country code of the user's phone number (e.g., "1" for the USA).
        - `phone_number` (string, required): The phone number of the user.
    - **Example Request:**
      
    ```json
    {
        "country_code": "1",
        "phone_number": "1234567890"
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
                "status": "success",
                "code": 200
            },
            "message": "OTP has been sent to your phone number.",
            "status": true
        }
        ```

    - **Error:**
        - **Code:** 400 Bad Request (Country Code and Phone Number Required)
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Country code and phone number are required.",
                "status": false
            }
            ```

        - **Code:** 404 Not Found (User Not Found)
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 404
                },
                "message": "User with this phone number does not exist.",
                "status": false
            }
            ```

        - **Code:** 500 Internal Server Error
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "An error occurred while processing your request.",
                    "status": "error",
                    "code": 500
                },
                "message": "Something went wrong. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **OTP Generation:** The OTP is generated and sent via SMS to the phone number provided. The OTP is valid for 10 minutes.
    - **Error Handling:** Proper error messages and status codes are returned for various failure scenarios, including missing parameters and non-existent users.
    - **Method Checking:** The endpoint only processes POST requests. Any other request methods will result in a 400 Bad Request response.

---

#### [POST] 9. /api/login-via-number/

- **Description:** Verifies the OTP sent to the user's phone number and returns an access token for successful sign-in.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/login-via-number/
    - **Permissions:** AllowAny (No authentication required)

- **Request Body:**
    - **Content-Type:** application/json
    - **Fields:**
        - `country_code` (string, required): The country code of the user's phone number (e.g., "1" for the USA).
        - `phone_number` (string, required): The phone number of the user.
        - `verification_code` (string, required): The OTP received by the user.
    - **Example Request:**
      
    ```json
    {
        "country_code": "1",
        "phone_number": "1234567890",
        "verification_code": "123456"
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
                "refresh": "refresh_token_value",
                "access": "access_token_value",
                "user": {
                    "id": 1,
                    "username": "user@example.com",
                    "email": "user@example.com",
                    "first_name": "John",
                    "last_name": "Doe"
                },
                "status": "success",
                "code": 200
            },
            "message": "Login successful.",
            "status": true
        }
        ```

    - **Error:**
        - **Code:** 400 Bad Request (Country Code, Phone Number, and Verification Code Required)
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Country code, phone number and verification code are required.",
                "status": false
            }
            ```

        - **Code:** 404 Not Found (User Not Found)
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 404
                },
                "message": "User with this phone number does not exist.",
                "status": false
            }
            ```

        - **Code:** 401 Unauthorized (Verification Code Expired or Invalid)
            - **Content-Type:** application/json
            - **Example Response (Code Expired):**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 401
                },
                "message": "Verification code has expired. Resend Code",
                "status": false
            }
            ```
            - **Example Response (Invalid Code):**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 401
                },
                "message": "Invalid verification code.",
                "status": false
            }
            ```

        - **Code:** 405 Method Not Allowed
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 405
                },
                "message": "Method not allowed.",
                "status": false
            }
            ```

        - **Code:** 500 Internal Server Error
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "An error occurred while processing your request.",
                    "status": "error",
                    "code": 500
                },
                "message": "Something went wrong. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **OTP Verification:** The verification code is validated against the one stored for the user. If valid, a JWT access token is generated and returned.
    - **Token Management:** Upon successful verification, the `verification_code` and `expiration_time` are cleared from the user's record.
    - **Error Handling:** Provides clear error messages and status codes for various failure scenarios including expired codes and invalid inputs.
    - **Method Checking:** The endpoint only processes POST requests. Any other request methods will result in a 405 Method Not Allowed response.

---


#### 10. [POST] `/api/logout/`

- **Description:** Logs out the user by blacklisting their refresh token, effectively invalidating it and ending their session.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/logout/
    - **Permissions:** IsAuthenticated (Requires authentication via JWT)
    - **Authentication:** JWT Authentication (Must include a valid JWT token in the request header)

- **Request Body:**
    - **Content-Type:** application/json
    - **Fields:**
        - `refresh_token` (string, required): The refresh token that needs to be blacklisted.
    - **Example Request:**
      
    ```json
    {
        "refresh_token": "your_refresh_token_here"
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
                    "status": "success",
                    "code": 200
                },
                "message": "You have been successfully logged out!",
                "status": true
            }
            ```

    - **Error:**
        - **Code:** 400 Bad Request (Invalid Token)
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Detailed error message here",
                    "status": "error",
                    "code": 400
                },
                "message": "Invalid Token",
                "status": false
            }
            ```

- **Additional Notes:**
    - **Token Blacklisting:** The provided refresh token is blacklisted, which prevents it from being used to obtain new access tokens. This effectively logs out the user by invalidating their session.
    - **Authentication Required:** This endpoint requires that the request includes a valid JWT token in the header for authentication.
    - **Error Handling:** Provides clear error messages for invalid tokens or any issues encountered during the blacklisting process.
    - **Method Checking:** Only POST requests are processed. Other request methods will result in a 405 Method Not Allowed response.

---

#### 11. [POST] `/api/change-password/`

- **Description:** Allows authenticated users to change their password if they remember the old one.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/change-password/
    - **Permissions:** IsAuthenticated (Requires authentication)
    - **Authentication:** JWT Authentication (Must include a valid JWT token in the request header)

- **Fields:**
    - `old_password` (string, required): The user's current password.
    - `new_password` (string, required): The new password the user wants to set.
    - `confirm_password` (string, required): Confirmation of the new password to ensure it matches.

- **Request Body:**
    - **Content-Type:** application/json
    - **Fields:**
        - `old_password` (string, required): The current password of the user.
        - `new_password` (string, required): The new password that the user wants to set.
        - `confirm_password` (string, required): Confirmation of the new password. It should match `new_password`.
    - **Example Request:**
      
    ```json
    {
        "old_password": "current_password_here",
        "new_password": "new_password_here",
        "confirm_password": "new_password_here"
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
                "status": "success",
                "code": 200
            },
            "message": "Password updated successfully",
            "status": true
        }
        ```

    - **Error:**
        - **Code:** 400 Bad Request (Validation Error)
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "The new passwords do not match.",
                "status": false
            }
            ```

        - **Code:** 400 Bad Request (Wrong Password)
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Wrong password.",
                "status": false
            }
            ```

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

- **Additional Notes:**
    - **Password Hashing:** The new password is hashed before being saved to the database.
    - **Validation Errors:** Errors include detailed messages about which fields are invalid.
    - **Authentication Required:** The user must be authenticated to access this endpoint.
    - **Method Checking:** Only POST requests are processed. Other request methods will result in a 405 Method Not Allowed response.

---

#### 12. [POST] `/api/password_reset/`

- **Description:** Generates a password reset token and sends it to the specified email address. Overrides the default behavior to provide a unique response.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/password-reset/
    - **Permissions:** AllowAny (No authentication required)
    - **Authentication:** None required

- **Request Body:**
    - **Content-Type:** application/json
    - **Fields:**
        - `email` (string, required): The email address to which the password reset link will be sent.
    - **Example Request:**
      
    ```json
    {
        "email": "user@example.com"
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
                "email": "user@example.com",
                "status": "success",
                "code": 200
            },
            "message": "Password reset link sent successfully",
            "status": true
        }
        ```

    - **Error:**
        - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Detailed error message here",
                    "status": "error",
                    "code": 400
                },
                "message": "An unexpected error occurred. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **Email Validation:** Ensure that the email address provided is valid and exists in the system.
    - **Error Handling:** Custom error messages are provided to help with troubleshooting.
    - **Method Checking:** Only POST requests are processed. Other request methods will result in a 405 Method Not Allowed response.

---

#### 13. [POST] `/api/password_reset/confirm/`

- **Description:** Confirms the password reset by accepting a new password and a valid reset token. Overrides the default behavior to provide a unique response.

- **Request:**
    - **Method:** POST
    - **URL:** domain.com/api/password-reset/confirm/
    - **Permissions:** AllowAny (No authentication required)
    - **Authentication:** None required

- **Request Body:**
    - **Content-Type:** application/json
    - **Fields:**
        - `token` (string, required): The token sent via email for password reset.
        - `password` (string, required): The new password for the user.
    - **Example Request:**
      
    ```json
    {
        "token": "reset_token",
        "password": "new_password_here"
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
                "status": "success",
                "code": 200
            },
            "message": "Password reset successfully",
            "status": true
        }
        ```

    - **Error:**
        - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "details": "Detailed error message here",
                    "status": "error",
                    "code": 400
                },
                "message": "An unexpected error occurred. Please try again later.",
                "status": false
            }
            ```

- **Additional Notes:**
    - **Token Validation:** Ensure that the reset token is valid and has not expired.
    - **Password Requirements:** The new password should meet the application's security requirements.
    - **Error Handling:** Custom error messages are provided to help with troubleshooting.
    - **Method Checking:** Only POST requests are processed. Other request methods will result in a 405 Method Not Allowed response.

---

#### 14. [GET] [PATCH] `/api/profile/`

- **Description:** View or update the user's profile. Provides functionality for both retrieving and updating user profile information.

- **Request:**
    - **Method:** GET, PATCH
    - **URL:** domain.com/api/profile/
    - **Permissions:** IsAuthenticated
    - **Authentication:** Required (JWT Authentication)

- **Request Body:**
    - **For PATCH Request:**
      - **Content-Type:** application/json
      - **Fields:**
        - `email` (string, optional): The new email address for the user.
        - `phone_number` (string, optional): The new phone number for the user.
        - `country_code` (string, optional): The new country code for the user.
        - Other user fields as required.
      - **Example Request:**
        
        ```json
        {
            "email": "newemail@example.com",
            "phone_number": "1234567890",
            "country_code": "+1"
        }
        ```

- **Responses:**

    - **GET Request Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "user": {
                    "id": 1,
                    "username": "user",
                    "email": "user@example.com",
                    "phone_number": "1234567890",
                    "country_code": "+1"
                    // additional fields
                },
                "status": "success",
                "code": 200
            },
            "message": "User Profile Data.",
            "status": true
        }
        ```

    - **PATCH Request Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response:**
          
        ```json
        {
            "data": {
                "user": {
                    "id": 1,
                    "username": "user",
                    "email": "newemail@example.com",
                    "phone_number": "1234567890",
                    "country_code": "+1"
                    // additional fields
                },
                "status": "success",
                "code": 200
            },
            "message": "User Profile Updated Successfully.",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Email Already Exists:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Email already exists.",
                "status": false
            }
            ```

        - **Phone Number Already Exists:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Phone number already exists.",
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
                    "details": "Field errors here",
                    "status": "error",
                    "code": 400
                },
                "message": "An error occurred while updating the profile.",
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
                    "status": "error",
                    "code": 405
                },
                "message": "Invalid method.",
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
    - **Email Uniqueness Check:** Only applicable if the email is provided in the request data.
    - **Phone Number and Country Code Uniqueness Check:** Only applicable if both are provided in the request data.
    - **Validation Errors:** Includes detailed field-specific validation error messages.
    - **Method Checking:** Handles both GET and PATCH methods; returns 405 for other methods.
---

#### 15. [GET] `/api/google/login/`

- **Description:** Generates and returns the Google OAuth2 login URL, which can be used to authenticate users via Google.

- **Request:**
    - **Method:** GET
    - **URL:** domain.com/api/google/login/
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
                "auth_url": "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=email profile openid",
                "status": "success",
                "code": 200
            },
            "message": "Google OAuth2 login URL generated successfully",
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

#### 16. [GET] /api/google/login/callback/

- **Description:** Handles the callback from Google OAuth2 login. Exchanges the authorization code for an access token and retrieves user information. If the user has active Multi-Factor Authentication (MFA), the response will include instructions for completing the MFA process.

- **Request:**
    - **Method:** GET
    - **URL:** domain.com/api/google/login/callback/
    - **Permissions:** AllowAny
    - **Authentication:** Not Required
    - **Query Parameters:**
        - `code` (required): The authorization code received from Google OAuth2.

- **Responses:**

    - **Success:**
        - **Code:** 200 OK
        - **Content-Type:** application/json
        - **Example Response (No MFA):**
          
        ```json
        {
            "data": {
                "refresh": "REFRESH_TOKEN",
                "access": "ACCESS_TOKEN",
                "user": {
                    "id": "USER_ID",
                    "email": "user@example.com",
                    "first_name": "First",
                    "last_name": "Last",
                    "username": "user@example.com",
                    "status": "success",
                    "code": 200
                },
                "status": "success"
            },
            "message": "User Logged in successfully.",
            "status": true
        }
        ```

        - **Example Response (With MFA - App-based):**
          
        ```json
        {
            "data": {
                "has_data": true,
                "method": "App-based",
                "status": "success",
                "code": 200
            },
            "message": "Enter your APP-Code.",
            "status": true
        }
        ```

        - **Example Response (With MFA - SMS):**
          
        ```json
        {
            "data": {
                "has_data": true,
                "method": "SMS",
                "status": "success",
                "code": 200
            },
            "message": "A verification code has been sent to your phone.",
            "status": true
        }
        ```

        - **Example Response (With MFA - Email):**
          
        ```json
        {
            "data": {
                "has_data": true,
                "method": "Email",
                "status": "success",
                "code": 200
            },
            "message": "A verification code has been sent to your email.",
            "status": true
        }
        ```

    - **Error Handling:**

        - **Missing Authorization Code:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Authorization code missing",
                "status": false
            }
            ```

        - **Failed to Obtain Access Token:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Failed to obtain access token",
                "status": false
            }
            ```

        - **Access Token Not Found:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Access token not found in response",
                "status": false
            }
            ```

        - **Failed to Obtain User Info:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Failed to obtain user info",
                "status": false
            }
            ```

        - **Email Not Found in User Info:**
            - **Code:** 400 Bad Request
            - **Content-Type:** application/json
            - **Example Response:**
              
            ```json
            {
                "data": {
                    "status": "error",
                    "code": 400
                },
                "message": "Email not found in user info",
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
    - **Token Exchange:** The view exchanges the authorization code for an access token by making a POST request to Google's OAuth2 token endpoint.
    - **User Info Retrieval:** User information is retrieved using the access token, including email, given name, and family name.
    - **Multi-Factor Authentication (MFA):** If MFA is active, the response will prompt the user for additional verification based on the configured method (App-based, SMS, Email).
    - **Error Handling:** Handles various failure scenarios with appropriate error messages and status codes.

---

