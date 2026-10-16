import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import BookDetailsPage from "../pages/BookDetailsPage";
import { cachedGet } from "../services/client";
import useLibrary from "../Components/useLibrary";
jest.mock("../services/client", () => ({ cachedGet: jest.fn() }));
jest.mock("../Components/useLibrary");
function page() {
  render(
    <MemoryRouter
      initialEntries={["/book/1"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/book/:id" element={<BookDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}
beforeEach(() => useLibrary.mockReturnValue({ borrowedIds: [] }));
test("details display pending API state", () => {
  cachedGet.mockReturnValue(new Promise(() => {}));
  page();
  expect(screen.getByRole("status")).toHaveTextContent(/Loading book details/);
});
test("details display API failure", async () => {
  cachedGet.mockRejectedValue(new Error("Book not found"));
  page();
  expect(await screen.findByRole("alert")).toHaveTextContent("Book not found");
});
test("details use route ID and display API data", async () => {
  cachedGet.mockResolvedValue({
    id: 1,
    title: "Clean Code",
    author: "Robert Martin",
    category: "Technology",
    year: 2008,
    description: "Readable code",
    image: "",
    available: true,
  });
  page();
  expect(
    await screen.findByRole("heading", { name: "Clean Code" }),
  ).toBeInTheDocument();
  expect(cachedGet).toHaveBeenCalledWith("/books/1");
});
