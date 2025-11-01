import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setAuth, fetchMe, isLikelyJWT, clearAuth } from "../auth"

export default function LogInPage({ mode = "user" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  // Enhanced validation
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const validatePassword = (password) => {
    return password.length >= 6 && password.length <= 128;
  };

  // Computed validation states
  const emailIsValid = validateEmail(email.trim());
  const passwordIsValid = validatePassword(password.trim());

  // Auto-clear messages
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, message.type === "success" ? 3000 : 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const loginApiCall = async (email, password) => {

    let resp;
    try {
      resp = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "*/*" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
    } catch {
      throw new Error("Network error. Check your connection.");
    }

    const ct = resp.headers.get("content-type") || "";
    let body;
    try {
      if (ct.includes("application/json")) {
        body = await resp.json();
      } else {
        body = await resp.text();
      }
    } catch {
      body = null;
    }

    if (!resp.ok) {
      const msg =
        (typeof body === "object" && (body?.message || body?.error)) ||
        (typeof body === "string" && body) ||
        `Login failed (${resp.status})`;
      throw new Error(msg);
    }

    // Normalize output to { token, user }
    let token = null;
    let user = null;

    if (typeof body === "string") {
      token = body.trim();
    } else if (body && typeof body === "object") {
      // If server encodes failures inside 200s, try to detect them
      const looksLikeFailure =
        body.success === false ||
        /wrong credential|invalid|failed/i.test(body.message || "") ||
        /wrong credential|invalid|failed/i.test(body.error || "");

      if (looksLikeFailure) {
        throw new Error(body.message || body.error || "Invalid credentials.");
      }

      token = body.token || body.accessToken || body.jwt || null;
      user = body.user || body.data?.user || null;
    }

    if (!isLikelyJWT(token)) {
      // If your auth is cookie-based (no JWT in body), you could relax this
      // and rely on /auth/me below. For now, block obvious junk.
      throw new Error("Invalid email or password.");
    }

    return { token, user, raw: body };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setMessage({ type: "", text: "" });

    if (!emailIsValid || !passwordIsValid) {
      setMessage({ type: "error", text: "Please enter valid credentials." });
      return;
    }

    setLoading(true);
    try {
      const res = await loginApiCall(email.trim(), password);
      if (!res?.token) throw new Error("No token in response.");

      // Tentatively store token, but don't navigate yet
      setAuth({ token: res.token }); // role/user only after verification

      // Must verify identity from backend
      const me = await fetchMe(); // calls /auth/me with Bearer token
      const role = me?.role || me?.user?.role || null;
      if (!role) {
        clearAuth();
        throw new Error("Login failed to verify. Please check your credentials.");
      }
      setAuth({ token: res.token, role, user: me?.user || res?.user || null });

      console.log('Final role before navigation:', role);
      console.log('Token in localStorage:', localStorage.getItem('token'));
      console.log('Role in localStorage:', localStorage.getItem('role'));

      setMessage({ type: "success", text: "Login successful!" });

      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        if (mode === "helper") {
          // after helper-side login:
          navigate("/helper", { replace: true });          // to helper landing
          // or: navigate("/helper/dashboard", { replace: true }); // to helper dashboard directly
        } else {
          // after user-side login:
          navigate("/user", { replace: true });
        }
      }, 100);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6 ">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-center text-[#111827] mb-3">
          Log In
        </h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          Enter your login details to access your account
        </p>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-4 px-4 py-2 rounded ${message.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
              }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
          {/* Email */}
          <div className="w-full max-w-xs">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="Enter your email"
              className={`w-full px-4 py-3 rounded-xl border ${touched.email && !emailIsValid
                ? "border-red-400 bg-red-50"
                : "border-gray-200"
                }`}
              disabled={loading}
            />
            {touched.email && !emailIsValid && (
              <p className="mt-1 text-xs text-red-600">Enter a valid email.</p>
            )}
          </div>

          {/* Password */}
          <div className="w-full max-w-xs">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-xl border ${touched.password && !passwordIsValid
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200"
                  } pr-12`}
                disabled={loading}
              />
              {/* Toggle show/hide */}
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-600 hover:underline"
                disabled={loading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {touched.password && !passwordIsValid && (
              <p className="mt-1 text-xs text-red-600">
                Password must be at least 6 characters.
              </p>
            )}
            {/* <div className="text-right mt-2">
              <a href="#" onClick={handleForgotPassword} className="text-sm text-indigo-600 hover:underline">
                Forgot your password?
              </a>
            </div> */}
          </div>

          {/* Button */}
          <div className="w-full max-w-xs">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold 
             bg-gradient-to-r from-indigo-600 to-blue-500 
             text-white shadow-md hover:shadow-lg hover:opacity-90 
             transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 bg-gray-50 rounded-xl py-3 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
              className="text-indigo-600 font-medium hover:underline"
            >
              Create a new account
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}