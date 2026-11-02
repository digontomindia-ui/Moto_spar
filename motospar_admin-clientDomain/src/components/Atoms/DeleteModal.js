import React from "react";
import { Button, Modal, Spinner } from "react-bootstrap";

const DeleteConfirmationModal = ({
    message,
    show,
    onDeleteConfirm,
    onCancel,
    title = "Delete this item?",
    confirmLabel = "Delete",
    confirmVariant = "danger",
    isLoading = false,
}) => {
    return (
        <Modal show={show} onHide={onCancel} centered backdrop={isLoading ? "static" : true}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button variant={confirmVariant} onClick={onDeleteConfirm} disabled={isLoading}>
                    {isLoading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                    {confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteConfirmationModal;
