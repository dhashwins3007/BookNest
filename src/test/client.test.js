import { api, cachedGet, invalidateReadCache } from "../services/client";
afterEach(() => {
  jest.restoreAllMocks();
  invalidateReadCache();
  localStorage.clear();
});
test("parallel identical GETs share one request and cache response", async () => {
  const spy = jest.spyOn(api, "get").mockResolvedValue({ data: { id: 1 } });
  const [a, b] = await Promise.all([
    cachedGet("/books/1"),
    cachedGet("/books/1"),
  ]);
  expect(a).toEqual(b);
  await cachedGet("/books/1");
  expect(spy).toHaveBeenCalledTimes(1);
});
test("cache invalidation forces a new request", async () => {
  const spy = jest.spyOn(api, "get").mockResolvedValue({ data: { id: 1 } });
  await cachedGet("/books/1");
  invalidateReadCache();
  await cachedGet("/books/1");
  expect(spy).toHaveBeenCalledTimes(2);
});
test("cache does not share responses between tokens", async () => {
  const spy = jest.spyOn(api, "get").mockResolvedValue({ data: [] });
  localStorage.setItem("libraryToken", "a");
  await cachedGet("/recommendations");
  localStorage.setItem("libraryToken", "b");
  await cachedGet("/recommendations");
  expect(spy).toHaveBeenCalledTimes(2);
});
