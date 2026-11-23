'use client';
import { useState } from 'react';

export default function DishImage({
  src,
  category,
  alt,
  className = 'w-20 h-20 rounded-xl',
}: {
  src?: string;
  category: string;
  alt: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (src && src.trim() !== '' && !imgError) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setImgError(true)}
        className={`${className} object-cover bg-gray-100 shrink-0`}
      />
    );
  }

  const cat = (category || '').toLowerCase();

  return (
    <div className={`${className} bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-orange-600`}>
      {cat.includes('burger') ? (
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 11h16a1 1 0 0 0 1-1c0-3.5-4-6-9-6s-9 2.5-9 6a1 1 0 0 0 1 1Z" />
          <path d="M3 15h18" strokeLinecap="round" />
          <path d="M5 18h14a2 2 0 0 0 2-2H3a2 2 0 0 0 2 2Z" />
        </svg>
      ) : cat.includes('roll') || cat.includes('wrap') ? (
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="6" y="3" width="12" height="18" rx="4" transform="rotate(25 12 12)" />
          <path d="M9 10l6 4" strokeLinecap="round" />
        </svg>
      ) : cat.includes('drink') || cat.includes('beverage') || cat.includes('coffee') ? (
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 8h10l-1 12H8L7 8Z" />
          <path d="M6 8h12M12 8V4l3-1" strokeLinecap="round" />
        </svg>
      ) : cat.includes('side') || cat.includes('fries') ? (
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 10h12l-1.5 10h-9L6 10Z" />
          <path d="M8 10V5M12 10V4M16 10V6" strokeLinecap="round" />
        </svg>
      ) : (
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 14h18a8 8 0 0 1-16 0Z" />
          <path d="M12 6v4M8 7v3M16 7v3" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}