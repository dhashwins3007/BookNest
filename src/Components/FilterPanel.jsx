import useLibrary from "./useLibrary";

export default function FilterPanel() {
  const library = useLibrary();
  const books = library.books || [];
  const categories = [
    "All",
    ...new Set(books.map((book) => book.category).filter(Boolean)),
  ];

  return (
    <div className="filter-panel">
      <label htmlFor="category-filter">Filter by Category</label>
      <select
        id="category-filter"
        value={library.category || "All"}
        onChange={(event) => {
          if (library.setCategory) {
            library.setCategory(event.target.value);
          } else if (library.setSelectedCategory) {
            library.setSelectedCategory(event.target.value);
          }
        }}
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}
