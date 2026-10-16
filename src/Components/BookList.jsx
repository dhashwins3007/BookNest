import useLibrary from "./useLibrary";
import BookCard from "./BookCard";

export default function BookList() {
  const { filteredBooks, borrowedIds } = useLibrary();

  if (!filteredBooks || filteredBooks.length === 0) {
    return <div className="empty">No books found.</div>;
  }

  return (
    <div className="book-grid">
      {filteredBooks.map((book) => (
        <BookCard key={book.id} book={book} borrowedIds={borrowedIds} />
      ))}
    </div>
  );
}
