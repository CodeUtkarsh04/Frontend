// UserTasksPage.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Filters from "./Filters";
import TaskCard from "./TaskCardUser";

/* -------------------------------------------------------
   Auth + API config
-------------------------------------------------------- */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const getToken = () => localStorage.getItem("token") || null;

// Endpoint for the signed-in user's errands
const TASKS_ENDPOINT = "/errand/showAllUsersErrands";

// Add ngrok splash bypass automatically when needed
const EXTRA_HEADERS = API_BASE.includes("ngrok") ? { "ngrok-skip-browser-warning": "true" } : {};

/* -------------------------------------------------------
   Fetch
-------------------------------------------------------- */
async function fetchJSON(path, opts = {}) {
  const token = getToken();
  if (!token) { const err = new Error("Not authenticated"); err.status = 401; throw err; }

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

  if (!res.ok) { const err = new Error(`HTTP ${res.status}: ${raw.slice(0, 200)}`); err.status = res.status; throw err; }
  if (!raw) return null;
  if (!contentType.includes("application/json")) { const err = new Error(`Expected JSON but got "${contentType}". First 200 chars: ${raw.slice(0, 200)}`); err.status = res.status; throw err; }

  try { return JSON.parse(raw); } catch (e) { const err = new Error(`Bad JSON: ${e.message}. First 200 chars: ${raw.slice(0, 200)}`); err.status = res.status; throw err; }
}

/* -------------------------------------------------------
   Utils
-------------------------------------------------------- */
const PAGE_SIZE = 15; // 3 x 5

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function buildQuery(filters) {
  const p = new URLSearchParams();
  if (filters.status && filters.status !== "All") p.set("status", filters.status);
  if (filters.category && filters.category !== "All Categories") p.set("category", filters.category);
  if (filters.search) p.set("search", filters.search);
  if (filters.limit) p.set("limit", String(filters.limit));
  if (filters.page) p.set("page", String(filters.page));
  if (filters.sort) p.set("sort", filters.sort);
  return p.toString();
}

// pad the array with nulls so lg+ stays a perfect 3x5 grid
function padTo(arr, n) {
  return [...arr, ...Array(Math.max(0, n - arr.length)).fill(null)].slice(0, n);
}

/* -------------------------------------------------------
   Page
-------------------------------------------------------- */
const UserTasksPage = () => {
  const [filters, setFilters] = useState({
    status: "All",
    category: "All Categories",
    search: "",
    page: 1,
    limit: PAGE_SIZE,            // enforce 15 per page
    sort: "createdAt:desc",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [tasks, setTasks] = useState([]); // <-- already paged for current page
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const busyRef = useRef(false);
  const failCountRef = useRef(0);
  const MAX_FAILS = 5;

  const query = useQuery();
  const navigate = useNavigate();
  const taskIdFromUrl = query.get("taskId");
  const qs = useMemo(() => buildQuery(filters), [filters]);

  const run = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setError(null);

    try {
      if (!API_BASE) throw new Error("VITE_API_BASE_URL is not set. Configure your API base URL.");

      const json = await fetchJSON(`${TASKS_ENDPOINT}${qs ? `?${qs}` : ""}`);
      const rows = Array.isArray(json) ? json : (json?.data ?? []);

      // If backend provided meta, use it; otherwise client-side paginate
      const backendMeta = Array.isArray(json) ? null : (json?.meta ?? null);

      if (backendMeta && typeof backendMeta.total === "number") {
        // Backend paging is working — trust it
        setTasks(rows);
        setMeta({
          page: backendMeta.page ?? filters.page,
          pages: backendMeta.pages ?? Math.max(1, Math.ceil((backendMeta.total || rows.length) / (backendMeta.limit || filters.limit))),
          total: backendMeta.total ?? rows.length,
          limit: backendMeta.limit ?? filters.limit,
        });
      } else {
        // Client-side pagination
        const total = rows.length;
        const pages = Math.max(1, Math.ceil(total / filters.limit));
        const safePage = Math.min(Math.max(1, filters.page), pages);
        const start = (safePage - 1) * filters.limit;
        const pageRows = rows.slice(start, start + filters.limit);

        setTasks(pageRows);
        setMeta({ page: safePage, pages, total, limit: filters.limit });
      }

      failCountRef.current = 0;
    } catch (e) {
      console.error("GET user errands error:", e);
      setTasks([]);
      setMeta({ page: 1, pages: 1, total: 0, limit: filters.limit });
      setError(e);
      failCountRef.current += 1;

      if (failCountRef.current >= MAX_FAILS && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.warn("Polling stopped due to repeated failures.");
      }
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, [qs, filters.page, filters.limit]);

  useEffect(() => {
    setLoading(true);
    run();

    // Optional polling — if backend returns large arrays and you client-paginate,
    // polling will update the current page correctly (we recompute meta).
    intervalRef.current = setInterval(run, 3000);

    const onVis = () => { if (!document.hidden) run(); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [run]);

  const cleanTaskIdFromURL = () => {
    navigate("/user/tasks", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-28 pb-12">
        {/* 📱 Mobile header */}
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h2 className="text-xl font-bold">My Tasks</h2>
          <button
            onClick={() => setShowFilters(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Filters
          </button>
        </div>

        <div className="flex gap-6">
          {/* 🧰 Sidebar Filters (desktop) */}
          <aside className="hidden md:block w-64 min-w-[16rem] shrink-0">
            <Filters
              onFilterChange={(patch) => {
                setFilters((f) => ({ ...f, ...patch, page: 1 }));
              }}
            />
          </aside>

          {/* 📋 Tasks grid */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <p className="text-gray-500">Loading tasks…</p>
            ) : error ? (
              <p className="text-rose-600">
                {error.status === 401
                  ? "Please sign in to view your tasks."
                  : typeof error.message === "string"
                  ? error.message
                  : "Could not load tasks."}
              </p>
            ) : tasks.length > 0 ? (
              <div
                className="
                  grid gap-6
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3 lg:grid-rows-5   /* 3×5 at lg+ */
                  auto-rows-fr
                "
              >
                {padTo(tasks, PAGE_SIZE).map((task, i) => (
                  <div key={task?.id || task?._id || `placeholder-${i}`} className="h-full min-w-0">
                    {task ? (
                      <TaskCard
                        task={task}
                        autoOpen={String(taskIdFromUrl || "") === String(task.id || task._id)}
                        onRequestClose={cleanTaskIdFromURL}
                        onCancelled={() => run()}   // refresh after cancel
                      />
                    ) : (
                      <div className="h-full rounded-2xl border border-dashed border-slate-200 bg-white/60" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No tasks found.</p>
            )}

            {/* 🔢 Simple pagination (15 per page) */}
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                disabled={meta.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {meta.page} {meta.pages ? `of ${meta.pages}` : ""}
              </span>
              <button
                disabled={meta.pages ? meta.page >= meta.pages : tasks.length < filters.limit}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* 📱 Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setShowFilters(false)} className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white w-80 h-full shadow-xl p-6 z-50">
            <button
              onClick={() => setShowFilters(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
            <Filters
              onFilterChange={(patch) => {
                setFilters((f) => ({ ...f, ...patch, page: 1 }));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTasksPage;
