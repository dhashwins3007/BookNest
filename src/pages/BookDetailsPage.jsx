import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { cachedGet } from "../services/client";
import BookDetail from "../Components/BookDetail";
export default function BookDetailsPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      await cachedGet(`/books/${id}`)
        .then((r) => {
          if (active) setBook(r);
        })
        .catch((e) => {
          if (active) setError(e.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);
  return loading ? (
    <p role="status">Loading book details…</p>
  ) : error ? (
    <p className="error" role="alert">
      {error}
    </p>
  ) : (
    <BookDetail book={book} />
  );
}
