import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Button, Image, ProgressBar, Alert, Badge } from "react-bootstrap";
import { AiOutlineUpload, AiFillDelete, AiOutlineClose } from "react-icons/ai";
import { resolveImageUrl, formatFileSize, FALLBACK_IMAGE } from "../../utils/imageUtils";
import "../../assets/Css/ProductForm.css";

const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpeg", ".jpg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};

/**
 * Reusable Product Image Upload & Management Component
 * Supports:
 * - Direct multi-image dropzone / file picker (restricted to images; rejects SVG/MP4/video/docs)
 * - Configurable size and count limits
 * - Local object URL previews with automatic memory leak revocation on remove & unmount
 * - Previews for existing uploaded variant images with delete controls
 * - Upload progress, success, and error feedback states
 * - Image load error fallback
 */
const ProductImageUpload = ({
  files,
  onChangeFiles,
  existingImages,
  onDeleteExistingImage,
  isUploading = false,
  uploadProgress = null,
  errorMessage = null,
  onClearError,
  maxFiles = 10,
  maxSizeMB = 10,
  title = "Product Variant Images",
  subtitle = "Upload up to 10 photos (JPEG, PNG, WEBP, GIF up to 10 MB each).",
  readOnly = false,
}) => {
  const [localErrors, setLocalErrors] = useState([]);
  const [previews, setPreviews] = useState([]);
  const activeUrlsRef = useRef(new Map());
  const selectedFiles = useMemo(() => (Array.isArray(files) ? files : []), [files]);
  const savedImages = useMemo(
    () => (Array.isArray(existingImages) ? existingImages : []),
    [existingImages]
  );

  // Keep preview items in sync with files
  useEffect(() => {
    const selectedFileSet = new Set(selectedFiles);
    for (const [file, url] of activeUrlsRef.current.entries()) {
      if (!selectedFileSet.has(file)) {
        URL.revokeObjectURL(url);
        activeUrlsRef.current.delete(file);
      }
    }

    const newPreviews = selectedFiles.map((file) => {
      const cachedUrl = activeUrlsRef.current.get(file);
      if (cachedUrl) return { file, url: cachedUrl };

      try {
        const url = URL.createObjectURL(file);
        activeUrlsRef.current.set(file, url);
        return { file, url };
      } catch (_) {
        return { file, url: FALLBACK_IMAGE };
      }
    });

    setPreviews(newPreviews);
  }, [selectedFiles]);

  // Clean up object URLs on component unmount
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

  const totalCurrentCount = savedImages.length + selectedFiles.length;
  const remainingSlots = Math.max(0, maxFiles - totalCurrentCount);

  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      setLocalErrors([]);
      if (onClearError) onClearError();

      const newErrors = [];

      // Handle rejections (file type, size, etc.)
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach((err) => {
          if (err.code === "file-invalid-type") {
            newErrors.push(
              `"${file.name}" has an unsupported format. Only JPEG, PNG, WEBP, and GIF are allowed (SVG and videos are rejected).`
            );
          } else if (err.code === "file-too-large") {
            newErrors.push(
              `"${file.name}" is too large (${formatFileSize(file.size)}). Max allowed is ${maxSizeMB} MB.`
            );
          } else {
            newErrors.push(`"${file.name}": ${err.message}`);
          }
        });
      });

      if (acceptedFiles.length > 0) {
        if (acceptedFiles.length > remainingSlots) {
          newErrors.push(
            `You can only add ${remainingSlots} more image(s). Only the first ${remainingSlots} were selected.`
          );
        }
        const filesToAdd = acceptedFiles.slice(0, remainingSlots);
        if (filesToAdd.length > 0 && onChangeFiles) {
          onChangeFiles([...selectedFiles, ...filesToAdd]);
        }
      }

      if (newErrors.length > 0) {
        setLocalErrors(newErrors);
      }
    },
    [selectedFiles, remainingSlots, onChangeFiles, onClearError, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: readOnly || isUploading || remainingSlots <= 0,
  });

  const handleRemovePendingFile = (index) => {
    const itemToRemove = previews[index];
    if (itemToRemove?.url) {
      URL.revokeObjectURL(itemToRemove.url);
      activeUrlsRef.current.delete(itemToRemove.file);
    }
    const updated = selectedFiles.filter((_, i) => i !== index);
    if (onChangeFiles) {
      onChangeFiles(updated);
    }
  };

  const handleRemoveExisting = (imgObj) => {
    if (onDeleteExistingImage) {
      onDeleteExistingImage(imgObj);
    }
  };

  const displayedError = errorMessage || (localErrors.length > 0 ? localErrors.join(" ") : null);

  return (
    <Card className="shadow-sm border-0 mb-4" style={{ backgroundColor: "#ffffff" }}>
      <Card.Header className="bg-light py-3 d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-0 fw-bold text-dark">{title}</h6>
          <small className="text-muted">{subtitle}</small>
        </div>
        <Badge bg={remainingSlots === 0 ? "danger" : "secondary"}>
          {totalCurrentCount} / {maxFiles} images
        </Badge>
      </Card.Header>

      <Card.Body className="p-3">
        {displayedError && (
          <Alert
            variant="danger"
            className="d-flex justify-content-between align-items-center py-2 px-3 mb-3"
          >
            <div className="small">{displayedError}</div>
            <Button
              variant="link"
              className="text-danger p-0 ms-2"
              onClick={() => {
                setLocalErrors([]);
                if (onClearError) onClearError();
              }}
            >
              <AiOutlineClose size={16} />
            </Button>
          </Alert>
        )}

        {isUploading && (
          <div className="mb-3 p-3 bg-light rounded text-center">
            <div className="small mb-1 fw-semibold text-primary">Uploading images to secure storage...</div>
            <ProgressBar
              animated
              now={typeof uploadProgress === "number" ? uploadProgress : 100}
              label={typeof uploadProgress === "number" ? `${uploadProgress}%` : undefined}
            />
          </div>
        )}

        {!readOnly && remainingSlots > 0 && (
          <div
            {...getRootProps()}
            className={`border border-2 border-dashed rounded text-center p-4 mb-3 transition-all ${
              isDragActive ? "bg-light border-primary" : "border-secondary-subtle"
            }`}
            style={{
              cursor: isUploading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <input {...getInputProps()} />
            <div className="d-flex flex-column align-items-center">
              <AiOutlineUpload size={36} className="text-primary mb-2" />
              <div className="fw-semibold text-dark mb-1">
                {isDragActive ? "Drop the images here" : "Click to select or drag & drop images"}
              </div>
              <small className="text-muted">
                Allowed formats: JPEG, PNG, WEBP, GIF (max {maxSizeMB} MB each)
              </small>
            </div>
          </div>
        )}

        {!readOnly && remainingSlots <= 0 && (
          <Alert variant="info" className="py-2 px-3 small text-center mb-3">
            Maximum limit of {maxFiles} images reached for this variant. Remove an image to add another.
          </Alert>
        )}

        {/* Existing Images Section */}
        {savedImages.length > 0 && (
          <div className="mb-3">
            <div className="fw-semibold small text-muted mb-2">
              Existing Saved Images ({savedImages.length})
            </div>
            <div className="d-flex flex-wrap gap-2">
              {savedImages.map((img, idx) => {
                const src = resolveImageUrl(img);
                return (
                  <div
                    key={img.id || idx}
                    className="position-relative rounded border overflow-hidden shadow-sm"
                    style={{ width: "96px", height: "96px", backgroundColor: "#f8f9fa" }}
                  >
                    <Image
                      src={src}
                      alt={`Saved Part ${idx + 1}`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <Badge
                      bg="success"
                      className="position-absolute bottom-0 start-0 m-1"
                      style={{ fontSize: "9px" }}
                    >
                      Saved
                    </Badge>
                    {!readOnly && onDeleteExistingImage && (
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 p-1 m-1 lh-1 rounded-circle"
                        title="Delete saved image"
                        onClick={() => handleRemoveExisting(img)}
                        disabled={isUploading}
                        style={{ width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <AiFillDelete size={12} />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pending New Files Previews Section */}
        {previews.length > 0 && (
          <div>
            <div className="fw-semibold small text-muted mb-2">
              New Images to Upload ({previews.length})
            </div>
            <div className="d-flex flex-wrap gap-2">
              {previews.map(({ file, url }, idx) => (
                <div
                  key={idx}
                  className="position-relative rounded border overflow-hidden shadow-sm"
                  style={{ width: "96px", height: "96px", backgroundColor: "#f8f9fa" }}
                >
                  <Image
                    src={url}
                    alt={file.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <Badge
                    bg="warning"
                    text="dark"
                    className="position-absolute bottom-0 start-0 m-1"
                    style={{ fontSize: "9px" }}
                  >
                    Pending
                  </Badge>
                  {!readOnly && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 p-1 m-1 lh-1 rounded-circle"
                      title="Remove file"
                      onClick={() => handleRemovePendingFile(idx)}
                      disabled={isUploading}
                      style={{ width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <AiOutlineClose size={12} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {totalCurrentCount === 0 && (
          <div className="text-center py-2 text-muted small">
            No images uploaded yet for this variant.
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProductImageUpload;
