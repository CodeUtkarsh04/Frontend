// UserDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import RequestTaskCard from "../Components/RequestTaskCard.jsx";
import TopTask from "../Components/TopTask.jsx";           // <-- add
import { TasksProvider } from "../context/TasksContext.jsx"; // <-- add

/* ============ tiny local API helpers (no new files) ============ */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const getToken = () => localStorage.getItem("token") || null;
const TASKS_ENDPOINT = "/tasks/mine"; // adjust if your path differs

async function fetchJSON(path, opts = {}) {
  const token = getToken();
  if (!token) {
    const err = new Error("Not authenticated");
    err.status = 401;
    throw err;
  }
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
    // credentials: "include", // keep only if your API needs cookies
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(text || `Request failed with ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

/* ============ small util ============ */
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "-";

/* ============ component ============ */
function UserDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Build query for newest 3
  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", "3");
    p.set("page", "1");
    p.set("sort", "createdAt:desc");
    return p.toString();
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const json = await fetchJSON(`${TASKS_ENDPOINT}?${qs}`);
        const rows = Array.isArray(json) ? json : (json?.data ?? []);
        if (!alive) return;
        setTasks(rows);
      } catch (e) {
        if (!alive) return;
        setError(e);
        setTasks([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [qs]);

  return (
    <>
      {/* 🌟 Hero */}
      <section className="relative bg-gradient-to-br from-blue-800 to-sky-500 text-white py-20 mt-16">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            Welcome back, <span id="welcome-name">User</span>!
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8" id="welcome-message">
            Ready to get things done today?
          </p>
        </div>

        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" className="fill-white opacity-10" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
      </section>

      {/* 📦 Request Task + Top Tasks */}
      {/* 📦 Request Task + Top Tasks (wrapped in TasksProvider to share data only here) */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <TasksProvider>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Left: Request Task (will call reload() from context after submit) */}
            <div className="md:col-span-2">
              <RequestTaskCard variant="default" />
            </div>

            {/* Right: Top tasks reads from same context */}
            <div className="space-y-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Top Tasks</h3>
              <TopTask />
            </div>
          </div>
        </TasksProvider>
      </section>

    </>
  );
}

export default UserDashboard;
