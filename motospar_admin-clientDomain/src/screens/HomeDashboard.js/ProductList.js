import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Badge, Button, Card, Form, Offcanvas, Spinner, Table } from "react-bootstrap";
import { AiFillDelete, AiOutlineSearch } from "react-icons/ai";
import { FaArrowLeft, FaArrowRight, FaBoxOpen, FaFileCsv, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../components/Atoms/DeleteModal";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import { VendorContext } from "../../context/VendorContext";
import { FALLBACK_IMAGE, resolveImageUrl } from "../../utils/imageUtils";
import "../../assets/Css/ProductList.css";

const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

const getStock = (product) =>
    (product?.variants || []).reduce((total, variant) => total + (Number(variant?.quantity_in_stock) || 0), 0);

const getPrice = (product) => {
    const prices = (product?.variants || [])
        .map((variant) => Number(variant?.final_listing_price_on_motospar))
        .filter(Number.isFinite);
    if (!prices.length) return "Not set";

    const minimum = Math.min(...prices);
    const maximum = Math.max(...prices);
    return minimum === maximum ? currency.format(minimum) : `${currency.format(minimum)} – ${currency.format(maximum)}`;
};

const ProductList = () => {
    const navigate = useNavigate();
    const {
        AllProduct,
        Products,
        setspecificProduct,
        setCurrentPage,
        currentPage,
        hasNext,
        pageCount,
        deleteCommon,
        loadingactivity,
    } = useContext(VendorContext);
    const productRequestRef = useRef(AllProduct);
    productRequestRef.current = AllProduct;

    const [searchTerm, setSearchTerm] = useState("");
    const [showSidebar, setShowSidebar] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        productRequestRef.current(currentPage);
    }, [currentPage]);

    const filteredProducts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return Products || [];

        return (Products || []).filter((product) =>
            [product?.name, product?.code, product?.brand, product?.category?.name, product?.sub_category?.name]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))
        );
    }, [Products, searchTerm]);

    const openProduct = (product) => {
        setspecificProduct(product);
        navigate("/editSpecificProductpage");
    };

    const confirmDelete = async () => {
        if (!productToDelete?.id || isDeleting) return;
        setIsDeleting(true);
        const response = await deleteCommon(`admin/products/${productToDelete.id}/delete`);
        const succeeded = response?.status === true || response?.data?.status === "success";

        if (succeeded) {
            const shouldMoveBack = filteredProducts.length === 1 && currentPage > 1;
            if (shouldMoveBack) {
                setCurrentPage((page) => page - 1);
            } else {
                await productRequestRef.current(currentPage);
            }
            setProductToDelete(null);
        }
        setIsDeleting(false);
    };

    return (
        <div className="d-flex admin-list-shell">
            <div className="d-none d-md-block">
                <Sidebar />
            </div>

            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="bg-dark text-white">
                <Offcanvas.Header closeButton closeVariant="white">
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <Sidebar />
                </Offcanvas.Body>
            </Offcanvas>

            <main className="admin-list-main">
                <Header title="Product Management" toggleSidebar={() => setShowSidebar((visible) => !visible)} />

                <div className="product-list-page">
                    <section className="product-list-heading">
                        <div>
                            <span className="product-list-eyebrow">Catalogue</span>
                            <h2>Products</h2>
                            <p>Review product details, variants, stock and images from one place.</p>
                        </div>
                        <div className="product-list-heading-actions">
                            <Button variant="outline-secondary" onClick={() => navigate("/addProductbyCsv")}>
                                <FaFileCsv className="me-2" aria-hidden="true" />
                                Import CSV
                            </Button>
                            <Button className="savebtn" onClick={() => navigate("/addProduct")}>
                                <FaPlus className="me-2" aria-hidden="true" />
                                Add product
                            </Button>
                        </div>
                    </section>

                    <Card className="product-list-card">
                        <Card.Header className="product-list-toolbar">
                            <div className="product-search-field">
                                <AiOutlineSearch aria-hidden="true" />
                                <Form.Control
                                    type="search"
                                    placeholder="Search this page by product, code, brand or category"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    aria-label="Search products"
                                />
                            </div>
                            <div className="product-pagination">
                                <span>
                                    Page <strong>{currentPage || 1}</strong> of <strong>{pageCount || 1}</strong>
                                </span>
                                <Button
                                    variant="light"
                                    aria-label="Previous page"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={currentPage <= 1 || loadingactivity}
                                >
                                    <FaArrowLeft aria-hidden="true" />
                                </Button>
                                <Button
                                    variant="light"
                                    aria-label="Next page"
                                    onClick={() => setCurrentPage((page) => page + 1)}
                                    disabled={!hasNext || loadingactivity}
                                >
                                    <FaArrowRight aria-hidden="true" />
                                </Button>
                            </div>
                        </Card.Header>

                        <Card.Body className="p-0">
                            {loadingactivity && !(Products || []).length ? (
                                <div className="product-list-state">
                                    <Spinner animation="border" />
                                    <strong>Loading products</strong>
                                </div>
                            ) : filteredProducts.length ? (
                                <div className="table-responsive">
                                    <Table hover className="product-list-table align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Category</th>
                                                <th>Variants</th>
                                                <th>Stock</th>
                                                <th>Price</th>
                                                <th>GST</th>
                                                <th>Created</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.map((product) => {
                                                const primaryImage = product?.variants?.[0]?.images?.[0];
                                                const stock = getStock(product);

                                                return (
                                                    <tr key={product?.id}>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="product-cell-button"
                                                                onClick={() => openProduct(product)}
                                                            >
                                                                <img
                                                                    src={resolveImageUrl(primaryImage)}
                                                                    alt=""
                                                                    onError={(event) => {
                                                                        event.currentTarget.onerror = null;
                                                                        event.currentTarget.src = FALLBACK_IMAGE;
                                                                    }}
                                                                />
                                                                <span>
                                                                    <strong>{product?.name || "Untitled product"}</strong>
                                                                    <small>{product?.code || "No product code"}</small>
                                                                </span>
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <strong className="product-category-name">
                                                                {product?.category?.name || "Uncategorised"}
                                                            </strong>
                                                            <small>{product?.sub_category?.name || "No subcategory"}</small>
                                                        </td>
                                                        <td>{product?.variants?.length || 0}</td>
                                                        <td>
                                                            <Badge bg={stock > 0 ? "success" : "secondary"} pill>
                                                                {stock > 0 ? `${stock} in stock` : "Out of stock"}
                                                            </Badge>
                                                        </td>
                                                        <td>{getPrice(product)}</td>
                                                        <td>{product?.is_gst_applicable ? `${product?.gst_rate || 0}%` : "Not applied"}</td>
                                                        <td>{dayjs(product?.created_at).format("DD MMM YYYY")}</td>
                                                        <td>
                                                            <div className="product-row-actions">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => openProduct(product)}
                                                                >
                                                                    Manage
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    aria-label={`Delete ${product?.name || "product"}`}
                                                                    onClick={() => setProductToDelete(product)}
                                                                >
                                                                    <AiFillDelete aria-hidden="true" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="product-list-state">
                                    <FaBoxOpen aria-hidden="true" />
                                    <strong>{searchTerm ? "No matching products" : "No products yet"}</strong>
                                    <span>
                                        {searchTerm
                                            ? "Try another name, code, brand or category on this page."
                                            : "Add the first product to start building the catalogue."}
                                    </span>
                                    {!searchTerm ? (
                                        <Button className="savebtn mt-3" onClick={() => navigate("/addProduct")}>
                                            Add product
                                        </Button>
                                    ) : null}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </main>

            <DeleteConfirmationModal
                show={Boolean(productToDelete)}
                onDeleteConfirm={confirmDelete}
                onCancel={() => !isDeleting && setProductToDelete(null)}
                title="Delete product?"
                confirmLabel={isDeleting ? "Deleting..." : "Delete product"}
                isLoading={isDeleting}
                message={`“${productToDelete?.name || "This product"}” and its variants will be permanently deleted. This cannot be undone.`}
            />
        </div>
    );
};

export default ProductList;
