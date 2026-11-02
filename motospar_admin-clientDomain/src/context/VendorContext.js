import React, { createContext, useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
    DeleteAuth,
    getAuth,
    getCommon,
    PatchAuth,
    patchFormdatatAuth,
    postAuth,
    postCommon,
    postFormdatatAuth,
    postUser,
} from "../repository/Repo";
import { buildProductUpdatePayload } from "../utils/productPayload";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const VendorContext = createContext();
const VendorProvider = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loadingactivity, setloadingactivity] = useState(false);
    const [Products, setProducts] = useState([]);
    const [productCategory, setproductCategory] = useState([]);
    const [productSubCategory, setproductSubCategory] = useState([]);
    const [specificProduct, setspecificProduct] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [variantId, setvariantId] = useState();
    const [vendors, setvendors] = useState([]);
    const [mechanics, setmechanics] = useState([])
    const [vendorDetail, setvendorDetail] = useState("");
    const [mechanicDetail, setmechanicDetail] = useState([])
    const [toastMessage, settoastMessage] = useState("");
    const [images, setimages] = useState([]);
    const [users, setusers] = useState([]);
    const [drivers, setdrivers] = useState([]);
    const [userDetail, setuserDetail] = useState("");
    const [vendoritem, setvendoritem] = useState([]);
    const [orders, setorders] = useState([]);
    const [mechnanicTransactions, setmechnanicTransactions] = useState([])
    const [NearestVendor, setNearestVendor] = useState([]);
    const [NearestMechanic, setNearestMechanic] = useState([]);
    const [requestProducts, setrequestProducts] = useState([]);
    const [statisticsData, setstatisticsData] = useState("");
    const [mechanicJobs, setmechanicJobs] = useState([])
    const AllProduct = async (page, categoryId, subCategoryId) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            var body = {
                limit: 10,
                offset: page ? offset : 0,
                category_id: categoryId ? categoryId : "",
                sub_category_id: subCategoryId ? subCategoryId : "",
            };

            const res = await postAuth("admin/products/view", body);
            console.log(">>res..Product.", res);

            if (res?.data) {
                // dispatch({
                //     type: "SET_USER_DATA",
                //     payload: res?.data?.products,
                // });
                console.log(res?.data?.products);
                setProducts(res?.data?.products);
                setTotalCount(res?.data?.total_count);
                setPageCount(res?.data?.page_count);
                setHasNext(res?.data?.has_next);
                setCurrentPage(res?.data?.current_page);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);

            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in ALLProduct....VEndorcontext", e);
        }
    };
    const ProductCategory = async () => {
        setloadingactivity(true);
        try {
            var body = {
                limit: 10,
                offset: 0,
            };

            const res = await postCommon("categories/", body);
            console.log(">>res..Category.", res);

            if (res?.data) {
                // dispatch({
                //     type: "SET_USER_DATA",
                //     payload: res?.data?.products,
                // });
                setproductCategory(res?.data?.categories);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);

            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in ProductCategory....VEndorcontext", e);
        }
    };
    const ProductSubCategory = async (id) => {
        setloadingactivity(true);
        try {
            var body = {
                limit: 30,
                offset: 0,
            };

            const res = await postCommon(`sub-categories/${id}/`, body);
            console.log(">>res..SubCategory.", res);

            if (res?.data) {
                // dispatch({
                //     type: "SET_USER_DATA",
                //     payload: res?.data?.products,
                // });
                setproductSubCategory(res?.data?.subcategories);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in ProductSubCategory....VEndorcontext", e);
        }
    };
    const getSpecificProduct = async (id) => {
        setloadingactivity(true);
        try {
            const res = await getCommon(`products/${id}/`);
            console.log(">>res..specificProduct.", res);

            if (res?.data) {
                // dispatch({
                //     type: "SET_USER_DATA",
                //     payload: res?.data?.products,
                // });
                const product = res?.data?.products || res?.data?.product || res?.data;
                setspecificProduct(product);

                setloadingactivity(false);
                return { success: true, product };
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
                return { success: false, message: res?.message };
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in getSpecificProduct....VEndorcontext", e);
            return { success: false, message: e?.message || "Unable to refresh product details" };
        }
    };

    // const AddProduct = async (productDetails) => {

    //     const {
    //         name,
    //         description,
    //         brand,
    //         model,
    //         year,
    //         price,
    //         weight,
    //         discount,
    //         sku,
    //         color,
    //         size,
    //         dimensions,
    //         material,
    //         features,
    //         categoryId,
    //         subCategoryId,
    //         delivery_charge,
    //         delivery_time,
    //         driver_fees,
    //         mechanic_fees,
    //         images
    //     } = productDetails;
    //     console.log("imageeurlllll", images)
    //     try {
    //         const formData = new FormData();

    //         // Add product details
    //         formData.append("name", name);
    //         formData.append("category_id", categoryId);
    //         formData.append("sub_category_id", subCategoryId);
    //         formData.append("description", description);
    //         formData.append("brand", brand);
    //         formData.append("model", model);
    //         formData.append("year", year);
    //         formData.append("delivery_charge", delivery_charge);
    //         formData.append("delivery_time", delivery_time);
    //         formData.append("driver_fees", driver_fees);
    //         formData.append("mechanic_fees", mechanic_fees);

    //         // Add variant details
    //         const variantData = {
    //             final_listing_price_on_motospar: price,
    //             discount,
    //             in_stock: true,
    //             sku,
    //             color,
    //             size,
    //             weight,
    //             dimensions,
    //             material,
    //             features,
    //         };
    //         formData.append("variant", JSON.stringify(variantData));

    //         // Add images
    //         if (images) {

    //             formData.append("images", JSON.stringify(images));

    //         }

    //         const res = await postFormdatatAuth("admin/products/add", formData);
    //         console.log(">>res..AddProduct.", res);

    //         if (res?.data) {
    //             settoastMessage(res?.message);
    //             setloadingactivity(false);
    //             setimages([]);
    //         } else {
    //             setloadingactivity(false);
    //             alert(res?.message);
    //             console.log(res?.message);
    //         }
    //     } catch (e) {
    //         setloadingactivity(false);
    //         console.log("errorr... in AddProduct....VendorContext", e);
    //     }
    // };

    const uploadVariantImages = async (variantId, fileList) => {
        if (!variantId || !fileList || fileList.length === 0) {
            return { success: true, data: [] };
        }
        try {
            const formData = new FormData();
            fileList.forEach((file) => {
                formData.append("images", file);
            });

            const res = await postFormdatatAuth(`admin/variant/${variantId}/upload-images`, formData);
            if (res?.status === true && res?.data?.status === "success") {
                return { success: true, data: res?.data?.images || [], message: res?.message };
            } else {
                const errDetails = Array.isArray(res?.data?.details) ? res.data.details.join(", ") : res?.data?.details;
                const msg = errDetails || res?.message || "Failed to upload images";
                return { success: false, message: msg };
            }
        } catch (err) {
            console.error("Error in uploadVariantImages:", err);
            return { success: false, message: err?.message || "Network error uploading images" };
        }
    };

    const deleteProductImage = async (imageId) => {
        try {
            const res = await DeleteAuth(`admin/product-images/${imageId}/delete`);
            if (res?.status === true && res?.data?.status === "success") {
                toast.success("Image deleted successfully");
                return { success: true };
            } else {
                toast.error(res?.message || "Failed to delete image");
                return { success: false, message: res?.message };
            }
        } catch (err) {
            console.error("Error in deleteProductImage:", err);
            toast.error("Failed to delete image");
            return { success: false, message: err?.message };
        }
    };

    const AddProduct = async (productDetails) => {
        const {
            name,
            description,
            brand,
            model,
            year,
            price,
            weight,
            discount,
            sku,
            color,
            size,
            dimensions,
            material,
            features,
            categoryId,
            subCategoryId,
            delivery_charge,
            delivery_time,
            driver_fees,
            mechanic_fees,
            images,
            imageFiles,
            gst_rate,
            is_gst_applicable,
        } = productDetails;

        setloadingactivity(true);

        try {
            // Separate File objects from URL strings
            const allImages = images || [];
            const fileList = [
                ...(imageFiles || []),
                ...allImages.filter((img) => img instanceof File),
            ];
            const urlList = allImages.filter((img) => typeof img === "string" && !img.startsWith("blob:"));

            // Build JSON body for stage 1
            const body = {
                name,
                category_id: categoryId,
                sub_category_id: subCategoryId,
                description,
                brand,
                model,
                year,
                delivery_charge,
                delivery_time,
                driver_fees: driver_fees ? driver_fees : 0,
                mechanic_fees: mechanic_fees ? mechanic_fees : 0,
                gst_rate,
                is_gst_applicable,
                variant: {
                    final_listing_price_on_motospar: price,
                    discount,
                    in_stock: true,
                    sku,
                    color,
                    size,
                    weight,
                    dimensions,
                    material,
                    features,
                },
                images: urlList,
            };

            const res = await postAuth("admin/products/add", body);
            console.log(">>res..AddProduct.", res);

            if (res?.status === true && res?.data?.status === "success") {
                const createdVariantId = res?.data?.variant_id || res?.data?.product?.variants?.[0]?.id;

                // Stage 2: Upload image files to created variant
                if (fileList.length > 0 && createdVariantId) {
                    const uploadRes = await uploadVariantImages(createdVariantId, fileList);
                    setloadingactivity(false);
                    if (uploadRes?.success) {
                        settoastMessage("Product and images saved successfully");
                        toast.success("Product and images saved successfully");
                        setimages([]);
                        return { success: true, product: res.data.product, variantId: createdVariantId };
                    } else {
                        const errMsg = `Product saved, but image upload failed: ${uploadRes?.message || 'Error uploading images'}`;
                        settoastMessage(errMsg);
                        toast.warn(errMsg);
                        return {
                            success: false,
                            partialSuccess: true,
                            product: res.data.product,
                            variantId: createdVariantId,
                            failedFiles: fileList,
                            message: errMsg,
                        };
                    }
                } else {
                    settoastMessage(res?.message || "Product added successfully");
                    setloadingactivity(false);
                    setimages([]);
                    toast.success(res?.message || "Product added successfully");
                    return { success: true, product: res.data.product, variantId: createdVariantId };
                }
            } else {
                setloadingactivity(false);
                toast.error(res?.message || "Failed to add product");
                return { success: false, message: res?.message };
            }
        } catch (e) {
            setloadingactivity(false);
            console.error("error in AddProduct...VendorContext", e);
            toast.error("An error occurred while adding product");
            return { success: false, message: e?.message };
        }
    };

    const EditProduct = async (Id, productDetails) => {
        setloadingactivity(true);

        try {
            const body = buildProductUpdatePayload(productDetails);

            const res = await PatchAuth(`admin/products/${Id}/edit`, body);

            if (res?.status === true && res?.data?.status === "success") {
                const message = res?.message || "Product updated successfully";
                settoastMessage(message);
                toast.success(message);
                return { success: true, product: res?.data?.product, message };
            } else {
                const details = res?.data?.details;
                const message = details || res?.message || "Unable to update product";
                settoastMessage(message);
                toast.error(message);
                return { success: false, message, details };
            }
        } catch (e) {
            const message = e?.message || "Unable to update product";
            toast.error(message);
            console.error("Error in EditProduct:", e);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };

    const VendorStock = async (page) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            var body = {
                limit: 10,
                offset: offset,
            };

            const res = await postAuth("vendor/vendors/stock/list", body);
            console.log(">>res..vendor Stock.", res);

            if (res?.data) {
                // dispatch({
                //     type: "SET_USER_DATA",
                //     payload: res?.data?.products,
                // });
                setProducts(res?.data?.variants);
                setTotalCount(res?.data?.total_count);
                setPageCount(res?.data?.page_count);
                setHasNext(res?.data?.has_next);
                setCurrentPage(res?.data?.current_page);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in VendorStock....VEndorcontext", e);
        }
    };
    const EditProfile = async (data) => {
        setloadingactivity(true);
        try {
            const formData = new FormData();

            // Add product details
            formData.append("first_name", data?.first_name);
            formData.append("last_name", data?.last_name);
            formData.append("email", data?.email);
            formData.append("phone_number", data?.phone_number);
            if (data.profile_image) {
                formData.append("profile_picture", data?.profile_image); // Add image only if it's present
            }

            const res = await patchFormdatatAuth("profile/update", formData);

            if (res?.data) {
                localStorage.setItem("@userdetails", JSON.stringify(res?.data.user));
                dispatch({
                    type: "SET_USER_DATA",
                    payload: res?.data?.user,
                });
                // console.log(res?.data);
                settoastMessage(res?.message);
                toast.success(res?.message);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            toast.error(e);
            setloadingactivity(false);
            console.log("errorr... in EditProfile....VEndorcontext", e);
        }
    };
    const AllVendors = async (page, filters = {}) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            const body = {
                limit: 10,
                offset: page ? offset : 0,
                search: filters?.search?.trim() || "",
            };

            const res = await postAuth("admin/vendors/view", body);

            if (res?.status === true && res?.data) {
                setvendors(res.data.vendor_profiles || []);
                setTotalCount(res.data.total_count || 0);
                setPageCount(res.data.page_count || 0);
                setHasNext(Boolean(res.data.has_next));
                setCurrentPage(res.data.current_page || 1);
                return { success: true, data: res.data };
            }

            const message = res?.message || "Vendors could not be loaded.";
            toast.error(message);
            return { success: false, message };
        } catch (e) {
            console.error("Error loading vendors", e);
            const message = e?.message || "Vendors could not be loaded.";
            toast.error(message);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const AllMechanics = async (page, filters = {}) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            const body = {
                limit: 10,
                offset: page ? offset : 0,
                search: filters?.search?.trim() || "",
            };

            const res = await postAuth("admin/mechanic/users/view", body);

            if (res?.status === true && res?.data) {
                setmechanics(res.data.users || []);
                setTotalCount(res.data.total_count || 0);
                setPageCount(res.data.page_count || 0);
                setHasNext(Boolean(res.data.has_next));
                setCurrentPage(res.data.current_page || 1);
                return { success: true, data: res.data };
            }

            const message = res?.message || "Mechanics could not be loaded.";
            toast.error(message);
            return { success: false, message };
        } catch (e) {
            console.error("Error loading mechanics", e);
            const message = e?.message || "Mechanics could not be loaded.";
            toast.error(message);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const AllUsers = async (page, filters = {}) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            const body = {
                limit: 10,
                offset: page ? offset : 0,
                account_type: "customer",
                search: filters?.search?.trim() || "",
            };

            const res = await postAuth("admin/users/view", body);

            if (res?.status === true && res?.data) {
                setusers(res.data.users || []);
                setTotalCount(res.data.total_count || 0);
                setPageCount(res.data.page_count || 0);
                setHasNext(Boolean(res.data.has_next));
                setCurrentPage(res.data.current_page || 1);
                return { success: true, data: res.data };
            }

            const message = res?.message || "Customers could not be loaded.";
            toast.error(message);
            return { success: false, message };
        } catch (e) {
            console.error("Error loading customers", e);
            const message = e?.message || "Customers could not be loaded.";
            toast.error(message);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const getSpecificUser = async (id) => {
        setloadingactivity(true);
        try {
            const res = await getAuth(`admin/users/${id}/details/`);
            if (res?.status === true && res?.data?.user) {
                setuserDetail(res.data.user);
                return { success: true, data: res.data.user };
            }

            const message = res?.message || "Customer details could not be loaded.";
            toast.error(message);
            return { success: false, message };
        } catch (e) {
            console.error("Error loading customer details", e);
            const message = e?.message || "Customer details could not be loaded.";
            toast.error(message);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const VendorProducts = async (page, id) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            var body = {
                limit: 10,
                offset: page ? offset : 0,
            };

            const res = await postAuth(`vendors/stock/${id}/list`, body);
            console.log(">>res..VendorProducts.", res);

            if (res?.data) {
                console.log(res?.data);
                setvendoritem(res?.data?.variants);
                setTotalCount(res?.data?.total_count);
                setPageCount(res?.data?.page_count);
                setHasNext(res?.data?.has_next);
                setCurrentPage(res?.data?.current_page);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                alert(res?.message);
                console.log(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in VendorProducts....VEndorcontext", e);
        }
    };
    const getSpecificVendor = async (id) => {
        setloadingactivity(true);
        try {
            const res = await getAuth(`vendor/vendors/${id}/view/`);
            console.log(">>res..specificVendor.", res);

            if (res?.data) {
                setvendorDetail(res?.data?.vendor);

                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in getSpecificvendor....VEndorcontext", e);
        }
    };
    const getSpecificMechanic = async (id) => {
        setloadingactivity(true);
        try {
            const res = await getAuth(`admin/mechanic/users/${id}/details/`);
            console.log(">>res..specificVendor.", res);

            if (res?.data) {
                setmechanicDetail(res?.data?.user);

                setloadingactivity(false);
                return res?.data?.user
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in getSpecificMechanic....VEndorcontext", e);
        }
    };
    const AllOrders = async (page, filters = {}) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            const body = {
                limit: 10,
                offset: page ? offset : 0,
                customer_name: filters.customer_name || "",
                order_code: filters.order_code || "",
                payment_method: filters.payment_method || "",
                payment_status: filters.payment_status || "",
                phone_number: filters.phone_number || "",
                address: filters.address || "",
            };

            const res = await postAuth("admin/orders/view", body);
            if (res?.status === true) {
                setorders(res?.data?.orders || []);
                setTotalCount(res?.data?.total_count);
                setPageCount(res?.data?.page_count);
                setHasNext(res?.data?.has_next);
                setCurrentPage(res?.data?.current_page);
                return { success: true, data: res.data };
            } else {
                const message = res?.data?.details || res?.message || "Unable to load orders";
                toast.error(message);
                return { success: false, message };
            }
        } catch (e) {
            const message = e?.message || "Unable to load orders";
            toast.error(message);
            console.error("Error in AllOrders", e);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const updateProductStatus = async (Id, order_status, driver_for_me_url, vendor_payment_status, payment_status) => {
        setloadingactivity(true);
        try {
            const body = {
                order_status,
                payment_status,
                vendor_payment_status,
                driver_for_me_url: driver_for_me_url || "",
            };
            const res = await PatchAuth(`order-item/${Id}/update-status`, body);

            if (res?.status === true) {
                settoastMessage(res?.message);
                toast.success(res?.message);
                return { success: true, data: res?.data, message: res?.message };
            } else {
                const message = res?.data?.details || res?.message || "Unable to update order item";
                toast.error(message);
                return { success: false, message };
            }
        } catch (e) {
            const message = e?.message || "Unable to update order item";
            toast.error(message);
            console.error("Error in updateProductStatus", e);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const getNearestVendor = async (id) => {
        setloadingactivity(true);
        try {
            const res = await getAuth(`admin/order-item/${id}/find-nearest-vendors/`);
            if (res?.status === true) {
                const vendors = res?.data?.nearest_vendors || [];
                setNearestVendor(vendors);
                return { success: true, vendors };
            } else {
                const message = res?.data?.details || res?.message || "Unable to find nearby vendors";
                toast.error(message);
                return { success: false, message };
            }
        } catch (e) {
            const message = e?.message || "Unable to find nearby vendors";
            toast.error(message);
            console.error("Error in getNearestVendor", e);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const assignVendor = async (order_item_id, vendor_id, vendor_selling_price) => {
        setloadingactivity(true);
        try {
            var body = {
                order_item_id,
                vendor_id,
                vendor_selling_price,
            };
            const res = await postAuth("admin/order-item/assign-vendor", body);
            if (res?.status === true) {
                settoastMessage(res?.message);
                toast.success(res?.message);
                return { success: true, data: res?.data, message: res?.message };
            } else {
                const message = res?.data?.details || res?.message || "Unable to assign vendor";
                toast.error(message);
                return { success: false, message };
            }
        } catch (e) {
            const message = e?.message || "Unable to assign vendor";
            toast.error(message);
            console.error("Error in assignVendor", e);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const getNearestMechanic = async (id) => {
        setloadingactivity(true);
        try {
            const res = await getAuth(`admin/order-item/${id}/find-nearest-mechanics/`);
            if (res?.status === true) {
                const mechanics = res?.data?.nearest_mechanics || [];
                setNearestMechanic(mechanics);
                return { success: true, mechanics };
            } else {
                const message = res?.data?.details || res?.message || "Unable to find nearby mechanics";
                toast.error(message);
                return { success: false, message };
            }
        } catch (e) {
            const message = e?.message || "Unable to find nearby mechanics";
            toast.error(message);
            console.error("Error in getNearestMechanic", e);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const assignMechanic = async (order_item_id, mechanic_id, mechanic_fees, notes) => {
        setloadingactivity(true);
        try {
            var body = {
                mechanic_id,
                mechanic_fees,
                notes
            };
            const res = await postAuth(`admin/order-item/${order_item_id}/assign-mechanic`, body);
            if (res?.status === true) {
                settoastMessage(res?.message);
                toast.success(res?.message);
                return { success: true, data: res?.data, message: res?.message };
            } else {
                const message = res?.data?.details || res?.message || "Unable to assign mechanic";
                toast.error(message);
                return { success: false, message };
            }
        } catch (e) {
            const message = e?.message || "Unable to assign mechanic";
            toast.error(message);
            console.error("Error in assignMechanic", e);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const requestProductList = async (page) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            var body = {
                limit: 10,
                offset: page ? offset : 0,
            };

            const res = await postAuth("admin/product-request/view", body);
            console.log(">>res..requestProductList.", res);

            if (res?.data) {
                setrequestProducts(res?.data?.product_requests);
                setTotalCount(res?.data?.total_count);
                setPageCount(res?.data?.page_count);
                setHasNext(res?.data?.has_next);
                setCurrentPage(res?.data?.current_page);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.success(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in requestProductList....VEndorcontext", e);
        }
    };
    const updateProductRequest = async (Id, status) => {
        setloadingactivity(true);
        try {
            var body = {
                status,
            };
            const res = await PatchAuth(`product-request/${Id}/update`, body);
            console.log(">>res..updateProductRequest.", res);

            if (res?.data) {
                settoastMessage("Product has been Accepted");
                toast.success(res?.message);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in updateProductRequest....VEndorcontext", e);
        }
    };
    const addSubCategory = async (category_id, name, description, image) => {
        setloadingactivity(true);
        try {
            const res = await postAuth("admin/sub-categories/add", {
                category_id,
                name,
                description,
                image: image || null,
            });

            if (res?.status === true) {
                settoastMessage(res?.message);
                toast.success(res?.message);
                return res;
            } else {
                const message = res?.data?.details || res?.message || "Unable to create sub-category";
                toast.error(message);
                return { ...res, status: false, message };
            }
        } catch (e) {
            const message = e?.message || "Unable to create sub-category";
            toast.error(message);
            console.error("Error in addSubCategory", e);
            return { status: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const getAllSubCategory = async (page) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            var body = {
                limit: 10,
                offset: page ? offset : 0,
            };

            const res = await postCommon("sub-categories/", body);


            if (res?.data) {
                setproductSubCategory(res?.data?.subcategories);
                setTotalCount(res?.data?.total_count);
                setPageCount(res?.data?.page_count);
                setHasNext(res?.data?.has_next);
                setCurrentPage(res?.data?.current_page);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in getAllSubCategory....VEndorcontext", e);
        }
    };
    const editSubCategory = async (data) => {
        setloadingactivity(true);
        try {
            const body = {
                name: data.subCategoryName,
                description: data.description,
            };
            if (data.categoryId) body.category_id = data.categoryId;
            if (data.image !== undefined) body.image = data.image || null;

            const res = await PatchAuth(`admin/sub-categories/${data.subCategoryId}/edit`, body);

            if (res?.status === true) {
                toast.success(res?.message);
                return res;
            } else {
                const message = res?.data?.details || res?.message || "Unable to update sub-category";
                toast.error(message);
                return { ...res, status: false, message };
            }
        } catch (e) {
            const message = e?.message || "Unable to update sub-category";
            toast.error(message);
            console.error("Error in editSubCategory", e);
            return { status: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const deleteCommon = async (uri) => {
        setloadingactivity(true);
        try {
            const res = await DeleteAuth(uri);
            if (res?.status === true && res?.data) {
                const message = res?.message || "The item was deleted successfully.";
                settoastMessage(message);
                toast.success(message);
                return { ...res, success: true, message };
            }

            const message = res?.message || "The item could not be deleted.";
            toast.error(message);
            return { ...res, success: false, message };
        } catch (e) {
            console.error("Error deleting item", e);
            const message = e?.message || "The item could not be deleted.";
            toast.error(message);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const getStatistics = async () => {
        setloadingactivity(true);
        try {
            const res = await getAuth(`admin/statistics/`);


            if (res?.data) {
                setstatisticsData(res?.data);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in getStatistics....VEndorcontext", e);
        }
    };
    const toggleProductStatus = async (id) => {
        setloadingactivity(true);
        try {
            const res = await getAuth(`admin/products/${id}/toggle-active/`);
            if (res?.status === true || res?.data?.status === "success") {
                if (res?.data?.products) {
                    setspecificProduct(res.data.products);
                }
                setloadingactivity(false);
                return { success: true, data: res?.data, message: res?.message };
            } else {
                setloadingactivity(false);
                const message = res?.data?.details || res?.message || "Unable to change product status";
                toast.error(message);
                return { success: false, message };
            }
        } catch (e) {
            setloadingactivity(false);
            const message = e?.message || "Unable to change product status";
            console.log("errorr... in toggleProductStatus....VEndorcontext", e);
            toast.error(message);
            return { success: false, message };
        }
    };
    const AddVariant = async (
        Id,
        sku,
        price,
        discount,
        color,
        size,
        weight,
        dimensions,
        material,
        features,
        stockStatus,
        images
    ) => {
        setloadingactivity(true);
        try {
            const allImages = images || [];
            const fileList = allImages.filter((img) => img instanceof File);
            const urlList = allImages.filter((img) => typeof img === "string" && !img.startsWith("blob:"));

            const body = {
                variant: {
                    final_listing_price_on_motospar: Number(price),
                    discount: Number(discount),
                    in_stock: stockStatus === true || stockStatus === "true",
                    sku,
                    color,
                    size,
                    weight: Number(weight),
                    dimensions,
                    material,
                    features,
                },
                images: urlList,
            };

            const res = await postAuth(`admin/variant/${Id}/add`, body);

            if (res?.status === true && res?.data?.status === "success") {
                const createdVariantId = res?.data?.variant_id || res?.data?.variant?.id;
                if (fileList.length > 0 && createdVariantId) {
                    const uploadRes = await uploadVariantImages(createdVariantId, fileList);
                    setloadingactivity(false);
                    if (uploadRes?.success) {
                        settoastMessage("Variant and images added successfully");
                        toast.success("Variant and images added successfully");
                        setimages([]);
                        return { success: true, variantId: createdVariantId };
                    } else {
                        const errMsg = `Variant was saved, but image upload failed: ${uploadRes?.message || 'Error uploading images'}`;
                        settoastMessage(errMsg);
                        toast.warn(errMsg);
                        return {
                            success: false,
                            partialSuccess: true,
                            variantId: createdVariantId,
                            failedFiles: fileList,
                            message: errMsg,
                        };
                    }
                } else {
                    settoastMessage(res?.message || "Variant added successfully");
                    toast.success(res?.message || "Variant added successfully");
                    setloadingactivity(false);
                    setimages([]);
                    return { success: true, variantId: createdVariantId };
                }
            } else {
                setloadingactivity(false);
                toast.error(res?.message || "Failed to add variant");
                return { success: false, message: res?.message };
            }
        } catch (e) {
            setloadingactivity(false);
            console.error("error in AddVariant...VendorContext", e);
            toast.error("An error occurred while adding variant");
            return { success: false, message: e?.message };
        }
    };
    const EditVariant = async (data) => {
        setloadingactivity(true);

        try {
            // Existing images are stored by their storage key. Never send their
            // resolved display URLs back as image values during a details edit.
            const fileList = [
                ...(data?.imageFiles || []),
                ...(data?.images || []).filter((img) => img instanceof File),
            ];

            const body = {
                sku: data?.sku,
                final_listing_price_on_motospar: Number(data?.price),
                discount: Number(data?.discount),
                in_stock: data?.stock_status === true || data?.stock_status === "true",
                color: data?.color,
                size: data?.size,
                weight: data?.weight,
                dimensions: data?.dimensions,
                material: data?.material,
                features: data?.features,
            };

            const res = await PatchAuth(`admin/variant/${data.id}/edit`, body);

            if (res?.status === true && res?.data?.status === "success") {
                if (fileList.length > 0 && data?.id) {
                    const uploadRes = await uploadVariantImages(data.id, fileList);
                    setloadingactivity(false);
                    if (uploadRes?.success) {
                        settoastMessage("Variant and images updated successfully");
                        toast.success("Variant and images updated successfully");
                        setimages([]);
                        return { success: true };
                    } else {
                        const errMsg = `Variant updated, but image upload failed: ${uploadRes?.message || 'Error uploading images'}`;
                        settoastMessage(errMsg);
                        toast.warn(errMsg);
                        return {
                            success: false,
                            partialSuccess: true,
                            variantId: data.id,
                            failedFiles: fileList,
                            message: errMsg,
                        };
                    }
                } else {
                    settoastMessage(res?.message || "Variant updated successfully");
                    toast.success(res?.message || "Variant updated successfully");
                    setloadingactivity(false);
                    setimages([]);
                    return { success: true };
                }
            } else {
                setloadingactivity(false);
                toast.error(res?.message || "Failed to update variant");
                return { success: false, message: res?.message };
            }
        } catch (e) {
            setloadingactivity(false);
            console.error("error in EditVariant...VendorContext", e);
            toast.error("An error occurred while updating variant");
            return { success: false, message: e?.message };
        }
    };
    const addDriver = async (
        first_name,
        last_name,
        email,
        phone_number,
        profile_picture,
        license_number,
        license_type,
        license_status,
        license_expiry_date,
        is_available,
        employment_status,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code,
        country,
        total_deliveries,
        rating,
        emergency_contact_phone
    ) => {
        setloadingactivity(true);
        try {
            const formData = new FormData();

            // Add product details
            formData.append("first_name", first_name);
            formData.append("last_name", last_name);
            formData.append("email", email);
            formData.append("phone_number", phone_number);
            formData.append("emergency_contact_phone", emergency_contact_phone);
            formData.append("profile_picture", profile_picture);
            formData.append("license_number", license_number);
            formData.append("license_type", license_type);
            formData.append("license_status", license_status);
            formData.append("license_expiry_date", license_expiry_date);
            formData.append("is_available", is_available);
            formData.append("employment_status", employment_status);
            formData.append("address_line_1", address_line_1);
            formData.append("address_line_2", address_line_2);
            formData.append("city", city);
            formData.append("state", state);
            formData.append("postal_code", postal_code);
            formData.append("country", country);
            formData.append("total_deliveries", total_deliveries);
            formData.append("rating", rating);
            const res = await postFormdatatAuth("admin/driver/add", formData);


            if (res?.data) {
                settoastMessage(res?.message);
                toast.success(res?.message);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in addDriver....VEndorcontext", e);
        }
    };
    const AllDrivers = async (page, filters = {}) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            const body = {
                limit: 10,
                offset: page ? offset : 0,
                search: filters?.search?.trim() || "",
            };

            const res = await postAuth("admin/driver/view", body);

            if (res?.status === true && res?.data) {
                setdrivers(res.data.drivers || []);
                setTotalCount(res.data.total_count || 0);
                setPageCount(res.data.page_count || 0);
                setHasNext(Boolean(res.data.has_next));
                setCurrentPage(res.data.current_page || 1);
                return { success: true, data: res.data };
            }

            const message = res?.message || "Drivers could not be loaded.";
            toast.error(message);
            return { success: false, message };
        } catch (e) {
            console.error("Error loading drivers", e);
            const message = e?.message || "Drivers could not be loaded.";
            toast.error(message);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const assignDriver = async (order_id, driver_id) => {
        setloadingactivity(true);
        try {
            const body = {
                order_id,
                driver_id,
            };
            const res = await postAuth("admin/order/assign-driver", body);

            if (res?.status === true && res?.data) {
                const message = res?.message || "Driver assigned successfully.";
                settoastMessage(message);
                toast.success(message);
                return { success: true, data: res.data, message };
            }

            const message = res?.message || "The driver could not be assigned.";
            toast.error(message);
            return { success: false, message };
        } catch (e) {
            console.error("Error assigning driver", e);
            const message = e?.message || "The driver could not be assigned.";
            toast.error(message);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };

    const EditDriver = async (data) => {
        setloadingactivity(true);
        try {
            const formData = new FormData();

            // Add product details
            formData.append("first_name", data?.first_name);
            formData.append("last_name", data?.last_name);
            formData.append("email", data?.email);
            formData.append("phone_number", data?.phone_number);
            formData.append("emergency_contact_phone", data?.emergency_contact_phone);
            formData.append("license_number", data?.license_number);
            formData.append("license_type", data?.license_type);
            formData.append("license_status", data?.license_status);
            formData.append("license_expiry_date", data?.license_expiry_date);
            formData.append("is_available", data?.is_available);
            formData.append("employment_status", data?.employment_status);
            formData.append("address_line_1", data?.address_line_1);
            formData.append("address_line_2", data?.address_line_2);
            formData.append("city", data?.city);
            formData.append("state", data?.state);
            formData.append("postal_code", data?.postal_code);
            formData.append("country", data?.country);
            formData.append("total_deliveries", data?.total_deliveries);
            formData.append("rating", data?.rating);
            if (data.profile_image) {
                formData.append("profile_picture", data?.profile_image); // Add image only if it's present
            }

            const res = await patchFormdatatAuth(`admin/driver/${data?.Id}/edit`, formData);
            console.log(">>res..EditDriver.", res);

            if (res?.data) {
                settoastMessage(res?.message);
                toast.success(res?.message);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in EditDriver....VEndorcontext", e);
        }
    };
    const deleteDriver = async (driver_id) => {
        setloadingactivity(true);
        try {
            const res = await postAuth(`admin/driver/${driver_id}/delete`);

            if (res?.status === true && res?.data) {
                const message = res?.message || "Driver deleted successfully.";
                settoastMessage(message);
                toast.success(message);
                return { success: true, data: res.data, message };
            }

            const message = res?.message || "The driver could not be deleted.";
            toast.error(message);
            return { success: false, message };
        } catch (e) {
            console.error("Error deleting driver", e);
            const message = e?.message || "The driver could not be deleted.";
            toast.error(message);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const vendorVerfication = async (id) => {
        setloadingactivity(true);
        try {
            const res = await postAuth(`admin/vendors/${id}/verify`);

            if (res?.status === true && res?.data) {
                const message = res?.message || "Vendor verified successfully.";
                settoastMessage(message);
                toast.success(message);
                return { success: true, data: res.data, message };
            }

            const message = res?.message || "The vendor could not be verified.";
            toast.error(message);
            return { success: false, message };
        } catch (e) {
            console.error("Error verifying vendor", e);
            const message = e?.message || "The vendor could not be verified.";
            toast.error(message);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const MechanicVerfication = async (id) => {
        setloadingactivity(true);
        try {
            const res = await postAuth(`admin/mechanics/${id}/verify`);
            if (res?.status === true && res?.data) {
                const message = res?.message || "Mechanic verified successfully.";
                settoastMessage(message);
                toast.success(message);
                return { success: true, data: res.data, message };
            }

            const message = res?.message || "The mechanic could not be verified.";
            toast.error(message);
            return { success: false, message };
        } catch (e) {
            console.error("Error verifying mechanic", e);
            const message = e?.message || "The mechanic could not be verified.";
            toast.error(message);
            return { success: false, message };
        } finally {
            setloadingactivity(false);
        }
    };
    const GetDummyTemplete = async () => {
        setloadingactivity(true);
        try {
            const res = await getCommon('admin/bulk-upload/template/');
            console.log(">>res..GetDummyTemplete.", res);

            if (res?.data) {
                // setvendorDetail(res?.data?.vendor);


                setloadingactivity(false);
            } else {
                setloadingactivity(false);

                console.log(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in GetDummyTemplete....VEndorcontext", e);
        }
    };
    const PreviewBulkUpload = async (csv) => {
        if (!csv) {
            toast.error("Choose a CSV file before previewing.");
            return null;
        }

        setloadingactivity(true);
        try {
            const formData = new FormData();
            formData.append("file", csv);
            const res = await postFormdatatAuth("admin/bulk-upload/preview", formData);
            if (res?.status !== true) {
                toast.error(res?.message || "Could not validate this CSV file.");
                return null;
            }
            return res;
        } catch (e) {
            toast.error("Could not validate this CSV file. Please try again.");
            console.error("CSV preview failed", e);
            return null;
        } finally {
            setloadingactivity(false);
        }
    };

    const UploadCsv = async (csv, createMissingSubcategories = []) => {
        if (!csv) {
            toast.error("Choose a CSV file before uploading.");
            return;
        }

        setloadingactivity(true);
        try {
            const formData = new FormData();
            formData.append("file", csv);
            if (createMissingSubcategories.length > 0) {
                formData.append("create_missing_subcategories", JSON.stringify(createMissingSubcategories));
            }
            const res = await postFormdatatAuth("admin/bulk-upload", formData);
            const data = res?.data || {};
            const errors = Array.isArray(data.error_messages) ? data.error_messages : [];

            if (res?.status === true && errors.length === 0) {
                settoastMessage("File uploaded successfully");
                toast.success(res?.message || "CSV upload completed successfully.");
            } else {
                const successCount = Number(data.success_count || 0);
                const errorCount = Number(data.error_count || errors.length || 0);
                const resultMessage = errorCount > 0
                    ? `Upload finished with issues: ${successCount} row(s) added, ${errorCount} row(s) need correction.`
                    : res?.message || "CSV upload could not be completed.";
                const friendlyErrors = errors.map((error) => (
                    /numeric field overflow/i.test(error)
                        ? `${error.split(":")[0]}: A number is outside the allowed range. Check that Discount is a percentage from 0 to 100 (for example, enter 5 for 5%), and review other numeric values against the template.`
                        : error
                ));
                toast.error(
                    <div>
                        <strong>{resultMessage}</strong>
                        {successCount > 0 && (
                            <div className="mt-1">Rows that succeeded are already saved. Retry only the failed rows to avoid duplicate SKUs.</div>
                        )}
                        {friendlyErrors.length > 0 && (
                            <ul className="mb-0 mt-2 ps-3">
                                {friendlyErrors.slice(0, 5).map((error, index) => (
                                    <li key={`${index}-${error}`}>{error}</li>
                                ))}
                            </ul>
                        )}
                        {friendlyErrors.length > 5 && <div className="mt-1">And {friendlyErrors.length - 5} more row error(s).</div>}
                    </div>,
                    { autoClose: 15000 }
                );
            }
            return res;
        } catch (e) {
            toast.error("Could not upload the CSV. Please try again.");
            console.error("CSV upload failed", e);
            return null;
        } finally {
            setloadingactivity(false);
        }
    };
    const GetJobs = async (page, mechanic_email, job_status, payment_status) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            var body = {
                limit: 10,
                offset: page ? offset : 0,
                mechanic_email,
                job_status: job_status ? job_status : '',
                payment_status: payment_status ? payment_status : ''
            };

            const res = await postAuth("mechanic/jobs/view", body);
            console.log("GetJobs>>", res)

            if (res?.data?.status == 'success') {
                setmechanicJobs(res?.data?.jobs);
                setTotalCount(res?.data?.total_count);
                setPageCount(res?.data?.page_count);
                setHasNext(res?.data?.has_next);
                setCurrentPage(res?.data?.current_page);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
        }
    }
    const JobPayemntStatusUpdate = async (job_id, payment_date) => {
        setloadingactivity(true);
        try {
            var body = {
                payment_date
            }
            const res = await postAuth(`admin/mechanic-job/${job_id}/update-payment`, body);
            console.log(">>res..JobPayemntStatusUpdate.", res);

            if (res?.data?.status == 'success') {
                settoastMessage(res?.message);
                toast.success(res?.message);
                setloadingactivity(false);
                return true
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in vendorVerfication....VEndorcontext", e);
        }
    };
    const GetMechanicTransactions = async (page) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            var body = {
                limit: 10,
                offset: page ? offset : 0,
            };

            const res = await postAuth("admin/orders/view", body);
            console.log(">>res..MechanicTransactions.", res);

            if (res?.data) {

                setmechnanicTransactions(res?.data?.platform_fees);
                setTotalCount(res?.data?.total_count);
                setPageCount(res?.data?.page_count);
                setHasNext(res?.data?.has_next);
                setCurrentPage(res?.data?.current_page);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in ALLorders....VEndorcontext", e);
        }
    };
    return (
        <VendorContext.Provider
            value={{
                AllProduct,
                ProductCategory,
                ProductSubCategory,
                getSpecificProduct,
                AddProduct,
                setCurrentPage,
                VendorStock,
                EditProduct,
                EditProfile,
                currentPage,
                hasNext,
                pageCount,
                totalCount,
                specificProduct,
                setspecificProduct,
                productSubCategory,
                Products,
                productCategory,
                setvariantId,
                variantId,
                vendors,
                settoastMessage,
                toastMessage,
                setimages,
                images,
                AllVendors,
                AllUsers,
                getSpecificUser,
                users,
                getSpecificVendor,
                vendorDetail,
                userDetail,
                setuserDetail,
                VendorProducts,
                vendoritem,
                updateProductStatus,
                AllOrders,
                getNearestVendor,
                NearestVendor,
                orders,
                assignVendor,
                requestProductList,
                requestProducts,
                updateProductRequest,
                addSubCategory,
                getAllSubCategory,
                editSubCategory,
                deleteCommon,
                getStatistics,
                statisticsData,
                toggleProductStatus,
                AddVariant,
                EditVariant,
                addDriver,
                AllDrivers,
                drivers,
                assignDriver,
                EditDriver,
                deleteDriver,
                GetDummyTemplete,
                vendorVerfication,
                PreviewBulkUpload,
                UploadCsv,
                AllMechanics,
                mechanics,
                getSpecificMechanic,
                mechanicDetail,
                getNearestMechanic,
                NearestMechanic,
                assignMechanic,
                GetJobs,
                mechanicJobs,
                JobPayemntStatusUpdate,
                MechanicVerfication,
                GetMechanicTransactions,
                mechnanicTransactions,
                loadingactivity,
                uploadVariantImages,
                deleteProductImage
            }}
        >
            {children}
        </VendorContext.Provider>
    );
};

export { VendorProvider, VendorContext };
