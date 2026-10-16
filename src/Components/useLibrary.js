import { useContext } from "react";
import LibraryContext from "./LibraryContext";

export default function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === null)
    throw new Error("useLibrary must be used inside LibraryProvider");
  return context;
}
