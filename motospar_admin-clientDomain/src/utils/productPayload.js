const toFiniteNumber = (value, fallback = 0) => {
    if (value === "" || value === null || value === undefined) {
        return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value) => {
    if (typeof value === "string") {
        return value.toLowerCase() === "true";
    }

    return Boolean(value);
};

const toGstRate = (value) => {
    const parsed = Number(value);
    return [5, 18, 28].includes(parsed) ? parsed : undefined;
};

const removeUnsetValues = (payload) =>
    Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
    );

/**
 * Translate the admin form model into the field names and primitive types
 * accepted by the Django ProductSerializer PATCH endpoint.
 */
export const buildProductUpdatePayload = (details = {}) =>
    removeUnsetValues({
        name: details.name,
        description: details.description,
        brand: details.brand,
        model: details.model,
        year: details.year,
        category_id: details.category_id ?? details.categoryId,
        sub_category_id: details.sub_category_id ?? details.subCategoryId,
        delivery_charge: toFiniteNumber(details.delivery_charge),
        delivery_time: toFiniteNumber(details.delivery_time),
        driver_fees: toFiniteNumber(details.driver_fees),
        mechanic_fees: toFiniteNumber(details.mechanic_fees),
        gst_rate: toGstRate(details.gst_rate),
        is_gst_applicable:
            details.is_gst_applicable === undefined
                ? undefined
                : toBoolean(details.is_gst_applicable),
    });
