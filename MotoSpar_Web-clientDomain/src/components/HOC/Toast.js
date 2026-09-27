import React from "react";
import {Toast, ToastContainer} from "react-bootstrap";

const ToastComponent = ({show, message, type, onClose}) => {
    const toastStyles = {
        success: {bg: "success", title: "Success"},
        error: {bg: "danger", title: "Error"},
        warning: {bg: "warning", title: "Warning"},
        info: {bg: "info", title: "Info"},
    };

    const {bg, title} = toastStyles[type] || toastStyles.info; // Default to info if type is unknown
    return (
        <ToastContainer position="top-end" className="p-3">
            <Toast show={show} onClose={onClose} delay={5000} autohide>
                <Toast.Header>
                    <strong className="me-auto">{title}</strong>
                    <small>Just now</small>
                </Toast.Header>
                <Toast.Body className={`bg-${bg} text-white`}>{message}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default ToastComponent;
