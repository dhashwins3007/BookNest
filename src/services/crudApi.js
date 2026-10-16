import { api } from "./client";
export const getBooks = async () => (await api.get("/books")).data;
export const addBook = async (book) => (await api.post("/books", book)).data;
export const updateBook = async (id, book) =>
  (await api.patch(`/books/${id}`, book)).data;
export const deleteBook = async (id) => (await api.delete(`/books/${id}`)).data;
