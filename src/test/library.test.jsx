import { useContext } from "react";
import LibraryContext from "../Components/LibraryContext";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import BookCard from "../Components/BookCard";
import BookList from "../Components/BookList";
import BookDetail from "../Components/BookDetail";
import BorrowedBooks from "../Components/BorrowedBooks";
import BooksPage from "../pages/BooksPage";
import BorrowRequest from "../pages/BorrowRequest";
import MemberProfile from "../pages/MemberProfile";
import ProtectedRoute from "../Components/ProtectedRoute";
import Login from "../pages/Login";
import useLibrary from "../Components/useLibrary";
import useAuth from "../Components/useAuth";
import useBooks from "../hooks/useBooks";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
jest.mock("../Components/useLibrary");
jest.mock("../Components/useAuth");
const book = {
  id: 1,
  title: "The Alchemist",
  author: "Paulo Coelho",
  category: "Fiction",
  year: 1988,
  rating: 4.7,
  image: "/covers/alchemist.png",
  description: "A journey of self-discovery.",
  available: true,
};
let library, auth;
const loan = {
  ...book,
  dueDate: "2026-12-01",
  renewals: 0,
  status: "Borrowed",
};
const router = (element) =>
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {element}
    </MemoryRouter>,
  );
beforeEach(() => {
  library = {
    books: [book],
    filteredBooks: [book],
    borrowedBooks: [],
    borrowedIds: [],
    holdRequests: [],
    dueSoonBooks: [],
    overdueBooks: [],
    member: {
      id: "LIB101",
      name: "Test Member",
      email: "test@example.com",
      phone: "9876543210",
    },
    categories: ["All", "Fiction"],
    category: "All",
    titleSearch: "",
    authorSearch: "",
    availability: "All",
    setTitleSearch: jest.fn(),
    setAuthorSearch: jest.fn(),
    setCategory: jest.fn(),
    setAvailability: jest.fn(),
    clearSearch: jest.fn(),
    borrowBook: jest.fn().mockResolvedValue({}),
    returnBook: jest.fn().mockResolvedValue({}),
    renewBook: jest.fn().mockResolvedValue({}),
    placeHold: jest.fn().mockResolvedValue({}),
    loading: false,
    error: "",
  };
  auth = {
    user: library.member,
    ready: true,
    isAuthenticated: true,
    updateProfile: jest.fn().mockResolvedValue({}),
    login: jest.fn().mockResolvedValue({}),
  };
  useLibrary.mockReturnValue(library);
  useAuth.mockReturnValue(auth);
});
test("book card displays title, author and accessible lazy image", () => {
  router(<BookCard book={book} />);
  expect(screen.getByText(book.title)).toBeInTheDocument();
  expect(screen.getByText(book.author)).toBeInTheDocument();
  expect(screen.getByAltText(/cover/)).toHaveAttribute("loading", "lazy");
});
test("book availability status changes", () => {
  const { rerender } = router(<BookCard book={book} />);
  expect(screen.getByText("Available")).toBeInTheDocument();
  rerender(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <BookCard book={{ ...book, available: false }} />
    </MemoryRouter>,
  );
  expect(screen.getByText("On loan")).toBeInTheDocument();
});
test("book without cover has readable fallback", () => {
  router(<BookCard book={{ ...book, image: "" }} />);
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getAllByText(book.title).length).toBeGreaterThan(0);
});
test("book list displays records", () => {
  router(<BookList />);
  expect(screen.getByText(book.title)).toBeInTheDocument();
});
test("book list displays empty state", () => {
  useLibrary.mockReturnValue({ ...library, filteredBooks: [] });
  router(<BookList />);
  expect(screen.getByText(/No books found/i)).toBeInTheDocument();
});
test("details show description, publication year and borrowing control", () => {
  router(<BookDetail book={book} />);
  expect(screen.getByText(book.description)).toBeInTheDocument();
  expect(screen.getByText(/1988/)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /Borrow book/i }),
  ).toBeInTheDocument();
});
test("books page shows loading", () => {
  useLibrary.mockReturnValue({ ...library, loading: true });
  router(<BooksPage />);
  expect(screen.getByRole("status")).toHaveTextContent(/Loading/);
});
test("books page shows API errors", () => {
  useLibrary.mockReturnValue({ ...library, error: "Unable to load books" });
  router(<BooksPage />);
  expect(screen.getByRole("alert")).toHaveTextContent("Unable to load books");
});
test("title search and category filter update visible book cards", async () => {
  const user = userEvent.setup();
  const books = [
    book,
    {
      ...book,
      id: 2,
      title: "Clean Code",
      author: "Robert Martin",
      category: "Technology",
    },
  ];
  const store = configureStore({ reducer: { library: () => ({ books }) } });
  useLibrary.mockImplementation(() => useContext(LibraryContext));
  function Harness() {
    const data = useBooks();
    return (
      <LibraryContext.Provider value={{ ...library, ...data }}>
        <BooksPage />
      </LibraryContext.Provider>
    );
  }
  render(
    <Provider store={store}>
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Harness />
      </MemoryRouter>
    </Provider>,
  );
  await user.type(screen.getByLabelText("Book title"), "clean");
  expect(screen.getByText("Clean Code")).toBeInTheDocument();
  expect(screen.queryByText("The Alchemist")).not.toBeInTheDocument();
  await user.clear(screen.getByLabelText("Book title"));
  await user.selectOptions(
    screen.getByLabelText("Filter by Category"),
    "Fiction",
  );
  expect(screen.getByText("The Alchemist")).toBeInTheDocument();
  expect(screen.queryByText("Clean Code")).not.toBeInTheDocument();
});
function borrowPage() {
  return render(
    <MemoryRouter
      initialEntries={["/borrow/1"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/borrow/:id" element={<BorrowRequest />} />
        <Route
          path="/borrow-confirmation/:id"
          element={<p>Request confirmed</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
}
test("borrowing submits name and phone then shows confirmation", async () => {
  const user = userEvent.setup();
  borrowPage();
  await user.click(screen.getByRole("button", { name: /Confirm borrow/i }));
  await waitFor(() =>
    expect(library.borrowBook).toHaveBeenCalledWith(book, {
      name: "Test Member",
      phone: "9876543210",
    }),
  );
  expect(await screen.findByText("Request confirmed")).toBeInTheDocument();
});
test("invalid phone prevents borrow submission", async () => {
  const user = userEvent.setup();
  borrowPage();
  const phone = screen.getByLabelText("Phone number");
  await user.clear(phone);
  await user.type(phone, "123");
  await user.click(screen.getByRole("button", { name: /Confirm borrow/i }));
  expect(phone).toBeInvalid();
  expect(library.borrowBook).not.toHaveBeenCalled();
});
test("unavailable book submits a hold", async () => {
  const user = userEvent.setup();
  useLibrary.mockReturnValue({
    ...library,
    books: [{ ...book, available: false }],
  });
  borrowPage();
  await user.click(screen.getByRole("button", { name: /Confirm hold/i }));
  await waitFor(() => expect(library.placeHold).toHaveBeenCalled());
  expect(library.borrowBook).not.toHaveBeenCalled();
});
test("return invokes operation and shows success", async () => {
  const user = userEvent.setup();
  useLibrary.mockReturnValue({ ...library, borrowedBooks: [loan] });
  router(<BorrowedBooks />);
  await user.click(screen.getByRole("button", { name: /^Return$/ }));
  await waitFor(() => expect(library.returnBook).toHaveBeenCalledWith(1));
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Library record updated.",
  );
});
test("renew sends reason and book ID", async () => {
  const user = userEvent.setup();
  useLibrary.mockReturnValue({ ...library, borrowedBooks: [loan] });
  router(<BorrowedBooks />);
  await user.click(screen.getByRole("button", { name: /^Renew$/ }));
  await user.type(screen.getByLabelText(/Reason for renewal/), "Still reading");
  await user.click(screen.getByRole("button", { name: /Request 7 more days/ }));
  await waitFor(() =>
    expect(library.renewBook).toHaveBeenCalledWith(1, "Still reading"),
  );
});
test("failed return displays an error", async () => {
  const user = userEvent.setup();
  library.returnBook.mockRejectedValue(new Error("Return failed"));
  useLibrary.mockReturnValue({ ...library, borrowedBooks: [loan] });
  router(<BorrowedBooks />);
  await user.click(screen.getByRole("button", { name: /^Return$/ }));
  expect(await screen.findByText("Return failed")).toBeInTheDocument();
});
test("empty borrowing list is explained", () => {
  router(<BorrowedBooks />);
  expect(screen.getByText(/No borrowed books/)).toBeInTheDocument();
});
test("profile saves edited name", async () => {
  const user = userEvent.setup();
  router(<MemberProfile />);
  expect(screen.getByLabelText(/Member ID/)).toHaveValue("LIB101");
  const name = screen.getByLabelText(/^name$/i);
  await user.clear(name);
  await user.type(name, "Updated Member");
  await user.click(screen.getByRole("button", { name: /Save profile/ }));
  await waitFor(() =>
    expect(auth.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Updated Member" }),
    ),
  );
});
test("profile API failure displays error", async () => {
  const user = userEvent.setup();
  auth.updateProfile.mockRejectedValue(new Error("Profile failed"));
  router(<MemberProfile />);
  await user.click(screen.getByRole("button", { name: /Save profile/ }));
  expect(await screen.findByText("Profile failed")).toBeInTheDocument();
});
test("protected route redirects guests", () => {
  useAuth.mockReturnValue({ ...auth, isAuthenticated: false });
  render(
    <MemoryRouter
      initialEntries={["/member"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/member" element={<p>Private data</p>} />
        </Route>
        <Route path="/login" element={<p>Login required</p>} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByText("Login required")).toBeInTheDocument();
  expect(screen.queryByText("Private data")).not.toBeInTheDocument();
});
test("login uses controlled input and does not expose demo password", async () => {
  const user = userEvent.setup();
  router(<Login />);
  expect(screen.queryByText(/Library@123/)).not.toBeInTheDocument();
  await user.type(screen.getByLabelText(/Member ID or email/), "LIB101");
  await user.type(screen.getByLabelText(/^Password$/), "Library@123");
  await user.click(screen.getAllByRole("button", { name: /^Login$/ }).at(-1));
  await waitFor(() =>
    expect(auth.login).toHaveBeenCalledWith("LIB101", "Library@123"),
  );
});
