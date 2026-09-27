# app/messages.py

# ! Authentication and User-related Error Messages
EMAIL_EXIST_MESSAGE = 'Email address is already registered.'
PHONE_NUMBER_EXIST_MESSAGE = 'This phone number with the same country code already exists.'
EMAIL_REQUIRED_MESSAGE = 'Email is required.'
PASSWORD_REQUIRED_MESSAGE = 'Password is required.'
USER_NOT_EXIST_MESSAGE = 'User with this email does not exist!'
VENDOR_VERIFICATION_PENDING_MESSAGE = 'Your account is not verified. Please verify your account to log in.'
PERMISSION_DENIED_MESSAGE = 'Permission denied.'
ADMIN_ACCESS_ONLY_MESSAGE = 'This portal is for administrators only. Please log in with admin credentials.'

# ! OTP Related Messages (Error and Success)
PHONE_OTP_MESSAGE = 'Check your phone for CODE.'
EMAIL_OTP_MESSAGE = 'Check your email for CODE.'
INVALID_OTP_MESSAGE = 'Invalid OTP code.'
EXPIRED_OTP_MESSAGE = 'OTP code has expired. Please request a new one.'
OTP_COOLDOWN_MESSAGE = "Please wait 2 minutes before requesting another OTP"

# ! Country Code and Phone Number Messages
COUNTRY_CODE_PHONE_NUMBER_REQUIRED_MESSAGE = 'Country code and phone number are required.'
COUNTRY_CODE_PHONE_NUMBER_VERIFICATION_CODE_REQUIRED_MESSAGE = 'Country code, phone number, and verification code are required.'

# ! Category/Product-Related Error Messages
CATEGORY_NOT_FOUND_MESSAGE = 'Category not found.'
SUBCATEGORY_NOT_FOUND_MESSAGE = 'SubCategory not found.'
PRODUCT_NOT_FOUND_MESSAGE = 'Product not found.'
CART_ITEM_NOT_FOUND_MESSAGE = 'Cart item not found.'
REVIEW_NOT_FOUND_MESSAGE = 'Review not found.'

# ! Pagination Messages
LIMIT_OFFSET_MESSAGE = 'Limit and offset must be non-negative integers.'
PAGINATED_PRODUCTS_MESSAGE = 'Paginated products fetched successfully.'
PAGINATED_REVIEWS_MESSAGE = 'Reviews fetched successfully.'

# ! Vendor and Wishlist Messages
VENDOR_NOT_FOUND_MESSAGE = 'Vendor profile not found.'
WISHLIST_NOT_FOUND_MESSAGE = 'Wishlist not found.'

# ! Mechanic Messages
MECHANIC_NOT_FOUND_MESSAGE = 'Mechanic profile not found.'
NO_COMPLETED_JOB_MESSAGE = "No completed mechanic job found for this product."
ALREADY_REVIEWED_MESSAGE = "You have already reviewed this mechanic job."
NO_REVIEW_OR_RATING_MESSAGE = "At least one of review or rating must be provided."
JOB_ALREADY_COMPLETED_MESSAGE = "This job is already marked as completed."
JOB_NOT_FOUND_MESSAGE = "Mechanic job not found."
PAGINATED_JOBS_MESSAGE = "Mechanic jobs retrieved successfully."

# ! Address Messages
SHIPPING_ADDRESS_NOT_FOUND_MESSAGE = 'Shipping address not found.'
BILLING_ADDRESS_NOT_FOUND_MESSAGE = 'Billing address not found.'

# ! Order and Driver Messages
ORDER_NOT_FOUND_MESSAGE = 'Order not found.'
ORDER_ITEM_NOT_FOUND_MESSAGE = 'Order item not found.'
DRIVER_NOT_FOUND_MESSAGE = 'Driver not found.'

# ! Validation and Data Format Messages
INVALID_DATA_MESSAGE = 'Invalid data provided.'
RATING_RANGE_MESSAGE = 'Rating must be between 0.0 and 5.0.'
INVALID_RATING_MESSAGE = 'Invalid rating format.'

# ! Generic Error and Method-Related Messages
DEFAULT_ERROR_MESSAGE = 'An error occurred while processing your request.'
INVALID_METHOD_MESSAGE = 'Invalid request method.'
INTERNAL_SERVER_ERROR_MESSAGE = 'Internal server error.'

# * Success Messages
LOGIN_MESSAGE = 'User  logged in successfully.'
REGISTER_SUCCESS_MESSAGE = 'User  registered successfully.'
ADMIN_REGISTER_SUCCESS_MESSAGE = 'Admin registered successfully.'
VENDOR_REGISTER_SUCCESS_MESSAGE = 'Vendor registered successfully.'
CUSTOMER_REGISTER_SUCCESS_MESSAGE = 'Customer registered successfully.'
MECHANIC_REGISTER_SUCCESS_MESSAGE = 'Mechanic registered successfully.'

# ? Path Name
HTML_FILE_TYPE = 'text/html'