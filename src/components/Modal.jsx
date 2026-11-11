import React from "react";

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  footer,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 font-semibold"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer ? (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

