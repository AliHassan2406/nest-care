import React from "react";

const variantToClass = {
  pending:
    "bg-yellow-50 text-yellow-800 border-yellow-200",
  inProgress:
    "bg-blue-50 text-blue-800 border-blue-200",
  completed:
    "bg-green-50 text-green-800 border-green-200",
  neutral:
    "bg-gray-50 text-gray-800 border-gray-200",
};

function statusToVariant(status) {
  switch (status) {
    case "Pending":
      return "pending";
    case "In Progress":
      return "inProgress";
    case "Completed":
      return "completed";
    default:
      return "neutral";
  }
}

export default function Badge({
  status,
  variant,
  className = "",
  children,
}) {
  const v = variant || statusToVariant(status);

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${variantToClass[v] || variantToClass.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

