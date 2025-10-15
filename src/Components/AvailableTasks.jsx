// AvailableTasks.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  MapPin, Calendar, User, Package, IndianRupee,
  ArrowRight, Phone, Mail, Home,
} from "lucide-react";

/* -------------------------------------------------------
   Auth + API config
-------------------------------------------------------- */
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getToken = () => localStorage.getItem("token") || null;

/* -------------------------------------------------------
   Utils
-------------------------------------------------------- */
const STATUS = {
  pending: { badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200", label: "Available" },
  accepted: { badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-100", label: "Accepted" },
};
const STATUS_ALIAS = {
  available: "pending",
  pending: "pending",
  accepted: "accepted",
};

const nfINR = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const formatINR = (v) => `₹ ${nfINR.format(Number(v || 0))}`;
const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-";

/* -------------------------------------------------------
   Normalizer
-------------------------------------------------------- */
function normalize(raw) {
  const key = STATUS_ALIAS[String(raw?.status || "").toLowerCase()] || "pending";
  return {
    id: raw?.id ?? "-",
    description: raw?.description ?? "",
    statusKey: key,
    price: raw?.price ?? 0,
    createdAt: raw?.createdAt ?? null,
    category: raw?.categoryId?.name ?? raw?.category ?? "-",
    location: raw?.pickupAddressId?.location ?? raw?.location ?? "-",
    lat: raw?.pickupAddressId?.latitude ?? raw?.lat ?? null,
    lng: raw?.pickupAddressId?.longitude ?? raw?.lng ?? null,
    userName: raw?.userProfileId?.name ?? raw?.customerId?.username ?? raw?.userName ?? "-",
    userPhone: raw?.userProfileId?.phone ?? raw?.userPhone ?? "-",
    userEmail: raw?.customerId?.email ?? raw?.userProfileId?.userid?.email ?? raw?.userEmail ?? "-",
    userAddress: raw?.userProfileId?.localAddress ?? raw?.userAddress ?? "-",
    urgency: raw?.urgency ?? null,
  };
}

/* -------------------------------------------------------
   Components
-------------------------------------------------------- */
function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 flex items-start justify-between">
      <div className="text-sm">{message}</div>
      <button className="ml-4 text-xs underline" onClick={onClose}>Dismiss</button>
    </div>
  );
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[86vh] overflow-auto rounded-2xl bg-white shadow-2xl p-6">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children, full = false }) {
  return (
    <div className={(full ? "sm:col-span-2 " : "") + "pb-3 border-b border-slate-100 last:border-0"}>
      <div className="text-slate-500 text-[12px] tracking-wide">{label}</div>
      <div className="text-slate-900 mt-1">{children}</div>
    </div>
  );
}

function HelperTaskCard({ task, status = "pending", onOpen }) {
  const theme = STATUS[status] ?? STATUS.pending;

  return (
    <div
      className={`h-full flex flex-col rounded-2xl border border-slate-200 bg-white/90 p-5
                  shadow hover:shadow-lg hover:ring-1 hover:ring-slate-200 transition`}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          <Package className="w-3.5 h-3.5" />
          {task.category}
        </span>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${theme.badge}`}>
          {theme.label}
        </span>
      </div>

      <div className="mt-2 text-[12px] text-slate-500 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          {task.userName}
        </span>
      </div>

      {task.description && (
        <p className="mt-2 text-[14px] text-slate-800 leading-6 line-clamp-3">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-slate-700">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          {task.location}
        </span>
        <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
          <IndianRupee className="w-4 h-4" />
          {formatINR(task.price)}
        </span>
        <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <Calendar className="w-4 h-4" />
          {formatDate(task.createdAt)}
        </span>
      </div>

      <div className="mt-auto pt-4">
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-[13px] font-medium text-slate-800
                     hover:bg-slate-100 active:scale-[0.99] transition"
        >
          Details
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Page
-------------------------------------------------------- */
export default function AvailableTasks() {
  const [data, setData] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Tasks");
  const [openTask, setOpenTask] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uiError, setUiError] = useState(null);

  // Fetch tasks
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setUiError(null);

        const token = getToken();
        if (!token) throw new Error("Not authenticated");

        const url = `${BASE_URL}/errand/showErrands`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          signal: ac.signal,
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `GET ${url} failed (${res.status})`);
        }

        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.items ?? []);
        setData(items.map(normalize));
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("GET /errand/showErrands error:", e);
          setError("Failed to load errands.");
          setUiError("Couldn’t load errands. Try again.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  // Filters
  const filteredTasks = useMemo(() => {
    return data.filter((t) => {
      if (activeFilter === "High Pay") return Number(t.price) >= 250;
      return true;
    });
  }, [data, activeFilter]);

  const accept = async (id) => {
    setUiError(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const url = `${BASE_URL}/errand/Accept`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "ngrok-skip-browser-warning": "true",
        },
        body: new URLSearchParams({ id }), // 🔥 send id as form param
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `POST ${url} failed (${res.status})`);
      }

      setData((prev) => prev.filter((t) => t.id !== id));
      setOpenTask(null);
    } catch (e) {
      console.error("POST /errand/Accept error:", e);
      setUiError("Couldn’t accept this task. Please try again.");
    }
  };


  const openMap = (task) => {
    if (task.lat != null && task.lng != null) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${task.lat},${task.lng}`,
        "_blank", "noopener,noreferrer"
      );
    } else {
      const q = encodeURIComponent(task.location || "");
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${q}`,
        "_blank", "noopener,noreferrer"
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 mt-10">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-slate-500">Live errands near you</div>
        <div className="flex flex-wrap gap-2">
          {["All Tasks", "High Pay"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition ${activeFilter === f
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <ErrorBanner message={uiError} onClose={() => setUiError(null)} />

      {loading && <div className="text-slate-500 text-sm">Loading errands…</div>}
      {error && <div className="text-red-600 text-sm">Error: {error}</div>}

      {!loading && !error && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} className="h-full">
                <HelperTaskCard
                  task={task}
                  status={task.statusKey}
                  onOpen={() => setOpenTask(task)}
                />
              </div>
            ))
          ) : (
            <p className="text-slate-500 col-span-full text-center text-lg">
              No errands match your selected filter.
            </p>
          )}
        </div>
      )}

      <Modal open={!!openTask} onClose={() => setOpenTask(null)}>
        {openTask && (
          <>
            <div className="mb-4 flex items-start justify-between">
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS[openTask.statusKey].badge
                  }`}
              >
                {STATUS[openTask.statusKey].label}
              </span>
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 ring-1 ring-emerald-100 px-3.5 py-2">
                <IndianRupee className="w-4 h-4 text-emerald-700" />
                <span className="text-emerald-700 font-semibold text-[15px]">
                  {formatINR(openTask.price)}
                </span>
              </div>
            </div>

            {/* Task details */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
              <div className="text-[12px] font-semibold text-slate-500 tracking-wider uppercase mb-3">
                Task Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 text-[14px]">
                <Row label="Task ID">{openTask.id}</Row>
                <Row label="Category">
                  <span className="inline-flex items-center gap-2">
                    <Package className="w-4 h-4" /> {openTask.category}
                  </span>
                </Row>
                {openTask.description && (
                  <Row label="Description" full>{openTask.description}</Row>
                )}
                <Row label="Pickup Location" full>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {openTask.location}
                  </span>
                </Row>
                <Row label="Created">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {formatDate(openTask.createdAt)}
                  </span>
                </Row>
                {openTask.urgency && (
                  <Row label="Urgency">{String(openTask.urgency).toUpperCase()}</Row>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => openMap(openTask)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-[13px] font-medium text-slate-800 hover:bg-slate-100 transition"
                >
                  View Map <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* User details */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-[12px] font-semibold text-slate-500 tracking-wider uppercase mb-3">
                User Contact
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 text-[14px]">
                <Row label="Name">
                  <span className="inline-flex items-center gap-2">
                    <User className="w-4 h-4" /> {openTask.userName}
                  </span>
                </Row>
                <Row label="Phone">
                  <span className="inline-flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {openTask.userPhone}
                  </span>
                </Row>
                <Row label="Email">
                  <span className="inline-flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {openTask.userEmail}
                  </span>
                </Row>
                <Row label="Local Address" full>
                  <span className="inline-flex items-center gap-2">
                    <Home className="w-4 h-4" /> {openTask.userAddress}
                  </span>
                </Row>
              </div>
            </section>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => accept(openTask.id)}
                className="px-4 py-2 text-[13px] rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Accept Task
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
