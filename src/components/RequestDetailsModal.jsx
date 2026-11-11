import React from "react";
import Modal from "./Modal";

const statusColor = (status) => {
  switch (status) {
    case "Pending":
      return {
        wrapper: "bg-yellow-50 text-yellow-900 border-yellow-200",
        dot: "bg-yellow-500",
      };
    case "In Progress":
      return {
        wrapper: "bg-blue-50 text-blue-900 border-blue-200",
        dot: "bg-blue-500",
      };
    case "Completed":
      return {
        wrapper: "bg-green-50 text-green-900 border-green-200",
        dot: "bg-green-500",
      };
    default:
      return {
        wrapper: "bg-gray-50 text-gray-900 border-gray-200",
        dot: "bg-gray-400",
      };
  }
};

function formatWhen(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function RequestDetailsModal({
  isOpen,
  onClose,
  request,
}) {
  const last = request?.statusHistory?.[request.statusHistory.length - 1];
  const activeStatus = last?.status || request?.status;
  const colors = statusColor(activeStatus);

  return (
    <Modal
      isOpen={isOpen}
      title={request ? `Request ${request.id}` : "Request"}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold"
          >
            Close
          </button>
        </div>
      }
    >
      {request ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-gray-500">Submitted</div>
              <div className="font-semibold text-gray-900">
                {request.date}
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-xl border text-sm font-semibold ${colors.wrapper}`}
            >
              <span className={`inline-block w-2 h-2 rounded-full ${colors.dot} mr-2`} />
              {activeStatus}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="text-sm text-gray-500">Name</div>
              <div className="font-semibold text-gray-900">{request.name}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="text-sm text-gray-500">Issue Type</div>
              <div className="font-semibold text-gray-900">{request.type}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:col-span-2">
              <div className="text-sm text-gray-500">Location</div>
              <div className="font-semibold text-gray-900">
                {request.location}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Priority</div>
              <div className="font-semibold text-gray-900">{request.priority || "Standard"}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Preferred appointment</div>
              <div className="font-semibold text-gray-900">{request.appointmentDate || "Flexible"}{request.preferredTime && request.preferredTime !== "Any time" ? ` · ${request.preferredTime}` : ""}</div>
            </div>
            {request.assignedWorkerName && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:col-span-2"><div className="text-sm text-emerald-700">Assigned professional</div><div className="font-semibold text-emerald-900">{request.assignedWorkerName}</div></div>}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="text-sm text-gray-500 mb-2">Description</div>
            <p className="text-gray-900 whitespace-pre-wrap">{request.description}</p>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-900 mb-3">
              Status timeline
            </div>

            {request.statusHistory && request.statusHistory.length ? (
              <div className="space-y-3">
                {[...request.statusHistory]
                  .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
                  .map((h, idx) => {
                    const c = statusColor(h.status);
                    return (
                      <div
                        key={`${h.status}-${h.at}-${idx}`}
                        className="flex items-start gap-3"
                      >
                        <div className={`mt-1 w-2 h-2 rounded-full ${c.dot}`} />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {h.status}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatWhen(h.at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-2xl p-4">
                No status history available for this request.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">No request selected.</div>
      )}
    </Modal>
  );
}

