// UserTasksPage.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Filters from "../Components/Filters"; // adjust path if needed
import TaskCard from "../components/TaskCardUser"; // adjust path if needed

/* -------------------------------------------------------
   Auth + API config
-------------------------------------------------------- */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const getToken = () => localStorage.getItem("token") || null;
const TASKS_ENDPOINT = "/errand/showAllUsersErrands";
const EXTRA_HEADERS = API_BASE.includes("ngrok") ? { "ngrok-skip-browser-warning": "true" } : {};

/* -------------------------------------------------------
   Fetch helper
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
   Utils / matching helpers
-------------------------------------------------------- */
const PAGE_SIZE = 15;
function padTo(arr, n) { return [...arr, ...Array(Math.max(0, n - arr.length)).fill(null)].slice(0, n); }

function norm(s) {
  return (s ?? "").toString().trim().replace(/\s+/g, " ").replace(/&/g, "and").toLowerCase();
}

/**
 * Robust extractor for category-like values.
 * Tries common fields and nested shapes: category, categories, tags, type, service, meta, category_id etc.
 */
function extractCategoryNames(explicitCat, task) {
  // If explicitCat provided and non-empty, normalize extraction from it first
  const candidates = [];

  const pushVal = (v) => {
    if (v == null) return;
    if (Array.isArray(v)) return v.forEach(pushVal);
    if (typeof v === "object") {
      // try common name fields on object
      const name = v.name ?? v.title ?? v.label ?? v.slug ?? v.value ?? v.key;
      if (name) candidates.push(String(name));
      else {
        // fallback stringify small object
        try { candidates.push(JSON.stringify(v)); } catch (e) {}
      }
      return;
    }
    candidates.push(String(v));
  };

  if (explicitCat !== undefined && explicitCat !== null && explicitCat !== "") {
    pushVal(explicitCat);
  }

  // If we still have nothing relevant, inspect the whole task object
  if ((!explicitCat || explicitCat === "") && task) {
    const keysToCheck = [
      "category", "categories", "cat", "type", "types",
      "tags", "tag", "service", "services", "meta",
      "category_id", "categoryId", "catId", "categorySlug", "category_name",
      "categoryKey", "categoryKeyName"
    ];

    for (const k of keysToCheck) {
      if (Object.prototype.hasOwnProperty.call(task, k)) {
        pushVal(task[k]);
      }
    }

    // extra nested checks
    if (task.category && typeof task.category === "object") pushVal(task.category.name ?? task.category.title ?? task.category.label);
    if (Array.isArray(task.categories)) task.categories.forEach(c => pushVal(c.name ?? c.title ?? c));
    if (Array.isArray(task.tags)) task.tags.forEach(t => pushVal(t.name ?? t.label ?? t));
    if (task.service) pushVal(task.service.name ?? task.service.title ?? task.service);
    if (task.details && task.details.category) pushVal(task.details.category);
  }

  // remove empties and duplicates
  return Array.from(new Set(candidates.map(c => c && c.toString()).filter(Boolean)));
}

/**
 * Tolerant category matcher: compares normalized strings, includes, and alphanumeric simplified matches.
 */
function matchesCategory(taskCategory, filterCategory, task) {
  if (!filterCategory || filterCategory === "All Categories") return true;
  const wanted = norm(filterCategory);

  const rawCandidates = (taskCategory && taskCategory !== "" ? extractCategoryNames(taskCategory, task) : extractCategoryNames(null, task));
  const candidates = rawCandidates.map(norm).filter(Boolean);

  return candidates.some(c => {
    if (c === wanted) return true;
    if (c.includes(wanted)) return true;
    if (wanted.includes(c)) return true;
    const cs = c.replace(/[^a-z0-9]/g, "");
    const ws = wanted.replace(/[^a-z0-9]/g, "");
    if (cs && ws && (cs === ws || cs.includes(ws) || ws.includes(cs))) return true;
    return false;
  });
}

/* Apply status + category + search filters to an array of tasks */
function applyFiltersToArray(arr, filters) {
  const s = filters.status ?? "All";
  const c = filters.category ?? "All Categories";
  const q = norm(filters.search ?? "");

  return arr.filter(t => {
    const taskStatus = t.status ?? t.state ?? "";
    const taskCategory = t.category ?? t.type ?? t.categories ?? t.tags ?? "";

    // status (strict normalized equality)
    if (s && s !== "All") {
      if (norm(taskStatus) !== norm(s)) return false;
    }

    // category (tolerant)
    if (c && c !== "All Categories") {
      if (!matchesCategory(taskCategory, c, t)) return false;
    }

    // search (title, description, category strings)
    const hay = `${t.title ?? ""} ${t.description ?? ""} ${Array.isArray(taskCategory) ? taskCategory.join(" ") : (taskCategory?.name ?? taskCategory ?? "")}`.toLowerCase();
    if (q && !hay.includes(q)) return false;

    return true;
  });
}

/* -------------------------------------------------------
   Page (client-side filtering)
-------------------------------------------------------- */
const UserTasksPage = () => {
  const [filters, setFilters] = useState({
    status: "All",
    category: "All Categories",
    search: "",
    page: 1,
    limit: PAGE_SIZE,
    sort: "createdAt:desc",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [allTasks, setAllTasks] = useState([]); // full dataset
  const [tasks, setTasks] = useState([]);       // current page rows
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const busyRef = useRef(false);
  const failCountRef = useRef(0);
  const MAX_FAILS = 5;

  const location = useLocation();
  const navigate = useNavigate();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const taskIdFromUrl = query.get("taskId");

  // fetch full list (no page/limit) — run can be called repeatedly (poll)
  const run = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setError(null);

    try {
      if (!API_BASE) throw new Error("VITE_API_BASE_URL is not set.");
      const json = await fetchJSON(`${TASKS_ENDPOINT}`);
      const rows = Array.isArray(json) ? json : (json?.data ?? []);
      setAllTasks(rows);

      // helpful debug: inspect one sample object structure
      console.log("DEBUG: fetched total rows:", rows.length);
      rows.slice(0, 5).forEach((r, idx) => {
        console.log(`SAMPLE[${idx}] id:${r.id ?? r._id ?? "(no id)"} keys:`, Object.keys(r));
        console.log(`SAMPLE[${idx}] full:`, r);
      });

      failCountRef.current = 0;
    } catch (e) {
      console.error("GET user errands error:", e);
      setAllTasks([]);
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
  }, []);

  // compute filteredTasks from allTasks + filters
  const filteredTasks = useMemo(() => {
    const filtered = applyFiltersToArray(allTasks, filters);
    console.log("DEBUG filters:", filters);
    console.log("DEBUG filtered count:", filtered.length);
    console.log("DEBUG filtered sample categories:", filtered.slice(0, 8).map(t => extractCategoryNames(t.category, t)));
    return filtered;
  }, [allTasks, filters.status, filters.category, filters.search]);

  // paginate filteredTasks whenever filteredTasks or page/limit changes
  useEffect(() => {
    const total = filteredTasks.length;
    const pages = Math.max(1, Math.ceil(total / filters.limit));
    const safePage = Math.min(Math.max(1, filters.page || 1), pages);
    const start = (safePage - 1) * filters.limit;
    const pageRows = filteredTasks.slice(start, start + filters.limit);

    setTasks(pageRows);
    setMeta({ page: safePage, pages, total, limit: filters.limit });

    if ((filters.page || 1) !== safePage) {
      setFilters(f => ({ ...f, page: safePage }));
    }
  }, [filteredTasks, filters.page, filters.limit]);

  // initial fetch + optional polling
  useEffect(() => {
    setLoading(true);
    run();
    intervalRef.current = setInterval(run, 3000);
    const onVis = () => { if (!document.hidden) run(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [run]);

  const cleanTaskIdFromURL = () => navigate("/user/tasks", { replace: true });

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-28 pb-12">
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h2 className="text-xl font-bold">My Tasks</h2>
          <button onClick={() => setShowFilters(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Filters
          </button>
        </div>

        <div className="flex gap-6">
          <aside className="hidden md:block w-64 min-w-[16rem] shrink-0">
            <Filters filters={filters} onFilterChange={(patch) => {
              console.log("Filters.patch ->", patch);
              setFilters(f => ({ ...f, ...patch, page: 1 }));
            }} />
          </aside>

          <main className="flex-1 min-w-0">
            {loading ? <p className="text-gray-500">Loading tasks…</p> :
              error ? <p className="text-rose-600">{error.status === 401 ? "Please sign in." : (error.message || "Could not load tasks.")}</p> :
                tasks.length > 0 ? (
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-5 auto-rows-fr">
                    {padTo(tasks, PAGE_SIZE).map((task, i) => (
                      <div key={task?.id || task?._id || `placeholder-${i}`} className="h-full min-w-0">
                        {task ? (
                          <TaskCard
                            task={task}
                            autoOpen={String(taskIdFromUrl || "") === String(task.id || task._id)}
                            onRequestClose={cleanTaskIdFromURL}
                            onCancelled={() => run()}
                          />
                        ) : (
                          <div className="h-full rounded-2xl border border-dashed border-slate-200 bg-white/60" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500">No tasks found.</p>
            }

            <div className="flex items-center justify-end gap-2 mt-6">
              <button disabled={meta.page <= 1} onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
              <span className="text-sm text-gray-600">Page {meta.page} {meta.pages ? `of ${meta.pages}` : ""}</span>
              <button disabled={meta.pages ? meta.page >= meta.pages : tasks.length < filters.limit} onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
            </div>
          </main>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setShowFilters(false)} className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white w-80 h-full shadow-xl p-6 z-50">
            <button onClick={() => setShowFilters(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl">×</button>
            <Filters filters={filters} onFilterChange={(patch) => {
              console.log("Filters.patch ->", patch);
              setFilters(f => ({ ...f, ...patch, page: 1 }));
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTasksPage;
