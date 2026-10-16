import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
export default function LibraryStatePage() {
  const l = useSelector((s) => s.library);
  return (
    <section>
      <p className="eyebrow">GLOBAL LIBRARY STORE</p>
      <h1>One collection. Always in sync.</h1>
      <p>
        These values come from the same Redux Toolkit store used by the
        catalogue and member dashboard.
      </p>
      {l.loading && <p role="status">Updating library…</p>}
      {l.error && <p role="alert">{l.error}</p>}
      <div className="stats">
        <div>
          <strong>{l.books.length}</strong>Books
        </div>
        <div>
          <strong>{l.borrowedBooks.length}</strong>Borrowed
        </div>
        <div>
          <strong>{l.readingHistory.length}</strong>History entries
        </div>
      </div>
      <p>Member: {l.member?.name || "Guest"}</p>
      <Link className="button" to="/books">
        Browse & borrow
      </Link>{" "}
      <Link to="/member/borrowed">Renew, return & view holds →</Link>
    </section>
  );
}
