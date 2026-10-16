import { useNavigate } from "react-router-dom";
import useLibrary from "./useLibrary";
export default function BorrowButton({ book }) {
  const { borrowedIds } = useLibrary(),
    navigate = useNavigate();
  return (
    <button
      onClick={() =>
        navigate(
          borrowedIds.includes(book.id) ? "/borrowed" : `/borrow/${book.id}`,
        )
      }
    >
      {borrowedIds.includes(book.id)
        ? "View my borrowing"
        : book.available
          ? "Borrow book"
          : "Place a hold"}
    </button>
  );
}
