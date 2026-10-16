import axios from "axios";
export const api = axios.create({ baseURL: "/api", timeout: 10000 });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("libraryToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    )
      window.dispatchEvent(new Event("session-expired"));
    return Promise.reject(
      new Error(
        error.response?.data?.message ||
          "Cannot reach the library API. Run npm start and try again.",
      ),
    );
  },
);

const pending = new Map();
const cache = new Map();
let generation = 0;
export function invalidateReadCache() {
  generation++;
  cache.clear();
  pending.clear();
}
api.interceptors.request.use((config) => {
  if ((config.method || "get").toLowerCase() !== "get") invalidateReadCache();
  return config;
});
export async function cachedGet(url, params = {}) {
  const key = JSON.stringify([
    localStorage.getItem("libraryToken"),
    url,
    params,
  ]);
  const saved = cache.get(key);
  if (saved && saved.expires > Date.now()) return saved.data;
  if (pending.has(key)) return pending.get(key);
  const version = generation;
  const request = api
    .get(url, { params })
    .then((response) => {
      if (version === generation)
        cache.set(key, { data: response.data, expires: Date.now() + 20000 });
      return response.data;
    })
    .finally(() => {
      if (pending.get(key) === request) pending.delete(key);
    });
  pending.set(key, request);
  return request;
}
