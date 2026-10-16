import { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
export default function useBooks() {
  const books = useSelector((s) => s.library.books);
  const [titleSearch, setTitleSearch] = useState(""),
    [authorSearch, setAuthorSearch] = useState(""),
    [category, setCategory] = useState("All"),
    [author, setAuthor] = useState("All"),
    [availability, setAvailability] = useState("All");
  const filteredBooks = useMemo(
    () =>
      books.filter(
        (b) =>
          b.title.toLowerCase().includes(titleSearch.toLowerCase()) &&
          b.author.toLowerCase().includes(authorSearch.toLowerCase()) &&
          (category === "All" || b.category === category) &&
          (author === "All" || b.author === author) &&
          (availability === "All" ||
            (availability === "Available" ? b.available : !b.available)),
      ),
    [books, titleSearch, authorSearch, category, author, availability],
  );
  const categories = useMemo(
    () => ["All", ...new Set(books.map((b) => b.category))],
    [books],
  );
  const authors = useMemo(
    () => ["All", ...new Set(books.map((b) => b.author))],
    [books],
  );
  const clearSearch = useCallback(() => {
    setTitleSearch("");
    setAuthorSearch("");
    setCategory("All");
    setAuthor("All");
    setAvailability("All");
  }, []);
  const availableBooks = useMemo(
    () => books.filter((book) => book.available),
    [books],
  );
  return {
    availableBooks,
    books,
    filteredBooks,
    titleSearch,
    setTitleSearch,
    authorSearch,
    setAuthorSearch,
    category,
    setCategory,
    author,
    setAuthor,
    availability,
    setAvailability,
    categories,
    authors,
    clearSearch,
  };
}
