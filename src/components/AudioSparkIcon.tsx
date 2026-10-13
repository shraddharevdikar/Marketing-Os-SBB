import React from "react";

export const AudioSparkIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
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
    {/* Sound waves bars */}
    <path d="M3 10v4" />
    <path d="M6 7v10" />
    <path d="M9 4v16" />
    <path d="M12 8v8" />
    <path d="M15 11v2" />
    {/* AI 4-point sparkle star on the right */}
    <path
      d="M18.5 4.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z"
      fill="currentColor"
      stroke="none"
    />
    <path
      d="M20 15.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4.4-1z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);
