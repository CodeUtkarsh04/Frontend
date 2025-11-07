// src/components/RatingModal.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function RatingModal({
  visible,
  userName = "User",
  userId = null, // preferred
  targetId = null, // legacy
  onSubmit,
  onClose,
}) {
  const [hoverValue, setHoverValue] = useState(0);
  const [value, setValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  // reset when closed
  useEffect(() => {
    if (!visible) {
      setHoverValue(0);
      setValue(0);
      setSubmitting(false);
      setError("");
    }
  }, [visible]);

  // ---------- handleSubmit (defined before keyboard handler so Enter works) ----------
  const handleSubmit = async () => {
    if (value === 0 || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      // 1) prefer props
      let resolvedUserId = userId ?? targetId ?? null;

      // 2) fallback: common localStorage keys
      if (!resolvedUserId) {
        const lsId = localStorage.getItem("userId");
        if (lsId) resolvedUserId = lsId;
        else {
          try {
            const u = JSON.parse(localStorage.getItem("user") || "null");
            if (u?.id) resolvedUserId = u.id;
          } catch (e) {
            // ignore
          }
        }
      }

      // 3) fallback: try decode token payload (dev-only, no validation)
      if (!resolvedUserId) {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const base64 = token.split(".")[1];
            const json = JSON.parse(atob(base64.replace(/-/g, "+").replace(/_/g, "/")));
            resolvedUserId = json?.id ?? json?.userId ?? json?.sub ?? null;
          } catch (e) {
            // ignore decode errors
          }
        }
      }

      // final check
      if (!resolvedUserId) {
        console.error("RatingModal: missing user id (userId or targetId)");
        setError("Missing user id. Can't submit rating.");
        setSubmitting(false);
        return;
      }

      const ratingParam = encodeURIComponent(Number(value.toFixed(1)));
      const parts = [`rating=${ratingParam}`, `id=${encodeURIComponent(String(resolvedUserId))}`];
      const url = `${BASE_URL || ""}/rating/giveUserReview?${parts.join("&")}`;

      console.log("RatingModal: submitting rating to:", url);

      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, */*",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const text = await res.text().catch(() => "");
      if (!res.ok) {
        let msg = text || `HTTP ${res.status}`;
        try {
          const json = JSON.parse(text);
          msg = json?.message || JSON.stringify(json);
        } catch { }
        throw new Error(msg);
      }

      let payload = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch { }

      // success callback
      onSubmit?.(Number(value.toFixed(1)), payload);
      onClose?.();
    } catch (err) {
      console.error("Rating submit failed:", err);
      setError(err?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- keyboard support (Escape, Enter, arrows) ----------
  const onKey = useCallback(
    (e) => {
      if (!visible) return;
      if (e.key === "Escape") onClose?.();
      if (e.key === "Enter") {
        if (value > 0 && !submitting) handleSubmit();
      }
      if (e.key === "ArrowLeft") {
        setValue((v) => Math.max(0, Math.round((v - 0.1) * 10) / 10));
      }
      if (e.key === "ArrowRight") {
        setValue((v) => Math.min(5, Math.round((v + 0.1) * 10) / 10));
      }
    },
    [visible, value, submitting, onClose, handleSubmit]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  // helpful dev log to see what modal received
  // (note: this is a hook — must run on every render for stable hook order)
  useEffect(() => {
    console.log("RatingModal props:", { userId, targetId, userName, visible });
  }, [userId, targetId, userName, visible]);

  // IMPORTANT: ensure hooks above always run in the same order.
  // Only *after* declaring all hooks we decide whether to render or return null.
  if (!visible) {
    console.log("RatingModal hidden (visible=false)");
    return null;
  }

  // pointer-based rating (works for mouse & touch)
  const handleStarPointer = (e, starIndex, commit = false) => {
    const target = e.currentTarget;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const relativeX = clientX - rect.left;
    const percentage = Math.min(Math.max(relativeX / rect.width, 0), 1);
    const fraction = Math.round(percentage * 10) / 10; // 0.1 steps
    const newRating = Math.min(5, Math.max(0, starIndex - 1 + fraction));
    if (commit) setValue(Math.round(newRating * 10) / 10);
    setHoverValue(Math.round(newRating * 10) / 10);
  };

  const handleLeave = () => setHoverValue(0);
  const display = hoverValue || value;

  const onBackdropClick = () => {
    if (!submitting) onClose?.();
  };

  const renderStar = (i) => {
    const starIndex = i + 1;
    let fillPercent = 0;
    if (display >= starIndex) fillPercent = 100;
    else if (display > starIndex - 1) fillPercent = (display - (starIndex - 1)) * 100;
    const gradId = `rating-grad-${i}`;
    return (
      <button
        key={i}
        type="button"
        onPointerMove={(e) => handleStarPointer(e, starIndex, false)}
        onPointerDown={(e) => handleStarPointer(e, starIndex, true)}
        onPointerUp={(e) => handleStarPointer(e, starIndex, true)}
        onPointerLeave={handleLeave}
        aria-label={`Rate ${starIndex} star${starIndex > 1 ? "s" : ""}`}
        className="relative w-8 h-8 p-0 m-1 cursor-pointer"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden>
          <defs>
            <linearGradient id={gradId} x1="0" x2="1">
              <stop offset={`${fillPercent}%`} stopColor="#FBBF24" />
              <stop offset={`${fillPercent}%`} stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.835 24 12 19.897 5.165 24l1.135-8.69L.6 9.75l7.732-1.732L12 .587z"
            fill={`url(#${gradId})`}
            stroke="#B45309"
            strokeWidth="0.6"
          />
        </svg>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onBackdropClick}
        aria-hidden
      />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 z-10"
      >
        <button
          onClick={() => !submitting && onClose?.()}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          aria-label="Close"
        >
          <X />
        </button>

        <h3 className="text-lg font-semibold mb-1 text-slate-900">Rate {userName}</h3>
        <p className="text-sm text-slate-500 mb-2">Give a fair rating to help the community.</p>

        <div className="flex items-center">
          <div className="flex items-center" onPointerLeave={handleLeave}>
            {Array.from({ length: 5 }).map((_, i) => renderStar(i))}
          </div>

          <div className="ml-4 text-sm font-medium w-12 text-right text-slate-900">
            {display > 0 ? display.toFixed(1) : "0.0"}
          </div>
        </div>

        {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => !submitting && onClose?.()}
            disabled={submitting}
            className="mr-3 px-4 py-2 rounded-lg bg-transparent border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={value === 0 || submitting}
            className={`px-4 py-2 rounded-lg text-white ${value === 0 || submitting ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
              }`}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
