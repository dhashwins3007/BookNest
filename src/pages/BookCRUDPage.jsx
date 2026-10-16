import { useState } from "react";
import { useDispatch } from "react-redux";
import useLibrary from "../Components/useLibrary";
import { api } from "../services/client";
import { loadLibrary } from "../store/librarySlice";
import Input from "../Components/Input";
const blank = {
  title: "",
  author: "",
  category: "",
  year: "",
  description: "",
};
export default function BookCRUDPage() {
  const l = useLibrary(),
    dispatch = useDispatch();
  const [form, setForm] = useState(blank),
    [edit, setEdit] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (edit) await api.patch(`/books/${edit}`, form);
      else await api.post("/books", form);
      await dispatch(loadLibrary()).unwrap();
      setForm(blank);
      setEdit(null);
      setMessage("Book saved. Catalogue updated.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(b) {
    if (!confirm(`Delete “${b.title}” from the catalogue?`)) return;
    setBusy(true);
    try {
      await api.delete(`/books/${b.id}`);
      await dispatch(loadLibrary()).unwrap();
      setMessage("Book deleted.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <p className="eyebrow">CATALOGUE MANAGEMENT</p>
      <h1>Keep the shelves up to date.</h1>
      <div className="manage-layout">
        <form className="panel" onSubmit={save}>
          <h2>{edit ? "Edit book" : "Add a new book"}</h2>
          {["title", "author", "category", "year"].map((key) => (
            <Input
              key={key}
              label={key}
              required
              type={key === "year" ? "number" : "text"}
              min={key === "year" ? 1000 : undefined}
              max={key === "year" ? new Date().getFullYear() : undefined}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          ))}
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <button disabled={busy}>
            {busy ? "Saving…" : edit ? "Save changes" : "Add book"}
          </button>
          {edit && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEdit(null);
                setForm(blank);
              }}
            >
              Cancel edit
            </button>
          )}
          {message && <p role="status">{message}</p>}
        </form>
        <div>
          {!l.books.length && <p>No books found.</p>}
          {l.books.map((b) => (
            <article className="history-item" key={b.id}>
              <span className="eyebrow">
                {b.category} · {b.year}
              </span>
              <h3>{b.title}</h3>
              <p>
                {b.author} · {b.available ? "Available" : "Borrowed"}
              </p>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => {
                  setEdit(b.id);
                  setForm({
                    title: b.title,
                    author: b.author,
                    category: b.category,
                    year: b.year,
                    description: b.description,
                  });
                }}
              >
                Edit
              </button>
              <button
                className="danger"
                disabled={busy}
                onClick={() => remove(b)}
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
