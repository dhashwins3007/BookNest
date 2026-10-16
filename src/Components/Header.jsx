import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "./useAuth";
export default function Header() {
  const { user, logout } = useAuth(),
    navigate = useNavigate();
  return (
    <header className="header">
      <NavLink className="brand" to="/">
        ▤ BookNest<span>YOUR NEIGHBOURHOOD LIBRARY</span>
      </NavLink>
      <nav aria-label="Main navigation">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/books">Books</NavLink>
        <NavLink to="/recommendations">Discover</NavLink>
        <NavLink to="/members">Members</NavLink>
        {user ? (
          <>
            <NavLink to="/member">My library</NavLink>
            <NavLink to="/crud">Manage books</NavLink>
            <NavLink to="/library-state">Store</NavLink>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink className="nav-login" to="/login">
            Member login →
          </NavLink>
        )}
      </nav>
    </header>
  );
}
