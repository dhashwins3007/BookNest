import useLibrary from "./useLibrary";
import BookCard from "./BookCard";

export default function Recommendations() {
  const { recommendations, borrowedIds } = useLibrary();

  return (
    <div className="section">
      <h2>Recommended Books</h2>
      <div className="book-grid">
        {recommendations.map((book) => (
          <BookCard key={book.id} book={book} borrowedIds={borrowedIds} />
        ))}
      </div>
    </div>
  );
}
