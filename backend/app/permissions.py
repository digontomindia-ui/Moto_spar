from rest_framework import permissions


# ***** =====  Custom Permissions class  ===== *****
# ? Custom Permissions class to use in three differnt type of user
# ? To restrict access
# ! If the user.account_type == 'customer'
class IsCustomer(permissions.BasePermission):
    """
    Custom permission to only allow customers to access the view.
    """

    def has_permission(self, request, view):
        # Check if the user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if the user is a customer
        return request.user.account_type == 'customer'


# ! If the user.account_type == 'vendor'
class IsVendor(permissions.BasePermission):
    """
    Custom permission to only allow vendors to access the view.
    """

    def has_permission(self, request, view):
        # Check if the user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if the user is a vendor
        return request.user.account_type == 'vendor'


# ! If the user.account_type == 'mechanic'
class IsMechanic(permissions.BasePermission):
    """
    Custom permission to only allow mechanics to access the view.
    """

    def has_permission(self, request, view):
        # Check if the user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if the user is a mechanic
        return request.user.account_type == 'mechanic'


# ! If the user.account_type == 'admin'
class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    """

    def has_permission(self, request, view):
        # Check if the user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if the user is an admin
        return request.user.account_type == 'admin'
# ***** =====  END  ===== *****