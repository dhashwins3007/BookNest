import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { libraryOperation } from "../store/librarySlice";
export default function useBorrowing() {
  const state = useSelector((s) => s.library),
    dispatch = useDispatch();
  const { borrowedBooks, readingHistory, holdRequests } = state;
  const borrowedIds = useMemo(
    () => borrowedBooks.map((b) => b.id),
    [borrowedBooks],
  );
  const borrowBook = useCallback(
    (book, details) =>
      dispatch(
        libraryOperation({ action: "borrow", id: book.id, ...details }),
      ).unwrap(),
    [dispatch],
  );
  const returnBook = useCallback(
    (id) => dispatch(libraryOperation({ action: "return", id })).unwrap(),
    [dispatch],
  );
  const renewBook = useCallback(
    (id, reason) =>
      dispatch(libraryOperation({ action: "renew", id, reason })).unwrap(),
    [dispatch],
  );
  const placeHold = useCallback(
    (book) =>
      dispatch(libraryOperation({ action: "hold", id: book.id })).unwrap(),
    [dispatch],
  );
  const today = new Date().toISOString().slice(0, 10);
  const overdueBooks = useMemo(
    () => borrowedBooks.filter((b) => b.dueDate < today),
    [borrowedBooks, today],
  );
  const dueSoonBooks = useMemo(
    () =>
      borrowedBooks.filter((b) => {
        const d = (Date.parse(b.dueDate) - Date.parse(today)) / 86400000;
        return d >= 0 && d <= 3;
      }),
    [borrowedBooks, today],
  );
  const readingStatistics = useMemo(
    () => ({
      borrowed: borrowedBooks.length,
      history: readingHistory.length,
      holds: holdRequests.length,
    }),
    [borrowedBooks, readingHistory, holdRequests],
  );
  const clearBorrowing = useCallback(async () => {
    for (const book of borrowedBooks) await returnBook(book.id);
  }, [borrowedBooks, returnBook]);
  return {
    ...state,
    borrowedIds,
    borrowBook,
    returnBook,
    renewBook,
    placeHold,
    overdueBooks,
    dueSoonBooks,
    readingStatistics,
    clearBorrowing,
  };
}
