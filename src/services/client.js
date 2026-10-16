/* global __API_BASE__ */

import axios from "axios";

const baseURL =
  typeof __API_BASE__ !== "undefined"
    ? __API_BASE__
    : "/api";

export const api = axios.create({
  baseURL,
  timeout: 60000,

  headers: {
    Accept: "application/json"
  }
});

// Attach authentication token.
api.interceptors.request.use(config => {
  const token = localStorage.getItem("libraryToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle API and session errors.
api.interceptors.response.use(
  response => response,

  error => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      window.dispatchEvent(new Event("session-expired"));
    }

    return Promise.reject(
      new Error(
        error.response?.data?.message ||
        "Unable to connect to the library server. Please try again."
      )
    );
  }
);

// Short-lived in-memory read cache.
const pending = new Map();
const cache = new Map();

let generation = 0;

export function invalidateReadCache() {
  generation++;
  cache.clear();
  pending.clear();
}

// Mutations invalidate previously fetched data.
api.interceptors.request.use(config => {
  const method = (config.method || "get").toLowerCase();

  if (method !== "get") {
    invalidateReadCache();
  }

  return config;
});

export async function cachedGet(url, params = {}) {
  const key = JSON.stringify([
    localStorage.getItem("libraryToken"),
    url,
    params
  ]);

  const saved = cache.get(key);

  if (saved && saved.expires > Date.now()) {
    return saved.data;
  }

  if (pending.has(key)) {
    return pending.get(key);
  }

  const version = generation;

  const request = api
    .get(url, { params })
    .then(response => {
      if (version === generation) {
        cache.set(key, {
          data: response.data,
          expires: Date.now() + 20000
        });
      }

      return response.data;
    })
    .finally(() => {
      if (pending.get(key) === request) {
        pending.delete(key);
      }
    });

  pending.set(key, request);

  return request;
}