import { NavLink, Outlet } from "react-router-dom";
import useLibrary from "../Components/useLibrary";
export default function MemberDashboard() {
  const l = useLibrary();
  return (
    <section>
      <p className="eyebrow">YOUR PERSONAL SPACE</p>
      <h1>Hello, {l.member.name}.</h1>
      <p>A little reading, every day.</p>
      <div className="stats">
        <div>
          <strong>{l.borrowedBooks.length}</strong>Books borrowed
        </div>
        <div>
          <strong>{l.readingHistory.length}</strong>Reading activities
        </div>
        <div>
          <strong>{l.holdRequests.length}</strong>Books on hold
        </div>
      </div>
      <nav className="dashboard-nav">
        <NavLink to="/member/borrowed">Borrowed books</NavLink>
        <NavLink to="/member/history">Reading history</NavLink>
        <NavLink to="/member/recommendations">Recommendations</NavLink>
        <NavLink to="/member/profile">Profile</NavLink>
      </nav>
      <div className="dashboard-panel">
        <Outlet />
      </div>
    </section>
  );
}
