import React from "react";
import { clearAllRequests, getRequests } from "../utils/localStorage";
import RequestList from "./RequestList";

export default function AdminPanel({ requests, onRequestsChange }) {
  const getStatistics = () => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "Pending").length,
      inProgress: requests.filter((r) => r.status === "In Progress").length,
      completed: requests.filter((r) => r.status === "Completed").length,
    };
  };

  const stats = getStatistics();

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(requests, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `requests-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "⚠️ Are you absolutely sure you want to delete ALL requests? This cannot be undone!"
      )
    ) {
      clearAllRequests();
      onRequestsChange();
      alert("All requests have been deleted!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Admin Header */}
        <div className="bg-red-600 text-white p-6 rounded-lg shadow-lg mb-8">
          <h1 className="text-4xl font-bold mb-2">👨‍💼 Admin Dashboard</h1>
          <p className="text-red-100">Full control over maintenance requests</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Total</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">
              In Progress
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.inProgress}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Admin Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExportJSON}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              📥 Export as JSON
            </button>

            <button
              onClick={handleClearAll}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              🗑️ Clear All Requests
            </button>
          </div>
        </div>

        {/* Requests List */}
        <RequestList
          requests={requests}
          onRequestsChange={onRequestsChange}
          isAdmin={true}
        />
      </div>
    </div>
  );
}
