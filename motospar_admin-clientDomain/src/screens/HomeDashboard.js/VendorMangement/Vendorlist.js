import React, { useContext, useEffect, useRef, useState } from "react";
import { Badge, Button } from "react-bootstrap";
import { FaCheckCircle, FaEye } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../../components/Atoms/DeleteModal";
import PeopleDirectoryPage from "../../../components/Atoms/PeopleDirectoryPage";
import { VendorContext } from "../../../context/VendorContext";

const vendorName = (vendor) => vendor?.store_name || [vendor?.first_name, vendor?.last_name].filter(Boolean).join(" ") || "Unnamed vendor";

const Vendorlist = () => {
    const { AllVendors, currentPage, deleteCommon, hasNext, loadingactivity, pageCount, setCurrentPage, totalCount, vendorVerfication, vendors } = useContext(VendorContext);
    const navigate = useNavigate();
    const requestRef = useRef(AllVendors);
    requestRef.current = AllVendors;
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [pageError, setPageError] = useState("");
    const [verifyTarget, setVerifyTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => setCurrentPage(1), [debouncedSearch, setCurrentPage]);

    useEffect(() => {
        let active = true;
        requestRef.current(currentPage || 1, { search: debouncedSearch }).then((result) => {
            if (active) setPageError(result?.success ? "" : result?.message || "Vendors could not be loaded.");
        });
        return () => { active = false; };
    }, [currentPage, debouncedSearch]);

    const refresh = () => requestRef.current(currentPage, { search: debouncedSearch });

    const confirmVerification = async () => {
        if (!verifyTarget || loadingactivity) return;
        const result = await vendorVerfication(verifyTarget.user);
        if (result?.success) {
            setVerifyTarget(null);
            await refresh();
        } else {
            setPageError(result?.message || "The vendor could not be verified.");
            setVerifyTarget(null);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget || loadingactivity) return;
        const result = await deleteCommon(`admin/vendors/${deleteTarget.id}/delete`);
        if (result?.success) {
            setDeleteTarget(null);
            if ((vendors || []).length === 1 && currentPage > 1) setCurrentPage((page) => page - 1);
            else await refresh();
        } else {
            setPageError(result?.message || "The vendor could not be deleted.");
            setDeleteTarget(null);
        }
    };

    const columns = [
        { label: "Vendor" }, { label: "Contact" }, { label: "Location" },
        { label: "Business" }, { label: "Verification" }, { label: "Actions", align: "end" },
    ];

    return (
        <>
            <PeopleDirectoryPage
                columns={columns}
                currentPage={currentPage}
                description="Review vendor businesses, contact details, locations and verification state."
                emptyCopy={searchTerm ? "Try a different business name, email, phone number or location." : "Vendor profiles will appear here after registration."}
                emptyTitle={searchTerm ? "No matching vendors" : "No vendors found"}
                error={pageError}
                eyebrow="Marketplace partners"
                hasNext={hasNext}
                headerTitle="Vendor Management"
                items={vendors || []}
                loading={loadingactivity}
                onDismissError={() => setPageError("")}
                onSearch={setSearchTerm}
                pageCount={pageCount}
                renderRow={(vendor) => (
                    <tr key={vendor.id}>
                        <td><strong>{vendorName(vendor)}</strong><span className="people-cell-note">{[vendor.first_name, vendor.last_name].filter(Boolean).join(" ") || "Owner name not set"}</span></td>
                        <td><strong>{vendor.store_contact_email || vendor.email || "No email"}</strong><span className="people-cell-note">{vendor.store_contact_phone || vendor.phone_number || "No phone number"}</span></td>
                        <td><strong>{[vendor.store_city, vendor.store_state].filter(Boolean).join(", ") || "Location not set"}</strong><span className="people-cell-note">{[vendor.store_postal_code, vendor.store_country].filter(Boolean).join(" · ") || "No postal details"}</span></td>
                        <td><strong>{vendor.gst_number || "GST not recorded"}</strong><span className="people-cell-note">{vendor.website_url || "No website"}</span></td>
                        <td>{vendor.is_verified ? <Badge bg="success">Verified</Badge> : <Button variant="outline-success" size="sm" onClick={() => setVerifyTarget(vendor)}><FaCheckCircle />Verify</Button>}</td>
                        <td><div className="people-row-actions"><Button variant="outline-secondary" size="sm" onClick={() => navigate("/vendorDetail", { state: { vendorId: vendor.user } })}><FaEye />View profile</Button><Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(vendor)}><FiTrash2 /><span className="visually-hidden">Delete {vendorName(vendor)}</span></Button></div></td>
                    </tr>
                )}
                searchPlaceholder="Search business, contact or location"
                searchTerm={searchTerm}
                setCurrentPage={setCurrentPage}
                title="Vendors"
                totalCount={totalCount}
            />
            <DeleteConfirmationModal show={Boolean(verifyTarget)} onCancel={() => !loadingactivity && setVerifyTarget(null)} onDeleteConfirm={confirmVerification} title="Verify this vendor?" message={`Confirm that ${vendorName(verifyTarget)} has passed the required business checks.`} confirmLabel={loadingactivity ? "Verifying…" : "Confirm verification"} confirmVariant="success" isLoading={loadingactivity} />
            <DeleteConfirmationModal show={Boolean(deleteTarget)} onCancel={() => !loadingactivity && setDeleteTarget(null)} onDeleteConfirm={confirmDelete} title="Delete this vendor?" message={`${vendorName(deleteTarget)} will be removed from the active vendor directory. This action cannot be undone.`} isLoading={loadingactivity} />
        </>
    );
};

export default Vendorlist;
