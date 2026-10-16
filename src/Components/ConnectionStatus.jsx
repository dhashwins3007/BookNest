import { useState, useEffect } from "react";
export default function ConnectionStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online ? null : (
    <p className="connection-status" role="status">
      Offline. BookNest app files are available; reconnect to log in or manage
      borrowing.
    </p>
  );
}
