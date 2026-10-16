import { createContext, useMemo } from "react";
import useBooks from "../hooks/useBooks";
import useBorrowing from "../hooks/useBorrowing";
import useAuth from "./useAuth";
const LibraryContext = createContext(null);
export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const borrowing = useBorrowing(),
    bookData = useBooks();
  const recommendations = useMemo(
    () => bookData.books.filter((b) => b.available).slice(0, 3),
    [bookData.books],
  );
  return (
    <LibraryContext.Provider
      value={{
        ...borrowing,
        ...bookData,
        member: user || { name: "Reader", id: "", email: "" },
        recommendations,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}
export default LibraryContext;
