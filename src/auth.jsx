const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getToken = () => localStorage.getItem("token") || null;
export const getRole  = () => localStorage.getItem("role") || null;
export const getUser  = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
};

export const setAuth = ({ token, role, user }) => {
  console.log('setAuth called with:', { token: !!token, role, user: !!user });
  if (token) localStorage.setItem("token", token);
  if (role)  localStorage.setItem("role", role);
  if (user)  localStorage.setItem("user", JSON.stringify(user));
  console.log('After setAuth - localStorage role:', localStorage.getItem('role'));
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
};

// Try to fetch the logged-in user/role
export const fetchMe = async () => {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("me failed");
    const data = await res.json();
    const role = data?.role || data?.user?.role || data?.data?.role || null;
    const user = data?.user || data || null;
    if (role) setAuth({ token, role, user });
    return { role, user };
  } catch {
    // fallback: decode JWT
    try {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      console.log('JWT payload:', payload);
      const role = payload?.role || payload?.roles?.[0] || payload?.userType || 'user'; // default to 'user'
      if (role) setAuth({ token, role });
      return { role, user: null };
    } catch (err) {
      console.log('JWT decode error:', err);
      return { role: null, user: null };
    }
  }
};
