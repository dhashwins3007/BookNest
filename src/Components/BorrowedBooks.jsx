import bookImage from "../utils/bookImage";
import { useState } from "react";
import useLibrary from "./useLibrary";
export default function BorrowedBooks() {
  const l = useLibrary();
  const [renewId, setRenewId] = useState(null),
    [reason, setReason] = useState(""),
    [message, setMessage] = useState("");
  async function run(fn) {
    setMessage("");
    try {
      await fn();
      setRenewId(null);
      setReason("");
      setMessage("Library record updated.");
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <section>
      <h2>My borrowed books</h2>
      <p>
        Due soon: {l.dueSoonBooks.length} · Overdue: {l.overdueBooks.length}
      </p>
      {message && <p role="status">{message}</p>}
      {!l.borrowedBooks.length && (
        <div className="empty">
          No borrowed books. Explore the collection to get started.
        </div>
      )}
      {l.borrowedBooks.map((b) => (
        <article className="list-item" key={b.id}>
          {b.image && (
            <img
              src={bookImage(b.image)}
              decoding="async"
              loading="lazy"
              width="80"
              height="115"
              alt={b.title}
            />
          )}
          <div>
            <h3>{b.title}</h3>
            <p>
              Due: {b.dueDate} · Renewals: {b.renewals}/2
            </p>
            <button disabled={l.loading} onClick={() => setRenewId(b.id)}>
              Renew
            </button>
            <button
              className="secondary"
              disabled={l.loading}
              onClick={() => run(() => l.returnBook(b.id))}
            >
              Return
            </button>
            {renewId === b.id && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => l.renewBook(b.id, reason));
                }}
              >
                <label>
                  Reason for renewal
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </label>
                <button disabled={l.loading}>Request 7 more days</button>
              </form>
            )}
          </div>
        </article>
      ))}
      <h2>Hold requests</h2>
      {l.holdRequests.length ? (
        l.holdRequests.map((b) => (
          <p key={b.id}>
            {b.title} · {b.status}
          </p>
        ))
      ) : (
        <p>No hold requests.</p>
      )}
    </section>
  );
}
