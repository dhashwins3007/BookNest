import useAuth from "./useAuth";
import useLibrary from "./useLibrary";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const {
    borrowedBooks = [],
    readingHistory = [],
    holdRequests = [],
  } = useLibrary();

  return (
    <div className="profile-page">
      <div className="profile-banner">
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase() || "M"}
        </div>
        <div>
          <p className="profile-label">BOOKNEST MEMBER</p>
          <h1>My Profile</h1>
          <p>Manage your library account and reading activity.</p>
        </div>
      </div>

      <div className="profile-layout">
        <section className="profile-details">
          <h2>Personal Information</h2>
          <div className="profile-detail-row">
            <span>Full Name</span>
            <strong>{user?.name || "Member"}</strong>
          </div>
          <div className="profile-detail-row">
            <span>Member ID</span>
            <strong>{user?.id || "Not available"}</strong>
          </div>
          <div className="profile-detail-row">
            <span>Email Address</span>
            <strong>{user?.email || "Not available"}</strong>
          </div>
          <Link className="profile-books-btn" to="/books">
            Explore Books
          </Link>
        </section>

        <section className="profile-activity">
          <h2>My Library Activity</h2>
          <div className="profile-stat">
            <span>📚</span>
            <div>
              <p>Borrowed Books</p>
              <strong>{borrowedBooks.length}</strong>
            </div>
          </div>
          <div className="profile-stat">
            <span>📖</span>
            <div>
              <p>Reading History</p>
              <strong>{readingHistory.length}</strong>
            </div>
          </div>
          <div className="profile-stat">
            <span>🔖</span>
            <div>
              <p>Hold Requests</p>
              <strong>{holdRequests.length}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
