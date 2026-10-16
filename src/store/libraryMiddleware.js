const libraryMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type.startsWith("library/")) {
    console.info("[Library action]", action.type);
    try {
      const { books } = store.getState().library;
      localStorage.setItem("booknestCatalogCache", JSON.stringify(books));
    } catch {
      /* Storage may be unavailable. API remains authoritative. */
    }
  }
  return result;
};
export default libraryMiddleware;
