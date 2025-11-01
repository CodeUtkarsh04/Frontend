// src/context/TasksContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const TASKS_ENDPOINT = "/errand/showAllUsersErrands"; // adjust if your API differs

const EXTRA_HEADERS = API_BASE.includes("ngrok") ? { "ngrok-skip-browser-warning": "true" } : {};

// small helper to get token (same as other files)
const getToken = () => localStorage.getItem("token") ?? null;

// fetch helper (similar to your other fetchJSON, but compact)
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
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
      ...EXTRA_HEADERS,
    },
  });

  const raw = await res.text().catch(() => "");
  if (!res.ok) {
    const e = new Error(raw || `HTTP ${res.status}`);
    e.status = res.status;
    throw e;
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    const err = new Error(`Bad JSON: ${e.message}`);
    err.status = res.status;
    throw err;
  }
}

const TasksContext = createContext(null);

export function TasksProvider({ children, initialFilters = { limit: 3, page: 1, sort: "createdAt:desc" } }) {
  const [tasks, setTasks] = useState([]);         // shared tasks list (TopTasks / Dashboard)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const filtersRef = useRef(initialFilters);

  const buildQs = (filters) => {
    const p = new URLSearchParams();
    if (filters.limit != null) p.set("limit", String(filters.limit));
    if (filters.page != null) p.set("page", String(filters.page));
    if (filters.sort) p.set("sort", filters.sort);
    if (filters.status) p.set("status", filters.status);
    if (filters.category) p.set("category", filters.category);
    if (filters.search) p.set("search", filters.search);
    return p.toString();
  };

  const refresh = useCallback(
    async (overrides = {}) => {
      setLoading(true);
      setError(null);
      // merge filters
      const filters = { ...filtersRef.current, ...overrides };
      filtersRef.current = filters;
      try {
        const qs = buildQs(filters);
        const json = await fetchJSON(`${TASKS_ENDPOINT}${qs ? `?${qs}` : ""}`);
        console.log("✅ API Response from showAllUsersErrands:", json);

        const rows = Array.isArray(json) ? json : (json?.data ?? []);
        setTasks(Array.isArray(rows) ? rows : []);
        setLoading(false);
        return rows;
      } catch (e) {
        setError(e);
        setLoading(false);
        setTasks([]);
        throw e;
      }
    },
    []
  );

  // convenience: allow other pages to push their own page results into shared store
  const setSharedTasks = useCallback((rows) => {
    setTasks(Array.isArray(rows) ? rows : []);
  }, []);

  // initial fetch
  useEffect(() => {
    refresh().catch(() => { });
  }, [refresh]);

  const value = {
    tasks,
    loading,
    error,
    refresh,
    setSharedTasks,
    getFilters: () => filtersRef.current,
    setFilters: (f) => { filtersRef.current = { ...filtersRef.current, ...f }; },
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useTasks must be used within TasksProvider");
  }
  return ctx;
}
