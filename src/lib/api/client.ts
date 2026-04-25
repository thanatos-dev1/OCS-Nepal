import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

// Server-side needs the absolute URL; browser uses the Next.js proxy (same-origin, no CORS)
const baseURL =
  typeof window === "undefined"
    ? process.env.BACKEND_URL
    : process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach Bearer token from auth store
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap {"data": ...} envelope on success
api.interceptors.response.use((res) => {
  if (res.data != null && typeof res.data === "object" && "data" in res.data) {
    res.data = res.data.data;
  }
  return res;
});

// Handle 401 with token refresh + retry queue
let isRefreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

function drainQueue(error: unknown, token: string | null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  queue = [];
}

api.interceptors.response.use(undefined, async (err) => {
  const original = err.config;
  if (err.response?.status !== 401 || original._retry) {
    return Promise.reject(err);
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      queue.push({
        resolve: (token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        },
        reject,
      });
    });
  }

  original._retry = true;
  isRefreshing = true;

  try {
    const { data } = await axios.post("/api/v1/auth/refresh", {}, { withCredentials: true });
    const newToken: string = data.data.access_token;
    useAuthStore.getState().setToken(newToken);
    drainQueue(null, newToken);
    original.headers.Authorization = `Bearer ${newToken}`;
    return api(original);
  } catch (refreshErr) {
    drainQueue(refreshErr, null);
    useAuthStore.getState().clear();
    return Promise.reject(refreshErr);
  } finally {
    isRefreshing = false;
  }
});

export default api;
