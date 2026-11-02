import React, { useContext, useEffect, useRef, useState } from "react";
import { Badge, Button } from "react-bootstrap";
import { FaCheckCircle, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../../components/Atoms/DeleteModal";
import PeopleDirectoryPage from "../../../components/Atoms/PeopleDirectoryPage";
import { VendorContext } from "../../../context/VendorContext";

const mechanicName = (mechanic) => mechanic?.full_name || [mechanic?.first_name, mechanic?.last_name].filter(Boolean).join(" ") || "Unnamed mechanic";

const MechanicList = () => {
    const { AllMechanics, currentPage, hasNext, loadingactivity, MechanicVerfication, mechanics, pageCount, setCurrentPage, totalCount } = useContext(VendorContext);
    const navigate = useNavigate();
    const requestRef = useRef(AllMechanics);
    requestRef.current = AllMechanics;
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [pageError, setPageError] = useState("");
    const [verifyTarget, setVerifyTarget] = useState(null);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => setCurrentPage(1), [debouncedSearch, setCurrentPage]);

    useEffect(() => {
        let active = true;
        requestRef.current(currentPage || 1, { search: debouncedSearch }).then((result) => {
            if (active) setPageError(result?.success ? "" : result?.message || "Mechanics could not be loaded.");
        });
        return () => { active = false; };
    }, [currentPage, debouncedSearch]);

    const confirmVerification = async () => {
        if (!verifyTarget || loadingactivity) return;
        const result = await MechanicVerfication(verifyTarget.id);
        if (result?.success) {
            setVerifyTarget(null);
            await requestRef.current(currentPage, { search: debouncedSearch });
        } else {
            setPageError(result?.message || "The mechanic could not be verified.");
            setVerifyTarget(null);
        }
    };

    const columns = [
        { label: "Mechanic" }, { label: "Contact" }, { label: "Service area" },
        { label: "Experience" }, { label: "Verification" }, { label: "Actions", align: "end" },
    ];

    return (
        <>
            <PeopleDirectoryPage
                columns={columns}
                currentPage={currentPage}
                description="Review mechanic identity, service coverage, qualifications and verification state."
                emptyCopy={searchTerm ? "Try a different name, email, phone number or location." : "Mechanic accounts will appear here after registration."}
                emptyTitle={searchTerm ? "No matching mechanics" : "No mechanics found"}
                error={pageError}
                eyebrow="Service professionals"
                hasNext={hasNext}
                headerTitle="Mechanic Management"
                items={mechanics || []}
                loading={loadingactivity}
                onDismissError={() => setPageError("")}
                onSearch={setSearchTerm}
                pageCount={pageCount}
                renderRow={(mechanic) => {
                    const profile = mechanic.mechanic_profile || {};
                    return (
                        <tr key={mechanic.id}>
                            <td><strong>{mechanicName(mechanic)}</strong><span className="people-cell-note">{profile.business_name || "Independent mechanic"}</span></td>
                            <td><strong>{mechanic.email || "No email"}</strong><span className="people-cell-note">{mechanic.phone_number || "No phone number"}</span></td>
                            <td><strong>{profile.base_postal_code || mechanic.postal_code || "No postal code"}</strong><span className="people-cell-note">{[mechanic.city, mechanic.state].filter(Boolean).join(", ") || "Location not set"}</span></td>
                            <td><strong>{profile.years_of_experience != null ? `${profile.years_of_experience} years` : "Not recorded"}</strong><span className="people-cell-note">{profile.specializations || profile.skills || "Skills not recorded"}</span></td>
                            <td>{mechanic.is_verified ? <Badge bg="success">Verified</Badge> : <Button variant="outline-success" size="sm" onClick={() => setVerifyTarget(mechanic)}><FaCheckCircle />Verify</Button>}</td>
                            <td><div className="people-row-actions"><Button variant="outline-secondary" size="sm" onClick={() => navigate("/mechanicDetail", { state: { MechanicId: mechanic.id } })}><FaEye />View profile</Button></div></td>
                        </tr>
                    );
                }}
                searchPlaceholder="Search name, email, phone or location"
                searchTerm={searchTerm}
                setCurrentPage={setCurrentPage}
                title="Mechanics"
                totalCount={totalCount}
            />
            <DeleteConfirmationModal show={Boolean(verifyTarget)} onCancel={() => !loadingactivity && setVerifyTarget(null)} onDeleteConfirm={confirmVerification} title="Verify this mechanic?" message={`Confirm that ${mechanicName(verifyTarget)} has passed the required identity and qualification checks.`} confirmLabel={loadingactivity ? "Verifying…" : "Confirm verification"} confirmVariant="success" isLoading={loadingactivity} />
        </>
    );
};

export default MechanicList;
