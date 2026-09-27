import React from "react";
import {Button, Modal} from "react-bootstrap";

const DeleteConfirmationModal = ({message, show, onDeleteConfirm, onCancel}) => {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Are you sure you want to delete it?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onDeleteConfirm}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteConfirmationModal;
