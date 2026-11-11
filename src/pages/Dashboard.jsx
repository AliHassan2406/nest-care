import React, { useState, useEffect } from "react";
import AdminPanel from "../components/AdminPanel";
import RequestList from "../components/RequestList";
import { api } from "../utils/apiClient";

export default function Dashboard({ isAdmin }) {
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    const token = localStorage.getItem("authToken");
    const data = await api.request("/api/requests", { token });
    setRequests(data.requests || []);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  if (isAdmin) {
    return (
      <AdminPanel requests={requests} onRequestsChange={loadRequests} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <RequestList
          requests={requests}
          onRequestsChange={loadRequests}
          isAdmin={false}
        />
      </div>
    </div>
  );
}

