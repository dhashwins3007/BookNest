export default function BookStatus({ borrowed = false }) {
  return (
    <span className={borrowed ? "status borrowed" : "status available"}>
      {borrowed ? "Borrowed" : "Available"}
    </span>
  );
}
