import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import useBooks from "../hooks/useBooks";
const books = [
  {
    id: 1,
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    available: true,
  },
  {
    id: 2,
    title: "Clean Code",
    author: "Robert Martin",
    category: "Technology",
    available: false,
  },
];
function wrapper({ children }) {
  const store = configureStore({ reducer: { library: () => ({ books }) } });
  return <Provider store={store}>{children}</Provider>;
}
test.each([
  ["title", "setTitleSearch", "CLEAN", [books[1]]],
  ["author", "setAuthorSearch", "paulo", [books[0]]],
  ["category", "setCategory", "Technology", [books[1]]],
  ["availability", "setAvailability", "Available", [books[0]]],
  ["no matches", "setTitleSearch", "unknown", []],
])("filters %s", (_, setter, value, expected) => {
  const { result } = renderHook(() => useBooks(), { wrapper });
  act(() => result.current[setter](value));
  expect(result.current.filteredBooks).toEqual(expected);
});
test("reset restores catalogue", () => {
  const { result } = renderHook(() => useBooks(), { wrapper });
  act(() => {
    result.current.setTitleSearch("Clean");
    result.current.setCategory("Technology");
  });
  act(() => result.current.clearSearch());
  expect(result.current.filteredBooks).toEqual(books);
});
