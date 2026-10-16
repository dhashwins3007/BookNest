export default function bookImage(path) {
  if (typeof path !== "string" || !/^\/covers\/[a-zA-Z0-9._-]+$/.test(path))
    return "";
  return path;
}
