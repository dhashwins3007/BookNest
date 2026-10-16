import useLibrary from "./useLibrary";

export default function ReadingHistory() {
  const { readingHistory } = useLibrary();

  if (readingHistory.length === 0)
    return <div className="empty">No reading history.</div>;

  return (
    <div className="section">
      <h2>Reading History</h2>
      {readingHistory.map((item, index) => (
        <div className="history-item" key={`${item.id}-${index}`}>
          <h3>{item.title}</h3>
          <p>{item.author}</p>
          <p>Action: {item.action}</p>
          <p>Date: {item.date}</p>
        </div>
      ))}
    </div>
  );
}
