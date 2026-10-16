import { memo } from "react";
import bookImage from "../utils/bookImage";
import { Link } from "react-router-dom";
function BookCard({ book }) {
  return (
    <article className="book-card">
      <Link
        className="cover"
        aria-label={`View details of ${book.title}`}
        to={`/book/${book.id}`}
      >
        {book.image ? (
          <img
            src={bookImage(book.image)}
            loading="lazy"
            decoding="async"
            width="160"
            height="210"
            alt={`${book.title} cover`}
          />
        ) : (
          <div className="cover-placeholder">{book.title}</div>
        )}
      </Link>
      <div className="book-info">
        <span className="eyebrow">{book.category}</span>
        <h3>
          <Link to={`/book/${book.id}`}>{book.title}</Link>
        </h3>
        <p>{book.author}</p>
        <div className="card-bottom">
          <span className={book.available ? "badge" : "badge unavailable"}>
            {book.available ? "Available" : "On loan"}
          </span>
          <Link to={`/book/${book.id}`}>Details →</Link>
        </div>
      </div>
    </article>
  );
}

export default memo(BookCard);
