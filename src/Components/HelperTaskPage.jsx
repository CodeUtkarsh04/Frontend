// HelperTaskPage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Filters from "./Filters";
import TaskCardHelper from "./TaskCardHelper";

/* -------------------------------------------------------
   Auth + API config
-------------------------------------------------------- */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const getToken = () => localStorage.getItem("token") || null;
const LIST_ENDPOINT = "/errand/HelperTask";

const EXTRA_HEADERS = API_BASE.includes("ngrok") ? { "ngrok-skip-browser-warning": "true" } : {};
console.log("🔧 [HELPER-PAGE/CFG] API_BASE =", API_BASE, "EXTRA_HEADERS =", EXTRA_HEADERS);

/* -------------------------------------------------------
   Fetch helper with robust error handling
-------------------------------------------------------- */
async function fetchJSON(path, opts = {}) {
  const token = getToken();
  console.log("🔐 [HELPER-PAGE/AUTH] token present?", Boolean(token));
  if (!token) {
    const err = new Error("Not authenticated");
    err.status = 401;
    console.warn("⛔ [HELPER-PAGE/AUTH] Missing token → throwing 401");
    throw err;
  }

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  console.log("🌐 [HELPER-PAGE/HTTP] FETCH", url, "method:", opts.method || "GET");

  const res = await fetch(url, {
    ...opts,
    headers: {
      Accept: "application/json, */*",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
      ...EXTRA_HEADERS,
    },
    credentials: opts.credentials ?? "include",
  });

  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text().catch(() => "");

  console.log("📥 [HELPER-PAGE/HTTP] status:", res.status, "content-type:", contentType, "raw.len:", raw?.length);

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}: ${raw.slice(0, 200)}`);
    err.status = res.status;
    console.error("🔥 [HELPER-PAGE/HTTP] Error:", err.message);
    throw err;
  }

  if (!raw) {
    console.warn("⚠️ [HELPER-PAGE/HTTP] Empty body");
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    console.log("✅ [HELPER-PAGE/HTTP] Parsed JSON ok (keys):", Object.keys(parsed || {}));
    return parsed;
  } catch (e) {
    console.error("💥 [HELPER-PAGE/HTTP] JSON parse failed:", e.message, "raw head:", raw.slice(0, 200));
    throw new Error(`Bad JSON: ${e.message}. First 200 chars: ${raw.slice(0, 200)}`);
  }
}

/* -------------------------------------------------------
   Utils / Shape helpers
-------------------------------------------------------- */
const PAGE_SIZE = 15;

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
  const qs = p.toString();
  console.log("🧮 [HELPER-PAGE/QS] built:", qs);
  return qs;
}

function padTo(arr, n) {
  return [...arr, ...Array(Math.max(0, n - arr.length)).fill(null)].slice(0, n);
}

function toNumOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function shapeUserProfileId(up) {
  if (!up || typeof up !== "object") return null;
  return {
    id: up.id ?? null,
    name: up.name ?? null,
    phone: up.phone ?? null,
    userid: up.userid
      ? {
        id: up.userid.id ?? null,
        username: up.userid.username ?? null,
        email: up.userid.email ?? null,
        password: up.userid.password ?? null,
        roleId: up.userid.roleId ?? null,
      }
      : null,
    age: up.age ?? null,
    earning: toNumOrNull(up.earning ?? 0),
    createdAT: up.createdAT ?? null,
    localAddress: up.localAddress ?? null,
    taskPosted: up.taskPosted ?? null,
    taskAccepted: up.taskAccepted ?? null,
  };
}

function shapeTaskRow(x) {
  if (!x || typeof x !== "object") return null;
  const shaped = {
    id: x.id ?? null,
    title: x.title ?? x.name ?? null,
    description: x.description ?? x.title ?? null,
    price: toNumOrNull(x.price ?? x.pay ?? x.amount ?? x.budget),
    status: x.status ?? null,
    createdAt: x.createdAt ?? x.created_at ?? null,
    updatedAt: x.updatedAt ?? x.updated_at ?? null,

    customerId: x.customerId
      ? {
        id: x.customerId.id ?? null,
        username: x.customerId.username ?? null,
        email: x.customerId.email ?? null,
        password: x.customerId.password ?? null,
        roleId: x.customerId.roleId ?? null,
      }
      : null,

    runnerId: x.runnerId ?? x.helperId ?? null,

    categoryId: x.categoryId
      ? {
        id: x.categoryId.id ?? null,
        name: x.categoryId.name ?? null,
      }
      : null,

    pickupAddressId: x.pickupAddressId
      ? {
        id: x.pickupAddressId.id ?? null,
        address: x.pickupAddressId.address ?? null,
        location: x.pickupAddressId.location ?? null,
        latitude: x.pickupAddressId.latitude ?? null,
        longitude: x.pickupAddressId.longitude ?? null,
        userId: x.pickupAddressId.userId ?? null,
      }
      : null,

    userProfileId: shapeUserProfileId(x.userProfileId),
    helperProfileId: x.helperProfileId ?? null,
    urgency: x.urgency ?? null,

    // Keep raw object for card integration
    raw: x,
  };
  return shaped;
}

// ---------- Robust category extraction & matching ----------
function norm(s) {
  return (s ?? "").toString().trim().replace(/\s+/g, " ").replace(/&/g, "and").toLowerCase();
}

function extractCategoryNames(explicitCat, task) {
  const candidates = [];
  const pushVal = (v) => {
    if (v == null) return;
    if (Array.isArray(v)) return v.forEach(pushVal);
    if (typeof v === "object") {
      const name = v.name ?? v.title ?? v.label ?? v.slug ?? v.value ?? v.key;
      if (name) candidates.push(String(name));
      else {
        try { candidates.push(JSON.stringify(v)); } catch (e) { }
      }
      return;
    }
    candidates.push(String(v));
  };

  if (explicitCat !== undefined && explicitCat !== null && explicitCat !== "") pushVal(explicitCat);

  if ((!explicitCat || explicitCat === "") && task) {
    const keysToCheck = [
      "category", "categories", "cat", "type", "types",
      "tags", "tag", "service", "services", "meta",
      "category_id", "categoryId", "catId", "categorySlug", "category_name"
    ];
    for (const k of keysToCheck) if (Object.prototype.hasOwnProperty.call(task, k)) pushVal(task[k]);

    if (task.category && typeof task.category === "object") pushVal(task.category.name ?? task.category.title ?? task.category.label);
    if (Array.isArray(task.categories)) task.categories.forEach(c => pushVal(c.name ?? c.title ?? c));
    if (Array.isArray(task.tags)) task.tags.forEach(t => pushVal(t.name ?? t.label ?? t));
    if (task.service) pushVal(task.service.name ?? task.service.title ?? task.service);
    if (task.details && task.details.category) pushVal(task.details.category);
  }

  return Array.from(new Set(candidates.map(c => c && c.toString()).filter(Boolean)));
}

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


/* -------------------------------------------------------
   Page: HelperTaskPage
-------------------------------------------------------- */
export default function HelperTaskPage() {
  // filters & UI
  const [filters, setFilters] = useState({
    status: "All",
    category: "All Categories",
    search: "",
    page: 1,
    limit: PAGE_SIZE,
    sort: "createdAt:desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  // data states
  const [allTasksShaped, setAllTasksShaped] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // refs for polling / concurrency
  const intervalRef = useRef(null);
  const busyRef = useRef(false);
  const failCountRef = useRef(0);
  const MAX_FAILS = 5;

  // query param / navigation support
  const query = useQuery();
  const navigate = useNavigate();
  const taskIdFromUrl = query.get("taskId");
  const qs = useMemo(() => buildQuery(filters), [filters]);

  // Core fetch-run function
  const run = useCallback(async () => {
    if (busyRef.current) {
      console.log("🟡 [HELPER-PAGE/RUN] Skipped (busy)...");
      return;
    }
    busyRef.current = true;
    setError(null);

    try {
      if (!API_BASE) {
        throw new Error("VITE_API_BASE_URL is not set. Configure your API base URL.");
      }

      const path = `${LIST_ENDPOINT}`;

      const json = await fetchJSON(path);

      const rows = Array.isArray(json) ? json : (json?.data ?? []);

      const shaped = rows.map(shapeTaskRow).filter(Boolean);

      setAllTasksShaped(shaped);

      const backendMeta = Array.isArray(json) ? null : (json?.meta ?? null);

      if (backendMeta && typeof backendMeta.total === "number") {
        setTasks(shaped);
        setMeta({
          page: backendMeta.page ?? filters.page,
          pages:
            backendMeta.pages ??
            Math.max(1, Math.ceil((backendMeta.total || shaped.length) / (backendMeta.limit || filters.limit))),
          total: backendMeta.total ?? shaped.length,
          limit: backendMeta.limit ?? filters.limit,
        });
      } else {
        setMeta({ page: 1, pages: 1, total: shaped.length, limit: filters.limit });
      }


      failCountRef.current = 0;
      console.log("✅ [HELPER-PAGE/RUN] done. tasks:", shaped.length);
    } catch (e) {
      console.error("🔥 [HELPER-PAGE/RUN] error:", e);
      setTasks([]);
      setMeta({ page: 1, pages: 1, total: 0, limit: filters.limit });
      setError(e);
      failCountRef.current += 1;

      if (failCountRef.current >= MAX_FAILS && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.warn("🛑 [HELPER-PAGE/RUN] Polling stopped due to repeated failures.");
      }
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, [qs, filters.page, filters.limit, filters]);

  // ----------------- client-side filtering (compute filteredTasks) -----------------
  const filteredTasks = useMemo(() => {
    const s = filters.status ?? "All";
    const c = filters.category ?? "All Categories";
    const q = (filters.search ?? "").toString().trim().toLowerCase();

    const filtered = allTasksShaped.filter(t => {
      if (!t) return false;

      // status: normalized equality
      if (s && s !== "All") {
        if (norm(t.status ?? t.raw?.status ?? "") !== norm(s)) return false;
      }

      // category: tolerant matching (uses matchesCategory)
      if (c && c !== "All Categories") {
        const taskCategoryField = t.categoryId?.name ?? t.raw?.category ?? t.categoryId ?? t.raw;
        if (!matchesCategory(taskCategoryField, c, t.raw ?? t)) return false;
      }

      // search (title/description/category)
      const taskCategoryValue = Array.isArray(t.categoryId) ? t.categoryId.join(" ") : (t.categoryId?.name ?? t.raw?.category ?? "");
      const hay = `${t.title ?? ""} ${t.description ?? ""} ${taskCategoryValue}`.toLowerCase();
      if (q && !hay.includes(q)) return false;

      return true;
    });

    console.log("DEBUG Helper: filters:", filters);
    console.log("DEBUG Helper: filtered count:", filtered.length);
    console.log("DEBUG Helper: filtered sample cats:", filtered.slice(0, 8).map(x => extractCategoryNames(x.categoryId ?? x.raw?.category, x.raw)));
    return filtered;
  }, [allTasksShaped, filters.status, filters.category, filters.search]);

  // ----------------- paginate filteredTasks into tasks for rendering -----------------
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


  // initial load + polling + visibility handler
  useEffect(() => {
    console.log("🔄 [HELPER-PAGE/EFFECT] initial load/poll setup");
    setLoading(true);
    run();

    // Polling every 3 seconds
    intervalRef.current = setInterval(run, 3000);

    const onVis = () => {
      if (!document.hidden) {
        console.log("👀 [HELPER-PAGE/VIS] tab visible → refresh");
        run();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      console.log("🧹 [HELPER-PAGE/CLEANUP] clear interval + listener");
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [run]);

  const handleFilterChange = useCallback((patch) => {
    console.log("🧮 [HELPER-PAGE/FILTER] patch:", patch);
    setFilters((f) => ({ ...f, ...patch, page: 1 }));
  }, []);

  const handleAfterAction = useCallback(() => {
    console.log("♻️ [HELPER-PAGE/CARD] onAfterAction → refresh list");
    run();
  }, [run]);

  console.log("🧰 [HELPER-PAGE/RENDER] loading:", loading, "error:", error?.message, "tasks:", tasks.length, "meta:", meta);

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-28 pb-12">
        {/* Mobile header */}
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h2 className="text-xl font-bold text-gray-900">Available Errands</h2>
          <button
            onClick={() => setShowFilters(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Filters
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden md:block w-64 min-w-[16rem] shrink-0">
            <div className="sticky top-24">
              <Filters filters={filters} onFilterChange={handleFilterChange} />
            </div>
          </aside>

          {/* Tasks grid */}
          <main className="flex-1 min-w-0">
            {/* Header for desktop */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Available Errands</h1>
              {!loading && !error && meta.total > 0 && (
                <p className="text-sm text-gray-500">
                  {meta.total} {meta.total === 1 ? "errand" : "errands"} found
                </p>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading errands…</p>
                  <p className="text-gray-400 text-sm mt-1">Please wait</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 mb-4">
                  <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-rose-900 mb-2">
                  {error.status === 401 ? "Authentication Required" : "Error Loading Errands"}
                </h3>
                <p className="text-rose-600 mb-4">
                  {error.status === 401
                    ? "Please sign in to view available errands."
                    : typeof error.message === "string"
                      ? error.message
                      : "An unexpected error occurred while loading errands."}
                </p>
                {error.status === 401 ? (
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Sign In
                  </button>
                ) : (
                  <button
                    onClick={() => run()}
                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                  >
                    Try Again
                  </button>
                )}
              </div>
            ) : tasks.length > 0 ? (
              <>
                <div
                  className="
                    grid gap-6
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3 lg:grid-rows-5
                    auto-rows-fr
                  "
                >
                  {padTo(tasks, PAGE_SIZE).map((task, i) => {
                    const key = task?.id || task?._id || `placeholder-${i}`;
                    return (
                      <div key={key} className="h-full min-w-0">
                        {task ? (
                          <TaskCardHelper
                            task={task}
                            onAfterAction={handleAfterAction}
                          />
                        ) : (
                          <div className="h-full rounded-2xl border border-dashed border-slate-200 bg-white/60" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">{Math.min((meta.page - 1) * meta.limit + 1, meta.total)}</span> - <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-medium">{meta.total}</span> errands
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={meta.page <= 1}
                      onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(meta.pages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        const isActive = pageNum === meta.page;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setFilters((f) => ({ ...f, page: pageNum }))}
                            className={`w-10 h-10 rounded-lg font-medium transition ${isActive
                              ? "bg-blue-600 text-white"
                              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {meta.pages > 5 && (
                        <>
                          <span className="px-2 text-slate-400">...</span>
                          <button
                            onClick={() => setFilters((f) => ({ ...f, page: meta.pages }))}
                            className={`w-10 h-10 rounded-lg font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition ${meta.page === meta.pages ? "bg-blue-600 text-white" : ""
                              }`}
                          >
                            {meta.pages}
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      disabled={meta.pages ? meta.page >= meta.pages : tasks.length < filters.limit}
                      onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Errands Found</h3>
                <p className="text-gray-500 mb-6">
                  {filters.status !== "All" || filters.category !== "All Categories" || filters.search
                    ? "Try adjusting your filters to see more results"
                    : "There are no available errands at the moment. Check back later!"}
                </p>
                {(filters.status !== "All" || filters.category !== "All Categories" || filters.search) && (
                  <button
                    onClick={() => setFilters({
                      status: "All",
                      category: "All Categories",
                      search: "",
                      page: 1,
                      limit: PAGE_SIZE,
                      sort: "createdAt:desc",
                    })}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setShowFilters(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="relative bg-white w-full max-w-sm h-full shadow-2xl ml-auto overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <Filters onFilterChange={handleFilterChange} />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}