import React, { useContext, useEffect, useRef, useState } from "react";
import { Badge, Button } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PeopleDirectoryPage from "../../../components/Atoms/PeopleDirectoryPage";
import { VendorContext } from "../../../context/VendorContext";

const formatDate = (value) => value
    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value))
    : "Not recorded";

const UserList = () => {
    const { AllUsers, currentPage, hasNext, loadingactivity, pageCount, setCurrentPage, totalCount, users } = useContext(VendorContext);
    const navigate = useNavigate();
    const requestRef = useRef(AllUsers);
    requestRef.current = AllUsers;
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [pageError, setPageError] = useState("");

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => setCurrentPage(1), [debouncedSearch, setCurrentPage]);

    useEffect(() => {
        let active = true;
        requestRef.current(currentPage || 1, { search: debouncedSearch }).then((result) => {
            if (active) setPageError(result?.success ? "" : result?.message || "Customers could not be loaded.");
        });
        return () => { active = false; };
    }, [currentPage, debouncedSearch]);

    const columns = [
        { label: "Customer" }, { label: "Contact" }, { label: "Location" },
        { label: "Joined" }, { label: "Account" }, { label: "Actions", align: "end" },
    ];

    return (
        <PeopleDirectoryPage
            columns={columns}
            currentPage={currentPage}
            description="Review customer identity, contact information, location and account state."
            emptyCopy={searchTerm ? "Try a different name, email, phone number or location." : "Customer accounts will appear here after registration."}
            emptyTitle={searchTerm ? "No matching customers" : "No customers found"}
            error={pageError}
            eyebrow="Customer accounts"
            hasNext={hasNext}
            headerTitle="User Management"
            items={users || []}
            loading={loadingactivity}
            onDismissError={() => setPageError("")}
            onSearch={setSearchTerm}
            pageCount={pageCount}
            renderRow={(user) => (
                <tr key={user.id}>
                    <td><strong>{user.full_name || [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unnamed customer"}</strong><span className="people-cell-note">ID {user.id}</span></td>
                    <td><strong>{user.email || "No email"}</strong><span className="people-cell-note">{user.phone_number || "No phone number"}</span></td>
                    <td><strong>{[user.city, user.state].filter(Boolean).join(", ") || "Location not set"}</strong><span className="people-cell-note">{[user.postal_code, user.country].filter(Boolean).join(" · ") || "No postal details"}</span></td>
                    <td><strong>{formatDate(user.date_joined)}</strong></td>
                    <td><Badge bg={user.is_active ? "success" : "secondary"}>{user.is_active ? "Active" : "Inactive"}</Badge><span className="people-cell-note">{user.is_verified ? "Identity verified" : "Not verified"}</span></td>
                    <td><div className="people-row-actions"><Button variant="outline-secondary" size="sm" onClick={() => navigate(`/userDetail/${user.id}`, { state: { userDetail: user } })}><FaEye />View profile</Button></div></td>
                </tr>
            )}
            searchPlaceholder="Search name, email, phone or location"
            searchTerm={searchTerm}
            setCurrentPage={setCurrentPage}
            title="Customers"
            totalCount={totalCount}
        />
    );
};

export default UserList;
