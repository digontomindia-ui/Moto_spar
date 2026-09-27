import React, { createContext, useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
    getAuth,
    getCommon,
    PatchAuth,
    patchFormdatatAuth,
    postCommon,
    postFormdatatAuth,
    postGoogle,
    postUser,
    postUserLogout,
} from "../repository/Repo";
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
    const [vendorPrice, setvendorPrice] = useState();
    const [stockQty, setstockQty] = useState();
    const [toastMessage, settoastMessage] = useState("");
    const [vendorProfile, setvendorProfile] = useState("");
    const [profileImg, setprofileImg] = useState("");
    const [productImages, setproductImages] = useState([]);
    const [analyticsData, setanalyticsData] = useState("");
    const [orders, setorders] = useState([]);
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

            const res = await postCommon("products/search/", body);
            console.log(">>res..Product.", res);

            if (res?.data) {
                // dispatch({
                //     type: "SET_USER_DATA",
                //     payload: res?.data?.products,
                // });
                setProducts(res?.data?.products);
                setTotalCount(res?.data?.total_count);
                setPageCount(res?.data?.page_count);
                setHasNext(res?.data?.has_next);
                setCurrentPage(res?.data?.current_page);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
                console.log(res?.message);
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
                console.log(res?.message);
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
                console.log(res?.message);
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
                setspecificProduct(res?.data);

                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
                console.log(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in getSpecificProduct....VEndorcontext", e);
        }
    };

    const AddProduct = async (variantId, stockQty, price) => {
        setloadingactivity(true);
        try {
            var body = {
                variant: variantId,
                stock_quantity: stockQty,
                in_stock: stockQty > 0 ? true : false,
                price: price,
            };
            const res = await postUserLogout("vendor/vendors/stock/add", body);
            console.log(">>res..AddProduct.", res);

            if (res?.data) {
                toast.success(res?.message);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
                console.log(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in AddProduct....VEndorcontext", e);
        }
    };
    const EditProduct = async (Id, stockQty, price) => {
        setloadingactivity(true);
        try {
            var body = {
                stock_quantity: stockQty,
                in_stock: stockQty > 0 ? true : false,
                price: price,
            };
            const res = await PatchAuth(`vendor/vendors/stock/${Id}/edit`, body);
            console.log(">>res..EditProduct.", res);

            if (res?.data) {
                toast.success(res?.message);

                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
                console.log(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in EditProduct....VEndorcontext", e);
        }
    };
    const VendorStock = async (page, id) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            var body = {
                limit: 10,
                offset: offset,
            };

            const res = await postUserLogout(`vendors/stock/${id}/list`, body);
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
            formData.append("store_name", data?.shopName);
            formData.append("store_address", data?.address);
            formData.append("store_contact_email", data?.email);
            formData.append("store_contact_phone", data?.phone_number);
            formData.append("latitude", data?.lat);
            formData.append("longitude", data?.long);
            formData.append("bank_account_number", data?.accountNumber);
            formData.append("bank_name", data?.bankName);
            formData.append("ifsc_code", data?.ifsc);
            formData.append("gst_number", data?.gstNumber);
            formData.append("store_postal_code", data?.pincode);
            formData.append("store_state", data?.state);
            formData.append("store_city", data?.city);
            if (data.shop_image) {
                formData.append("store_logo", data?.shop_image); // Add image only if it's present
            }
            const res = await patchFormdatatAuth(`vendor/vendors/${data?.id}/edit`, formData);
            console.log(">>res..EditProfile.", res?.data?.vendor_profile?.store_logo);

            if (res?.data) {
                localStorage.setItem("vendor_shopdetail", JSON.stringify(res?.data.vendor_profile));

                dispatch({
                    type: "SET_SHOP_DETAIL",
                    payload: res?.data?.vendor_profile,
                });
                toast.success(res?.message);

                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);

            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in EditProfile....VEndorcontext", e);
        }
    };
    const getvendorDetail = async (id) => {
        setloadingactivity(true);
        try {
            const res = await getAuth(`vendor/vendors/${id}/view/`);
            console.log(">>res..getvendorDetail.", res);

            if (res?.data) {
                // dispatch({
                //     type: "SET_USER_DATA",
                //     payload: res?.data?.products,
                // });
                setprofileImg(res?.data?.vendor?.store_logo);
                setvendorProfile(res?.data?.vendor);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
                console.log(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in getvendorDetail....VEndorcontext", e);
        }
    };
    const AddProductRequest = async (
        name,
        description,
        brand,
        model,
        year,
        price,
        weight,
        discount,
        color,
        size,
        dimensions,
        material,
        features,
        categoryId,
        subCategoryId
    ) => {
        setloadingactivity(true);
        // console.log("details from addproduct>>", name, categoryId, description);
        try {
            const formData = new FormData();

            // Add product details
            formData.append("name", name);
            formData.append("category", categoryId);
            formData.append("sub_category", subCategoryId);
            formData.append("description", description);
            formData.append("brand", brand);
            formData.append("model", model);
            formData.append("year", year);
            formData.append("price", price);
            formData.append("discount", discount);
            formData.append("color", color);
            formData.append("size", size);
            formData.append("weight", weight);
            formData.append("dimesnions", dimensions);
            formData.append("material", material);
            formData.append("features", features);
            if (productImages && productImages.length > 0) {
                productImages?.forEach((item) => {
                    formData.append("images", item);
                });
            }
            const res = await postFormdatatAuth("vendor/product-request/add", formData);
            console.log(">>res..AddProductRequest.", res);
            if (res?.data) {
                toast.success(res?.message);
                setloadingactivity(false);
                setproductImages([]);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
                console.log(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in AddProductRequest....VEndorcontext", e);
        }
    };
    const VendorAnalytics = async () => {
        setloadingactivity(true);
        try {
            const res = await getAuth(`vendor/statistics/`);
            console.log(">>res..VendorAnalytics.", res);

            if (res?.data) {
                setanalyticsData(res?.data);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
                console.log(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in VendorAnalytics....VEndorcontext", e);
        }
    };
    const AllOrders = async (page) => {
        setloadingactivity(true);
        try {
            const offset = (page - 1) * 10;

            var body = {
                limit: 10,
                offset: page ? offset : 0,
            };

            const res = await postUserLogout("vendor/orders", body);

            if (res?.data) {
                console.log(">>>>>>o", res?.data?.orders);
                setorders(res?.data?.orders);
                setTotalCount(res?.data?.total_count);
                setPageCount(res?.data?.page_count);
                setHasNext(res?.data?.has_next);
                setCurrentPage(res?.data?.current_page);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
                console.log(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in ALLorders....VEndorcontext", e);
        }
    };
    const updateProductStatus = async (Id, order_status) => {
        setloadingactivity(true);

        try {
            var body = {
                order_status,
            };
            const res = await PatchAuth(`order-item/${Id}/update-status`, body);
            console.log(">>res..updateProductStatus.", res);

            if (res?.data) {
                toast.success(res?.message);
                setloadingactivity(false);
            } else {
                setloadingactivity(false);
                toast.error(res?.message);
                console.log(res?.message);
            }
        } catch (e) {
            setloadingactivity(false);
            console.log("errorr... in updateProductStatus....VEndorcontext", e);
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
                specificProduct,
                setspecificProduct,
                productSubCategory,
                Products,
                productCategory,
                setvariantId,
                variantId,
                setvendorPrice,
                vendorPrice,
                setstockQty,
                stockQty,
                toastMessage,
                getvendorDetail,
                vendorProfile,
                profileImg,
                AddProductRequest,
                setproductImages,
                productImages,
                VendorAnalytics,
                analyticsData,
                AllOrders,
                orders,
                updateProductStatus,
                settoastMessage,
            }}
        >
            {children}
        </VendorContext.Provider>
    );
};
export { VendorProvider, VendorContext };
