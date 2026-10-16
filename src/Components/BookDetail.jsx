import bookImage from "../utils/bookImage";
import useLibrary from "./useLibrary";
import { useNavigate } from "react-router-dom";
import BorrowButton from "./BorrowButton";

export default function BookDetail({ book }) {
  const { borrowedIds } = useLibrary();
  const navigate = useNavigate();

  return (
    <div className="detail">
      <img
        src={bookImage(book.image)}
        decoding="async"
        width="240"
        height="360"
        alt={book.title}
      />
      <div>
        <h1>{book.title}</h1>
        <h3>{book.author}</h3>
        <p>Category: {book.category}</p>
        <p>Published: {book.year}</p>
        <p>Rating: ⭐ {book.rating}</p>
        <p>{book.description}</p>
        <p>
          {borrowedIds.includes(book.id)
            ? "This book is currently borrowed by you."
            : book.available
              ? "This book is available for borrowing."
              : "Book currently unavailable. You can place a hold."}
        </p>
        <BorrowButton book={book} />
        <button onClick={() => navigate("/books")}>Back to Books</button>
      </div>
    </div>
  );
}
