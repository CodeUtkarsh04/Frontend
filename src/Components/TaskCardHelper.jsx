// src/Components/TaskCardHelper.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Package,
  MapPin,
  Calendar,
  IndianRupee,
  User,
  Phone,
  Mail,
  Home,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import ConfirmModal from "./ConfirmModal.jsx";

/* ──────────────────────────────────────────────────────────────
   Auth + API config
───────────────────────────────────────────────────────────── */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const getToken = () => localStorage.getItem("token") || null;

// Endpoints (kept for cancel; complete will use minimal query params as backend requested)
const CANCEL_ENDPOINT = (id) =>
  `${API_BASE}/errand/Cancel?errandId=${encodeURIComponent(id)}`;
const COMPLETE_ENDPOINT_OLD = (helperId, userId, errandId) =>
  `${API_BASE}/errand/TaskCompleted?helperProfileId=${encodeURIComponent(
    helperId
  )}&userProfileId=${encodeURIComponent(userId)}&errandId=${encodeURIComponent(errandId)}`;

// Ngrok splash bypass
const EXTRA_HEADERS = API_BASE.includes("ngrok")
  ? { "ngrok-skip-browser-warning": "true" }
  : {};

const DEFAULT_TIMEOUT_MS = 15000;

/* ────────────── FETCH JSON ────────────── */
async function fetchJSON(url, opts = {}, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...opts,
      signal: ctrl.signal,
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

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw.slice(0, 200)}`);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return { message: raw };
    }
  } finally {
    clearTimeout(t);
  }
}

/* ────────────── ACTION HANDLERS ────────────── */
async function cancelErrand(taskId) {
  return await fetchJSON(CANCEL_ENDPOINT(taskId), { method: "POST" });
}

/* ------------------------------------------------------------------
   REPLACED FUNCTION: completeErrand
   Backend now expects only userProfileId + errandId.
   This function:
    - extracts userProfileId and errandId from the provided task
    - builds minimal URL: /errand/TaskCompleted?userProfileId=...&errandId=...
    - calls fetchJSON POST
   Logging included for QA/debug.
------------------------------------------------------------------ */
async function completeErrand(task) {
  // Accept shaped object, raw backend object, or whatever is passed
  const candidate = task ?? {};
  const raw = candidate.raw ?? candidate;

  // Try to extract userProfileId from common shapes.
  const userProfileId =
    raw?.userProfileId?.id ??
    raw?.userProfileId ??
    raw?.posterUserId ??
    raw?.poster_user_id ??
    (raw?.userId && (typeof raw.userId === "object" ? raw.userId.id ?? raw.userId : raw.userId)) ??
    null;

  // errand id
  const errandId = raw?.id ?? null;

  // QA logs
  console.log("completeErrand called (minimal payload) with candidate:", candidate);
  console.log("-> using raw object for resolution:", raw);
  console.log("-> resolved userProfileId, errandId:", { userProfileId, errandId, tokenPresent: Boolean(getToken()) });

  if (!userProfileId || !errandId) {
    console.error("Missing userProfileId or errandId — aborting completeErrand", { userProfileId, errandId });
    throw new Error("Missing userProfileId or errandId");
  }

  // Build minimal URL as backend requested (no helperProfileId)
  const url = `${API_BASE}/errand/TaskCompleted?userProfileId=${encodeURIComponent(userProfileId)}&errandId=${encodeURIComponent(errandId)}`;
  console.log("-> POST URL (minimal):", url);

  return await fetchJSON(url, { method: "POST" });
}
/* ------------------------------------------------------------------ */

/* ──────────────────────────────────────────────────────────────
   Utils
───────────────────────────────────────────────────────────── */
const STATUS_ALIAS = {
  available: "pending",
  pending: "pending",
  accepted: "accepted",
  active: "ongoing",
  in_progress: "ongoing",
  "in-progress": "ongoing",
  ongoing: "ongoing",
  completed: "completed",
  cancelled: "cancelled",
};

const STATUS = {
  pending: { badge: "bg-amber-50 text-amber-700", border: "border-amber-100", label: "Pending" },
  accepted: { badge: "bg-blue-50 text-blue-700", border: "border-blue-100", label: "Accepted" },
  ongoing: { badge: "bg-indigo-50 text-indigo-700", border: "border-indigo-100", label: "Active" },
  completed: { badge: "bg-green-50 text-green-700", border: "border-green-100", label: "Completed" },
  cancelled: { badge: "bg-rose-50 text-rose-700", border: "border-rose-100", label: "Cancelled" },
};

const nfINR = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const formatINR = (v) => `${nfINR.format(Number(v || 0))}`;
const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-";

// ---- Move pickFirst to top-level utils so it's available before useMemo ----
const pickFirst = (...vals) => vals.find((v) => v != null && String(v).trim() !== "") ?? "";

/* ────────────── UI Small Components ────────────── */
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
    <div className={`${full ? "sm:col-span-2" : ""} pb-3 border-b border-slate-100 last:border-0`}>
      <div className="text-slate-500 text-[12px] tracking-wide">{label}</div>
      <div className="text-slate-900 mt-1">{children}</div>
    </div>
  );
}

function StatusMessage({ type, message }) {
  if (!message) return null;
  const styles = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-rose-50 text-rose-800 border-rose-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };
  return <div className={`mb-4 p-3 rounded-lg border ${styles[type]} text-sm`}>{message}</div>;
}

/* ──────────────────────────────────────────────────────────────
   Main Card Component
───────────────────────────────────────────────────────────── */
export default function TaskCardHelper({ task, autoOpen = false, onRequestClose = () => { }, onAfterAction = () => { } }) {
  const t = useMemo(() => {
    const rawStatus = String(task?.status || "").toLowerCase();
    return {
      id: task?.id ?? "-",
      title: task?.title || task?.name || "",
      description: task?.description ?? "",
      statusKey: STATUS_ALIAS[rawStatus] || "pending",
      budget: task?.price ?? 0,
      createdAt: task?.createdAt ?? null,
      category: task?.categoryId?.name ?? "-",
      location: task?.pickupAddressId?.location ?? "-",
      lat: task?.pickupAddressId?.latitude ?? null,
      lng: task?.pickupAddressId?.longitude ?? null,
      urgency: task?.urgency ?? null,
    };
  }, [task]);

  // customer normalizer uses pickFirst (now defined above)
  const customer = useMemo(() => {
    const cust = task?.customerId || {};
    const addr = task?.pickupAddressId || {};
    const posterProfile = task?.userProfileId || {};

    return {
      id: cust.id || "-",
      name: pickFirst(cust.username, cust.name, posterProfile.name) || "-",
      phone: pickFirst(posterProfile.phone, cust.phone) || "-",
      email: pickFirst(cust.email, posterProfile.email) || "-",
      address: pickFirst(posterProfile.localAddress, addr.address, addr.location) || "-",
    };
  }, [task]);

  const [open, setOpen] = useState(autoOpen);
  const [busyCancel, setBusyCancel] = useState(false);
  const [busyComplete, setBusyComplete] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });

  // ----------------- moved confirm state inside component (minimal change) -----------------
  const [confirmState, setConfirmState] = useState({
    open: false,
    message: "",
    busy: false,
    onConfirm: null,
  });

  function showConfirm({ message, onConfirm }) {
    console.log("showConfirm called:", message);
    setConfirmState({ open: true, message, busy: false, onConfirm });
  }
  // -----------------------------------------------------------------------------------------

  const theme = STATUS[t.statusKey] ?? STATUS.pending;
  const canCancel = ["accepted", "ongoing"].includes(t.statusKey);
  const canComplete = ["accepted", "ongoing"].includes(t.statusKey);

  const openMap = (taskObj) => {
    if (taskObj.lat && taskObj.lng)
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${taskObj.lat},${taskObj.lng}`,
        "_blank",
        "noopener,noreferrer"
      );
    else
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(taskObj.location || "")}`,
        "_blank",
        "noopener,noreferrer"
      );
  };

  const handleCancel = () => {
    if (!canCancel || busyCancel) return;

    showConfirm({
      message: "Are you sure you don't want to do this errand?",
      onConfirm: async () => {
        setConfirmState(s => ({ ...s, busy: true }));
        try {
          setBusyCancel(true);
          await cancelErrand(t.id);
          setStatusMessage({ type: "success", message: "Errand cancelled successfully!" });
          setTimeout(() => {
            setOpen(false);
            onAfterAction();
          }, 1500);
        } catch (e) {
          setStatusMessage({ type: "error", message: e.message || "Failed to cancel errand." });
        } finally {
          setBusyCancel(false);
          setConfirmState({ open: false, message: "", busy: false, onConfirm: null });
        }
      },
    });
  };

  const handleComplete = () => {
    if (!canComplete || busyComplete) return;

    showConfirm({
      message: "Mark this errand as completed?",
      onConfirm: async () => {
        console.log(">>> confirm callback invoked — starting complete flow for task id =", t.id);
        console.log(">>> task param (shallow):", {
          id: task?.id ?? t.id,
          helperProfileId: task?.helperProfileId,
          userProfileId: task?.userProfileId,
        });

        setConfirmState((s) => ({ ...s, busy: true }));
        try {
          setBusyComplete(true);
          console.log(">>> about to call completeErrand(task) — calling now");
          // pass raw backend object if present so extraction works
          await completeErrand(task?.raw ?? task ?? t);
          console.log(">>> completeErrand resolved — success");
          setStatusMessage({ type: "success", message: "Errand completed successfully! 🎉" });
          setTimeout(() => {
            setOpen(false);
            onAfterAction();
          }, 1500);
        } catch (e) {
          console.error(">>> completeErrand failed:", e);
          setStatusMessage({ type: "error", message: e.message || "Failed to complete errand." });
        } finally {
          setBusyComplete(false);
          setConfirmState({ open: false, message: "", busy: false, onConfirm: null });
        }
      },
    });
  };

  return (
    <>
      <div
        className={`w-full h-full flex flex-col rounded-2xl border ${theme.border} bg-white p-5 shadow hover:shadow-lg hover:ring-1 hover:ring-slate-200 transition`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            <Package className="w-3.5 h-3.5" /> {t.category}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${theme.badge}`}>
            {theme.label}
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-500">Task ID: {t.id}</p>
        {t.description && (
          <p className="mt-2 text-[14px] text-slate-800 leading-6 break-normal line-clamp-3">
            {t.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-slate-700">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> {t.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4" /> {formatINR(t.budget)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-600">
            <Calendar className="w-4 h-4" /> {formatDate(t.createdAt)}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-[13px] font-medium text-slate-800 hover:bg-slate-100 transition"
          >
            View details <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <StatusMessage type={statusMessage.type} message={statusMessage.message} />

        {/* Errand Details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
          <div className="text-[12px] font-semibold text-slate-500 uppercase mb-3">
            Errand Details
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 text-[14px]">
            <Row label="Task ID">{t.id}</Row>
            {t.title && <Row label="Title">{t.title}</Row>}
            {t.description && <Row label="Description" full>{t.description}</Row>}
            <Row label="Category"><Package className="w-4 h-4" /> {t.category}</Row>
            <Row label="Pickup Location" full><MapPin className="w-4 h-4" /> {t.location}</Row>
            <Row label="Created"><Calendar className="w-4 h-4" /> {formatDate(t.createdAt)}</Row>
            <Row label="Budget"><IndianRupee className="w-4 h-4" /> {formatINR(t.budget)}</Row>
            {t.urgency && <Row label="Urgency">{String(t.urgency).toUpperCase()}</Row>}
            <Row label="Status">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${theme.badge}`}>
                {theme.label}
              </span>
            </Row>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => openMap(t)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-[13px] font-medium text-slate-800 hover:bg-slate-100 transition"
            >
              View Map <ArrowRight className="w-4 h-4" />
            </button>

            {canComplete && (
              <button
                onClick={handleComplete}
                disabled={busyComplete}
                className="inline-flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 text-green-700 px-3.5 py-2 text-[13px] font-medium hover:bg-green-100 transition disabled:opacity-60"
              >
                <CheckCircle className="w-4 h-4" />
                {busyComplete ? "Completing…" : "Complete Errand"}
              </button>
            )}
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={busyCancel}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-300 text-rose-700 px-3.5 py-2 text-[13px] font-medium hover:bg-rose-50 transition disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" />
                {busyCancel ? "Cancelling…" : "Cancel Task"}
              </button>
            )}
          </div>
        </section>

        {/* Customer Contact */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-[12px] font-semibold text-slate-500 uppercase mb-3">
            Customer Contact
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 text-[14px]">
            <Row label="Name"><User className="w-4 h-4" /> {customer?.name || "-"}</Row>
            <Row label="Phone"><Phone className="w-4 h-4" /> {customer?.phone || "-"}</Row>
            <Row label="Email"><Mail className="w-4 h-4" /> {customer?.email || "-"}</Row>
            <Row label="Local Address" full><Home className="w-4 h-4" /> {customer?.address || "-"}</Row>
          </div>
        </section>
      </Modal>
      <ConfirmModal
        open={confirmState.open}
        message={confirmState.message}
        busy={confirmState.busy}
        onCancel={() =>
          setConfirmState({ open: false, message: "", busy: false, onConfirm: null })
        }
        onConfirm={() => {
          if (typeof confirmState.onConfirm === "function") confirmState.onConfirm();
        }}
      />
    </>
  );
}
