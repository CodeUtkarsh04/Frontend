import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, ListTodo, Star, IndianRupee, User, Smartphone } from "lucide-react";

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
      width: "160px",
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

// --- Rating helpers & UI ---
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));


const formatRating = (raw) => {
  const r = Number.isFinite(raw) ? Number(raw) : 0;
  const clamped = Math.round(clamp(r, 0, 5) * 10) / 10;
  return Number.isInteger(clamped) ? `${clamped}` : `${clamped.toFixed(1)}`;
};

const RatingBadge = ({ rating = 0 }) => {
  const display = formatRating(rating);

  return (
    <div className="flex items-baseline justify-center gap-1">
      <span className="text-2xl font-extrabold text-white">{display}</span>
    </div>
  );
};

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

        // Normalize and extract both ratings (non-invasive)
        const safeUserRating = (() => {
          // prefer userBehaviour if available
          const r =
            data?.userBehaviour ??
            data?.userRating ??
            data?.userAvg ??
            data?.ratings?.user ??
            0;
          const num = Number(r);
          return Number.isFinite(num) ? Math.max(0, Math.min(5, num)) : 0;
        })();


        const safeHelperRating = (() => {
          const r = data?.helperRating ?? data?.helperAvg ?? data?.ratings?.helper ?? data?.rating ?? 0;
          const num = Number(r);
          return Number.isFinite(num) ? Math.max(0, Math.min(5, num)) : 0;
        })();

        setProfile({ ...data, userRating: safeUserRating, helperRating: safeHelperRating });
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

  // ---------- submitRating helper ----------
  const submitRating = async (ratingValue, source = "helper") => {
    // source: "helper"  => current user is helper rating this profile (backend should map this to target user's userRating)
    // source: "user"    => current user is user rating this profile (backend should map this to target helper's helperRating)
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const targetId = profile?._id || profile?.userid?._id || profile?.id;
      if (!targetId) throw new Error("No target id");

      const payload = { targetId, rating: Number(ratingValue), source }; // change keys if backend expects different

      const res = await fetch(`${BASE_URL}/ratings`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();

      // update local profile state using backend values if returned, otherwise fallback
      setProfile((p) => ({
        ...p,
        userRating:
          updated?.userRating ??
          p.userRating ??
          (source === "helper" ? Number(ratingValue) : p.userRating),
        helperRating:
          updated?.helperRating ??
          p.helperRating ??
          (source === "user" ? Number(ratingValue) : p.helperRating),
      }));
    } catch (err) {
      console.error("submitRating error:", err);
      alert("Could not submit rating: " + (err.message || ""));
    }
  };
  // ---------- end submitRating helper ----------

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
        className="relative overflow-hidden text-white"
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%)",
        }}
      >
        {/* Animated gradient orbs */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-25 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
            animation: "float 12s ease-in-out infinite",
          }}
        />

        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Logout button with enhanced styling */}
        <button
          onClick={() => setShowLogoutModal(true)}
          aria-label="Log out"
          disabled={loading}
          className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-sm text-purple-700 font-semibold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Log Out</span>
        </button>

        <div className="max-w-5xl mx-auto px-4 text-center py-16 md:py-24 relative z-10">
          {/* Enhanced avatar with glow effect */}
          <div className="relative inline-block mb-6">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-40"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
                transform: "scale(1.2)",
              }}
            />
            <div
              className="relative mx-auto flex items-center justify-center text-3xl md:text-4xl font-extrabold select-none rounded-full shadow-2xl"
              style={{
                width: 120,
                height: 120,
                background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
                border: "4px solid rgba(255,255,255,0.4)",
                backdropFilter: "blur(10px)",
              }}
            >
              {loading && !fullName ? (
                <SkeletonCircle size={100} />
              ) : fullName ? (
                getInitials(fullName)
              ) : (
                "??"
              )}
            </div>
          </div>

          {/* Name with enhanced typography */}
          {loading && !fullName ? (
            <SkeletonLine className="h-8 w-64 mx-auto" />
          ) : (
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3" style={{
              textShadow: "0 2px 20px rgba(0,0,0,0.15)",
            }}>
              {fullName || "—"}
            </h1>
          )}

          {/* Meta info with icons */}
          {loading ? (
            <SkeletonLine className="h-5 w-72 mx-auto mt-3" />
          ) : (
            <div className="flex items-center justify-center gap-3 text-sm md:text-base opacity-95 mb-10">
              {age && (
                <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4 text-white" />
                  <span>{age} years</span>
                </span>
              )}
              {phone && (
                <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                  <Smartphone className="w-4 h-4 text-white" />
                  <span>+91 {phone}</span>
                </span>
              )}
            </div>
          )}


          {/* Enhanced stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            <div className="group relative p-6 rounded-2xl backdrop-blur-md transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl" style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
              }} />
              <div className="relative">
                <div className="flex justify-center mb-2">
                  <div className="p-2.5 rounded-full bg-white/20">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">{helpedOthers ?? 0}</div>
                <div className="text-[10px] uppercase tracking-widest opacity-90 font-semibold">Helped Others</div>
              </div>
            </div>

            <div className="group relative p-6 rounded-2xl backdrop-blur-md transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl" style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
              }} />
              <div className="relative">
                <div className="flex justify-center mb-2">
                  <div className="p-2.5 rounded-full bg-white/20">
                    <ListTodo className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">{tasksRequested ?? 0}</div>
                <div className="text-[10px] uppercase tracking-widest opacity-90 font-semibold">Tasks Requested</div>
              </div>
            </div>
            <div className="group relative p-6 rounded-2xl backdrop-blur-md transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl" style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
              }} />
              <div className="relative">
                <div className="flex justify-center mb-2">
                  <div className="p-2.5 rounded-full bg-white/20">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">{formatCurrency(totalEarnings)}</div>
                <div className="text-[10px] uppercase tracking-widest opacity-90 font-semibold">Total Earnings</div>
              </div>
            </div>

            <div className="group relative p-6 rounded-2xl backdrop-blur-md transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl" style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
              }} />
              <div className="relative">
                <div className="flex justify-center mb-2">
                  <div className="p-2.5 rounded-full bg-white/20">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  <RatingBadge rating={profile?.userRating ?? 0} />
                </div>
                <div className="text-[10px] uppercase tracking-widest opacity-90 font-semibold">User Rating</div>
              </div>
            </div>
            <div className="group relative p-6 rounded-2xl backdrop-blur-md transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl" style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
              }} />
              <div className="relative">
                <div className="flex justify-center mb-2">
                  <div className="p-2.5 rounded-full bg-white/20">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  <RatingBadge rating={profile?.helperRating ?? 0} />
                </div>
                <div className="text-[10px] uppercase tracking-widest opacity-90 font-semibold">Helper Rating</div>
              </div>
            </div>
          </div>

          {/* Error message with enhanced styling */}
          {error && (
            <div className="mt-6 animate-pulse">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-300/30 px-5 py-2.5 text-sm shadow-lg">
                <span className="text-xl">⚠️</span>
                <span className="font-semibold">Couldn't load profile:</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Animated CSS */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-20px) translateX(10px); }
          }
        `}</style>
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
