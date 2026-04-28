import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const adminApi = axios.create({
  baseURL,
  withCredentials: false,
});

// Inject admin token from localStorage
adminApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("ocs-admin-token");
    if (raw) {
      try {
        const token = JSON.parse(raw) as string;
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // ignore
      }
    }
  }
  return config;
});

// Unwrap {"data": ...} envelope
adminApi.interceptors.response.use((res) => {
  if (res.data != null && typeof res.data === "object" && "data" in res.data) {
    res.data = res.data.data;
  }
  return res;
});

// On 401, redirect to /admin/login (no refresh endpoint for admin)
adminApi.interceptors.response.use(undefined, (err) => {
  if (err.response?.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("ocs-admin-token");
    localStorage.removeItem("ocs-admin-user");
    window.location.href = "/admin/login";
  }
  return Promise.reject(err);
});

export default adminApi;
