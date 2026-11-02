import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Button, Image, Alert, Badge } from "react-bootstrap";
import { AiOutlineUpload, AiFillDelete, AiOutlineClose } from "react-icons/ai";
import { VendorContext } from "../../context/VendorContext";
import { formatFileSize, FALLBACK_IMAGE } from "../../utils/imageUtils";
import "../../assets/Css/ProductForm.css";

const ACCEPTED_IMAGE_TYPES = {
    "image/jpeg": [".jpeg", ".jpg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/gif": [".gif"],
};

const ProductImageUpload = ({
    files: propFiles,
    onChangeFiles: propOnChangeFiles,
    maxFiles = 10,
    maxSizeMB = 10,
    disabled = false,
}) => {
    const context = useContext(VendorContext) || {};
    const contextImages = context.productImages;
    const currentImages = useMemo(
        () => (Array.isArray(propFiles) ? propFiles : (Array.isArray(contextImages) ? contextImages : [])),
        [propFiles, contextImages]
    );
    const setCurrentImages = propOnChangeFiles !== undefined ? propOnChangeFiles : context.setproductImages;

    const [errorMessage, setErrorMessage] = useState(null);
    const [previews, setPreviews] = useState([]);
    const activeUrlsRef = useRef(new Map());

    // Generate or retrieve cached preview URLs for current images
    useEffect(() => {
        const currentFilesSet = new Set(currentImages);

        // Revoke any URLs for files no longer in currentImages
        for (const [file, url] of activeUrlsRef.current.entries()) {
            if (!currentFilesSet.has(file)) {
                try {
                    URL.revokeObjectURL(url);
                } catch (_) {}
                activeUrlsRef.current.delete(file);
            }
        }

        // Build preview list using cached or new object URLs
        const updatedPreviews = currentImages.map((file) => {
            if (activeUrlsRef.current.has(file)) {
                return { file, url: activeUrlsRef.current.get(file) };
            }
            try {
                const url = URL.createObjectURL(file);
                activeUrlsRef.current.set(file, url);
                return { file, url };
            } catch (_) {
                return { file, url: FALLBACK_IMAGE };
            }
        });

        setPreviews(updatedPreviews);
    }, [currentImages]);

    // Clean up all active preview object URLs strictly on component unmount
    useEffect(() => {
        const activeUrls = activeUrlsRef.current;
        return () => {
            activeUrls.forEach((url) => {
                try {
                    URL.revokeObjectURL(url);
                } catch (_) {}
            });
            activeUrls.clear();
        };
    }, []);

    const remainingSlots = Math.max(0, maxFiles - currentImages.length);

    const onDrop = useCallback(
        (acceptedFiles, fileRejections) => {
            setErrorMessage(null);
            const newErrors = [];

            // Report all file rejections with clear actionable reasons
            if (fileRejections && fileRejections.length > 0) {
                fileRejections.forEach(({ file, errors }) => {
                    errors.forEach((err) => {
                        if (err.code === "file-invalid-type") {
                            newErrors.push(
                                `"${file.name}" has an unsupported format. Only JPEG, PNG, WEBP, and GIF are allowed (MP4 and other non-image formats are rejected).`
                            );
                        } else if (err.code === "file-too-large") {
                            newErrors.push(
                                `"${file.name}" exceeds the ${maxSizeMB} MB size limit (${formatFileSize(file.size)}).`
                            );
                        } else {
                            newErrors.push(`"${file.name}": ${err.message}`);
                        }
                    });
                });
            }

            // Enforce max count limit
            if (acceptedFiles && acceptedFiles.length > 0) {
                const currentCount = currentImages.length;
                const remaining = Math.max(0, maxFiles - currentCount);

                if (acceptedFiles.length > remaining) {
                    newErrors.push(
                        `You can only add ${remaining} more image(s). Only the first ${remaining} were accepted (maximum ${maxFiles} images per product request).`
                    );
                }

                const filesToAdd = acceptedFiles.slice(0, remaining);
                if (filesToAdd.length > 0 && setCurrentImages) {
                    setCurrentImages((prevImages) => [...(prevImages || []), ...filesToAdd]);
                }
            }

            if (newErrors.length > 0) {
                setErrorMessage(newErrors.join(" "));
            }
        },
        [currentImages.length, maxFiles, maxSizeMB, setCurrentImages]
    );

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: ACCEPTED_IMAGE_TYPES,
        maxSize: maxSizeMB * 1024 * 1024,
        disabled: disabled || remainingSlots <= 0,
        noClick: false,
        noKeyboard: false,
    });

    const handleRemoveImage = (index) => {
        const fileToRemove = currentImages[index];
        if (fileToRemove && activeUrlsRef.current.has(fileToRemove)) {
            try {
                URL.revokeObjectURL(activeUrlsRef.current.get(fileToRemove));
            } catch (_) {}
            activeUrlsRef.current.delete(fileToRemove);
        }

        if (setCurrentImages) {
            setCurrentImages((prevImages) => (prevImages || []).filter((_, i) => i !== index));
        }
    };

    return (
        <Card className="mx-auto shadow-sm body mt-4" style={{ maxWidth: "400px", width: "100%" }}>
            <div className="d-flex justify-content-between align-items-center p-3">
                <h5 className="subHeading mb-0">Add Product Image</h5>
                <Badge bg={remainingSlots === 0 ? "danger" : "secondary"}>
                    {currentImages.length} / {maxFiles} images
                </Badge>
            </div>
            <hr className="divider m-0" />
            <Card.Body className="p-3">
                {/* Inline error alert */}
                {errorMessage && (
                    <Alert
                        variant="danger"
                        className="d-flex justify-content-between align-items-start py-2 px-3 mb-3 small"
                    >
                        <span>{errorMessage}</span>
                        <Button
                            type="button"
                            variant="link"
                            className="text-danger p-0 ms-2 border-0 bg-transparent"
                            onClick={() => setErrorMessage(null)}
                            title="Dismiss error"
                        >
                            <AiOutlineClose size={16} />
                        </Button>
                    </Alert>
                )}

                {/* Dropzone area */}
                {remainingSlots > 0 ? (
                    <div
                        {...getRootProps()}
                        className={`image-upload-area border border-dashed rounded text-center mb-3 p-4 ${
                            isDragActive ? "active-dropzone" : ""
                        }`}
                        style={{
                            minHeight: "150px",
                            maxWidth: "100%",
                            margin: "0 auto",
                            cursor: disabled ? "not-allowed" : "pointer",
                        }}
                    >
                        <input {...getInputProps()} />
                        <AiOutlineUpload size={30} className="mb-2 text-primary" />
                        <p className="mb-1 fs-6">
                            {isDragActive ? "Drop the files here..." : "Drag and drop or browse files"}
                        </p>
                        <small className="text-muted">
                            JPEG, PNG, WEBP, and GIF format, up to {maxSizeMB} MB each
                        </small>
                    </div>
                ) : (
                    <Alert variant="info" className="py-2 px-3 small text-center mb-3">
                        Maximum limit of {maxFiles} images reached for this product request. Remove an image to add another.
                    </Alert>
                )}

                {/* Image Previews */}
                {previews.length > 0 && (
                    <div className="image-preview-container d-flex flex-wrap justify-content-center">
                        {previews.map(({ file, url }, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="image-preview-card m-2 position-relative"
                                style={{ width: "100px", height: "100px" }}
                            >
                                <Image
                                    src={url}
                                    alt={file.name || `uploaded-${index}`}
                                    thumbnail
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = FALLBACK_IMAGE;
                                    }}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    className="position-absolute top-0 end-0 p-1 lh-1 rounded-circle"
                                    style={{
                                        transform: "translate(40%, -40%)",
                                        zIndex: 10,
                                        width: "22px",
                                        height: "22px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveImage(index);
                                    }}
                                    disabled={disabled}
                                    title="Remove image"
                                >
                                    <AiFillDelete size={12} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Another Image Button */}
                <div className="d-flex justify-content-center mt-3">
                    <Button
                        type="button"
                        variant="outline-secondary"
                        className="d-flex align-items-center"
                        onClick={open}
                        disabled={disabled || remainingSlots <= 0}
                    >
                        <AiOutlineUpload className="me-2" />
                        Add Another Image
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductImageUpload;
