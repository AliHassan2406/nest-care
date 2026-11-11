import React from "react";

export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200/60 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

