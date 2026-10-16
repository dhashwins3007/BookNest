import { useState, useEffect } from "react";
import { cachedGet } from "../services/client";
import useLibrary from "../Components/useLibrary";
import BookCard from "../Components/BookCard";
export default function RecommendationsPage() {
  const { categories } = useLibrary();
  const [category, setCategory] = useState("All"),
    [books, setBooks] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      await cachedGet("/recommendations", { category })
        .then((r) => {
          if (active) setBooks(r);
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
  }, [category]);
  return (
    <section>
      <p className="eyebrow">CURATED FOR YOUR NEXT CHAPTER</p>
      <h1>A little inspiration.</h1>
      <label>
        Choose a category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      {loading ? (
        <p role="status">Finding recommendations…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <>
          <p>
            {books.length
              ? "Available books to explore."
              : "No available recommendations in this category."}
          </p>
          <div className="book-grid">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
