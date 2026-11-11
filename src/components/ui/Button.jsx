import React from "react";

const variantToClass = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white border border-transparent",
  secondary:
    "bg-white hover:bg-gray-50 text-gray-800 border border-gray-200",
  danger: "bg-red-600 hover:bg-red-700 text-white border border-transparent",
  success:
    "bg-green-600 hover:bg-green-700 text-white border border-transparent",
  ghost:
    "bg-transparent hover:bg-gray-100 text-gray-800 border border-transparent",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none";

  return (
    <button
      type={props.type ?? "button"}
      className={`${base} ${variantToClass[variant] || variantToClass.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

