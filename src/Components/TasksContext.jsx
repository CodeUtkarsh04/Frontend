// context/TasksContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const getToken = () => localStorage.getItem("token") || null;
const TASKS_ENDPOINT = "/errand/showAllUsersErrands"; // same endpoint used by UserTasksPage
const EXTRA_HEADERS = API_BASE.includes("ngrok") ? { "ngrok-skip-browser-warning": "true" } : {};

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

  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text().catch(() => "");

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}: ${raw.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }

  if (!raw) return null;
  if (!contentType.includes("application/json")) {
    const err = new Error(`Expected JSON but got "${contentType}". First 200 chars: ${raw.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    const err = new Error(`Bad JSON: ${e.message}. First 200 chars: ${raw.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
}

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(
    async ({ qs = "" } = {}) => {
      // qs: optional querystring (e.g. '?limit=50') — keep default empty to match your UserTasksPage behavior
      try {
        setLoading(true);
        setError(null);

        // cancel previous
        if (abortRef.current) abortRef.current.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        const json = await fetchJSON(`${TASKS_ENDPOINT}${qs ? `?${qs}` : ""}`, { signal: ctrl.signal });
        const rows = Array.isArray(json) ? json : (json?.data ?? []);
        setTasks(rows);
        return rows;
      } catch (e) {
        if (e.name === "AbortError") return null;
        setError(e);
        setTasks([]);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // initial load
  useEffect(() => {
    load();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [load]);

  // reload alias + public API
  const reload = useCallback(({ qs } = {}) => load({ qs }), [load]);

  return (
    <TasksContext.Provider value={{ tasks, loading, error, reload, setTasks }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used inside TasksProvider");
  return ctx;
}
