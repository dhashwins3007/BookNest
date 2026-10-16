import { useEffect, useState } from "react";
import { api } from "../services/client";
export default function MembersPage() {
  const [members, setMembers] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/members")
      .then((r) => setMembers(r.data))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <section>
      <h1>Library members</h1>
      {error ? (
        <p role="alert">{error}</p>
      ) : members ? (
        members.map((m) => (
          <article className="history-item" key={m.id}>
            <h3>{m.name}</h3>
            <p>
              {m.id} · {m.email}
            </p>
          </article>
        ))
      ) : (
        <p>Loading members…</p>
      )}
    </section>
  );
}
