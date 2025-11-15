// src/Components/TaskCardUser.jsx

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Package, MapPin, Calendar, User, Phone, ArrowRight, Mail, Home } from "lucide-react";
import RatingModal from "./RatingModalUser.jsx";

/* ──────────────────────────────────────────────────────────────────────────────
   Auth + API config
──────────────────────────────────────────────────────────────────────────────── */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const getToken = () => localStorage.getItem("token") || null;

const HELPER_ENDPOINT = (id) => `${API_BASE}/errand/showAllUsersErrands`;
const CANCEL_ENDPOINT = (id) =>
  `${API_BASE}/errand/CancelUserErrand?id=${encodeURIComponent(id)}`;
const EXTRA_HEADERS = API_BASE.includes("ngrok") ? { "ngrok-skip-browser-warning": "true" } : {};

const DEFAULT_TIMEOUT_MS = 15000;

/* ────────────── FETCH JSON ────────────── */
async function fetchJSON(url, opts = {}, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const token = getToken();
  if (!token) {
    const err = new Error("Not authenticated");
    err.status = 401;
    throw err;
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...opts,
      signal: ctrl.signal,
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
  } finally {
    clearTimeout(t);
  }
}

/* ────────────── CANCEL (fixed) ────────────── */
async function cancelTaskRequest(taskId) {
  const token = getToken();
  if (!token) {
    const err = new Error("Not authenticated");
    err.status = 401;
    throw err;
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(CANCEL_ENDPOINT(taskId), {
      method: "DELETE", 
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*", 
        ...EXTRA_HEADERS,
      },
    });

    const text = await res.text().catch(() => "");
    if (!res.ok) {
      const e = new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      e.status = res.status;
      throw e;
    }

    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  } finally {
    clearTimeout(t);
  }
}
function pickHelperFromErrands(json, { helperId, taskId }) {
  const rows = Array.isArray(json) ? json : (json?.data ?? []);
  if (!Array.isArray(rows) || rows.length === 0) return null;

  let hit = null;
  if (taskId != null) {
    hit = rows.find(r => String(r?.id ?? r?._id) === String(taskId)) || null;
  }

  if (!hit && helperId != null) {
    hit = rows.find(r =>
      String(
        r?.helperProfileId?.id ??
        r?.helperProfileId ??
        r?.runnerId?.id ??
        r?.runnerId ??
        r?.assignedHelperId ??
        r?.helper?.id ??
        ""
      ) === String(helperId)
    ) || null;
  }

  if (!hit) return null;

  return (
    hit.helper ||
    hit.assignedHelper ||
    hit.helperProfile ||
    hit.helperProfileId || 
    null
  );
}


/* ──────────────────────────────────────────────────────────────────────────────
   Utils / formatters / normalizers
──────────────────────────────────────────────────────────────────────────────── */
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
  pending: { badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-100", border: "border-amber-100", label: "Pending" },
  accepted: { badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-100", border: "border-blue-100", label: "Accepted" },
  ongoing: { badge: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100", border: "border-indigo-100", label: "Active" },
  completed: { badge: "bg-green-50 text-green-700 ring-1 ring-green-100", border: "border-green-100", label: "Completed" },
  cancelled: { badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-100", border: "border-rose-100", label: "Cancelled" },
};

const nfINR = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const formatINR = (v) => `₹ ${nfINR.format(Number(v || 0))}`;
const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-";

const pickFirst = (...vals) => vals.find((v) => v != null && String(v).trim() !== "") ?? "-";

function normalizeHelper(h) {
  if (!h || typeof h !== "object") return null;
  return {
    id: pickFirst(h.id, h.helperId, h.profileId),
    name: pickFirst(h.name, h.fullName, h.full_name, h.username, h.profile?.name, h.user?.name, h.userid?.name),
    phone: pickFirst(h.phone, h.mobile, h.mobileNumber, h.contactNumber, h.profile?.phone, h.userid?.phone),
    email: pickFirst(h.email, h.userid?.email, h.user?.email, h.profile?.email),
    address: pickFirst(h.localAddress, h.address, h.profile?.address, h.location),
  };
}

function isHelperValid(helper) {
  if (!helper) return false;
  const fields = [helper.name, helper.phone, helper.email, helper.address];
  return fields.some((v) => v && v !== "-");
}


function resolveHelperId(raw) {
  const direct =
    raw?.helperProfileId?.id ??
    raw?.helperProfileId ??
    raw?.runnerId?.id ??
    raw?.runnerId ??
    raw?.assignedHelperId ??
    null;
  if (direct) return { id: direct, from: "explicit" };

  const up = raw?.userProfileId ?? null;
  const upUserId = up?.userid?.id ?? up?.user?.id ?? up?.userId ?? null;

  const customerUserId =
    raw?.customerId?.id ?? raw?.customerId?.userid?.id ?? null;

  const looksLikeHelper = up && upUserId && customerUserId && upUserId !== customerUserId;
  if (looksLikeHelper) {
    const profileId = up?.id ?? up?.profileId ?? null;
    if (profileId) return { id: profileId, from: "userProfileId-fallback" };
  }

  return { id: null, from: "none" };
}

function normalizeTask(raw) {
  const rawStatus = String(raw?.status || "").toLowerCase();
  const statusKey = STATUS_ALIAS[rawStatus] || "pending";

  const { id: helperId, from: helperSource } = resolveHelperId(raw);

  let helperSnapshot = null;
  if (helperId) {
    if (helperSource === "userProfileId-fallback") {
      helperSnapshot = raw?.userProfileId ?? null;
    } else {
      helperSnapshot = raw?.helper ?? raw?.assignedHelper ?? raw?.helperProfile ?? null;
    }
  }

  const helperAssignedAt =
    raw?.helperAssignedAt ??
    raw?.acceptedAt ??
    (helperId ? raw?.updatedAt ?? null : null);

  return {
    id: raw?.id ?? "-",
    title: raw?.title || raw?.name || "",
    description: raw?.description ?? "",
    statusKey,

    budget: raw?.price ?? 0,
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,

    category: raw?.categoryId?.name ?? "-",

    location: raw?.pickupAddressId?.location ?? "-",
    lat: raw?.pickupAddressId?.latitude ?? null,
    lng: raw?.pickupAddressId?.longitude ?? null,

    helperId,
    helperSource,
    helper: helperSnapshot,

    customer: raw?.customerId || null,
    customerEmail: raw?.customerId?.email ?? "-",

    posterProfile: raw?.userProfileId ?? null,

    isAssigned: Boolean(helperId),
    assignedAt: helperAssignedAt,

    urgency: raw?.urgency ?? null,
    userRated: Boolean(raw?.userRated),
  };
}

/* ──────────────────────────────────────────────────────────────────────────────
   Helper polling hook
──────────────────────────────────────────────────────────────────────────────── */
function useHelperProfile(helperId, taskId, intervalMs = 3000) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(helperId || taskId));
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let alive = true;
    let intervalId;

    const run = async () => {
      if (!helperId && !taskId) {
        if (alive) {
          setData(null);
          setLoading(false);
          setError(null);
        }
        return;
      }
      setLoading(true);
      setError(null);

      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const json = await fetchJSON(HELPER_ENDPOINT(helperId), { signal: ctrl.signal });
        const helper = pickHelperFromErrands(json, { helperId, taskId });
        setData(helper && typeof helper === "object" ? helper : null);
      } catch (e) {
        if (!alive) return;
        if (e.name !== "AbortError") {
          setError(e);
          setData(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    if (helperId || taskId) run();
    if ((helperId || taskId) && intervalMs > 0) intervalId = setInterval(run, intervalMs);

    return () => {
      alive = false;
      if (intervalId) clearInterval(intervalId);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [helperId, taskId, intervalMs]);

  const refetch = useCallback(async () => {
    if (!helperId && !taskId) return null;
    return fetchJSON(HELPER_ENDPOINT(helperId));
  }, [helperId, taskId]);

  return { data, loading, error, refetch };
}

/* ──────────────────────────────────────────────────────────────────────────────
   Small UI bits
──────────────────────────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────────────────────────
   Card (export)
──────────────────────────────────────────────────────────────────────────────── */
export default function TaskCardUser({
  task,
  autoOpen = false,
  onRequestClose = () => { },
  onCancelled = () => { },
}) {
  const t = useMemo(() => normalizeTask(task), [task]);

  const [open, setOpen] = useState(false);
  const [busyCancel, setBusyCancel] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [hasRated, setHasRated] = useState(Boolean(t.userRated));


  const theme = STATUS[t.statusKey] ?? {
    badge: "bg-gray-50 text-gray-700 ring-1 ring-gray-100",
    border: "border-gray-200",
    label: t.statusKey,
  };

  const handleOpen = useCallback(() => {
    const token = getToken();
    if (!token) {
      alert("Please sign in to view details.");
      return;
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!autoOpen) return;
    const token = getToken();
    if (!token) {
      alert("Please sign in to view details.");
      try {
        onRequestClose();
      } catch { }
      return;
    }
    setOpen(true);
  }, [autoOpen, onRequestClose]);

  const handleClose = useCallback(() => {
    setOpen(false);
    try {
      onRequestClose();
    } catch { }
  }, [onRequestClose]);

  const shouldPoll = Boolean(open && (t.helperId || t.id));
  const {
    data: helperFromApi,
    loading: helperLoading,
    error: helperError,
    refetch,
  } = useHelperProfile(shouldPoll ? t.helperId : null, shouldPoll ? t.id : null);

  const embeddedSnapshot =
    t.helper ?? t.assignedHelper ?? t.helperProfile ?? t.userProfileId ?? null;
  const helperRaw = embeddedSnapshot || helperFromApi || null;
  const helper = useMemo(() => normalizeHelper(helperRaw), [helperRaw]);

  const helperAssigned = t.isAssigned;
  const helperHasValidData = isHelperValid(helper);

  const hasHelperData = helperHasValidData;
  const consideredAssigned = t.isAssigned || hasHelperData;

  const helperName = helper?.name || "Helper";
  const canRateHelper =
    t.statusKey === "completed" && Boolean(t.helperId) && !hasRated;

  const taskAcceptedButNoHelper =
    !helperAssigned && (t.statusKey === "accepted" || t.statusKey === "ongoing");

  const refreshHelper = useCallback(async () => {
    try {
      setManualRefreshing(true);
      await refetch();
    } catch {
    } finally {
      setManualRefreshing(false);
    }
  }, [refetch]);

  const openMap = (taskObj) => {
    if (taskObj.lat != null && taskObj.lng != null)
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

  const canCancel = ["pending", "accepted", "ongoing"].includes(t.statusKey);

  const cancelTask = async () => {
    if (!canCancel || busyCancel) return;
    try {
      setBusyCancel(true);
      await cancelTaskRequest(t.id);
      setBusyCancel(false);
      setOpen(false);
      onCancelled(t.id);
    } catch (e) {
      setBusyCancel(false);
      alert(e?.message || "Failed to cancel task.");
    }
  };

  return (
    <>
      <div
        className={`w-full h-full flex flex-col rounded-2xl border ${theme.border} bg-white p-5 shadow hover:shadow-lg hover:ring-1 hover:ring-slate-200 transition`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            <Package className="w-3.5 h-3.5" />
            {t.category}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${theme.badge}`}>
            {theme.label}
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-500">Task ID: {t.id}</p>

        {t.description && (
          <p className="mt-2 text-[14px] text-slate-800 leading-6 break-normal line-clamp-3">{t.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-slate-700  min-w-0">
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{t.location}</span>
          </span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
          <span className="inline-flex items-center gap-1.5">
            {formatINR(t.budget)}
          </span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
          <span className="inline-flex items-center gap-1.5 text-slate-600">
            <Calendar className="w-4 h-4" />
            {formatDate(t.createdAt)}
          </span>
        </div>

        <div className="mt-auto pt-4 flex gap-2">
          <button
            onClick={handleOpen}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-[13px] font-medium text-slate-800 hover:bg-slate-100 active:scale-[0.99] transition"
          >
            View details <ArrowRight className="w-4 h-4" />
          </button>
          {canCancel && (
            <button
              onClick={cancelTask}
              disabled={busyCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-300 text-rose-700 px-3.5 py-2 text-[13px] font-medium hover:bg-rose-50 disabled:opacity-60"
            >
              {busyCancel ? "Cancelling…" : "Cancel"}
            </button>
          )}
        </div>
      </div>

      <Modal open={open} onClose={handleClose}>
        {/* Errand Details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
          <div className="text-[12px] font-semibold text-slate-500 tracking-wider uppercase mb-3">
            Errand Details
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-0 text-[14px]">
            <Row label="Task ID">{t.id}</Row>
            {t.title && <Row label="Title">{t.title}</Row>}
            {t.description && <Row label="Description" full>{t.description}</Row>}
            <Row label="Category">
              <span className="inline-flex items-center gap-2">
                <Package className="w-4 h-4" /> {t.category}
              </span>
            </Row>
            <Row label="Pickup Location" full>
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {t.location}
              </span>
            </Row>
            <Row label="Created">
              <span className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {formatDate(t.createdAt)}
              </span>
            </Row>
            <Row label="Budget">{formatINR(t.budget)}</Row>

            {t.urgency && <Row label="Urgency">{String(t.urgency).toUpperCase()}</Row>}
            {t.assignedAt && (
              <Row label="Helper Assigned At">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {formatDate(t.assignedAt)}
                </span>
              </Row>
            )}
            <Row label="Status">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${theme.badge}`}>
                {theme.label}
              </span>
            </Row>
            {/* ✅ UNTIL HERE */}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => openMap(t)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-[13px] font-medium text-slate-800 hover:bg-slate-100 transition"
            >
              View Map <ArrowRight className="w-4 h-4" />
            </button>
            {canCancel && (
              <button
                onClick={cancelTask}
                disabled={busyCancel}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-300 text-rose-700 px-3.5 py-2 text-[13px] font-medium hover:bg-rose-50 disabled:opacity-60"
              >
                {busyCancel ? "Cancelling…" : "Cancel Task"}
              </button>
            )}
          </div>
        </section>

        {/* Helper Contact — 4 State Logic */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-[12px] font-semibold text-slate-500 tracking-wider uppercase mb-3">
            Helper Contact
          </div>

          {/* STATE 1: Pending (no helper assigned) */}
          {!consideredAssigned && !taskAcceptedButNoHelper && (
            <div className="text-slate-600 text-[14px]">
              No helper has accepted this task yet. You’ll see their contact here once someone is assigned.
            </div>
          )}

          {/* STATE 2: Accepted/Ongoing but NO helperId (backend delay/bug) */}
          {taskAcceptedButNoHelper && !hasHelperData && (
            <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 text-[14px]">
              A helper seems to have accepted, but the system hasn’t attached the helper ID yet. This will update
              automatically once it’s linked.
            </div>
          )}

          {/* STATE 3: Assigned + data present */}

          {consideredAssigned && hasHelperData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 text-[14px]">
              {/* Name + Buttons (same row) */}
              <div className="pb-3 border-b border-slate-100 last:border-0 sm:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-slate-500 text-[12px] tracking-wide">Name</div>
                    <div className="text-slate-900 mt-1 inline-flex items-center gap-2">
                      <User className="w-4 h-4" /> {helper.name || "-"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Visit Profile */}
                    <button
                      onClick={() => { if (helper?.id) window.open(`/profile/${helper.id}`, "_blank"); }}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white text-slate-800 px-3.5 py-2 text-[13px] font-medium hover:bg-slate-100 transition"
                    >
                      <User className="w-4 h-4" /> Visit Profile
                    </button>
                    {/* Rate Helper (same placement as helper card) */}
                    <button
                      disabled={!canRateHelper}
                      onClick={() => { if (!canRateHelper) return; setOpen(false); setShowRating(true); }}
                      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium transition border ${canRateHelper
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        : "border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                      ☆ {hasRated ? "Rated" : "Rate Helper"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Phone + Email (two-up row) */}
              <div className="pb-3 border-b border-slate-100 last:border-0 sm:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start sm:gap-50">
                  <div className="min-w-0">
                    <div className="text-slate-500 text-[12px] tracking-wide">Phone</div>
                    <div className="text-slate-900 mt-1 inline-flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                      <Phone className="w-4 h-4" /> {helper.phone || "-"}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-500 text-[12px] tracking-wide">Email</div>
                    <div className="text-slate-900 mt-1 inline-flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                      <Mail className="w-4 h-4" /> {helper.email || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address full-width */}
              <div className="pb-0 border-0 sm:col-span-2">
                <div className="text-slate-500 text-[12px] tracking-wide">Local Address</div>
                <div className="text-slate-900 mt-1 inline-flex items-start gap-2">
                  <Home className="w-4 h-4 mt-0.5" />
                  <span>{helper.address || "-"}</span>
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: Assigned but data missing */}
          {consideredAssigned && !hasHelperData && (
            <div className="text-[14px]">
              <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Helper has been assigned, but their details aren’t available yet.
                {helperLoading && <span className="ml-1">Fetching…</span>}
                {helperError && <div className="text-rose-700 mt-2">Couldn’t load helper info: {helperError.message}</div>}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={refreshHelper}
                  disabled={manualRefreshing || helperLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-[13px] font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-60"
                >
                  {manualRefreshing ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>
          )}
        </section>
      </Modal>

      <RatingModal
        visible={showRating}
        userName={helperName}
        userId={t.helperId}          
        onSubmit={(value) => {
          console.log("Rated helper:", { rating: value, helperId: t.helperId });
          setHasRated(true);         
          setShowRating(false);
        }}
        onClose={() => setShowRating(false)}
      />
    </>
  );
}
