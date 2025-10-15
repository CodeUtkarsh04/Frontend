// TaskHistoryCard.jsx
import React, { useMemo, useState } from "react";
import {Package, MapPin, Calendar, IndianRupee, User, Phone, ArrowRight,} from "lucide-react";
import Modal from "./ModalUser.jsx"; 
import { helpersData } from "../data/Helpers.jsx";

/* ---------- Status tokens ---------- */
const STATUS_ALIAS = {
  available: "pending",
  pending: "pending",
  accepted: "accepted",
  active: "ongoing",
  "in_progress": "ongoing",
  "in-progress": "ongoing",
  ongoing: "ongoing",
  completed: "completed",
  cancelled: "cancelled",
};
const STATUS = {
  pending: {
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    border: "border-amber-100",
    label: "Pending",
  },
  accepted: {
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
    border: "border-blue-100",
    label: "Accepted",
  },
  ongoing: {
    badge: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
    border: "border-indigo-100",
    label: "Active",
  },
  completed: {
    badge: "bg-green-50 text-green-700 ring-1 ring-green-100",
    border: "border-green-100",
    label: "Completed",
  },
  cancelled: {
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    border: "border-rose-100",
    label: "Cancelled",
  },
};

/* ---------- Formatters ---------- */
const nfINR = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const formatINR = (v) => `₹ ${nfINR.format(Number(v || 0))}`;
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "-";

/* ---------- Normalizer ---------- */
function useNormalizedTask(raw) {
  return useMemo(() => {
    const rawStatus = String(raw?.status || "").toLowerCase();
    const statusKey = STATUS_ALIAS[rawStatus] || "pending";
    const mockHelper = helpersData.find((h) => h.id === raw?.helperId) || null;

    return {
      id: raw?.id ?? "-",
      title: raw?.title || raw?.name || "",
      description: raw?.description ?? "",
      statusKey,
      category: raw?.category ?? raw?.categoryId?.name ?? "-",
      budget: raw?.budget ?? raw?.pay ?? raw?.price ?? 0,
      location: raw?.location ?? raw?.pickupAddressId?.location ?? "-",
      createdAt: raw?.createdAt ?? raw?.date ?? null,
      urgency: raw?.urgency ?? null,
      helper: raw?.helperProfileId || mockHelper || null,
      customer: raw?.userProfileId || null,
    };
  }, [raw]);
}

/* ---------- Label/Value row with divider ---------- */
function Row({ label, children, full = false }) {
  return (
    <div
      className={
        (full ? "sm:col-span-2 " : "") +
        "pb-3 border-b border-slate-100 last:border-0"
      }
    >
      <div className="text-slate-500 text-[12px] tracking-wide">{label}</div>
      <div className="text-slate-900 mt-1">{children}</div>
    </div>
  );
}

export default function TaskHistoryCard({
  task,
  onCancel = () => { },
  onReopen = () => { },
  onRate = () => { },
}) {
  const [open, setOpen] = useState(false);
  const t = useNormalizedTask(task);
  const theme =
    STATUS[t.statusKey] ?? {
      badge: "bg-gray-50 text-gray-700 ring-1 ring-gray-100",
      border: "border-gray-200",
      label: t.statusKey,
    };

  const isActionCancelVisible = ["pending", "accepted", "ongoing"].includes(
    t.statusKey
  );
  const isActionReopenVisible = t.statusKey === "cancelled";
  const isActionRateVisible = t.statusKey === "completed" && !task?.userRated;

  return (
    <>
      {/* ---------- Card ---------- */}
      <div
        className={`h-full flex flex-col rounded-2xl border ${theme.border} bg-white/90 p-5
                    shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]
                    hover:ring-1 hover:ring-slate-200 transition`}
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            <Package className="w-3.5 h-3.5" />
            {t.category}
          </span>
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${theme.badge}`}
          >
            {theme.label}
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-500">Task ID: {t.id}</p>

        {t.description && (
          <p className="mt-2 text-[14px] text-slate-800 leading-6 line-clamp-3">
            {t.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-slate-700">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {t.location}
          </span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
          <span className="inline-flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4" />
            {formatINR(t.budget)}
          </span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
          <span className="inline-flex items-center gap-1.5 text-slate-600">
            <Calendar className="w-4 h-4" />
            {formatDate(t.createdAt)}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-[13px] font-medium text-slate-800
                       hover:bg-slate-100 active:scale-[0.99] transition"
          >
            View details
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ---------- Modal ---------- */}
      <Modal open={open} onClose={() => setOpen(false)}>
        {/* Header row with prominent budget & status */}
        <div className="mb-4 flex items-start justify-between">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${theme.badge}`}
          >
            {theme.label}
          </span>
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 ring-1 ring-emerald-100 px-3.5 py-2">
            <IndianRupee className="w-4 h-4 text-emerald-700" />
            <span className="text-emerald-700 font-semibold text-[15px]">
              {formatINR(t.budget)}
            </span>
          </div>
        </div>

        {/* Errand Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
          <div className="text-[12px] font-semibold text-slate-500 tracking-wider uppercase mb-3">
            Errand Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-0 text-[14px]">
            <Row label="Task ID">{t.id}</Row>
            {t.title && <Row label="Title">{t.title}</Row>}
            {t.description && (
              <Row label="Description" full>
                {t.description}
              </Row>
            )}
            <Row label="Category">
              <span className="inline-flex items-center gap-2">
                <Package className="w-4 h-4" /> {t.category}
              </span>
            </Row>
            <Row label="Location" full>
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {t.location}
              </span>
            </Row>
            <Row label="Created">
              <span className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {formatDate(t.createdAt)}
              </span>
            </Row>
            {task?.urgency && (
              <Row label="Urgency">{String(task.urgency).toUpperCase()}</Row>
            )}
          </div>
        </section>

        {/* Helper Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-[12px] font-semibold text-slate-500 tracking-wider uppercase mb-3">
            Helper Details
          </div>

          {t.helper ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-0 text-[14px]">
              <Row label="Name">
                <span className="inline-flex items-center gap-2">
                  <User className="w-4 h-4" /> {t.helper.name ?? "-"}
                </span>
              </Row>
              <Row label="Mobile">
                <span className="inline-flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {t.helper.phone ?? "-"}
                </span>
              </Row>
              <Row label="Age">{t.helper.age ?? "-"}</Row>
            </div>
          ) : (
            <div className="text-slate-500 text-[14px]">Not assigned yet.</div>
          )}
        </section>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-3 justify-end">
          {isActionReopenVisible && (
            <button
              onClick={() => onReopen(task)}
              className="px-4 py-2 text-[13px] rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Reopen Task
            </button>
          )}
          {isActionCancelVisible && (
            <button
              onClick={() => {
                onCancel(task);
                setOpen(false);
              }}
              className="px-4 py-2 text-[13px] rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              Cancel Task
            </button>
          )}
          {isActionRateVisible && (
            <button
              onClick={() => onRate(task)}
              className="px-4 py-2 text-[13px] rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Rate & Review
            </button>
          )}
        </div>
      </Modal>
    </>
  );
}
