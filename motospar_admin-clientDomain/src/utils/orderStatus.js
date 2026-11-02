export const ORDER_STATUS_OPTIONS = [
    { value: "ADMIN_REVIEW", label: "Admin review", tone: "warning" },
    { value: "PENDING", label: "Pending", tone: "warning" },
    { value: "ASSIGNED_TO_VENDOR", label: "Assigned to vendor", tone: "info" },
    { value: "VENDOR_ACCEPTED", label: "Vendor accepted", tone: "primary" },
    { value: "DRIVER_FOR_PICK", label: "Driver assigned for pickup", tone: "info" },
    { value: "WORK_COMPLETED", label: "Work completed", tone: "primary" },
    { value: "DRIVER_FOR_DROP", label: "Driver assigned for drop", tone: "info" },
    { value: "DELIVERED", label: "Delivered", tone: "success" },
    { value: "CANCELLED", label: "Cancelled", tone: "danger" },
];

export const getOrderStatus = (value) =>
    ORDER_STATUS_OPTIONS.find((status) => status.value === value) || {
        value: value || "UNKNOWN",
        label: value ? String(value).replaceAll("_", " ").toLowerCase() : "Unknown",
        tone: "secondary",
    };

export const getOrderStatuses = (items = []) => {
    const values = [...new Set(items.map((item) => item?.order_status).filter(Boolean))];
    return values.map(getOrderStatus);
};
