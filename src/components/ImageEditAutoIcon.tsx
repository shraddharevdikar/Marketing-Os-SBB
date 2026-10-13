import React from "react";

export const ImageEditAutoIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Image frame */}
    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
    {/* Mountains/landscape */}
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
    {/* Auto-edit 4-point sparkle star */}
    <path
      d="M17.5 4l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4z"
      fill="currentColor"
      stroke="none"
    />
    <path
      d="M6 16.5l.3.7.7.3-.7.3-.3.7-.3-.7-.7-.3.7-.3.3-.7z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);
