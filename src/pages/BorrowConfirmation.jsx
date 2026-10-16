import { Link, useLocation } from "react-router-dom";
export default function BorrowConfirmation() {
  const { state } = useLocation();
  return (
    <div className="confirmation">
      <h1>
        {state?.confirmed
          ? state.hold
            ? "Hold requested ✓"
            : "Borrow confirmed ✓"
          : "Your library"}
      </h1>
      <p>
        {state?.confirmed
          ? "Your request has been saved to your member account."
          : "Open your dashboard to view your records."}
      </p>
      <Link className="button" to="/member/borrowed">
        Go to member dashboard →
      </Link>
    </div>
  );
}
