import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Form, Offcanvas, Spinner, Table } from "react-bootstrap";
import { AiFillDelete, AiFillEdit, AiOutlineSearch } from "react-icons/ai";
import { FaArrowLeft, FaArrowRight, FaImage, FaLayerGroup, FaPlus } from "react-icons/fa";
import DeleteConfirmationModal from "../../components/Atoms/DeleteModal";
import Sidebar from "../../components/Atoms/Sidebar";
import Header from "../../components/HOC/Header";
import { VendorContext } from "../../context/VendorContext";
import { FALLBACK_IMAGE, resolveImageUrl } from "../../utils/imageUtils";
import "../../assets/Css/ProductManagement.css";

const emptyForm = {
    categoryId: "",
    name: "",
    description: "",
    image: "",
};

const AddSubCategory = () => {
    const {
        ProductCategory,
        getAllSubCategory,
        productSubCategory,
        addSubCategory,
        productCategory,
        setCurrentPage,
        currentPage,
        hasNext,
        pageCount,
        editSubCategory,
        deleteCommon,
        loadingactivity,
    } = useContext(VendorContext);
    const categoryRequestRef = useRef(ProductCategory);
    const subcategoryRequestRef = useRef(getAllSubCategory);
    categoryRequestRef.current = ProductCategory;
    subcategoryRequestRef.current = getAllSubCategory;

    const [showSidebar, setShowSidebar] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [subcategoryToDelete, setSubcategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        categoryRequestRef.current();
    }, []);

    useEffect(() => {
        subcategoryRequestRef.current(currentPage);
    }, [currentPage]);

    const filteredSubcategories = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return productSubCategory || [];
        return (productSubCategory || []).filter((subcategory) =>
            [subcategory?.name, subcategory?.category?.name]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))
        );
    }, [productSubCategory, searchTerm]);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setFormError("");
    };

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setFormError("");
    };

    const saveSubcategory = async () => {
        if (isSaving || loadingactivity) return;
        if (!form.categoryId) {
            setFormError("Choose the parent category.");
            return;
        }
        if (!form.name.trim()) {
            setFormError("Enter a sub-category name.");
            return;
        }
        if (form.image && !/^https?:\/\//i.test(form.image) && !form.image.startsWith("s3://")) {
            setFormError("Enter a complete https:// or s3:// image URL, or leave the image blank.");
            return;
        }

        setIsSaving(true);
        const result = editingId
            ? await editSubCategory({
                subCategoryId: editingId,
                categoryId: form.categoryId,
                subCategoryName: form.name.trim(),
                description: form.description.trim(),
                image: form.image.trim(),
            })
            : await addSubCategory(
                form.categoryId,
                form.name.trim(),
                form.description.trim(),
                form.image.trim()
            );

        if (result?.status === true) {
            resetForm();
            await subcategoryRequestRef.current(currentPage);
        } else {
            setFormError(result?.message || "The sub-category could not be saved.");
        }
        setIsSaving(false);
    };

    const beginEdit = (subcategory) => {
        setEditingId(subcategory.id);
        setForm({
            categoryId: subcategory?.category?.id || "",
            name: subcategory?.name || "",
            description: subcategory?.description || "",
            image: subcategory?.image || "",
        });
        setFormError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const confirmDelete = async () => {
        if (!subcategoryToDelete?.id || isDeleting) return;
        setIsDeleting(true);
        const result = await deleteCommon(`admin/sub-categories/${subcategoryToDelete.id}/delete`);
        if (result?.status === true || result?.data?.status === "success") {
            const moveBack = filteredSubcategories.length === 1 && currentPage > 1;
            setSubcategoryToDelete(null);
            if (moveBack) setCurrentPage((page) => page - 1);
            else await subcategoryRequestRef.current(currentPage);
        }
        setIsDeleting(false);
    };

    return (
        <div className="d-flex product-management-shell">
            <div className="d-none d-md-block"><Sidebar /></div>
            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="bg-dark text-white">
                <Offcanvas.Header closeButton closeVariant="white"><Offcanvas.Title>Menu</Offcanvas.Title></Offcanvas.Header>
                <Offcanvas.Body className="p-0"><Sidebar /></Offcanvas.Body>
            </Offcanvas>

            <main className="product-management-main">
                <Header title="Product Management" toggleSidebar={() => setShowSidebar((visible) => !visible)} />
                <div className="product-management-page">
                    <section className="product-management-heading">
                        <div>
                            <span className="product-management-eyebrow">Catalogue settings</span>
                            <h2>Sub-categories</h2>
                            <p>Organise products under consistent categories so search and CSV imports stay reliable.</p>
                        </div>
                        <Button className="savebtn" onClick={resetForm} disabled={!editingId}>
                            <FaPlus className="me-2" />New sub-category
                        </Button>
                    </section>

                    <div className="category-layout">
                        <Card className="product-management-card category-form-card">
                            <Card.Body>
                                <span className="product-management-eyebrow">{editingId ? "Editing" : "Create"}</span>
                                <h3>{editingId ? "Edit sub-category" : "Add sub-category"}</h3>
                                <p className="text-muted">Names are normalised by the server to prevent accidental duplicates.</p>

                                {formError ? <Alert variant="danger">{formError}</Alert> : null}

                                <Form.Group className="mb-3" controlId="subcategory-category">
                                    <Form.Label>Parent category <span className="text-danger">*</span></Form.Label>
                                    <Form.Select value={form.categoryId} onChange={(event) => updateField("categoryId", event.target.value)}>
                                        <option value="">Choose a category</option>
                                        {(productCategory || []).map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="subcategory-name">
                                    <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        value={form.name}
                                        onChange={(event) => updateField("name", event.target.value)}
                                        placeholder="e.g. Tail lights"
                                        maxLength={255}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="subcategory-description">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={form.description}
                                        onChange={(event) => updateField("description", event.target.value)}
                                        placeholder="Explain what belongs in this sub-category"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="subcategory-image">
                                    <Form.Label>Image URL</Form.Label>
                                    <Form.Control
                                        type="url"
                                        value={form.image}
                                        onChange={(event) => updateField("image", event.target.value)}
                                        placeholder="https://… or s3://…"
                                    />
                                    <Form.Text>Optional. Use a stable URL from approved media storage.</Form.Text>
                                </Form.Group>

                                {form.image ? (
                                    <div className="category-image-preview">
                                        <img
                                            src={resolveImageUrl(form.image)}
                                            alt="Sub-category preview"
                                            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }}
                                        />
                                        <Button variant="light" size="sm" onClick={() => updateField("image", "")}>Remove image</Button>
                                    </div>
                                ) : null}

                                <div className="product-management-actions mt-4">
                                    {editingId ? <Button variant="outline-secondary" onClick={resetForm} disabled={isSaving}>Cancel</Button> : null}
                                    <Button className="savebtn" onClick={saveSubcategory} disabled={isSaving || loadingactivity}>
                                        {isSaving ? "Saving…" : editingId ? "Save changes" : "Create sub-category"}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="product-management-card category-list-card">
                            <Card.Header className="category-list-toolbar">
                                <div>
                                    <h3>Catalogue structure</h3>
                                    <span>Page {currentPage || 1} of {pageCount || 1}</span>
                                </div>
                                <div className="product-search-field">
                                    <AiOutlineSearch aria-hidden="true" />
                                    <Form.Control
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search this page"
                                        aria-label="Search sub-categories"
                                    />
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {loadingactivity && !(productSubCategory || []).length ? (
                                    <div className="category-empty-state"><Spinner animation="border" /><strong>Loading sub-categories</strong></div>
                                ) : filteredSubcategories.length ? (
                                    <div className="table-responsive">
                                        <Table hover className="category-table align-middle mb-0">
                                            <thead><tr><th>Sub-category</th><th>Parent category</th><th className="text-end">Actions</th></tr></thead>
                                            <tbody>
                                                {filteredSubcategories.map((subcategory) => (
                                                    <tr key={subcategory.id}>
                                                        <td>
                                                            <div className="category-name-cell">
                                                                {subcategory.image ? <img src={resolveImageUrl(subcategory.image)} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }} /> : <span><FaImage /></span>}
                                                                <div><strong>{subcategory.name || "Untitled"}</strong><small>{subcategory.description || "No description"}</small></div>
                                                            </div>
                                                        </td>
                                                        <td>{subcategory?.category?.name || "Unassigned"}</td>
                                                        <td><div className="product-row-actions">
                                                            <Button variant="outline-success" size="sm" aria-label={`Edit ${subcategory.name}`} onClick={() => beginEdit(subcategory)}><AiFillEdit /></Button>
                                                            <Button variant="outline-danger" size="sm" aria-label={`Delete ${subcategory.name}`} onClick={() => setSubcategoryToDelete(subcategory)}><AiFillDelete /></Button>
                                                        </div></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="category-empty-state"><FaLayerGroup /><strong>{searchTerm ? "No matching sub-categories" : "No sub-categories yet"}</strong><span>{searchTerm ? "Try another search term." : "Create the first one using the form."}</span></div>
                                )}
                            </Card.Body>
                            <Card.Footer className="category-pagination">
                                <Button variant="light" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1 || loadingactivity}><FaArrowLeft /> Previous</Button>
                                <Button variant="light" onClick={() => setCurrentPage((page) => page + 1)} disabled={!hasNext || loadingactivity}>Next <FaArrowRight /></Button>
                            </Card.Footer>
                        </Card>
                    </div>
                </div>
            </main>

            <DeleteConfirmationModal
                show={Boolean(subcategoryToDelete)}
                onDeleteConfirm={confirmDelete}
                onCancel={() => !isDeleting && setSubcategoryToDelete(null)}
                title="Delete sub-category?"
                confirmLabel={isDeleting ? "Deleting…" : "Delete sub-category"}
                isLoading={isDeleting}
                message={`“${subcategoryToDelete?.name || "This sub-category"}” will be permanently deleted. Products may prevent deletion while they still reference it.`}
            />
        </div>
    );
};

export default AddSubCategory;
