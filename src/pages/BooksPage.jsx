import { useRef, useEffect } from "react";
import useLibrary from "../Components/useLibrary";
import BookList from "../Components/BookList";
import FilterPanel from "../Components/FilterPanel";
export default function BooksPage() {
  const l = useLibrary(),
    ref = useRef();
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <section>
      <h1>Books</h1>

      <div className="filters">
        <label>
          Book title
          <input
            type="search"
            ref={ref}
            value={l.titleSearch}
            onChange={(e) => l.setTitleSearch(e.target.value)}
            placeholder="Search titles…"
          />
        </label>
        <label>
          Author
          <input
            type="search"
            value={l.authorSearch}
            onChange={(e) => l.setAuthorSearch(e.target.value)}
            placeholder="Search authors…"
          />
        </label>
        <FilterPanel />
        <label>
          Availability
          <select
            value={l.availability}
            onChange={(e) => l.setAvailability(e.target.value)}
          >
            <option>All</option>
            <option>Available</option>
            <option>Borrowed</option>
          </select>
        </label>
        <button className="secondary" onClick={l.clearSearch}>
          Reset
        </button>
      </div>
      {l.loading ? (
        <p role="status">Loading books…</p>
      ) : l.error ? (
        <p className="error" role="alert">
          {l.error}
        </p>
      ) : (
        <>
          <p className="muted">
            {l.filteredBooks.length} books in your collection
          </p>
          <BookList />
        </>
      )}
    </section>
  );
}
