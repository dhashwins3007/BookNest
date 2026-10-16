import { api } from "./client";
export const fetchBooks = async (q = "") =>
  (await api.get("/books", { params: { q } })).data;
export const fetchBookDetails = async (id) =>
  (await api.get(`/books/${id}`)).data;
export const fetchMembers = async () => (await api.get("/members")).data;
export const fetchRecommendations = async (category) =>
  (await api.get("/recommendations", { params: { category } })).data;
