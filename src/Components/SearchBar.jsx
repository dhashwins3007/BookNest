export default function SearchBar({
  titleSearch,
  setTitleSearch,
  authorSearch,
  setAuthorSearch,
}) {
  return (
    <div className="search-box">
      <input
        placeholder="Search by book title..."
        value={titleSearch}
        onChange={(e) => setTitleSearch(e.target.value)}
      />
      <input
        placeholder="Search by author..."
        value={authorSearch}
        onChange={(e) => setAuthorSearch(e.target.value)}
      />
    </div>
  );
}
