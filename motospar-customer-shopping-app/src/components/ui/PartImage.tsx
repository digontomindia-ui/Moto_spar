import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { resolveMediaUrl } from '../../config/env';

interface PartImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

/**
 * Renders an API-provided product or profile image URL.
 * Resolves relative paths against API_BASE_URL and provides a clean
 * technical schematic container when no image is returned or when an image URL fails to load.
 * Never replaces broken images with sample or unrelated product photos.
 */
export const PartImage: React.FC<PartImageProps> = ({
  src,
  alt,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = resolveMediaUrl(src);

  if (!resolvedUrl || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 select-none p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Wrench className="w-7 h-7 stroke-[1.5] mb-1.5 text-slate-400" />
        <span className="text-[11px] font-medium text-slate-500 line-clamp-2 max-w-[140px]">
          {alt || 'Image unavailable'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
};
