// Utility functions for safe image handling, URL normalization, and fallback display

export const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="#f1f5f9">
      <rect width="200" height="200" rx="8" fill="#e2e8f0"/>
      <path d="M70 120 L95 90 L115 110 L130 95 L155 125 Z" fill="#94a3b8"/>
      <circle cx="85" cy="75" r="12" fill="#94a3b8"/>
      <text x="100" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#64748b" text-anchor="middle">No image</text>
    </svg>
  `);

const API_BASE_URL = "https://api.motospar.com";

/**
 * Resolves any image value (absolute HTTPS URL, S3 URI, or legacy relative media path)
 * into a valid browser image source without double-prepending the API host.
 */
export const resolveImageUrl = (img) => {
  if (!img) return FALLBACK_IMAGE;

  // If passed an object with an image property (e.g. { id, image })
  const raw = typeof img === "object" ? img.image || img.image_url : img;
  if (!raw || typeof raw !== "string") return FALLBACK_IMAGE;

  const trimmed = raw.trim();
  if (!trimmed) return FALLBACK_IMAGE;

  // Blob or data URLs
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Already absolute HTTP/HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // S3 URI s3://bucket/key
  if (trimmed.startsWith("s3://")) {
    const s3Path = trimmed.slice(5);
    const slashIdx = s3Path.indexOf("/");
    if (slashIdx !== -1) {
      const bucket = s3Path.slice(0, slashIdx);
      const key = s3Path.slice(slashIdx + 1);
      return `https://${bucket}.s3.amazonaws.com/${key}`;
    }
  }

  // Legacy relative path e.g. /media/... or media/...
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Format bytes to readable size string
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
