import { buildProductUpdatePayload } from "./productPayload";

describe("buildProductUpdatePayload", () => {
    it("maps admin form relation names to the Django serializer contract", () => {
        expect(
            buildProductUpdatePayload({
                name: "Tail light",
                categoryId: "category-id",
                subCategoryId: "subcategory-id",
                delivery_charge: "25.50",
                delivery_time: "2",
                driver_fees: "420.00",
                mechanic_fees: "0",
                gst_rate: "5",
                is_gst_applicable: "false",
            })
        ).toEqual({
            name: "Tail light",
            category_id: "category-id",
            sub_category_id: "subcategory-id",
            delivery_charge: 25.5,
            delivery_time: 2,
            driver_fees: 420,
            mechanic_fees: 0,
            gst_rate: 5,
            is_gst_applicable: false,
        });
    });

    it("preserves explicit zero values and omits unset relations", () => {
        expect(
            buildProductUpdatePayload({
                delivery_charge: 0,
                delivery_time: 0,
                driver_fees: 0,
                mechanic_fees: 0,
            })
        ).toEqual({
            delivery_charge: 0,
            delivery_time: 0,
            driver_fees: 0,
            mechanic_fees: 0,
        });
    });

    it("omits unsupported GST values instead of sending a guaranteed validation error", () => {
        expect(buildProductUpdatePayload({ gst_rate: 0 })).toEqual({
            delivery_charge: 0,
            delivery_time: 0,
            driver_fees: 0,
            mechanic_fees: 0,
        });
    });
});
