import { Link } from "react-router-dom";
import useLibrary from "./useLibrary";

export default function Home() {
  const { member, books, borrowedBooks, readingStatistics } = useLibrary();

  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to BookNest 📚</h1>
        <p>Your smart digital library for discovering and borrowing books.</p>
        <p>
          Welcome back, <b>{member.name}</b>!
        </p>
        <Link to="/books">Explore Books</Link>
      </div>
      <div className="stats">
        <div>Total Books: {books.length}</div>
        <div>Borrowed: {borrowedBooks.length}</div>
        <div>History: {readingStatistics.history}</div>
      </div>
    </div>
  );
}
