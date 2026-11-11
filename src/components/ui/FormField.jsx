import React from "react";

export default function FormField({
  label,
  children,
  helper,
  required = false,
}) {
  return (
    <div>
      {label ? (
        <label className="block text-gray-700 font-semibold mb-2">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      ) : null}
      {children}
      {helper ? <p className="mt-2 text-xs text-gray-500">{helper}</p> : null}
    </div>
  );
}

