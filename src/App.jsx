import ConnectionStatus from "./Components/ConnectionStatus";
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Components/AuthContext";
import { LibraryProvider } from "./Components/LibraryContext";
import ErrorBoundary from "./Components/ErrorBoundary";
import ProtectedRoute from "./Components/ProtectedRoute";
import Header from "./Components/Header";
const HomePage = lazy(() => import("./pages/HomePage"));
const BooksPage = lazy(() => import("./pages/BooksPage"));
const BookDetailsPage = lazy(() => import("./pages/BookDetailsPage"));
const MembersPage = lazy(() => import("./pages/MembersPage"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const BookCRUDPage = lazy(() => import("./pages/BookCRUDPage"));
const LibraryStatePage = lazy(() => import("./pages/LibraryStatePage"));
const Login = lazy(() => import("./pages/Login"));
const MemberDashboard = lazy(() => import("./pages/MemberDashboard"));
const MemberBorrowed = lazy(() => import("./pages/MemberBorrowed"));
const MemberHistory = lazy(() => import("./pages/MemberHistory"));
const MemberRecommendations = lazy(
  () => import("./pages/MemberRecommendations"),
);
const MemberProfile = lazy(() => import("./pages/MemberProfile"));
import useAuth from "./Components/useAuth";
const BorrowRequest = lazy(() => import("./pages/BorrowRequest"));
const BorrowConfirmation = lazy(() => import("./pages/BorrowConfirmation"));
import "./App.css";

function AppHeader() {
  const { user } = useAuth();
  return user ? <Header /> : null;
}
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LibraryProvider>
          <a className="skip-link" href="#main-content">
            Skip to main content
          </a>
          <ConnectionStatus />
          <AppHeader />
          <main id="main-content" tabIndex={-1}>
            <Suspense
              fallback={
                <p role="status" aria-live="polite">
                  Loading page...
                </p>
              }
            >
              <Routes>
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/books" element={<BooksPage />} />
                  <Route path="/book/:id" element={<BookDetailsPage />} />

                  <Route
                    path="/recommendations"
                    element={<RecommendationsPage />}
                  />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/members" element={<MembersPage />} />
                  <Route path="/crud" element={<BookCRUDPage />} />
                  <Route path="/library-state" element={<LibraryStatePage />} />
                  <Route path="/borrow/:id" element={<BorrowRequest />} />
                  <Route
                    path="/borrow-confirmation/:id"
                    element={<BorrowConfirmation />}
                  />
                  <Route path="/member" element={<MemberDashboard />}>
                    <Route index element={<Navigate to="borrowed" replace />} />
                    <Route path="borrowed" element={<MemberBorrowed />} />
                    <Route path="history" element={<MemberHistory />} />
                    <Route
                      path="recommendations"
                      element={<MemberRecommendations />}
                    />
                    <Route path="profile" element={<MemberProfile />} />
                  </Route>
                  <Route path="/borrowed" element={<MemberBorrowed />} />
                  <Route path="/history" element={<MemberHistory />} />
                  <Route path="/profile" element={<MemberProfile />} />
                </Route>
                <Route path="*" element={<h2>Page Not Found</h2>} />
              </Routes>
            </Suspense>
          </main>
          <footer>BookNest Library</footer>
        </LibraryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
