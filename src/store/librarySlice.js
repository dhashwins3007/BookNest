import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../services/client";
export const loadLibrary = createAsyncThunk(
  "library/load",
  async () => (await api.get("/state")).data,
);
export const libraryOperation = createAsyncThunk(
  "library/operation",
  async (payload) => (await api.post("/operations", payload)).data,
);
const empty = {
  books: [],
  member: null,
  borrowedBooks: [],
  readingHistory: [],
  holdRequests: [],
};
const slice = createSlice({
  name: "library",
  initialState: { ...empty, loading: false, error: "" },
  reducers: {
    hydrateLibrary(state, action) {
      Object.assign(state, action.payload, { loading: false, error: "" });
    },
    resetMember(state) {
      Object.assign(state, {
        member: null,
        borrowedBooks: [],
        readingHistory: [],
        holdRequests: [],
        error: "",
      });
    },
  },
  extraReducers: (b) => {
    for (const thunk of [loadLibrary, libraryOperation])
      b.addCase(thunk.pending, (s) => {
        s.loading = true;
        s.error = "";
      })
        .addCase(thunk.fulfilled, (s, a) => {
          Object.assign(s, a.payload, { loading: false, error: "" });
        })
        .addCase(thunk.rejected, (s, a) => {
          s.loading = false;
          s.error = a.error.message;
        });
  },
});
export const { resetMember, hydrateLibrary } = slice.actions;
export default slice.reducer;
