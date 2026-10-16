import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useLibrary from "../Components/useLibrary";
import Input from "../Components/Input";
export default function BorrowRequest() {
  const { id } = useParams(),
    navigate = useNavigate(),
    l = useLibrary();
  const book = l.books.find((b) => b.id === Number(id));
  const [name, setName] = useState(l.member.name),
    [phone, setPhone] = useState(l.member.phone || ""),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      if (book.available) {
        await l.borrowBook(book, { name, phone });
      } else {
        await l.placeHold(book);
      }
      navigate(`/borrow-confirmation/${id}`, {
        state: { hold: !book.available, confirmed: true },
      });
    } catch (e) {
      setError(e.message);
    }
  }
  if (!book) return <p>Book not found. Please open the catalogue.</p>;
  return (
    <section className="form-card">
      <h1>{book.available ? "Borrow request" : "Hold request"}</h1>
      <h3>{book.title}</h3>
      <p>
        {book.available
          ? "Borrow for 14 days. Up to two renewals of 7 days each."
          : "We will reserve the next available copy for your member account."}
      </p>
      <form onSubmit={submit}>
        <Input
          label="Member name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          pattern="[0-9]{10}"
          required
        />
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button disabled={l.loading}>
          Confirm {book.available ? "borrow" : "hold"}
        </button>
      </form>
    </section>
  );
}
