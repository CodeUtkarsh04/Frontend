import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Skeleton loaders
const SkeletonLine = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);
const SkeletonCircle = ({ size = 112 }) => (
  <div
    className="animate-pulse rounded-full bg-white/20 border-4 border-white/40 shadow"
    style={{ width: size, height: size }}
  />
);
const hasValue = (v) =>
  v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "");
// Display field
const Field = ({ label, value }) => (
  <div className="grid md:grid-cols-[200px_1fr] gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
    <span className="font-bold text-gray-900">{label}</span>
    {hasValue(value) ? (
      <span className="font-semibold text-gray-800 border-b border-gray-200 pb-1">
        {value}
      </span>
    ) : (
      <SkeletonLine className="h-5 w-56" />
    )}
  </div>
);

// Stat card
const StatCard = ({ label, value, loading }) => (
  <div
    className="rounded-2xl p-6 text-center"
    style={{
      width: "260px",
      background: "rgba(255,255,255,.12)",
      border: "1px solid rgba(255,255,255,.35)",
    }}
  >
    {loading ? (
      <>
        <SkeletonLine className="h-7 w-16 mx-auto" />
        <SkeletonLine className="h-3 w-28 mx-auto mt-3" />
      </>
    ) : (
      <>
        <div className="text-2xl font-extrabold">{value ?? 0}</div>
        <div className="mt-2 text-[11px] tracking-wider uppercase opacity-95">
          {label}
        </div>
      </>
    )}
  </div>
);

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // initials generator
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        const res = await fetch(`${BASE_URL}/profile/getProfile`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setProfile(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowLogoutModal(false);
    };
    if (showLogoutModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLogoutModal]);

  const fullName = profile?.name || "";
  const age = profile?.age;
  const phone = profile?.phone;
  const email = profile?.userid?.email;
  const address = profile?.localAddress;
  const memberSince = profile?.createdAT;
  const totalEarnings = profile?.earning;
  const helpedOthers = profile?.taskAccepted;
  const tasksRequested = profile?.taskPosted;

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const formatCurrency = (num) => {
    if (!Number.isFinite(num)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-[73px]" aria-hidden="true" />

      {/* Hero */}
      <section
        className="text-white relative"
        style={{
          background: "linear-gradient(135deg,#1e40af 0%,#0ea5e9 100%)",
        }}
      >
        <button
          onClick={() => setShowLogoutModal(true)}
          aria-label="Log out"
          disabled={loading}
          className="absolute top-6 right-6 z-20 bg-white text-blue-700 font-semibold px-4 py-2 rounded-xl shadow hover:bg-blue-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Log Out
        </button>

        <div
          className="max-w-5xl mx-auto px-6 text-center"
          style={{ paddingTop: "180px", paddingBottom: "96px" }}
        >
          {/* Avatar */}
          <div
            className="mx-auto mb-6 flex items-center justify-center text-4xl font-extrabold select-none"
            style={{
              width: "112px",
              height: "112px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "4px solid rgba(255,255,255,0.35)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            {loading && !fullName ? (
              <SkeletonCircle size={112} />
            ) : fullName ? (
              getInitials(fullName)
            ) : (
              "??"
            )}
          </div>

          {/* Name */}
          {loading && !fullName ? (
            <SkeletonLine className="h-8 w-60 mx-auto" />
          ) : (
            <h1 className="text-4xl font-extrabold">{fullName || "—"}</h1>
          )}

          {/* Meta */}
          {loading ? (
            <SkeletonLine className="h-4 w-72 mx-auto mt-3 opacity-80" />
          ) : (
            <p className="mt-2 text-sm opacity-95">
              {age ? `Age: ${age} years • ` : ""} {phone ? `+91 ${phone}` : ""}
            </p>
          )}

          {/* Stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <StatCard
              label="Total Earnings"
              value={formatCurrency(totalEarnings)}
              loading={loading}
            />

            <StatCard
              label="Helped Others"
              value={helpedOthers}
              loading={loading}
            />
            <StatCard
              label="Tasks Requested"
              value={tasksRequested}
              loading={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6">
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm">
                <span className="font-semibold">Couldn’t load profile:</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8">
              Personal Information
            </h2>

            <div className="space-y-8">
              {/* Basic */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-700 uppercase mb-2">
                  Basic Details
                </h3>
                <div className="space-y-3">
                  <Field label="Full Name" value={fullName} />
                  <Field label="Age" value={age ? `${age} years` : ""} />
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-700 uppercase mb-2">
                  Contact
                </h3>
                <div className="space-y-3">
                  <Field
                    label="Phone Number"
                    value={phone ? `+91 ${phone}` : ""}
                  />
                  <Field label="Email" value={email} />
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-700 uppercase mb-2">
                  Address
                </h3>
                <Field label="Address" value={address} />
              </div>

              {/* Membership */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-700 uppercase mb-2">
                  Membership
                </h3>
                <Field label="Member Since" value={formatDate(memberSince)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-gray-900">Confirm</h3>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  aria-label="Close"
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                >
                  ✕
                </button>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to log out?
              </p>

              <div className="mt-6 flex items-center gap-3 justify-end">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-semibold shadow cursor-pointer  hover:bg-rose-700"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
